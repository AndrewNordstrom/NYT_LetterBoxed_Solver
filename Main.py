from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import json
import requests
from bs4 import BeautifulSoup
import re
import time

# Trie implementation for efficient word storage and retrieval
class TrieNode:
    def __init__(self):
        self.children = {}  # Children nodes
        self.end_of_word = False  # Flag to mark the end of a word

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.end_of_word = True

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.end_of_word

    def starts_with(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True

    def query(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return -1  # Word is not present and not a prefix
            node = node.children[char]
        if node.end_of_word:
            return 1  # Word is present
        return 0  # Word is a prefix

# Function to fetch New York Times (NYT) puzzle data
def get_nyt_puzzle_data():
    url = "https://www.nytimes.com/puzzles/letter-boxed"
    response = requests.get(url)
    start = response.text.index("window.gameData") + len("window.gameData = ")
    end = response.text.index(",\"dictionary", start)
    data = json.loads(response.text[start:end] + "}")
    return {
        'ourSolution': data.get('ourSolution', []),
        'sides': data.get('sides', [])
    }

# Function to prepare word list and initialize Trie
def prepare_word_list_and_trie(filepath):
    trie = Trie()
    with open(filepath, 'r') as file:
        for word in file:
            word = word.strip().lower()
            if len(word) > 2:
                trie.insert(word)
    print("Trie created with words from the file.")   
    return trie

# Function to enumerate all possible words given the puzzle faces
def enumerate_words(trie, puzzle_faces):
    possible_words = set()

    def do_search(current_face, current_word):
        for face in range(len(puzzle_faces)):
            if face != current_face:
                for c in puzzle_faces[face]:
                    word = current_word + c
                    query_result = trie.query(word)
                    if query_result == 1:  # Word is valid
                        possible_words.add(word)
                    if query_result >= 0:  # Word is valid or a valid prefix
                        do_search(face, word)

    for face in range(len(puzzle_faces)):
        for c in puzzle_faces[face]:
            do_search(face, c)

    print(f"Possible words enumerated: {len(possible_words)} words found.")
    return possible_words

# Function to sort possible words by length in descending order
def sort_words_by_length(possible_words):
    return sorted(possible_words, key=len, reverse=True)

# Function to create a directed graph with selective complexity
def create_selective_complexity_graph(possible_words):
    sorted_words = sort_words_by_length(possible_words)
    selective_graph = nx.DiGraph()
    for word in sorted_words:
        word_set = set(word)
        selective_graph.add_node(word)
        for other_word in sorted_words:
            if word != other_word and word[-1] == other_word[0]:
                other_word_set = set(other_word)
                if not other_word_set.issubset(word_set):
                    selective_graph.add_edge(word, other_word)
    print(f"Selective Graph created with {len(sorted_words)} nodes and {selective_graph.number_of_edges()} edges.")
    return selective_graph

# Function to check if a word follows the rules of the puzzle
def word_follows_puzzle_rules(word, puzzle_faces):
    used_faces = set()
    for letter in word:
        for i, face in enumerate(puzzle_faces):
            if letter in face:
                if i in used_faces:
                    return False
                used_faces.add(i)
                break
    return True

# Fetching NYT puzzle data for analysis
nyt_data = get_nyt_puzzle_data()
nyt_solution = get_nyt_puzzle_data()  # Retrieve NYT puzzle solution

# Print the NYT solution for debugging purposes
print("NYT Solution for today:", nyt_solution)

# Function to find two-word solutions that use all letters
def find_two_word_solutions(possible_words, all_letters_set):
    solutions = []
    for word1 in possible_words:
        for word2 in possible_words:
            if word1[-1] == word2[0] and set(word1 + word2) == all_letters_set:
                solutions.append([word1, word2])
    return solutions

# Function to find three-word solutions that use all letters
def find_three_word_solutions(possible_words, all_letters_set, max_solutions=10):
    solutions = []
    for word1 in possible_words:
        for word2 in possible_words:
            if word1[-1] == word2[0]:
                for word3 in possible_words:
                    if word2[-1] == word3[0]:
                        combined_word = word1 + word2 + word3
                        if set(combined_word) == all_letters_set:
                            solutions.append([word1, word2, word3])
                            if len(solutions) >= max_solutions:
                                return solutions
    return solutions

# Function to check if a solution matches the NYT puzzle solution
def is_solution_matching_nyt(path, nyt_solution):
    if len(path) != len(nyt_solution):
        return False
    for p_word, nyt_word in zip(path, nyt_solution):
        if p_word.lower() != nyt_word.lower():
            return False
    return True

# Flask application initialization
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for all routes

# Load the word list into the Trie
wordlist_path = "/Users/andrewnordstrom/CSCI 1300/Letterbox python/dictionary.txt"
trie = prepare_word_list_and_trie(wordlist_path)  # Prepare the Trie with the word list

# Route to automatically populate the puzzle with NYT data
@app.route('/populate')
def auto_populate():
    data = get_nyt_puzzle_data()
    return jsonify(data['sides'])

# Route to get letters from the NYT puzzle
@app.route('/nyt-letters')
def nyt_letters():
    data = get_nyt_puzzle_data()
    return jsonify(data)

# Route to solve the puzzle based on input data
@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    print("Received data:", data)

    # Convert letters to lowercase lists for each puzzle face
    puzzle_faces = [list(data['top'].lower()), list(data['right'].lower()), 
                    list(data['bottom'].lower()), list(data['left'].lower())]

    # Enumerate possible words and find solutions
    possible_words = enumerate_words(trie, puzzle_faces)
    all_letters = ''.join([letter for face in puzzle_faces for letter in face])
    all_letters_set = set(all_letters)

    # Find two-word and three-word solutions
    two_word_solutions = find_two_word_solutions(possible_words, all_letters_set)
    three_word_solutions = find_three_word_solutions(possible_words, all_letters_set)

    # Fetch and return NYT solution
    nyt_solution = get_nyt_puzzle_data()

    return jsonify({
        'two_word_solutions': two_word_solutions,
        'three_word_solutions': three_word_solutions,
        'nyt_solution': nyt_solution
    })

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)


