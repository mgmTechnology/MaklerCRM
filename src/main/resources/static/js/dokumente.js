/**
 * Initialisiert das Dokumente-Modul
 * @function
 */
function initDokumente() {
    loadDocuments();
    initializeEventListeners();
}

/**
 * Lädt die Dummy-Dokumentendaten
 * @function
 */
function loadDocuments() {
    const documents = [
        {
            name: 'Versicherungspolice_Schmidt_2024.pdf',
            type: 'vertrag',
            date: '01.01.2024',
            size: '245 KB',
            uploadedBy: 'Max Mustermann',
            id: 'doc1'
        },
        {
            name: 'Schadensmeldung_KFZ_15032024.pdf',
            type: 'schaden',
            date: '15.03.2024',
            size: '1.2 MB',
            uploadedBy: 'Max Mustermann',
            id: 'doc2'
        },
        {
            name: 'Antrag_Hausrat_Mueller.pdf',
            type: 'antrag',
            date: '01.03.2024',
            size: '380 KB',
            uploadedBy: 'Max Mustermann',
            id: 'doc3'
        }
    ];

    const tableBody = document.getElementById('documentsTableBody');
    tableBody.innerHTML = documents.map(doc => `
        <tr>
            <td>
                <i class="bi bi-file-earmark-pdf text-danger me-2"></i>
                ${doc.name}
            </td>
            <td><span class="badge bg-${getTypeBadgeClass(doc.type)}">${getTypeText(doc.type)}</span></td>
            <td>${doc.date}</td>
            <td>${doc.size}</td>
            <td>${doc.uploadedBy}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="previewDocument('${doc.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="downloadDocument('${doc.id}')">
                    <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument('${doc.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Event-Listener für Filter und Suche
 * @function
 */
function initializeEventListeners() {
    // Filter für Dokumententyp
    document.getElementById('documentType').addEventListener('change', filterDocuments);
    
    // Datumsfilter
    document.getElementById('dateFrom').addEventListener('change', filterDocuments);
    document.getElementById('dateTo').addEventListener('change', filterDocuments);
    
    // Suche
    document.getElementById('searchDocs').addEventListener('input', filterDocuments);
}

/**
 * Filtert die Dokumente basierend auf den ausgewählten Kriterien
 * @function
 */
function filterDocuments() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering documents...');
}

/**
 * Gibt die CSS-Klasse für den Typ-Badge zurück
 * @param {string} type - Der Dokumententyp
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getTypeBadgeClass(type) {
    switch(type) {
        case 'vertrag': return 'primary';
        case 'antrag': return 'success';
        case 'schaden': return 'danger';
        case 'korrespondenz': return 'info';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Dokumententyp zurück
 * @param {string} type - Der Dokumententyp
 * @returns {string} Der übersetzte Typ-Text
 */
function getTypeText(type) {
    switch(type) {
        case 'vertrag': return 'Vertrag';
        case 'antrag': return 'Antrag';
        case 'schaden': return 'Schadensmeldung';
        case 'korrespondenz': return 'Korrespondenz';
        default: return type;
    }
}

/**
 * Lädt ein neues Dokument hoch
 * @function
 */
function uploadDocument() {
    console.log('Uploading document...');
    // Hier würde die Upload-Logik implementiert
    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    modal.hide();
}

/**
 * Zeigt eine Vorschau des Dokuments
 * @param {string} docId - Die Dokument-ID
 */
function previewDocument(docId) {
    console.log('Previewing document:', docId);
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    
    // Dummy-Vorschau
    document.getElementById('documentPreview').innerHTML = `
        <div class="text-center p-5">
            <i class="bi bi-file-earmark-pdf display-1 text-danger"></i>
            <h4 class="mt-3">Dokumentenvorschau</h4>
            <p class="text-muted">Dokument-ID: ${docId}</p>
        </div>
    `;
    
    previewModal.show();
}

/**
 * Lädt ein Dokument herunter
 * @param {string} docId - Die Dokument-ID
 */
function downloadDocument(docId) {
    console.log('Downloading document:', docId);
}

/**
 * Löscht ein Dokument
 * @param {string} docId - Die Dokument-ID
 */
function deleteDocument(docId) {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
        console.log('Deleting document:', docId);
    }
}

// Initialisiere das Dokumente-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initDokumente();
}
