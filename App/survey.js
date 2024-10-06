function showSurvey() {
    const surveyHtml = `
        <div id="survey-overlay">
            <div id="survey-container">
                <h2>Welcome to Dream Chaser!</h2>
                <p>Please answer these quick questions to get started:</p>
                <form id="survey-form">
                    <label>
                        What type of goal is the hardest for you?
                        <select name="hardest-goal" required>
                            <option value="study">Study</option>
                            <option value="sport">Sport</option>
                            <option value="work">Work</option>
                        </select>
                    </label>
                    <label>
                        What color do you like more?
                        <select name="color-preference" required>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                            <option value="blue">Blue</option>
                        </select>
                    </label>
                    <label>
                        Do you prefer dark mode or light mode?
                        <select name="mode-preference" required>
                            <option value="dark">Dark Mode</option>
                            <option value="light">Light Mode</option>
                        </select>
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', surveyHtml);
    
    document.getElementById('survey-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const hardestGoal = this.elements['hardest-goal'].value;
        const colorPreference = this.elements['color-preference'].value;
        const modePreference = this.elements['mode-preference'].value;
        
        localStorage.setItem('surveyCompleted', 'true');
        localStorage.setItem('hardestGoal', hardestGoal);
        localStorage.setItem('colorPreference', colorPreference);
        localStorage.setItem('modePreference', modePreference);
        
        document.getElementById('survey-overlay').remove();
        applyColorPreference();
        applyModePreference();
    });
}

function applyModePreference() {
    const modePreference = localStorage.getItem('modePreference');
    if (modePreference) {
        document.body.classList.remove('dark-mode', 'light-mode');
        document.body.classList.add(modePreference + '-mode');
        document.getElementById('theme-toggle').checked = (modePreference === 'dark');
    }
}


function applyColorPreference() {
    const colorPreference = localStorage.getItem('colorPreference');
    if (colorPreference) {
        document.documentElement.style.setProperty('--button-color', colorPreference, 'important');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    if (!localStorage.getItem('surveyCompleted')) {
        showSurvey();
    } else {
        applyColorPreference();
    }
});