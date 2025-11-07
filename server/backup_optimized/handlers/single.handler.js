/**
 * Single Player Socket Handler (Refactored)
 * Clean, maintainable, and optimized
 */

const GameService = require('../../services/GameService');
const { validateGameConfig, validateCellIndex } = require('../../utils/validators');
const { socketErrorHandler, validationError } = require('../../middleware/errorHandler');
const { checkActionLimit } = require('../../middleware/rateLimiter');
const { EVENTS, PLAYER_STATUS } = require('../../config/constants');
const logger = require('../../services/LoggerService');

function setupSinglePlayerHandlers(io, socket) {
    // Player data - scoped to this socket connection
    const playerData = {
        game: null,
        playerState: null,
        config: {},
        status: PLAYER_STATUS.PLAYING,
    };

    /**
     * Initialize game
     */
    const handleInitializeGame = socketErrorHandler((configMode) => {
        // Validate config
        const validation = validateGameConfig(configMode);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        playerData.config = configMode;
        const { rows, cols, mines } = configMode;
        
        // Create new game
        playerData.game = GameService.createGame(rows, cols, mines);
        playerData.playerState = GameService.createPlayerState();
        playerData.status = PLAYER_STATUS.PLAYING;

        // Send initial state
        socket.emit(EVENTS.GAME_INITIALIZED, {
            gameState: playerData.game.getClientState(),
            ...GameService.serializePlayerState(playerData.playerState),
            status: playerData.status,
        });

        logger.game('initialized', { socketId: socket.id });
    });

    /**
     * Open cell
     */
    const handleOpenCell = socketErrorHandler(({ index }) => {
        if (!checkActionLimit(socket)) return;

        if (!playerData.game) {
            return validationError(socket, 'Game not initialized');
        }

        const validation = validateCellIndex(index, playerData.game.totalCells);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        const result = GameService.handleOpenCell(playerData.game, playerData.playerState, index);
        
        if (!result) return;

        const changes = GameService.getStateChanges(result);

        if (GameService.isGameOver(result)) {
            // Game over - reveal mines if lost
            if (result.isMine) {
                result.mines?.forEach(i => playerData.playerState.revealedCells.add(i));
            }

            playerData.status = GameService.determineStatus(result);

            socket.emit(EVENTS.GAME_OVER, {
                message: result.isMine ? 'Bạn đã thua!' : 'Bạn đã thắng game!',
                ...GameService.serializePlayerState(playerData.playerState),
                status: playerData.status,
            });
        } else {
            socket.emit(EVENTS.STATE_UPDATE, {
                action: 'open',
                index,
                result,
                changes,
            });
        }
    });

    /**
     * Chording
     */
    const handleChording = socketErrorHandler(({ index }) => {
        if (!checkActionLimit(socket)) return;

        if (!playerData.game) {
            return validationError(socket, 'Game not initialized');
        }

        const validation = validateCellIndex(index, playerData.game.totalCells);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        const result = GameService.handleChording(playerData.game, playerData.playerState, index);

        if (!result.success && !result.isMine) {
            return; // Invalid chording
        }

        const changes = GameService.getStateChanges(result);

        if (GameService.isGameOver(result)) {
            if (result.isMine) {
                const state = playerData.game.getState();
                state.mines?.forEach(i => playerData.playerState.revealedCells.add(i));
            }

            playerData.status = GameService.determineStatus(result);

            socket.emit(EVENTS.GAME_OVER, {
                message: result.isMine ? 'Bạn đã chạm vào bom' : 'Bạn đã thắng',
                ...GameService.serializePlayerState(playerData.playerState),
                status: playerData.status,
            });
        } else {
            socket.emit(EVENTS.STATE_UPDATE, {
                action: 'chord',
                index,
                result,
                changes,
            });
        }
    });

    /**
     * Toggle flag
     */
    const handleToggleFlag = socketErrorHandler(({ index }) => {
        if (!checkActionLimit(socket)) return;

        if (!playerData.game) {
            return validationError(socket, 'Game not initialized');
        }

        const validation = validateCellIndex(index, playerData.game.totalCells);
        if (!validation.valid) {
            return validationError(socket, validation.error);
        }

        const result = GameService.handleToggleFlag(playerData.playerState, index, playerData.game.totalCells);
        
        if (result) {
            socket.emit(EVENTS.STATE_UPDATE, {
                action: 'flag',
                index,
                changes: {
                    revealedCells: [],
                    flags: [index],
                },
            });
        }
    });

    // Register event handlers
    socket.on(EVENTS.INITIALIZE_GAME, handleInitializeGame);
    socket.on(EVENTS.OPEN_CELL, handleOpenCell);
    socket.on(EVENTS.CHORDING, handleChording);
    socket.on(EVENTS.TOGGLE_FLAG, handleToggleFlag);

    logger.connection(socket.id, '/single');
}

module.exports = setupSinglePlayerHandlers;

