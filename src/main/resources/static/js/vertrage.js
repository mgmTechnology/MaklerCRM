/**
 * Initialisiert das Verträge-Modul
 * @function
 */
function initVertrage() {
    loadContracts();
    initializeEventListeners();
}

/**
 * Lädt die Dummy-Vertragsdaten
 * @function
 */
function loadContracts() {
    const contracts = [
        {
            number: 'VS-2024-001',
            customer: 'Thomas Schmidt',
            type: 'KFZ-Versicherung',
            status: 'active',
            startDate: '01.01.2024',
            yearlyFee: '1.074,00',
            commission: '107,40'
        },
        {
            number: 'VS-2024-002',
            customer: 'Maria Müller',
            type: 'Hausratversicherung',
            status: 'pending',
            startDate: '01.03.2024',
            yearlyFee: '248,40',
            commission: '24,84'
        },
        {
            number: 'VS-2024-003',
            customer: 'Peter Wagner',
            type: 'Lebensversicherung',
            status: 'active',
            startDate: '01.02.2024',
            yearlyFee: '1.840,00',
            commission: '460,00'
        }
    ];

    const tableBody = document.getElementById('contractsTableBody');
    tableBody.innerHTML = contracts.map(contract => `
        <tr>
            <td>${contract.number}</td>
            <td>${contract.customer}</td>
            <td>${contract.type}</td>
            <td><span class="badge bg-${getStatusBadgeClass(contract.status)}">${getStatusText(contract.status)}</span></td>
            <td>${contract.startDate}</td>
            <td>${contract.yearlyFee} €</td>
            <td>${contract.commission} €</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewContract('${contract.number}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="editContract('${contract.number}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContract('${contract.number}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Event-Listener für Filter und Suche
 * @function
 */
function initializeEventListeners() {
    // Filter für Versicherungsart
    document.getElementById('insuranceType').addEventListener('change', filterContracts);
    
    // Filter für Status
    document.getElementById('contractStatus').addEventListener('change', filterContracts);
    
    // Suche nach Kunde
    document.getElementById('customerSearch').addEventListener('input', filterContracts);
    
    // Suche nach Vertragsnummer
    document.getElementById('contractNumber').addEventListener('input', filterContracts);
}

/**
 * Filtert die Verträge basierend auf den ausgewählten Kriterien
 * @function
 */
function filterContracts() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering contracts...');
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status des Vertrags
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status des Vertrags
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'active': return 'Aktiv';
        case 'pending': return 'In Bearbeitung';
        case 'cancelled': return 'Gekündigt';
        default: return status;
    }
}

/**
 * Speichert einen neuen Vertrag
 * @function
 */
function saveNewContract() {
    // Implementierung der Speicher-Logik hier
    console.log('Saving new contract...');
    // Modal schließen
    const modal = bootstrap.Modal.getInstance(document.getElementById('newContractModal'));
    modal.hide();
}

/**
 * Öffnet die Detailansicht eines Vertrags
 * @param {string} contractNumber - Die Vertragsnummer
 */
function viewContract(contractNumber) {
    console.log('Viewing contract:', contractNumber);
}

/**
 * Öffnet die Bearbeitungsansicht eines Vertrags
 * @param {string} contractNumber - Die Vertragsnummer
 */
function editContract(contractNumber) {
    console.log('Editing contract:', contractNumber);
}

/**
 * Löscht einen Vertrag
 * @param {string} contractNumber - Die Vertragsnummer
 */
function deleteContract(contractNumber) {
    if (confirm(`Möchten Sie den Vertrag ${contractNumber} wirklich löschen?`)) {
        console.log('Deleting contract:', contractNumber);
    }
}

// Initialisiere das Verträge-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initVertrage();
}
