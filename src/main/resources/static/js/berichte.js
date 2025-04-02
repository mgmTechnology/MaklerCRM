/**
 * Initialisiert die Berichte-Seite
 */
function initBerichte() {
    console.log('Initialisiere Berichte...');
    loadStatistics();
    loadTopPerformers();
    loadKPIs();
    initializeCharts();
}

/**
 * Lädt die Statistiken
 * @function
 */
function loadStatistics() {
    document.getElementById('activeBrokers').textContent = '42';
    document.getElementById('avgContracts').textContent = '8,5';
    document.getElementById('avgCommission').textContent = '1.850 €';
    document.getElementById('cancellationRate').textContent = '3,2%';
}

/**
 * Lädt die Top Performer
 * @function
 */
function loadTopPerformers() {
    // Realistische Dummy-Daten für Top Performer
    const performers = [
        {
            name: 'Thomas Schmidt',
            contracts: 28,
            commission: '52.450 €',
            trend: 'up'
        },
        {
            name: 'Maria Weber',
            contracts: 25,
            commission: '48.320 €',
            trend: 'up'
        },
        {
            name: 'Stefan Meyer',
            contracts: 22,
            commission: '42.180 €',
            trend: 'down'
        },
        {
            name: 'Laura Müller',
            contracts: 21,
            commission: '40.950 €',
            trend: 'up'
        },
        {
            name: 'Michael Wagner',
            contracts: 19,
            commission: '37.840 €',
            trend: 'stable'
        }
    ];

    const tableBody = document.getElementById('topPerformersTable');
    tableBody.innerHTML = performers.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.contracts}</td>
            <td>${p.commission}</td>
            <td>
                <i class="bi bi-arrow-${p.trend} text-${getTrendColor(p.trend)}"></i>
            </td>
        </tr>
    `).join('');
}

/**
 * Lädt die KPIs
 * @function
 */
function loadKPIs() {
    // Realistische Dummy-Daten für KPIs
    const kpis = [
        {
            name: 'Vertragsabschlüsse',
            current: '358',
            previous: '325',
            change: '+10,2%',
            status: 'success'
        },
        {
            name: 'Durchschnittliche Provision',
            current: '1.850 €',
            previous: '1.780 €',
            change: '+3,9%',
            status: 'success'
        },
        {
            name: 'Stornoquote',
            current: '3,2%',
            previous: '3,5%',
            change: '-8,6%',
            status: 'success'
        },
        {
            name: 'Bearbeitungszeit (Ø)',
            current: '2,8 Tage',
            previous: '3,2 Tage',
            change: '-12,5%',
            status: 'success'
        },
        {
            name: 'Kundenzufriedenheit',
            current: '4,6/5,0',
            previous: '4,4/5,0',
            change: '+4,5%',
            status: 'success'
        },
        {
            name: 'Cross-Selling-Quote',
            current: '28,5%',
            previous: '25,8%',
            change: '+10,5%',
            status: 'success'
        },
        {
            name: 'Neukundenquote',
            current: '15,8%',
            previous: '14,2%',
            change: '+11,3%',
            status: 'success'
        }
    ];

    const tableBody = document.getElementById('kpiTable');
    tableBody.innerHTML = kpis.map(kpi => `
        <tr>
            <td>${kpi.name}</td>
            <td>${kpi.current}</td>
            <td>${kpi.previous}</td>
            <td><span class="text-${kpi.status}">${kpi.change}</span></td>
            <td>
                <span class="badge bg-${kpi.status}">
                    <i class="bi bi-check-circle"></i>
                </span>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Charts und Visualisierungen
 * @function
 */
function initializeCharts() {
    initVertragsentwicklung();
    initProduktverteilung();
    initRegionaleVerteilung();
}

/**
 * Initialisiert das Chart für die Vertragsentwicklung
 * @function
 */
function initVertragsentwicklung() {
    const ctx = document.getElementById('vertragsentwicklungChart').getContext('2d');
    const data = {
        labels: ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        datasets: [{
            label: 'Abschlüsse',
            data: [12, 15, 18, 22, 25, 28, 30, 32, 35, 38, 40, 42],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1,
            fill: false
        }, {
            label: 'Provisionen (in Tsd. €)',
            data: [20, 25, 30, 35, 40, 45, 48, 50, 52, 55, 58, 60],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
        }]
    };
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Initialisiert das Chart für die Produktverteilung
 * @function
 */
function initProduktverteilung() {
    const ctx = document.getElementById('produktverteilungChart').getContext('2d');
    const data = {
        labels: ['Lebensversicherung', 'KFZ', 'Hausrat', 'Haftpflicht', 'Kranken'],
        datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(75, 192, 192)',
                'rgb(255, 205, 86)',
                'rgb(255, 99, 132)',
                'rgb(153, 102, 255)'
            ]
        }]
    };
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Initialisiert das Chart für die regionale Verteilung
 * @function
 */
function initRegionaleVerteilung() {
    const ctx = document.getElementById('regionaleVerteilungChart').getContext('2d');
    const data = {
        labels: ['Nord', 'Süd', 'West', 'Ost'],
        datasets: [{
            label: 'Verträge pro Region',
            data: [250, 320, 280, 190],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
        }]
    };
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Hilfsfunktion für die Trendfarben
 * @param {string} trend - Der Trend (up, down, stable)
 * @returns {string} Die entsprechende Bootstrap-Farbe
 */
function getTrendColor(trend) {
    switch(trend) {
        case 'up': return 'success';
        case 'down': return 'danger';
        case 'stable': return 'warning';
        default: return 'secondary';
    }
}

// Initialisiere die Berichte wenn sie geladen werden
if (typeof router !== 'undefined') {
    initBerichte();
}
