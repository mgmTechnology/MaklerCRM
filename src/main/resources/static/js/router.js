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
        

        console.log(`%cLade Benutzerinfo: ${username} (Rolle: ${role})`, "color: blue; font-size: 12px;");
        
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
        
        console.log(`%cLade Menü: ${role}`, "color: blue; font-size: 12px;");
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
        
        //console.log( `%cLade Dashboard für  ${role} / ${role.toLowerCase()}`,  "color: red; font-size: 12px;");
        
        // Mapping der Modul-Namen zu den tatsächlichen Dateinamen
        const moduleMapping = {
            'contracts': 'vertrage',
            'commission': 'provisionen',
            'users': 'makleruebersicht',
            'system': 'einstellungen',
            'reports': 'berichte',  // Für Betreuer-Berichte
            'berichte': 'admin-berichte',  // Für Admin-Berichte
            'logs': 'syslogs',
            'makler': 'makleruebersicht',
            'tickets': 'support',
            'training': 'training',
            'calendar': 'termine',
            'documents': 'dokumente',
            'customers': 'customers',
            'sys_eva_aida_neuvertraege': 'sys_eva_aida_neuvertraege',
            'sys_eva_aida_lv': 'sys_eva_aida_lv'
        };

        // Wenn es ein Mapping gibt, verwende den gemappten Namen
        const mappedModuleName = moduleMapping[moduleName] || moduleName;
        
        // Wenn es das Dashboard ist oder Admin-Berichte, füge den Rollen-Prefix hinzu
        if (moduleName === 'dashboard' && role === 'Administrator') {
            this.loadModule(mappedModuleName, 'administrator');
        } else if (moduleName === 'berichte' && role === 'Administrator') {
            // Admin sieht die Admin-Version der Berichte
            this.loadModule(mappedModuleName, 'admin');
        } else if (moduleName === 'dashboard') {
            this.loadModule(mappedModuleName, role.toLowerCase());
        } else {
            // Für andere Module verwende den gemappten Namen ohne Prefix
            this.loadModule(mappedModuleName);
        }
    }

    async loadModule(moduleName, rolePrefix = '') {
        try {
            console.group('Modul laden');
            const moduleUrl = rolePrefix 
                ? `modules/${rolePrefix}-${moduleName}.html` 
                : `modules/${moduleName}.html`;
            
            console.log(`%cModul: ${moduleUrl}`, "color: blue; font-size: 12px;" );
            
            // 1. HTML laden
            console.group('1. HTML laden');
            const response = await fetch(moduleUrl);
            if (!response.ok) {
                console.error(`Fehler beim Laden von ${moduleUrl}:`, response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            console.log('HTML Content Länge:', content.length);
            console.groupEnd();
            
            // 2. HTML einfügen
            console.group('2. HTML einfügen');
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                console.error('main-content Element nicht gefunden!');
                throw new Error('main-content Element nicht gefunden');
            }
            mainContent.innerHTML = content;
            console.log('HTML eingefügt');
            console.groupEnd();
            
            // 3. Modul-Anzeige aktualisieren
            console.group('3. Modul-Anzeige aktualisieren');
            updateCurrentModule(moduleName);
            console.log('Modul-Anzeige aktualisiert:', moduleName);
            console.groupEnd();

            // 4. JavaScript laden und initialisieren
            console.group('4. JavaScript laden');
            try {
                // Prüfe, ob Chart.js verfügbar ist, wenn es für das Modul benötigt wird
                if (moduleName === 'berichte' && typeof Chart === 'undefined') {
                    console.warn('Chart.js nicht gefunden, lade es nach...');
                    await new Promise((resolve, reject) => {
                        const chartScript = document.createElement('script');
                        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                        chartScript.onload = resolve;
                        chartScript.onerror = reject;
                        document.head.appendChild(chartScript);
                    });
                    console.log('Chart.js nachgeladen ✅');
                }

                const scriptName = rolePrefix 
                    ? `${rolePrefix}-${moduleName}`
                    : moduleName;
                const scriptUrl = `js/${scriptName}.js`;
                console.log('Script URL:', scriptUrl);

                // Entferne vorhandenes Script, falls vorhanden
                const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
                if (existingScript) {
                    console.log('Entferne vorhandenes Script:', scriptUrl);
                    existingScript.remove();
                }

                // Lade neues Script
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    script.onload = () => {
                        // Initialisiere das Modul mit der passenden Funktion
                        if (moduleName === 'berichte' && rolePrefix === 'admin' && window.initAdminBerichte) {
                            window.initAdminBerichte();
                        } else if ((moduleName === 'berichte' || moduleName === 'reports') && window.initBerichte) {
                            window.initBerichte();
                        } else if (moduleName === 'training' && window.initSchulungen) {
                            window.initSchulungen();
                        } else if (moduleName === 'logs' && window.initSysLogs) {
                            window.initSysLogs();
                        } else if (moduleName === 'sys_eva_aida_lv' && window.initAidaLV) {
                            window.initAidaLV();
                        } else if (moduleName === 'sys_eva_aida_neuvertraege' && window.initAidaNeuvertraege) {
                            window.initAidaNeuvertraege();
                        } else if (moduleName === 'tickets' && window.initSupport) {
                            window.initSupport();
                        } else if (moduleName === 'documents' && window.initDokumente) {
                            window.initDokumente();
                        } else {
                            console.warn(`Keine passende Initialisierungsfunktion für Modul ${moduleName} gefunden`);
                        }
                        resolve();
                    };
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
                console.log('Script geladen ✅');

                console.groupEnd();
                console.groupEnd(); // Modul laden
            } catch (error) {
                console.error('Fehler beim Laden des Scripts:', error);
                console.groupEnd();
                console.groupEnd(); // Modul laden
                throw error;
            }
            
            console.groupEnd(); // Modul laden
        } catch (error) {
            console.error('Fehler beim Laden des Moduls:', error);
            document.getElementById('main-content').innerHTML = `
                <div class="alert alert-danger m-3">
                    <h4 class="alert-heading">Fehler beim Laden des Moduls</h4>
                    <p>Das Modul "${moduleName}" konnte nicht geladen werden.</p>
                    <p class="mb-0"><small>Fehler: ${error.message}</small></p>
                </div>
            `;
        } finally {
            console.groupEnd(); // Modul laden
        }
    }
}

// Router initialisieren
window.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});
