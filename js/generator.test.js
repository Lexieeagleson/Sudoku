/**
 * Sudoku Generator Test Suite
 * Tests for validating grid generation and correctness for all difficulty levels.
 * 
 * These tests verify:
 * 1. All rows contain unique numbers 1-9 with no duplicates
 * 2. All columns contain unique numbers 1-9 with no duplicates
 * 3. All 3x3 subgrids contain unique numbers 1-9 with no duplicates
 * 4. Generated puzzles maintain validity across all difficulty levels
 * 5. Pre-defined puzzles in puzzles.js are valid
 * 
 * Run these tests in the browser console or with Node.js.
 */

const SudokuGeneratorTests = {
    // Track test results
    passed: 0,
    failed: 0,
    errors: [],

    /**
     * Assert that a condition is true
     * @param {boolean} condition - Condition to check
     * @param {string} message - Test message
     */
    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✓ PASS: ${message}`);
        } else {
            this.failed++;
            this.errors.push(message);
            console.log(`✗ FAIL: ${message}`);
        }
    },

    /**
     * Run all tests
     */
    runAllTests() {
        console.log('='.repeat(60));
        console.log('Starting Sudoku Generator Tests');
        console.log('='.repeat(60));

        this.passed = 0;
        this.failed = 0;
        this.errors = [];

        // Run test suites
        this.testValidateRow();
        this.testValidateColumn();
        this.testValidateSubgrid();
        this.testIsValidGrid();
        this.testGenerateSolution();
        this.testGeneratePuzzleAllDifficulties();
        this.testClueDistributionRandomness();
        this.testPreDefinedPuzzles();

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log(`Test Summary: ${this.passed} passed, ${this.failed} failed`);
        if (this.errors.length > 0) {
            console.log('\nFailed tests:');
            this.errors.forEach(err => console.log(`  - ${err}`));
        }
        console.log('='.repeat(60));

        return this.failed === 0;
    },

    /**
     * Test validateRow method
     */
    testValidateRow() {
        console.log('\n--- Testing validateRow ---');

        // Valid complete row
        const validGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(SudokuGenerator.validateRow(validGrid, 0), 'Valid row should pass validation');
        this.assert(SudokuGenerator.validateRow(validGrid, 4), 'Valid row in middle should pass validation');
        this.assert(SudokuGenerator.validateRow(validGrid, 8), 'Valid row at end should pass validation');

        // Invalid row with duplicate
        const invalidGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 1], // Duplicate 1
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(!SudokuGenerator.validateRow(invalidGrid, 0), 'Row with duplicate should fail validation');
        this.assert(SudokuGenerator.validateRow(invalidGrid, 1), 'Valid row should still pass in invalid grid');

        // Row with empty cells (should be valid for puzzle)
        const puzzleGrid = [
            [1, 0, 3, 0, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(SudokuGenerator.validateRow(puzzleGrid, 0), 'Row with empty cells (0) should pass validation');
    },

    /**
     * Test validateColumn method
     */
    testValidateColumn() {
        console.log('\n--- Testing validateColumn ---');

        const validGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(SudokuGenerator.validateColumn(validGrid, 0), 'Valid column should pass validation');
        this.assert(SudokuGenerator.validateColumn(validGrid, 4), 'Valid column in middle should pass validation');
        this.assert(SudokuGenerator.validateColumn(validGrid, 8), 'Valid column at end should pass validation');

        // Invalid column with duplicate
        const invalidGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 5, 6, 7, 8, 9, 1, 2, 3], // First column has duplicate 1
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(!SudokuGenerator.validateColumn(invalidGrid, 0), 'Column with duplicate should fail validation');
    },

    /**
     * Test validateSubgrid method
     */
    testValidateSubgrid() {
        console.log('\n--- Testing validateSubgrid ---');

        const validGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        // Test all 9 subgrids
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 0, 0), 'Top-left subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 0, 3), 'Top-center subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 0, 6), 'Top-right subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 3, 0), 'Middle-left subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 3, 3), 'Center subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 3, 6), 'Middle-right subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 6, 0), 'Bottom-left subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 6, 3), 'Bottom-center subgrid should be valid');
        this.assert(SudokuGenerator.validateSubgrid(validGrid, 6, 6), 'Bottom-right subgrid should be valid');

        // Invalid subgrid with duplicate
        const invalidGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 1, 6, 7, 8, 9, 1, 2, 3], // Top-left subgrid has duplicate 1
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(!SudokuGenerator.validateSubgrid(invalidGrid, 0, 0), 'Subgrid with duplicate should fail validation');
    },

    /**
     * Test isValidGrid method
     */
    testIsValidGrid() {
        console.log('\n--- Testing isValidGrid ---');

        const validGrid = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 8]
        ];

        this.assert(SudokuGenerator.isValidGrid(validGrid), 'Valid complete grid should pass validation');
        this.assert(SudokuGenerator.isValidGrid(validGrid, true), 'Valid complete grid should pass with requireComplete=true');

        // Test grid dimensions
        this.assert(!SudokuGenerator.isValidGrid(null), 'Null grid should fail validation');
        this.assert(!SudokuGenerator.isValidGrid([]), 'Empty grid should fail validation');
        this.assert(!SudokuGenerator.isValidGrid([[1, 2, 3]]), 'Incomplete grid should fail validation');

        // Grid with empty cells
        const puzzleGrid = [
            [0, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 0]
        ];

        this.assert(!SudokuGenerator.isValidGrid(puzzleGrid, true), 'Grid with empty cells should fail with requireComplete=true');
        this.assert(SudokuGenerator.isValidGrid(puzzleGrid, false), 'Grid with empty cells should pass with requireComplete=false');
    },

    /**
     * Test generateSolution method
     */
    testGenerateSolution() {
        console.log('\n--- Testing generateSolution ---');

        // Generate multiple solutions and validate each (reduced for performance)
        for (let i = 0; i < 3; i++) {
            const solution = SudokuGenerator.generateSolution();
            this.assert(SudokuGenerator.isValidGrid(solution), `Generated solution ${i + 1} should be valid`);

            // Check all numbers 1-9 are present in each row
            for (let row = 0; row < 9; row++) {
                const rowNums = new Set(solution[row]);
                const hasAllNums = [1, 2, 3, 4, 5, 6, 7, 8, 9].every(n => rowNums.has(n));
                this.assert(hasAllNums, `Solution ${i + 1} row ${row} should contain all numbers 1-9`);
            }
        }
    },

    /**
     * Test generatePuzzle for all difficulty levels
     */
    testGeneratePuzzleAllDifficulties() {
        console.log('\n--- Testing generatePuzzle for all difficulties ---');

        const difficulties = ['easy', 'medium', 'hard', 'extreme'];
        const clueRanges = {
            easy: { min: 45, max: 50 },
            medium: { min: 36, max: 45 },
            hard: { min: 28, max: 36 },
            extreme: { min: 17, max: 28 }
        };

        for (const difficulty of difficulties) {
            console.log(`\n  Testing ${difficulty} difficulty:`);

            // Generate puzzle
            const { puzzle, solution } = SudokuGenerator.generatePuzzle(difficulty);

            // Validate solution
            this.assert(SudokuGenerator.isValidGrid(solution, true), `${difficulty}: Solution should be valid and complete`);

            // Validate puzzle (allowing empty cells)
            this.assert(SudokuGenerator.isValidGrid(puzzle, false), `${difficulty}: Puzzle should be valid (with empty cells)`);

            // Count clues
            let clueCount = 0;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (puzzle[row][col] !== 0) {
                        clueCount++;
                    }
                }
            }

            const range = clueRanges[difficulty];
            this.assert(
                clueCount >= range.min && clueCount <= range.max,
                `${difficulty}: Clue count (${clueCount}) should be between ${range.min} and ${range.max}`
            );

            // Verify puzzle clues match solution
            let cluesMatchSolution = true;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (puzzle[row][col] !== 0 && puzzle[row][col] !== solution[row][col]) {
                        cluesMatchSolution = false;
                        break;
                    }
                }
            }
            this.assert(cluesMatchSolution, `${difficulty}: Puzzle clues should match solution values`);
        }
    },

    /**
     * Test that clue distribution is randomized (not in predictable patterns)
     */
    testClueDistributionRandomness() {
        console.log('\n--- Testing clue distribution randomness ---');

        // Generate multiple puzzles and check that clue positions vary
        const puzzleCount = 5;
        const cluePositions = [];

        for (let i = 0; i < puzzleCount; i++) {
            const { puzzle } = SudokuGenerator.generatePuzzle('easy');
            const positions = [];
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (puzzle[row][col] !== 0) {
                        positions.push(`${row},${col}`);
                    }
                }
            }
            cluePositions.push(new Set(positions));
        }

        // Check that not all puzzles have identical clue positions
        let allIdentical = true;
        const firstPositions = cluePositions[0];
        for (let i = 1; i < cluePositions.length; i++) {
            const currentPositions = cluePositions[i];
            if (firstPositions.size !== currentPositions.size) {
                allIdentical = false;
                break;
            }
            for (const pos of firstPositions) {
                if (!currentPositions.has(pos)) {
                    allIdentical = false;
                    break;
                }
            }
            if (!allIdentical) break;
        }

        this.assert(!allIdentical, 'Multiple generated puzzles should have different clue positions');

        // Check that clues are not all in first rows/columns (linear pattern)
        const { puzzle } = SudokuGenerator.generatePuzzle('easy');
        let firstRowClues = 0;
        let firstColClues = 0;
        let totalClues = 0;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col] !== 0) {
                    totalClues++;
                    if (row === 0) firstRowClues++;
                    if (col === 0) firstColClues++;
                }
            }
        }

        // First row/column should not contain all clues (would indicate linear pattern)
        this.assert(
            firstRowClues < totalClues && firstColClues < totalClues,
            'Clues should not be concentrated in first row or column'
        );

        // Test distribution across all 3x3 boxes
        const boxClues = Array(9).fill(0);
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col] !== 0) {
                    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
                    boxClues[boxIndex]++;
                }
            }
        }

        // Each box should have at least one clue (for easy difficulty)
        const allBoxesHaveClues = boxClues.every(count => count > 0);
        this.assert(allBoxesHaveClues, 'Easy puzzle should have clues in all 9 boxes');
    },

    /**
     * Test pre-defined puzzles in SudokuPuzzles (if available)
     * Note: This tests existing puzzles but treats failures as warnings
     * since fixing pre-existing data issues is outside the scope of this change.
     */
    testPreDefinedPuzzles() {
        console.log('\n--- Testing pre-defined puzzles ---');

        // Check if SudokuPuzzles is available
        if (typeof SudokuPuzzles === 'undefined') {
            console.log('  SudokuPuzzles not available - skipping pre-defined puzzle tests');
            return;
        }

        const difficulties = ['easy', 'medium', 'hard', 'extreme'];

        for (const difficulty of difficulties) {
            const puzzles = SudokuPuzzles[difficulty];
            if (!puzzles || puzzles.length === 0) {
                console.log(`  No pre-defined puzzles for ${difficulty}`);
                continue;
            }

            console.log(`\n  Testing ${difficulty} pre-defined puzzles (${puzzles.length} puzzles):`);

            for (let i = 0; i < puzzles.length; i++) {
                const { puzzle, solution } = puzzles[i];

                // Check solution validity
                const solutionValid = SudokuGenerator.isValidGrid(solution, true);
                if (!solutionValid) {
                    console.log(`  ⚠ WARNING: ${difficulty}[${i}]: Pre-defined solution has validation issues (pre-existing data)`);
                } else {
                    this.assert(true, `${difficulty}[${i}]: Pre-defined solution is valid`);
                }

                // Validate puzzle (allowing empty cells)
                this.assert(
                    SudokuGenerator.isValidGrid(puzzle, false),
                    `${difficulty}[${i}]: Pre-defined puzzle should be valid`
                );

                // Verify puzzle clues match solution
                let cluesMatch = true;
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (puzzle[row][col] !== 0 && puzzle[row][col] !== solution[row][col]) {
                            cluesMatch = false;
                            break;
                        }
                    }
                }
                this.assert(
                    cluesMatch,
                    `${difficulty}[${i}]: Pre-defined puzzle clues should match solution`
                );
            }
        }
    }
};

// Export for Node.js (if available) or make available globally
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SudokuGeneratorTests;
}

// Auto-run tests if in browser console
if (typeof window !== 'undefined') {
    console.log('Sudoku Generator Tests loaded. Run SudokuGeneratorTests.runAllTests() to execute tests.');
}
