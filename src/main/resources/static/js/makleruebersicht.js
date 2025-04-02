/**
 * Initialisiert die Maklerübersicht
 * @function
 */
function initMakleruebersicht() {
    loadMaklerData();
    initializeFilters();
}

/**
 * Lädt die Maklerdaten
 * @function
 */
function loadMaklerData() {
    // Dummy-Daten für Makler
    const makler = [
        {
            id: 'M2024001',
            firstName: 'Susanne',
            lastName: 'vom Stein',
            region: 'nord',
            status: 'active',
            contracts: 24,
            commission: '45.680,00 €',
            lastActivity: '29.03.2024',
            email: 's.vomstein@stein.de',
            phone: '+49 176 12345678',
            qualifications: ['IHK-geprüft', 'DVEP-zertifiziert'],
            performance: {
                ytd: {
                    contracts: 24,
                    commission: 45680.00,
                    target: 85
                }
            }
        },
        {
            id: 'M2024002',
            firstName: 'Kornelia',
            lastName: 'Pticar',
            region: 'sued',
            status: 'active',
            contracts: 18,
            commission: '38.450,00 €',
            lastActivity: '28.03.2024',
            email: 'k.pticar@pticar.de',
            phone: '+49 176 87654321',
            qualifications: ['IHK-geprüft'],
            performance: {
                ytd: {
                    contracts: 18,
                    commission: 38450.00,
                    target: 75
                }
            }
        },
        {
            id: 'M2024003',
            firstName: 'Michael',
            lastName: 'Möhre',
            region: 'west',
            status: 'pending',
            contracts: 0,
            commission: '0,00 €',
            lastActivity: '25.03.2024',
            email: 'm.moehre@moehre.de',
            phone: '+49 176 11223344',
            qualifications: [],
            performance: {
                ytd: {
                    contracts: 0,
                    commission: 0,
                    target: 0
                }
            }
        }
    ];

    const tableBody = document.getElementById('maklerTableBody');
    tableBody.innerHTML = makler.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${m.firstName} ${m.lastName}</td>
            <td>${getRegionText(m.region)}</td>
            <td><span class="badge bg-${getStatusBadgeClass(m.status)}">${getStatusText(m.status)}</span></td>
            <td>${m.contracts}</td>
            <td>${m.commission}</td>
            <td>${m.lastActivity}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewMaklerDetails('${m.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="contactMakler('${m.id}')">
                    <i class="bi bi-chat"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="editMakler('${m.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Filter
 * @function
 */
function initializeFilters() {
    // Status Filter
    document.getElementById('statusFilter').addEventListener('change', filterMakler);
    
    // Region Filter
    document.getElementById('regionFilter').addEventListener('change', filterMakler);
    
    // Qualifikation Filter
    document.getElementById('qualificationFilter').addEventListener('change', filterMakler);
    
    // Suche
    document.getElementById('searchMakler').addEventListener('input', filterMakler);
}

/**
 * Filtert die Maklerliste
 * @function
 */
function filterMakler() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering makler...');
}

/**
 * Zeigt die Details eines Maklers an
 * @param {string} maklerId - Die ID des Maklers
 */
function viewMaklerDetails(maklerId) {
    // Dummy-Daten für Makler-Details
    const maklerDetails = {
        personal: {
            id: 'M2024001',
            firstName: 'Thomas',
            lastName: 'Schmidt',
            email: 't.schmidt@email.de',
            phone: '+49 176 12345678',
            address: 'Musterstraße 123, 12345 Musterstadt',
            region: 'Nord',
            status: 'active',
            joinDate: '01.01.2024'
        },
        qualifications: [
            {
                name: 'IHK-Prüfung',
                date: '15.12.2023',
                validUntil: '14.12.2026',
                status: 'valid'
            },
            {
                name: 'DVEP-Zertifizierung',
                date: '20.02.2024',
                validUntil: '19.02.2025',
                status: 'valid'
            }
        ],
        performance: {
            currentYear: {
                contracts: 24,
                commission: '45.680,00 €',
                target: '85%'
            },
            lastYear: {
                contracts: 86,
                commission: '165.420,00 €',
                target: '120%'
            }
        }
    };

    // Profile Tab
    document.getElementById('profile').innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="card-title mb-0">Persönliche Informationen</h6>
                    </div>
                    <div class="card-body">
                        <dl class="row mb-0">
                            <dt class="col-sm-4">Makler-ID</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.id}</dd>
                            
                            <dt class="col-sm-4">Name</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.firstName} ${maklerDetails.personal.lastName}</dd>
                            
                            <dt class="col-sm-4">E-Mail</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.email}</dd>
                            
                            <dt class="col-sm-4">Telefon</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.phone}</dd>
                            
                            <dt class="col-sm-4">Adresse</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.address}</dd>
                            
                            <dt class="col-sm-4">Region</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.region}</dd>
                            
                            <dt class="col-sm-4">Status</dt>
                            <dd class="col-sm-8">
                                <span class="badge bg-${getStatusBadgeClass(maklerDetails.personal.status)}">
                                    ${getStatusText(maklerDetails.personal.status)}
                                </span>
                            </dd>
                            
                            <dt class="col-sm-4">Dabei seit</dt>
                            <dd class="col-sm-8">${maklerDetails.personal.joinDate}</dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="card-title mb-0">Performance</h6>
                    </div>
                    <div class="card-body">
                        <h6>Aktuelles Jahr</h6>
                        <dl class="row mb-3">
                            <dt class="col-sm-4">Abschlüsse</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.currentYear.contracts}</dd>
                            
                            <dt class="col-sm-4">Provision</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.currentYear.commission}</dd>
                            
                            <dt class="col-sm-4">Zielerfüllung</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.currentYear.target}</dd>
                        </dl>
                        
                        <h6>Vorjahr</h6>
                        <dl class="row mb-0">
                            <dt class="col-sm-4">Abschlüsse</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.lastYear.contracts}</dd>
                            
                            <dt class="col-sm-4">Provision</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.lastYear.commission}</dd>
                            
                            <dt class="col-sm-4">Zielerfüllung</dt>
                            <dd class="col-sm-8">${maklerDetails.performance.lastYear.target}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Qualifikationen Tab
    const qualificationsHtml = maklerDetails.qualifications.map(qual => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${qual.name}</h6>
                        <small class="text-muted">Erworben am: ${qual.date}</small>
                    </div>
                    <span class="badge bg-${qual.status === 'valid' ? 'success' : 'danger'}">
                        Gültig bis: ${qual.validUntil}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('qualifications').innerHTML = qualificationsHtml;

    const modal = new bootstrap.Modal(document.getElementById('maklerDetailsModal'));
    modal.show();
}

