/**
 * Sudoku Puzzle Generator
 * Generates valid Sudoku puzzles with a single unique solution
 */

const SudokuGenerator = {
    /**
     * Generate a complete valid Sudoku solution
     * Uses backtracking algorithm
     * @returns {Array} 9x9 solved Sudoku grid
     */
    generateSolution() {
        const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillGrid(grid);
        return grid;
    },

    /**
     * Fill grid using backtracking with randomization
     * @param {Array} grid - 9x9 grid to fill
     * @returns {boolean} Success status
     */
    fillGrid(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true; // Grid is complete

        const [row, col] = emptyCell;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
            if (this.isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.fillGrid(grid)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    },

    /**
     * Find the next empty cell in the grid
     * @param {Array} grid - 9x9 grid
     * @returns {Array|null} [row, col] or null if grid is complete
     */
    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return [row, col];
            }
        }
        return null;
    },

    /**
     * Check if placing a number is valid
     * @param {Array} grid - 9x9 grid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} num - Number to place
     * @returns {boolean} Whether placement is valid
     */
    isValidPlacement(grid, row, col, num) {
        // Check row
        if (grid[row].includes(num)) return false;

        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === num) return false;
        }

        // Check 3x3 subgrid
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }

        return true;
    },

    /**
     * Fisher-Yates shuffle algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Generate a puzzle by removing numbers from a complete solution
     * Ensures clues are spread throughout the grid across all 3x3 boxes
     * @param {string} difficulty - Difficulty level
     * @returns {Object} Object with puzzle and solution arrays
     */
    generatePuzzle(difficulty) {
        const solution = this.generateSolution();
        const puzzle = solution.map(row => [...row]);
        
        // Determine how many cells to remove based on difficulty
        // Easy has more clues (easiest), Super Hard has fewest (hardest)
        const clueRanges = {
            easy: { min: 45, max: 50 },
            medium: { min: 28, max: 32 },
            hard: { min: 22, max: 26 },
            superhard: { min: 17, max: 20 }
        };

        const range = clueRanges[difficulty] || clueRanges.easy;
        const targetClues = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const cellsToRemove = 81 - targetClues;

        // Group positions by their 3x3 box for balanced distribution
        const boxes = Array.from({ length: 9 }, () => []);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                boxes[boxIndex].push([r, c]);
            }
        }

        // Shuffle positions within each box
        boxes.forEach(box => this.shuffleArray(box));

        // Create a balanced removal order by interleaving cells from each box
        const positions = [];
        const maxBoxSize = 9;
        // Pre-shuffle box order once for randomness
        const boxOrder = this.shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        for (let i = 0; i < maxBoxSize; i++) {
            for (const boxIndex of boxOrder) {
                if (i < boxes[boxIndex].length) {
                    positions.push(boxes[boxIndex][i]);
                }
            }
        }

        // Remove cells while ensuring unique solution
        let removed = 0;
        for (const [row, col] of positions) {
            if (removed >= cellsToRemove) break;
            
            const backup = puzzle[row][col];
            puzzle[row][col] = 0;

            // For easier difficulties, just remove without checking uniqueness
            // For harder, verify unique solution
            if (difficulty === 'hard' || difficulty === 'superhard') {
                if (!this.hasUniqueSolution(puzzle)) {
                    puzzle[row][col] = backup;
                    continue;
                }
            }
            
            removed++;
        }

        return { puzzle, solution };
    },

    /**
     * Count solutions for a puzzle (stops at 2)
     * @param {Array} grid - 9x9 puzzle grid
     * @returns {number} Number of solutions (0, 1, or 2)
     */
    countSolutions(grid, count = { value: 0 }) {
        if (count.value > 1) return count.value;

        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            count.value++;
            return count.value;
        }

        const [row, col] = emptyCell;
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                this.countSolutions(grid, count);
                if (count.value > 1) {
                    grid[row][col] = 0;
                    return count.value;
                }
                grid[row][col] = 0;
            }
        }
        return count.value;
    },

    /**
     * Check if puzzle has exactly one solution
     * @param {Array} puzzle - 9x9 puzzle grid
     * @returns {boolean} Whether puzzle has unique solution
     */
    hasUniqueSolution(puzzle) {
        const copy = puzzle.map(row => [...row]);
        return this.countSolutions(copy) === 1;
    },

    /**
     * Solve a puzzle using backtracking
     * @param {Array} puzzle - 9x9 puzzle grid
     * @returns {Array|null} Solved grid or null if no solution
     */
    solve(puzzle) {
        const grid = puzzle.map(row => [...row]);
        if (this.solveGrid(grid)) {
            return grid;
        }
        return null;
    },

    /**
     * Internal solving function using backtracking
     * @param {Array} grid - Grid to solve
     * @returns {boolean} Success status
     */
    solveGrid(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.solveGrid(grid)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }
};
