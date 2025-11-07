/**
 * Validation Utilities
 */

const { GAME, ROOM } = require('../config/constants');

/**
 * Validate room ID
 */
function validateRoomId(roomId) {
    if (!roomId || typeof roomId !== 'string' || !roomId.trim()) {
        return { valid: false, error: 'Invalid room ID: must be a non-empty string' };
    }
    
    if (roomId.length > 100) {
        return { valid: false, error: 'Invalid room ID: too long' };
    }
    
    return { valid: true };
}

/**
 * Validate game configuration
 */
function validateGameConfig(config) {
    if (!config || typeof config !== 'object') {
        return { valid: false, error: 'Invalid config: must be an object' };
    }

    const { rows, cols, mines } = config;

    // Validate rows
    if (rows !== undefined) {
        if (!Number.isInteger(rows) || rows < GAME.MIN_BOARD_SIZE || rows > GAME.MAX_BOARD_SIZE) {
            return { 
                valid: false, 
                error: `Invalid rows: must be between ${GAME.MIN_BOARD_SIZE} and ${GAME.MAX_BOARD_SIZE}` 
            };
        }
    }

    // Validate cols
    if (cols !== undefined) {
        if (!Number.isInteger(cols) || cols < GAME.MIN_BOARD_SIZE || cols > GAME.MAX_BOARD_SIZE) {
            return { 
                valid: false, 
                error: `Invalid cols: must be between ${GAME.MIN_BOARD_SIZE} and ${GAME.MAX_BOARD_SIZE}` 
            };
        }
    }

    // Validate mines
    if (mines !== null && mines !== undefined) {
        const totalCells = (rows || GAME.DEFAULT_BOARD.rows) * (cols || GAME.DEFAULT_BOARD.cols);
        const maxMines = Math.floor(totalCells * GAME.MAX_MINE_RATIO);
        
        if (!Number.isInteger(mines) || mines < GAME.MIN_MINES || mines > maxMines) {
            return { 
                valid: false, 
                error: `Invalid mines: must be between ${GAME.MIN_MINES} and ${maxMines}` 
            };
        }
    }

    return { valid: true };
}

/**
 * Validate cell index
 */
function validateCellIndex(index, totalCells) {
    if (index === undefined || index === null) {
        return { valid: false, error: 'Cell index is required' };
    }

    if (!Number.isInteger(index) || index < 0 || index >= totalCells) {
        return { 
            valid: false, 
            error: `Invalid cell index: must be between 0 and ${totalCells - 1}` 
        };
    }

    return { valid: true };
}

/**
 * Validate player name
 */
function validatePlayerName(name) {
    if (name && typeof name === 'string' && name.trim()) {
        const trimmed = name.trim();
        if (trimmed.length > 50) {
            return { valid: false, error: 'Player name too long (max 50 characters)' };
        }
        return { valid: true, name: trimmed };
    }
    
    return { valid: true, name: null }; // Optional field
}

/**
 * Validate max players
 */
function validateMaxPlayers(maxPlayers) {
    if (maxPlayers === undefined || maxPlayers === null) {
        return { valid: true, value: ROOM.DEFAULT_MAX_PLAYERS };
    }

    if (!Number.isInteger(maxPlayers) || maxPlayers < ROOM.MIN_PLAYERS || maxPlayers > ROOM.MAX_PLAYERS) {
        return { 
            valid: false, 
            error: `Invalid maxPlayers: must be between ${ROOM.MIN_PLAYERS} and ${ROOM.MAX_PLAYERS}` 
        };
    }

    return { valid: true, value: maxPlayers };
}

/**
 * Sanitize string input
 */
function sanitizeString(str, maxLength = 100) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
}

module.exports = {
    validateRoomId,
    validateGameConfig,
    validateCellIndex,
    validatePlayerName,
    validateMaxPlayers,
    sanitizeString,
};

