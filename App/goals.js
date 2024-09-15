// Add event listener for adding goals
document.getElementById('add-goal-button').addEventListener('click', showGoalForm);

// Function to display the goal input form with a dropdown for category
function showGoalForm() {
    const goalFormHtml = `
        <div id="goal-form">
            <label for="goal-name">Goal Name:</label>
            <input type="text" id="goal-name" placeholder="Enter your goal" required><br>
            
            <label for="category-select">Choose a category:</label>
            <select id="category-select">
                <option value="Fitness/Health">Fitness/Health</option>
                <option value="Academic/Study">Academic/Study</option>
                <option value="Career/Professional">Career/Professional</option>
                <option value="Creative/Personal">Creative/Personal</option>
            </select><br><br>

            <button onclick="addGoal()">Submit Goal</button>
        </div>
    `;
    
    document.getElementById('goal-form-container').innerHTML = goalFormHtml; // Display form in this container
}

// Function to add a new goal with selected category from dropdown
function addGoal() {
    const goalName = document.getElementById('goal-name').value;
    const selectedCategory = document.getElementById('category-select').value;

    if (!goalName) {
        alert("Please enter a goal name.");
        return;
    }

    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const newGoal = {
        name: goalName,
        category: selectedCategory,
        progress: 0
    };

    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));

    renderGoals(); // Update the goal list with the new goal
    document.getElementById('goal-form-container').innerHTML = ''; // Clear form after submission
}

// Function to return the CSS class for a specific category
function getLabelClass(category) {
    switch (category) {
        case "Fitness/Health":
            return 'label-fitness';
        case "Academic/Study":
            return 'label-academic';
        case "Career/Professional":
            return 'label-career';
        case "Creative/Personal":
            return 'label-creative';
        default:
            return '';
    }
}

// Function to render the goals from localStorage
function renderGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const goalList = document.getElementById('goal-list');
    goalList.innerHTML = ''; // Clear the list before rendering

    goals.forEach(goal => {
        const goalItem = document.createElement('div');
        goalItem.className = `goal-item ${getLabelClass(goal.category)}`; // Apply category-specific label class
        goalItem.innerHTML = `<span class="goal-label">${goal.category}</span> ${goal.name}`;
        goalList.appendChild(goalItem);
    });
}

// Load the goals when the page loads
window.onload = function () {
    renderGoals();
};