/**
 * Öffnet den Chat mit einem Makler
 * @param {string} maklerId - Die ID des Maklers
 */
function contactMakler(maklerId) {
    // Implementierung des Chats hier
    console.log('Opening chat with makler:', maklerId);
}

/**
 * Öffnet den Bearbeitungsmodus für einen Makler
 * @param {string} maklerId - Die ID des Maklers
 */
function editMakler(maklerId) {
    // Implementierung der Bearbeitung hier
    console.log('Editing makler:', maklerId);
}

/**
 * Erstellt einen neuen Makler
 * @function
 */
function createMakler() {
    const form = document.getElementById('newMaklerForm');
    // Implementierung der Makler-Erstellung hier
    console.log('Creating new makler...');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addMaklerModal'));
    modal.hide();
}

/**
 * Gibt den Text für eine Region zurück
 * @param {string} region - Der Regionscode
 * @returns {string} Der übersetzte Regionstext
 */
function getRegionText(region) {
    const regions = {
        'nord': 'Nord',
        'sued': 'Süd',
        'west': 'West',
        'ost': 'Ost'
    };
    return regions[region] || region;
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status des Maklers
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'success';
        case 'inactive': return 'danger';
        case 'pending': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status des Maklers
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'active': return 'Aktiv';
        case 'inactive': return 'Inaktiv';
        case 'pending': return 'In Prüfung';
        default: return status;
    }
}

// Initialisiere die Maklerübersicht wenn sie geladen wird
if (typeof router !== 'undefined') {
    initMakleruebersicht();
}
