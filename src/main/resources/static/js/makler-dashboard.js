/**
 * Initialisiert das Makler-Dashboard
 */
function initDashboard() {
    console.log('Initialisiere Makler-Dashboard');
    loadDashboardData();
}

/**
 * Lädt die Daten für das Makler-Dashboard
 */
function loadDashboardData() {
    // In einer echten Anwendung würden diese Daten vom Server geladen
    const dashboardData = {
        activeContracts: 24,
        newContractsThisMonth: 3,
        openApplications: 8,
        waitingApplications: 2,
        provisionMtd: 2450,
        provisionChange: 12,
        appointments: 5
    };

    // Statistik-Karten aktualisieren
    updateStatisticCards(dashboardData);
}

/**
 * Aktualisiert die Statistik-Karten mit den geladenen Daten
 * @param {Object} data - Die Dashboard-Daten
 */
function updateStatisticCards(data) {
    // Aktive Verträge
    updateCard(
        'Aktive Verträge',
        data.activeContracts,
        `+${data.newContractsThisMonth} diesen Monat`,
        'success'
    );

    // Offene Anträge
    updateCard(
        'Offene Anträge',
        data.openApplications,
        `${data.waitingApplications} warten auf Bearbeitung`,
        'warning'
    );

    // Provision
    updateCard(
        'Provision (MTD)',
        `${data.provisionMtd} €`,
        `+${data.provisionChange}% zum Vormonat`,
        'success'
    );

    // Kundentermine
    updateCard(
        'Kundentermine',
        data.appointments,
        'Diese Woche',
        'muted'
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
