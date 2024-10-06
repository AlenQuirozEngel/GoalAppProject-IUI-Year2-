document.addEventListener('DOMContentLoaded', function() {
    const resetSurveyButton = document.getElementById('reset-survey');
    applyTheme();
    if (resetSurveyButton) {
        resetSurveyButton.addEventListener('click', resetSurvey);
    }
});

function resetSurvey() {
    localStorage.removeItem('surveyCompleted');
    localStorage.removeItem('hardestGoal');
    localStorage.removeItem('colorPreference');
    alert('Survey has been reset. You will see the survey again on your next visit.');
}
