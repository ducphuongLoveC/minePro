/**
 * Game Service
 * Manages game logic and state
 */

const Minesweeper = require('../core/Minesweeper.optimized');
const { GAME, PLAYER_STATUS } = require('../config/constants');
const logger = require('./LoggerService');

class GameService {
    /**
     * Create new game instance
     */
    createGame(rows, cols, mines) {
        const gameRows = rows || GAME.DEFAULT_BOARD.rows;
        const gameCols = cols || GAME.DEFAULT_BOARD.cols;
        const gameMines = mines;

        const game = new Minesweeper(gameRows, gameCols, gameMines);
        game.start();

        logger.game('created', { rows: gameRows, cols: gameCols, mines: gameMines });
        
        return game;
    }

    /**
     * Initialize player state
     */
    createPlayerState() {
        return {
            revealedCells: new Set(),
            flags: new Set(),
        };
    }

    /**
     * Handle open cell action
     */
    handleOpenCell(game, playerState, index) {
        // Don't open if flagged
        if (playerState.flags.has(index)) {
            return null;
        }

        const result = game.openCell(index);
        
        if (result) {
            // Add opened cells to revealed set
            playerState.revealedCells.add(index);
            if (result.openedIndices) {
                result.openedIndices.forEach(i => playerState.revealedCells.add(i));
            }

            logger.game('cell_opened', { index, isMine: result.isMine, isWin: result.isWin });
        }

        return result;
    }

    /**
     * Handle chording action
     */
    handleChording(game, playerState, index) {
        const flags = Array.from(playerState.flags);
        const result = game.chording(index, flags);

        if (result.success) {
            result.openedIndices.forEach(i => playerState.revealedCells.add(i));
            logger.game('chording', { index, opened: result.openedIndices.length });
        }

        return result;
    }

    /**
     * Handle toggle flag action
     */
    handleToggleFlag(playerState, index, totalCells) {
        if (index < 0 || index >= totalCells) {
            return null;
        }

        // Don't flag revealed cells
        if (playerState.revealedCells.has(index)) {
            return null;
        }

        const hadFlag = playerState.flags.has(index);
        
        if (hadFlag) {
            playerState.flags.delete(index);
        } else {
            playerState.flags.add(index);
        }

        logger.game('flag_toggled', { index, hasFlag: !hadFlag });
        
        return { hasFlag: !hadFlag };
    }

    /**
     * Determine player status based on result
     */
    determineStatus(result) {
        if (result.isMine) {
            return PLAYER_STATUS.LOST;
        }
        if (result.isWin) {
            return PLAYER_STATUS.WON;
        }
        return PLAYER_STATUS.PLAYING;
    }

    /**
     * Check if game is over
     */
    isGameOver(result) {
        return result.isMine || result.isWin;
    }

    /**
     * Serialize player state for transmission
     */
    serializePlayerState(playerState) {
        return {
            revealedCells: Array.from(playerState.revealedCells),
            flags: Array.from(playerState.flags),
        };
    }

    /**
     * Get changes for state update
     */
    getStateChanges(result) {
        return {
            revealedCells: result.openedIndices || [],
            flags: [],
        };
    }
}

// Export singleton
module.exports = new GameService();

