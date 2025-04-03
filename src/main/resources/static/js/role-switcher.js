// Role Switcher Funktionalität
document.addEventListener('DOMContentLoaded', function() {
    const currentRole = localStorage.getItem('role');
    const roleSwitcher = document.getElementById('roleSwitcher');
    
    // Zeige Role-Switcher nur für Administratoren
    if (currentRole === 'Administrator') {
        roleSwitcher.style.display = 'block';
    }
});

function switchRole(newRole) {
    // Rolle im localStorage nicht aktualisieren!! wir bleiben Admin!
    // localStorage.setItem('role', newRole);
    
    // Menüs aktualisieren
    updateMenuVisibility(newRole);
    
    // Aktuelle Rolle im Header aktualisieren
    document.getElementById('currentRole').textContent = newRole;
    
    // Optional: Seite neu laden oder nur relevante Komponenten aktualisieren
    // window.location.reload();
}

function updateMenuVisibility(role) {
    // Alle Menüs ausblenden
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('betreuerMenu').style.display = 'none';
    document.getElementById('maklerMenu').style.display = 'none';
    
    // Entsprechendes Menü einblenden
    switch(role) {
        case 'Administrator':
            document.getElementById('adminMenu').style.display = 'block';
            break;
        case 'Betreuer':
            document.getElementById('betreuerMenu').style.display = 'block';
            break;
        case 'Makler':
            document.getElementById('maklerMenu').style.display = 'block';
            break;
    }
}