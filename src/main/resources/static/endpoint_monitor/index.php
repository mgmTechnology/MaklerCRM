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
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Website manuell prüfen</h5>
                    </div>
                    <div class="card-body">
                        <form method="post" action="">
                            <input type="hidden" name="action" value="check_website">
                            
                            <div class="mb-3">
                                <label for="url" class="form-label">Website-URL:</label>
                                <input type="text" class="form-control" id="url" name="url" placeholder="https://example.com" value="<?php echo isset($_POST['url']) ? htmlspecialchars($_POST['url']) : ''; ?>" required>
                                
                                <div class="mt-2">
                                    <strong>Konfigurierte Endpunkte:</strong>
                                    <?php foreach ($endpoints as $endpoint): ?>
                                        <button type="button" class="btn btn-sm btn-outline-secondary mt-1 me-1" onclick="document.getElementById('url').value='<?php echo htmlspecialchars($endpoint['url']); ?>'; document.getElementById('content_check_string').value='<?php echo htmlspecialchars($endpoint['content_check_string'] ?? ''); ?>';">
                                            <?php echo htmlspecialchars($endpoint['name']); ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="content_check_string" class="form-label">Zu prüfender String (optional):</label>
                                <input type="text" class="form-control" id="content_check_string" name="content_check_string" placeholder="z.B. Birgit" value="<?php echo isset($_POST['content_check_string']) ? htmlspecialchars($_POST['content_check_string']) : ''; ?>">
                                <div class="form-text">Geben Sie einen Text ein, der in der Antwort enthalten sein soll.</div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-search"></i> Website prüfen
                            </button>
                        </form>
                        
                        <?php if (isset($result)): ?>
                            <div class="mt-4">
                                <h5>Prüfergebnis</h5>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <th style="width: 200px;">URL</th>
                                                <td><?php echo htmlspecialchars($result['url']); ?></td>
                                            </tr>
                                            <tr>
                                                <th>Zeitstempel</th>
                                                <td><?php echo htmlspecialchars($result['timestamp']); ?></td>
                                            </tr>
                                            <tr>
                                                <th>HTTP-Status</th>
                                                <td>
                                                    <span class="badge <?php echo $result['success'] ? 'bg-success' : 'bg-danger'; ?>">
                                                        <?php echo htmlspecialchars($result['status']); ?>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Antwortzeit</th>
                                                <td><?php echo htmlspecialchars($result['response_time']); ?> ms</td>
                                            </tr>
                                            <tr>
                                                <th>HTTP-Status</th>
                                                <td>
                                                    <?php if ($result['success']): ?>
                                                        <span class="text-success"><i class="bi bi-check-circle-fill"></i> Erfolgreich</span>
                                                    <?php else: ?>
                                                        <span class="text-danger"><i class="bi bi-x-circle-fill"></i> Fehlgeschlagen</span>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                            <?php if (isset($result['content_check_string']) && !empty($result['content_check_string'])): ?>
                                            <tr>
                                                <th>Geprüfter String</th>
                                                <td><?php echo htmlspecialchars($result['content_check_string']); ?></td>
                                            </tr>
                                            <tr>
                                                <th>String gefunden</th>
                                                <td>
                                                    <?php if ($result['content_check_success']): ?>
                                                        <span class="text-success"><i class="bi bi-check-circle-fill"></i> Ja</span>
                                                    <?php else: ?>
                                                        <span class="text-danger"><i class="bi bi-x-circle-fill"></i> Nein</span>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                            <?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Endpunkte Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'endpoints' ? 'show active' : ''; ?>" id="endpoints" role="tabpanel" aria-labelledby="endpoints-tab">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Konfigurierte Endpunkte</h5>
                    <div>
                        <button id="check-all-button" class="btn btn-success btn-sm me-2">
                            <i class="bi bi-check-all"></i> Alle Endpunkte prüfen
                        </button>
                        <a href="?tab=add" class="btn btn-primary btn-sm">
                            <i class="bi bi-plus-circle"></i> Neuen Endpunkt hinzufügen
                        </a>
                    </div>
                </div>
                
                <?php if (empty($endpoints)): ?>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> Keine Endpunkte konfiguriert. <a href="?tab=add" class="alert-link">Fügen Sie einen Endpunkt hinzu</a>.
                    </div>
                <?php else: ?>
                    <div class="row">
                        <?php foreach ($endpoints as $endpoint): ?>
                            <div class="col-md-6 col-lg-4">
                                <div class="card endpoint-card" data-endpoint-id="<?php echo htmlspecialchars($endpoint['id']); ?>">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h5 class="card-title mb-0"><?php echo htmlspecialchars($endpoint['name']); ?></h5>
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">
                                            <strong>URL:</strong> <a href="<?php echo htmlspecialchars($endpoint['url']); ?>" target="_blank"><?php echo htmlspecialchars($endpoint['url']); ?></a>
                                        </p>
                                        <p class="card-text">
                                            <strong>Intervall:</strong> <?php echo htmlspecialchars($endpoint['interval']); ?> Minuten
                                        </p>
                                        <?php if (isset($endpoint['content_check_string']) && !empty($endpoint['content_check_string'])): ?>
                                        <p class="card-text">
                                            <strong>Zu prüfender String:</strong> "<?php echo htmlspecialchars($endpoint['content_check_string']); ?>"
                                        </p>
                                        <?php endif; ?>
                                        <?php if (isset($endpoint['last_check'])): ?>
                                        <p class="card-text">
                                            <strong>Letzte Prüfung:</strong> <span class="last-check"><?php echo htmlspecialchars($endpoint['last_check']); ?></span>
                                        </p>
                                        <?php endif; ?>
                                        <?php if (isset($endpoint['next_check'])): ?>
                                        <p class="card-text">
                                            <strong>Nächste Prüfung:</strong> <span class="next-check"><?php echo htmlspecialchars($endpoint['next_check']); ?></span>
                                        </p>
                                        <?php endif; ?>
                                        <div class="card-actions mt-3">
                                            <button class="btn btn-primary btn-sm check-now-btn" data-endpoint-id="<?php echo htmlspecialchars($endpoint['id']); ?>">
                                                <i class="bi bi-arrow-repeat"></i> Jetzt prüfen
                                            </button>
                                            <a href="?action=edit_endpoint&id=<?php echo urlencode($endpoint['id']); ?>&tab=add" class="btn btn-secondary btn-sm">
                                                <i class="bi bi-pencil"></i> Bearbeiten
                                            </a>
                                            <a href="?action=delete_endpoint&id=<?php echo urlencode($endpoint['id']); ?>&tab=endpoints" class="btn btn-danger btn-sm" onclick="return confirm('Sind Sie sicher, dass Sie diesen Endpunkt löschen möchten?');">
                                                <i class="bi bi-trash"></i> Löschen
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- Endpunkt hinzufügen Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'add' ? 'show active' : ''; ?>" id="add" role="tabpanel" aria-labelledby="add-tab">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0"><?php echo $editEndpoint ? 'Endpunkt bearbeiten' : 'Neuen Endpunkt hinzufügen'; ?></h5>
                    </div>
                    <div class="card-body">
                        <form method="post" action="">
                            <input type="hidden" name="action" value="save_endpoint">
                            <?php if ($editEndpoint): ?>
                                <input type="hidden" name="endpoint_id" value="<?php echo htmlspecialchars($editEndpoint['id']); ?>">
                            <?php endif; ?>
                            
                            <div class="mb-3">
                                <label for="name" class="form-label">Name:</label>
                                <input type="text" class="form-control" id="name" name="name" placeholder="Meine Website" value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['name']) : ''; ?>">
                                <div class="form-text">Ein optionaler Name zur Identifizierung des Endpunkts.</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="url" class="form-label">URL:</label>
                                <input type="url" class="form-control" id="url" name="url" placeholder="https://example.com" value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['url']) : ''; ?>" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="interval" class="form-label">Prüfintervall (Minuten):</label>
                                <input type="number" class="form-control" id="interval" name="interval" min="1" value="<?php echo $editEndpoint ? htmlspecialchars($editEndpoint['interval']) : '5'; ?>" required>
                                <div class="form-text">Wie oft soll die Website überprüft werden (in Minuten).</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="content_check_string" class="form-label">Zu prüfender String (optional):</label>
                                <input type="text" class="form-control" id="content_check_string" name="content_check_string" placeholder="z.B. Birgit" value="<?php echo $editEndpoint && isset($editEndpoint['content_check_string']) ? htmlspecialchars($editEndpoint['content_check_string']) : ''; ?>">
                                <div class="form-text">Geben Sie einen Text ein, der in der Antwort enthalten sein soll.</div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-save"></i> <?php echo $editEndpoint ? 'Aktualisieren' : 'Speichern'; ?>
                            </button>
                            
                            <a href="?tab=endpoints" class="btn btn-secondary">
                                <i class="bi bi-x-circle"></i> Abbrechen
                            </a>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Run Chart Tab -->
            <div class="tab-pane fade <?php echo $activeTab === 'chart' ? 'show active' : ''; ?>" id="chart" role="tabpanel" aria-labelledby="chart-tab">
                <?php if ($logEntries > 0): ?>
                    <iframe src="<?php echo CHART_FILE; ?>" style="width: 100%; height: 800px; border: none;"></iframe>
                <?php else: ?>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> Keine Daten verfügbar. Führen Sie zuerst eine Website-Prüfung durch.
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Fortschritts-Modal -->
    <div class="modal fade progress-modal" id="progressModal" tabindex="-1" aria-labelledby="progressModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="progressModalLabel">Endpunkte werden geprüft</h5>
                </div>
                <div class="modal-body">
                    <p>Bitte warten Sie, während alle Endpunkte geprüft werden...</p>
                    <div class="progress mb-3">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                    </div>
                    <div id="progressDetails">
                        <p>Geprüft: <span id="checkedCount">0</span> von <span id="totalCount">0</span></p>
                        <p>Erfolgreich: <span id="successCount">0</span></p>
                        <p>Fehlgeschlagen: <span id="failCount">0</span></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelCheckAll" data-bs-dismiss="modal">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Bootstrap JS Bundle mit Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
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
            
            // Automatische Prüfung aller Endpoints alle 5 Minuten
            setInterval(function() {
                checkAllEndpointsAuto();
            }, 5 * 60 * 1000); // 5 Minuten
        });
        
        // Einzelnen Endpoint prüfen (AJAX)
        document.querySelectorAll('.check-now-btn').forEach(button => {
            button.addEventListener('click', function() {
                const endpointId = this.getAttribute('data-endpoint-id');
                const card = document.querySelector(`.card[data-endpoint-id="${endpointId}"]`);
                
                // Button deaktivieren während der Prüfung
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Prüfe...';
                
                fetch(`?ajax=check_endpoint&id=${endpointId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Zeitstempel aktualisieren
                            card.querySelector('.last-check').textContent = data.endpoint.last_check;
                            card.querySelector('.next-check').textContent = data.endpoint.next_check;
                            
                            // Erfolgsmeldung anzeigen
                            const alert = document.createElement('div');
                            alert.className = 'alert alert-success alert-dismissible fade show mt-3';
                            alert.innerHTML = `
                                <strong>Erfolg!</strong> Endpunkt wurde geprüft.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            `;
                            card.querySelector('.card-body').appendChild(alert);
                            
                            // Alert nach 3 Sekunden automatisch ausblenden
                            setTimeout(() => {
                                const bsAlert = new bootstrap.Alert(alert);
                                bsAlert.close();
                            }, 3000);
                        } else {
                            // Fehlermeldung anzeigen
                            const alert = document.createElement('div');
                            alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
                            alert.innerHTML = `
                                <strong>Fehler!</strong> ${data.message}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            `;
                            card.querySelector('.card-body').appendChild(alert);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Fehlermeldung anzeigen
                        const alert = document.createElement('div');
                        alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
                        alert.innerHTML = `
                            <strong>Fehler!</strong> Verbindungsproblem.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        card.querySelector('.card-body').appendChild(alert);
                    })
                    .finally(() => {
                        // Button wieder aktivieren
                        this.disabled = false;
                        this.innerHTML = '<i class="bi bi-arrow-repeat"></i> Jetzt prüfen';
                    });
            });
        });
        
        // Alle Endpoints prüfen mit Modal
        document.getElementById('check-all-button').addEventListener('click', function() {
            checkAllEndpoints();
        });
        
        // Funktion zum Prüfen aller Endpoints mit Modal
        function checkAllEndpoints() {
            const endpoints = <?php echo json_encode(array_keys($endpoints)); ?>;
            const totalCount = endpoints.length;
            let checkedCount = 0;
            let successCount = 0;
            let failCount = 0;
            let cancelCheck = false;
            
            // Modal vorbereiten und anzeigen
            const progressModal = new bootstrap.Modal(document.getElementById('progressModal'));
            const progressBar = document.querySelector('#progressModal .progress-bar');
            
            document.getElementById('totalCount').textContent = totalCount;
            document.getElementById('checkedCount').textContent = '0';
            document.getElementById('successCount').textContent = '0';
            document.getElementById('failCount').textContent = '0';
            
            progressBar.style.width = '0%';
            progressBar.setAttribute('aria-valuenow', 0);
            progressBar.textContent = '0%';
            
            progressModal.show();
            
            // Cancel-Button-Handler
            document.getElementById('cancelCheckAll').addEventListener('click', function() {
                cancelCheck = true;
            });
            
            // Endpoints nacheinander prüfen
            function checkNextEndpoint(index) {
                if (index >= endpoints.length || cancelCheck) {
                    // Alle Endpoints geprüft oder abgebrochen
                    setTimeout(() => {
                        progressModal.hide();
                        
                        // Erfolgsmeldung anzeigen
                        const alert = document.createElement('div');
                        alert.className = 'alert alert-success alert-dismissible fade show';
                        alert.innerHTML = `
                            <strong>Prüfung abgeschlossen!</strong> ${successCount} erfolgreich, ${failCount} fehlgeschlagen.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        document.querySelector('#endpoints').prepend(alert);
                        
                        // Alert nach 5 Sekunden automatisch ausblenden
                        setTimeout(() => {
                            const bsAlert = new bootstrap.Alert(alert);
                            bsAlert.close();
                        }, 5000);
                    }, 500);
                    return;
                }
                
                const endpointId = endpoints[index];
                
                // Fortschritt aktualisieren
                const progress = Math.round((index / endpoints.length) * 100);
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
                progressBar.textContent = `${progress}%`;
                
                // Endpoint prüfen
                fetch(`?ajax=check_endpoint&id=${endpointId}`)
                    .then(response => response.json())
                    .then(data => {
                        checkedCount++;
                        document.getElementById('checkedCount').textContent = checkedCount;
                        
                        if (data.success) {
                            successCount++;
                            document.getElementById('successCount').textContent = successCount;
                            
                            // Zeitstempel in der Karte aktualisieren
                            const card = document.querySelector(`.card[data-endpoint-id="${endpointId}"]`);
                            if (card) {
                                const lastCheckEl = card.querySelector('.last-check');
                                const nextCheckEl = card.querySelector('.next-check');
                                
                                if (lastCheckEl) lastCheckEl.textContent = data.endpoint.last_check;
                                if (nextCheckEl) nextCheckEl.textContent = data.endpoint.next_check;
                            }
                        } else {
                            failCount++;
                            document.getElementById('failCount').textContent = failCount;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        checkedCount++;
                        failCount++;
                        document.getElementById('checkedCount').textContent = checkedCount;
                        document.getElementById('failCount').textContent = failCount;
                    })
                    .finally(() => {
                        // Nächsten Endpoint prüfen
                        setTimeout(() => {
                            checkNextEndpoint(index + 1);
                        }, 500); // Kurze Verzögerung zwischen den Anfragen
                    });
            }
            
            // Starte die Prüfung mit dem ersten Endpoint
            checkNextEndpoint(0);
        }
        
        // Funktion zum automatischen Prüfen aller Endpoints (ohne Modal)
        function checkAllEndpointsAuto() {
            const endpoints = <?php echo json_encode(array_keys($endpoints)); ?>;
            
            // Endpoints nacheinander prüfen
            function checkNextEndpoint(index) {
                if (index >= endpoints.length) {
                    console.log('Automatische Prüfung abgeschlossen');
                    return;
                }
                
                const endpointId = endpoints[index];
                
                // Endpoint prüfen
                fetch(`?ajax=check_endpoint&id=${endpointId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Zeitstempel in der Karte aktualisieren
                            const card = document.querySelector(`.card[data-endpoint-id="${endpointId}"]`);
                            if (card) {
                                const lastCheckEl = card.querySelector('.last-check');
                                const nextCheckEl = card.querySelector('.next-check');
                                
                                if (lastCheckEl) lastCheckEl.textContent = data.endpoint.last_check;
                                if (nextCheckEl) nextCheckEl.textContent = data.endpoint.next_check;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
                    .finally(() => {
                        // Nächsten Endpoint prüfen
                        setTimeout(() => {
                            checkNextEndpoint(index + 1);
                        }, 500); // Kurze Verzögerung zwischen den Anfragen
                    });
            }
            
            // Starte die Prüfung mit dem ersten Endpoint
            checkNextEndpoint(0);
        }
    </script>
</body>
</html>
