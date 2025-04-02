/**
 * System Logs Funktionalität
 */

// Beispiel-Logs für die Demonstration
const dummyLogs = [
    {
        timestamp: '2024-04-01 08:30:15',
        level: 'INFO',
        user: 'admin',
        event: 'Login',
        details: 'Erfolgreicher Login von Administrator'
    },
    {
        timestamp: '2024-04-01 08:29:00',
        level: 'WARNING',
        user: 'system',
        event: 'Speicherauslastung',
        details: 'Speicherauslastung über 80%'
    },
    {
        timestamp: '2024-04-01 08:25:30',
        level: 'ERROR',
        user: 'makler1',
        event: 'Dokumentenupload',
        details: 'Fehler beim Upload: Datei zu groß'
    }
];

/**
 * Initialisiert die Logs-Ansicht
 */
document.addEventListener('DOMContentLoaded', function() {
    loadLogs();
});

/**
 * Lädt die System-Logs in die Tabelle
 */
function loadLogs() {
    const tableBody = document.getElementById('logsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    dummyLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.timestamp}</td>
            <td><span class="badge bg-${getLevelColor(log.level)}">${log.level}</span></td>
            <td>${log.user}</td>
            <td>${log.event}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick='showLogDetails(${JSON.stringify(log)})'>
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Bestimmt die Farbe für den Level-Badge
 * @param {string} level - Log-Level
 * @returns {string} Bootstrap-Farbe
 */
function getLevelColor(level) {
    switch (level.toUpperCase()) {
        case 'ERROR': return 'danger';
        case 'WARNING': return 'warning';
        case 'INFO': return 'info';
        default: return 'secondary';
    }
}

/**
 * Zeigt die Details eines Logs im Modal
 * @param {Object} log - Log-Eintrag
 */
function showLogDetails(log) {
    const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
    document.getElementById('logDetails').textContent = JSON.stringify(log, null, 2);
    modal.show();
}

/**
 * Exportiert die Logs als JSON-Datei
 */
function exportLogs() {
    const dataStr = JSON.stringify(dummyLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'system-logs.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/**
 * Leert die Logs nach Bestätigung
 */
function clearLogs() {
    if (confirm('Möchten Sie wirklich alle Logs löschen?')) {
        dummyLogs.length = 0;
        loadLogs();
    }
}
