/**
 * Kundenverwaltung Funktionen
 */

// Dummy-Daten für Beispielzwecke
const beispielKunden = [
    { id: 'K001', name: 'Anette Glück', email: 'anette@glueck.com', phone: '+49 123 456789', status: 'Aktiv' },
    { id: 'K002', name: 'Mareike Walther', email: 'mareike.walther@web.de', phone: '+49 234 567890', status: 'Aktiv' },
    { id: 'K003', name: 'Volker Mommer', email: 'volker@mommer.org', phone: '+49 345 678901', status: 'Inaktiv' }
];

console.log(beispielKunden);
loadCustomers();

/**
 * Wird aufgerufen, wenn die Seite geladen wird
 */
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
});

/**
 * Lädt die Kundendaten und zeigt sie in der Tabelle an
 */
function loadCustomers() {
    console.log('Lade Kunden...');
    const tableBody = document.getElementById('customerTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Tabelle leeren

    beispielKunden.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td><span class="badge bg-${customer.status === 'Aktiv' ? 'success' : 'secondary'}">${customer.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCustomer('${customer.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${customer.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Öffnet das Modal für einen neuen Kunden
 */
function openNewCustomerModal() {
    const modal = new bootstrap.Modal(document.getElementById('newCustomerModal'));
    document.getElementById('newCustomerForm').reset();
    modal.show();
}

/**
 * Speichert einen neuen Kunden
 */
function saveNewCustomer() {
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;

    // Hier würde normalerweise ein API-Call erfolgen
    const newCustomer = {
        id: 'K' + (beispielKunden.length + 1).toString().padStart(3, '0'),
        name,
        email,
        phone,
        status: 'Aktiv'
    };

    beispielKunden.push(newCustomer);
    loadCustomers();

    // Modal schließen
    const modal = bootstrap.Modal.getInstance(document.getElementById('newCustomerModal'));
    modal.hide();
}

/**
 * Bearbeitet einen bestehenden Kunden
 * @param {string} customerId - Die ID des zu bearbeitenden Kunden
 */
function editCustomer(customerId) {
    const customer = beispielKunden.find(c => c.id === customerId);
    if (!customer) return;

    // Hier würde die Edit-Logik implementiert werden
    console.log('Bearbeite Kunde:', customer);
}

/**
 * Löscht einen Kunden
 * @param {string} customerId - Die ID des zu löschenden Kunden
 */
function deleteCustomer(customerId) {
    if (!confirm('Möchten Sie diesen Kunden wirklich löschen?')) return;

    const index = beispielKunden.findIndex(c => c.id === customerId);
    if (index > -1) {
        beispielKunden.splice(index, 1);
        loadCustomers();
    }
}
