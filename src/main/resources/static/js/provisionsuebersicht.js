/**
 * Initialisiert die Provisionsübersicht
 * @function
 */
function initProvisionsuebersicht() {
    loadStatistics();
    loadCommissionsData();
    initializeCharts();
    initializeFilters();
}

/**
 * Lädt die Statistiken
 * @function
 */
function loadStatistics() {
    document.getElementById('totalCommissions').textContent = '985.450 €';
    document.getElementById('avgCommissionPerBroker').textContent = '23.463 €';
    document.getElementById('pendingPayouts').textContent = '156.780 €';
    document.getElementById('yearOverYearGrowth').textContent = '+15,8%';
}

/**
 * Lädt die Provisionsdaten
 * @function
 */
function loadCommissionsData() {
    // Dummy-Daten für Provisionen
    const commissions = [
        {
            id: 'M2024001',
            broker: 'Thomas Schmidt',
            region: 'Nord',
            contracts: 86,
            commission: '165.420 €',
            avgCommission: '1.923 €',
            trend: 'up',
            status: 'active'
        },
        {
            id: 'M2024002',
            broker: 'Maria Weber',
            region: 'Süd',
            contracts: 74,
            commission: '142.850 €',
            avgCommission: '1.930 €',
            trend: 'up',
            status: 'active'
        },
        {
            id: 'M2024003',
            broker: 'Stefan Meyer',
            region: 'West',
            contracts: 68,
            commission: '128.640 €',
            avgCommission: '1.892 €',
            trend: 'down',
            status: 'pending'
        }
    ];

    const tableBody = document.getElementById('commissionsTableBody');
    tableBody.innerHTML = commissions.map(c => `
        <tr>
            <td>${c.broker}</td>
            <td>${c.region}</td>
            <td>${c.contracts}</td>
            <td>${c.commission}</td>
            <td>${c.avgCommission}</td>
            <td>
                <i class="bi bi-arrow-${c.trend} text-${getTrendColor(c.trend)}"></i>
            </td>
            <td><span class="badge bg-${getStatusBadgeClass(c.status)}">${getStatusText(c.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewBrokerDetails('${c.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="processPayment('${c.id}')">
                    <i class="bi bi-cash"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="downloadStatement('${c.id}')">
                    <i class="bi bi-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Charts
 * @function
 */
function initializeCharts() {
    // Provisionsentwicklung Chart
    const commissionsCtx = document.getElementById('commissionsChart').getContext('2d');
    new Chart(commissionsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Provisionen 2024',
                    data: [85000, 92000, 88000, 95000, 102000, 98000, 105000, 110000, 107000, 115000, 112000, 108000],
                    borderColor: '#2c7be5',
                    tension: 0.4
                },
                {
                    label: 'Provisionen 2023',
                    data: [75000, 78000, 82000, 80000, 85000, 88000, 92000, 95000, 90000, 98000, 96000, 94000],
                    borderColor: '#d8e2ef',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => value.toLocaleString() + ' €'
                    }
                }
            }
        }
    });

    // Produkt-Verteilung Chart
    const productCtx = document.getElementById('productDistributionChart').getContext('2d');
    new Chart(productCtx, {
        type: 'doughnut',
        data: {
            labels: ['Leben', 'KFZ', 'Sach', 'Kranken', 'Sonstige'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#2c7be5',
                    '#00d97e',
                    '#6b5eae',
                    '#e63757',
                    '#39afd1'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Initialisiert die Filter
 * @function
 */
function initializeFilters() {
    document.getElementById('regionFilter').addEventListener('change', filterCommissions);
    document.getElementById('statusFilter').addEventListener('change', filterCommissions);
    document.getElementById('periodFilter').addEventListener('change', filterCommissions);
    document.getElementById('searchCommissions').addEventListener('input', filterCommissions);
}

/**
 * Filtert die Provisionsdaten
 * @function
 */
function filterCommissions() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering commissions...');
}

/**
 * Zeigt die Details eines Maklers an
 * @param {string} brokerId - Die ID des Maklers
 */
function viewBrokerDetails(brokerId) {
    // Dummy-Daten für Makler-Details
    const broker = {
        personal: {
            id: 'M2024001',
            name: 'Thomas Schmidt',
            region: 'Nord',
            status: 'Aktiv',
            since: '01.01.2024'
        },
        performance: {
            currentYear: {
                contracts: 86,
                commission: '165.420 €',
                target: '120%'
            },
            lastYear: {
                contracts: 312,
                commission: '585.840 €',
                target: '115%'
            }
        },
        history: [
            {
                date: '29.03.2024',
                contract: 'V2024-156',
                product: 'KFZ-Versicherung',
                commission: '450 €',
                status: 'pending'
            },
            {
                date: '25.03.2024',
                contract: 'V2024-155',
                product: 'Lebensversicherung',
                commission: '1.250 €',
                status: 'paid'
            },
            {
                date: '20.03.2024',
                contract: 'V2024-154',
                product: 'Hausratversicherung',
                commission: '380 €',
                status: 'paid'
            }
        ]
    };

    // Makler-Informationen
    document.getElementById('brokerInfo').innerHTML = `
        <dl class="row mb-0">
            <dt class="col-sm-4">Makler-ID</dt>
            <dd class="col-sm-8">${broker.personal.id}</dd>
            
            <dt class="col-sm-4">Name</dt>
            <dd class="col-sm-8">${broker.personal.name}</dd>
            
            <dt class="col-sm-4">Region</dt>
            <dd class="col-sm-8">${broker.personal.region}</dd>
            
            <dt class="col-sm-4">Status</dt>
            <dd class="col-sm-8">${broker.personal.status}</dd>
            
            <dt class="col-sm-4">Dabei seit</dt>
            <dd class="col-sm-8">${broker.personal.since}</dd>
        </dl>
    `;

    // Performance
    document.getElementById('brokerPerformance').innerHTML = `
        <h6>Aktuelles Jahr</h6>
        <dl class="row mb-3">
            <dt class="col-sm-4">Abschlüsse</dt>
            <dd class="col-sm-8">${broker.performance.currentYear.contracts}</dd>
            
            <dt class="col-sm-4">Provision</dt>
            <dd class="col-sm-8">${broker.performance.currentYear.commission}</dd>
            
            <dt class="col-sm-4">Zielerfüllung</dt>
            <dd class="col-sm-8">${broker.performance.currentYear.target}</dd>
        </dl>
        
        <h6>Vorjahr</h6>
        <dl class="row mb-0">
            <dt class="col-sm-4">Abschlüsse</dt>
            <dd class="col-sm-8">${broker.performance.lastYear.contracts}</dd>
            
            <dt class="col-sm-4">Provision</dt>
            <dd class="col-sm-8">${broker.performance.lastYear.commission}</dd>
            
            <dt class="col-sm-4">Zielerfüllung</dt>
            <dd class="col-sm-8">${broker.performance.lastYear.target}</dd>
        </dl>
    `;

    // Provisionshistorie
    document.getElementById('brokerCommissionsHistory').innerHTML = broker.history.map(h => `
        <tr>
            <td>${h.date}</td>
            <td>${h.contract}</td>
            <td>${h.product}</td>
            <td>${h.commission}</td>
            <td><span class="badge bg-${getStatusBadgeClass(h.status)}">${getStatusText(h.status)}</span></td>
        </tr>
    `).join('');

    // Produkt-Chart
    const chartCtx = document.getElementById('brokerProductChart').getContext('2d');
    new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: ['Leben', 'KFZ', 'Sach', 'Kranken', 'Sonstige'],
            datasets: [{
                label: 'Provision nach Produkten',
                data: [58500, 42350, 35420, 24150, 5000],
                backgroundColor: [
                    '#2c7be5',
                    '#00d97e',
                    '#6b5eae',
                    '#e63757',
                    '#39afd1'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => value.toLocaleString() + ' €'
                    }
                }
            }
        }
    });

    const modal = new bootstrap.Modal(document.getElementById('brokerDetailsModal'));
    modal.show();
}

/**
 * Verarbeitet eine Provisionszahlung
 * @param {string} brokerId - Die ID des Maklers
 */
function processPayment(brokerId) {
    console.log('Processing payment for broker:', brokerId);
}

/**
 * Lädt eine Provisionsabrechnung herunter
 * @param {string} brokerId - Die ID des Maklers
 */
function downloadStatement(brokerId) {
    console.log('Downloading statement for broker:', brokerId);
}

/**
 * Exportiert die Provisionsdaten
 * @function
 */
function exportProvisions() {
    console.log('Exporting provisions...');
}

/**
 * Speichert die Provisionseinstellungen
 * @function
 */
function saveProvisionSettings() {
    console.log('Saving provision settings...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('provisionSettingsModal'));
    modal.hide();
}

/**
 * Fügt eine neue Bonus-Stufe hinzu
 * @function
 */
function addBonusLevel() {
    const bonusLevels = document.getElementById('bonusLevels');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="number" class="form-control" value="0"></td>
        <td><input type="number" class="form-control" value="0"></td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    bonusLevels.appendChild(newRow);
}

/**
 * Gibt die CSS-Klasse für die Trend-Farbe zurück
 * @param {string} trend - Der Trend (up, down, stable)
 * @returns {string} Die CSS-Klasse für die Farbe
 */
function getTrendColor(trend) {
    switch(trend) {
        case 'up': return 'success';
        case 'down': return 'danger';
        case 'stable': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'paid': return 'success';
        case 'processing': return 'info';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'active': return 'Aktiv';
        case 'pending': return 'Ausstehend';
        case 'paid': return 'Ausgezahlt';
        case 'processing': return 'In Bearbeitung';
        default: return status;
    }
}

// Initialisiere die Provisionsübersicht wenn sie geladen wird
if (typeof router !== 'undefined') {
    initProvisionsuebersicht();
}
