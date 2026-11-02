#include <iostream>
#include <vector>
#include <fstream>
#include <string>

void print_puzzle(int puzzle[9][9]) {
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            std::cout << puzzle[r][c] << " ";
        }
        std::cout << std::endl;
    }
}

int count_empty(int puzzle[9][9]) {
    int empty = 0;
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (puzzle[r][c] == 0) {
                empty++;
            }
        }
    }
    return empty;
}

bool is_num_present(int puzzle[9][9], int row, int col, int num) {
    bool found = false;

    for (int c = 0; c < 9; c++) {
        if (puzzle[row][c] == num) {
            found = true;
        }
    }

    for (int r = 0; r < 9; r++) {
        if (puzzle[r][col] == num) {
            found = true;
        }
    }

    int row_offset = (row / 3) * 3;
    int col_offset = (col / 3) * 3;

    for (int r = 0; r < 3; r++) {
        for (int c = 0; c < 3; c++) {
            if (puzzle[row_offset + r][col_offset + c] == num) {
                found = true;
            }
        }
    }

    return found;
}

void calculate_possibilities(int puzzle[9][9],
                             std::vector<int> possibilities[9][9]) {
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            possibilities[r][c].clear();

            if (puzzle[r][c] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (!is_num_present(puzzle, r, c, num)) {
                        possibilities[r][c].push_back(num);
                    }
                }
            }
        }
    }
}

int fill_singletons(int puzzle[9][9],
                    std::vector<int> possibilities[9][9]) {
    int inserted = 0;

    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (puzzle[r][c] == 0 && possibilities[r][c].size() == 1) {
                puzzle[r][c] = possibilities[r][c][0];
                inserted++;
            }
        }
    }

    return inserted;
}

bool solve_simple(int puzzle[9][9], bool show_steps = false) {
    std::vector<int> possibilities[9][9];
    int inserted = 1;
    int pass = 0;

    while (count_empty(puzzle) > 0 && inserted > 0) {
        calculate_possibilities(puzzle, possibilities);
        inserted = fill_singletons(puzzle, possibilities);
        pass++;

        if (show_steps) {
            std::cout << "Pass " << pass << ": inserted " << inserted
                      << ", empty " << count_empty(puzzle) << std::endl;
        }
    }

    return count_empty(puzzle) == 0;
}

bool load_puzzle(std::string digits, int puzzle[9][9]) {
    if (digits.size() != 81) {
        return false;
    }

    for (int i = 0; i < 81; i++) {
        if (digits[i] < '0' || digits[i] > '9') {
            return false;
        }
    }

    for (int i = 0; i < 81; i++) {
        int row = i / 9;
        int col = i % 9;
        puzzle[row][col] = digits[i] - '0';
    }
    return true;
}

int main() {
    int classroom[9][9] = {
        {2,8,5, 0,0,0, 0,0,3},
        {1,0,3, 0,9,0, 0,6,4},
        {0,0,6, 7,0,0, 5,0,1},
        {8,0,0, 0,1,2, 0,0,0},
        {0,9,1, 0,0,0, 6,4,2},
        {5,2,0, 3,0,0, 1,0,9},
        {0,5,0, 0,0,4, 7,3,0},
        {0,1,0, 0,8,3, 0,9,0},
        {0,3,8, 6,0,9, 0,0,0}
    };

    std::cout << "Classroom puzzle:" << std::endl;
    print_puzzle(classroom);
    std::cout << "Starting empty cells: " << count_empty(classroom) << std::endl;

    std::vector<int> possibilities[9][9];
    calculate_possibilities(classroom, possibilities);
    std::cout << "Candidates at [0][3]: ";
    for (int num : possibilities[0][3]) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    bool classroomSolved = solve_simple(classroom, true);
    std::cout << "Classroom solved: " << classroomSolved << std::endl;
    std::cout << "Final empty cells: " << count_empty(classroom) << std::endl;
    std::cout << "Complete grid test: " << solve_simple(classroom) << std::endl;
    int empty_grid[9][9] = {};
    std::cout << "Empty grid test (one pass, zero insertions):" << std::endl;
    bool emptySolved = solve_simple(empty_grid, true);
    std::cout << "Empty grid solved: " << emptySolved << std::endl;

    int bad_grid[9][9] = {};
    std::string bad_digits(80, '0');
    bad_digits += 'X';
    std::cout << "Bad digit text accepted: "
              << load_puzzle(bad_digits, bad_grid) << std::endl;

    std::ifstream input("easy.txt");
    if (!input.is_open()) {
        std::cout << "Could not open easy.txt" << std::endl;
        return 1;
    }

    int lines_read = 0;
    int attempted = 0;
    int solved = 0;
    int stalled = 0;
    int malformed = 0;

    std::string line;
    while (std::getline(input, line)) {
        lines_read++;
        int puzzle[9][9] = {};

        if (line.size() < 94) {
            malformed++;
        } else {
            std::string digits = line.substr(13, 81);
            if (!load_puzzle(digits, puzzle)) {
                malformed++;
            } else {
                attempted++;

                if (lines_read == 1) {
                    std::cout << "\nFirst file record starting row: ";
                    for (int c = 0; c < 9; c++) {
                        std::cout << puzzle[0][c] << " ";
                    }
                    std::cout << "\nFirst file record empty cells: "
                              << count_empty(puzzle) << std::endl;
                }

                bool result = solve_simple(puzzle);
                if (result) {
                    solved++;
                } else {
                    stalled++;
                }

                if (lines_read <= 10) {
                    std::cout << "Record " << lines_read << " "
                              << line.substr(0, 12) << " "
                              << (result ? "SOLVED" : "STALLED")
                              << " Empty: " << count_empty(puzzle)
                              << std::endl;
                }
            }
        }
    }
    input.close();

    std::cout << "\nLines read: " << lines_read << std::endl;
    std::cout << "Attempted: " << attempted << std::endl;
    std::cout << "Solved: " << solved << std::endl;
    std::cout << "Stalled: " << stalled << std::endl;
    std::cout << "Malformed: " << malformed << std::endl;

    if (attempted > 0) {
        std::cout << "Percent solved: "
                  << 100.0 * solved / attempted << "%" << std::endl;
    }

    return 0;
}
