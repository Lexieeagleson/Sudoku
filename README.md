# Sudoku Game

A fully functional, interactive web-based Sudoku game with clean UI, large readable fonts, advanced candidate mode, intelligent grid highlighting, and four difficulty levels.

![Sudoku Game](https://img.shields.io/badge/game-sudoku-blue)

## Features

### Core Features
- **Standard 9×9 Grid**: Bold borders around each 3×3 subgrid with large, legible fonts
- **Visual Distinctions**: Clear visual difference between official puzzle numbers, user-entered numbers, and candidate (pencil) numbers
- **Four Difficulty Levels**:
  - Easy (45-50 clues)
  - Medium (35-44 clues)
  - Hard (27-34 clues)
  - Super Hard (17-26 clues)

### Candidate Mode
- Toggle pencil/candidate mode to enter multiple possible numbers in a cell
- **Drag Selection**: In candidate mode, drag across multiple cells to quickly add candidates

### Intelligent Highlighting
- **Number Highlighting**: Tap any number to highlight all matching numbers across the board
- **Region Highlighting**: Soft overlay highlights the entire row, column, and 3×3 subgrid of the selected cell
- **Color-blind Friendly**: Carefully chosen color palette with good contrast

### Additional Features
- **Undo/Redo**: Full history support for all moves
- **Conflict Detection**: Visual highlighting of invalid numbers (duplicates in row/column/box)
- **Timer**: Track how long it takes to solve each puzzle
- **Dark Mode**: Toggle between light and dark themes (respects system preference)
- **Puzzle Solver**: Automatically solve the current puzzle
- **Progress Check**: Verify your current entries against the solution

## Running Locally

### Option 1: Open directly in browser
Simply open `index.html` in any modern web browser:
- Double-click the `index.html` file, or
- Right-click and select "Open with" your preferred browser

### Option 2: Using a local server (recommended)
For the best experience, serve the files using a local server:

**Using Python 3:**
```bash
cd /path/to/Sudoku
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node.js (with http-server):**
```bash
npm install -g http-server
cd /path/to/Sudoku
http-server
```
Then open `http://localhost:8080` in your browser.

**Using VS Code Live Server:**
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"

## How to Play

1. **Start a New Game**: Click "New Game" and select your difficulty level
2. **Select a Cell**: Click or tap on any cell to select it
3. **Enter a Number**: Click a number (1-9) on the number pad or use keyboard keys
4. **Erase**: Click the ⌫ button or press Backspace/Delete
5. **Candidate Mode**: 
   - Click "Candidate Mode" to toggle pencil marks
   - With candidate mode on, numbers become candidates instead of final answers
   - Drag across cells to quickly add candidates
6. **Check Progress**: Click "Check" to verify your current entries
7. **Solve**: Click "Solve" to reveal the complete solution

### Keyboard Controls
- **Arrow Keys**: Navigate between cells
- **1-9**: Enter number in selected cell
- **0/Backspace/Delete**: Erase cell contents

## Project Structure

```
Sudoku/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles including dark mode
├── js/
│   ├── puzzles.js      # Pre-defined puzzles for all difficulty levels
│   ├── generator.js    # Puzzle generation and solving algorithms
│   ├── renderer.js     # Grid rendering engine
│   ├── highlighting.js # Highlighting subsystem (row, column, subgrid, numbers)
│   ├── input.js        # Input handling (touch, mouse, keyboard, drag)
│   ├── history.js      # Undo/redo system
│   ├── timer.js        # Game timer
│   └── game.js         # Main game controller
└── README.md           # This file
```

## Technical Details

- **Pure JavaScript**: No external dependencies or frameworks required
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch Support**: Full touch and drag support for mobile devices
- **Modular Architecture**: Clean separation of concerns with documented modules
- **Accessible**: Keyboard navigation and ARIA labels for screen readers

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
