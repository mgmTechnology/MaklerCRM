<?php
/**
 * Endpoint Monitoring Script
 * 
 * Dieses Script ermöglicht das Abrufen einer Website, prüft deren Status
 * und protokolliert die Antwortzeiten für die Erstellung eines Run Charts.
 * Der Monitoring-Intervall ist je Endpoint individuell einstellbar.
 */

// Fehlerberichterstattung aktivieren
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Konstanten definieren
define('LOG_FILE', 'response_times.csv');
define('CHART_FILE', 'chart.php');
define('CONFIG_FILE', 'endpoints.json');

// Standard-URLs definieren
$defaultUrls = [
    [
        'url' => 'https://familiengarten.nrw',
        'name' => 'Familiengarten NRW',
        'interval' => 5,
        'content_check_string' => 'Birgit'
    ],
    [
        'url' => 'https://kinderstube-birgit-scholz.de',
        'name' => 'Kinderstube Birgit Scholz',
        'interval' => 10,
        'content_check_string' => 'Birgit'
    ],
    [
        'url' => 'https://mgm.technology',
        'name' => 'MGM Technology',
        'interval' => 15,
        'content_check_string' => 'Birgit'
    ]
];

// Endpunkte laden oder initialisieren
function loadEndpoints() {
    if (file_exists(CONFIG_FILE)) {
        $json = file_get_contents(CONFIG_FILE);
        $endpoints = json_decode($json, true) ?: [];
        
        // Wenn keine Endpunkte vorhanden sind, initialisiere mit Standard-URLs
        if (empty($endpoints)) {
            global $defaultUrls;
            foreach ($defaultUrls as $defaultUrl) {
                $id = md5($defaultUrl['url'] . time() . rand(1000, 9999));
                $endpoints[$id] = [
                    'id' => $id,
                    'url' => $defaultUrl['url'],
                    'name' => $defaultUrl['name'],
                    'interval' => $defaultUrl['interval'],
                    'content_check_string' => $defaultUrl['content_check_string'],
                    'last_check' => null,
                    'next_check' => null
                ];
                
                // Sofort prüfen
                $result = checkWebsite($defaultUrl['url'], $defaultUrl['content_check_string']);
                logResult($result);
                
                // Nächste Prüfung planen
                $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
                $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $defaultUrl['interval'] . ' minutes'));
            }
            
            // Speichern
            saveEndpoints($endpoints);
        }
        
        return $endpoints;
    }
    
    // Wenn die Datei nicht existiert, initialisiere mit Standard-URLs
    global $defaultUrls;
    $endpoints = [];
    
    foreach ($defaultUrls as $defaultUrl) {
        $id = md5($defaultUrl['url'] . time() . rand(1000, 9999));
        $endpoints[$id] = [
            'id' => $id,
            'url' => $defaultUrl['url'],
            'name' => $defaultUrl['name'],
            'interval' => $defaultUrl['interval'],
            'content_check_string' => $defaultUrl['content_check_string'],
            'last_check' => null,
            'next_check' => null
        ];
        
        // Sofort prüfen
        $result = checkWebsite($defaultUrl['url'], $defaultUrl['content_check_string']);
        logResult($result);
        
        // Nächste Prüfung planen
        $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
        $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $defaultUrl['interval'] . ' minutes'));
    }
    
    // Speichern
    saveEndpoints($endpoints);
    
    return $endpoints;
}

// Endpunkte speichern
function saveEndpoints($endpoints) {
    file_put_contents(CONFIG_FILE, json_encode($endpoints, JSON_PRETTY_PRINT));
}

// Funktion zum Messen der Antwortzeit einer Website und Prüfen des Inhalts
function checkWebsite($url, $contentCheckString = null) {
    $startTime = microtime(true);
    
    // Initialisiere cURL
    $ch = curl_init($url);
    
    // cURL-Optionen setzen
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    // Website abrufen
    $response = curl_exec($ch);
    
    // Antwortzeit berechnen
    $endTime = microtime(true);
    $responseTime = round(($endTime - $startTime) * 1000, 2); // in Millisekunden
    
    // HTTP-Statuscode abrufen
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // cURL-Sitzung schließen
    curl_close($ch);
    
    // Content-Check durchführen
    $contentCheckSuccess = false;
    if ($contentCheckString && $httpCode >= 200 && $httpCode < 400) {
        $contentCheckSuccess = (stripos($response, $contentCheckString) !== false);
    }
    
    return [
        'url' => $url,
        'status' => $httpCode,
        'response_time' => $responseTime,
        'timestamp' => date('Y-m-d H:i:s'),
        'success' => ($httpCode >= 200 && $httpCode < 400),
        'content_check_string' => $contentCheckString,
        'content_check_success' => $contentCheckSuccess
    ];
}

