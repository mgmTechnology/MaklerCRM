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
            activeBrokers: document.getElementById('brokerActiveBrokers'),
            avgContracts: document.getElementById('brokerAvgContracts'),
            avgCommission: document.getElementById('brokerAvgCommission'),
            cancellationRate: document.getElementById('brokerCancellationRate')
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
                { name: 'Birgit Taus', contracts: 45, commission: '4.250 €' },
                { name: 'Christiane Koch', contracts: 38, commission: '3.820 €' },
                { name: 'Roland Lützow', contracts: 36, commission: '3.590 €' }
            ];

            console.log('Suche Top Performers Table...');
            const tbody = document.getElementById('brokerTopPerformersTable');
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
                    trend: 'up'
                },
                {
                    name: 'Durchschnittsprovision',
                    current: '1.850 €',
                    previous: '1.780 €',
                    trend: 'up'
                },
                {
                    name: 'Stornoquote',
                    current: '3,2%',
                    previous: '3,5%',
                    trend: 'down'
                }
            ];

            console.log('Suche KPI-Tabelle...');
            const tbody = document.getElementById('brokerKpiTable');
            if (!tbody) {
                throw new Error('KPI-Tabelle nicht gefunden');
            }
            console.log('KPI-Tabelle gefunden ✅');

            console.log('Fülle KPI-Daten...');
            tbody.innerHTML = kpis.map(kpi => `
                <tr>
                    <td>${kpi.name}</td>
                    <td>${kpi.current}</td>
                    <td>${kpi.previous}</td>
                    <td>
                        <i class="bi bi-arrow-${kpi.trend}" style="color: ${kpi.trend === 'up' ? 'green' : 'red'}"></i>
                    </td>
                </tr>
            `).join('');

            console.log('KPIs erfolgreich geladen ✅');
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
                vertragsentwicklung: document.getElementById('brokerContractChart'),
                produktverteilung: document.getElementById('brokerProductChart'),
                regionaleVerteilung: document.getElementById('brokerRegionChart')
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
                initContractChart();
            }
            
            if (chartElements.produktverteilung) {
                console.log('Initialisiere Produktverteilung...');
                initProductChart();
            }
            
            if (chartElements.regionaleVerteilung) {
                console.log('Initialisiere Regionale Verteilung...');
                initRegionChart();
            }

        } catch (error) {
            console.error('❌ Fehler bei der Chart-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Vertragsabschluss-Chart
     * @private
     */
    function initContractChart() {
        console.groupCollapsed('📈 Vertragsabschluss Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('brokerContractChart');
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
            console.error('❌ Fehler beim Erstellen des Vertragsabschluss-Charts:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Initialisiert das Produktverteilungs-Chart
     * @private
     */
    function initProductChart() {
        console.groupCollapsed('🍩 Produktverteilung Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('brokerProductChart');
            console.log('Canvas gefunden:', canvas);

            console.log('Hole 2D-Kontext...');
            const ctx = canvas.getContext('2d');
            console.log('Kontext erstellt:', ctx);

            console.log('Erstelle Chart-Konfiguration...');
            const config = {
                type: 'pie',
                data: {
                    labels: ['Leben', 'Sach', 'KFZ', 'Kranken'],
                    datasets: [{
                        data: [40, 30, 20, 10],
                        backgroundColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 99, 132)',
                            'rgb(255, 205, 86)',
                            'rgb(54, 162, 235)'
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
     * Initialisiert das Regions-Chart
     * @private
     */
    function initRegionChart() {
        console.groupCollapsed('📊 Regionale Verteilung Chart');
        try {
            console.log('Hole Canvas-Element...');
            const canvas = document.getElementById('brokerRegionChart');
            console.log('Canvas gefunden:', canvas);

            console.log('Hole 2D-Kontext...');
            const ctx = canvas.getContext('2d');
            console.log('Kontext erstellt:', ctx);

            console.log('Erstelle Chart-Konfiguration...');
            const config = {
                type: 'bar',
                data: {
                    labels: ['Nord', 'Süd', 'West', 'Ost'],
                    datasets: [{
                        label: 'Verträge nach Region',
                        data: [125, 158, 142, 98],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
