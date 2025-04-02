/**
 * Initialisiert die Dokumentenverwaltung
 * @function
 */
function initDokumentenverwaltung() {
    loadStatistics();
    loadBrokerList();
    loadDocuments();
    initializeEventListeners();
}

/**
 * Lädt die Statistiken
 * @function
 */
function loadStatistics() {
    document.getElementById('totalDocuments').textContent = '1.256';
    document.getElementById('storageUsed').textContent = '45,8 GB';
    document.getElementById('newDocuments').textContent = '34';
    document.getElementById('activeShares').textContent = '12';
}

/**
 * Lädt die Liste der Makler
 * @function
 */
function loadBrokerList() {
    // Dummy-Daten für Makler
    const brokers = [
        { id: 'M2024001', name: 'Thomas Schmidt' },
        { id: 'M2024002', name: 'Maria Weber' },
        { id: 'M2024003', name: 'Stefan Meyer' }
    ];

    const select = document.getElementById('brokerFilter');
    brokers.forEach(broker => {
        const option = document.createElement('option');
        option.value = broker.id;
        option.textContent = broker.name;
        select.appendChild(option);
    });
}

/**
 * Lädt die Dokumente
 * @function
 */
function loadDocuments() {
    // Dummy-Daten für Dokumente
    const documents = [
        {
            type: 'folder',
            name: 'Verträge',
            broker: '-',
            size: '-',
            modified: '29.03.2024',
            status: 'active',
            id: 'folder1'
        },
        {
            type: 'folder',
            name: 'Schulungen',
            broker: '-',
            size: '-',
            modified: '28.03.2024',
            status: 'active',
            id: 'folder2'
        },
        {
            type: 'pdf',
            name: 'Provisionsrichtlinie_2024.pdf',
            broker: '-',
            size: '2,4 MB',
            modified: '25.03.2024',
            status: 'shared',
            id: 'doc1'
        },
        {
            type: 'doc',
            name: 'Schulungszertifikat_Schmidt.docx',
            broker: 'Thomas Schmidt',
            size: '568 KB',
            modified: '24.03.2024',
            status: 'active',
            id: 'doc2'
        }
    ];

    const tableBody = document.getElementById('documentsTableBody');
    tableBody.innerHTML = documents.map(doc => `
        <tr>
            <td>
                <i class="bi ${getDocumentIcon(doc.type)} ${doc.type === 'folder' ? 'text-warning' : 'text-primary'}"></i>
            </td>
            <td>
                <a href="#" onclick="${doc.type === 'folder' ? `navigateFolder('${doc.id}')` : `viewDocumentDetails('${doc.id}')`}">
                    ${doc.name}
                </a>
            </td>
            <td>${getDocumentTypeText(doc.type)}</td>
            <td>${doc.broker}</td>
            <td>${doc.size}</td>
            <td>${doc.modified}</td>
            <td><span class="badge bg-${getStatusBadgeClass(doc.status)}">${getStatusText(doc.status)}</span></td>
            <td>
                ${doc.type !== 'folder' ? `
                <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadDocument('${doc.id}')">
                    <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="shareDocument('${doc.id}')">
                    <i class="bi bi-share"></i>
                </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument('${doc.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Event-Listener
 * @function
 */
function initializeEventListeners() {
    document.getElementById('documentType').addEventListener('change', filterDocuments);
    document.getElementById('brokerFilter').addEventListener('change', filterDocuments);
    document.getElementById('periodFilter').addEventListener('change', filterDocuments);
    document.getElementById('searchDocuments').addEventListener('input', filterDocuments);
}

/**
 * Filtert die Dokumente
 * @function
 */
function filterDocuments() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering documents...');
}

/**
 * Navigiert zu einem Ordner
 * @param {string} folderId - Die ID des Ordners
 */
function navigateFolder(folderId) {
    console.log('Navigating to folder:', folderId);
    // Aktualisiere den Breadcrumb-Pfad
    updateFolderPath(folderId);
    // Lade Dokumente für den neuen Ordner
    loadDocuments();
}

/**
 * Aktualisiert den Ordnerpfad in der Breadcrumb-Navigation
 * @param {string} folderId - Die ID des aktuellen Ordners
 */
function updateFolderPath(folderId) {
    // Dummy-Implementierung
    const path = document.getElementById('folderPath');
    if (folderId === 'root') {
        path.innerHTML = '<li class="breadcrumb-item"><a href="#" onclick="navigateFolder(\'root\')">Home</a></li>';
    } else {
        path.innerHTML = `
            <li class="breadcrumb-item"><a href="#" onclick="navigateFolder('root')">Home</a></li>
            <li class="breadcrumb-item active">Aktueller Ordner</li>
        `;
    }
}

/**
 * Zeigt die Details eines Dokuments an
 * @param {string} documentId - Die ID des Dokuments
 */
function viewDocumentDetails(documentId) {
    // Dummy-Daten für ein Dokument
    const document = {
        info: {
            name: 'Provisionsrichtlinie_2024.pdf',
            type: 'pdf',
            size: '2,4 MB',
            created: '25.03.2024',
            modified: '25.03.2024',
            createdBy: 'Admin',
            modifiedBy: 'Admin',
            version: '1.0',
            status: 'shared'
        },
        history: [
            {
                date: '25.03.2024 14:30',
                user: 'Admin',
                action: 'Dokument erstellt'
            },
            {
                date: '25.03.2024 14:35',
                user: 'Admin',
                action: 'Freigabe hinzugefügt'
            }
        ],
        sharing: [
            {
                user: 'Thomas Schmidt',
                type: 'read',
                expires: '25.04.2024'
            },
            {
                user: 'Maria Weber',
                type: 'read',
                expires: '25.04.2024'
            }
        ]
    };

    // Informationen
    document.getElementById('documentInfo').innerHTML = `
        <dl class="row mb-0">
            <dt class="col-sm-4">Name</dt>
            <dd class="col-sm-8">${document.info.name}</dd>
            
            <dt class="col-sm-4">Typ</dt>
            <dd class="col-sm-8">${getDocumentTypeText(document.info.type)}</dd>
            
            <dt class="col-sm-4">Größe</dt>
            <dd class="col-sm-8">${document.info.size}</dd>
            
            <dt class="col-sm-4">Erstellt am</dt>
            <dd class="col-sm-8">${document.info.created}</dd>
            
            <dt class="col-sm-4">Erstellt von</dt>
            <dd class="col-sm-8">${document.info.createdBy}</dd>
            
            <dt class="col-sm-4">Geändert am</dt>
            <dd class="col-sm-8">${document.info.modified}</dd>
            
            <dt class="col-sm-4">Geändert von</dt>
            <dd class="col-sm-8">${document.info.modifiedBy}</dd>
            
            <dt class="col-sm-4">Version</dt>
            <dd class="col-sm-8">${document.info.version}</dd>
            
            <dt class="col-sm-4">Status</dt>
            <dd class="col-sm-8">
                <span class="badge bg-${getStatusBadgeClass(document.info.status)}">
                    ${getStatusText(document.info.status)}
                </span>
            </dd>
        </dl>
    `;

    // Verlauf
    document.getElementById('documentHistory').innerHTML = `
        <div class="timeline">
            ${document.history.map(entry => `
                <div class="timeline-item">
                    <div class="timeline-date">${entry.date}</div>
                    <div class="timeline-content">
                        <strong>${entry.user}</strong>
                        <p>${entry.action}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Freigaben
    document.getElementById('documentSharing').innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Benutzer</th>
                        <th>Berechtigung</th>
                        <th>Gültig bis</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${document.sharing.map(share => `
                        <tr>
                            <td>${share.user}</td>
                            <td>${share.type === 'read' ? 'Lesen' : 'Bearbeiten'}</td>
                            <td>${share.expires}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeSharing('${share.user}')">
                                    <i class="bi bi-x-circle"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('documentDetailsModal'));
    modal.show();
}

/**
 * Erstellt einen neuen Ordner
 * @function
 */
function createFolder() {
    const name = document.getElementById('newFolderName').value;
    const description = document.getElementById('newFolderDescription').value;
    const access = document.getElementById('newFolderAccess').value;

    console.log('Creating folder:', { name, description, access });
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createFolderModal'));
    modal.hide();
    
    // Aktualisiere die Dokumentenliste
    loadDocuments();
}

/**
 * Lädt ein Dokument hoch
 * @function
 */
function uploadDocument() {
    // Simuliere einen Datei-Upload-Dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Uploading file:', file.name);
            // Implementiere hier den Upload-Prozess
            loadDocuments(); // Aktualisiere die Liste nach dem Upload
        }
    };
    input.click();
}

/**
 * Lädt ein Dokument herunter
 * @param {string} documentId - Die ID des Dokuments
 */
function downloadDocument(documentId) {
    console.log('Downloading document:', documentId);
}

/**
 * Teilt ein Dokument
 * @param {string} documentId - Die ID des Dokuments
 */
function shareDocument(documentId) {
    console.log('Sharing document:', documentId);
}

/**
 * Löscht ein Dokument oder Ordner
 * @param {string} id - Die ID des Dokuments oder Ordners
 */
function deleteDocument(id) {
    if (confirm('Möchten Sie dieses Element wirklich löschen?')) {
        console.log('Deleting item:', id);
        loadDocuments(); // Aktualisiere die Liste nach dem Löschen
    }
}

/**
 * Entfernt eine Freigabe
 * @param {string} user - Der Benutzer, dessen Freigabe entfernt werden soll
 */
function removeSharing(user) {
    if (confirm(`Möchten Sie die Freigabe für ${user} wirklich entfernen?`)) {
        console.log('Removing sharing for:', user);
        viewDocumentDetails(); // Aktualisiere die Detailansicht
    }
}

/**
 * Gibt das Icon für einen Dokumententyp zurück
 * @param {string} type - Der Dokumententyp
 * @returns {string} Die CSS-Klasse für das Icon
 */
function getDocumentIcon(type) {
    switch(type) {
        case 'folder': return 'bi-folder';
        case 'pdf': return 'bi-file-pdf';
        case 'doc': return 'bi-file-word';
        case 'xls': return 'bi-file-excel';
        case 'ppt': return 'bi-file-ppt';
        case 'img': return 'bi-file-image';
        default: return 'bi-file';
    }
}

/**
 * Gibt den deutschen Text für einen Dokumententyp zurück
 * @param {string} type - Der Dokumententyp
 * @returns {string} Der übersetzte Typ-Text
 */
function getDocumentTypeText(type) {
    switch(type) {
        case 'folder': return 'Ordner';
        case 'pdf': return 'PDF';
        case 'doc': return 'Word';
        case 'xls': return 'Excel';
        case 'ppt': return 'PowerPoint';
        case 'img': return 'Bild';
        default: return type;
    }
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'success';
        case 'shared': return 'info';
        case 'archived': return 'secondary';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'active': return 'Aktiv';
        case 'shared': return 'Freigegeben';
        case 'archived': return 'Archiviert';
        default: return status;
    }
}

// Initialisiere die Dokumentenverwaltung wenn sie geladen wird
if (typeof router !== 'undefined') {
    initDokumentenverwaltung();
}
