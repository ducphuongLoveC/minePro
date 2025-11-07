/**
 * Logger Service
 * Centralized logging with levels and formatting
 */

const { LOGGING, SERVER } = require('../config/constants');

class LoggerService {
    constructor() {
        this.isDevelopment = SERVER.ENV === 'development';
        this.isProduction = SERVER.ENV === 'production';
        this.logLevel = LOGGING.LEVEL;
    }

    /**
     * Format log message with timestamp and context
     */
    formatMessage(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length > 0 
            ? `\n${JSON.stringify(context, null, 2)}` 
            : '';
        
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    /**
     * Log info message
     */
    info(message, context = {}) {
        if (LOGGING.ENABLE_CONSOLE) {
            console.log(this.formatMessage('info', message, context));
        }
    }

    /**
     * Log warning message
     */
    warn(message, context = {}) {
        if (LOGGING.ENABLE_CONSOLE) {
            console.warn(this.formatMessage('warn', message, context));
        }
    }

    /**
     * Log error message
     */
    error(message, error = null, context = {}) {
        const errorContext = error ? {
            ...context,
            error: {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
            },
        } : context;

        if (LOGGING.ENABLE_CONSOLE) {
            console.error(this.formatMessage('error', message, errorContext));
        }
    }

    /**
     * Log debug message (only in development)
     */
    debug(message, context = {}) {
        if (this.isDevelopment && LOGGING.ENABLE_CONSOLE) {
            console.log(this.formatMessage('debug', message, context));
        }
    }

    /**
     * Log connection event
     */
    connection(socketId, namespace) {
        this.info(`Socket connected`, { socketId, namespace });
    }

    /**
     * Log disconnection event
     */
    disconnection(socketId, namespace, reason) {
        this.info(`Socket disconnected`, { socketId, namespace, reason });
    }

    /**
     * Log room event
     */
    room(action, roomId, details = {}) {
        this.info(`Room ${action}`, { roomId, ...details });
    }

    /**
     * Log game event
     */
    game(action, details = {}) {
        this.debug(`Game ${action}`, details);
    }

    /**
     * Log performance metric
     */
    performance(operation, duration, details = {}) {
        this.debug(`Performance: ${operation}`, { duration: `${duration}ms`, ...details });
    }
}

// Export singleton instance
module.exports = new LoggerService();

