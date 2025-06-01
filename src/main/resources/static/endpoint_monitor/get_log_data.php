<?php
header('Content-Type: application/json');

// Konstanten definieren
define('LOG_FILE', 'response_times.csv');

// Prüfen, ob die Log-Datei existiert
if (!file_exists(LOG_FILE)) {
    echo json_encode([]);
    exit;
}

// Daten aus der CSV-Datei lesen
function readLogData() {
    $data = [];
    $handle = fopen(LOG_FILE, 'r');
    
    // Header lesen
    $headers = fgetcsv($handle, 0, ",", '"', "\\");
    
    // Zeitzone auf Europe/Berlin setzen
    date_default_timezone_set('Europe/Berlin');
    
    // Daten lesen
    while (($row = fgetcsv($handle, 0, ",", '"', "\\")) !== false) {
        // Sicherstellen, dass die Anzahl der Werte mit der Anzahl der Header übereinstimmt
        if (count($headers) != count($row)) {
            if (count($headers) > count($row)) {
                $row = array_pad($row, count($headers), '');
            } else {
                $row = array_slice($row, 0, count($headers));
            }
        }
        
        $rowData = array_combine($headers, $row);
        
        // Timestamp von UTC nach lokaler Zeit konvertieren und Format ändern
        if (isset($rowData['Timestamp'])) {
            $utcTime = new DateTime($rowData['Timestamp'], new DateTimeZone('UTC'));
            $utcTime->setTimeZone(new DateTimeZone('Europe/Berlin'));
            $rowData['Timestamp'] = $utcTime->format('d.m.Y H:i:s');
        }
        
        $data[] = $rowData;
    }
    
    fclose($handle);
    return $data;
}

echo json_encode(readLogData());