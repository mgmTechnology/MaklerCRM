// Berichte-Modul
(function() {
    'use strict';
    
    console.log('%cBerichte.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert die Berichte-Seite
     */
    function initBerichte() {
        console.log('%cInitialisiere Berichte...', 'color: blue; font-size: 12px');
        
        // Warte bis das DOM vollständig geladen ist
        if (document.readyState === 'loading') {
            console.log('DOM lädt noch, warte...');
            document.addEventListener('DOMContentLoaded', initBerichteContent);
        } else {
            console.log('DOM bereits geladen, initialisiere direkt');
            initBerichteContent();
        }
    }

    /**
     * Initialisiert den Inhalt der Berichte-Seite
     * @private
     */
    function initBerichteContent() {
        try {
            console.group('Berichte Initialisierung');
            
            // Prüfe ob Chart.js verfügbar ist
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js nicht gefunden! Bitte stellen Sie sicher, dass Chart.js geladen wurde.');
            }
            
            // 1. Statistiken laden
            console.log('1. Lade Statistiken...');
            loadStatistics();
            
            // 2. Top Performer laden
            console.log('2. Lade Top Performer...');
            loadTopPerformers();
            
            // 3. KPIs laden
            console.log('3. Lade KPIs...');
            loadKPIs();
            
            // 4. Charts initialisieren
            console.log('4. Initialisiere Charts...');
            initializeCharts();
            
            console.groupEnd();
        } catch (error) {
            console.error('Fehler bei der Berichte-Initialisierung:', error);
            throw error;
        }
    }

    /**
     * Lädt die Statistiken
     * @private
     */
    function loadStatistics() {
        const elements = {
            activeBrokers: document.getElementById('activeBrokers'),
            avgContracts: document.getElementById('avgContracts'),
            avgCommission: document.getElementById('avgCommission'),
            cancellationRate: document.getElementById('cancellationRate')
        };

        // Prüfe, ob alle Elemente existieren
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                throw new Error(`Element nicht gefunden: ${key}`);
            }
        }

        elements.activeBrokers.textContent = '42';
        elements.avgContracts.textContent = '8,5';
        elements.avgCommission.textContent = '1.850 €';
        elements.cancellationRate.textContent = '3,2%';
    }

    /**
     * Lädt die Top Performer
     * @private
     */
    function loadTopPerformers() {
        console.groupCollapsed('🏆 Top Performer laden');
        try {
            // Demo-Daten für Top Performer
            const topPerformers = [
                { name: 'Max Mustermann', contracts: 45, commission: '4.250 €' },
                { name: 'Anna Schmidt', contracts: 38, commission: '3.820 €' },
                { name: 'Tom Weber', contracts: 36, commission: '3.590 €' }
            ];

            console.log('Suche Top Performers Table...');
            const tbody = document.getElementById('topPerformersTable');
            console.log('Table gefunden:', tbody);
            
            if (!tbody) {
                throw new Error('Top Performers Table nicht gefunden');
            }

            console.log('Fülle Tabelle mit Daten...');
            tbody.innerHTML = topPerformers.map(performer => `
                <tr>
                    <td>${performer.name}</td>
                    <td>${performer.contracts}</td>
                    <td>${performer.commission}</td>
                </tr>
            `).join('');
            
            console.log('Tabelle erfolgreich gefüllt ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Top Performer:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die KPIs
     * @private
     */
    function loadKPIs() {
        console.groupCollapsed('📊 KPIs laden');
        try {
            // Demo-Daten für KPIs
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

            console.log('Suche KPI-Tabelle...');
            const table = document.getElementById('kpiTable');
            if (!table) {
                throw new Error('KPI-Tabelle nicht gefunden');
            }
            console.log('KPI-Tabelle gefunden ✅');

            const tbody = table.querySelector('tbody');
            if (!tbody) {
                throw new Error('KPI-Tabelle tbody nicht gefunden');
            }
            console.log('KPI-Tabelle tbody gefunden ✅');

            console.log('Fülle KPI-Daten...');
            tbody.innerHTML = kpis.map(kpi => `
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
            console.log('KPI-Daten erfolgreich eingefügt ✅');

        } catch (error) {
            console.error('❌ Fehler beim Laden der KPIs:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert die Charts
     * @private
     */
    function initializeCharts() {
        console.groupCollapsed('🎨 Charts Initialisierung');
        try {
            console.log('Suche Chart-Elemente...');
            const chartElements = {
                vertragsentwicklung: document.getElementById('vertragsentwicklungChart'),
                produktverteilung: document.getElementById('produktverteilungChart'),
                regionaleVerteilung: document.getElementById('regionaleVerteilungChart')
            };

            // Prüfe, ob alle Chart-Elemente existieren
            for (const [key, element] of Object.entries(chartElements)) {
                console.log(`Prüfe ${key}:`, element ? '✅ gefunden' : '❌ nicht gefunden');
                if (!element) {
                    throw new Error(`Chart-Element nicht gefunden: ${key}`);
                }
            }

            // Prüfe Chart.js Verfügbarkeit
            console.log('Prüfe Chart.js:', typeof Chart !== 'undefined' ? '✅ verfügbar' : '❌ nicht verfügbar');
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js ist nicht verfügbar!');
            }

            // Initialisiere die einzelnen Charts
            if (chartElements.vertragsentwicklung) {
                console.log('Initialisiere Vertragsentwicklung...');
                initVertragsentwicklung();
            }
            
            if (chartElements.produktverteilung) {
                console.log('Initialisiere Produktverteilung...');
                initProduktverteilung();
            }
            
            if (chartElements.regionaleVerteilung) {
                console.log('Initialisiere Regionale Verteilung...');
                initRegionaleVerteilung();
            }

        } catch (error) {
            console.error('❌ Fehler bei der Chart-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Vertragsentwicklungs-Chart
     * @private
     */
    function initVertragsentwicklung() {
        console.groupCollapsed('📈 Vertragsentwicklung Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('vertragsentwicklungChart');
            console.log('Canvas gefunden:', canvas);

            console.log('Hole 2D-Kontext...');
            const ctx = canvas.getContext('2d');
            console.log('Kontext erstellt:', ctx);

            console.log('Erstelle Chart-Konfiguration...');
            const config = {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                    datasets: [{
                        label: 'Verträge 2024',
                        data: [65, 72, 86, 81, 94, 102, 95, 105, 115, 108, 116, 123],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };

            console.log('Initialisiere Chart mit Konfiguration...');
            const chart = new Chart(ctx, config);
            console.log('Chart erstellt:', chart);
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Vertragsentwicklungs-Charts:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Produktverteilungs-Chart
     * @private
     */
    function initProduktverteilung() {
        console.groupCollapsed('🍩 Produktverteilung Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('produktverteilungChart');
            console.log('Canvas gefunden:', canvas);

            console.log('Hole 2D-Kontext...');
            const ctx = canvas.getContext('2d');
            console.log('Kontext erstellt:', ctx);

            console.log('Erstelle Chart-Konfiguration...');
            const config = {
                type: 'doughnut',
                data: {
                    labels: ['Lebensversicherung', 'KFZ', 'Hausrat', 'Haftpflicht', 'Sonstige'],
                    datasets: [{
                        data: [35, 25, 15, 15, 10],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };

            console.log('Initialisiere Chart mit Konfiguration...');
            const chart = new Chart(ctx, config);
            console.log('Chart erstellt:', chart);
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Produktverteilungs-Charts:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Regionale-Verteilungs-Chart
     * @private
     */
    function initRegionaleVerteilung() {
        console.groupCollapsed('📊 Regionale Verteilung Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('regionaleVerteilungChart');
            console.log('Canvas gefunden:', canvas);

            console.log('Hole 2D-Kontext...');
            const ctx = canvas.getContext('2d');
            console.log('Kontext erstellt:', ctx);

            console.log('Erstelle Chart-Konfiguration...');
            const config = {
                type: 'bar',
                data: {
                    labels: ['Nord', 'Süd', 'West', 'Ost', 'Zentral'],
                    datasets: [{
                        label: 'Verträge pro Region',
                        data: [285, 320, 245, 198, 275],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };

            console.log('Initialisiere Chart mit Konfiguration...');
            const chart = new Chart(ctx, config);
            console.log('Chart erstellt:', chart);
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Regionale-Verteilungs-Charts:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Hilfsfunktion für die Trendfarben
     * @param {string} trend - Der Trend (up, down, stable)
     * @returns {string} Die entsprechende Bootstrap-Farbe
     */
    function getTrendColor(trend) {
        switch (trend) {
            case 'up':
                return 'success';
            case 'down':
                return 'danger';
            case 'stable':
                return 'secondary';
            default:
                return 'secondary';
        }
    }

    // Exportiere die Initialisierungsfunktion
    window.initBerichte = initBerichte;
    
    console.log('%cBerichte.js geladen, initBerichte verfügbar:', 'color: blue; font-size: 12px', typeof window.initBerichte);

    // Initialisiere die Berichte, wenn das Script geladen wird
    initBerichte();
})();
