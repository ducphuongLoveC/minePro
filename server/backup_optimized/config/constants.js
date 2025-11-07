/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
    // Server Configuration
    SERVER: {
        PORT: process.env.PORT || 3000,
        HOST: process.env.HOST || '0.0.0.0',
        ENV: process.env.NODE_ENV || 'development',
        KEEP_ALIVE_INTERVAL: 5 * 60 * 1000, // 5 minutes
    },

    // Socket.IO Configuration
    SOCKET: {
        PING_TIMEOUT: 20000,
        PING_INTERVAL: 25000,
        MAX_HTTP_BUFFER_SIZE: 1e6, // 1MB
        TRANSPORTS: ['websocket', 'polling'],
        ALLOWED_UPGRADES: ['websocket'],
    },

    // Game Configuration
    GAME: {
        MIN_BOARD_SIZE: 5,
        MAX_BOARD_SIZE: 30,
        MIN_MINES: 1,
        MINE_RATIOS: {
            SMALL: 0.13,  // < 100 cells
            MEDIUM: 0.16, // 100-300 cells
            LARGE: 0.21,  // > 300 cells
        },
        MAX_MINE_RATIO: 0.25,
        DEFAULT_BOARD: {
            rows: 9,
            cols: 9,
            mines: null
        },
    },

    // Room Configuration
    ROOM: {
        DEFAULT_MAX_PLAYERS: 2,
        MIN_PLAYERS: 2,
        MAX_PLAYERS: 10,
        ROOM_CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minutes
        IDLE_ROOM_TIMEOUT: 60 * 60 * 1000, // 1 hour
    },

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100,
        MAX_CONNECTIONS_PER_IP: 5,
        ACTION_RATE_LIMIT: {
            WINDOW_MS: 1000, // 1 second
            MAX_ACTIONS: 20, // 20 actions per second
        },
    },

    // Redis Configuration
    REDIS: {
        ENABLED: process.env.REDIS_ENABLED === 'true',
        HOST: process.env.REDIS_HOST || 'localhost',
        PORT: parseInt(process.env.REDIS_PORT) || 6379,
        PASSWORD: process.env.REDIS_PASSWORD || null,
        DB: parseInt(process.env.REDIS_DB) || 0,
        RETRY_STRATEGY: {
            MAX_ATTEMPTS: 10,
            DELAY: 3000,
        },
    },

    // CORS Configuration
    CORS: {
        ORIGIN: process.env.CORS_ORIGIN || '*',
        METHODS: ['GET', 'POST'],
        CREDENTIALS: true,
    },

    // Logging
    LOGGING: {
        LEVEL: process.env.LOG_LEVEL || 'info',
        ENABLE_CONSOLE: true,
        ENABLE_FILE: process.env.NODE_ENV === 'production',
    },

    // Player Status
    PLAYER_STATUS: {
        PLAYING: 'playing',
        WON: 'won',
        LOST: 'lost',
    },

    // Event Names
    EVENTS: {
        // Connection
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        
        // Ping/Pong
        PING: 'ping',
        PONG: 'pong',
        
        // Room Events
        EMIT_ROOM_LIST: 'emitRoomList',
        ROOM_LIST: 'roomList',
        JOIN_ROOM: 'joinRoom',
        JOINED_ROOM: 'joinedRoom',
        ROOM_CREATED: 'roomCreated',
        ROOM_FULL: 'roomFull',
        LEAVE_ROOM: 'leaveRoom',
        PLAYER_LEFT: 'playerLeft',
        RETURN_TO_LOBBY: 'returnToLobby',
        
        // Game Events
        INITIALIZE_GAME: 'initializeGame',
        GAME_INITIALIZED: 'gameInitialized',
        START_GAME: 'startGame',
        GAME_STARTED: 'gameStarted',
        GAME_OVER: 'gameOver',
        
        // Player Actions
        OPEN_CELL: 'openCell',
        TOGGLE_FLAG: 'toggleFlag',
        CHORDING: 'chording',
        
        // State Updates
        STATE_UPDATE: 'stateUpdate',
        UPDATE_STATE: 'updateState',
        SET_GAMES: 'setGames',
        PLAYER_STATUS_UPDATE: 'playerStatusUpdate',
        FLAG_TOGGLED: 'flagToggled',
        
        // Ready/Replay
        TOGGLE_READY: 'toggleReadyGame',
        PLAYER_NOT_READY: 'playerNotReady',
        REPLAY_GAME: 'replayGame',
        REPLAY_REQUESTED: 'replayRequested',
        CONFIRM_REPLAY: 'confirmReplay',
        DECLINE_REPLAY: 'declineReplay',
        REPLAY_DECLINED: 'replayDeclined',
        
        // Error
        ERROR: 'error',
    },

    // Error Messages
    ERRORS: {
        INVALID_ROOM_ID: 'Invalid room ID',
        ROOM_FULL: 'Room is full',
        ROOM_NOT_FOUND: 'Room not found',
        PLAYER_NOT_IN_ROOM: 'Player not in room',
        GAME_NOT_INITIALIZED: 'Game not initialized',
        INVALID_INDEX: 'Invalid cell index',
        ONLY_HOST_CAN_START: 'Only host can start the game',
        PLAYERS_NOT_READY: 'Not all players are ready',
        INVALID_CONFIG: 'Invalid game configuration',
        RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    },
};

