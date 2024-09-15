// Function to retrieve goals from localStorage
function getStoredGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    return goals;
}

// Function to render the circular progress bars for each goal
function renderAchievements() {
    const achievementList = document.getElementById('achievement-list');
    const goals = getStoredGoals();

    achievementList.innerHTML = ''; // Clear previous entries

    goals.forEach(goal => {
        const progress = goal.progress || 0; // Default progress is 0

        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');

        const circle = document.createElement('div');
        circle.classList.add('progress-circle');

        const label = document.createElement('div');
        label.classList.add('progress-label');
        label.innerHTML = `
            <strong>${goal.name}</strong><br>
            ${progress}% Complete
        `;

        const progressValue = document.createElement('div');
        progressValue.classList.add('progress-value');
        progressValue.style.background = `conic-gradient(#00ff00 ${progress * 3.6}deg, #eee 0deg)`; // Conic gradient for progress

        progressContainer.appendChild(circle);
        progressContainer.appendChild(progressValue);
        progressContainer.appendChild(label);
        achievementList.appendChild(progressContainer);
    });
}

// Load achievements on page load
window.onload = function () {
    renderAchievements();
};
