<?php
/**
 * Run Chart Visualisierung für Endpoint Monitoring
 * 
 * Dieses Script visualisiert die protokollierten Antwortzeiten als Run Chart.
 */

// Konstanten definieren
define('LOG_FILE', 'response_times.csv');

// Prüfen, ob die Log-Datei existiert
if (!file_exists(LOG_FILE)) {
    die('Log-Datei nicht gefunden. Bitte führen Sie zuerst eine Website-Prüfung durch.');
}

// Daten aus der CSV-Datei lesen
function readLogData() {
    $data = [];
    $handle = fopen(LOG_FILE, 'r');
    
    // Header lesen
    $headers = fgetcsv($handle);
    
    // Daten lesen
    while (($row = fgetcsv($handle)) !== false) {
        // Sicherstellen, dass die Anzahl der Werte mit der Anzahl der Header übereinstimmt
        if (count($headers) != count($row)) {
            // Fehlende Werte auffüllen oder überschüssige entfernen
            if (count($headers) > count($row)) {
                // Fehlende Werte auffüllen
                $row = array_pad($row, count($headers), '');
            } else {
                // Überschüssige Werte entfernen
                $row = array_slice($row, 0, count($headers));
            }
        }
        $data[] = array_combine($headers, $row);
    }
    
    fclose($handle);
    return $data;
}

$logData = readLogData();

// Eindeutige URLs extrahieren
$urls = array_unique(array_column($logData, 'URL'));
?>

