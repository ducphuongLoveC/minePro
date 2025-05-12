const MinesweeperGame = require('../core/MinesweeperGame.js');

const rooms = {};

function pvp(io, socket) {

    function AllEmitsetGames(roomId) {
        io.to(roomId).emit('setGames', {
            gameStates: Object.fromEntries(Object.entries(rooms[roomId].games).map(([id, game]) => [id, game.getState()])),
            playerStates: Object.fromEntries(
                Object.entries(rooms[roomId].playerStates).map(([id, state]) => [
                    id,
                    {
                        revealedCells: Array.from(state.revealedCells),
                        flags: Array.from(state.flags)
                    }
                ]
                )
            ),
            playersStatus: rooms[roomId].playersStatus
        })
    }

    socket.on('joinRoom', (roomId, playerName, configMode) => {
        console.log('configMode', configMode);

        console.log(`User ${socket.id} attempting to join room ${roomId}`);
        if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
            socket.emit('error', { message: 'Invalid room ID' });
            return;
        }

        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                games: {},
                playerStates: {},
                playersStatus: [],
                saveConfig: {}
            };
            socket.emit('roomCreated', { roomId });
        }

        if (rooms[roomId].players.length >= 2) {
            socket.emit('roomFull', { message: 'Room is full' });
            return;
        }

        if (configMode) {
            rooms[roomId].saveConfig = configMode
        }
        const { rows, cols, mines } = rooms[roomId].saveConfig;

        rooms[roomId].players.push(socket.id);

        rooms[roomId].games[socket.id] = new MinesweeperGame(rows || 9, cols || 9, mines || null)
        rooms[roomId].games[socket.id].start();

        rooms[roomId].playerStates[socket.id] = {
            revealedCells: new Set(),
            flags: new Set()
        };

        rooms[roomId].playersStatus.push({
            [socket.id]: {
                playerName: playerName ? playerName : 'Player ' + rooms[roomId].players.length,
                isReady: rooms[roomId].players.length === 1 ? true : false,
            }
        });

        socket.join(roomId);
        socket.emit('joinedRoom', { roomId, playerId: socket.id });
        console.log(rooms[roomId].playersStatus);

        console.log(`User ${socket.id} joined room ${roomId}. Players: ${rooms[roomId].players.length}`);

        AllEmitsetGames(roomId)

    });

    socket.on('toggleReadyGame', (roomId) => {
        if (!rooms[roomId] || !rooms[roomId].players.includes(socket.id)) return;

        const playersStatus = rooms[roomId].playersStatus;
        const found = playersStatus.find(entry => entry[socket.id])?.[socket.id];
        found.isReady = !found.isReady;
        AllEmitsetGames(roomId)
    })

    socket.on('startGame', (roomId) => {

        const canReady = rooms[roomId].playersStatus.every((pl) => {
            const [, player] = Object.entries(pl)[0];
            return player.isReady;
        })

        if (canReady) {
            io.to(roomId).emit('canStartGame', { canStart: true, message: 'Game bắt đầu!' })
        } else {
            socket.emit('playerNotReady', { message: 'Người chơi chưa sẵn sàng!' })

        }
    })

    socket.on('replayGame', (roomId) => {
        socket.to(roomId).emit('sendReplayGame', { message: 'Chơi thêm ván nữa nhé!' })
    })

    socket.on('confirmReplay', ({ roomId }) => {
        // console.log('server check confirmReplay');

        const { players,
            games,
            playerStates,
            // playersStatus,
            saveConfig } = rooms[roomId];

        const { rows, cols, mines } = saveConfig;


        players.forEach((id) => {
            games[id] = new MinesweeperGame(rows || 9, cols || 9, mines || null)
            games[id].start();
            playerStates[id] = {
                revealedCells: new Set(),
                flags: new Set()
            }
        })

        io.to(roomId).emit('replayConfirmed', {
            gameStates: Object.fromEntries(Object.entries(rooms[roomId].games).map(([id, game]) => [id, game.getState()])),
            playerStates: Object.fromEntries(
                Object.entries(rooms[roomId].playerStates).map(([id, state]) => [
                    id,
                    {
                        revealedCells: Array.from(state.revealedCells),
                        flags: Array.from(state.flags)
                    }
                ]
                )
            ),
            playersStatus: rooms[roomId].playersStatus,
            message: 'Chơi thêm ván nữa nhé!'
        })
    })
    socket.on('declineReplay', ({ roomId }) => {
        socket.to(roomId).emit('replayDeclined', { message: 'Chơi thêm ván nữa nhé!' })
    })

    socket.on('openCell', ({ roomId, index }) => {


        if (!rooms[roomId] || !rooms[roomId].players.includes(socket.id)) return;

        const currentGamePlayer = rooms[roomId].games[socket.id];
        const playerState = rooms[roomId].playerStates[socket.id];

        // Kiểm tra nếu ô đã được đánh dấu cờ thì không mở được
        if (playerState.flags.has(index)) return;

        const result = currentGamePlayer.openCell(index);

        if (result) {
            // Thêm ô vừa mở vào revealedCells
            playerState.revealedCells.add(index);

            // Nếu mở đệ quy (khi ô trống), thêm tất cả các ô đã mở
            if (result.openedIndices && result.openedIndices.length > 0) {
                result.openedIndices.forEach(i => playerState.revealedCells.add(i));
            }


            io.to(roomId).emit('updateState', {
                playerId: socket.id,
                gameStates: Object.fromEntries(Object.entries(rooms[roomId].games).map(([id, game]) => [id, game.getState()])),
                playerStates: {
                    [socket.id]: {
                        revealedCells: Array.from(playerState.revealedCells),
                        flags: Array.from(playerState.flags)
                    },
                    ...(rooms[roomId].players.length > 1 && {
                        [rooms[roomId].players.find(id => id !== socket.id)]: {
                            revealedCells: Array.from(rooms[roomId].playerStates[rooms[roomId].players.find(id => id !== socket.id)].revealedCells),
                            flags: Array.from(rooms[roomId].playerStates[rooms[roomId].players.find(id => id !== socket.id)].flags)
                        }
                    })
                },
                action: { type: 'open', index, result, playerId: socket.id },
            });

            const winner = rooms[roomId].players.find(id => id !== socket.id);
            const winnerName = rooms[roomId].playersStatus.find(entry => entry[winner])?.[winner].playerName;
            const loseName = rooms[roomId].playersStatus.find(entry => entry[socket.id])?.[socket.id].playerName;
            if (result.isMine) {

                io.to(roomId).emit('gameOver', {
                    winner,
                    loser: socket.id,
                    message: winner ? `${winnerName} thắng! ${loseName} chạm vào bom!` : 'kết thúc game!'
                });
            } else if (result.isWin) {
                io.to(roomId).emit('gameOver', {
                    winner: socket.id,
                    loser: null,
                    message: `${winnerName} đã thắng game!`
                });
            }
        }
    });

    socket.on('toggleFlag', ({ roomId, index }) => {

        console.log(index);

        if (!rooms[roomId] || !rooms[roomId].players.includes(socket.id)) return;

        // const game = rooms[roomId].game;
        const playerState = rooms[roomId].playerStates[socket.id];


        if (playerState.revealedCells.has(index)) return;

        if (playerState.flags.has(index)) {
            playerState.flags.delete(index);
        } else {
            playerState.flags.add(index);
        }

        console.log(playerState);

        io.to(roomId).emit('updateState', {
            playerId: socket.id,
            gameStates: Object.fromEntries(Object.entries(rooms[roomId].games).map(([id, game]) => [id, game.getState()])),
            playerStates: Object.fromEntries(
                Object.entries(rooms[roomId].playerStates).map(([id, state]) => [
                    id,
                    {
                        revealedCells: Array.from(state.revealedCells),
                        flags: Array.from(state.flags)
                    }
                ]
                )
            ),
            action: { type: 'flag', index, playerId: socket.id },
        });
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                delete room.playerStates[socket.id];
                io.to(roomId).emit('playerLeft');
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    // If one player leaves, end the game
                    io.to(roomId).emit('gameOver', {
                        winner: null,
                        loser: null,
                        message: 'Game ended because opponent disconnected'
                    });
                }
            }
        }
        console.log('A user disconnected:', socket.id);
    });
}
module.exports = pvp;