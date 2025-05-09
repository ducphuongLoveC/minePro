class MinesweeperGame {
    constructor(ratioX, ratioY, mineCounter) {
        this.ratioX = ratioX;
        this.ratioY = ratioY;
        this.mineCounter = mineCounter;
        this.isMines = [];
        this.openedCells = 0;
        this.gameOver = false;
        this.cells = Array(ratioX * ratioY).fill(0).map(() => ({
            isMine: false,
            count: 0,
            isMarkHint: false
        }));
    }

    getTotalCells() {
        return this.ratioX * this.ratioY;
    }

    totalMines() {
        const totalCells = this.getTotalCells();
        let mineRatio = totalCells < 100 ? 0.12 : totalCells <= 300 ? 0.15 : 0.20;
        let mineCount = Math.floor(totalCells * mineRatio);
        mineCount = Math.max(1, mineCount);
        mineCount = Math.min(mineCount, Math.floor(totalCells * 0.25));
        return mineCount;
    }

    // getIndexAround(currentIndex) {
    //     const col = currentIndex % this.ratioX;
    //     const row = Math.floor(currentIndex / this.ratioX);
    //     const result = [];

    //     for (let dy = -1; dy <= 1; dy++) {
    //         for (let dx = -1; dx <= 1; dx++) {
    //             if (dx === 0 && dy === 0) continue;
    //             const newRow = row + dy;
    //             const newCol = col + dx;
    //             if (newRow >= 0 && newRow < this.ratioY && newCol >= 0 && newCol < this.ratioX) {
    //                 result.push(newRow * this.ratioX + newCol);
    //             }
    //         }
    //     }
    //     return result;
    // }

    getIndexAround(currentIndex) {
        const col = currentIndex % this.ratioY;  // ratioY là số cột
        const row = Math.floor(currentIndex / this.ratioY);  // ratioY là số cột
        const result = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const newRow = row + dy;
                const newCol = col + dx;
                if (newRow >= 0 && newRow < this.ratioX &&  // ratioX là số hàng
                    newCol >= 0 && newCol < this.ratioY) {  // ratioY là số cột
                    result.push(newRow * this.ratioY + newCol);  // Nhân với số cột (ratioY)
                }
            }
        }
        return result;
    }

    setupMines() {
        const totalMines = this.mineCounter || this.totalMines();
        const mapForMark = Array(this.getTotalCells()).fill(0).map((_, index) => index);

        for (let i = 0; i < totalMines; i++) {
            const randomIndex = Math.floor(Math.random() * mapForMark.length);
            const mineIndex = mapForMark[randomIndex];
            this.isMines.push(mineIndex);
            this.cells[mineIndex].isMine = true;
            mapForMark.splice(randomIndex, 1);
        }
    }

    markMines() {
        this.isMines.forEach((mineIndex) => {
            const aroundIndices = this.getIndexAround(mineIndex);
            aroundIndices.forEach((index) => {
                if (!this.cells[index].isMine) {
                    this.cells[index].count += 1;
                }
            });
        });
    }

    setMarkHint() {
        let indexMark = [];
        this.cells.forEach(({ isMine, count }, index) => {
            if (!isMine && count === 0) {
                indexMark.push(index)
            }
        })

        if (indexMark.length) {
            this.cells[indexMark[Math.floor(Math.random() * indexMark.length)]].isMarkHint = true;
        }

    }

    openCell(index) {
        if (this.gameOver || this.cells[index].isOpen) return false;

        this.cells[index].isOpen = true;
        this.openedCells++;

        if (this.cells[index].isMine) {
            this.gameOver = true;
            return { success: false, isMine: true };
        }

        const result = {
            success: true,
            count: this.cells[index].count,
            openedIndices: [index]
        };

        if (this.cells[index].count === 0) {
            const neighbors = this.getIndexAround(index);
            neighbors.forEach((neighborIndex) => {
                if (!this.cells[neighborIndex].isOpen) {
                    const neighborResult = this.openCell(neighborIndex);
                    if (neighborResult && neighborResult.success) {
                        result.openedIndices.push(...neighborResult.openedIndices);
                    }
                }
            });
        }

        if (this.openedCells === this.getTotalCells() - this.isMines.length) {
            this.gameOver = true;
            result.isWin = true;
        }

        return result;
    }

    start() {
        this.setupMines();
        this.markMines();
        this.setMarkHint();
    }

    getState() {
        return {
            ratioX: this.ratioX,
            ratioY: this.ratioY,
            cells: this.cells,
            gameOver: this.gameOver,
            openedCells: this.openedCells,
            totalMines: this.totalMines(),
        };
    }
}
module.exports = MinesweeperGame;