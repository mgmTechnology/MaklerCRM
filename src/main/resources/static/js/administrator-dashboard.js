/**
 * Initialisiert das Administrator-Dashboard
 */
function initDashboard() {
    console.log('Initialisiere Administrator-Dashboard');
    loadDashboardData();
}

/**
 * Lädt die Daten für das Administrator-Dashboard
 */
function loadDashboardData() {
    // In einer echten Anwendung würden diese Daten vom Server geladen
    const dashboardData = {
        totalRevenue: 125000,
        revenueChange: 15,
        activeUsers: 45,
        newUsers: 3,
        systemLoad: 28,
        uptime: '99.9%',
        pendingUpdates: 2
    };

    // Statistik-Karten aktualisieren
    updateStatisticCards(dashboardData);
}

/**
 * Aktualisiert die Statistik-Karten mit den geladenen Daten
 * @param {Object} data - Die Dashboard-Daten
 */
function updateStatisticCards(data) {
    // Gesamtumsatz
    updateCard(
        'Gesamtumsatz',
        `${data.totalRevenue.toLocaleString()} €`,
        `+${data.revenueChange}% zum Vormonat`,
        'success'
    );

    // Aktive Benutzer
    updateCard(
        'Aktive Benutzer',
        data.activeUsers,
        `+${data.newUsers} neue diese Woche`,
        'info'
    );

    // System-Auslastung
    updateCard(
        'System-Auslastung',
        `${data.systemLoad}%`,
        `Uptime: ${data.uptime}`,
        data.systemLoad > 80 ? 'danger' : 'success'
    );

    // Ausstehende Updates
    updateCard(
        'Ausstehende Updates',
        data.pendingUpdates,
        'Verfügbar',
        data.pendingUpdates > 0 ? 'warning' : 'success'
    );
}

/**
 * Aktualisiert eine einzelne Statistik-Karte
 * @param {string} title - Der Titel der Karte
 * @param {string|number} value - Der Hauptwert
 * @param {string} subtext - Der erklärende Text unter dem Wert
 * @param {string} textClass - Die CSS-Klasse für den Text (success, warning, muted, etc.)
 */
function updateCard(title, value, subtext, textClass) {
    // Finde alle Karten
    const cards = document.querySelectorAll('.card');
    
    // Suche die Karte mit dem passenden Titel
    for (const card of cards) {
        const subtitle = card.querySelector('.card-subtitle');
        if (subtitle && subtitle.textContent.trim() === title) {
            const valueElement = card.querySelector('.card-title');
            const subtextElement = card.querySelector('small');
            
            if (valueElement) valueElement.textContent = value;
            if (subtextElement) {
                subtextElement.textContent = subtext;
                subtextElement.className = `text-${textClass}`;
            }
            break;
        }
    }
}

// Dashboard initialisieren
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});