// Funktion zum Protokollieren der Ergebnisse
function logResult($result) {
    $fileExists = file_exists(LOG_FILE);
    
    $handle = fopen(LOG_FILE, 'a');
    
    // Schreibe Header, wenn die Datei neu ist
    if (!$fileExists) {
        fputcsv($handle, ['Timestamp', 'URL', 'Status', 'Response Time (ms)', 'Success', 'Content Check String', 'Content Check Success']);
    }
    
    // Schreibe Daten
    fputcsv($handle, [
        $result['timestamp'],
        $result['url'],
        $result['status'],
        $result['response_time'],
        $result['success'] ? 'Yes' : 'No',
        $result['content_check_string'] ?? '',
        isset($result['content_check_success']) && $result['content_check_success'] ? 'Yes' : 'No'
    ]);
    
    fclose($handle);
}

// AJAX-Endpunkt für die Prüfung eines einzelnen Endpoints
if (isset($_GET['ajax']) && $_GET['ajax'] === 'check_endpoint' && isset($_GET['id'])) {
    header('Content-Type: application/json');
    $id = $_GET['id'];
    $endpoints = loadEndpoints();
    
    if (isset($endpoints[$id])) {
        try {
            $result = checkWebsite($endpoints[$id]['url'], $endpoints[$id]['content_check_string']);
            logResult($result);
            
            // Aktualisiere Zeitstempel für letzte und nächste Prüfung
            $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
            $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $endpoints[$id]['interval'] . ' minutes'));
            saveEndpoints($endpoints);
            
            echo json_encode([
                'success' => true,
                'message' => 'Endpoint erfolgreich geprüft',
                'result' => $result,
                'endpoint' => $endpoints[$id]
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Fehler: ' . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint nicht gefunden'
        ]);
    }
    exit;
}

// AJAX-Endpunkt für die Prüfung aller Endpoints
if (isset($_GET['ajax']) && $_GET['ajax'] === 'check_all_endpoints') {
    header('Content-Type: application/json');
    $endpoints = loadEndpoints();
    $results = [];
    $checkedCount = 0;
    $failedCount = 0;
    
    foreach ($endpoints as $id => $endpoint) {
        try {
            $result = checkWebsite($endpoint['url'], $endpoint['content_check_string']);
            logResult($result);
            
            // Aktualisiere Zeitstempel für letzte und nächste Prüfung
            $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
            $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $endpoint['interval'] . ' minutes'));
            
            $results[$id] = [
                'success' => true,
                'result' => $result,
                'endpoint' => $endpoints[$id]
            ];
            
            $checkedCount++;
            if (!$result['success'] || (isset($result['content_check_success']) && !$result['content_check_success'])) {
                $failedCount++;
            }
        } catch (Exception $e) {
            $results[$id] = [
                'success' => false,
                'message' => $e->getMessage()
            ];
            $failedCount++;
        }
    }
    
    saveEndpoints($endpoints);
    
    echo json_encode([
        'success' => true,
        'message' => "Alle Endpunkte geprüft: $checkedCount erfolgreich, $failedCount fehlgeschlagen.",
        'results' => $results,
        'checked_count' => $checkedCount,
        'failed_count' => $failedCount
    ]);
    exit;
}

// Endpunkte laden
$endpoints = loadEndpoints();

// Hauptlogik
$message = '';
$result = null;
$activeTab = 'monitor';

// Alle Endpunkte prüfen
if (isset($_POST['action']) && $_POST['action'] === 'check_all_endpoints') {
    $checkedCount = 0;
    $failedCount = 0;
    
    foreach ($endpoints as $id => $endpoint) {
        try {
            $result = checkWebsite($endpoint['url'], $endpoint['content_check_string']);
            logResult($result);
            
            // Aktualisiere Zeitstempel für letzte und nächste Prüfung
            $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
            $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $endpoint['interval'] . ' minutes'));
            
            $checkedCount++;
            if (!$result['success'] || (isset($result['content_check_success']) && !$result['content_check_success'])) {
                $failedCount++;
            }
        } catch (Exception $e) {
            $failedCount++;
        }
    }
    
    saveEndpoints($endpoints);
    $message = "Alle Endpunkte geprüft: $checkedCount erfolgreich, $failedCount fehlgeschlagen.";
    $activeTab = 'endpoints';
}

