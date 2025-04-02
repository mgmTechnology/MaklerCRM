/**
 * Admin-Benutzerverwaltung Modul
 */
(function() {
    'use strict';

    console.log('%cAdmin-Benutzerverwaltung.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert die Benutzerverwaltung
     */
    function initBenutzerverwaltung() {
        console.groupCollapsed('👥 Benutzerverwaltung initialisieren');
        try {
            loadUsers();
            initializeSearch();
            console.log('Benutzerverwaltung erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Benutzerverwaltung-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die Benutzerdaten
     * @private
     */
    function loadUsers() {
        console.groupCollapsed('👥 Benutzerdaten laden');
        try {
            // Demo-Daten für Benutzer
            const users = [
                {
                    name: 'Max Mustermann',
                    email: 'max.mustermann@maklercrm.de',
                    role: 'admin',
                    status: 'active',
                    lastLogin: '02.04.2025 09:45'
                },
                {
                    name: 'Anna Schmidt',
                    email: 'anna.schmidt@maklercrm.de',
                    role: 'makler',
                    status: 'active',
                    lastLogin: '02.04.2025 08:30'
                },
                {
                    name: 'Tom Weber',
                    email: 'tom.weber@maklercrm.de',
                    role: 'betreuer',
                    status: 'inactive',
                    lastLogin: '01.04.2025 16:15'
                }
            ];

            const tbody = document.querySelector('#usersTable tbody');
            if (!tbody) {
                throw new Error('Benutzer-Tabelle nicht gefunden');
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${getRoleBadgeClass(user.role)}">${getRoleText(user.role)}</span></td>
                    <td><span class="badge bg-${user.status === 'active' ? 'success' : 'secondary'}">${user.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span></td>
                    <td>${user.lastLogin}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser('${user.email}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.email}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('Benutzerdaten erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert die Suchfunktion
     * @private
     */
    function initializeSearch() {
        const searchInput = document.getElementById('searchUsers');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#usersTable tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    /**
     * Gibt die CSS-Klasse für den Rollen-Badge zurück
     * @param {string} role - Die Benutzerrolle
     * @returns {string} Die CSS-Klasse
     * @private
     */
    function getRoleBadgeClass(role) {
        const classes = {
            admin: 'danger',
            makler: 'primary',
            betreuer: 'info'
        };
        return classes[role] || 'secondary';
    }

    /**
     * Gibt den deutschen Text für die Rolle zurück
     * @param {string} role - Die Benutzerrolle
     * @returns {string} Der übersetzte Text
     * @private
     */
    function getRoleText(role) {
        const texts = {
            admin: 'Administrator',
            makler: 'Makler',
            betreuer: 'Betreuer'
        };
        return texts[role] || role;
    }

    /**
     * Speichert einen neuen Benutzer
     */
    window.saveNewUser = function() {
        const form = document.getElementById('newUserForm');
        if (form) {
            // TODO: Implementiere Benutzer-Speicherung
            console.log('Neuer Benutzer wird gespeichert...');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();
            alert('Benutzer wurde gespeichert!');
            loadUsers();
        }
    };

    /**
     * Importiert Benutzer aus einer CSV-Datei
     */
    window.importUsers = function() {
        const form = document.getElementById('importUsersForm');
        if (form) {
            // TODO: Implementiere Benutzer-Import
            console.log('Benutzer werden importiert...');
            const modal = bootstrap.Modal.getInstance(document.getElementById('importUsersModal'));
            modal.hide();
            alert('Benutzer wurden importiert!');
            loadUsers();
        }
    };

    /**
     * Bearbeitet einen Benutzer
     * @param {string} email - Die E-Mail des Benutzers
     */
    window.editUser = function(email) {
        // TODO: Implementiere Benutzer-Bearbeitung
        console.log('Bearbeite Benutzer:', email);
        alert('Benutzer-Bearbeitung noch nicht implementiert');
    };

    /**
     * Löscht einen Benutzer
     * @param {string} email - Die E-Mail des Benutzers
     */
    window.deleteUser = function(email) {
        if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
            // TODO: Implementiere Benutzer-Löschung
            console.log('Lösche Benutzer:', email);
            alert('Benutzer wurde gelöscht!');
            loadUsers();
        }
    };

    // Exportiere die Initialisierungsfunktion
    window.initBenutzerverwaltung = initBenutzerverwaltung;

    console.log('%cAdmin-Benutzerverwaltung.js geladen ✅', 'color: blue; font-size: 12px');
})();
