/**
 * Admin System-Monitoring Modul
 */
(function() {
    'use strict';

    console.log('%cadmin_berichte.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert das System-Monitoring
     */
    function initBerichte() {
        console.groupCollapsed('🖥️ System-Monitoring initialisieren');
        try {
            loadSystemStatus();
            loadLastLogins();
            initModuleUsageChart();
            loadBackupHistory();
            setInterval(refreshData, 60000); // Aktualisiere alle 60 Sekunden
            console.log('System-Monitoring erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Monitoring-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt den System-Status
     * @private
     */
    function loadSystemStatus() {
        // Demo-Daten für System-Status
        const systems = [
            { 
                name: 'CRM Core', 
                status: 'online',
                availability: '99.99%',
                responseTime: '45ms',
                lastCheck: '02.04.2025 10:15'
            },
            { 
                name: 'AIDA Interface', 
                status: 'online',
                availability: '99.95%',
                responseTime: '120ms',
                lastCheck: '02.04.2025 10:15'
            },
            { 
                name: 'Document Storage', 
                status: 'warning',
                availability: '99.80%',
                responseTime: '250ms',
                lastCheck: '02.04.2025 10:14'
            },
            { 
                name: 'Mail Service', 
                status: 'offline',
                availability: '95.50%',
                responseTime: '0ms',
                lastCheck: '02.04.2025 10:10'
            }
        ];

        // Update KPIs
        document.getElementById('systemAvailability').textContent = '99.31%';
        document.getElementById('activeUsers').textContent = '24';
        document.getElementById('avgResponseTime').textContent = '138ms';
        document.getElementById('lastBackup').textContent = '02.04.2025 03:00';

        // Update System-Status-Tabelle
        const tbody = document.querySelector('#systemStatusTable tbody');
        if (tbody) {
            tbody.innerHTML = systems.map(system => `
                <tr>
                    <td>${system.name}</td>
                    <td>
                        <span class="badge bg-${getStatusColor(system.status)}">
                            ${getStatusText(system.status)}
                        </span>
                    </td>
                    <td>${system.availability}</td>
                    <td>${system.responseTime}</td>
                    <td>${system.lastCheck}</td>
                </tr>
            `).join('');
        }
    }

    /**
     * Lädt die letzten Logins
     * @private
     */
    function loadLastLogins() {
        // Demo-Daten für Logins
        const logins = [
            {
                user: 'admin',
                timestamp: '02.04.2025 10:05',
                ip: '192.168.1.100',
                browser: 'Chrome 122.0',
                status: 'success'
            },
            {
                user: 'mueller',
                timestamp: '02.04.2025 10:02',
                ip: '192.168.1.101',
                browser: 'Firefox 124.0',
                status: 'success'
            },
            {
                user: 'schmidt',
                timestamp: '02.04.2025 09:58',
                ip: '192.168.1.102',
                browser: 'Safari 17.0',
                status: 'failed'
            }
        ];

        const tbody = document.querySelector('#lastLoginsTable tbody');
        if (tbody) {
            tbody.innerHTML = logins.map(login => `
                <tr>
                    <td>${login.user}</td>
                    <td>${login.timestamp}</td>
                    <td>${login.ip}</td>
                    <td>${login.browser}</td>
                    <td>
                        <span class="badge bg-${login.status === 'success' ? 'success' : 'danger'}">
                            ${login.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    }

    /**
     * Initialisiert das Modul-Nutzungs-Chart
     * @private
     */
    function initModuleUsageChart() {
        const ctx = document.getElementById('moduleUsageChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Dashboard', 'Verträge', 'Kunden', 'Dokumente', 'Berichte', 'Einstellungen'],
                    datasets: [{
                        label: 'Aufrufe in den letzten 24h',
                        data: [245, 182, 131, 124, 98, 45],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    /**
     * Lädt die Backup-Historie
     * @private
     */
    function loadBackupHistory() {
        // Demo-Daten für Backups
        const backups = [
            {
                timestamp: '02.04.2025 03:00',
                type: 'Vollbackup',
                size: '2.8 GB',
                duration: '45 min',
                status: 'success'
            },
            {
                timestamp: '01.04.2025 03:00',
                type: 'Vollbackup',
                size: '2.7 GB',
                duration: '42 min',
                status: 'success'
            },
            {
                timestamp: '31.03.2025 03:00',
                type: 'Vollbackup',
                size: '2.7 GB',
                duration: '44 min',
                status: 'warning'
            }
        ];

        const tbody = document.querySelector('#backupHistoryTable tbody');
        if (tbody) {
            tbody.innerHTML = backups.map(backup => `
                <tr>
                    <td>${backup.timestamp}</td>
                    <td>${backup.type}</td>
                    <td>${backup.size}</td>
                    <td>${backup.duration}</td>
                    <td>
                        <span class="badge bg-${backup.status === 'success' ? 'success' : 'warning'}">
                            ${backup.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    }

    /**
     * Aktualisiert alle Daten
     */
    window.refreshData = function() {
        console.log('Aktualisiere System-Monitoring-Daten...');
        loadSystemStatus();
        loadLastLogins();
        loadBackupHistory();
    };

    /**
     * Exportiert den System-Report
     */
    window.exportSystemReport = function() {
        console.log('Exportiere System-Report...');
        alert('System-Report wird generiert und heruntergeladen...');
    };

    /**
     * Gibt die CSS-Klasse für den Status zurück
     * @param {string} status - Der System-Status
     * @returns {string} Die CSS-Klasse
     * @private
     */
    function getStatusColor(status) {
        const colors = {
            online: 'success',
            warning: 'warning',
            offline: 'danger'
        };
        return colors[status] || 'secondary';
    }

    /**
     * Gibt den deutschen Text für den Status zurück
     * @param {string} status - Der System-Status
     * @returns {string} Der übersetzte Text
     * @private
     */
    function getStatusText(status) {
        const texts = {
            online: 'Online',
            warning: 'Warnung',
            offline: 'Offline'
        };
        return texts[status] || status;
    }

    // Exportiere die Initialisierungsfunktion
    window.initBerichte = initBerichte;

    console.log('%cadmin_berichte.js geladen ✅', 'color: blue; font-size: 12px');
})();