// Endpunkt hinzufügen oder aktualisieren
if (isset($_POST['action']) && $_POST['action'] === 'save_endpoint') {
    $url = isset($_POST['url']) ? trim($_POST['url']) : '';
    $interval = isset($_POST['interval']) ? (int)$_POST['interval'] : 5;
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $contentCheckString = isset($_POST['content_check_string']) ? trim($_POST['content_check_string']) : '';
    
    if (empty($url)) {
        $message = 'Bitte geben Sie eine URL ein.';
    } elseif (!filter_var($url, FILTER_VALIDATE_URL)) {
        $message = 'Bitte geben Sie eine gültige URL ein.';
    } elseif ($interval < 1) {
        $message = 'Das Intervall muss mindestens 1 Minute betragen.';
    } else {
        // Eindeutige ID für den Endpunkt generieren, falls nicht vorhanden
        $id = isset($_POST['endpoint_id']) && !empty($_POST['endpoint_id']) ? $_POST['endpoint_id'] : md5($url . time());
        
        $endpoints[$id] = [
            'id' => $id,
            'url' => $url,
            'name' => empty($name) ? $url : $name,
            'interval' => $interval,
            'content_check_string' => $contentCheckString,
            'last_check' => isset($endpoints[$id]['last_check']) ? $endpoints[$id]['last_check'] : null,
            'next_check' => isset($endpoints[$id]['next_check']) ? $endpoints[$id]['next_check'] : null
        ];
        
        saveEndpoints($endpoints);
        $message = 'Endpunkt erfolgreich gespeichert.';
        $activeTab = 'endpoints';
    }
}

// Endpunkt löschen
if (isset($_GET['action']) && $_GET['action'] === 'delete_endpoint' && isset($_GET['id'])) {
    $id = $_GET['id'];
    if (isset($endpoints[$id])) {
        unset($endpoints[$id]);
        saveEndpoints($endpoints);
        $message = 'Endpunkt erfolgreich gelöscht.';
        $activeTab = 'endpoints';
    }
}

// Endpunkt bearbeiten (Formular vorbereiten)
$editEndpoint = null;
if (isset($_GET['action']) && $_GET['action'] === 'edit_endpoint' && isset($_GET['id'])) {
    $id = $_GET['id'];
    if (isset($endpoints[$id])) {
        $editEndpoint = $endpoints[$id];
        $activeTab = 'add';
    }
}

// Website prüfen
if (isset($_POST['action']) && $_POST['action'] === 'check_website') {
    $url = isset($_POST['url']) ? trim($_POST['url']) : '';
    $contentCheckString = isset($_POST['content_check_string']) ? trim($_POST['content_check_string']) : null;
    
    if (empty($url)) {
        $message = 'Bitte geben Sie eine URL ein.';
    } elseif (!filter_var($url, FILTER_VALIDATE_URL)) {
        $message = 'Bitte geben Sie eine gültige URL ein.';
    } else {
        try {
            $result = checkWebsite($url, $contentCheckString);
            logResult($result);
            $message = 'Website erfolgreich überprüft und Ergebnis protokolliert.';
        } catch (Exception $e) {
            $message = 'Fehler: ' . $e->getMessage();
        }
    }
}

// Endpunkt sofort prüfen
if (isset($_GET['action']) && $_GET['action'] === 'check_now' && isset($_GET['id'])) {
    $id = $_GET['id'];
    if (isset($endpoints[$id])) {
        try {
            $result = checkWebsite($endpoints[$id]['url'], $endpoints[$id]['content_check_string']);
            logResult($result);
            
            // Aktualisiere Zeitstempel für letzte und nächste Prüfung
            $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
            $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $endpoints[$id]['interval'] . ' minutes'));
            saveEndpoints($endpoints);
            
            $message = 'Endpunkt "' . htmlspecialchars($endpoints[$id]['name']) . '" erfolgreich überprüft.';
            $activeTab = 'endpoints';
        } catch (Exception $e) {
            $message = 'Fehler: ' . $e->getMessage();
        }
    }
}

