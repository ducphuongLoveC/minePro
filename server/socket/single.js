const MinesweeperGame = require('../core/MinesweeperGame.js');

function single(io, socket) {
    const dataPlayer = {
        gameState: null,
        playerState: {
            revealedCells: new Set(),
            flags: new Set()
        },
        saveConfig: {}
    };

    function getDataToSend() {
        return {
            gameState: dataPlayer.gameState.getState(),
            playerState: {
                revealedCells: Array.from(dataPlayer.playerState.revealedCells),
                flags: Array.from(dataPlayer.playerState.flags)
            }
        };
    }

    socket.on('initializeGame', (configMode) => {
        console.log('check222');
        
        dataPlayer.saveConfig = configMode;
        const { rows, cols, mines } = dataPlayer.saveConfig;
        dataPlayer.gameState = new MinesweeperGame(rows || 9, cols || 9, mines || null);
        dataPlayer.playerState = {
            revealedCells: new Set(),
            flags: new Set()
        };

        socket.emit('setGames', getDataToSend());
    });

    socket.on('openCell', ({ index }) => {
        if (index === undefined || index === null) return;
        if (!dataPlayer.gameState) return;
        
        const currentGamePlayer = dataPlayer.gameState;
        const playerState = dataPlayer.playerState;

        if (playerState.flags.has(index)) return;

        const result = currentGamePlayer.openCell(index);

        if (result) {
            playerState.revealedCells.add(index);

            if (result.openedIndices?.length > 0) {
                result.openedIndices.forEach(i => playerState.revealedCells.add(i));
            }

            socket.emit('updateState', {
                ...getDataToSend(),
                action: { type: 'open', index, result }
            });

            if (result.isMine) {
                socket.emit('gameOver', {
                    message: 'Bạn đã thua!'
                });
            } else if (result.isWin) {
                socket.emit('gameOver', {
                    message: 'Bạn đã thắng game!'
                });
            }
        }
    });

    socket.on('toggleFlag', ({ index }) => {
        if (index === undefined || index === null) return;
        if (!dataPlayer.gameState) return;

        const playerState = dataPlayer.playerState;

        if (playerState.revealedCells.has(index)) return;

        if (playerState.flags.has(index)) {
            playerState.flags.delete(index);
        } else {
            playerState.flags.add(index);
        }

        socket.emit('updateState', {
            ...getDataToSend(),
            action: { type: 'flag', index }
        });
    });
}

module.exports = single;