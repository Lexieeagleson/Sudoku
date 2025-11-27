/**
 * Sudoku Input Handler
 * Handles touch, mouse, and keyboard interactions
 */

const SudokuInput = {
    /**
     * Initialize the input handler
     * @param {Object} renderer - Reference to the renderer
     * @param {Function} onCellSelect - Callback when a cell is selected
     * @param {Function} onNumberInput - Callback when a number is input
     * @param {Function} onDrag - Callback during drag operations
     */
    init(renderer, onCellSelect, onNumberInput, onDrag) {
        this.renderer = renderer;
        this.onCellSelect = onCellSelect;
        this.onNumberInput = onNumberInput;
        this.onDrag = onDrag;
        
        this.isDragging = false;
        this.draggedCells = new Set();
        this.selectedCell = null;
        this.candidateMode = false;
        this.lockedCandidate = null;
        this.activeNumber = null;

        this.setupEventListeners();
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        const cells = this.renderer.getAllCells();
        
        // Cell event listeners
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = cells[row][col];
                
                // Mouse events
                cell.addEventListener('mousedown', (e) => this.handleCellMouseDown(e, row, col));
                cell.addEventListener('mouseenter', (e) => this.handleCellMouseEnter(e, row, col));
                cell.addEventListener('mouseup', () => this.handleMouseUp());
                
                // Touch events
                cell.addEventListener('touchstart', (e) => this.handleCellTouchStart(e, row, col), { passive: false });
                cell.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
                cell.addEventListener('touchend', () => this.handleTouchEnd());
                
                // Keyboard events
                cell.addEventListener('keydown', (e) => this.handleKeyDown(e, row, col));
            }
        }

        // Global mouse up listener
        document.addEventListener('mouseup', () => this.handleMouseUp());
        document.addEventListener('touchend', () => this.handleTouchEnd());

        // Number pad event listeners
        this.setupNumberPad();
    },

    /**
     * Set up number pad buttons
     */
    setupNumberPad() {
        const numButtons = document.querySelectorAll('.num-btn');
        numButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number, 10);
                this.handleNumberButtonClick(number);
            });
        });
    },

    /**
     * Handle number button click
     * @param {number} number - Number clicked (0 for erase)
     */
    handleNumberButtonClick(number) {
        this.activeNumber = number;
        
        // Update active state on buttons
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.number, 10) === number && number !== 0) {
                btn.classList.add('active');
            }
        });

        // If in candidate mode with locked candidate, update the locked number
        if (this.candidateMode && this.lockedCandidate !== null) {
            this.lockedCandidate = number;
        }

        // If a cell is selected, input the number
        if (this.selectedCell) {
            const { row, col } = this.selectedCell;
            this.onNumberInput(row, col, number);
        }
    },

    /**
     * Handle cell mouse down
     * @param {MouseEvent} e - Mouse event
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellMouseDown(e, row, col) {
        e.preventDefault();
        this.selectCell(row, col);
        
        if (this.candidateMode && this.activeNumber > 0) {
            this.isDragging = true;
            this.draggedCells.clear();
            this.draggedCells.add(`${row},${col}`);
            this.onDrag(row, col, this.activeNumber);
        }
    },

    /**
     * Handle cell mouse enter during drag
     * @param {MouseEvent} e - Mouse event
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellMouseEnter(e, row, col) {
        if (this.isDragging && this.candidateMode && this.activeNumber > 0) {
            const key = `${row},${col}`;
            if (!this.draggedCells.has(key)) {
                this.draggedCells.add(key);
                this.onDrag(row, col, this.activeNumber);
            }
        }
    },

    /**
     * Handle mouse up
     */
    handleMouseUp() {
        this.isDragging = false;
        this.draggedCells.clear();
    },

    /**
     * Handle cell touch start
     * @param {TouchEvent} e - Touch event
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellTouchStart(e, row, col) {
        e.preventDefault();
        this.selectCell(row, col);
        
        if (this.candidateMode && this.activeNumber > 0) {
            this.isDragging = true;
            this.draggedCells.clear();
            this.draggedCells.add(`${row},${col}`);
            this.onDrag(row, col, this.activeNumber);
        }
    },

    /**
     * Handle touch move for drag selection
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        if (!this.isDragging || !this.candidateMode || this.activeNumber <= 0) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('cell')) {
            const row = parseInt(element.dataset.row, 10);
            const col = parseInt(element.dataset.col, 10);
            const key = `${row},${col}`;
            
            if (!this.draggedCells.has(key)) {
                this.draggedCells.add(key);
                this.onDrag(row, col, this.activeNumber);
            }
        }
    },

    /**
     * Handle touch end
     */
    handleTouchEnd() {
        this.isDragging = false;
        this.draggedCells.clear();
    },

    /**
     * Handle keyboard navigation and input
     * @param {KeyboardEvent} e - Keyboard event
     * @param {number} row - Current row
     * @param {number} col - Current column
     */
    handleKeyDown(e, row, col) {
        let newRow = row;
        let newCol = col;

        switch (e.key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                e.preventDefault();
                break;
            case '1': case '2': case '3':
            case '4': case '5': case '6':
            case '7': case '8': case '9':
                this.activeNumber = parseInt(e.key, 10);
                this.updateNumberButtonState();
                this.onNumberInput(row, col, parseInt(e.key, 10));
                e.preventDefault();
                return;
            case 'Backspace':
            case 'Delete':
            case '0':
                this.activeNumber = 0;
                this.updateNumberButtonState();
                this.onNumberInput(row, col, 0);
                e.preventDefault();
                return;
            default:
                return;
        }

        // Navigate to new cell
        if (newRow !== row || newCol !== col) {
            this.selectCell(newRow, newCol);
            const newCell = this.renderer.getCell(newRow, newCol);
            if (newCell) newCell.focus();
        }
    },

    /**
     * Select a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    selectCell(row, col) {
        this.selectedCell = { row, col };
        this.onCellSelect(row, col);
        
        // Focus the cell for keyboard navigation
        const cell = this.renderer.getCell(row, col);
        if (cell) cell.focus();
    },

    /**
     * Update the active state of number buttons
     */
    updateNumberButtonState() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.number, 10) === this.activeNumber && this.activeNumber !== 0) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * Toggle candidate mode
     * @returns {boolean} New candidate mode state
     */
    toggleCandidateMode() {
        this.candidateMode = !this.candidateMode;
        
        if (!this.candidateMode) {
            this.lockedCandidate = null;
        }
        
        return this.candidateMode;
    },

    /**
     * Set candidate mode
     * @param {boolean} enabled - Whether candidate mode is enabled
     */
    setCandidateMode(enabled) {
        this.candidateMode = enabled;
        if (!enabled) {
            this.lockedCandidate = null;
        }
    },

    /**
     * Toggle candidate lock
     * @returns {number|null} Locked candidate number or null
     */
    toggleCandidateLock() {
        if (this.lockedCandidate !== null) {
            this.lockedCandidate = null;
        } else if (this.activeNumber > 0) {
            this.lockedCandidate = this.activeNumber;
        }
        return this.lockedCandidate;
    },

    /**
     * Set locked candidate
     * @param {number|null} number - Number to lock or null to unlock
     */
    setLockedCandidate(number) {
        this.lockedCandidate = number;
    },

    /**
     * Get current candidate mode state
     * @returns {boolean} Whether candidate mode is active
     */
    isCandidateMode() {
        return this.candidateMode;
    },

    /**
     * Get locked candidate number
     * @returns {number|null} Locked candidate or null
     */
    getLockedCandidate() {
        return this.lockedCandidate;
    },

    /**
     * Get the currently active number
     * @returns {number|null} Active number or null
     */
    getActiveNumber() {
        return this.activeNumber;
    },

    /**
     * Get currently selected cell
     * @returns {Object|null} Selected cell position or null
     */
    getSelectedCell() {
        return this.selectedCell;
    },

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedCell = null;
        this.activeNumber = null;
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    },

    /**
     * Update completed number buttons (when all 9 of a number are placed)
     * @param {Object} state - Game state
     */
    updateCompletedNumbers(state) {
        for (let num = 1; num <= 9; num++) {
            const count = SudokuHighlighting.countNumber(num, state);
            const btn = document.querySelector(`.num-btn[data-number="${num}"]`);
            if (btn) {
                if (count >= 9) {
                    btn.classList.add('completed');
                } else {
                    btn.classList.remove('completed');
                }
            }
        }
    }
};
