/**
 * Sudoku History Manager
 * Handles undo/redo functionality
 */

const SudokuHistory = {
    /**
     * Initialize the history manager
     * @param {Function} onStateChange - Callback when history state changes
     */
    init(onStateChange) {
        this.undoStack = [];
        this.redoStack = [];
        this.onStateChange = onStateChange;
        this.maxHistory = 100; // Maximum number of states to keep
    },

    /**
     * Save current state to history
     * @param {Object} state - State to save
     */
    saveState(state) {
        // Deep clone the state
        const stateCopy = this.cloneState(state);
        
        this.undoStack.push(stateCopy);
        this.redoStack = []; // Clear redo stack on new action
        
        // Limit history size
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        
        this.onStateChange();
    },

    /**
     * Undo the last action
     * @param {Object} currentState - Current state before undo
     * @returns {Object|null} Previous state or null if no history
     */
    undo(currentState) {
        if (this.undoStack.length === 0) return null;
        
        // Save current state to redo stack
        const currentCopy = this.cloneState(currentState);
        this.redoStack.push(currentCopy);
        
        // Get previous state
        const previousState = this.undoStack.pop();
        
        this.onStateChange();
        return previousState;
    },

    /**
     * Redo the last undone action
     * @param {Object} currentState - Current state before redo
     * @returns {Object|null} Next state or null if no redo history
     */
    redo(currentState) {
        if (this.redoStack.length === 0) return null;
        
        // Save current state to undo stack
        const currentCopy = this.cloneState(currentState);
        this.undoStack.push(currentCopy);
        
        // Get next state
        const nextState = this.redoStack.pop();
        
        this.onStateChange();
        return nextState;
    },

    /**
     * Check if undo is available
     * @returns {boolean} Whether undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    },

    /**
     * Check if redo is available
     * @returns {boolean} Whether redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    },

    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.onStateChange();
    },

    /**
     * Deep clone a game state
     * @param {Object} state - State to clone
     * @returns {Object} Cloned state
     */
    cloneState(state) {
        return {
            userEntries: state.userEntries.map(row => [...row]),
            candidates: state.candidates.map(row => 
                row.map(cell => cell ? new Set(cell) : new Set())
            )
        };
    },

    /**
     * Get the number of available undo steps
     * @returns {number} Number of undo steps
     */
    getUndoCount() {
        return this.undoStack.length;
    },

    /**
     * Get the number of available redo steps
     * @returns {number} Number of redo steps
     */
    getRedoCount() {
        return this.redoStack.length;
    }
};
