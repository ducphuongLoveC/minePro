/**
 * PVP Socket Handler (Refactored)
 * Clean, maintainable, scalable
 */

const RoomService = require('../../services/RoomService');
const GameService = require('../../services/GameService');
const { 
    validateRoomId, 
    validateGameConfig, 
    validateCellIndex,
    validatePlayerName,
    validateMaxPlayers,
} = require('../../utils/validators');
const { socketErrorHandler, validationError, emitError } = require('../../middleware/errorHandler');
const { checkActionLimit } = require('../../middleware/rateLimiter');
const { EVENTS, ERRORS, PLAYER_STATUS } = require('../../config/constants');
const logger = require('../../services/LoggerService');
const { toArray } = require('../../utils/helpers');

function setupPVPHandlers(io, socket) {
    /**
     * Emit room list to all clients
     */
    const emitRoomList = () => {
        const roomList = RoomService.getRoomList();
        io.emit(EVENTS.ROOM_LIST, roomList);
    };

    /**
     * Emit initial game state to room
     */
    const emitInitialGameState = (roomId) => {
        const room = RoomService.getRoom(roomId);
        if (!room) return;

        const gameStates = {};
        for (const playerId in room.games) {
            gameStates[playerId] = room.games[playerId].getClientState();
        }

        io.to(roomId).emit(EVENTS.SET_GAMES, {
            gameStates,
            playersStatus: room.playersStatus,
        });
    };

    /**
     * Handle game over for a player
     */
    const handleGameOver = (room, result, roomId) => {
        const status = RoomService.getPlayerStatus(room, socket.id);
        if (status) {
            status.isCompleted = true;
            status.status = GameService.determineStatus(result);
        }

        // Reset all players' ready status
        room.playersStatus.forEach((item) => {
            const [_, playerStatus] = Object.entries(item)[0];
            playerStatus.isReady = false;
        });

        io.to(roomId).emit(EVENTS.GAME_OVER, room.playersStatus);
        logger.game('over', { roomId, winner: status?.status });
    };

    /**
     * Handle game action (open, chord, etc.)
     */
    const handleGameAction = (roomId, actionType, index, actionHandler) => {
        const room = RoomService.getRoom(roomId);
        
        if (!room || !RoomService.isPlayerInRoom(roomId, socket.id)) {
            return emitError(socket, ERRORS.PLAYER_NOT_IN_ROOM);
        }

        const game = room.games[socket.id];
        const playerState = room.playerStates[socket.id];

        if (!game || !playerState) {
            return emitError(socket, ERRORS.GAME_NOT_INITIALIZED);
        }

        const result = actionHandler(game, playerState, index);
        if (!result) return;

        const updateData = {
            playerId: socket.id,
            action: {
                type: actionType,
                index,
                result,
                changes: GameService.getStateChanges(result),
            },
        };

        if (GameService.isGameOver(result)) {
            handleGameOver(room, result, roomId);
        }

        io.to(roomId).emit(EVENTS.UPDATE_STATE, updateData);
    };

    /**
     * Handle: Emit room list
     */
    socket.on(EVENTS.EMIT_ROOM_LIST, socketErrorHandler(() => {
        emitRoomList();
    }));

    /**
     * Handle: Join room
     */
    socket.on(EVENTS.JOIN_ROOM, socketErrorHandler((roomId, playerName, configMode, maxPlayers) => {
        // Validate inputs
        const roomValidation = validateRoomId(roomId);
        if (!roomValidation.valid) {
            return validationError(socket, roomValidation.error);
        }

        const configValidation = validateGameConfig(configMode);
        if (!configValidation.valid) {
            return validationError(socket, configValidation.error);
        }

        const nameValidation = validatePlayerName(playerName);
        if (!nameValidation.valid) {
            return validationError(socket, nameValidation.error);
        }

        const maxPlayersValidation = validateMaxPlayers(maxPlayers);
        if (!maxPlayersValidation.valid) {
            return validationError(socket, maxPlayersValidation.error);
        }

        // Create or get room
        let room;
        if (!RoomService.hasRoom(roomId)) {
            room = RoomService.createRoom(roomId, configMode, maxPlayersValidation.value);
            socket.emit(EVENTS.ROOM_CREATED, { roomId });
        } else {
            room = RoomService.getRoom(roomId);
            
            if (RoomService.isRoomFull(roomId)) {
                return socket.emit(EVENTS.ROOM_FULL, { message: ERRORS.ROOM_FULL });
            }
        }

        // Add player to room
        try {
            const { isHost } = RoomService.addPlayer(roomId, socket.id, nameValidation.name);

            // Create game for this player
            const { rows, cols, mines } = room.config;
            room.games[socket.id] = GameService.createGame(rows, cols, mines);
            room.playerStates[socket.id] = GameService.createPlayerState();

            // Join socket room
            socket.join(roomId);

            socket.emit(EVENTS.JOINED_ROOM, { roomId, playerId: socket.id });
            emitInitialGameState(roomId);
            emitRoomList();

            logger.room('player_joined', roomId, { playerId: socket.id, isHost });
        } catch (error) {
            validationError(socket, error.message);
        }
    }));

    /**
     * Handle: Toggle ready status
     */
    socket.on(EVENTS.TOGGLE_READY, socketErrorHandler((roomId) => {
        if (!RoomService.isPlayerInRoom(roomId, socket.id)) {
            return emitError(socket, ERRORS.PLAYER_NOT_IN_ROOM);
        }

        const status = RoomService.getPlayerStatus(RoomService.getRoom(roomId), socket.id);
        
        if (status && !status.isHost) {
            status.isReady = !status.isReady;
            io.to(roomId).emit(EVENTS.PLAYER_STATUS_UPDATE, {
                playerId: socket.id,
                isReady: status.isReady,
            });
        }
    }));

    /**
     * Handle: Start game
     */
    socket.on(EVENTS.START_GAME, socketErrorHandler((roomId) => {
        if (!RoomService.isPlayerHost(roomId, socket.id)) {
            return emitError(socket, ERRORS.ONLY_HOST_CAN_START);
        }

        if (RoomService.areAllPlayersReady(roomId)) {
            io.to(roomId).emit(EVENTS.GAME_STARTED, { message: 'Game bắt đầu!' });
            logger.game('started', { roomId });
        } else {
            socket.emit(EVENTS.PLAYER_NOT_READY, { message: ERRORS.PLAYERS_NOT_READY });
        }
    }));

    /**
     * Handle: Open cell
     */
    socket.on(EVENTS.OPEN_CELL, socketErrorHandler(({ roomId, index }) => {
        if (!checkActionLimit(socket)) return;

        const room = RoomService.getRoom(roomId);
        const game = room?.games[socket.id];
        
        const validation = validateCellIndex(index, game?.totalCells);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        handleGameAction(roomId, 'open', index, GameService.handleOpenCell.bind(GameService));
    }));

    /**
     * Handle: Chording
     */
    socket.on(EVENTS.CHORDING, socketErrorHandler(({ roomId, index }) => {
        if (!checkActionLimit(socket)) return;

        const room = RoomService.getRoom(roomId);
        const game = room?.games[socket.id];
        
        const validation = validateCellIndex(index, game?.totalCells);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        handleGameAction(roomId, 'chord', index, GameService.handleChording.bind(GameService));
    }));

    /**
     * Handle: Toggle flag
     */
    socket.on(EVENTS.TOGGLE_FLAG, socketErrorHandler(({ roomId, index }) => {
        if (!checkActionLimit(socket)) return;

        const room = RoomService.getRoom(roomId);
        if (!room || !RoomService.isPlayerInRoom(roomId, socket.id)) {
            return emitError(socket, ERRORS.PLAYER_NOT_IN_ROOM);
        }

        const playerState = room.playerStates[socket.id];
        if (playerState.revealedCells.has(index)) return;

        const result = GameService.handleToggleFlag(playerState, index, room.games[socket.id].totalCells);
        
        if (result) {
            io.to(roomId).emit(EVENTS.FLAG_TOGGLED, {
                playerId: socket.id,
                index,
                hasFlag: result.hasFlag,
            });
        }
    }));

    /**
     * Handle: Replay game
     */
    socket.on(EVENTS.REPLAY_GAME, socketErrorHandler((roomId) => {
        if (RoomService.hasRoom(roomId)) {
            socket.to(roomId).emit(EVENTS.REPLAY_REQUESTED, { message: 'Chơi thêm ván nữa nhé!' });
        }
    }));

    /**
     * Handle: Confirm replay
     */
    socket.on(EVENTS.CONFIRM_REPLAY, socketErrorHandler(({ roomId }) => {
        const room = RoomService.getRoom(roomId);
        if (!room || !RoomService.isPlayerInRoom(roomId, socket.id)) return;

        const { rows, cols, mines } = room.config;
        room.players.forEach(playerId => {
            room.games[playerId] = GameService.createGame(rows, cols, mines);
            room.playerStates[playerId] = GameService.createPlayerState();
            
            const status = RoomService.getPlayerStatus(room, playerId);
            if (status) {
                status.isCompleted = false;
                status.status = PLAYER_STATUS.PLAYING;
            }
        });

        emitInitialGameState(roomId);
        logger.game('replay_confirmed', { roomId });
    }));

    /**
     * Handle: Decline replay
     */
    socket.on(EVENTS.DECLINE_REPLAY, socketErrorHandler(({ roomId }) => {
        socket.to(roomId).emit(EVENTS.REPLAY_DECLINED, { message: 'Người chơi đã từ chối chơi lại.' });
    }));

    /**
     * Handle: Leave room
     */
    socket.on(EVENTS.LEAVE_ROOM, socketErrorHandler((roomId) => {
        const room = RoomService.removePlayer(roomId, socket.id);
        
        if (room) {
            if (room.players.length === 1) {
                const [remainingId] = room.players;
                socket.to(roomId).emit(EVENTS.PLAYER_LEFT, {
                    playerId: socket.id,
                    playersStatus: room.playersStatus,
                    gameState: room.games[remainingId]?.getClientState(),
                    playerState: GameService.serializePlayerState(room.playerStates[remainingId] || {}),
                });
            } else {
                socket.to(roomId).emit(EVENTS.PLAYER_LEFT, {
                    playerId: socket.id,
                    playersStatus: room.playersStatus,
                });
            }
        }

        socket.emit(EVENTS.RETURN_TO_LOBBY, { message: 'Bạn đã rời khỏi phòng', roomId });
        emitRoomList();
    }));

    /**
     * Handle: Disconnect
     */
    socket.on(EVENTS.DISCONNECT, socketErrorHandler(() => {
        RoomService.getRoomList().forEach(({ id: roomId }) => {
            if (RoomService.isPlayerInRoom(roomId, socket.id)) {
                RoomService.removePlayer(roomId, socket.id);
                socket.to(roomId).emit(EVENTS.PLAYER_LEFT, {
                    playerId: socket.id,
                    playersStatus: RoomService.getRoom(roomId)?.playersStatus || [],
                });
                emitRoomList();
            }
        });

        logger.disconnection(socket.id, '/pvp', 'disconnect');
    }));

    logger.connection(socket.id, '/pvp');
}

module.exports = setupPVPHandlers;

