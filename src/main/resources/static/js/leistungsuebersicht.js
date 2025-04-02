/**
 * Initialisiert die Leistungsübersicht
 * @function
 */
function initLeistungsuebersicht() {
    loadPerformanceData();
    initializeCharts();
}

/**
 * Lädt die Performance-Daten
 * @function
 */
function loadPerformanceData() {
    // Dummy-Daten für die Übersichtskarten
    document.getElementById('activeBrokers').textContent = '42';
    document.getElementById('totalContracts').textContent = '856';
    document.getElementById('totalCommissions').textContent = '985.450 €';
    document.getElementById('avgTarget').textContent = '92%';

    // Dummy-Daten für Top Performer
    const topPerformers = [
        {
            rank: 1,
            name: 'Thomas Schmidt',
            region: 'Nord',
            contracts: 86,
            commission: '165.420 €',
            target: '120%',
            trend: 'up'
        },
        {
            rank: 2,
            name: 'Maria Weber',
            region: 'Süd',
            contracts: 74,
            commission: '142.850 €',
            target: '115%',
            trend: 'up'
        },
        {
            rank: 3,
            name: 'Stefan Meyer',
            region: 'West',
            contracts: 68,
            commission: '128.640 €',
            target: '108%',
            trend: 'down'
        },
        {
            rank: 4,
            name: 'Julia Koch',
            region: 'Ost',
            contracts: 65,
            commission: '124.800 €',
            target: '105%',
            trend: 'up'
        },
        {
            rank: 5,
            name: 'Michael Wagner',
            region: 'Nord',
            contracts: 62,
            commission: '118.450 €',
            target: '102%',
            trend: 'stable'
        }
    ];

    const tableBody = document.getElementById('topPerformerTableBody');
    tableBody.innerHTML = topPerformers.map(performer => `
        <tr>
            <td>${performer.rank}</td>
            <td>${performer.name}</td>
            <td>${performer.region}</td>
            <td>${performer.contracts}</td>
            <td>${performer.commission}</td>
            <td>
                <div class="progress" style="height: 5px;">
                    <div class="progress-bar" role="progressbar" style="width: ${performer.target};" 
                         aria-valuenow="${parseInt(performer.target)}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
                <small class="mt-1 d-block">${performer.target}</small>
            </td>
            <td>
                <i class="bi bi-arrow-${performer.trend} text-${getTrendColor(performer.trend)}"></i>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Charts
 * @function
 */
function initializeCharts() {
    // Jahresverlauf Chart
    const yearlyCtx = document.getElementById('yearlyPerformanceChart').getContext('2d');
    new Chart(yearlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Abschlüsse',
                    data: [65, 72, 86, 81, 74, 88, 92, 85, 78, 95, 89, 84],
                    borderColor: '#2c7be5',
                    tension: 0.4
                },
                {
                    label: 'Provisionen (Tsd. €)',
                    data: [125, 138, 165, 155, 142, 168, 176, 163, 150, 182, 170, 160],
                    borderColor: '#00d97e',
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
                    beginAtZero: true
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
 * Gibt die Farbe für einen Trend zurück
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

// Initialisiere die Leistungsübersicht wenn sie geladen wird
if (typeof router !== 'undefined') {
    initLeistungsuebersicht();
}
