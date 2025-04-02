/**
 * Admin-Systemeinstellungen Modul
 */
(function() {
    'use strict';

    console.log('%cAdmin-Einstellungen.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert die Systemeinstellungen
     */
    function initEinstellungen() {
        console.groupCollapsed('⚙️ Systemeinstellungen initialisieren');
        try {
            loadSettings();
            initializeFormHandlers();
            console.log('Systemeinstellungen erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Systemeinstellungen-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die gespeicherten Einstellungen
     * @private
     */
    function loadSettings() {
        console.groupCollapsed('⚙️ Einstellungen laden');
        try {
            // Demo-Einstellungen laden
            const settings = {
                general: {
                    companyName: 'MaklerCRM',
                    language: 'de',
                    timezone: 'Europe/Berlin',
                    theme: 'light'
                },
                security: {
                    passwordPolicy: 'strong',
                    sessionTimeout: 30,
                    twoFactorAuth: true,
                    ipLogging: true
                },
                email: {
                    smtpServer: 'smtp.example.com',
                    smtpPort: 587,
                    senderEmail: 'noreply@maklercrm.de',
                    useSsl: true
                },
                backup: {
                    interval: 'daily',
                    time: '03:00',
                    retention: 30,
                    autoBackup: true
                }
            };

            // Einstellungen in die Formulare eintragen
            Object.entries(settings).forEach(([category, values]) => {
                Object.entries(values).forEach(([key, value]) => {
                    const input = document.querySelector(`#${category}SettingsForm [name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = value;
                        } else {
                            input.value = value;
                        }
                    }
                });
            });

            console.log('Einstellungen erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Einstellungen:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert die Formular-Handler
     * @private
     */
    function initializeFormHandlers() {
        // Event-Listener für Formular-Änderungen
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('change', () => {
                // Aktiviere den Speichern-Button
                const saveButton = document.querySelector('button[onclick="saveSettings()"]');
                if (saveButton) {
                    saveButton.classList.remove('btn-outline-primary');
                    saveButton.classList.add('btn-primary');
                }
            });
        });
    }

    /**
     * Speichert die Einstellungen
     */
    window.saveSettings = function() {
        console.groupCollapsed('⚙️ Einstellungen speichern');
        try {
            // Sammle alle Formular-Daten
            const settings = {};
            document.querySelectorAll('form').forEach(form => {
                const category = form.id.replace('SettingsForm', '');
                settings[category] = {};
                
                form.querySelectorAll('input, select').forEach(input => {
                    const value = input.type === 'checkbox' ? input.checked : input.value;
                    settings[category][input.name] = value;
                });
            });

            // TODO: Implementiere das Speichern der Einstellungen
            console.log('Zu speichernde Einstellungen:', settings);
            
            // Erfolgsbenachrichtigung
            alert('Einstellungen wurden erfolgreich gespeichert!');
            
            // Deaktiviere den Speichern-Button
            const saveButton = document.querySelector('button[onclick="saveSettings()"]');
            if (saveButton) {
                saveButton.classList.remove('btn-primary');
                saveButton.classList.add('btn-outline-primary');
            }

            console.log('Einstellungen erfolgreich gespeichert ✅');
        } catch (error) {
            console.error('❌ Fehler beim Speichern der Einstellungen:', error);
            alert('Fehler beim Speichern der Einstellungen!');
            throw error;
        } finally {
            console.groupEnd();
        }
    };

    /**
     * Setzt die Einstellungen zurück
     */
    window.resetSettings = function() {
        if (confirm('Möchten Sie alle Einstellungen zurücksetzen?')) {
            console.groupCollapsed('⚙️ Einstellungen zurücksetzen');
            try {
                loadSettings();
                alert('Einstellungen wurden zurückgesetzt!');
                console.log('Einstellungen erfolgreich zurückgesetzt ✅');
            } catch (error) {
                console.error('❌ Fehler beim Zurücksetzen der Einstellungen:', error);
                alert('Fehler beim Zurücksetzen der Einstellungen!');
                throw error;
            } finally {
                console.groupEnd();
            }
        }
    };

    // Exportiere die Initialisierungsfunktion
    window.initEinstellungen = initEinstellungen;

    console.log('%cAdmin-Einstellungen.js geladen ✅', 'color: blue; font-size: 12px');
})();
