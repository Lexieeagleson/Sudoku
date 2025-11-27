/**
 * Sudoku Highlighting Subsystem
 * Handles intelligent highlighting of rows, columns, subgrids, and matching numbers
 */

const SudokuHighlighting = {
    /**
     * Initialize the highlighting system
     * @param {Object} renderer - Reference to the renderer
     */
    init(renderer) {
        this.renderer = renderer;
    },

    /**
     * Clear all highlights from the grid
     */
    clearHighlights() {
        const cells = this.renderer.getAllCells();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = cells[row][col];
                cell.classList.remove(
                    'highlighted-region',
                    'highlighted-cell',
                    'highlighted-number',
                    'selected',
                    'drag-highlight'
                );
            }
        }
    },

    /**
     * Apply full highlighting for a selected cell
     * @param {number} selectedRow - Row of selected cell
     * @param {number} selectedCol - Column of selected cell
     * @param {number} selectedNumber - Number in the selected cell (or 0)
     * @param {Object} state - Current game state
     */
    applyHighlighting(selectedRow, selectedCol, selectedNumber, state) {
        this.clearHighlights();
        
        if (selectedRow < 0 || selectedCol < 0) return;

        // Apply region highlighting (row, column, subgrid)
        this.highlightRegion(selectedRow, selectedCol);

        // Highlight the selected cell
        const selectedCell = this.renderer.getCell(selectedRow, selectedCol);
        if (selectedCell) {
            selectedCell.classList.add('selected');
        }

        // If a number is selected, highlight all matching numbers
        if (selectedNumber > 0) {
            this.highlightMatchingNumbers(selectedNumber, state);
        }
    },

    /**
     * Highlight the row, column, and subgrid of a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    highlightRegion(row, col) {
        const cells = this.renderer.getAllCells();

        // Highlight row
        for (let c = 0; c < 9; c++) {
            cells[row][c].classList.add('highlighted-region');
        }

        // Highlight column
        for (let r = 0; r < 9; r++) {
            cells[r][col].classList.add('highlighted-region');
        }

        // Highlight 3x3 subgrid
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                cells[r][c].classList.add('highlighted-region');
            }
        }
    },

    /**
     * Highlight all cells containing the specified number
     * @param {number} number - Number to highlight
     * @param {Object} state - Game state containing puzzle data
     */
    highlightMatchingNumbers(number, state) {
        const { puzzle, userEntries, candidates, official } = state;
        const cells = this.renderer.getAllCells();

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = cells[row][col];
                let matches = false;

                // Check official numbers
                if (official[row][col] && puzzle[row][col] === number) {
                    matches = true;
                }
                // Check user-entered numbers
                else if (userEntries[row][col] === number) {
                    matches = true;
                }
                // Check candidates
                else if (candidates[row][col] && candidates[row][col].has(number)) {
                    matches = true;
                    // Also highlight the candidate number itself
                    const candidateSpans = cell.querySelectorAll('.candidate');
                    if (candidateSpans[number - 1]) {
                        candidateSpans[number - 1].classList.add('highlighted');
                    }
                }

                if (matches) {
                    cell.classList.add('highlighted-number');
                }
            }
        }
    },

    /**
     * Highlight a cell during drag operation
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    highlightDragCell(row, col) {
        const cell = this.renderer.getCell(row, col);
        if (cell) {
            cell.classList.add('drag-highlight');
        }
    },

    /**
     * Remove drag highlight from a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    clearDragHighlight(row, col) {
        const cell = this.renderer.getCell(row, col);
        if (cell) {
            cell.classList.remove('drag-highlight');
        }
    },

    /**
     * Get the number in a cell (official, user-entered, or 0)
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Object} state - Game state
     * @returns {number} Number in the cell
     */
    getNumberInCell(row, col, state) {
        const { puzzle, userEntries, official } = state;
        
        if (official[row][col]) {
            return puzzle[row][col];
        }
        if (userEntries[row][col] !== 0) {
            return userEntries[row][col];
        }
        return 0;
    },

    /**
     * Count occurrences of a number on the board
     * @param {number} number - Number to count
     * @param {Object} state - Game state
     * @returns {number} Count of occurrences
     */
    countNumber(number, state) {
        const { puzzle, userEntries, official } = state;
        let count = 0;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (official[row][col] && puzzle[row][col] === number) {
                    count++;
                } else if (userEntries[row][col] === number) {
                    count++;
                }
            }
        }

        return count;
    }
};