<!DOCTYPE html>
<html lang="de" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Run Chart</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- DataTables CSS -->
    <link href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        .chart-container {
            height: 500px;
            margin-bottom: 30px;
        }
        .failed-point {
            background-color: rgba(255, 0, 0, 0.2);
            border: 1px solid red;
        }
        
        /* Dark theme styles */
        [data-bs-theme="dark"] {
            --bs-body-bg: #212529;
            --bs-body-color: #f8f9fa;
        }
        
        [data-bs-theme="dark"] .card {
            background-color: #343a40;
            border-color: #495057;
        }
        
        [data-bs-theme="dark"] .card-header {
            background-color: #495057;
            border-color: #6c757d;
        }
        
        [data-bs-theme="dark"] .table {
            color: #f8f9fa;
        }
        
        [data-bs-theme="dark"] .form-control,
        [data-bs-theme="dark"] .form-select {
            background-color: #343a40;
            border-color: #495057;
            color: #f8f9fa;
        }
        
        .theme-switch {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <!-- Theme Switch Button -->
    <div class="theme-switch">
        <button id="theme-toggle" class="btn btn-outline-primary">
            <i class="bi bi-moon-stars"></i> Dark Mode
        </button>
    </div>
    
    <div class="container py-4">
        <header class="pb-3 mb-4 border-bottom">
            <h1 class="display-5 fw-bold">
                <i class="bi bi-graph-up"></i>Run Chart
            </h1>
            <p class="lead">Visualisierung der Antwortzeiten</p>
        </header>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Filter</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="url-filter" class="form-label">URL:</label>
                            <select class="form-select" id="url-filter">
                                <option value="all">Alle URLs anzeigen</option>
                                <?php foreach ($urls as $url): ?>
                                    <option value="<?php echo htmlspecialchars($url); ?>"><?php echo htmlspecialchars($url); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="time-range" class="form-label">Zeitraum:</label>
                            <select class="form-select" id="time-range">
                                <option value="24h">Letzte 24 Stunden</option>
                                <option value="7d">Letzte 7 Tage</option>
                                <option value="30d">Letzte 30 Tage</option>
                                <option value="all" selected>Alle Daten</option>
                            </select>
                        </div>
                        
                        <button id="apply-filter" class="btn btn-primary">
                            <i class="bi bi-funnel"></i> Filter anwenden
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Statistik</h5>
                    </div>
                    <div class="card-body">
                        <div id="stats-container">
                            <p><strong>Gesamtanzahl der Messungen:</strong> <span id="total-measurements">0</span></p>
                            <p><strong>Überwachte URLs:</strong> <span id="total-urls">0</span></p>
                            <p><strong>Durchschnittliche Antwortzeit:</strong> <span id="avg-response-time">0</span> ms</p>
                            <p><strong>Maximale Antwortzeit:</strong> <span id="max-response-time">0</span> ms</p>
                            <p><strong>Minimale Antwortzeit:</strong> <span id="min-response-time">0</span> ms</p>
                            <p><strong>Erfolgsrate (HTTP):</strong> <span id="success-rate">0</span>%</p>
                            <p><strong>Erfolgsrate (Content-Check):</strong> <span id="content-check-success-rate">0</span>%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Run Chart der Antwortzeiten</h5>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="responseTimeChart"></canvas>
                </div>
                <div class="mt-3">
                    <div class="d-flex align-items-center">
                        <div style="width: 20px; height: 20px; background-color: rgba(255, 0, 0, 0.2); border: 1px solid red; margin-right: 10px;"></div>
                        <span>Fehlgeschlagene Prüfungen</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Daten</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover" id="data-table">
                        <thead>
                            <tr>
                                <th>Zeitstempel</th>
                                <th>URL</th>
                                <th>Status</th>
                                <th>Antwortzeit (ms)</th>
                                <th>HTTP-Erfolg</th>
                                <th>Content-Check</th>
                                <th>Content-Check-Erfolg</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Wird durch JavaScript gefüllt -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <a href="index.php" class="btn btn-secondary">
                <i class="bi bi-arrow-left"></i> Zurück zum Monitoring
            </a>
        </div>
    </div>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- DataTables JS -->
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
    
    <!-- Bootstrap JS Bundle mit Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Daten aus PHP in JavaScript verfügbar machen
        const logData = <?php echo json_encode($logData); ?>;
        let dataTable;

        // Warte auf DOM-Loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Theme-Switcher
            document.getElementById('theme-toggle').addEventListener('click', function() {
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-bs-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                html.setAttribute('data-bs-theme', newTheme);
                
                // DataTable neu initialisieren, um Styling anzupassen
                if (dataTable) {
                    dataTable.destroy();
                    updateTable(filterData());
                }
            });

            // Gespeichertes Theme beim Laden anwenden
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-bs-theme', savedTheme);
                
                // Button-Text und Icon aktualisieren
                const button = document.getElementById('theme-toggle');
                if (savedTheme === 'dark') {
                    button.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
                }
            }

            // Filter-Button
            const filterButton = document.getElementById('apply-filter');
            if (filterButton) {
                filterButton.addEventListener('click', updateViews);
            }

            // Initialisierung
            updateViews();
        });
        
        // Funktion zum Filtern der Daten
        function filterData() {
            const urlFilter = document.getElementById('url-filter').value;
            const timeRange = document.getElementById('time-range').value;
            
            // Daten nach URL filtern
            let filteredData = logData;
            if (urlFilter !== 'all') {
                filteredData = filteredData.filter(item => item.URL === urlFilter);
            }
            
            // Daten nach Zeitraum filtern
            const now = new Date();
            if (timeRange !== 'all') {
                let cutoffDate;
                
                if (timeRange === '24h') {
                    cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                } else if (timeRange === '7d') {
                    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                } else if (timeRange === '30d') {
                    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }
                
                filteredData = filteredData.filter(item => {
                    const itemDate = new Date(item.Timestamp);
                    return itemDate >= cutoffDate;
                });
            }
            
            return filteredData;
        }
        
        // Funktion zum Aktualisieren der Statistik
        function updateStats(data) {
            if (data.length === 0) {
                document.getElementById('total-measurements').textContent = '0';
                document.getElementById('total-urls').textContent = '0';
                document.getElementById('avg-response-time').textContent = '0';
                document.getElementById('max-response-time').textContent = '0';
                document.getElementById('min-response-time').textContent = '0';
                document.getElementById('success-rate').textContent = '0';
                document.getElementById('content-check-success-rate').textContent = '0';
                return;
            }
            
            // Anzahl der Messungen
            document.getElementById('total-measurements').textContent = data.length;
            
            // Anzahl der überwachten URLs
            const uniqueUrls = new Set(data.map(item => item.URL));
            document.getElementById('total-urls').textContent = uniqueUrls.size;
            
            // Antwortzeiten berechnen
            const responseTimes = data.map(item => parseFloat(item['Response Time (ms)']));
            
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);
            const minResponseTime = Math.min(...responseTimes);
            
            document.getElementById('avg-response-time').textContent = avgResponseTime.toFixed(2);
            document.getElementById('max-response-time').textContent = maxResponseTime.toFixed(2);
            document.getElementById('min-response-time').textContent = minResponseTime.toFixed(2);
            
            // Erfolgsrate berechnen (HTTP)
            const successfulRequests = data.filter(item => item.Success === 'Yes').length;
            const successRate = (successfulRequests / data.length) * 100;
            document.getElementById('success-rate').textContent = successRate.toFixed(2);
            
            // Erfolgsrate berechnen (Content-Check)
            const contentChecks = data.filter(item => item['Content Check String'] && item['Content Check String'].trim() !== '');
            let contentCheckSuccessRate = 0;
            
            if (contentChecks.length > 0) {
                const successfulContentChecks = contentChecks.filter(item => item['Content Check Success'] === 'Yes').length;
                contentCheckSuccessRate = (successfulContentChecks / contentChecks.length) * 100;
            }
            
            document.getElementById('content-check-success-rate').textContent = contentCheckSuccessRate.toFixed(2);
        }
        
        // Funktion zum Aktualisieren der Tabelle
        function updateTable(data) {
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = '';
            
            data.forEach(item => {
                const row = document.createElement('tr');
                
                const timestampCell = document.createElement('td');
                timestampCell.textContent = item.Timestamp;
                row.appendChild(timestampCell);
                
                const urlCell = document.createElement('td');
                urlCell.textContent = item.URL;
                row.appendChild(urlCell);
                
                const statusCell = document.createElement('td');
                statusCell.innerHTML = `<span class="badge ${item.Success === 'Yes' ? 'bg-success' : 'bg-danger'}">${item.Status}</span>`;
                row.appendChild(statusCell);
                
                const responseTimeCell = document.createElement('td');
                responseTimeCell.textContent = item['Response Time (ms)'];
                row.appendChild(responseTimeCell);
                
                const successCell = document.createElement('td');
                successCell.innerHTML = item.Success === 'Yes' ? 
                    '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Ja</span>' : 
                    '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Nein</span>';
                row.appendChild(successCell);
                
                const contentCheckStringCell = document.createElement('td');
                contentCheckStringCell.textContent = item['Content Check String'] || '-';
                row.appendChild(contentCheckStringCell);
                
                const contentCheckSuccessCell = document.createElement('td');
                if (item['Content Check String'] && item['Content Check String'].trim() !== '') {
                    contentCheckSuccessCell.innerHTML = item['Content Check Success'] === 'Yes' ? 
                        '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Ja</span>' : 
                        '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Nein</span>';
                } else {
                    contentCheckSuccessCell.textContent = '-';
                }
                row.appendChild(contentCheckSuccessCell);
                
                tableBody.appendChild(row);
            });
            
            // DataTable initialisieren oder aktualisieren
            if (dataTable) {
                dataTable.destroy();
            }
            
            dataTable = new DataTable('#data-table', {
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/de-DE.json',
                },
                order: [[0, 'desc']], // Sortiere nach Zeitstempel absteigend
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50, 100],
                responsive: true
            });
        }
        
        // Funktion zum Erstellen oder Aktualisieren des Charts
        function updateChart(data) {
            // Chart-Kontext holen
            const ctx = document.getElementById('responseTimeChart').getContext('2d');
            
            // Chart zerstören, wenn bereits vorhanden
            if (window.responseChart) {
                window.responseChart.destroy();
            }
            
            // Daten nach URL gruppieren
            const urlGroups = {};
            
            // Daten nach Zeitstempel absteigend sortieren
            const sortedData = [...data].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            
            // Alle URLs initialisieren
            sortedData.forEach(item => {
                const url = item.URL;
                if (!urlGroups[url]) {
                    urlGroups[url] = {
                        label: url,
                        labels: [],
                        data: [],
                        borderColor: getRandomColor(),
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: [],
                        pointBorderColor: [],
                        pointRadius: []
                    };
                }
                
                // Daten für aktuelle URL hinzufügen
                urlGroups[url].labels.push(item.Timestamp);
                urlGroups[url].data.push(parseFloat(item['Response Time (ms)']));
                
                // Markiere fehlgeschlagene Prüfungen
                if (item.Success === 'No' || (item['Content Check String'] && item['Content Check String'].trim() !== '' && item['Content Check Success'] === 'No')) {
                    urlGroups[url].pointBackgroundColor.push('rgba(255, 0, 0, 0.2)');
                    urlGroups[url].pointBorderColor.push('red');
                    urlGroups[url].pointRadius.push(6);
                } else {
                    urlGroups[url].pointBackgroundColor.push(urlGroups[url].borderColor);
                    urlGroups[url].pointBorderColor.push(urlGroups[url].borderColor);
                    urlGroups[url].pointRadius.push(3);
                }
            });
            
            // Datasets erstellen
            const datasets = Object.values(urlGroups).map(group => ({
                label: group.label,
                data: group.data,
                borderColor: group.borderColor,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: group.pointBackgroundColor,
                pointBorderColor: group.pointBorderColor,
                pointRadius: group.pointRadius
            }));
            
            if (window.responseChart) {
                window.responseChart.destroy();
            }
            
            window.responseChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(item => item.Timestamp),
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Zeitstempel'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Antwortzeit (ms)'
                            },
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Website-Antwortzeiten'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y + ' ms';
                                    }
                                    
                                    // Füge Statusinformation hinzu
                                    const dataIndex = context.dataIndex;
                                    const url = context.dataset.label;
                                    const item = data.find(i => i.URL === url && i.Timestamp === context.label);
                                    
                                    if (item) {
                                        label += ' | HTTP: ' + (item.Success === 'Yes' ? 'Erfolg' : 'Fehler');
                                        
                                        if (item['Content Check String'] && item['Content Check String'].trim() !== '') {
                                            label += ' | Content-Check: ' + (item['Content Check Success'] === 'Yes' ? 'Erfolg' : 'Fehler');
                                        }
                                    }
                                    
                                    return label;
                                }
                            }
                        },
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        }
        
        // Funktion zum Generieren zufälliger Farben
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        
        // Funktion zum Aktualisieren aller Ansichten
        function updateViews() {
            const filteredData = filterData();
            updateStats(filteredData);
            updateTable(filteredData);
            updateChart(filteredData);
        }
        
        // Event-Listener für den Filter-Button
        document.getElementById('apply-filter').addEventListener('click', updateViews);
        
        // Initialisierung
        document.addEventListener('DOMContentLoaded', updateViews);
    </script>
</body>
</html>
