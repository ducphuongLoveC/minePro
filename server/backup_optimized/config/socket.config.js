/**
 * Socket.IO Configuration
 */

const { SOCKET, CORS } = require('./constants');

module.exports = {
    /**
     * Get Socket.IO server configuration
     */
    getSocketConfig: () => ({
        cors: {
            origin: CORS.ORIGIN,
            methods: CORS.METHODS,
            credentials: CORS.CREDENTIALS,
        },
        pingTimeout: SOCKET.PING_TIMEOUT,
        pingInterval: SOCKET.PING_INTERVAL,
        maxHttpBufferSize: SOCKET.MAX_HTTP_BUFFER_SIZE,
        transports: SOCKET.TRANSPORTS,
        allowUpgrades: SOCKET.ALLOWED_UPGRADES,
        compression: true,
        perMessageDeflate: {
            threshold: 1024,
            zlibDeflateOptions: {
                chunkSize: 8 * 1024,
            },
        },
        // Connection state recovery
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        },
    }),

    /**
     * Get namespace-specific configuration
     */
    getNamespaceConfig: (namespaceName) => ({
        // Add namespace-specific config here if needed
        path: `/${namespaceName}`,
    }),
};

