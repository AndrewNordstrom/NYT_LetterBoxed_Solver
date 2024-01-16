# NYT Letterboxed Puzzle Solver
[**More About the Building and Testing of this Project**](https://medium.com/@andrewnord/unboxing-the-puzzle-how-i-mastered-nyt-letterboxed-with-an-algorithm-6fc1cf6519dc)

![Letterboxed Solver Screen Recording](https://github.com/AndrewNordstrom/NYT_LetterBoxed_Solver/assets/89470090/59b46232-5beb-4967-ba71-1839bda679ee)

## Introduction
This project is a web-based application designed to solve the NYT Letterboxed puzzles. Utilizing a combination of Python for backend logic and HTML, CSS, and JavaScript for the frontend, it allows users to find solutions to the daily puzzles or create and solve their own puzzles.

## Features
- **Solve Daily Puzzles**: Find solutions to the NYT's daily Letterboxed puzzles.
- **Create Custom Puzzles**: Build and solve personalized puzzles.
- **Multiple Solution Options**: Offers various solution paths for each puzzle.

## Project Structure
- `Main.py`: The Python backend that implements the puzzle-solving algorithm.
- `index.html`: The main HTML file for the web frontend.
- `script.js`: JavaScript file for frontend interactivity.
- `styles.css`: CSS file for frontend styling.

## Backend Overview (`Main.py`)
The Python backend is essential for solving the puzzles. It includes:
- **Trie Implementation**: Efficient storage and retrieval of words.
- **Puzzle Data Fetching**: Functions to retrieve daily NYT puzzle data.
- **Word List Preparation**: Loading words into the Trie structure.
- **Solution Generation Logic**: Enumerates possible words and solutions based on the puzzle rules.
- **Flask Routes**: Endpoints for puzzle data processing and solution finding.

## Getting Started
### Prerequisites
- Python 3.12
- A modern web browser

### Installation
1. Clone the repository.
2. Install required Python packages.
3. Run `Main.py` to start the backend server.
4. Open `index.html` in your web browser for the frontend.

### Usage
- **Solve Daily Puzzle**: Click on the 'Solve Daily Puzzle' button for a solution.
- **Custom Puzzle**: Enter custom letters and click 'Solve' for solutions.

## Contributing
Contributions are welcome! Please follow the standard fork, branch, commit, and pull request workflow
