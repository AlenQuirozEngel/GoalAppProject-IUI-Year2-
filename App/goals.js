// Store goals in localStorage
let goals = JSON.parse(localStorage.getItem('goals')) || [];
  // Render goals
  function renderGoals() {
      const container = document.getElementById('goals-container');
      container.innerHTML = '';
      const colorPreferences = JSON.parse(localStorage.getItem('colorPreferences')) || {};
    
      goals.forEach((goal, index) => {
          const goalElement = document.createElement('div');
          goalElement.classList.add('goal-item');
          goalElement.style.backgroundColor = colorPreferences[goal.category] || getCategoryColor(goal.category);
          goalElement.innerHTML = `
              <span class="goal-category">${goal.category}</span>
              <span class="goal-name">${goal.name}</span>
              <button class="delete-btn" onclick="deleteGoal(${index})">Delete</button>
          `;
          container.appendChild(goalElement);
      });
  }
// Create a goal element
function createGoalElement(goal, index) {
    const goalElement = document.createElement('div');
    goalElement.classList.add('goal-item');
    goalElement.setAttribute('data-category', goal.category);
    goalElement.draggable = true;
    goalElement.style.backgroundColor = getCategoryColor(goal.category); // Apply category color
    goalElement.innerHTML = `
        <span class="goal-category">${goal.category}</span>
        <span class="goal-name">${goal.name}</span>
        <button class="delete-btn" onclick="deleteGoal(${index})">Delete</button>
    `;
    goalElement.addEventListener('dragstart', dragStart);
    goalElement.addEventListener('dragover', dragOver);
    goalElement.addEventListener('drop', drop);
    return goalElement;
}
// Add a new goal
function addGoal(e) {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const category = document.getElementById('goal-category').value;
    if (name) {
        goals.push({ name, category });
        saveGoals();
        renderGoals();
        document.getElementById('goal-name').value = '';
    }
}

// Delete a goal
function deleteGoal(index) {
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
}

// Drag and drop functionality
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.innerHTML);
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();
    const draggedElement = document.querySelector('.goal-item.dragging');
    const droppedElement = e.target.closest('.goal-item');
    if (draggedElement && droppedElement) {
        const draggedIndex = Array.from(draggedElement.parentNode.children).indexOf(draggedElement);
        const droppedIndex = Array.from(droppedElement.parentNode.children).indexOf(droppedElement);
        [goals[draggedIndex], goals[droppedIndex]] = [goals[droppedIndex], goals[draggedIndex]];
        saveGoals();
        renderGoals();
    }
}

// Save goals to localStorage
function saveGoals() {
    goals.forEach((goal, index) => {
        goal.ranking = goals.length - index;
    });
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        "study": '#4CAF50',    // Green
        "sport": '#2196F3',    // Blue
        "work": '#FFC107',     // Amber
        "health": '#E91E63',   // Pink
        "personal": '#9C27B0', // Purple
        "life-goal": '#FF5722' // Deep Orange
    };
    return colors[category] || '#87CEEB'; // Default color
}

// Initialize goals
document.addEventListener('DOMContentLoaded', () => {
    renderGoals();
    applyTheme();
    document.getElementById('goal-form').addEventListener('submit', addGoal);
    
    // Add drag and drop listeners
    document.addEventListener('dragstart', e => {
        if (e.target.classList.contains('goal-item')) {
            e.target.classList.add('dragging');
        }
    });
    
    document.addEventListener('dragend', e => {
        if (e.target.classList.contains('goal-item')) {
            e.target.classList.remove('dragging');
        }
    });
});

// Sync theme with the toggle on load
function syncThemeToggle() {
    const body = document.body;
    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.checked = body.classList.contains('dark-mode');
}

// Toggle theme between light and dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

// Initialize theme and menu
window.onload = function() {
    syncThemeToggle();
    document.getElementById('theme-toggle').addEventListener('change', toggleTheme);
    document.querySelector('.McButton').addEventListener('click', toggleMenu);
};

// Toggle menu
function toggleMenu() {
    document.querySelector('.McButton').classList.toggle('active');
    document.getElementById('burger-menu').classList.toggle('active');
}

function populateGoalCategoryDropdown() {
    const dropdown = document.getElementById('goal-category');
    dropdown.innerHTML = ''; // Clear existing options
    const categories = [
        { value: 'Personal', color: '#36d1dc' },
        { value: 'Work', color: '#56ab2f' },
        { value: 'Health', color: '#ff7043' },
        { value: 'Education', color: '#f7971e' },
        { value: 'Sport', color: '#9d50bb' },
        { value: 'Life Goal', color: '#FF5722' }
    ];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.value;
        option.style.backgroundColor = category.color;
        option.style.color = 'white';
        dropdown.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    saveColorPreferences();
    populateGoalCategoryDropdown();
    renderGoals();
});
function saveColorPreferences() {
    const colorPreferences = {
        'Personal': '#36d1dc',
        'Work': '#56ab2f',
        'Health': '#ff7043',
        'Education': '#f7971e',
        'Sport': '#9d50bb',
        'Life Goal': '#FF5722'
    };
    localStorage.setItem('colorPreferences', JSON.stringify(colorPreferences));
}
