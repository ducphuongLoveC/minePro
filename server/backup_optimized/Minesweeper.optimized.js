/**
 * Optimized Minesweeper Core Game Logic
 * - Removed recursion (stack overflow risk)
 * - Better performance with iterative approach
 * - Memory optimized
 * - Clean code principles
 */

const { GAME } = require('../config/constants');
const logger = require('../services/LoggerService');

class Minesweeper {
    constructor(ratioX, ratioY, mineCounter = null) {
        this.ratioX = Math.max(GAME.MIN_BOARD_SIZE, Math.min(ratioX, GAME.MAX_BOARD_SIZE));
        this.ratioY = Math.max(GAME.MIN_BOARD_SIZE, Math.min(ratioY, GAME.MAX_BOARD_SIZE));
        this.mineCounter = mineCounter;
        this.mineIndices = [];
        this.openedCells = 0;
        this.gameOver = false;
        this.totalCells = this.ratioX * this.ratioY;
        
        // Initialize cells efficiently
        this.cells = new Array(this.totalCells);
        for (let i = 0; i < this.totalCells; i++) {
            this.cells[i] = {
                isMine: false,
                count: 0,
                isOpen: false,
                isMarkHint: false,
            };
        }
    }

    /**
     * Calculate optimal number of mines
     */
    calculateTotalMines() {
        const totalCells = this.totalCells;
        
        let mineRatio;
        if (totalCells < 100) {
            mineRatio = GAME.MINE_RATIOS.SMALL;
        } else if (totalCells <= 300) {
            mineRatio = GAME.MINE_RATIOS.MEDIUM;
        } else {
            mineRatio = GAME.MINE_RATIOS.LARGE;
        }
        
        let mineCount = Math.floor(totalCells * mineRatio);
        mineCount = Math.max(GAME.MIN_MINES, mineCount);
        mineCount = Math.min(mineCount, Math.floor(totalCells * GAME.MAX_MINE_RATIO));
        
        return mineCount;
    }

