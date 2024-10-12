// Client ID and API key from the Developer Console
var CLIENT_ID = '';
var API_KEY = '';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let googleSignedIn = false;
let currentView = 'month';
let currentDay = new Date().getDate();

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(error => {
        console.error('Error loading Google API:', error);
    });
}

function updateSigninStatus(isSignedIn) {
    googleSignedIn = isSignedIn;
    if (isSignedIn) {
        listUpcomingEvents();
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

function fetchEvents(timeMin, timeMax, viewType, day, month, year) {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': timeMin,
        'timeMax': timeMax,
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
    }).then(response => {
        const events = response.result.items || [];
        
        if (viewType === 'month') {
            displayCalendar(month, year, events);
        } else if (viewType === 'day') {
            displayDailyCalendar(day, month, year, events);
        }
    }).catch(error => {
        console.error('Error fetching events:', error);
    });
}

function listUpcomingEvents() {
    const timeMin = new Date(currentYear, currentMonth, 1).toISOString();
    const timeMax = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();
    fetchEvents(timeMin, timeMax, 'month', null, currentMonth, currentYear);
}

function displayCalendar(month, year, events = []) {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthLabel = document.getElementById('current-month');
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    currentMonthLabel.innerText = `${getMonthName(month)} ${year}`;
    calendarBody.innerHTML = '';

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDayOfMonth) {
                cell.innerHTML = '';
            } else if (date <= daysInMonth) {
                const currentDate = date;
                const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.start.dateTime || event.start.date);
                    return eventDate.getDate() === currentDate && eventDate.getMonth() === month && eventDate.getFullYear() === year;
                });

                cell.innerHTML = `<div>${currentDate}</div>`;
                if (dayEvents.length > 0) {
                    dayEvents.forEach(event => {
                        cell.innerHTML += `<div class="event">${event.summary}</div>`;
                    });
                }

                cell.addEventListener('click', () => {
                    displayDailyCalendar(currentDate, month, year, dayEvents);
                });

                date++;
            } else {
                cell.innerHTML = '';
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
        if (date > daysInMonth) break;
    }
}

function displayDailyCalendar(day, month, year, events = []) {
    currentView = 'day';
    currentDay = day;

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div id="daily-calendar-navigation">
            <button class="nav-btn" onclick="loadCalendar(document.getElementById('main-content'))">Month View</button>
            <button class="nav-btn" onclick="showAddTaskModal()">Add Task</button>
            <button class="nav-btn" onclick="showRemoveTaskModal()">Remove Task</button>
        </div>
        <div id="daily-calendar"></div>
    `;

    const dailyCalendar = document.getElementById('daily-calendar');

    // Get scheduled tasks for the day
    const scheduledTasks = getScheduledTasksForDay(day, month, year);

    const hourBlocks = [];

    for (let hour = 0; hour < 24; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.className = 'hour-block';
        hourBlock.innerHTML = `<div class="hour-label">${hour}:00</div>`;

        const hourEvents = events.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            return eventStart.getHours() === hour && eventStart.getDate() === day;
        });

        const hourTasks = scheduledTasks.filter(task => task.hour === hour);

        if (hourEvents.length > 0 || hourTasks.length > 0) {
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'hour-items';

            hourEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.innerText = `${event.summary} (${new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                itemsContainer.appendChild(eventDiv);
            });

            hourTasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'task-box';
                taskDiv.style.backgroundColor = getCategoryColor(task.category);
                taskDiv.innerText = task.name;
                itemsContainer.appendChild(taskDiv);
            });

            hourBlock.appendChild(itemsContainer);
        }

        dailyCalendar.appendChild(hourBlock);
        hourBlocks.push(hourBlock);
    }

    const customTasks = JSON.parse(localStorage.getItem('customTasks')) || [];
    customTasks.forEach(task => {
        if (task.hour >= 0 && task.hour < 24) {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-box';
            taskDiv.style.backgroundColor = task.color;
            taskDiv.innerText = task.name;
            hourBlocks[task.hour].querySelector('.hour-items').appendChild(taskDiv);
        }
    });
}
function getCategoryColor(category) {
    const colorPreferences = JSON.parse(localStorage.getItem('colorPreferences')) || {};
    return colorPreferences[category] || '#87CEEB'; // Default color if not set
}