// Aktiven Tab aus GET-Parameter setzen
if (isset($_GET['tab']) && in_array($_GET['tab'], ['monitor', 'endpoints', 'add', 'chart'])) {
    $activeTab = $_GET['tab'];
}

// Anzahl der Protokolleinträge zählen
$logEntries = 0;
if (file_exists(LOG_FILE)) {
    $logEntries = count(file(LOG_FILE)) - 1; // Header abziehen
}
?>

<!DOCTYPE html>
<html lang="de" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Endpoint Monitoring</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        .endpoint-card {
            margin-bottom: 20px;
        }
        .status-badge {
            font-size: 0.8rem;
        }
        .card-actions {
            display: flex;
            gap: 10px;
        }
        .tab-content {
            padding-top: 20px;
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
        
        .progress-modal .progress {
            height: 25px;
        }
        
        .auto-check-settings {
            background-color: rgba(0, 0, 0, 0.03);
            border-radius: 0.25rem;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        [data-bs-theme="dark"] .auto-check-settings {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        .next-check-info {
            font-size: 0.9rem;
            margin-top: 5px;
            color: #6c757d;
        }
        
        [data-bs-theme="dark"] .next-check-info {
            color: #adb5bd;
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
                <i class="bi bi-speedometer2"></i> Endpoint Monitoring
            </h1>
        </header>
        
        <?php if (!empty($message)): ?>
            <div class="alert <?php echo isset($result) && isset($result['success']) && $result['success'] ? 'alert-success' : 'alert-danger'; ?> alert-dismissible fade show" role="alert">
                <?php echo htmlspecialchars($message); ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>
        
        <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo $activeTab === 'monitor' ? 'active' : ''; ?>" id="monitor-tab" data-bs-toggle="tab" data-bs-target="#monitor" type="button" role="tab" aria-controls="monitor" aria-selected="<?php echo $activeTab === 'monitor' ? 'true' : 'false'; ?>">
                    <i class="bi bi-search"></i> Einzelprüfung
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo $activeTab === 'endpoints' ? 'active' : ''; ?>" id="endpoints-tab" data-bs-toggle="tab" data-bs-target="#endpoints" type="button" role="tab" aria-controls="endpoints" aria-selected="<?php echo $activeTab === 'endpoints' ? 'true' : 'false'; ?>">
                    <i class="bi bi-list-check"></i> Endpunkte
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo $activeTab === 'add' ? 'active' : ''; ?>" id="add-tab" data-bs-toggle="tab" data-bs-target="#add" type="button" role="tab" aria-controls="add" aria-selected="<?php echo $activeTab === 'add' ? 'true' : 'false'; ?>">
                    <i class="bi bi-plus-circle"></i> Endpunkt hinzufügen
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link <?php echo $activeTab === 'chart' ? 'active' : ''; ?>" id="chart-tab" data-bs-toggle="tab" data-bs-target="#chart" type="button" role="tab" aria-controls="chart" aria-selected="<?php echo $activeTab === 'chart' ? 'true' : 'false'; ?>">
                    <i class="bi bi-graph-up"></i> Run Chart
                </button>
            </li>
        </ul>
        
        <div class="tab-content" id="myTabContent">
            <!-- Einzelprüfung Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'monitor' ? 'show active' : ''; ?>" id="monitor" role="tabpanel" aria-labelledby="monitor-tab">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Website-Status prüfen</h5>
                            </div>
                            <div class="card-body">
                                <form method="post" action="index.php">
                                    <input type="hidden" name="action" value="check_website">
                                    
                                    <div class="mb-3">
                                        <label for="url" class="form-label">URL:</label>
                                        <input type="url" class="form-control" id="url" name="url" placeholder="https://example.com" required>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="content_check_string" class="form-label">Content-Check String (optional):</label>
                                        <input type="text" class="form-control" id="content_check_string" name="content_check_string" placeholder="Text, der auf der Seite vorhanden sein sollte">
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-search"></i> Website prüfen
                                    </button>
                                </form>
                                
                                <div class="mt-4">
                                    <h6>Vorschläge:</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        <?php foreach ($endpoints as $endpoint): ?>
                                            <button type="button" class="btn btn-outline-secondary btn-sm endpoint-suggestion" data-url="<?php echo htmlspecialchars($endpoint['url']); ?>" data-content-check="<?php echo htmlspecialchars($endpoint['content_check_string']); ?>">
                                                <?php echo htmlspecialchars($endpoint['name']); ?>
                                            </button>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <?php if (isset($result)): ?>
                            <div class="card mt-4">
                                <div class="card-header">
                                    <h5 class="card-title mb-0">Prüfergebnis</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-bordered">
                                            <tr>
                                                <th>URL:</th>
                                                <td><?php echo htmlspecialchars($result['url']); ?></td>
                                            </tr>
                                            <tr>
                                                <th>Status:</th>
                                                <td>
                                                    <span class="badge <?php echo $result['success'] ? 'bg-success' : 'bg-danger'; ?>">
                                                        <?php echo $result['status']; ?>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Antwortzeit:</th>
                                                <td><?php echo $result['response_time']; ?> ms</td>
                                            </tr>
                                            <tr>
                                                <th>Zeitstempel:</th>
                                                <td><?php echo $result['timestamp']; ?></td>
                                            </tr>
                                            <?php if (isset($result['content_check_string']) && !empty($result['content_check_string'])): ?>
                                                <tr>
                                                    <th>Content-Check:</th>
                                                    <td>
                                                        <span class="badge <?php echo $result['content_check_success'] ? 'bg-success' : 'bg-danger'; ?>">
                                                            <?php echo $result['content_check_success'] ? 'Erfolgreich' : 'Fehlgeschlagen'; ?>
                                                        </span>
                                                        <br>
                                                        <small>Gesucht: "<?php echo htmlspecialchars($result['content_check_string']); ?>"</small>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Informationen</h5>
                            </div>
                            <div class="card-body">
                                <p>
                                    <i class="bi bi-info-circle"></i> Mit diesem Tool können Sie den Status und die Antwortzeit einer Website überprüfen.
                                </p>
                                <p>
                                    <i class="bi bi-check-circle"></i> Geben Sie die URL der Website ein und klicken Sie auf "Website prüfen".
                                </p>
                                <p>
                                    <i class="bi bi-search"></i> Optional können Sie einen Text angeben, der auf der Website vorhanden sein sollte.
                                </p>
                                <p>
                                    <i class="bi bi-graph-up"></i> Die Ergebnisse werden protokolliert und im Run Chart visualisiert.
                                </p>
                                <p>
                                    <i class="bi bi-clock"></i> Bisher wurden <?php echo $logEntries; ?> Prüfungen protokolliert.
                                </p>
                                
                                <div class="mt-3">
                                    <a href="<?php echo CHART_FILE; ?>" class="btn btn-outline-primary">
                                        <i class="bi bi-graph-up"></i> Run Chart anzeigen
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Automatische Prüfung Einstellungen -->
                        <div class="card mt-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Automatische Prüfung</h5>
                            </div>
                            <div class="card-body">
                                <div class="auto-check-settings">
                                    <div class="mb-3">
                                        <label for="auto-check-interval" class="form-label">Intervall (Minuten):</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" id="auto-check-interval" min="1" value="15">
                                            <button class="btn btn-outline-primary" type="button" id="save-auto-check-interval">
                                                <i class="bi bi-save"></i> Speichern
                                            </button>
                                        </div>
                                        <div class="next-check-info">
                                            Nächste automatische Prüfung: <span id="next-auto-check-time">-</span>
                                        </div>
                                    </div>
                                    
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="auto-check-enabled" checked>
                                        <label class="form-check-label" for="auto-check-enabled">Automatische Prüfung aktiviert</label>
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button id="check-all-now" class="btn btn-primary">
                                        <i class="bi bi-arrow-repeat"></i> Alle Endpunkte jetzt prüfen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Endpunkte Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'endpoints' ? 'show active' : ''; ?>" id="endpoints" role="tabpanel" aria-labelledby="endpoints-tab">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h3>Konfigurierte Endpunkte</h3>
                    <form method="post" action="index.php">
                        <input type="hidden" name="action" value="check_all_endpoints">
                        <button type="submit" class="btn btn-primary">
                            <i class="bi bi-arrow-repeat"></i> Alle Endpunkte prüfen
                        </button>
                    </form>
                </div>
                
                <div class="row">
                    <?php if (empty($endpoints)): ?>
                        <div class="col-12">
                            <div class="alert alert-info">
                                Keine Endpunkte konfiguriert. Fügen Sie einen Endpunkt hinzu, um mit dem Monitoring zu beginnen.
                            </div>
                        </div>
                    <?php else: ?>
                        <?php foreach ($endpoints as $id => $endpoint): ?>
                            <div class="col-md-6 col-lg-4 endpoint-card">
                                <div class="card h-100">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h5 class="card-title mb-0"><?php echo htmlspecialchars($endpoint['name']); ?></h5>
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">
                                            <strong>URL:</strong> <a href="<?php echo htmlspecialchars($endpoint['url']); ?>" target="_blank"><?php echo htmlspecialchars($endpoint['url']); ?></a>
                                        </p>
                                        <p class="card-text">
                                            <strong>Intervall:</strong> <?php echo $endpoint['interval']; ?> Minuten
                                        </p>
                                        <?php if (!empty($endpoint['content_check_string'])): ?>
                                            <p class="card-text">
                                                <strong>Content-Check:</strong> "<?php echo htmlspecialchars($endpoint['content_check_string']); ?>"
                                            </p>
                                        <?php endif; ?>
                                        <p class="card-text">
                                            <strong>Letzte Prüfung:</strong> <?php echo $endpoint['last_check'] ? $endpoint['last_check'] : 'Noch nicht geprüft'; ?>
                                        </p>
                                        <p class="card-text">
                                            <strong>Nächste Prüfung:</strong> <?php echo $endpoint['next_check'] ? $endpoint['next_check'] : '-'; ?>
                                        </p>
                                    </div>
                                    <div class="card-footer">
                                        <div class="card-actions">
                                            <a href="index.php?action=check_now&id=<?php echo $id; ?>" class="btn btn-sm btn-primary">
                                                <i class="bi bi-arrow-repeat"></i> Jetzt prüfen
                                            </a>
                                            <a href="index.php?action=edit_endpoint&id=<?php echo $id; ?>" class="btn btn-sm btn-secondary">
                                                <i class="bi bi-pencil"></i> Bearbeiten
                                            </a>
                                            <a href="index.php?action=delete_endpoint&id=<?php echo $id; ?>" class="btn btn-sm btn-danger" onclick="return confirm('Sind Sie sicher, dass Sie diesen Endpunkt löschen möchten?');">
                                                <i class="bi bi-trash"></i> Löschen
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- Endpunkt hinzufügen Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'add' ? 'show active' : ''; ?>" id="add" role="tabpanel" aria-labelledby="add-tab">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0"><?php echo $editEndpoint ? 'Endpunkt bearbeiten' : 'Neuen Endpunkt hinzufügen'; ?></h5>
                            </div>
                            <div class="card-body">
                                <form method="post" action="index.php">
                                    <input type="hidden" name="action" value="save_endpoint">
                                    <?php if ($editEndpoint): ?>
                                        <input type="hidden" name="endpoint_id" value="<?php echo $editEndpoint['id']; ?>">
                                    <?php endif; ?>
                                    
                                    <div class="mb-3">
                                        <label for="name" class="form-label">Name:</label>
                                        <input type="text" class="form-control" id="name" name="name" placeholder="Anzeigename für den Endpunkt" value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['name']) : ''; ?>">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="url" class="form-label">URL:</label>
                                        <input type="url" class="form-control" id="url" name="url" placeholder="https://example.com" required value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['url']) : ''; ?>">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="interval" class="form-label">Prüfintervall (Minuten):</label>
                                        <input type="number" class="form-control" id="interval" name="interval" min="1" value="<?php echo $editEndpoint ? $editEndpoint['interval'] : '5'; ?>">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="content_check_string" class="form-label">Content-Check String (optional):</label>
                                        <input type="text" class="form-control" id="content_check_string" name="content_check_string" placeholder="Text, der auf der Seite vorhanden sein sollte" value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['content_check_string']) : ''; ?>">
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary">
                                        <i class="bi bi-save"></i> <?php echo $editEndpoint ? 'Endpunkt aktualisieren' : 'Endpunkt hinzufügen'; ?>
                                    </button>
                                    
                                    <?php if ($editEndpoint): ?>
                                        <a href="index.php?tab=endpoints" class="btn btn-secondary">
                                            <i class="bi bi-x-circle"></i> Abbrechen
                                        </a>
                                    <?php endif; ?>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Hilfe</h5>
                            </div>
                            <div class="card-body">
                                <p>
                                    <i class="bi bi-info-circle"></i> <strong>Name:</strong> Ein beschreibender Name für den Endpunkt.
                                </p>
                                <p>
                                    <i class="bi bi-link"></i> <strong>URL:</strong> Die vollständige URL der zu überwachenden Website.
                                </p>
                                <p>
                                    <i class="bi bi-clock"></i> <strong>Prüfintervall:</strong> Wie oft die Website überprüft werden soll (in Minuten).
                                </p>
                                <p>
                                    <i class="bi bi-search"></i> <strong>Content-Check String:</strong> Optional. Ein Text, der auf der Website vorhanden sein sollte. Wenn der Text nicht gefunden wird, wird die Prüfung als fehlgeschlagen markiert, auch wenn die Website erreichbar ist.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Run Chart Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'chart' ? 'show active' : ''; ?>" id="chart" role="tabpanel" aria-labelledby="chart-tab">
                <div class="ratio ratio-16x9">
                    <iframe src="<?php echo CHART_FILE; ?>" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Fortschritts-Modal für "Alle Endpunkte prüfen" -->
    <div class="modal fade progress-modal" id="checkAllProgressModal" tabindex="-1" aria-labelledby="checkAllProgressModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="checkAllProgressModalLabel">Prüfe alle Endpunkte</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="progress mb-3">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                    </div>
                    
                    <div class="d-flex justify-content-between mb-3">
                        <div><strong>Geprüft:</strong> <span id="checked-count">0</span>/<span id="total-count">0</span></div>
                        <div><strong>Erfolgreich:</strong> <span id="success-count">0</span></div>
                        <div><strong>Fehlgeschlagen:</strong> <span id="failed-count">0</span></div>
                    </div>
                    
                    <div class="current-endpoint mb-3">
                        <strong>Aktueller Endpunkt:</strong> <span id="current-endpoint">-</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS Bundle mit Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Vorschläge für die Einzelprüfung
        document.querySelectorAll('.endpoint-suggestion').forEach(button => {
            button.addEventListener('click', function() {
                document.getElementById('url').value = this.getAttribute('data-url');
                document.getElementById('content_check_string').value = this.getAttribute('data-content-check');
            });
        });
        
        // Theme-Switcher
        document.getElementById('theme-toggle').addEventListener('click', function() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-bs-theme', newTheme);
            
            // Button-Text und Icon aktualisieren
            if (newTheme === 'dark') {
                this.innerHTML = '<i class="bi bi-sun"></i> Light Mode';
            } else {
                this.innerHTML = '<i class="bi bi-moon-stars"></i> Dark Mode';
            }
            
            // Theme in localStorage speichern
            localStorage.setItem('theme', newTheme);
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
            
            // Automatische Prüfung initialisieren
            initAutoCheck();
        });
        
        // Fortschritts-Modal für "Alle Endpunkte prüfen"
        document.getElementById('check-all-now').addEventListener('click', function() {
            const modal = new bootstrap.Modal(document.getElementById('checkAllProgressModal'));
            modal.show();
            
            // Endpunkte abrufen
            const endpoints = <?php echo json_encode($endpoints); ?>;
            const totalCount = Object.keys(endpoints).length;
            let checkedCount = 0;
            let successCount = 0;
            let failedCount = 0;
            
            // UI-Elemente aktualisieren
            document.getElementById('total-count').textContent = totalCount;
            document.getElementById('checked-count').textContent = checkedCount;
            document.getElementById('success-count').textContent = successCount;
            document.getElementById('failed-count').textContent = failedCount;
            
            // AJAX-Anfrage senden
            fetch('index.php?ajax=check_all_endpoints')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Fortschrittsbalken auf 100% setzen
                        const progressBar = document.querySelector('.progress-bar');
                        progressBar.style.width = '100%';
                        progressBar.setAttribute('aria-valuenow', 100);
                        progressBar.textContent = '100%';
                        
                        // Statistiken aktualisieren
                        document.getElementById('checked-count').textContent = data.checked_count;
                        document.getElementById('success-count').textContent = data.checked_count - data.failed_count;
                        document.getElementById('failed-count').textContent = data.failed_count;
                        document.getElementById('current-endpoint').textContent = 'Alle Endpunkte geprüft';
                        
                        // Seite nach kurzer Verzögerung neu laden
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        alert('Fehler: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                });
        });
        
        // Automatische Prüfung
        function initAutoCheck() {
            // Gespeicherten Intervall laden oder Standardwert verwenden
            let autoCheckInterval = localStorage.getItem('autoCheckInterval');
            if (!autoCheckInterval) {
                autoCheckInterval = 15; // 15 Minuten als Standard
                localStorage.setItem('autoCheckInterval', autoCheckInterval);
            }
            
            // Intervall-Eingabefeld aktualisieren
            document.getElementById('auto-check-interval').value = autoCheckInterval;
            
            // Aktivierungsstatus laden
            let autoCheckEnabled = localStorage.getItem('autoCheckEnabled');
            if (autoCheckEnabled === null) {
                autoCheckEnabled = 'true'; // Standardmäßig aktiviert
                localStorage.setItem('autoCheckEnabled', autoCheckEnabled);
            }
            
            // Checkbox aktualisieren
            document.getElementById('auto-check-enabled').checked = autoCheckEnabled === 'true';
            
            // Timer für nächste Prüfung initialisieren
            updateNextCheckTime();
            
            // Event-Listener für Intervall-Änderung
            document.getElementById('save-auto-check-interval').addEventListener('click', function() {
                const newInterval = document.getElementById('auto-check-interval').value;
                if (newInterval < 1) {
                    alert('Das Intervall muss mindestens 1 Minute betragen.');
                    return;
                }
                
                localStorage.setItem('autoCheckInterval', newInterval);
                updateNextCheckTime();
                alert('Intervall gespeichert: ' + newInterval + ' Minuten');
            });
            
            // Event-Listener für Aktivierung/Deaktivierung
            document.getElementById('auto-check-enabled').addEventListener('change', function() {
                localStorage.setItem('autoCheckEnabled', this.checked);
                updateNextCheckTime();
            });
            
            // Timer für automatische Prüfung starten
            startAutoCheckTimer();
        }
        
        // Nächste Prüfzeit aktualisieren
        function updateNextCheckTime() {
            const autoCheckEnabled = localStorage.getItem('autoCheckEnabled') === 'true';
            const autoCheckInterval = parseInt(localStorage.getItem('autoCheckInterval') || 15);
            
            if (autoCheckEnabled) {
                // Letzte Prüfzeit laden oder aktuelle Zeit verwenden
                let lastCheckTime = localStorage.getItem('lastAutoCheckTime');
                if (!lastCheckTime) {
                    lastCheckTime = new Date().toISOString();
                    localStorage.setItem('lastAutoCheckTime', lastCheckTime);
                }
                
                // Nächste Prüfzeit berechnen
                const lastCheck = new Date(lastCheckTime);
                const nextCheck = new Date(lastCheck.getTime() + autoCheckInterval * 60 * 1000);
                
                // Formatierte Zeit anzeigen
                const options = { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                };
                document.getElementById('next-auto-check-time').textContent = nextCheck.toLocaleString(undefined, options);
            } else {
                document.getElementById('next-auto-check-time').textContent = 'Deaktiviert';
            }
        }
        
        // Timer für automatische Prüfung
        function startAutoCheckTimer() {
            // Timer alle 10 Sekunden prüfen
            setInterval(function() {
                const autoCheckEnabled = localStorage.getItem('autoCheckEnabled') === 'true';
                if (!autoCheckEnabled) return;
                
                const autoCheckInterval = parseInt(localStorage.getItem('autoCheckInterval') || 15);
                let lastCheckTime = localStorage.getItem('lastAutoCheckTime');
                
                if (!lastCheckTime) {
                    lastCheckTime = new Date().toISOString();
                    localStorage.setItem('lastAutoCheckTime', lastCheckTime);
                }
                
                const lastCheck = new Date(lastCheckTime);
                const now = new Date();
                const timeDiff = now - lastCheck;
                
                // Wenn das Intervall abgelaufen ist, alle Endpunkte prüfen
                if (timeDiff >= autoCheckInterval * 60 * 1000) {
                    console.log('Automatische Prüfung wird durchgeführt...');
                    
                    // AJAX-Anfrage senden
                    fetch('index.php?ajax=check_all_endpoints')
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log('Automatische Prüfung abgeschlossen:', data.message);
                                
                                // Letzte Prüfzeit aktualisieren
                                localStorage.setItem('lastAutoCheckTime', new Date().toISOString());
                                
                                // Nächste Prüfzeit aktualisieren
                                updateNextCheckTime();
                            } else {
                                console.error('Fehler bei automatischer Prüfung:', data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Fehler bei automatischer Prüfung:', error);
                        });
                }
                
                // Nächste Prüfzeit aktualisieren
                updateNextCheckTime();
            }, 10000); // Alle 10 Sekunden prüfen
        }
    </script>
</body>
</html>
