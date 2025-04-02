// Dokumente-Modul
(function() {
    'use strict';

    // Dummy-Dokumentendaten
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

    /**
     * Initialisiert das Dokumente-Modul
     * @function
     */
    function initDokumente() {
        console.log('Initialisiere Dokumente-Modul...');
        try {
            loadDocuments();
            initializeEventListeners();
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Dokumente-Moduls:', error);
        }
    }

    /**
     * Lädt die Dokumentendaten in die Tabelle
     * @private
     */
    function loadDocuments() {
        const tableBody = document.getElementById('documentsTableBody');
        if (!tableBody) {
            console.error('Dokumente-Tabelle nicht gefunden');
            return;
        }

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
     * @private
     */
    function initializeEventListeners() {
        // Sichere Elementreferenzen
        const elements = {
            documentType: document.getElementById('documentType'),
            dateFrom: document.getElementById('dateFrom'),
            dateTo: document.getElementById('dateTo'),
            searchDocs: document.getElementById('searchDocs')
        };

        // Prüfe ob alle Elemente existieren
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.warn(`Element nicht gefunden: ${key}`);
                continue;
            }
            
            if (key === 'searchDocs') {
                element.addEventListener('input', filterDocuments);
            } else {
                element.addEventListener('change', filterDocuments);
            }
        }
    }

    /**
     * Filtert die Dokumente basierend auf den ausgewählten Kriterien
     * @private
     */
    function filterDocuments() {
        // Implementierung folgt
        console.log('Dokumente werden gefiltert...');
    }

    /**
     * Gibt die CSS-Klasse für den Typ-Badge zurück
     * @private
     * @param {string} type - Der Dokumententyp
     * @returns {string} Die CSS-Klasse für den Badge
     */
    function getTypeBadgeClass(type) {
        switch (type) {
            case 'vertrag': return 'primary';
            case 'schaden': return 'danger';
            case 'antrag': return 'success';
            default: return 'secondary';
        }
    }

    /**
     * Gibt den deutschen Text für den Dokumententyp zurück
     * @private
     * @param {string} type - Der Dokumententyp
     * @returns {string} Der übersetzte Typ-Text
     */
    function getTypeText(type) {
        switch (type) {
            case 'vertrag': return 'Vertrag';
            case 'schaden': return 'Schaden';
            case 'antrag': return 'Antrag';
            default: return type;
        }
    }

    /**
     * Lädt ein neues Dokument hoch
     * @function
     */
    function uploadDocument() {
        // Implementierung folgt
        console.log('Dokument wird hochgeladen...');
    }

    /**
     * Zeigt eine Vorschau des Dokuments
     * @param {string} docId - Die Dokument-ID
     */
    function previewDocument(docId) {
        const doc = documents.find(d => d.id === docId);
        if (!doc) {
            console.error('Dokument nicht gefunden:', docId);
            return;
        }

        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        const modalTitle = document.querySelector('#previewModal .modal-title');
        const modalBody = document.querySelector('#previewModal .modal-body');

        if (modalTitle && modalBody) {
            modalTitle.textContent = doc.name;
            modalBody.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-file-earmark-pdf display-1 text-danger"></i>
                    <p class="mt-3">Vorschau für ${doc.name}</p>
                </div>
            `;
        }

        modal.show();
    }

    /**
     * Lädt ein Dokument herunter
     * @param {string} docId - Die Dokument-ID
     */
    function downloadDocument(docId) {
        // Implementierung folgt
        console.log('Dokument wird heruntergeladen:', docId);
    }

    /**
     * Löscht ein Dokument
     * @param {string} docId - Die Dokument-ID
     */
    function deleteDocument(docId) {
        if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
            // Implementierung folgt
            console.log('Dokument wird gelöscht:', docId);
        }
    }

    // Exportiere die öffentliche API
    window.initDokumente = initDokumente;
    window.previewDocument = previewDocument;
    window.downloadDocument = downloadDocument;
    window.deleteDocument = deleteDocument;
    window.uploadDocument = uploadDocument;
})();

// Initialisiere das Dokumente-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initDokumente();
}