function getScheduledTasksForDay(day, month, year) {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const scheduledTasks = [];
    
    goals.forEach(goal => {
        const multiplier = getTaskMultiplier(goal.category);
        const taskCount = Math.floor(Math.random() * 3 * multiplier) + 1; // 1 to 3 tasks, adjusted by multiplier
        
        for (let i = 0; i < taskCount; i++) {
            const hour = Math.floor(Math.random() * 24);
            scheduledTasks.push({
                name: goal.name,
                category: goal.category,
                hour: hour
            });
        }
    });
    
    return scheduledTasks;
}
function loadCalendar(container) {
    currentView = 'month'; // Reset to month view
    container.innerHTML = `
        <table id="calendar-table">
            <thead>
                <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                </tr>
            </thead>
            <tbody id="calendar-body"></tbody>
        </table>
    `;
    if (googleSignedIn) {
        listUpcomingEvents();
    } else {
        displayCalendar(currentMonth, currentYear);
    }
}


function changeDate(direction) {
    if (currentView === 'month') {
        currentMonth += direction;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        const currentMonthLabel = document.getElementById('current-month');
        currentMonthLabel.innerText = `${getMonthName(currentMonth)} ${currentYear}`;
        listUpcomingEvents();
    } else {
        const newDate = new Date(currentYear, currentMonth, currentDay + direction);
        currentDay = newDate.getDate();
        currentMonth = newDate.getMonth();
        currentYear = newDate.getFullYear();

        const currentDayLabel = document.getElementById('current-month');
        currentDayLabel.innerText = `${getMonthName(currentMonth)} ${currentDay}, ${currentYear}`;

        displayDailyCalendar(currentDay, currentMonth, currentYear);
    }
}



function getMonthName(month) {
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
}

function navigateTo(section) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    if (section === 'calendar') {
        loadCalendar(mainContent);
    } else {
        mainContent.innerHTML = `<h2>${section}</h2><p>Content for ${section}</p>`;
    }
}

function toggleMenu() {
    const menuIcon = document.querySelector('.McButton');
    const menu = document.getElementById('burger-menu');
    menuIcon.classList.toggle('active');
    menu.classList.toggle('active');
}

function syncThemeToggle() {
    const body = document.body;
    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.checked = body.classList.contains('dark-mode');
}

function toggleTheme() {
    const body = document.body;
    const toggleInput = document.getElementById('theme-toggle');
    const isDarkMode = toggleInput.checked;
    
    body.classList.toggle('dark-mode', isDarkMode);
    body.classList.toggle('light-mode', !isDarkMode);
    
    localStorage.setItem('modePreference', isDarkMode ? 'dark' : 'light');
    
    updateCalendarTheme();
    updateGoalsTheme();
}

function updateCalendarTheme() {
    const calendarTable = document.getElementById('calendar-table');
    if (calendarTable) {
        calendarTable.classList.toggle('dark-mode');
    }
}

function updateGoalsTheme() {
    const goalsContainer = document.getElementById('goals-container');
    if (goalsContainer) {
        const goalItems = goalsContainer.querySelectorAll('.goal-item');
        goalItems.forEach(item => item.classList.toggle('dark-mode'));
    }
}
function applyTheme() {
    const isDarkMode = localStorage.getItem('modePreference') === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    document.getElementById('theme-toggle').checked = isDarkMode;
    updateCalendarTheme();
    updateGoalsTheme();
}
window.onload = function() {
    handleClientLoad();
    navigateTo('calendar');
    applyModePreference();

    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.addEventListener('change', toggleTheme);

    const burgerMenuButton = document.querySelector('.McButton');
    burgerMenuButton.addEventListener('click', toggleMenu);
};

