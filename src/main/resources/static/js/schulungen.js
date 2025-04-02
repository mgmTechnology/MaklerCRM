/**
 * Initialisiert das Schulungen & Zertifikate Modul
 * @function
 */
function initSchulungen() {
    loadStatistics();
    loadTrainings();
    loadCertifications();
    initializeCalendar();
    loadMaklerForSelect();
}

/**
 * Lädt die Statistiken
 * @function
 */
function loadStatistics() {
    document.getElementById('activeTrainings').textContent = '8';
    document.getElementById('totalParticipants').textContent = '156';
    document.getElementById('expiringCertificates').textContent = '12';
    document.getElementById('avgRating').textContent = '4.8';
}

/**
 * Lädt die Schulungsdaten
 * @function
 */
function loadTrainings() {
    // Dummy-Daten für Schulungen
    const trainings = [
        {
            id: 'TR001',
            title: 'Produktschulung: Neue KFZ-Tarife',
            type: 'online',
            date: '15.04.2024',
            duration: '4',
            participants: '25/30',
            status: 'upcoming',
            rating: '4.8'
        },
        {
            id: 'TR002',
            title: 'Verkaufstraining: Beratungsgespräche',
            type: 'praesenz',
            date: '22.04.2024',
            duration: '8',
            participants: '15/20',
            status: 'upcoming',
            rating: '-'
        },
        {
            id: 'TR003',
            title: 'Digitale Tools: CRM-System',
            type: 'hybrid',
            date: '28.03.2024',
            duration: '6',
            participants: '28/30',
            status: 'completed',
            rating: '4.6'
        }
    ];

    const tableBody = document.getElementById('trainingsTableBody');
    tableBody.innerHTML = trainings.map(training => `
        <tr>
            <td>${training.title}</td>
            <td><span class="badge bg-${getTrainingTypeBadgeClass(training.type)}">${getTrainingTypeText(training.type)}</span></td>
            <td>${training.date}</td>
            <td>${training.duration}h</td>
            <td>${training.participants}</td>
            <td><span class="badge bg-${getStatusBadgeClass(training.status)}">${getStatusText(training.status)}</span></td>
            <td>${training.rating}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewTrainingDetails('${training.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="editTraining('${training.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTraining('${training.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Lädt die Zertifikatsdaten
 * @function
 */
function loadCertifications() {
    // Dummy-Daten für Zertifikate
    const certifications = [
        {
            id: 'CERT001',
            broker: 'Thomas Schmidt',
            type: 'IHK-Prüfung',
            acquired: '15.12.2023',
            validUntil: '14.12.2026',
            status: 'valid'
        },
        {
            id: 'CERT002',
            broker: 'Maria Weber',
            type: 'DVEP-Zertifizierung',
            acquired: '20.02.2024',
            validUntil: '19.02.2025',
            status: 'valid'
        },
        {
            id: 'CERT003',
            broker: 'Stefan Meyer',
            type: 'Gutachter-Zertifizierung',
            acquired: '10.01.2023',
            validUntil: '09.01.2024',
            status: 'expiring'
        }
    ];

    const tableBody = document.getElementById('certificationsTableBody');
    tableBody.innerHTML = certifications.map(cert => `
        <tr>
            <td>${cert.broker}</td>
            <td>${cert.type}</td>
            <td>${cert.acquired}</td>
            <td>${cert.validUntil}</td>
            <td><span class="badge bg-${getCertStatusBadgeClass(cert.status)}">${getCertStatusText(cert.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewCertification('${cert.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="renewCertification('${cert.id}')">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCertification('${cert.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert den Kalender
 * @function
 */
function initializeCalendar() {
    const calendarEl = document.getElementById('trainingCalendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Produktschulung: Neue KFZ-Tarife',
                start: '2024-04-15',
                end: '2024-04-15',
                color: '#2c7be5'
            },
            {
                title: 'Verkaufstraining: Beratungsgespräche',
                start: '2024-04-22',
                end: '2024-04-22',
                color: '#00d97e'
            },
            {
                title: 'Digitale Tools: CRM-System',
                start: '2024-03-28',
                end: '2024-03-28',
                color: '#39afd1'
            }
        ]
    });
    calendar.render();
}

/**
 * Lädt die Makler für die Select-Box
 * @function
 */
function loadMaklerForSelect() {
    const makler = [
        { id: 'M001', name: 'Thomas Schmidt' },
        { id: 'M002', name: 'Maria Weber' },
        { id: 'M003', name: 'Stefan Meyer' }
    ];

    const select = document.querySelector('#newCertificationForm select:first-child');
    select.innerHTML = `
        <option value="">Bitte wählen...</option>
        ${makler.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
    `;
}

/**
 * Zeigt die Details einer Schulung an
 * @param {string} trainingId - Die ID der Schulung
 */
function viewTrainingDetails(trainingId) {
    // Dummy-Daten für Schulungsdetails
    const training = {
        title: 'Produktschulung: Neue KFZ-Tarife',
        type: 'Online-Schulung',
        date: '15.04.2024',
        time: '09:00 - 13:00',
        duration: '4 Stunden',
        trainer: 'Dr. Michael Wagner',
        description: 'Detaillierte Einführung in die neuen KFZ-Tarife und deren Besonderheiten.',
        participants: [
            { name: 'Thomas Schmidt', status: 'confirmed' },
            { name: 'Maria Weber', status: 'confirmed' },
            { name: 'Stefan Meyer', status: 'pending' }
        ],
        materials: [
            { name: 'Präsentation.pdf', size: '2.4 MB' },
            { name: 'Handout.pdf', size: '1.1 MB' },
            { name: 'Übungsaufgaben.pdf', size: '850 KB' }
        ],
        feedback: [
            { name: 'Thomas Schmidt', rating: 5, comment: 'Sehr informative Schulung!' },
            { name: 'Maria Weber', rating: 4, comment: 'Gut strukturiert und praxisnah.' }
        ]
    };

    // Info Tab
    document.getElementById('trainingInfo').innerHTML = `
        <dl class="row mb-0">
            <dt class="col-sm-3">Titel</dt>
            <dd class="col-sm-9">${training.title}</dd>
            
            <dt class="col-sm-3">Typ</dt>
            <dd class="col-sm-9">${training.type}</dd>
            
            <dt class="col-sm-3">Datum</dt>
            <dd class="col-sm-9">${training.date}</dd>
            
            <dt class="col-sm-3">Uhrzeit</dt>
            <dd class="col-sm-9">${training.time}</dd>
            
            <dt class="col-sm-3">Dauer</dt>
            <dd class="col-sm-9">${training.duration}</dd>
            
            <dt class="col-sm-3">Trainer</dt>
            <dd class="col-sm-9">${training.trainer}</dd>
            
            <dt class="col-sm-3">Beschreibung</dt>
            <dd class="col-sm-9">${training.description}</dd>
        </dl>
    `;

    // Teilnehmer Tab
    document.getElementById('participants').innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${training.participants.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td><span class="badge bg-${p.status === 'confirmed' ? 'success' : 'warning'}">${p.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary">Kontaktieren</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Materialien Tab
    document.getElementById('materials').innerHTML = `
        <div class="list-group">
            ${training.materials.map(m => `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-file-pdf me-2"></i>
                        ${m.name}
                    </div>
                    <div>
                        <small class="text-muted me-2">${m.size}</small>
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-download"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Feedback Tab
    document.getElementById('feedback').innerHTML = `
        <div class="mb-4">
            <h6>Durchschnittliche Bewertung</h6>
            <div class="display-4 mb-2">4.5</div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-success" style="width: 90%"></div>
            </div>
        </div>
        <div class="feedback-list">
            ${training.feedback.map(f => `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-2">${f.name}</h6>
                            <div class="text-warning">
                                ${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}
                            </div>
                        </div>
                        <p class="mb-0">${f.comment}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('trainingDetailsModal'));
    modal.show();
}

/**
 * Erstellt eine neue Schulung
 * @function
 */
function createTraining() {
    console.log('Creating new training...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTrainingModal'));
    modal.hide();
}

/**
 * Erstellt ein neues Zertifikat
 * @function
 */
function createCertification() {
    console.log('Creating new certification...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCertificationModal'));
    modal.hide();
}

/**
 * Gibt die CSS-Klasse für den Schulungstyp-Badge zurück
 * @param {string} type - Der Typ der Schulung
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getTrainingTypeBadgeClass(type) {
    switch(type) {
        case 'praesenz': return 'success';
        case 'online': return 'primary';
        case 'hybrid': return 'info';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Schulungstyp zurück
 * @param {string} type - Der Typ der Schulung
 * @returns {string} Der übersetzte Typ-Text
 */
function getTrainingTypeText(type) {
    switch(type) {
        case 'praesenz': return 'Präsenz';
        case 'online': return 'Online';
        case 'hybrid': return 'Hybrid';
        default: return type;
    }
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status der Schulung
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'upcoming': return 'primary';
        case 'completed': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status der Schulung
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'upcoming': return 'Geplant';
        case 'completed': return 'Abgeschlossen';
        case 'cancelled': return 'Abgesagt';
        default: return status;
    }
}

/**
 * Gibt die CSS-Klasse für den Zertifikats-Status-Badge zurück
 * @param {string} status - Der Status des Zertifikats
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getCertStatusBadgeClass(status) {
    switch(status) {
        case 'valid': return 'success';
        case 'expired': return 'danger';
        case 'expiring': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Zertifikats-Status zurück
 * @param {string} status - Der Status des Zertifikats
 * @returns {string} Der übersetzte Status-Text
 */
function getCertStatusText(status) {
    switch(status) {
        case 'valid': return 'Gültig';
        case 'expired': return 'Abgelaufen';
        case 'expiring': return 'Läuft bald ab';
        default: return status;
    }
}

// Initialisiere das Schulungen-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initSchulungen();
}
