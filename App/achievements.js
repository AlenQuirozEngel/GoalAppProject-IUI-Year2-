// Function to retrieve goals from localStorage
function getStoredGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    return goals;
}

const achievementsData = [
    {
        name: "Hyper-Achiever",
        description: "Completed 10 goals",
        iconClass: "achievement-icon-hyper"
    },
    {
        name: "Dedicated",
        description: "Stay on track for 100 days",
        iconClass: "achievement-icon-dedicated"
    },
    {
        name: "Goal Crusher",
        description: "Complete 5 goals in six months",
        iconClass: "achievement-icon-crusher"
    },
    {
        name: "Consistency King",
        description: "Log in for 30 consecutive days",
        iconClass: "achievement-icon-consistency"
    },
    {
        name: "Diversity Champion",
        description: "Set goals in 5 different categories",
        iconClass: "achievement-icon-diversity"
    },
    {
        name: "Overachiever",
        description: "Complete a goal before its deadline",
        iconClass: "achievement-icon-overachiever"
    },
    {
        name: "Milestone Master",
        description: "Reach 50% completion on all active goals",
        iconClass: "achievement-icon-milestone"
    },
    {
        name: "Early Bird",
        description: "Complete a task before 8 AM",
        iconClass: "achievement-icon-early-bird"
    },
    {
        name: "Night Owl",
        description: "Complete a task after 10 PM",
        iconClass: "achievement-icon-night-owl"
    },
    {
        name: "Social Butterfly",
        description: "Share 10 completed goals on social media",
        iconClass: "achievement-icon-social"
    }
];

function renderAchievements() {
    const achievementList = document.getElementById('achievement-list');
    achievementList.innerHTML = ''; // Clear previous entries

    achievementsData.forEach(achievement => {
        const achievementBox = document.createElement('div');
        achievementBox.classList.add('achievement-box');
        achievementBox.innerHTML = `
            <div class="${achievement.iconClass}"></div>
            <p>${achievement.name}</p>
            <small>${achievement.description}</small>
        `;
        achievementList.appendChild(achievementBox);
    });
}

let scheduledLessons = [];
let completedLessons = [];

function renderProgressTrackers() {
    const progressTrackersContainer = document.getElementById('progress-trackers');
    progressTrackersContainer.innerHTML = '';

    const categories = ['Study', 'Work', 'Health', 'Personal'];
    categories.forEach(category => {
        const tracker = createProgressTracker(category);
        progressTrackersContainer.appendChild(tracker);
    });
}

function createProgressTracker(category) {
    const tracker = document.createElement('div');
    tracker.classList.add('progress-tracker');
    
    const progress = calculateProgress(category);
    
    tracker.innerHTML = `
        <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle"
                stroke-dasharray="${progress}, 100"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" class="percentage">${progress}%</text>
        </svg>
        <span class="category-label">${category}</span>
    `;
    
    return tracker;
}

function calculateProgress(category) {
    const totalLessons = scheduledLessons.filter(lesson => lesson.category === category).length;
    const completedCategoryLessons = completedLessons.filter(lesson => lesson.category === category).length;
    return totalLessons > 0 ? Math.round((completedCategoryLessons / totalLessons) * 100) : 0;
}

function scheduleLesson(lesson) {
    scheduledLessons.push(lesson);
    updateProgressTrackers();
}

function completeLesson(lessonId) {
    const lesson = scheduledLessons.find(l => l.id === lessonId);
    if (lesson) {
        completedLessons.push(lesson);
        updateProgressTrackers();
    }
}

function updateProgressTrackers() {
    renderProgressTrackers();
}

// Initialize the page
window.onload = function () {
    renderProgressTrackers();
    renderAchievements();
};
