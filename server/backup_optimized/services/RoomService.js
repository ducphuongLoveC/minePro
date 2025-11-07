/**
 * Room Service
 * Manages game rooms and room state
 */

const { ROOM, ERRORS } = require('../config/constants');
const logger = require('./LoggerService');
const { toArray } = require('../utils/helpers');

class RoomService {
    constructor() {
        this.rooms = new Map();
        this.startCleanupInterval();
    }

    /**
     * Create or get room
     */
    createRoom(roomId, config, maxPlayers) {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId);
        }

        const room = {
            id: roomId,
            players: [],
            games: {},
            playerStates: {},
            playersStatus: [],
            config: config || {},
            maxPlayers: maxPlayers || ROOM.DEFAULT_MAX_PLAYERS,
            createdAt: Date.now(),
            lastActivity: Date.now(),
        };

        this.rooms.set(roomId, room);
        logger.room('created', roomId, { maxPlayers: room.maxPlayers });
        
        return room;
    }

    /**
     * Get room by ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    /**
     * Check if room exists
     */
    hasRoom(roomId) {
        return this.rooms.has(roomId);
    }

    /**
     * Check if room is full
     */
    isRoomFull(roomId) {
        const room = this.getRoom(roomId);
        return room && room.players.length >= room.maxPlayers;
    }

    /**
     * Add player to room
     */
    addPlayer(roomId, playerId, playerName) {
        const room = this.getRoom(roomId);
        if (!room) {
            throw new Error(ERRORS.ROOM_NOT_FOUND);
        }

        if (room.players.length >= room.maxPlayers) {
            throw new Error(ERRORS.ROOM_FULL);
        }

        room.players.push(playerId);
        room.lastActivity = Date.now();

        const isHost = room.players.length === 1;
        const playerStatus = {
            playerName: playerName || `Player ${room.players.length}`,
            isReady: isHost,
            isHost,
            isCompleted: false,
            status: 'playing',
            progress: 0,
        };

        room.playersStatus.push({ [playerId]: playerStatus });
        
        logger.room('player_joined', roomId, { playerId, isHost });
        
        return { room, isHost, playerStatus };
    }

    /**
     * Remove player from room
     */
    removePlayer(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room) return null;

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) return null;

        // Remove player
        room.players.splice(playerIndex, 1);
        delete room.games[playerId];
        delete room.playerStates[playerId];
        room.playersStatus = room.playersStatus.filter(entry => !entry[playerId]);

        logger.room('player_left', roomId, { playerId, remainingPlayers: room.players.length });

        // Handle remaining player
        if (room.players.length === 1) {
            const [remainingPlayerId] = room.players;
            const status = this.getPlayerStatus(room, remainingPlayerId);
            if (status) {
                status.isHost = true;
                status.isReady = true;
            }
        }

        // Delete room if empty
        if (room.players.length === 0) {
            this.deleteRoom(roomId);
        }

        return room;
    }

    /**
     * Delete room
     */
    deleteRoom(roomId) {
        const deleted = this.rooms.delete(roomId);
        if (deleted) {
            logger.room('deleted', roomId);
        }
        return deleted;
    }

    /**
     * Get player status in room
     */
    getPlayerStatus(room, playerId) {
        const entry = room.playersStatus.find(e => e[playerId]);
        return entry ? entry[playerId] : null;
    }

    /**
     * Update player status
     */
    updatePlayerStatus(roomId, playerId, updates) {
        const room = this.getRoom(roomId);
        if (!room) return null;

        const status = this.getPlayerStatus(room, playerId);
        if (status) {
            Object.assign(status, updates);
            room.lastActivity = Date.now();
        }

        return status;
    }

    /**
     * Check if player is in room
     */
    isPlayerInRoom(roomId, playerId) {
        const room = this.getRoom(roomId);
        return room && room.players.includes(playerId);
    }

    /**
     * Check if player is host
     */
    isPlayerHost(roomId, playerId) {
        const room = this.getRoom(roomId);
        if (!room) return false;
        
        const status = this.getPlayerStatus(room, playerId);
        return status?.isHost === true;
    }

    /**
     * Check if all players are ready
     */
    areAllPlayersReady(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return false;
        
        return room.playersStatus.every(pl => Object.values(pl)[0].isReady);
    }

    /**
     * Get room list for lobby
     */
    getRoomList() {
        return toArray(this.rooms).map(([roomId, room]) => {
            const firstPlayerStatus = this.getPlayerStatus(room, room.players[0]);
            return {
                id: roomId,
                name: firstPlayerStatus?.playerName
                    ? `Phòng của ${firstPlayerStatus.playerName}`
                    : `Phòng ${roomId}`,
                currentPlayers: room.players.length,
                maxPlayers: room.maxPlayers,
            };
        });
    }

    /**
     * Clean up idle rooms
     */
    cleanupIdleRooms() {
        const now = Date.now();
        const deletedRooms = [];

        for (const [roomId, room] of this.rooms.entries()) {
            const idleTime = now - room.lastActivity;
            
            if (idleTime > ROOM.IDLE_ROOM_TIMEOUT) {
                this.deleteRoom(roomId);
                deletedRooms.push(roomId);
            }
        }

        if (deletedRooms.length > 0) {
            logger.info(`Cleaned up ${deletedRooms.length} idle rooms`);
        }
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupIdleRooms();
        }, ROOM.ROOM_CLEANUP_INTERVAL);
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            totalRooms: this.rooms.size,
            totalPlayers: toArray(this.rooms.values()).reduce((sum, room) => sum + room.players.length, 0),
        };
    }
}

// Export singleton
module.exports = new RoomService();

