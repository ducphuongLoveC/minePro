/**
 * Error Handler Middleware
 */

const logger = require('../services/LoggerService');
const { EVENTS } = require('../config/constants');

/**
 * Socket error handler wrapper
 */
function socketErrorHandler(handler) {
    return async (...args) => {
        try {
            await handler(...args);
        } catch (error) {
            logger.error('Socket handler error', error, {
                handler: handler.name,
                args: args.map(arg => typeof arg),
            });
            
            // Try to emit error to socket if available
            const socket = args.find(arg => arg && typeof arg.emit === 'function');
            if (socket) {
                socket.emit(EVENTS.ERROR, {
                    message: error.message || 'Internal server error',
                });
            }
        }
    };
}

/**
 * Validation error handler
 */
function validationError(socket, error) {
    logger.warn('Validation error', { error });
    socket.emit(EVENTS.ERROR, { message: error });
}

/**
 * Generic error emitter
 */
function emitError(socket, message) {
    socket.emit(EVENTS.ERROR, { message });
}

module.exports = {
    socketErrorHandler,
    validationError,
    emitError,
};

