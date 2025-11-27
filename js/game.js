/**
 * Sudoku Game - Main Controller
 * Orchestrates all game components and handles game logic
 */

const SudokuGame = {
    /**
     * Initialize the game
     */
    init() {
        // Game state
        this.state = {
            puzzle: [],           // Original puzzle (with 0s for empty)
            solution: [],         // Complete solution
            userEntries: [],      // User-entered numbers
            candidates: [],       // Candidate numbers for each cell
            official: [],         // Which cells are locked (official puzzle numbers)
            conflicts: [],        // Cells with conflicts
            highlightedNumber: 0, // Currently highlighted number
            difficulty: 'easy',   // Current difficulty
            isComplete: false     // Whether puzzle is solved
        };

        this.selectedRow = -1;
        this.selectedCol = -1;

        // Initialize components
        this.initComponents();
        this.setupEventListeners();
        this.loadTheme();
        
        // Show difficulty modal on first load
        this.showDifficultyModal();
    },

    /**
     * Initialize all game components
     */
    initComponents() {
        // Get DOM elements
        this.gridContainer = document.getElementById('sudoku-grid');
        this.difficultyDisplay = document.getElementById('current-difficulty');
        this.timerDisplay = document.getElementById('timer');
        this.difficultyModal = document.getElementById('difficulty-modal');
        this.winModal = document.getElementById('win-modal');
        this.winTimeDisplay = document.getElementById('win-time-display');

        // Initialize renderer
        SudokuRenderer.init(this.gridContainer);

        // Initialize highlighting
        SudokuHighlighting.init(SudokuRenderer);

        // Initialize input handler
        SudokuInput.init(
            SudokuRenderer,
            (row, col) => this.handleCellSelect(row, col),
            (row, col, number) => this.handleNumberInput(row, col, number),
            (row, col, number) => this.handleDrag(row, col, number)
        );

        // Initialize history
        SudokuHistory.init(() => this.updateHistoryButtons());

        // Initialize timer
        SudokuTimer.init(this.timerDisplay);
    },

    /**
     * Set up event listeners for buttons and modals
     */
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Candidate mode toggle
        document.getElementById('candidate-toggle').addEventListener('click', () => {
            this.toggleCandidateMode();
        });

        // Lock candidate toggle
        document.getElementById('lock-candidate').addEventListener('click', () => {
            this.toggleCandidateLock();
        });

        // Undo/Redo buttons
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });
        document.getElementById('redo-btn').addEventListener('click', () => {
            this.redo();
        });

        // Game action buttons
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.showDifficultyModal();
        });
        document.getElementById('solve-btn').addEventListener('click', () => {
            this.solvePuzzle();
        });
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        // Difficulty modal buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.startNewGame(difficulty);
                this.hideDifficultyModal();
            });
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideDifficultyModal();
        });

        // Win modal
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideWinModal();
            this.showDifficultyModal();
        });

        // Close modals when clicking outside
        this.difficultyModal.addEventListener('click', (e) => {
            if (e.target === this.difficultyModal) {
                this.hideDifficultyModal();
            }
        });

        this.winModal.addEventListener('click', (e) => {
            if (e.target === this.winModal) {
                this.hideWinModal();
            }
        });
    },

    /**
     * Start a new game with the specified difficulty
     * @param {string} difficulty - Difficulty level
     */
    startNewGame(difficulty) {
        this.state.difficulty = difficulty;
        this.difficultyDisplay.textContent = this.formatDifficulty(difficulty);

        // Get a puzzle for the difficulty
        let puzzleData;
        
        // Try to get a pre-defined puzzle first, generate if not available
        if (SudokuPuzzles[difficulty] && SudokuPuzzles[difficulty].length > 0) {
            puzzleData = SudokuPuzzles.getRandomPuzzle(difficulty);
        } else {
            puzzleData = SudokuGenerator.generatePuzzle(difficulty);
        }

        // Initialize game state
        this.state.puzzle = puzzleData.puzzle.map(row => [...row]);
        this.state.solution = puzzleData.solution.map(row => [...row]);
        this.state.userEntries = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.state.candidates = Array.from({ length: 9 }, () => 
            Array.from({ length: 9 }, () => new Set())
        );
        this.state.official = puzzleData.puzzle.map(row => 
            row.map(cell => cell !== 0)
        );
        this.state.conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));
        this.state.isComplete = false;

        // Clear selection and history
        this.selectedRow = -1;
        this.selectedCol = -1;
        SudokuInput.clearSelection();
        SudokuHistory.clear();
        SudokuHighlighting.clearHighlights();

        // Reset and start timer
        SudokuTimer.reset();
        SudokuTimer.start();

        // Update completed numbers
        SudokuInput.updateCompletedNumbers(this.state);

        // Render the grid
        this.render();
    },

    /**
     * Format difficulty name for display
     * @param {string} difficulty - Difficulty key
     * @returns {string} Formatted name
     */
    formatDifficulty(difficulty) {
        const names = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            superhard: 'Super Hard'
        };
        return names[difficulty] || 'Easy';
    },

    /**
     * Handle cell selection
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    handleCellSelect(row, col) {
        this.selectedRow = row;
        this.selectedCol = col;

        // Get the number in the selected cell
        let number = 0;
        if (this.state.official[row][col]) {
            number = this.state.puzzle[row][col];
        } else if (this.state.userEntries[row][col] !== 0) {
            number = this.state.userEntries[row][col];
        }

        this.state.highlightedNumber = number;

        // Apply highlighting
        SudokuHighlighting.applyHighlighting(row, col, number, this.state);
    },

    /**
     * Handle number input from pad or keyboard
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} number - Number to input (0 to erase)
     */
    handleNumberInput(row, col, number) {
        // Don't modify official cells
        if (this.state.official[row][col]) return;

        // Save state for undo
        SudokuHistory.saveState({
            userEntries: this.state.userEntries,
            candidates: this.state.candidates
        });

        if (SudokuInput.isCandidateMode() && number > 0) {
            // Toggle candidate
            this.toggleCandidate(row, col, number);
        } else {
            // Enter number directly
            if (number === 0) {
                this.state.userEntries[row][col] = 0;
            } else {
                this.state.userEntries[row][col] = number;
                this.state.candidates[row][col].clear();
            }
        }

        // Update conflicts
        this.updateConflicts();

        // Update completed numbers
        SudokuInput.updateCompletedNumbers(this.state);

        // Re-render
        this.render();

        // Update highlighting
        if (this.selectedRow >= 0 && this.selectedCol >= 0) {
            const highlightNum = number > 0 ? number : 0;
            SudokuHighlighting.applyHighlighting(
                this.selectedRow, 
                this.selectedCol, 
                highlightNum, 
                this.state
            );
        }

        // Check for completion
        this.checkCompletion();
    },

    /**
     * Handle drag operation in candidate mode
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} number - Candidate number to toggle
     */
    handleDrag(row, col, number) {
        // Don't modify official cells or cells with user entries
        if (this.state.official[row][col]) return;
        if (this.state.userEntries[row][col] !== 0) return;

        // Toggle candidate
        this.toggleCandidate(row, col, number);
        
        // Re-render the specific cell
        this.render();
        
        // Apply highlighting
        SudokuHighlighting.highlightDragCell(row, col);
    },

    /**
     * Toggle a candidate number in a cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {number} number - Candidate number
     */
    toggleCandidate(row, col, number) {
        const candidates = this.state.candidates[row][col];
        if (candidates.has(number)) {
            candidates.delete(number);
        } else {
            candidates.add(number);
        }
    },

    /**
     * Update conflict detection
     */
    updateConflicts() {
        // Reset conflicts
        this.state.conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.getValue(row, col);
                if (value === 0) continue;

                // Check row for duplicates
                for (let c = 0; c < 9; c++) {
                    if (c !== col && this.getValue(row, c) === value) {
                        this.state.conflicts[row][col] = true;
                        this.state.conflicts[row][c] = true;
                    }
                }

                // Check column for duplicates
                for (let r = 0; r < 9; r++) {
                    if (r !== row && this.getValue(r, col) === value) {
                        this.state.conflicts[row][col] = true;
                        this.state.conflicts[r][col] = true;
                    }
                }

                // Check 3x3 box for duplicates
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let r = boxRow; r < boxRow + 3; r++) {
                    for (let c = boxCol; c < boxCol + 3; c++) {
                        if ((r !== row || c !== col) && this.getValue(r, c) === value) {
                            this.state.conflicts[row][col] = true;
                            this.state.conflicts[r][c] = true;
                        }
                    }
                }
            }
        }
    },

    /**
     * Get the value in a cell (official or user-entered)
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {number} Cell value
     */
    getValue(row, col) {
        if (this.state.official[row][col]) {
            return this.state.puzzle[row][col];
        }
        return this.state.userEntries[row][col];
    },

    /**
     * Check if the puzzle is complete and correct
     */
    checkCompletion() {
        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.getValue(row, col) === 0) return;
            }
        }

        // Check if there are any conflicts
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.state.conflicts[row][col]) return;
            }
        }

        // Puzzle is complete!
        this.state.isComplete = true;
        SudokuTimer.stop();
        this.showWinModal();
    },

    /**
     * Check the current solution against the answer
     */
    checkSolution() {
        let hasErrors = false;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.state.official[row][col] && this.state.userEntries[row][col] !== 0) {
                    if (this.state.userEntries[row][col] !== this.state.solution[row][col]) {
                        SudokuRenderer.flashCell(row, col, 'error');
                        hasErrors = true;
                    } else {
                        SudokuRenderer.flashCell(row, col, 'success');
                    }
                }
            }
        }

        if (!hasErrors) {
            // All entered numbers are correct
            console.log('All entries are correct!');
        }
    },

    /**
     * Solve the puzzle automatically
     */
    solvePuzzle() {
        // Fill in all cells with the solution
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.state.official[row][col]) {
                    this.state.userEntries[row][col] = this.state.solution[row][col];
                    this.state.candidates[row][col].clear();
                }
            }
        }

        this.updateConflicts();
        this.render();
        SudokuTimer.stop();
        SudokuInput.updateCompletedNumbers(this.state);
    },

    /**
     * Undo the last action
     */
    undo() {
        const previousState = SudokuHistory.undo({
            userEntries: this.state.userEntries,
            candidates: this.state.candidates
        });

        if (previousState) {
            this.state.userEntries = previousState.userEntries;
            this.state.candidates = previousState.candidates;
            this.updateConflicts();
            this.render();
            SudokuInput.updateCompletedNumbers(this.state);
        }
    },

    /**
     * Redo the last undone action
     */
    redo() {
        const nextState = SudokuHistory.redo({
            userEntries: this.state.userEntries,
            candidates: this.state.candidates
        });

        if (nextState) {
            this.state.userEntries = nextState.userEntries;
            this.state.candidates = nextState.candidates;
            this.updateConflicts();
            this.render();
            SudokuInput.updateCompletedNumbers(this.state);
        }
    },

    /**
     * Update undo/redo button states
     */
    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        undoBtn.disabled = !SudokuHistory.canUndo();
        redoBtn.disabled = !SudokuHistory.canRedo();
    },

    /**
     * Toggle candidate mode
     */
    toggleCandidateMode() {
        const isEnabled = SudokuInput.toggleCandidateMode();
        const btn = document.getElementById('candidate-toggle');
        const lockBtn = document.getElementById('lock-candidate');
        
        if (isEnabled) {
            btn.classList.add('active');
            lockBtn.disabled = false;
        } else {
            btn.classList.remove('active');
            lockBtn.classList.remove('active');
            lockBtn.disabled = true;
        }
    },

    /**
     * Toggle candidate lock
     */
    toggleCandidateLock() {
        const locked = SudokuInput.toggleCandidateLock();
        const btn = document.getElementById('lock-candidate');
        
        if (locked !== null) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    },

    /**
     * Render the current game state
     */
    render() {
        SudokuRenderer.render(this.state);
    },

    /**
     * Show the difficulty selection modal
     */
    showDifficultyModal() {
        this.difficultyModal.classList.add('active');
    },

    /**
     * Hide the difficulty selection modal
     */
    hideDifficultyModal() {
        this.difficultyModal.classList.remove('active');
    },

    /**
     * Show the win celebration modal
     */
    showWinModal() {
        this.winTimeDisplay.textContent = SudokuTimer.getFormattedTime();
        this.winModal.classList.add('active');
    },

    /**
     * Hide the win modal
     */
    hideWinModal() {
        this.winModal.classList.remove('active');
    },

    /**
     * Toggle dark/light theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('sudoku-theme', newTheme);
    },

    /**
     * Load saved theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('sudoku-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SudokuGame.init();
});
