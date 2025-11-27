/**
 * Sudoku Timer
 * Handles game timing functionality
 */

const SudokuTimer = {
    /**
     * Initialize the timer
     * @param {HTMLElement} displayElement - Element to show timer
     */
    init(displayElement) {
        this.display = displayElement;
        this.seconds = 0;
        this.intervalId = null;
        this.isRunning = false;
    },

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    },

    /**
     * Stop the timer
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    },

    /**
     * Reset the timer
     */
    reset() {
        this.stop();
        this.seconds = 0;
        this.updateDisplay();
    },

    /**
     * Pause the timer
     */
    pause() {
        this.stop();
    },

    /**
     * Resume the timer
     */
    resume() {
        this.start();
    },

    /**
     * Update the display element
     */
    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.formatTime(this.seconds);
        }
    },

    /**
     * Format seconds into MM:SS or HH:MM:SS
     * @param {number} totalSeconds - Total seconds
     * @returns {string} Formatted time string
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Get the current time
     * @returns {number} Current seconds
     */
    getTime() {
        return this.seconds;
    },

    /**
     * Get formatted current time
     * @returns {string} Formatted time string
     */
    getFormattedTime() {
        return this.formatTime(this.seconds);
    },

    /**
     * Check if timer is running
     * @returns {boolean} Whether timer is running
     */
    isActive() {
        return this.isRunning;
    }
};
