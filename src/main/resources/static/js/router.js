/**
 * Router-Klasse für die Navigation und Modul-Verwaltung
 */
class Router {
    constructor() {
        this.initializeRouter();
        this.loadUserInfo();
    }

    initializeRouter() {
        // Event-Listener für Menü-Links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[data-module]');
            if (target) {
                e.preventDefault();
                const module = target.getAttribute('data-module');
                const role = localStorage.getItem('role');
                this.loadModuleForRole(module, role);
            }
        });

        // Logout-Handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                try {
                    // Speichere temporär den Benutzernamen für die Logging-Nachricht
                    const username = localStorage.getItem('username');
                    
                    // Lösche alle gespeicherten Daten
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    console.log('Benutzer', username, 'erfolgreich abgemeldet');
                    
                    // Weiterleitung zur Login-Seite
                    window.location.replace('login.html');
                } catch (error) {
                    console.error('Fehler beim Logout:', error);
                    alert('Fehler beim Abmelden. Bitte versuchen Sie es erneut.');
                }
            });
        }

        // Theme-Toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-moon');
                    icon.classList.toggle('bi-sun');
                }
            });
        }

        // Sidebar-Toggle
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }

        // Initial-Modul laden
        const role = localStorage.getItem('role');
        if (role) {
            this.loadModuleForRole('dashboard', role);
        }
    }

    loadUserInfo() {
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        console.log('Lade Benutzerinfo für:', username, 'Rolle:', role);
        
        if (!role || !username) {
            console.error('Keine Benutzerinformationen gefunden');
            return;
        }

        // Demo-Benutzerprofile
        const userProfiles = {
            'admin': {
                name: 'Arnie Amsel',
                role: 'Administrator',
                avatar: 'images/admin.png'
            },
            'betreuer': {
                name: 'Bert Banane',
                role: 'Betreuer',
                avatar: 'images/betreuer.png'
            },
            'makler': {
                name: 'Manfred Meineid',
                role: 'Makler',
                avatar: 'images/makler.png'
            }
        };

        const profile = userProfiles[username];
        if (profile) {
            const userInfoElement = document.getElementById('userInfo');
            if (userInfoElement) {
                userInfoElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${profile.avatar}" alt="${profile.name}" class="rounded-circle me-2" width="32" height="32">
                        <div>
                            <div class="fw-bold">${profile.name}</div>
                            <small class="text-muted">${profile.role}</small>
                        </div>
                    </div>
                `;
            }
        }

        this.showMenuForRole(role);
    }

    showMenuForRole(role) {
        console.log('Setze Menü für Rolle:', role);
        
        // Alle Menüs ausblenden
        document.getElementById('adminMenu')?.style.setProperty('display', 'none');
        document.getElementById('betreuerMenu')?.style.setProperty('display', 'none');
        document.getElementById('maklerMenu')?.style.setProperty('display', 'none');

        // Korrektes Menü anzeigen
        switch(role) {
            case 'Administrator':
                document.getElementById('adminMenu')?.style.setProperty('display', 'block');
                break;
            case 'Betreuer':
                document.getElementById('betreuerMenu')?.style.setProperty('display', 'block');
                break;
            case 'Makler':
                document.getElementById('maklerMenu')?.style.setProperty('display', 'block');
                break;
        }
    }

    loadModuleForRole(moduleName, role) {
        console.log('Lade Dashboard für Rolle:', role, 'mit Prefix:', role.toLowerCase());
        
        // Mapping der Modul-Namen zu den tatsächlichen Dateinamen
        const moduleMapping = {
            'contracts': 'vertrage',
            'commission': 'provisionen',
            'users': 'makleruebersicht',
            'system': 'einstellungen',
            'reports': 'berichte',
            'logs': 'system-logs',  // Korrigiere den Dateinamen für system-logs.js
            'makler': 'makleruebersicht',
            'tickets': 'supportanfragen',
            'training': 'schulungen',
            'calendar': 'termine',
            'documents': 'dokumente',  // Korrektes Mapping zu dokumente.html
            'customers': 'customers',   // Neues Mapping für Kundenverwaltung
            'sys_eva_aida_neuvertraege': 'sys_eva_aida_neuvertraege', // Mapping für AIDA Neuverträge
            'sys_eva_aida_lv': 'sys_eva_aida_lv' // Mapping für AIDA Lebensversicherung
        };

        // Wenn es ein Mapping gibt, verwende den gemappten Namen
        const mappedModuleName = moduleMapping[moduleName] || moduleName;
        
        // Wenn es das Dashboard ist, füge den Rollen-Prefix hinzu
        if (moduleName === 'dashboard') {
            this.loadModule(mappedModuleName, role.toLowerCase());
        } else {
            // Für andere Module verwende den gemappten Namen ohne Prefix
            this.loadModule(mappedModuleName);
        }
    }

    async loadModule(moduleName, rolePrefix = '') {
        try {
            const moduleUrl = rolePrefix 
                ? `modules/${rolePrefix}-${moduleName}.html` 
                : `modules/${moduleName}.html`;
            
            console.log('Lade Modul:', moduleUrl);
            
            const response = await fetch(moduleUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const content = await response.text();
            
            document.getElementById('main-content').innerHTML = content;
            
            // Versuche das zugehörige JavaScript zu laden
            const scriptName = moduleName.replace('-', '_');  // Ersetze Bindestriche durch Unterstriche
            const scriptUrl = `js/${scriptName}.js`;
            
            console.log('Lade Script:', scriptUrl);
            
            // Prüfe ob das Script bereits geladen wurde
            const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.onerror = () => {
                    console.log('Script nicht gefunden:', scriptUrl);
                    // Fehler beim Laden des Scripts ist nicht kritisch
                };
                document.body.appendChild(script);
            }
        } catch (error) {
            console.error('Fehler beim Laden des Moduls:', error);
            document.getElementById('main-content').innerHTML = `
                <div class="alert alert-danger m-3">
                    <h4 class="alert-heading">Fehler beim Laden des Moduls</h4>
                    <p>Das Modul "${moduleName}" konnte nicht geladen werden.</p>
                </div>
            `;
        }
    }
}

// Router initialisieren
window.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
