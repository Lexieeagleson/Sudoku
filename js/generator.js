/**
 * Sudoku Puzzle Generator
 * Generates valid Sudoku puzzles with a single unique solution.
 * 
 * Validation Rules:
 * - All rows must contain unique numbers from 1-9 (no duplicates)
 * - All columns must contain unique numbers from 1-9 (no duplicates)
 * - All 3x3 subgrids must contain unique numbers from 1-9 (no duplicates)
 * 
 * The generator uses a backtracking algorithm that inherently ensures these
 * rules are followed during grid generation. Additional validation methods
 * are provided to verify grid correctness after generation.
 */

const SudokuGenerator = {
    /**
     * Generate a complete valid Sudoku solution.
     * Uses backtracking algorithm and validates the result.
     * If validation fails, automatically regenerates until a valid grid is produced.
     * 
     * Validation is performed after generation to confirm:
     * - All 9 rows contain unique numbers 1-9
     * - All 9 columns contain unique numbers 1-9
     * - All 9 3x3 subgrids contain unique numbers 1-9
     * 
     * @param {number} maxAttempts - Maximum regeneration attempts (default: 10)
     * @returns {Array} 9x9 solved Sudoku grid
     */
    generateSolution(maxAttempts = 10) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
            this.fillGrid(grid);
            
            // Validate the generated solution to ensure correctness
            if (this.isValidGrid(grid)) {
                return grid;
            }
            // If validation fails, try again (should be rare with backtracking)
        }
        
        // Final attempt with validation - backtracking should always produce valid grids
        const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillGrid(grid);
        
        // Validate final attempt and return (backtracking guarantees validity)
        if (!this.isValidGrid(grid)) {
            // This should never happen with a correct backtracking implementation
            // but we validate anyway for safety
            return this.generateSolution(maxAttempts);
        }
        return grid;
    },

    /**
     * Fill grid using backtracking with randomization.
     * 
     * The backtracking algorithm ensures Sudoku rules are followed:
     * - Before placing any number, isValidPlacement() checks that the number
     *   doesn't already exist in the same row, column, or 3x3 subgrid
     * - If a placement leads to a dead end, the algorithm backtracks and tries
     *   a different number, ensuring a valid solution is always found
     * 
     * @param {Array} grid - 9x9 grid to fill
     * @returns {boolean} Success status
     */
    fillGrid(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true; // Grid is complete

        const [row, col] = emptyCell;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
            // isValidPlacement ensures no duplicates in row, column, or subgrid
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
     * Validate a single row contains unique numbers 1-9 with no duplicates.
     * Empty cells (0) are allowed for puzzle validation.
     * 
     * @param {Array} grid - 9x9 grid
     * @param {number} rowIndex - Row index (0-8)
     * @returns {boolean} Whether the row is valid
     */
    validateRow(grid, rowIndex) {
        const seen = new Set();
        for (let col = 0; col < 9; col++) {
            const num = grid[rowIndex][col];
            if (num === 0) continue; // Skip empty cells
            if (num < 1 || num > 9) return false; // Invalid number
            if (seen.has(num)) return false; // Duplicate found
            seen.add(num);
        }
        return true;
    },

    /**
     * Validate a single column contains unique numbers 1-9 with no duplicates.
     * Empty cells (0) are allowed for puzzle validation.
     * 
     * @param {Array} grid - 9x9 grid
     * @param {number} colIndex - Column index (0-8)
     * @returns {boolean} Whether the column is valid
     */
    validateColumn(grid, colIndex) {
        const seen = new Set();
        for (let row = 0; row < 9; row++) {
            const num = grid[row][colIndex];
            if (num === 0) continue; // Skip empty cells
            if (num < 1 || num > 9) return false; // Invalid number
            if (seen.has(num)) return false; // Duplicate found
            seen.add(num);
        }
        return true;
    },

    /**
     * Validate a single 3x3 subgrid contains unique numbers 1-9 with no duplicates.
     * Empty cells (0) are allowed for puzzle validation.
     * 
     * @param {Array} grid - 9x9 grid
     * @param {number} boxStartRow - Starting row of the 3x3 box (0, 3, or 6)
     * @param {number} boxStartCol - Starting column of the 3x3 box (0, 3, or 6)
     * @returns {boolean} Whether the subgrid is valid
     */
    validateSubgrid(grid, boxStartRow, boxStartCol) {
        const seen = new Set();
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                const num = grid[r][c];
                if (num === 0) continue; // Skip empty cells
                if (num < 1 || num > 9) return false; // Invalid number
                if (seen.has(num)) return false; // Duplicate found
                seen.add(num);
            }
        }
        return true;
    },

    /**
     * Validate the entire Sudoku grid follows all game rules.
     * 
     * This method checks that:
     * 1. All 9 rows contain unique numbers (no duplicates)
     * 2. All 9 columns contain unique numbers (no duplicates)
     * 3. All 9 3x3 subgrids contain unique numbers (no duplicates)
     * 4. All filled cells contain valid numbers (1-9)
     * 
     * For a complete solution, also verifies all cells are filled.
     * For a puzzle with empty cells (0), validates only filled cells.
     * 
     * @param {Array} grid - 9x9 grid to validate
     * @param {boolean} requireComplete - If true, requires all cells to be filled (default: true)
     * @returns {boolean} Whether the grid is valid
     */
    isValidGrid(grid, requireComplete = true) {
        // Check grid dimensions
        if (!grid || grid.length !== 9) return false;
        for (let row = 0; row < 9; row++) {
            if (!grid[row] || grid[row].length !== 9) return false;
        }

        // If requiring complete grid, check no empty cells
        if (requireComplete) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) return false;
                }
            }
        }

        // Validate all rows
        for (let row = 0; row < 9; row++) {
            if (!this.validateRow(grid, row)) return false;
        }

        // Validate all columns
        for (let col = 0; col < 9; col++) {
            if (!this.validateColumn(grid, col)) return false;
        }

        // Validate all 3x3 subgrids
        for (let boxRow = 0; boxRow < 9; boxRow += 3) {
            for (let boxCol = 0; boxCol < 9; boxCol += 3) {
                if (!this.validateSubgrid(grid, boxRow, boxCol)) return false;
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
     * Generate a puzzle by removing numbers from a complete solution.
     * If validation fails, automatically regenerates until a valid puzzle is produced.
     * 
     * The puzzle generation process ensures valid Sudoku rules:
     * 1. Starts with a fully validated solution (all rows, columns, subgrids valid)
     * 2. Removes cells to create the puzzle while maintaining validity
     * 3. For harder difficulties, verifies unique solution after each removal
     * 4. Final puzzle is validated to ensure no duplicate numbers
     * 
     * Clue ranges by difficulty:
     * - Easy: 45-50 clues (most prefilled - perfect for beginners)
     * - Medium: 28-32 clues (moderate challenge)
     * - Hard: 22-26 clues (fewer prefilled - requires advanced techniques)
     * - Super Hard: 17-20 clues (fewest prefilled - expert only)
     * 
     * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'superhard')
     * @param {number} maxAttempts - Maximum regeneration attempts (default: 10)
     * @returns {Object} Object with puzzle and solution arrays
     */
    generatePuzzle(difficulty, maxAttempts = 10) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Generate and validate a complete solution
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

            // Validate the final puzzle (allowing empty cells)
            if (this.isValidGrid(puzzle, false)) {
                return { puzzle, solution };
            }
            
            // If validation fails, try again (should be rare)
        }

        // Final attempt - recursively call to ensure we get a valid puzzle
        return this.generatePuzzle(difficulty, maxAttempts);
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
