const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pvp = require('./socket/pvp.js');
const single = require('./socket/single.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    pvp(io, socket);
    single(io, socket);
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});