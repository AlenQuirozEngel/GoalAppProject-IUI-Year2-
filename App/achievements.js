// Function to retrieve goals from localStorage
function getStoredGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    return goals;
}

// Function to render the progress bars and achievement boxes
function renderAchievements() {
    const achievementList = document.getElementById('achievement-list');
    const goals = getStoredGoals();

    achievementList.innerHTML = ''; // Clear previous entries

    // Render progress bars for goals
    goals.forEach(goal => {
        const progress = goal.progress || 0; // Default progress is 0

        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');

        const label = document.createElement('div');
        label.classList.add('progress-label');
        label.innerHTML = `
            <strong>${goal.name}</strong><br>
            ${progress}% Complete
        `;

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        const progressFill = document.createElement('div');
        progressFill.classList.add('progress-fill');
        progressFill.style.width = `${progress}%`;

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(label);
        progressContainer.appendChild(progressBar);
        achievementList.appendChild(progressContainer);
    });

    // Render achievement boxes (icons can be added later)
    const achievementsSection = document.createElement('div');
    achievementsSection.classList.add('achievements-section');

    const achievement1 = document.createElement('div');
    achievement1.classList.add('achievement-box');
    achievement1.innerHTML = `
        <div class="achievement-icon"></div>
        <p>Hyper-Achiever</p>
        <small>Completed 10 goals</small>
    `;

    const achievement2 = document.createElement('div');
    achievement2.classList.add('achievement-box');
    achievement2.innerHTML = `
        <div class="achievement-icon"></div>
        <p>Dedicated</p>
        <small>Stay on track for 100 days</small>
    `;

    achievementsSection.appendChild(achievement1);
    achievementsSection.appendChild(achievement2);

    // Append the achievements section to the list
    achievementList.appendChild(achievementsSection);
}

// Load achievements on page load
window.onload = function () {
    renderAchievements();
};
