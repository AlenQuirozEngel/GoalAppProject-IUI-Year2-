// Client ID and API key from the Developer Console
var CLIENT_ID = '';
var API_KEY = '';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let googleSignedIn = false;

// Initialize the Google API
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

// Fetch events from Google Calendar for the current month
function listUpcomingEvents() {
    const timeMin = new Date(currentYear, currentMonth, 1).toISOString();
    const timeMax = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': timeMin,
        'timeMax': timeMax,
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
    }).then(response => {
        const events = response.result.items || [];
        displayCalendar(currentMonth, currentYear, events);
    }).catch(error => {
        console.error('Error fetching events:', error);
    });
}

// Display the calendar for the current month with events
function displayCalendar(month, year, events = []) {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthLabel = document.getElementById('current-month');
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    currentMonthLabel.innerText = `${getMonthName(month)} ${year}`;
    calendarBody.innerHTML = ''; // Clear previous calendar content

    let date = 1;
    for (let i = 0; i < 6; i++) { // Maximum 6 rows for weeks
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) { // 7 days in a week
            const cell = document.createElement('td');
            if (i === 0 && j < firstDayOfMonth) {
                cell.innerHTML = ''; // Empty cells before the first day
            } else if (date <= daysInMonth) {
                const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.start.dateTime || event.start.date);
                    return eventDate.getDate() === date && eventDate.getMonth() === month && eventDate.getFullYear() === year;
                });
                cell.innerHTML = `<div>${date}</div>`;
                if (dayEvents.length > 0) {
                    dayEvents.forEach(event => {
                        cell.innerHTML += `<div class="event">${event.summary}</div>`;
                    });
                }
                date++;
            } else {
                cell.innerHTML = ''; // Empty cells after the last day
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
        if (date > daysInMonth) break;
    }
}

// Function to load the calendar
function loadCalendar(container) {
    container.innerHTML = `
        <div id="calendar-navigation">
            <button onclick="changeMonth(-1)">Previous Month</button>
            <h2 id="current-month"></h2>
            <button onclick="changeMonth(1)">Next Month</button>
        </div>
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
        displayCalendar(currentMonth, currentYear); // Display empty calendar if not signed in
    }
}

// Function to change the current month
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadCalendar(document.getElementById('main-content'));
}

// Helper function to get the month name
function getMonthName(month) {
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
}

// Load default view on page load
window.onload = function() {
    handleClientLoad();
    navigateTo('calendar');
};

// Navigation between sections
function navigateTo(section) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // Clear previous content

    if (section === 'calendar') {
        loadCalendar(mainContent);
    } else {
        mainContent.innerHTML = `<h2>${section}</h2><p>Content for ${section}</p>`;
    }
}

// Toggle burger menu visibility
function toggleMenu() {
    const menu = document.getElementById('burger-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}