function applyModePreference() {
    const modePreference = localStorage.getItem('modePreference') || 'light';
    document.body.classList.add(modePreference + '-mode');
    document.getElementById('theme-toggle').checked = (modePreference === 'dark');
}

function resetSurvey() {
    localStorage.removeItem('surveyCompleted');
    localStorage.removeItem('hardestGoal');
    localStorage.removeItem('colorPreference');
    console.log('Survey reset. Refresh the page to see the survey again.');
}

window.onload = function() {
    handleClientLoad();
    navigateTo('calendar');
    syncThemeToggle();

    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.addEventListener('change', toggleTheme);

    const burgerMenuButton = document.querySelector('.McButton');
    burgerMenuButton.addEventListener('click', toggleMenu);
};

document.querySelector('.McButton').addEventListener('click', toggleMenu);

function scheduleGoalTasks() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const favoriteCategory = localStorage.getItem('favoriteGoal');
    const hardestCategory = localStorage.getItem('hardestGoal');
    
    goals.sort((a, b) => b.ranking - a.ranking);
    
    goals.forEach(goal => {
        let priority = goal.ranking / goals.length;
        
        if (goal.category === favoriteCategory) {
            priority += 0.2; // Increase priority for favorite category
        }
        
        if (goal.category === hardestCategory) {
            priority -= 0.1; // Decrease priority for hardest category
        }
        
        if (priority > 0.5) { // Adjust this threshold as needed
            // Schedule task logic here
            // You'll need to implement this based on your calendar data structure
            // Use the 'priority' value to determine how often or when to schedule tasks
        }
    });
}

function getTaskMultiplier(category) {
    const favoriteCategory = localStorage.getItem('favoriteGoal');
    const hardestCategory = localStorage.getItem('hardestGoal');
    
    if (category === favoriteCategory) return 1;
    if (category === hardestCategory) return 0.3;
    return 0.6; // Default multiplier for other categories
}

function showAddTaskModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add Task</h2>
            <select id="task-category">
                ${getGoalOptions()}
                <option value="other">Other</option>
            </select>
            <input type="text" id="task-name" placeholder="Task Name">
            <input type="color" id="task-color" value="#000000">
            <input type="number" id="task-hour" min="0" max="23" placeholder="Hour (0-23)">
            <button onclick="addTask()">Add Task</button>
            <button onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function showRemoveTaskModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Remove Task</h2>
            <select id="remove-task-select">
                ${getTaskOptions()}
            </select>
            <button onclick="removeTask()">Remove Task</button>
            <button onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function getGoalOptions() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    return goals.map(goal => `<option value="${goal.category}">${goal.name}</option>`).join('');
}

function getTaskOptions() {
    const tasks = JSON.parse(localStorage.getItem('customTasks')) || [];
    return tasks.map((task, index) => `<option value="${index}">${task.name}</option>`).join('');
}

function closeModal() {
    document.querySelector('.modal').remove();
}

function addTask() {
    const category = document.getElementById('task-category').value;
    const name = document.getElementById('task-name').value;
    const color = document.getElementById('task-color').value;
    const hour = parseInt(document.getElementById('task-hour').value);

    if (category === 'other') {
        const currentDate = getCurrentDate();
        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || {};
        
        if (!dailyTasks[currentDate]) {
            dailyTasks[currentDate] = [];
        }
        
        dailyTasks[currentDate].push({ name, color, hour });
        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    } else {
        const tasks = JSON.parse(localStorage.getItem('customTasks')) || [];
        tasks.push({ category, name, color, hour });
        localStorage.setItem('customTasks', JSON.stringify(tasks));
    }

    closeModal();
    displayDailyCalendar(currentDay, currentMonth, currentYear);
}function removeTask() {
    const index = document.getElementById('remove-task-select').value;
    const tasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));

    closeModal();
    displayDailyCalendar(currentDay, currentMonth, currentYear);
}

function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}
