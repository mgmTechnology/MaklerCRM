/**
 * Schulungen Modul
 */
(function() {
    'use strict';

    console.log('%ctraining_makler.js wird geladen...', 'color: blue; font-size: 12px');

    /**
     * Initialisiert die Schulungen-Seite
     */
    function initSchulungenMakler() {
        console.groupCollapsed('🎓 Schulungen initialisieren');
        try {
            loadAvailableTrainings();
            loadCompletedTrainings();
            loadUpcomingTrainings();
            console.log('Schulungen erfolgreich initialisiert ✅');
        } catch (error) {
            console.error('❌ Fehler bei der Schulungen-Initialisierung:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die verfügbaren Schulungen
     * @private
     */
    function loadAvailableTrainings() {
        console.group('📚 Verfügbare Schulungen laden');
        try {
            // Demo-Daten für verfügbare Schulungen
            const trainings = [
                {
                    title: 'AIDA Grundlagen',
                    description: 'Einführung in die AIDA-Plattform und ihre Funktionen',
                    duration: '2 Stunden',
                    type: 'Online',
                    level: 'Anfänger'
                },
                {
                    title: 'Verkaufstechniken',
                    description: 'Moderne Verkaufsstrategien und Kundenberatung',
                    duration: '4 Stunden',
                    type: 'Präsenz',
                    level: 'Fortgeschritten'
                },
                {
                    title: 'Digitale Tools',
                    description: 'Effiziente Nutzung der digitalen Werkzeuge',
                    duration: '3 Stunden',
                    type: 'Hybrid',
                    level: 'Mittel'
                }
            ];

            const container = document.getElementById('availableTrainingsMakler');
            if (!container) {
                throw new Error('Container für verfügbare Schulungen nicht gefunden');
            }

            container.innerHTML = trainings.map(training => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${training.title}</h5>
                            <p class="card-text">${training.description}</p>
                            <ul class="list-unstyled">
                                <li><i class="bi bi-clock"></i> ${training.duration}</li>
                                <li><i class="bi bi-laptop"></i> ${training.type}</li>
                                <li><i class="bi bi-bar-chart"></i> ${training.level}</li>
                            </ul>
                            <button class="btn btn-primary" onclick="registerForTraining('${training.title}')">
                                Anmelden
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            console.log('Verfügbare Schulungen erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der verfügbaren Schulungen:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die abgeschlossenen Schulungen
     * @private
     */
    function loadCompletedTrainings() {
        console.group('🎯 Abgeschlossene Schulungen laden');
        try {
            // Demo-Daten für abgeschlossene Schulungen
            const trainings = [
                {
                    title: 'CRM Grundkurs',
                    completedDate: '15.03.2025',
                    score: '95%',
                    certificate: 'CRM-2025-001'
                },
                {
                    title: 'Datenschutz-Training',
                    completedDate: '28.02.2025',
                    score: '100%',
                    certificate: 'DSG-2025-042'
                }
            ];

            const tbody = document.querySelector('#completedTrainingsTableMakler tbody');
            if (!tbody) {
                throw new Error('Tabelle für abgeschlossene Schulungen nicht gefunden');
            }

            tbody.innerHTML = trainings.map(training => `
                <tr>
                    <td>${training.title}</td>
                    <td>${training.completedDate}</td>
                    <td>${training.score}</td>
                    <td>${training.certificate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="downloadCertificate('${training.certificate}')">
                            <i class="bi bi-download"></i> Zertifikat
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('Abgeschlossene Schulungen erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der abgeschlossenen Schulungen:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Lädt die anstehenden Schulungen
     * @private
     */
    function loadUpcomingTrainings() {
        console.group('📅 Anstehende Schulungen laden');
        try {
            // Demo-Daten für anstehende Schulungen
            const trainings = [
                {
                    title: 'AIDA Advanced',
                    date: '15.04.2026',
                    time: '10:00 - 12:00',
                    location: 'Online',
                    trainer: 'Dr. Taus'
                },
                {
                    title: 'Verkaufspsychologie',
                    date: '22.04.2026',
                    time: '14:00 - 18:00',
                    location: 'Schulungszentrum Berlin',
                    trainer: 'Prof. Richter'
                }
            ];

            const tbody = document.querySelector('#upcomingTrainingsTableMakler tbody');
            if (!tbody) {
                throw new Error('Tabelle für anstehende Schulungen nicht gefunden');
            }

            tbody.innerHTML = trainings.map(training => `
                <tr>
                    <td>${training.title}</td>
                    <td>${training.date}</td>
                    <td>${training.time}</td>
                    <td>${training.location}</td>
                    <td>${training.trainer}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelTraining('${training.title}')">
                            <i class="bi bi-x-circle"></i> Abmelden
                        </button>
                    </td>
                </tr>
            `).join('');

            console.log('Anstehende Schulungen erfolgreich geladen ✅');
        } catch (error) {
            console.error('❌ Fehler beim Laden der anstehenden Schulungen:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Meldet den Benutzer für eine Schulung an
     * @param {string} title - Titel der Schulung
     */
    window.registerForTraining = function(title) {
        console.log(`Anmeldung für Schulung: ${title}`);
        alert(`Sie wurden erfolgreich für die Schulung "${title}" angemeldet.`);
    };

    /**
     * Lädt ein Zertifikat herunter
     * @param {string} certificateId - ID des Zertifikats
     */
    window.downloadCertificate = function(certificateId) {
        console.log(`Download Zertifikat: ${certificateId}`);
        alert(`Das Zertifikat ${certificateId} wird heruntergeladen...`);
    };

    /**
     * Meldet den Benutzer von einer Schulung ab
     * @param {string} title - Titel der Schulung
     */
    window.cancelTraining = function(title) {
        console.log(`Abmeldung von Schulung: ${title}`);
        if (confirm(`Möchten Sie sich wirklich von der Schulung "${title}" abmelden?`)) {
            alert(`Sie wurden erfolgreich von der Schulung "${title}" abgemeldet.`);
        }
    };

    // Exportiere die Initialisierungsfunktion
    window.initSchulungenMakler = initSchulungenMakler;

    console.log('%cSchulungen.js geladen ✅', 'color: blue; font-size: 12px');
})();
