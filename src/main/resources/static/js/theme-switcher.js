/**
 * Theme-Switcher Funktionalität
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setze das gespeicherte Theme beim Laden
    const savedTheme = localStorage.getItem('theme') || 'ivory';
    setTheme(savedTheme);
    
    // Setze den entsprechenden Radio-Button
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    
    // Event-Listener für Theme-Änderungen
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            setTheme(e.target.value);
        });
    });
});

/**
 * Setzt das ausgewählte Theme
 * @param {string} theme - Der Name des Themes (ivory, airyblue, darkblue)
 */
function setTheme(theme) {
    // Speichere die Auswahl
    localStorage.setItem('theme', theme);
    
    // Entferne alle anderen Theme-Attribute
    document.documentElement.removeAttribute('data-theme');
    
    // Setze das neue Theme, aber nur wenn es nicht ivory ist (das ist das Standard-Theme)
    if (theme !== 'ivory') {
        document.documentElement.setAttribute('data-theme', theme);
    }
}
