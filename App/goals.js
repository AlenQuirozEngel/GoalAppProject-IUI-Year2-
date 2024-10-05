// Add event listener to "Add Goal" button
document.getElementById('add-goal-btn').addEventListener('click', showGoalForm);
const goals = JSON.parse(localStorage.getItem('goals')) || [];
// // Function to show color slider when "Other" is selected
// function showSlider(value) {
//     const slider = document.getElementById('color-slider');
//     slider.style.display = value === 'Other' ? 'block' : 'none';
// }

// Function to display the goal input form
function showGoalForm() {
    const goalFormHtml = `
        <div id="goal-form">
            <label for="goal-name">Goal Name:</label>
            <input type="text" id="goal-name" placeholder="Enter your goal" required><br>
            
            <label for="category-select">Choose a category:</label>
            <select id="category-select" onchange="showSlider(this.value)">
                <option value="Academic/Study">Academic/Study</option>
                <option value="Fitness">Fitness</option>
                <option value="Health">Health</option>
                <option value="Career/Professional">Career/Professional</option>
                <option value="Creative/Personal">Creative/Personal</option>
                <option value="Other">Other (Select a color)</option>
            </select><br><br>

            <div id="color-slider" style="display:none;">
                <label for="color-hue">Select Color:</label>
                <input type="range" id="color-hue" min="0" max="360" value="180">
            </div><br>

            <button class="green-btn" onclick="addGoal()">Submit Goal</button>
        </div>
    `;
    document.getElementById('goal-form-container').innerHTML = goalFormHtml;
}


// Function to add a new goal and save to localStorage
function addGoal() {
    const goalName = document.getElementById('goal-name').value;
    const selectedCategory = document.getElementById('category-select').value;
    let goalColor = '';

    if (selectedCategory === 'Other') {
        const hue = document.getElementById('color-hue').value;
        goalColor = `hsl(${hue}, 100%, 70%)`; // Generate color based on slider
    }

    if (!goalName) {
        alert("Please enter a goal name.");
        return;
    }

    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const newGoal = {
        name: goalName,
        category: selectedCategory,
        color: goalColor || '', // Assign the color if it's "Other"
        id: Date.now(),
        rank: goals.length < 6 ? goals.length + 1 : null // Assign rank if less than 6 ranked goals
    };

    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));

    renderGoals(); // Render updated goal list
    document.getElementById('goal-form-container').innerHTML = ''; // Clear form after submission
}

let removeMode = false;
let draggedItem = null;

// Function to add event listener to "Remove Goal" button
document.getElementById('remove-goal-btn').addEventListener('click', activateRemoveMode);

// Activate remove mode and display message
function activateRemoveMode() {
    if (!removeMode) {
        removeMode = true;
        const message = document.createElement('div');
        message.id = 'remove-message';
        message.innerText = 'Click on the goal you want to delete.';
        document.body.appendChild(message);
    } else {
        removeMode = false;
        const message = document.getElementById('remove-message');
        if (message) message.remove();
    }
}

// Function to render the goals list
function renderGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];

    // Clear the current lists
    const rankedGoalList = document.getElementById('ranked-goal-list');
    const unrankedGoalList = document.getElementById('unranked-goal-list');
    rankedGoalList.innerHTML = '';
    unrankedGoalList.innerHTML = '';

    if (goals.length === 0) {
        rankedGoalList.innerHTML = '<p>No goals ranked yet.</p>';
        unrankedGoalList.innerHTML = '<p>No unranked goals available.</p>';
        return;
    }

    const rankedGoals = goals.filter(goal => goal.rank !== null).sort((a, b) => a.rank - b.rank);
    const unrankedGoals = goals.filter(goal => goal.rank === null);

    rankedGoals.forEach(goal => {
        const goalItem = createGoalItem(goal);
        rankedGoalList.appendChild(goalItem);
    });

    unrankedGoals.forEach(goal => {
        const goalItem = createGoalItem(goal);
        unrankedGoalList.appendChild(goalItem);
    });
}

