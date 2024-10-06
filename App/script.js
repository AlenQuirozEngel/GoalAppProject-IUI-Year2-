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
        </div>
        <div id="daily-calendar"></div>
    `;

    const dailyCalendar = document.getElementById('daily-calendar');

    for (let hour = 0; hour < 24; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.className = 'hour-block';
        hourBlock.innerHTML = `<div class="hour-label">${hour}:00</div>`;

        const hourEvents = events.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            return eventStart.getHours() === hour && eventStart.getDate() === day;
        });

        if (hourEvents.length > 0) {
            hourEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.innerText = `${event.summary} (${new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                hourBlock.appendChild(eventDiv);
            });
        }

        dailyCalendar.appendChild(hourBlock);
    }
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
