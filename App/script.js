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

let currentView = 'month'; // 'month' for month view, 'day' for day view
let currentDay = new Date().getDate(); // Track the current day for day view

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

// generic Fetch events from Google Calendar for the current month/day
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
            displayCalendar(month, year, events); // For month view
        } else if (viewType === 'day') {
            displayDailyCalendar(day, month, year, events); // For day view
        }
    }).catch(error => {
        console.error('Error fetching events:', error);
    });
}

function listUpcomingEvents() {
    const timeMin = new Date(currentYear, currentMonth, 1).toISOString();
    const timeMax = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

    fetchEvents(timeMin, timeMax, 'month', null, currentMonth, currentYear); // Fetch events for the month
}



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
                const currentDate = date; // Capture the correct date for each cell
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

                // Add event listener to switch to daily view on day click
                cell.addEventListener('click', () => {
                    displayDailyCalendar(currentDate, month, year, dayEvents);
                });

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

function displayDailyCalendar(day, month, year, events = []) {
    currentView = 'day'; // Switch to day view
    currentDay = day; // Track the current day


    const mainContent = document.getElementById('main-content');


    mainContent.innerHTML = `
        <div id="daily-calendar-navigation">
        <button class="nav-btn" onclick="loadCalendar(document.getElementById('main-content'))">Month View</button>
    </div>
    <div id="daily-calendar"></div>
    `;

    const dailyCalendar = document.getElementById('daily-calendar');

    // Create 24-hour time slots
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

// Function to load the calendar
function loadCalendar(container) {
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
        displayCalendar(currentMonth, currentYear); // Display empty calendar if not signed in
    }
}


// Function to change the current month
// General function to handle both month and day changes
function changeDate(direction) {
    if (currentView === 'month') {
        // Handle month change
        currentMonth += direction;
        
        // Adjust year if necessary
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        // Update the displayed month and reload the calendar
        const currentMonthLabel = document.getElementById('current-month');
        currentMonthLabel.innerText = `${getMonthName(currentMonth)} ${currentYear}`;
        loadCalendar(document.getElementById('main-content'));

    } else if (currentView === 'day') {
        // Handle day change
        const newDate = new Date(currentYear, currentMonth, currentDay + direction);
        currentDay = newDate.getDate();
        currentMonth = newDate.getMonth();
        currentYear = newDate.getFullYear();

        // Update the displayed day
        const currentDayLabel = document.getElementById('current-month');
        currentDayLabel.innerText = `${getMonthName(currentMonth)} ${currentDay}, ${currentYear}`;

        // Reload the daily view with the new day
        listDailyEvents(currentDay, currentMonth, currentYear);
    }
}


// Helper function to get the month name
function getMonthName(month) {
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
}

// Load default view and sync theme on page load
window.onload = function() {
    handleClientLoad();  // Initialize Google API and calendar
    navigateTo('calendar');
    syncThemeToggle();   // Sync theme state with toggle switch

    // Add event listener for the theme toggle switch
    const toggleInput = document.querySelector('.toggle-theme-switch input');
    toggleInput.addEventListener('change', toggleTheme);

    // Attach event listener for the burger menu
    const burgerMenuButton = document.querySelector('.McButton');
    burgerMenuButton.addEventListener('click', toggleMenu);
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

// Toggle burger menu visibility and spin animation
function toggleMenu() {
    const menu = document.getElementById('burger-menu');
    const menuIcon = document.querySelector('.McButton');
    
    // Toggle the active class for both spin and showing the menu
    menuIcon.classList.toggle('active');
    menu.classList.toggle('active');
}

// Attach click event listener to the burger menu
document.querySelector('.McButton').addEventListener('click', toggleMenu);




// Hamburger Menu Animation
$(document).ready(function() {
    var McButton = $("[data=hamburger-menu]");
    var McBar1 = McButton.find("b:nth-child(1)");
    var McBar2 = McButton.find("b:nth-child(2)");
    var McBar3 = McButton.find("b:nth-child(3)");
  
    McButton.click(function() {
      $(this).toggleClass("active");
  
      if (McButton.hasClass("active")) {
        McBar1.velocity({ top: "50%" }, { duration: 200, easing: "swing" });
        McBar3.velocity({ top: "50%" }, { duration: 200, easing: "swing" })
              .velocity({ rotateZ: "90deg" }, { duration: 800, delay: 200, easing: [500, 20] });
        McButton.velocity({ rotateZ: "135deg" }, { duration: 800, delay: 200, easing: [500, 20] });
      } else {
        McButton.velocity("reverse");
        McBar3.velocity({ rotateZ: "0deg" }, { duration: 800, easing: [500, 20] })
              .velocity({ top: "100%" }, { duration: 200, easing: "swing" });
        McBar1.velocity("reverse", { delay: 800 });
      }
    });
  });

// Function to sync the theme toggle with the current mode
function syncThemeToggle() {
    const body = document.body;
    const toggleInput = document.getElementById('theme-toggle');  // Get the toggle

    // If dark-mode is active, set the checkbox to checked
    if (body.classList.contains('dark-mode')) {
        toggleInput.checked = true;
    } else {
        toggleInput.checked = false;
    }
}

// Function to toggle theme
function toggleTheme() {
    const body = document.body;
    const themeToggleCheckbox = document.getElementById('theme-toggle');

    // If checked, switch to dark-mode, else light-mode
    if (themeToggleCheckbox.checked) {
        body.classList.replace('light-mode', 'dark-mode');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
    }
}


// Toggle burger menu visibility and spin animation
function toggleMenu() {
    const menu = document.getElementById('burger-menu');
    const menuIcon = document.querySelector('.McButton');

    // Toggle the active class for both spin and showing the menu
    menuIcon.classList.toggle('active');

    if (menuIcon.classList.contains('active')) {
        menu.style.display = 'block'; // Show the menu
        menu.style.animation = 'fadeIn 0.4s forwards'; // Add smooth fade-in animation
    } else {
        menu.style.display = 'none'; // Hide the menu
    }
}

// Attach click event listener to the burger menu
document.querySelector('.McButton').addEventListener('click', toggleMenu);


// Window onload function
window.onload = function() {
    handleClientLoad();  // Load Google API and initialize calendar
    syncThemeToggle();   // Sync theme toggle switch state with the page mode

    // Add event listener for the theme toggle switch
    const toggleInput = document.getElementById('theme-toggle');
    toggleInput.addEventListener('change', toggleTheme);

    // Add event listener for the burger menu
    const burgerMenuButton = document.querySelector('.McButton');
    burgerMenuButton.addEventListener('click', toggleMenu);
};

