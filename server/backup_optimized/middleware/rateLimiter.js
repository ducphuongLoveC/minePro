/**
 * Rate Limiter Middleware for Socket.IO
 */

const { RateLimiter } = require('../utils/helpers');
const { RATE_LIMIT, EVENTS } = require('../config/constants');
const logger = require('../services/LoggerService');

// Create rate limiters
const connectionLimiter = new RateLimiter(
    RATE_LIMIT.MAX_CONNECTIONS_PER_IP,
    RATE_LIMIT.WINDOW_MS
);

const actionLimiter = new RateLimiter(
    RATE_LIMIT.ACTION_RATE_LIMIT.MAX_ACTIONS,
    RATE_LIMIT.ACTION_RATE_LIMIT.WINDOW_MS
);

/**
 * Check connection rate limit
 */
function checkConnectionLimit(socket, next) {
    const ip = socket.handshake.address;
    
    if (!connectionLimiter.isAllowed(ip)) {
        logger.warn('Connection rate limit exceeded', { ip });
        return next(new Error('Too many connections'));
    }
    
    next();
}

/**
 * Check action rate limit
 */
function checkActionLimit(socket) {
    const socketId = socket.id;
    
    if (!actionLimiter.isAllowed(socketId)) {
        logger.warn('Action rate limit exceeded', { socketId });
        socket.emit(EVENTS.ERROR, { message: 'Rate limit exceeded. Please slow down.' });
        return false;
    }
    
    return true;
}

/**
 * Cleanup old rate limit data
 */
function startCleanup() {
    setInterval(() => {
        connectionLimiter.cleanup();
        actionLimiter.cleanup();
    }, RATE_LIMIT.WINDOW_MS);
}

module.exports = {
    checkConnectionLimit,
    checkActionLimit,
    startCleanup,
};

