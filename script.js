// Add event listener to the Enter button for click events
document.querySelector('.btn-enter').addEventListener('click', enterButtonHandler);

// Initialize variable to track the currently focused input field
let currentFocusedInput = null;

// Add event listeners to each side input field
document.querySelectorAll('.side-input').forEach(input => {
    input.addEventListener('input', inputHandler); // Listen for input changes
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            enterButtonHandler(); // Trigger enter button functionality on Enter key press
        }
    });
    input.addEventListener('focus', function(event) {
        currentFocusedInput = event.target; // Update the currently focused input
    });
});

// Function to handle input events
function inputHandler(event) {
    // For demonstration, log the input values to the console
    console.log(`Input for ${event.target.id}: ${event.target.value}`);
}

// Function to handle the Enter button click
function enterButtonHandler() {
    console.log("Enter button clicked");

    // Retrieve input values from all four sides
    const topInput = document.getElementById('top-input').value;
    const rightInput = document.getElementById('right-input').value;
    const bottomInput = document.getElementById('bottom-input').value;
    const leftInput = document.getElementById('left-input').value;

    // Prepare data object for POST request
    const data = { top: topInput, right: rightInput, bottom: bottomInput, left: leftInput };
    console.log("Sending data to server:", data);

    // Send POST request to server with input data
    const apiUrl = 'http://127.0.0.1:5000'; // Development URL
    // const apiUrl = 'https://yourproductionurl.com'; // Production URL

    fetch(`${apiUrl}/solve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Solution:', data);
        displaySolution(data); // Call function to display the solution
    })
    .catch(error => console.error('Error:', error));
}

// Add event listener to the Restart button for click events
document.querySelector('.btn-restart').addEventListener('click', restartButtonHandler);

// Function to handle the Restart button click
function restartButtonHandler() {
    // Clear all input fields and reset placeholder texts
    document.querySelectorAll('.side-input').forEach(input => {
        input.value = ''; // Clear the value of the input field
        input.placeholder = input.getAttribute('data-placeholder'); // Reset placeholder text
    });

    // Clear content in the solution area
    const solutionArea = document.getElementById('solution-area');
    solutionArea.innerHTML = ''; // Empty the solution area

    // Clear any letters displayed in the puzzle area
    const letters = document.querySelectorAll('.letter');
    letters.forEach(letter => letter.textContent = ''); // Remove text content from each letter

    console.log("Puzzle reset"); // Log the reset action for debugging
}

// Add event listener to the Delete button for click events
document.querySelector('.btn-delete').addEventListener('click', deleteButtonHandler);

// Function to handle the Delete button click
function deleteButtonHandler() {
    // Check if there is a focused input and if it has content
    if (currentFocusedInput && currentFocusedInput.value.length > 0) {
        // Remove the last character from the current input
        currentFocusedInput.value = currentFocusedInput.value.slice(0, -1);
        updateCirclesWithInput(); // Update the puzzle display with the new input value
    }

    // Reset placeholder if the input field is empty
    if (currentFocusedInput && currentFocusedInput.value.length === 0) {
        currentFocusedInput.placeholder = currentFocusedInput.getAttribute('data-placeholder');
    }
}

// Add event listener to the Auto Populate button for click events
document.getElementById('autoPopulate').addEventListener('click', function() {
    // Fetch data for auto population
    fetch('http://127.0.0.1:5000/populate')
        .then(response => response.json())
        .then(sides => {
            // Check if the response contains data for all four sides
            if (sides.length === 4) {
                // Populate each input field with the corresponding data
                document.getElementById('top-input').value = sides[0];
                document.getElementById('right-input').value = sides[1];
                document.getElementById('bottom-input').value = sides[2];
                document.getElementById('left-input').value = sides[3];
                updateCirclesWithInput(); // Update puzzle display with the new input
            } else {
                console.error('Error fetching data for auto population');
            }
        })
        .catch(error => console.error('Autofill Error:', error));
});

// Function to update the puzzle display based on input values
function updateCirclesWithInput() {
    // Retrieve input values from each side and split into individual letters
    const topLetters = document.getElementById('top-input').value.toUpperCase().split('');
    const rightLetters = document.getElementById('right-input').value.toUpperCase().split('');
    const bottomLetters = document.getElementById('bottom-input').value.toUpperCase().split('');
    const leftLetters = document.getElementById('left-input').value.toUpperCase().split('');

    // Call function to set letters for each side of the puzzle
    setSideLetters('.top-side', topLetters);
    setSideLetters('.right-side', rightLetters);
    setSideLetters('.bottom-side', bottomLetters);
    setSideLetters('.left-side', leftLetters);
}

// Function to set letters for a specific side of the puzzle
function setSideLetters(sideClass, letters) {
    // Select the side container and all tile elements within it
    const side = document.querySelector(sideClass);
    const tiles = side.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        // Select the letter element within the tile
        const letter = tile.querySelector('.letter');
        // Set the letter content or clear it if no letter is available
        letter.textContent = letters[index] || '';
    });
}

// Function to display the solution in the solution area
function displaySolution(data) {
    const solutionArea = document.getElementById('solution-area');
    solutionArea.innerHTML = ''; // Clear any existing content in the solution area

    // Display the solution from the NYT data
    const nytSolutionTitle = document.createElement('h3');
    nytSolutionTitle.textContent = 'NYT Solution';
    solutionArea.appendChild(nytSolutionTitle);
    const nytSolutionText = document.createElement('p');
    nytSolutionText.textContent = data.nyt_solution.ourSolution.join(', ');
    solutionArea.appendChild(nytSolutionText);

    // Display two-word solutions
    const twoWordTitle = document.createElement('h3');
    twoWordTitle.textContent = 'Two-Word Solutions';
    solutionArea.appendChild(twoWordTitle);
    createSolutionList(data.two_word_solutions, solutionArea);

    // Display three-word solutions
    const threeWordTitle = document.createElement('h3');
    threeWordTitle.textContent = 'Three-Word Solutions';
    solutionArea.appendChild(threeWordTitle);
    createSolutionList(data.three_word_solutions, solutionArea);

    // Scroll to the solution area for better visibility
    if (solutionArea) {
        solutionArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Function to create a list of solutions and append it to a container
function createSolutionList(solutions, container) {
    const list = document.createElement('ul'); // Create a new list element
    solutions.forEach(solution => {
        const item = document.createElement('li'); // Create a new list item for each solution
        item.textContent = solution.join(', '); // Join the solution words with commas
        list.appendChild(item); // Add the item to the list
    });
    container.appendChild(list); // Add the list to the container
}

// Add event listeners for focus and blur events on input fields
document.querySelectorAll('.side-input').forEach(input => {
    input.addEventListener('focus', function(event) {
        event.target.placeholder = ''; // Clear the placeholder text on focus
    });
    input.addEventListener('blur', function(event) {
        if (event.target.value === '') {
            // Reset placeholder if the input is empty on losing focus
            event.target.placeholder = event.target.getAttribute('data-placeholder');
        }
    });
    input.addEventListener('input', updateCirclesWithInput); // Update puzzle display as user types
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            enterButtonHandler(); // Trigger enter handler on Enter key press
        }
    });
});

// Set the current date on the page after it loads
document.addEventListener('DOMContentLoaded', function() {
    const currentDateElement = document.getElementById('current-date'); // Select the current date element
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    currentDateElement.textContent = currentDate; // Set the text content to the current date
});




  
  

  