// Create goal item HTML element
function createGoalItem(goal) {
    const goalItem = document.createElement('div');
    goalItem.className = 'goal-item';
    goalItem.style.backgroundColor = goal.color;
    goalItem.innerHTML = `<span>${goal.name} (${goal.category})</span>`;

    // Make goal items draggable
    goalItem.setAttribute('draggable', true);
    goalItem.dataset.id = goal.id;

    // Add drag event listeners
    goalItem.addEventListener('dragstart', dragStart);
    goalItem.addEventListener('dragover', dragOver);
    goalItem.addEventListener('drop', drop);

    // Prevent click event if dragging
    let isDragging = false;
    goalItem.addEventListener('dragstart', () => isDragging = true);
    goalItem.addEventListener('dragend', () => isDragging = false);

    // Click event for removing goal
    goalItem.addEventListener('click', (event) => {
        if (!isDragging && removeMode) {
            if (confirm('Are you sure you want to remove this goal?')) {
                removeGoal(goal.id);
            }
        }
    });

    return goalItem;
}

// Drag and Drop handlers
function dragStart(event) {
    draggedItem = event.target;
}

function dragOver(event) {
    event.preventDefault(); // Allow the item to be dropped
}

function drop(event) {
    event.preventDefault();
    const targetItem = event.target.closest('.goal-item');
    if (targetItem && draggedItem !== targetItem) {
        const draggedId = draggedItem.dataset.id;
        const targetId = targetItem.dataset.id;

        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const draggedGoal = goals.find(g => g.id == draggedId);
        const targetGoal = goals.find(g => g.id == targetId);

        // Swap ranks only if both items are ranked
        if (draggedGoal.rank !== null && targetGoal.rank !== null) {
            [draggedGoal.rank, targetGoal.rank] = [targetGoal.rank, draggedGoal.rank];
        }

        // Sort and save
        goals.sort((a, b) => (a.rank || 999) - (b.rank || 999)); // Rank unranked goals at the end
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }
}

// Remove goal from localStorage
function removeGoal(goalId) {
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    goals = goals.filter(goal => goal.id !== goalId);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals(); // Re-render the goal list after removal
}


// Helper function to return category color
function getCategoryColor(category) {
    switch (category) {
        case "Academic/Study": return '#36d1dc';
        case "Fitness": return '#56ab2f';
        case "Health": return '#ff7043';
        case "Career/Professional": return '#f7971e';
        case "Creative/Personal": return '#9d50bb';
        default: return '#87CEEB'; // Default blue color for other categories
    }
}

// Sync theme with the toggle on load
function syncThemeToggle() {
    const body = document.body;
    const toggleInput = document.getElementById('theme-toggle');

    // Sync the toggle with the current mode
    if (body.classList.contains('dark-mode')) {
        toggleInput.checked = true;
    } else {
        toggleInput.checked = false;
    }
}

// Toggle theme between light and dark mode
function toggleTheme() {
    const body = document.body;
    const themeToggleCheckbox = document.getElementById('theme-toggle');

    // Switch between light and dark modes
    if (themeToggleCheckbox.checked) {
        body.classList.replace('light-mode', 'dark-mode');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
    }
}

window.onload = function() {
    try {
        renderGoals(); // This should load goals immediately when the page loads.
    } catch (error) {
        console.error("Error rendering goals on page load:", error);
    }

    document.getElementById('add-goal-btn').addEventListener('click', showGoalForm);
    syncThemeToggle(); // Sync theme toggle switch state with the page mode

    // Add event listener for the theme toggle switch
    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.addEventListener('change', toggleTheme);

    // Add event listener for the burger menu
    const burgerMenuButton = document.querySelector('.McButton');
    burgerMenuButton.addEventListener('click', toggleMenu);
};
