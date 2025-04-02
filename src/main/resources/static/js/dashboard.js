/**
 * Dashboard Hauptskript
 * Lädt das entsprechende Dashboard basierend auf der Benutzerrolle
 */
document.addEventListener('DOMContentLoaded', function() {
    const role = localStorage.getItem('userRole');
    const prefix = role.toLowerCase();
    
    console.log(`Lade Dashboard für Rolle: ${role} mit Prefix: ${prefix}`);
    
    // Lade das rollenspezifische Dashboard
    router.loadModule(`modules/${prefix}-dashboard.html`);
    
    // Lade die Benutzerinformationen
    loadUserInfo();
    
    // Setze das Menü entsprechend der Rolle
    setMenuForRole(role);
});

/**
 * Lädt die Benutzerinformationen
 */
function loadUserInfo() {
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    console.log(`Lade Benutzerinfo für: ${username} Rolle: ${role}`);
    
    // Hier können weitere Benutzerinformationen geladen werden
    document.getElementById('userRole').textContent = role;
    document.getElementById('username').textContent = username;
}

/**
 * Setzt das Menü entsprechend der Benutzerrolle
 * @param {string} role - Die Rolle des Benutzers
 */
function setMenuForRole(role) {
    console.log(`Setze Menü für Rolle: ${role}`);
    // Hier kann die Menülogik implementiert werden
    // z.B. Ein- und Ausblenden von Menüpunkten je nach Rolle
}
