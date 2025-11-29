/**
 * Sudoku Hint Solver
 * Analyzes the puzzle to find cells where we can explain why a specific number is correct
 * Uses common solving techniques like Naked Singles and Hidden Singles
 */

const SudokuHints = {
    /**
     * Find a hint with an explanation
     * @param {Object} state - Current game state
     * @returns {Object|null} Hint object with row, col, number, technique, and explanation
     */
    findHint(state) {
        const { puzzle, userEntries, official, solution } = state;
        
        // Build a grid of current values
        const grid = this.buildCurrentGrid(state);
        
        // Calculate possible candidates for each empty cell
        const candidates = this.calculateCandidates(grid);
        
        // Try to find a hint using solving techniques
        // Order from easiest to explain to hardest
        
        // 1. Naked Single - cell has only one possible candidate
        let hint = this.findNakedSingle(grid, candidates, state);
        if (hint) return hint;
        
        // 2. Hidden Single in Row - number can only go in one place in a row
        hint = this.findHiddenSingleInRow(grid, candidates, state);
        if (hint) return hint;
        
        // 3. Hidden Single in Column - number can only go in one place in a column
        hint = this.findHiddenSingleInColumn(grid, candidates, state);
        if (hint) return hint;
        
        // 4. Hidden Single in Box - number can only go in one place in a 3x3 box
        hint = this.findHiddenSingleInBox(grid, candidates, state);
        if (hint) return hint;
        
        // If no logical hint found, fall back to providing a random cell with basic explanation
        return this.findFallbackHint(state);
    },
    
    /**
     * Build the current grid combining puzzle and user entries
     * @param {Object} state - Game state
     * @returns {Array} 9x9 grid with current values (0 for empty)
     */
    buildCurrentGrid(state) {
        const grid = [];
        for (let row = 0; row < 9; row++) {
            grid[row] = [];
            for (let col = 0; col < 9; col++) {
                if (state.official[row][col]) {
                    grid[row][col] = state.puzzle[row][col];
                } else if (state.userEntries[row][col] !== 0) {
                    grid[row][col] = state.userEntries[row][col];
                } else {
                    grid[row][col] = 0;
                }
            }
        }
        return grid;
    },
    
    /**
     * Calculate all possible candidates for empty cells
     * @param {Array} grid - Current 9x9 grid
     * @returns {Array} 9x9 grid of Sets containing possible numbers
     */
    calculateCandidates(grid) {
        const candidates = [];
        for (let row = 0; row < 9; row++) {
            candidates[row] = [];
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) {
                    candidates[row][col] = new Set();
                } else {
                    candidates[row][col] = this.getCandidatesForCell(grid, row, col);
                }
            }
        }
        return candidates;
    },
    
    /**
     * Get possible candidates for a specific cell
     * @param {Array} grid - Current grid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Set} Set of possible numbers
     */
    getCandidatesForCell(grid, row, col) {
        const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Remove numbers in same row
        for (let c = 0; c < 9; c++) {
            candidates.delete(grid[row][c]);
        }
        
        // Remove numbers in same column
        for (let r = 0; r < 9; r++) {
            candidates.delete(grid[r][col]);
        }
        
        // Remove numbers in same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                candidates.delete(grid[r][c]);
            }
        }
        
        return candidates;
    },
    
    /**
     * Find a Naked Single - a cell with only one possible candidate
     * @param {Array} grid - Current grid
     * @param {Array} candidates - Candidates for each cell
     * @param {Object} state - Game state
     * @returns {Object|null} Hint object or null
     */
    findNakedSingle(grid, candidates, state) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0 && candidates[row][col].size === 1) {
                    const number = [...candidates[row][col]][0];
                    
                    // Verify against solution
                    if (state.solution[row][col] !== number) continue;
                    
                    // Build explanation of which numbers are eliminated and why
                    const eliminatedBy = this.getEliminationDetails(grid, row, col);
                    
                    return {
                        row,
                        col,
                        number,
                        technique: 'Naked Single',
                        explanation: this.buildNakedSingleExplanation(row, col, number, eliminatedBy)
                    };
                }
            }
        }
        return null;
    },
    
    /**
     * Get details about which numbers are eliminated by row, column, and box
     * @param {Array} grid - Current grid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object} Object with elimination details
     */
    getEliminationDetails(grid, row, col) {
        const byRow = new Set();
        const byCol = new Set();
        const byBox = new Set();
        
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] !== 0) byRow.add(grid[row][c]);
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] !== 0) byCol.add(grid[r][col]);
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] !== 0) byBox.add(grid[r][c]);
            }
        }
        
        return { byRow, byCol, byBox };
    },
    
    /**
     * Build explanation for Naked Single technique
     */
    buildNakedSingleExplanation(row, col, number, eliminatedBy) {
        const rowNum = row + 1;
        const colNum = col + 1;
        
        let explanation = `This cell at Row ${rowNum}, Column ${colNum} can only be <strong>${number}</strong>.\n\n`;
        explanation += `<strong>Why?</strong> Looking at this cell:\n`;
        
        if (eliminatedBy.byRow.size > 0) {
            explanation += `• Row ${rowNum} already has: ${[...eliminatedBy.byRow].sort((a,b) => a-b).join(', ')}\n`;
        }
        if (eliminatedBy.byCol.size > 0) {
            explanation += `• Column ${colNum} already has: ${[...eliminatedBy.byCol].sort((a,b) => a-b).join(', ')}\n`;
        }
        if (eliminatedBy.byBox.size > 0) {
            explanation += `• The 3×3 box already has: ${[...eliminatedBy.byBox].sort((a,b) => a-b).join(', ')}\n`;
        }
        
        explanation += `\nAfter eliminating all these numbers, only <strong>${number}</strong> remains as a possibility!`;
        
        return explanation;
    },
    
    /**
     * Find a Hidden Single in a row - number can only go in one place in the row
     * @param {Array} grid - Current grid
     * @param {Array} candidates - Candidates for each cell
     * @param {Object} state - Game state
     * @returns {Object|null} Hint object or null
     */
    findHiddenSingleInRow(grid, candidates, state) {
        for (let row = 0; row < 9; row++) {
            for (let num = 1; num <= 9; num++) {
                // Check if number is already in row
                let alreadyInRow = false;
                for (let c = 0; c < 9; c++) {
                    if (grid[row][c] === num) {
                        alreadyInRow = true;
                        break;
                    }
                }
                if (alreadyInRow) continue;
                
                // Find all cells in row where this number is a candidate
                const possibleCols = [];
                for (let col = 0; col < 9; col++) {
                    if (candidates[row][col].has(num)) {
                        possibleCols.push(col);
                    }
                }
                
                // If only one cell can have this number, it's a Hidden Single
                if (possibleCols.length === 1) {
                    const col = possibleCols[0];
                    
                    // Skip if this is also a Naked Single (would be found by that technique)
                    if (candidates[row][col].size === 1) continue;
                    
                    // Verify against solution
                    if (state.solution[row][col] !== num) continue;
                    
                    return {
                        row,
                        col,
                        number: num,
                        technique: 'Hidden Single (Row)',
                        explanation: this.buildHiddenSingleRowExplanation(row, col, num, candidates)
                    };
                }
            }
        }
        return null;
    },
    
    /**
     * Build explanation for Hidden Single in Row
     */
    buildHiddenSingleRowExplanation(row, col, number, candidates) {
        const rowNum = row + 1;
        const colNum = col + 1;
        
        let explanation = `The number <strong>${number}</strong> must go in Row ${rowNum}, Column ${colNum}.\n\n`;
        explanation += `<strong>Why?</strong> In Row ${rowNum}, the number ${number} must appear somewhere.\n\n`;
        explanation += `Looking at each empty cell in this row:\n`;
        
        for (let c = 0; c < 9; c++) {
            if (candidates[row][c].size > 0) {
                if (c === col) {
                    explanation += `• Column ${c + 1}: ${number} is possible ✓\n`;
                } else if (!candidates[row][c].has(number)) {
                    explanation += `• Column ${c + 1}: ${number} is blocked\n`;
                }
            }
        }
        
        explanation += `\nThis is the only cell in Row ${rowNum} where <strong>${number}</strong> can go!`;
        
        return explanation;
    },
    
    /**
     * Find a Hidden Single in a column
     * @param {Array} grid - Current grid
     * @param {Array} candidates - Candidates for each cell
     * @param {Object} state - Game state
     * @returns {Object|null} Hint object or null
     */
    findHiddenSingleInColumn(grid, candidates, state) {
        for (let col = 0; col < 9; col++) {
            for (let num = 1; num <= 9; num++) {
                // Check if number is already in column
                let alreadyInCol = false;
                for (let r = 0; r < 9; r++) {
                    if (grid[r][col] === num) {
                        alreadyInCol = true;
                        break;
                    }
                }
                if (alreadyInCol) continue;
                
                // Find all cells in column where this number is a candidate
                const possibleRows = [];
                for (let row = 0; row < 9; row++) {
                    if (candidates[row][col].has(num)) {
                        possibleRows.push(row);
                    }
                }
                
                // If only one cell can have this number, it's a Hidden Single
                if (possibleRows.length === 1) {
                    const row = possibleRows[0];
                    
                    // Skip if this is also a Naked Single
                    if (candidates[row][col].size === 1) continue;
                    
                    // Verify against solution
                    if (state.solution[row][col] !== num) continue;
                    
                    return {
                        row,
                        col,
                        number: num,
                        technique: 'Hidden Single (Column)',
                        explanation: this.buildHiddenSingleColExplanation(row, col, num, candidates)
                    };
                }
            }
        }
        return null;
    },
    
    /**
     * Build explanation for Hidden Single in Column
     */
    buildHiddenSingleColExplanation(row, col, number, candidates) {
        const rowNum = row + 1;
        const colNum = col + 1;
        
        let explanation = `The number <strong>${number}</strong> must go in Row ${rowNum}, Column ${colNum}.\n\n`;
        explanation += `<strong>Why?</strong> In Column ${colNum}, the number ${number} must appear somewhere.\n\n`;
        explanation += `Looking at each empty cell in this column:\n`;
        
        for (let r = 0; r < 9; r++) {
            if (candidates[r][col].size > 0) {
                if (r === row) {
                    explanation += `• Row ${r + 1}: ${number} is possible ✓\n`;
                } else if (!candidates[r][col].has(number)) {
                    explanation += `• Row ${r + 1}: ${number} is blocked\n`;
                }
            }
        }
        
        explanation += `\nThis is the only cell in Column ${colNum} where <strong>${number}</strong> can go!`;
        
        return explanation;
    },
    
    /**
     * Find a Hidden Single in a 3x3 box
     * @param {Array} grid - Current grid
     * @param {Array} candidates - Candidates for each cell
     * @param {Object} state - Game state
     * @returns {Object|null} Hint object or null
     */
    findHiddenSingleInBox(grid, candidates, state) {
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const startRow = boxRow * 3;
                const startCol = boxCol * 3;
                
                for (let num = 1; num <= 9; num++) {
                    // Check if number is already in box
                    let alreadyInBox = false;
                    for (let r = startRow; r < startRow + 3; r++) {
                        for (let c = startCol; c < startCol + 3; c++) {
                            if (grid[r][c] === num) {
                                alreadyInBox = true;
                                break;
                            }
                        }
                        if (alreadyInBox) break;
                    }
                    if (alreadyInBox) continue;
                    
                    // Find all cells in box where this number is a candidate
                    const possibleCells = [];
                    for (let r = startRow; r < startRow + 3; r++) {
                        for (let c = startCol; c < startCol + 3; c++) {
                            if (candidates[r][c].has(num)) {
                                possibleCells.push({ row: r, col: c });
                            }
                        }
                    }
                    
                    // If only one cell can have this number, it's a Hidden Single
                    if (possibleCells.length === 1) {
                        const { row, col } = possibleCells[0];
                        
                        // Skip if this is also a Naked Single
                        if (candidates[row][col].size === 1) continue;
                        
                        // Verify against solution
                        if (state.solution[row][col] !== num) continue;
                        
                        return {
                            row,
                            col,
                            number: num,
                            technique: 'Hidden Single (Box)',
                            explanation: this.buildHiddenSingleBoxExplanation(row, col, num, candidates, startRow, startCol)
                        };
                    }
                }
            }
        }
        return null;
    },
    
    /**
     * Build explanation for Hidden Single in Box
     */
    buildHiddenSingleBoxExplanation(row, col, number, candidates, boxStartRow, boxStartCol) {
        const rowNum = row + 1;
        const colNum = col + 1;
        
        let explanation = `The number <strong>${number}</strong> must go in Row ${rowNum}, Column ${colNum}.\n\n`;
        explanation += `<strong>Why?</strong> In this 3×3 box, the number ${number} must appear somewhere.\n\n`;
        explanation += `Looking at each empty cell in this box:\n`;
        
        for (let r = boxStartRow; r < boxStartRow + 3; r++) {
            for (let c = boxStartCol; c < boxStartCol + 3; c++) {
                if (candidates[r][c].size > 0) {
                    if (r === row && c === col) {
                        explanation += `• Row ${r + 1}, Col ${c + 1}: ${number} is possible ✓\n`;
                    } else if (!candidates[r][c].has(number)) {
                        explanation += `• Row ${r + 1}, Col ${c + 1}: ${number} is blocked\n`;
                    }
                }
            }
        }
        
        explanation += `\nThis is the only cell in the box where <strong>${number}</strong> can go!`;
        
        return explanation;
    },
    
    /**
     * Find a fallback hint when no logical technique is found
     * @param {Object} state - Game state
     * @returns {Object|null} Hint object or null
     */
    findFallbackHint(state) {
        // Find an empty cell and provide the answer with a basic explanation
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!state.official[row][col] && state.userEntries[row][col] === 0) {
                    const number = state.solution[row][col];
                    const grid = this.buildCurrentGrid(state);
                    const eliminatedBy = this.getEliminationDetails(grid, row, col);
                    
                    return {
                        row,
                        col,
                        number,
                        technique: 'Process of Elimination',
                        explanation: this.buildFallbackExplanation(row, col, number, eliminatedBy)
                    };
                }
            }
        }
        return null;
    },
    
    /**
     * Build fallback explanation
     */
    buildFallbackExplanation(row, col, number, eliminatedBy) {
        const rowNum = row + 1;
        const colNum = col + 1;
        
        let explanation = `The answer for Row ${rowNum}, Column ${colNum} is <strong>${number}</strong>.\n\n`;
        explanation += `<strong>Hint:</strong> This requires more advanced techniques, but here's what we know:\n\n`;
        
        if (eliminatedBy.byRow.size > 0) {
            explanation += `• Row ${rowNum} has: ${[...eliminatedBy.byRow].sort((a,b) => a-b).join(', ')}\n`;
        }
        if (eliminatedBy.byCol.size > 0) {
            explanation += `• Column ${colNum} has: ${[...eliminatedBy.byCol].sort((a,b) => a-b).join(', ')}\n`;
        }
        if (eliminatedBy.byBox.size > 0) {
            explanation += `• The 3×3 box has: ${[...eliminatedBy.byBox].sort((a,b) => a-b).join(', ')}\n`;
        }
        
        explanation += `\nThe remaining numbers must be determined through chain logic or other advanced techniques.`;
        
        return explanation;
    }
};
