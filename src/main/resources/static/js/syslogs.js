// System Logs Modul
(function() {
    'use strict';

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
     * Initialisiert die System-Logs Ansicht
     * @function
     */
    function initSysLogs() {
        console.log('Initialisiere System-Logs...');
        loadLogs();
        initializeEventListeners();
    }

    /**
     * Initialisiert die Event-Listener
     * @private
     */
    function initializeEventListeners() {
        document.getElementById('exportLogsBtn')?.addEventListener('click', exportLogs);
        document.getElementById('clearLogsBtn')?.addEventListener('click', clearLogs);
    }

    /**
     * Lädt die System-Logs in die Tabelle
     * @private
     */
    function loadLogs() {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) {
            console.error('Logs-Tabelle nicht gefunden');
            return;
        }

        tbody.innerHTML = '';
        dummyLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.timestamp}</td>
                <td><span class="badge bg-${getLevelColor(log.level)}">${log.level}</span></td>
                <td>${log.user}</td>
                <td>${log.event}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="showLogDetails(${JSON.stringify(log)})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Bestimmt die Farbe für den Level-Badge
     * @private
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
        document.getElementById('logDetailsContent').textContent = JSON.stringify(log, null, 2);
        modal.show();
    }

    /**
     * Exportiert die Logs als JSON-Datei
     * @private
     */
    function exportLogs() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dummyLogs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "system_logs.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    /**
     * Leert die Logs nach Bestätigung
     * @private
     */
    function clearLogs() {
        if (confirm('Möchten Sie wirklich alle Logs löschen?')) {
            const tbody = document.getElementById('logsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
            }
        }
    }

    // Exportiere die öffentliche API
    window.initSysLogs = initSysLogs;
    window.showLogDetails = showLogDetails;  // Wird für onclick-Handler benötigt

    // Initialisiere die System-Logs Ansicht
    document.addEventListener('DOMContentLoaded', function() {
        initSysLogs();
    });
})();
