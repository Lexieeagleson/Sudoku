/**
 * Sudoku Grid Renderer
 * Handles rendering of the Sudoku grid, cells, and their contents
 */

const SudokuRenderer = {
    /**
     * Initialize the renderer
     * @param {HTMLElement} container - Container element for the grid
     */
    init(container) {
        this.container = container;
        this.cells = [];
        this.createGrid();
    },

    /**
     * Create the 9x9 Sudoku grid
     */
    createGrid() {
        this.container.innerHTML = '';
        this.cells = [];

        for (let row = 0; row < 9; row++) {
            const rowCells = [];
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.tabIndex = 0;
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}`);
                
                this.container.appendChild(cell);
                rowCells.push(cell);
            }
            this.cells.push(rowCells);
        }
    },

    /**
     * Render the puzzle state
     * @param {Object} state - Current game state
     * @param {boolean} instantCheckEnabled - Whether instant check is enabled
     */
    render(state, instantCheckEnabled = true) {
        this.instantCheckEnabled = instantCheckEnabled;
        const { puzzle, userEntries, candidates, official } = state;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.cells[row][col];
                this.renderCell(cell, row, col, state);
            }
        }
    },

    /**
     * Render a single cell
     * @param {HTMLElement} cell - Cell element
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {Object} state - Game state
     */
    renderCell(cell, row, col, state) {
        const { puzzle, userEntries, candidates, official, conflicts } = state;
        
        // Clear previous content and classes
        cell.innerHTML = '';
        cell.classList.remove('official', 'user-entered', 'error');
        
        // Check if it's an official (locked) cell
        if (official[row][col]) {
            cell.classList.add('official');
            cell.textContent = puzzle[row][col];
            cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}, official number ${puzzle[row][col]}`);
        }
        // Check if user has entered a number
        else if (userEntries[row][col] !== 0) {
            // Only add user-entered class (green color) when instant check is enabled
            if (this.instantCheckEnabled) {
                cell.classList.add('user-entered');
            }
            cell.textContent = userEntries[row][col];
            cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}, your entry ${userEntries[row][col]}`);
            
            // Check for conflicts - only show error styling when instant check is enabled
            if (this.instantCheckEnabled && conflicts && conflicts[row][col]) {
                cell.classList.add('error');
            }
        }
        // Check for candidates
        else if (candidates[row][col] && candidates[row][col].size > 0) {
            this.renderCandidates(cell, candidates[row][col], state.highlightedNumber);
            cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}, candidates: ${Array.from(candidates[row][col]).join(', ')}`);
        }
        else {
            cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}, empty`);
        }
    },

    /**
     * Render candidate numbers in a cell
     * @param {HTMLElement} cell - Cell element
     * @param {Set} candidateSet - Set of candidate numbers
     * @param {number} highlightedNumber - Currently highlighted number
     */
    renderCandidates(cell, candidateSet, highlightedNumber) {
        const candidatesContainer = document.createElement('div');
        candidatesContainer.className = 'candidates';
        
        for (let num = 1; num <= 9; num++) {
            const candidateSpan = document.createElement('span');
            candidateSpan.className = 'candidate';
            
            if (candidateSet.has(num)) {
                candidateSpan.textContent = num;
                if (highlightedNumber === num) {
                    candidateSpan.classList.add('highlighted');
                }
            }
            
            candidatesContainer.appendChild(candidateSpan);
        }
        
        cell.appendChild(candidatesContainer);
    },

    /**
     * Get cell element at position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {HTMLElement} Cell element
     */
    getCell(row, col) {
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            return this.cells[row][col];
        }
        return null;
    },

    /**
     * Get cell position from element
     * @param {HTMLElement} cell - Cell element
     * @returns {Object} Position object with row and col
     */
    getCellPosition(cell) {
        return {
            row: parseInt(cell.dataset.row, 10),
            col: parseInt(cell.dataset.col, 10)
        };
    },

    /**
     * Get all cell elements
     * @returns {Array} 2D array of cell elements
     */
    getAllCells() {
        return this.cells;
    },

    /**
     * Flash a cell to indicate success or error
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {string} type - 'success' or 'error'
     */
    flashCell(row, col, type) {
        const cell = this.getCell(row, col);
        if (!cell) return;

        cell.style.transition = 'background-color 0.3s ease';
        const originalBg = window.getComputedStyle(cell).backgroundColor;
        
        if (type === 'success') {
            cell.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
        } else if (type === 'error') {
            cell.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
        }

        setTimeout(() => {
            cell.style.backgroundColor = '';
        }, 300);
    }
};
