/**
 * Initialisiert das Betreuer-Dashboard
 */
function initDashboard() {
    console.log('Initialisiere Betreuer-Dashboard');
    loadDashboardData();
}

/**
 * Lädt die Daten für das Betreuer-Dashboard
 */
function loadDashboardData() {
    // In einer echten Anwendung würden diese Daten vom Server geladen
    const dashboardData = {
        activeMakler: 12,
        newMaklerThisMonth: 2,
        openTickets: 5,
        criticalTickets: 1,
        trainingSessions: 3,
        nextTraining: '15.04.2025',
        teamPerformance: 94
    };

    // Statistik-Karten aktualisieren
    updateStatisticCards(dashboardData);
}

/**
 * Aktualisiert die Statistik-Karten mit den geladenen Daten
 * @param {Object} data - Die Dashboard-Daten
 */
function updateStatisticCards(data) {
    // Aktive Makler
    updateCard(
        'Aktive Makler',
        data.activeMakler,
        `+${data.newMaklerThisMonth} diesen Monat`,
        'success'
    );

    // Offene Tickets
    updateCard(
        'Offene Tickets',
        data.openTickets,
        `${data.criticalTickets} kritisch`,
        'warning'
    );

    // Schulungen
    updateCard(
        'Schulungen',
        data.trainingSessions,
        `Nächste am ${data.nextTraining}`,
        'info'
    );

    // Team Performance
    updateCard(
        'Team Performance',
        `${data.teamPerformance}%`,
        'Diesen Monat',
        'success'
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
