/**
 * Initialisiert das Provisionen-Modul
 * @function
 */
function initProvisionen() {
    loadSummary();
    loadCommissions();
    initializeEventListeners();
}

/**
 * Lädt die Zusammenfassungsdaten
 * @function
 */
function loadSummary() {
    // Dummy-Daten für die Übersichtskarten
    document.getElementById('mtdCommission').textContent = '4.582,40 €';
    document.getElementById('ytdCommission').textContent = '38.947,65 €';
    document.getElementById('pendingCommission').textContent = '2.845,00 €';
    document.getElementById('cancelationReserve').textContent = '5.420,80 €';
}

/**
 * Lädt die Dummy-Provisionsdaten
 * @function
 */
function loadCommissions() {
    const commissions = [
        {
            date: '15.03.2024',
            contractNumber: 'VS-2024-001',
            customer: 'Thomas Schmidt',
            type: 'KFZ-Versicherung',
            yearlyFee: '1.074,00 €',
            commission: '107,40 €',
            status: 'paid',
            id: 'com1'
        },
        {
            date: '01.03.2024',
            contractNumber: 'VS-2024-002',
            customer: 'Maria Müller',
            type: 'Hausratversicherung',
            yearlyFee: '248,40 €',
            commission: '24,84 €',
            status: 'pending',
            id: 'com2'
        },
        {
            date: '01.02.2024',
            contractNumber: 'VS-2024-003',
            customer: 'Peter Wagner',
            type: 'Lebensversicherung',
            yearlyFee: '1.840,00 €',
            commission: '460,00 €',
            status: 'paid',
            id: 'com3'
        }
    ];

    const tableBody = document.getElementById('commissionsTableBody');
    tableBody.innerHTML = commissions.map(commission => `
        <tr>
            <td>${commission.date}</td>
            <td>${commission.contractNumber}</td>
            <td>${commission.customer}</td>
            <td>${commission.type}</td>
            <td>${commission.yearlyFee}</td>
            <td>${commission.commission}</td>
            <td><span class="badge bg-${getStatusBadgeClass(commission.status)}">${getStatusText(commission.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewCommissionDetails('${commission.id}')">
                    <i class="bi bi-eye"></i>
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
    // Zeitraumfilter
    document.getElementById('timePeriod').addEventListener('change', filterCommissions);
    
    // Statusfilter
    document.getElementById('commissionStatus').addEventListener('change', filterCommissions);
    
    // Versicherungsartfilter
    document.getElementById('insuranceType').addEventListener('change', filterCommissions);
    
    // Suche
    document.getElementById('searchCommissions').addEventListener('input', filterCommissions);
}

/**
 * Filtert die Provisionen basierend auf den ausgewählten Kriterien
 * @function
 */
function filterCommissions() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering commissions...');
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status der Provision
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status der Provision
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'paid': return 'Ausgezahlt';
        case 'pending': return 'Ausstehend';
        case 'cancelled': return 'Storniert';
        default: return status;
    }
}

/**
 * Zeigt die Details einer Provision an
 * @param {string} commissionId - Die ID der Provision
 */
function viewCommissionDetails(commissionId) {
    // Dummy-Daten für die Detailansicht
    const details = {
        contractNumber: 'VS-2024-001',
        customer: 'Thomas Schmidt',
        type: 'KFZ-Versicherung',
        date: '15.03.2024',
        yearlyFee: '1.074,00 €',
        commission: '107,40 €',
        status: 'Ausgezahlt',
        paymentDate: '20.03.2024',
        bankAccount: 'DE89 3704 0044 0532 0130 00',
        notes: 'Erstprovision'
    };

    const detailsContainer = document.getElementById('commissionDetails');
    detailsContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-bold">Vertragsnummer</label>
                <p>${details.contractNumber}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Kunde</label>
                <p>${details.customer}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Versicherungsart</label>
                <p>${details.type}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Datum</label>
                <p>${details.date}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Jahresbeitrag</label>
                <p>${details.yearlyFee}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Provision</label>
                <p>${details.commission}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Status</label>
                <p>${details.status}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Auszahlungsdatum</label>
                <p>${details.paymentDate}</p>
            </div>
            <div class="col-md-12">
                <label class="form-label fw-bold">Bankverbindung</label>
                <p>${details.bankAccount}</p>
            </div>
            <div class="col-md-12">
                <label class="form-label fw-bold">Anmerkungen</label>
                <p>${details.notes}</p>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('commissionDetailsModal'));
    modal.show();
}

/**
 * Exportiert die Provisionsdetails
 * @function
 */
function exportCommissionDetails() {
    console.log('Exporting commission details...');
    // Hier würde die Export-Logik implementiert
}

// Initialisiere das Provisionen-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initProvisionen();
}
