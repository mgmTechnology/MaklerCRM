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

// Zeitbereich für die letzten 8 Stunden berechnen
$now = new DateTime();
$eightHoursAgo = clone $now;
$eightHoursAgo->modify('-8 hours');
$defaultStartDate = $eightHoursAgo->format('Y-m-d\TH:i');
$defaultEndDate = $now->format('Y-m-d\TH:i');
?>

<!DOCTYPE html>
<html lang="de" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Endpoint Monitoring - Run Chart</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- DataTables CSS -->
    <link href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/buttons/2.3.6/css/buttons.bootstrap5.min.css" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
    
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
        
        .custom-filter {
            margin-bottom: 15px;
        }
        
        .custom-filter .btn-group {
            margin-right: 10px;
        }
        
        .response-time-filter {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .response-time-filter input {
            width: 100px;
        }
        
        .date-time-filter {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
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
                <i class="bi bi-graph-up"></i> Endpoint Monitoring - Run Chart
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
                            <label for="time-range" class="form-label">Vordefinierter Zeitraum:</label>
                            <select class="form-select" id="time-range">
                                <option value="8h" selected>Letzte 8 Stunden</option>
                                <option value="24h">Letzte 24 Stunden</option>
                                <option value="7d">Letzte 7 Tage</option>
                                <option value="30d">Letzte 30 Tage</option>
                                <option value="custom">Benutzerdefiniert</option>
                                <option value="all">Alle Daten</option>
                            </select>
                        </div>
                        
                        <div id="custom-time-range" class="mb-3" style="display: none;">
                            <div class="date-time-filter">
                                <div>
                                    <label for="start-date" class="form-label">Von:</label>
                                    <input type="datetime-local" id="start-date" class="form-control" value="<?php echo $defaultStartDate; ?>">
                                </div>
                                <div>
                                    <label for="end-date" class="form-label">Bis:</label>
                                    <input type="datetime-local" id="end-date" class="form-control" value="<?php echo $defaultEndDate; ?>">
                                </div>
                            </div>
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
                <!-- Erweiterte Filtermöglichkeiten -->
                <div class="custom-filter">
                    <h6>Erweiterte Filter:</h6>
                    <div class="btn-group" role="group" aria-label="HTTP-Status Filter">
                        <button type="button" class="btn btn-outline-secondary active" data-filter="all">Alle</button>
                        <button type="button" class="btn btn-outline-success" data-filter="success">Erfolgreich</button>
                        <button type="button" class="btn btn-outline-danger" data-filter="failed">Fehlgeschlagen</button>
                    </div>
                    
                    <div class="btn-group ms-2" role="group" aria-label="Content-Check Filter">
                        <button type="button" class="btn btn-outline-secondary active" data-content-filter="all">Alle Content-Checks</button>
                        <button type="button" class="btn btn-outline-success" data-content-filter="success">Content gefunden</button>
                        <button type="button" class="btn btn-outline-danger" data-content-filter="failed">Content nicht gefunden</button>
                    </div>
                </div>
                
                <div class="response-time-filter">
                    <label>Antwortzeit (ms):</label>
                    <input type="number" id="min-response-time-filter" class="form-control" placeholder="Min" min="0">
                    <span>bis</span>
                    <input type="number" id="max-response-time-filter" class="form-control" placeholder="Max" min="0">
                    <button id="apply-response-time-filter" class="btn btn-outline-primary">
                        <i class="bi bi-funnel"></i> Filtern
                    </button>
                    <button id="reset-response-time-filter" class="btn btn-outline-secondary">
                        <i class="bi bi-x-circle"></i> Zurücksetzen
                    </button>
                </div>
                
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
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/buttons.bootstrap5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.6/js/buttons.print.min.js"></script>
    
    <!-- Bootstrap JS Bundle mit Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Daten aus PHP in JavaScript verfügbar machen
        const logData = <?php echo json_encode($logData); ?>;
        let dataTable;
        let currentFilter = 'all';
        let currentContentFilter = 'all';
        let minResponseTime = null;
        let maxResponseTime = null;
        
        // Theme-Switcher
        document.getElementById('theme-toggle').addEventListener('click', function() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-bs-theme', newTheme);
            
            // Button-Text und Icon aktualisieren
            const button = document.getElementById('theme-toggle');
            if (newTheme === 'dark') {
                button.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
            } else {
                button.innerHTML = '<i class="bi bi-moon-stars"></i> Dark Mode';
            }
            
            // Theme in localStorage speichern
            localStorage.setItem('theme', newTheme);
            
            // DataTable neu initialisieren, um Styling anzupassen
            if (dataTable) {
                dataTable.destroy();
                updateTable(filterData());
            }
        });
        
        // Gespeichertes Theme beim Laden anwenden
        document.addEventListener('DOMContentLoaded', function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-bs-theme', savedTheme);
                
                // Button-Text und Icon aktualisieren
                const button = document.getElementById('theme-toggle');
                if (savedTheme === 'dark') {
                    button.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
                }
            }
            
            // Zeige/verstecke benutzerdefinierte Zeitauswahl
            document.getElementById('time-range').addEventListener('change', function() {
                const customTimeRange = document.getElementById('custom-time-range');
                if (this.value === 'custom') {
                    customTimeRange.style.display = 'block';
                } else {
                    customTimeRange.style.display = 'none';
                }
            });
        });
        
        // HTTP-Status Filter
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', function() {
                // Aktiven Button markieren
                document.querySelectorAll('[data-filter]').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // Filter setzen
                currentFilter = this.getAttribute('data-filter');
                
                // Tabelle aktualisieren
                if (dataTable) {
                    dataTable.destroy();
                }
                updateTable(filterData());
            });
        });
        
        // Content-Check Filter
        document.querySelectorAll('[data-content-filter]').forEach(button => {
            button.addEventListener('click', function() {
                // Aktiven Button markieren
                document.querySelectorAll('[data-content-filter]').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // Filter setzen
                currentContentFilter = this.getAttribute('data-content-filter');
                
                // Tabelle aktualisieren
                if (dataTable) {
                    dataTable.destroy();
                }
                updateTable(filterData());
            });
        });
        
        // Antwortzeit Filter anwenden
        document.getElementById('apply-response-time-filter').addEventListener('click', function() {
            const minInput = document.getElementById('min-response-time-filter');
            const maxInput = document.getElementById('max-response-time-filter');
            
            minResponseTime = minInput.value ? parseFloat(minInput.value) : null;
            maxResponseTime = maxInput.value ? parseFloat(maxInput.value) : null;
            
            // Tabelle aktualisieren
            if (dataTable) {
                dataTable.destroy();
            }
            updateTable(filterData());
        });
        
        // Antwortzeit Filter zurücksetzen
        document.getElementById('reset-response-time-filter').addEventListener('click', function() {
            document.getElementById('min-response-time-filter').value = '';
            document.getElementById('max-response-time-filter').value = '';
            
            minResponseTime = null;
            maxResponseTime = null;
            
            // Tabelle aktualisieren
            if (dataTable) {
                dataTable.destroy();
            }
            updateTable(filterData());
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
                let startDate, endDate;
                
                if (timeRange === 'custom') {
                    // Benutzerdefinierter Zeitraum
                    const startDateInput = document.getElementById('start-date').value;
                    const endDateInput = document.getElementById('end-date').value;
                    
                    startDate = startDateInput ? new Date(startDateInput) : null;
                    endDate = endDateInput ? new Date(endDateInput) : null;
                } else {
                    // Vordefinierter Zeitraum
                    endDate = now;
                    
                    if (timeRange === '8h') {
                        startDate = new Date(now.getTime() - 8 * 60 * 60 * 1000);
                    } else if (timeRange === '24h') {
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    } else if (timeRange === '7d') {
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    } else if (timeRange === '30d') {
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    }
                }
                
                if (startDate) {
                    filteredData = filteredData.filter(item => {
                        const itemDate = new Date(item.Timestamp);
                        return itemDate >= startDate;
                    });
                }
                
                if (endDate) {
                    filteredData = filteredData.filter(item => {
                        const itemDate = new Date(item.Timestamp);
                        return itemDate <= endDate;
                    });
                }
            }
            
            // Nach HTTP-Status filtern
            if (currentFilter !== 'all') {
                filteredData = filteredData.filter(item => {
                    if (currentFilter === 'success') {
                        return item.Success === 'Yes';
                    } else if (currentFilter === 'failed') {
                        return item.Success === 'No';
                    }
                    return true;
                });
            }
            
            // Nach Content-Check filtern
            if (currentContentFilter !== 'all') {
                filteredData = filteredData.filter(item => {
                    // Nur Einträge mit Content-Check berücksichtigen
                    if (item['Content Check String'] && item['Content Check String'].trim() !== '') {
                        if (currentContentFilter === 'success') {
                            return item['Content Check Success'] === 'Yes';
                        } else if (currentContentFilter === 'failed') {
                            return item['Content Check Success'] === 'No';
                        }
                    }
                    // Wenn kein Content-Check definiert ist und "all" ausgewählt wurde, zeige den Eintrag an
                    return currentContentFilter === 'all';
                });
            }
            
            // Nach Antwortzeit filtern
            if (minResponseTime !== null || maxResponseTime !== null) {
                filteredData = filteredData.filter(item => {
                    const responseTime = parseFloat(item['Response Time (ms)']);
                    
                    if (minResponseTime !== null && maxResponseTime !== null) {
                        return responseTime >= minResponseTime && responseTime <= maxResponseTime;
                    } else if (minResponseTime !== null) {
                        return responseTime >= minResponseTime;
                    } else if (maxResponseTime !== null) {
                        return responseTime <= maxResponseTime;
                    }
                    
                    return true;
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
            dataTable = new DataTable('#data-table', {
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/de-DE.json',
                },
                order: [[0, 'desc']], // Sortiere nach Zeitstempel absteigend
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50, 100],
                responsive: true,
                dom: 'Bfrtip',
                buttons: [
                    {
                        extend: 'copy',
                        text: '<i class="bi bi-clipboard"></i> Kopieren',
                        className: 'btn btn-sm btn-outline-secondary'
                    },
                    {
                        extend: 'csv',
                        text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
                        className: 'btn btn-sm btn-outline-secondary'
                    },
                    {
                        extend: 'excel',
                        text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                        className: 'btn btn-sm btn-outline-secondary'
                    },
                    {
                        extend: 'pdf',
                        text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                        className: 'btn btn-sm btn-outline-secondary'
                    },
                    {
                        extend: 'print',
                        text: '<i class="bi bi-printer"></i> Drucken',
                        className: 'btn btn-sm btn-outline-secondary'
                    }
                ]
            });
        }
        
        // Funktion zum Erstellen oder Aktualisieren des Charts
        function updateChart(data) {
            // Daten nach URL gruppieren und für Chart.js vorbereiten
            const urlGroups = {};
            
            // Sortiere Daten nach Zeitstempel
            data.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
            
            data.forEach(item => {
                const url = item.URL;
                
                if (!urlGroups[url]) {
                    urlGroups[url] = {
                        label: url,
                        data: [],
                        borderColor: getRandomColor(),
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: [],
                        pointBorderColor: [],
                        pointRadius: []
                    };
                }
                
                // Datenpunkt mit x (Zeitstempel) und y (Antwortzeit) erstellen
                urlGroups[url].data.push({
                    x: new Date(item.Timestamp),
                    y: parseFloat(item['Response Time (ms)'])
                });
                
                // Markiere fehlgeschlagene Prüfungen
                const isFailedCheck = item.Success === 'No' || 
                                     (item['Content Check String'] && 
                                      item['Content Check String'].trim() !== '' && 
                                      item['Content Check Success'] === 'No');
                
                if (isFailedCheck) {
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
            const datasets = Object.values(urlGroups);
            
            // Chart erstellen oder aktualisieren
            const ctx = document.getElementById('responseTimeChart').getContext('2d');
            
            if (window.responseChart) {
                window.responseChart.destroy();
            }
            
            window.responseChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'minute',
                                displayFormats: {
                                    minute: 'HH:mm',
                                    hour: 'HH:mm',
                                    day: 'dd.MM'
                                }
                            },
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
                                    const timestamp = context.parsed.x;
                                    
                                    // Finde den entsprechenden Datenpunkt
                                    const item = data.find(i => {
                                        return i.URL === url && 
                                               Math.abs(new Date(i.Timestamp).getTime() - timestamp) < 1000; // Toleranz von 1 Sekunde
                                    });
                                    
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
