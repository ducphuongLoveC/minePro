/**
 * Main Server Entry Point (Refactored & Optimized)
 * - Clean architecture
 * - Scalable với Redis adapter
 * - Rate limiting
 * - Health checks
 * - Production ready
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

// Configuration
const { SERVER, REDIS, EVENTS } = require('./config/constants');
const { getSocketConfig } = require('./config/socket.config');

// Services
const logger = require('./services/LoggerService');
const RoomService = require('./services/RoomService');

// Middleware
const { checkConnectionLimit, startCleanup } = require('./middleware/rateLimiter');

// Socket Handlers
const setupSinglePlayerHandlers = require('./socket/handlers/single.handler');
const setupPVPHandlers = require('./socket/handlers/pvp.handler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, getSocketConfig());

// Apply rate limiting middleware
io.use(checkConnectionLimit);

// Serve static files
app.use(express.static('public', {
    maxAge: '1d',
    etag: true,
}));

app.use(express.json());

// ============================
// Health Check & Monitoring
// ============================

app.get('/health', (req, res) => {
    const stats = RoomService.getStats();
    
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: SERVER.ENV,
        stats: {
            rooms: stats.totalRooms,
            players: stats.totalPlayers,
        },
        memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
    });
});

app.get('/no-sleep', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OK',
        status: 200,
    });
});

// ============================
// Socket.IO Setup
// ============================

// Default namespace - ping/pong only
io.on(EVENTS.CONNECTION, (socket) => {
    logger.connection(socket.id, 'default');

    socket.on(EVENTS.PING, (data) => {
        socket.emit(EVENTS.PONG, { pingTime: data.pingTime });
    });

    socket.on(EVENTS.DISCONNECT, () => {
        logger.disconnection(socket.id, 'default', 'disconnect');
    });
});

// Single player namespace
const singleNamespace = io.of('/single');
singleNamespace.on(EVENTS.CONNECTION, (socket) => {
    setupSinglePlayerHandlers(singleNamespace, socket);
});

// PVP namespace
const pvpNamespace = io.of('/pvp');
pvpNamespace.on(EVENTS.CONNECTION, (socket) => {
    setupPVPHandlers(pvpNamespace, socket);
});

// ============================
// Redis Adapter (Scalability)
// ============================

if (REDIS.ENABLED) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { createClient } = require('redis');

    const pubClient = createClient({
        host: REDIS.HOST,
        port: REDIS.PORT,
        password: REDIS.PASSWORD,
        db: REDIS.DB,
    });

    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
            io.adapter(createAdapter(pubClient, subClient));
            logger.info('Redis adapter connected successfully');
        })
        .catch((error) => {
            logger.error('Redis adapter connection failed', error);
            logger.warn('Running without Redis adapter (single instance mode)');
        });

    // Handle Redis errors
    pubClient.on('error', (err) => logger.error('Redis pub client error', err));
    subClient.on('error', (err) => logger.error('Redis sub client error', err));
} else {
    logger.info('Redis adapter disabled - running in single instance mode');
}

// ============================
// Keep-Alive Mechanism
// ============================

if (process.env.MAIN_BASE) {
    let keepAliveCount = 0;
    
    const keepAlive = async () => {
        const url = `${process.env.MAIN_BASE}/no-sleep`;
        
        try {
            const response = await axios.get(url, { timeout: 5000 });
            keepAliveCount++;
            logger.debug(`Keep-alive ping #${keepAliveCount}`, { status: response.status });
        } catch (error) {
            logger.warn('Keep-alive ping failed', { error: error.message });
        }
    };

    // Initial ping
    keepAlive();
    
    // Repeat every 5 minutes
    setInterval(keepAlive, SERVER.KEEP_ALIVE_INTERVAL);
}

// ============================
// Start Cleanup Tasks
// ============================

startCleanup(); // Rate limiter cleanup

// ============================
// Error Handling
// ============================

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    // Give time to log before exit
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

// ============================
// Start Server
// ============================

server.listen(SERVER.PORT, SERVER.HOST, () => {
    logger.info(`🚀 Server running on ${SERVER.HOST}:${SERVER.PORT}`);
    logger.info(`📝 Environment: ${SERVER.ENV}`);
    logger.info(`🔌 Socket.IO ready with namespaces: /single, /pvp`);
    logger.info(`💾 Redis: ${REDIS.ENABLED ? 'ENABLED' : 'DISABLED'}`);
});

module.exports = { app, server, io };

