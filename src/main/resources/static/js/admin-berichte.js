/**
 * Admin-Berichte Modul
 */
(function() {
    'use strict';

    console.log('%cAdmin-Berichte.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert das Admin-Berichte Modul
     */
    function initAdminBerichte() {
        console.groupCollapsed('🎯 Admin-Berichte initialisieren');
        try {
            loadSystemStatus();
            loadLastLogins();
            initModuleUsageChart();
            loadBackupHistory();
            setInterval(refreshData, 60000); // Aktualisiere alle 60 Sekunden
            console.log('Admin-Berichte erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Admin-Berichte-Initialisierung:', error);
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
        console.group('System-Status laden');
        try {
            // Demo-Daten für System-Status
            const systems = [
                { 
                    name: 'CRM Core', 
                    status: 'online',
                    availability: '99.99%',
                    responseTime: '45ms',
                    lastCheck: '02.04.2025 11:03'
                },
                { 
                    name: 'AIDA Interface', 
                    status: 'online',
                    availability: '99.95%',
                    responseTime: '120ms',
                    lastCheck: '02.04.2025 11:03'
                },
                { 
                    name: 'Document Storage', 
                    status: 'warning',
                    availability: '99.80%',
                    responseTime: '250ms',
                    lastCheck: '02.04.2025 11:02'
                },
                { 
                    name: 'Mail Service', 
                    status: 'offline',
                    availability: '95.50%',
                    responseTime: '0ms',
                    lastCheck: '02.04.2025 11:00'
                }
            ];

            // Update KPIs
            document.getElementById('systemAvailability').textContent = '99.31%';
            document.getElementById('activeUsers').textContent = '24';
            document.getElementById('avgResponseTime').textContent = '138ms';
            document.getElementById('lastBackup').textContent = '02.04.2025 03:00';

            // Update System-Status-Tabelle
            const tbody = document.querySelector('#systemStatusTable tbody');
            if (!tbody) {
                throw new Error('System-Status-Tabelle nicht gefunden');
            }

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

            console.log('System-Status erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden des System-Status:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die letzten Logins
     * @private
     */
    function loadLastLogins() {
        console.group('Letzte Logins laden');
        try {
            // Demo-Daten für Logins
            const logins = [
                {
                    user: 'admin',
                    timestamp: '02.04.2025 11:05',
                    ip: '192.168.1.100',
                    browser: 'Chrome 122.0.0',
                    status: 'success'
                },
                {
                    user: 'betreuer1',
                    timestamp: '02.04.2025 11:02',
                    ip: '192.168.1.101',
                    browser: 'Firefox 124.0.0',
                    status: 'success'
                },
                {
                    user: 'makler123',
                    timestamp: '02.04.2025 11:00',
                    ip: '192.168.1.102',
                    browser: 'Edge 122.0.0',
                    status: 'failed'
                }
            ];

            // Update Logins-Tabelle
            const tbody = document.querySelector('#lastLoginsTable tbody');
            if (!tbody) {
                throw new Error('Logins-Tabelle nicht gefunden');
            }

            tbody.innerHTML = logins.map(login => `
                <tr>
                    <td>${login.user}</td>
                    <td>${login.timestamp}</td>
                    <td>${login.ip}</td>
                    <td>${login.browser}</td>
                    <td>
                        <span class="badge bg-${login.status === 'success' ? 'success' : 'danger'}">
                            ${login.status === 'success' ? 'Erfolgreich' : 'Fehlgeschlagen'}
                        </span>
                    </td>
                </tr>
            `).join('');

            console.log('Letzte Logins erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der letzten Logins:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Modul-Nutzungs-Chart
     * @private
     */
    function initModuleUsageChart() {
        console.group('Modul-Nutzungs-Chart initialisieren');
        try {
            const ctx = document.getElementById('moduleUsageChart');
            if (!ctx) {
                throw new Error('Canvas für Modul-Nutzungs-Chart nicht gefunden');
            }

            // Demo-Daten für Modul-Nutzung
            const data = {
                labels: ['Dashboard', 'Verträge', 'Provisionen', 'Berichte', 'Dokumente', 'Einstellungen'],
                datasets: [{
                    label: 'Aufrufe',
                    data: [150, 89, 78, 56, 45, 23],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            };

            new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Modul-Nutzung in den letzten 24 Stunden'
                        }
                    },
                    layout: {
                        padding: 20
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 200, // Maximaler Wert auf der Y-Achse
                            title: {
                                display: true,
                                text: 'Anzahl Aufrufe'
                            },
                            ticks: {
                                stepSize: 25 // Schrittgröße der Y-Achse
                            }
                        }
                    }
                }
            });

            console.log('Modul-Nutzungs-Chart erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Initialisierung des Modul-Nutzungs-Charts:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die Backup-Historie
     * @private
     */
    function loadBackupHistory() {
        console.group('Backup-Historie laden');
        try {
            // Demo-Daten für Backup-Historie
            const backups = [
                {
                    timestamp: '02.04.2025 03:00',
                    type: 'Vollbackup',
                    size: '2.3 GB',
                    duration: '15 min',
                    status: 'success'
                },
                {
                    timestamp: '01.04.2025 03:00',
                    type: 'Vollbackup',
                    size: '2.2 GB',
                    duration: '14 min',
                    status: 'success'
                },
                {
                    timestamp: '31.03.2025 03:00',
                    type: 'Vollbackup',
                    size: '2.1 GB',
                    duration: '16 min',
                    status: 'warning'
                }
            ];

            // Update Backup-Historie-Tabelle
            const tbody = document.querySelector('#backupHistoryTable tbody');
            if (!tbody) {
                throw new Error('Backup-Historie-Tabelle nicht gefunden');
            }

            tbody.innerHTML = backups.map(backup => `
                <tr>
                    <td>${backup.timestamp}</td>
                    <td>${backup.type}</td>
                    <td>${backup.size}</td>
                    <td>${backup.duration}</td>
                    <td>
                        <span class="badge bg-${backup.status}">
                            ${backup.status === 'success' ? 'Erfolgreich' : 'Warnung'}
                        </span>
                    </td>
                </tr>
            `).join('');

            console.log('Backup-Historie erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Backup-Historie:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Aktualisiert alle Daten
     */
    function refreshData() {
        console.log('Aktualisiere Daten...');
        loadSystemStatus();
        loadLastLogins();
        loadBackupHistory();
    }

    /**
     * Gibt die CSS-Klasse für den Status zurück
     * @param {string} status - Der System-Status
     * @returns {string} Die CSS-Klasse
     * @private
     */
    function getStatusColor(status) {
        switch (status) {
            case 'online':
                return 'success';
            case 'warning':
                return 'warning';
            case 'offline':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    /**
     * Gibt den deutschen Text für den Status zurück
     * @param {string} status - Der System-Status
     * @returns {string} Der übersetzte Text
     * @private
     */
    function getStatusText(status) {
        switch (status) {
            case 'online':
                return 'Online';
            case 'warning':
                return 'Warnung';
            case 'offline':
                return 'Offline';
            default:
                return 'Unbekannt';
        }
    }

    // Exportiere die Funktionen
    window.initAdminBerichte = initAdminBerichte;

    // Initialisiere die Berichte sofort nach dem Laden
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded - Initialisiere Admin-Berichte...');
        initAdminBerichte();
    });

    console.log('%cAdmin-Berichte.js geladen ✅', 'color: blue; font-size: 12px');
})();
