<?php
/**
 * Cron-Script für Website-Monitoring
 * 
 * Dieses Script kann über einen Cron-Job regelmäßig ausgeführt werden,
 * um die konfigurierten Endpunkte zu überprüfen.
 */

// Fehlerberichterstattung aktivieren
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Konstanten definieren
define('LOG_FILE', 'response_times.csv');
define('CONFIG_FILE', 'endpoints.json');

// Prüfen, ob die Konfigurationsdatei existiert
if (!file_exists(CONFIG_FILE)) {
    die("Keine Endpunkte konfiguriert. Bitte konfigurieren Sie zuerst Endpunkte über die Web-Oberfläche.\n");
}

// Endpunkte laden
function loadEndpoints() {
    $json = file_get_contents(CONFIG_FILE);
    return json_decode($json, true) ?: [];
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

// Endpunkte laden
$endpoints = loadEndpoints();

// Aktuelle Zeit
$now = time();

// Endpunkte überprüfen
$checkedEndpoints = 0;

foreach ($endpoints as $id => $endpoint) {
    // Prüfen, ob der Endpunkt jetzt überprüft werden muss
    $nextCheckTime = isset($endpoint['next_check']) ? strtotime($endpoint['next_check']) : 0;
    
    if ($nextCheckTime <= $now) {
        echo "Überprüfe Endpunkt: " . $endpoint['name'] . " (" . $endpoint['url'] . ")\n";
        
        try {
            $result = checkWebsite($endpoint['url'], $endpoint['content_check_string'] ?? null);
            logResult($result);
            
            // Aktualisiere Zeitstempel für letzte und nächste Prüfung
            $endpoints[$id]['last_check'] = date('Y-m-d H:i:s');
            $endpoints[$id]['next_check'] = date('Y-m-d H:i:s', strtotime('+' . $endpoint['interval'] . ' minutes'));
            
            echo "  Status: " . $result['status'] . "\n";
            echo "  Antwortzeit: " . $result['response_time'] . " ms\n";
            
            if (isset($result['content_check_string']) && !empty($result['content_check_string'])) {
                echo "  Content-Check (\"" . $result['content_check_string'] . "\"): " . 
                     ($result['content_check_success'] ? "Gefunden" : "Nicht gefunden") . "\n";
            }
            
            echo "  Nächste Prüfung: " . $endpoints[$id]['next_check'] . "\n";
            
            $checkedEndpoints++;
        } catch (Exception $e) {
            echo "  Fehler: " . $e->getMessage() . "\n";
        }
    }
}

// Endpunkte speichern
saveEndpoints($endpoints);

echo "\nÜberprüfung abgeschlossen. $checkedEndpoints Endpunkt(e) überprüft.\n";
