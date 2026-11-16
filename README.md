# AS Computer Science — C++ Sudoku Solver

A C++17 learning project that explores arrays, loops, functions,
vectors, and file input through a simple Sudoku solver.

## Features

- Display a 9×9 Sudoku grid and count empty cells.
- Find candidate digits using row, column, and 3×3 box constraints.
- Repeatedly fill cells that have exactly one candidate.
- Show progress for a built-in classroom puzzle.
- Read puzzle records from `easy.txt`.
- Report attempted, solved, stalled, and malformed records.

## Project Files

- `main.cpp` — Solver, classroom example, basic checks, and batch processing.
- `easy.txt` — Puzzle records used by the program.
- `CMakeLists.txt` — CMake build configuration.
- `.vscode/` — Editor configuration.

## Build and Run

Requirements: CMake 3.20 or newer and a C++17-compatible compiler.

Run these commands from the repository root:

```sh
cmake -S . -B build
cmake --build build
./build/hello_world
```

The executable is currently named `hello_world`.

Run it from the repository root so that it can find `easy.txt`.
The executable location may differ with other build generators.

## Input Format

The file reader extracts 81 digits starting at character 14
of each record (zero-based offset 13).

- `0` represents an empty cell.
- `1`–`9` represent filled cells.
- The extracted digits describe the grid row by row.

Records that are too short or contain non-digit characters
in the puzzle field are counted as malformed.

## How the Solver Works

1. Calculate candidates for every empty cell.
2. Fill cells with exactly one candidate.
3. Repeat until no empty cells remain or no progress is possible.

## Limitations

- No guessing, backtracking, or advanced solving techniques.
- Some valid puzzles may remain unfinished.
- Input checks validate the digit string, not Sudoku consistency.
- “Solved” currently means that no empty cells remain;
  it is not an independent verification of a valid solution.

## Dataset Attribution

The original source and license of `easy.txt` have not yet
been verified.