    /**
     * Get indices of surrounding cells
     * Optimized: pre-calculate and cache if needed
     */
    getNeighborIndices(currentIndex) {
        const col = currentIndex % this.ratioY;
        const row = Math.floor(currentIndex / this.ratioY);
        const neighbors = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const newRow = row + dy;
                const newCol = col + dx;
                
                if (newRow >= 0 && newRow < this.ratioX && 
                    newCol >= 0 && newCol < this.ratioY) {
                    neighbors.push(newRow * this.ratioY + newCol);
                }
            }
        }

        return neighbors;
    }

    /**
     * Setup mines using Fisher-Yates shuffle algorithm
     * More efficient than repeated random selection
     */
    setupMines() {
        let totalMines = this.mineCounter !== null && this.mineCounter !== undefined
            ? Math.min(this.mineCounter, this.totalCells)
            : this.calculateTotalMines();

        // Fisher-Yates shuffle on indices
        const indices = Array.from({ length: this.totalCells }, (_, i) => i);
        
        for (let i = this.totalCells - 1; i > this.totalCells - totalMines - 1; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
            
            const mineIndex = indices[i];
            this.mineIndices.push(mineIndex);
            this.cells[mineIndex].isMine = true;
        }

        logger.debug('Mines setup', { totalMines, totalCells: this.totalCells });
    }

    /**
     * Mark mine counts around mines
     * Optimized: single pass through mines
     */
    markMines() {
        for (const mineIndex of this.mineIndices) {
            const neighbors = this.getNeighborIndices(mineIndex);
            
            for (const neighborIndex of neighbors) {
                if (!this.cells[neighborIndex].isMine) {
                    this.cells[neighborIndex].count++;
                }
            }
        }
    }

    /**
     * Set hint marker on a random safe cell with count = 0
     */
    setMarkHint() {
        const safeCellsWithZeroCount = [];
        
        for (let i = 0; i < this.totalCells; i++) {
            if (!this.cells[i].isMine && this.cells[i].count === 0) {
                safeCellsWithZeroCount.push(i);
            }
        }

        if (safeCellsWithZeroCount.length > 0) {
            const randomIndex = Math.floor(Math.random() * safeCellsWithZeroCount.length);
            this.cells[safeCellsWithZeroCount[randomIndex]].isMarkHint = true;
        }
    }

    /**
     * Open a cell - Iterative BFS approach (no recursion)
     * Much better performance and no stack overflow risk
     */
    openCell(index) {
        if (this.gameOver || this.cells[index].isOpen) {
            return null;
        }

        this.cells[index].isOpen = true;
        this.openedCells++;

        // Hit mine - game over
        if (this.cells[index].isMine) {
            this.gameOver = true;
            return { 
                success: false, 
                isMine: true, 
                mines: this.mineIndices,
                openedIndices: [index],
            };
        }

        const result = {
            success: true,
            count: this.cells[index].count,
            openedIndices: [index],
        };

        // Use BFS queue for opening adjacent cells (iterative, not recursive)
        if (this.cells[index].count === 0) {
            const queue = [index];
            const visited = new Set([index]);

            while (queue.length > 0) {
                const currentIndex = queue.shift();
                const neighbors = this.getNeighborIndices(currentIndex);

                for (const neighborIndex of neighbors) {
                    if (visited.has(neighborIndex) || this.cells[neighborIndex].isOpen) {
                        continue;
                    }

                    visited.add(neighborIndex);
                    this.cells[neighborIndex].isOpen = true;
                    this.openedCells++;
                    result.openedIndices.push(neighborIndex);

                    // Continue BFS if neighbor also has count = 0
                    if (this.cells[neighborIndex].count === 0 && !this.cells[neighborIndex].isMine) {
                        queue.push(neighborIndex);
                    }
                }
            }
        }

        // Check win condition
        if (this.openedCells === this.totalCells - this.mineIndices.length) {
            this.gameOver = true;
            result.isWin = true;
        }

        return result;
    }

    /**
     * Chording: open all non-flagged neighbors if flag count matches
     */
    chording(index, flags) {
        if (this.gameOver || !this.cells[index].isOpen) {
            return { success: false, openedIndices: [], isMine: false };
        }

        const neighbors = this.getNeighborIndices(index);
        
        // Count flags around this cell
        const flagCount = neighbors.reduce((count, idx) => 
            count + (flags.includes(idx) ? 1 : 0), 0);

        // Must have correct number of flags
        if (flagCount !== this.cells[index].count) {
            return { success: false, openedIndices: [], isMine: false };
        }

        const result = {
            success: true,
            openedIndices: [],
            isMine: false,
        };

        // Open all non-flagged neighbors
        for (const neighborIndex of neighbors) {
            if (!flags.includes(neighborIndex) && !this.cells[neighborIndex].isOpen) {
                const openResult = this.openCell(neighborIndex);
                
                if (openResult.isMine) {
                    result.isMine = true;
                    result.success = false;
                    return result;
                }
                
                if (openResult.isWin) {
                    result.isWin = true;
                }
                
                result.openedIndices.push(...openResult.openedIndices);
            }
        }

        return result;
    }

    /**
     * Initialize game
     */
    start() {
        this.setupMines();
        this.markMines();
        this.setMarkHint();
        
        logger.game('started', {
            dimensions: `${this.ratioX}x${this.ratioY}`,
            mines: this.mineIndices.length,
        });
    }

    /**
     * Get current game state
     */
    getState() {
        return {
            ratioX: this.ratioX,
            ratioY: this.ratioY,
            cells: this.cells,
            gameOver: this.gameOver,
            openedCells: this.openedCells,
            totalMines: this.mineIndices.length,
            totalCells: this.totalCells,
            mines: this.mineIndices,
        };
    }

    /**
     * Get sanitized state for client (hide mines)
     */
    getClientState() {
        const state = this.getState();
        // Don't send mine positions to client
        delete state.mines;
        return state;
    }
}

module.exports = Minesweeper;

