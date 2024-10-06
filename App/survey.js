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
                            <option value="health">Health</option>
                            <option value="personal">Personal</option>
                            <option value="life-goal" hidden>Life Goal</option>
                        </select>
                    </label>
                    <label>
                        Choose your preferred color theme:
                        <select name="color-preference" required>
                            <option value="#7E57C2">Muted Purple</option>
                            <option value="#5C6BC0">Muted Indigo</option>
                            <option value="#42A5F5">Muted Blue</option>
                            <option value="#26A69A">Muted Teal</option>
                            <option value="#66BB6A">Muted Green</option>
                            <option value="#FFCA28">Muted Amber</option>
                            <option value="#FF7043">Muted Deep Orange</option>
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
          document.documentElement.style.setProperty('--button-color', colorPreference);
        
          // Convert hex to RGB, then darken
          let rgb = hexToRgb(colorPreference);
          let darkerColor = `rgb(${rgb.r * 0.8}, ${rgb.g * 0.8}, ${rgb.b * 0.8})`;
        
          document.querySelector('header').style.backgroundColor = darkerColor;
      }
  }

  function hexToRgb(hex) {
      let bigint = parseInt(hex.slice(1), 16);
      return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
      };
  }
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    if (!localStorage.getItem('surveyCompleted')) {
        showSurvey();
    } else {
        applyColorPreference();
    }
});