# Website-Monitoring-System - Dokumentation

Dieses Website-Monitoring-System ermöglicht die regelmäßige Überwachung von Websites, die Prüfung auf bestimmte Inhalte und die Visualisierung der Antwortzeiten in einem Run Chart.

## Features

- Überwachung mehrerer Websites mit individuellen Intervallen
- Prüfung auf definierte Strings in der Website-Antwort (Content-Check)
- Visualisierung der Antwortzeiten in einem Run Chart
- Filterung der Daten nach URL und Zeitraum
- Voreingestellte Endpunkte für schnellen Start
- Responsive Design mit Bootstrap und Chart.js

## Installation

1. Entpacken Sie die ZIP-Datei in Ihr Web-Verzeichnis (z.B. `/var/www/html/website_monitor`)
2. Stellen Sie sicher, dass PHP (Version 7.4 oder höher) installiert ist
3. Stellen Sie sicher, dass die PHP-cURL-Erweiterung aktiviert ist
4. Setzen Sie Schreibrechte für das Verzeichnis: `chmod -R 755 /var/www/html/website_monitor`
5. Öffnen Sie die Anwendung in Ihrem Browser: `http://ihre-domain.com/website_monitor`

## Verwendung

### Einzelprüfung

- Geben Sie eine URL ein und klicken Sie auf "Website prüfen"
- Optional können Sie einen String angeben, der in der Antwort gesucht werden soll
- Das Ergebnis wird angezeigt und protokolliert

### Endpunkte verwalten

- Fügen Sie neue Endpunkte hinzu mit URL, Name, Prüfintervall und optionalem Content-Check-String
- Bearbeiten oder löschen Sie bestehende Endpunkte
- Führen Sie manuelle Prüfungen durch mit "Jetzt prüfen"

### Run Chart

- Visualisiert die Antwortzeiten aller überwachten Websites
- Filtert Daten nach URL und Zeitraum
- Zeigt Statistiken wie durchschnittliche, minimale und maximale Antwortzeit
- Zeigt Erfolgsraten für HTTP-Status und Content-Check

### Automatisierte Prüfung

Für regelmäßige automatische Prüfungen richten Sie einen Cron-Job ein:

```
*/5 * * * * php /pfad/zu/website_monitor/cron.php >> /pfad/zu/website_monitor/cron.log 2>&1
```

Dies führt die Prüfung alle 5 Minuten durch. Die tatsächlichen Prüfintervalle pro Endpunkt werden in der Anwendung konfiguriert.

## Voreingestellte Endpunkte

Die Anwendung ist mit folgenden voreingestellten Endpunkten konfiguriert:

1. Familiengarten NRW (https://familiengarten.nrw)
2. Kinderstube Birgit Scholz (https://kinderstube-birgit-scholz.de)
3. MGM Technology (https://mgm.technology)

Alle voreingestellten Endpunkte sind mit dem Content-Check-String "Birgit" konfiguriert.

## Dateien

- `index.php`: Hauptanwendung mit Benutzeroberfläche
- `chart.php`: Run Chart-Visualisierung
- `cron.php`: Script für automatisierte Prüfungen
- `endpoints.json`: Konfigurationsdatei für Endpunkte
- `response_times.csv`: Protokolldatei für Antwortzeiten

## Fehlerbehebung

- Wenn keine Daten im Run Chart angezeigt werden, stellen Sie sicher, dass mindestens eine Website-Prüfung durchgeführt wurde
- Bei Problemen mit dem Content-Check prüfen Sie, ob die Website den gesuchten String tatsächlich enthält
- Stellen Sie sicher, dass das Verzeichnis für die Anwendung schreibbar ist
