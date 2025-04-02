/**
 * Initialisiert das Einstellungen-Modul
 * @function
 */
function initEinstellungen() {
    initializeFormHandlers();
    loadUserSettings();
}

/**
 * Initialisiert die Event-Handler für die Formulare
 * @function
 */
function initializeFormHandlers() {
    // Profil-Formular
    document.getElementById('profileForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileSettings();
    });

    // Benachrichtigungs-Formular
    document.getElementById('notificationsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveNotificationSettings();
    });

    // Sicherheits-Formular
    document.getElementById('securityForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSecuritySettings();
    });

    // Erscheinungsbild-Formular
    document.getElementById('appearanceForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAppearanceSettings();
    });

    // Theme-Wechsel
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', function() {
            updateTheme(this.id);
        });
    });

    // 2FA Toggle
    document.getElementById('enable2FA')?.addEventListener('change', function() {
        toggle2FA(this.checked);
    });
}

/**
 * Lädt die Benutzereinstellungen
 * @function
 */
function loadUserSettings() {
    // Dummy-Daten für Benutzereinstellungen
    const userSettings = {
        profile: {
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max.mustermann@email.de',
            phone: '+49 123 456789'
        },
        notifications: {
            email: {
                newContract: true,
                newMessage: true,
                newTicket: true
            },
            push: {
                newContract: false,
                newMessage: true,
                newTicket: false
            }
        },
        appearance: {
            theme: 'light',
            fontSize: 'medium'
        },
        integrations: {
            googleCalendar: false,
            office365: true
        }
    };

    // Anwenden der Einstellungen auf die Formulare
    applySettings(userSettings);
}

/**
 * Wendet die geladenen Einstellungen auf die Formulare an
 * @param {Object} settings - Die Benutzereinstellungen
 */
function applySettings(settings) {
    // Profil-Einstellungen
    if (settings.profile) {
        const form = document.getElementById('profileForm');
        if (form) {
            form.querySelector('input[type="text"]').value = settings.profile.firstName;
            form.querySelectorAll('input[type="text"]')[1].value = settings.profile.lastName;
            form.querySelector('input[type="email"]').value = settings.profile.email;
            form.querySelector('input[type="tel"]').value = settings.profile.phone;
        }
    }

    // Benachrichtigungs-Einstellungen
    if (settings.notifications) {
        document.getElementById('emailNewContract').checked = settings.notifications.email.newContract;
        document.getElementById('emailNewMessage').checked = settings.notifications.email.newMessage;
        document.getElementById('emailNewTicket').checked = settings.notifications.email.newTicket;
        document.getElementById('pushNewContract').checked = settings.notifications.push.newContract;
        document.getElementById('pushNewMessage').checked = settings.notifications.push.newMessage;
        document.getElementById('pushNewTicket').checked = settings.notifications.push.newTicket;
    }

    // Erscheinungsbild-Einstellungen
    if (settings.appearance) {
        document.getElementById(`theme${capitalizeFirstLetter(settings.appearance.theme)}`).checked = true;
    }

    // Integrations-Einstellungen
    if (settings.integrations) {
        document.getElementById('syncGoogleCalendar').checked = settings.integrations.googleCalendar;
        document.getElementById('syncOffice365').checked = settings.integrations.office365;
    }
}

/**
 * Speichert die Profil-Einstellungen
 * @function
 */
function saveProfileSettings() {
    console.log('Saving profile settings...');
    showSuccessMessage('Profil-Einstellungen wurden gespeichert');
}

/**
 * Speichert die Benachrichtigungs-Einstellungen
 * @function
 */
function saveNotificationSettings() {
    console.log('Saving notification settings...');
    showSuccessMessage('Benachrichtigungs-Einstellungen wurden gespeichert');
}

/**
 * Speichert die Sicherheits-Einstellungen
 * @function
 */
function saveSecuritySettings() {
    console.log('Saving security settings...');
    showSuccessMessage('Sicherheits-Einstellungen wurden gespeichert');
}

/**
 * Speichert die Erscheinungsbild-Einstellungen
 * @function
 */
function saveAppearanceSettings() {
    console.log('Saving appearance settings...');
    showSuccessMessage('Erscheinungsbild-Einstellungen wurden gespeichert');
}

/**
 * Aktualisiert das Theme
 * @param {string} themeId - Die ID des ausgewählten Themes
 */
function updateTheme(themeId) {
    const theme = themeId.replace('theme', '').toLowerCase();
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

/**
 * Schaltet die Zwei-Faktor-Authentifizierung ein oder aus
 * @param {boolean} enabled - Ob 2FA aktiviert werden soll
 */
function toggle2FA(enabled) {
    if (enabled) {
        // Hier würde die 2FA-Aktivierung implementiert
        console.log('Enabling 2FA...');
    } else {
        // Hier würde die 2FA-Deaktivierung implementiert
        console.log('Disabling 2FA...');
    }
}

/**
 * Zeigt eine Erfolgsmeldung an
 * @param {string} message - Die anzuzeigende Nachricht
 */
function showSuccessMessage(message) {
    // Hier könnte eine Toast-Nachricht oder ähnliches implementiert werden
    alert(message);
}

/**
 * Wandelt den ersten Buchstaben eines Strings in Großbuchstaben um
 * @param {string} string - Der umzuwandelnde String
 * @returns {string} Der String mit großem Anfangsbuchstaben
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialisiere das Einstellungen-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initEinstellungen();
}
