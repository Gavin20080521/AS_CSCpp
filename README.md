# AS_CSC++

C++ coursework, a Sudoku solver, and Java/Python presentation materials.

## Build and run

Requires CMake 3.20 or later and a C++17 compiler. Run from the repository root:

```sh
cmake -S . -B build
cmake --build build
./build/hello_world
```

The executable reads `easy.txt` from the current working directory. The current solver fills cells with a single candidate and can stall on puzzles requiring other techniques.

## Files

- `main.cpp`: Sudoku solver and console checks.
- `easy.txt`: Sudoku input records; the original source and redistribution terms have not been verified.
- `.vscode/`: editor configuration, including a macOS Clang build task.
- `Final_Presentation_source.pptx`: source presentation.
- `speaker-script/`: presentation files and supporting scripts.
- `speech-manuscript/`: speech manuscript and its supporting script.

Build products, rendered previews, and intermediate inspection logs are excluded from version control. Existing presentation and manuscript claims have not been independently reverified as part of this upload.
