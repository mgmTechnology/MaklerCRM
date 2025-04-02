/**
 * Initialisiert das Support-Modul
 * @function
 */
function initSupport() {
    loadSummary();
    loadTickets();
    initializeEventListeners();
}

/**
 * Lädt die Zusammenfassungsdaten
 * @function
 */
function loadSummary() {
    // Dummy-Daten für die Übersichtskarten
    document.getElementById('openTickets').textContent = '3';
    document.getElementById('inProgressTickets').textContent = '2';
    document.getElementById('solvedTickets').textContent = '15';
    document.getElementById('avgResponseTime').textContent = '4h';
}

/**
 * Lädt die Dummy-Ticketdaten
 * @function
 */
function loadTickets() {
    const tickets = [
        {
            number: 'TIC-2024-001',
            subject: 'Probleme beim Login',
            status: 'open',
            priority: 'high',
            category: 'technical',
            created: '15.03.2024',
            updated: '15.03.2024 14:30',
            id: 'ticket1'
        },
        {
            number: 'TIC-2024-002',
            subject: 'Frage zur Provisionsabrechnung',
            status: 'in_progress',
            priority: 'medium',
            category: 'billing',
            created: '14.03.2024',
            updated: '15.03.2024 10:15',
            id: 'ticket2'
        },
        {
            number: 'TIC-2024-003',
            subject: 'Vertragsdaten aktualisieren',
            status: 'solved',
            priority: 'low',
            category: 'contract',
            created: '13.03.2024',
            updated: '14.03.2024 16:45',
            id: 'ticket3'
        }
    ];

    const tableBody = document.getElementById('ticketsTableBody');
    tableBody.innerHTML = tickets.map(ticket => `
        <tr>
            <td>${ticket.number}</td>
            <td>${ticket.subject}</td>
            <td><span class="badge bg-${getStatusBadgeClass(ticket.status)}">${getStatusText(ticket.status)}</span></td>
            <td><span class="badge bg-${getPriorityBadgeClass(ticket.priority)}">${getPriorityText(ticket.priority)}</span></td>
            <td>${getCategoryText(ticket.category)}</td>
            <td>${ticket.created}</td>
            <td>${ticket.updated}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="bi bi-eye"></i>
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
    // Status-Filter
    document.getElementById('ticketStatus').addEventListener('change', filterTickets);
    
    // Prioritäts-Filter
    document.getElementById('ticketPriority').addEventListener('change', filterTickets);
    
    // Kategorie-Filter
    document.getElementById('ticketCategory').addEventListener('change', filterTickets);
    
    // Suche
    document.getElementById('searchTickets').addEventListener('input', filterTickets);
}

/**
 * Filtert die Tickets basierend auf den ausgewählten Kriterien
 * @function
 */
function filterTickets() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering tickets...');
}

/**
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status des Tickets
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'open': return 'primary';
        case 'in_progress': return 'warning';
        case 'solved': return 'success';
        case 'closed': return 'secondary';
        default: return 'secondary';
    }
}

/**
 * Gibt die CSS-Klasse für den Prioritäts-Badge zurück
 * @param {string} priority - Die Priorität des Tickets
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status des Tickets
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'open': return 'Offen';
        case 'in_progress': return 'In Bearbeitung';
        case 'solved': return 'Gelöst';
        case 'closed': return 'Geschlossen';
        default: return status;
    }
}

/**
 * Gibt den deutschen Text für die Priorität zurück
 * @param {string} priority - Die Priorität des Tickets
 * @returns {string} Der übersetzte Prioritäts-Text
 */
function getPriorityText(priority) {
    switch(priority) {
        case 'high': return 'Hoch';
        case 'medium': return 'Mittel';
        case 'low': return 'Niedrig';
        default: return priority;
    }
}

/**
 * Gibt den deutschen Text für die Kategorie zurück
 * @param {string} category - Die Kategorie des Tickets
 * @returns {string} Der übersetzte Kategorie-Text
 */
function getCategoryText(category) {
    switch(category) {
        case 'technical': return 'Technisch';
        case 'contract': return 'Vertrag';
        case 'billing': return 'Abrechnung';
        case 'other': return 'Sonstiges';
        default: return category;
    }
}

/**
 * Erstellt ein neues Ticket
 * @function
 */
function createTicket() {
    console.log('Creating new ticket...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('newTicketModal'));
    modal.hide();
}

/**
 * Zeigt die Details eines Tickets an
 * @param {string} ticketId - Die ID des Tickets
 */
function viewTicketDetails(ticketId) {
    // Dummy-Daten für die Detailansicht
    const details = {
        number: 'TIC-2024-001',
        subject: 'Probleme beim Login',
        status: 'Offen',
        priority: 'Hoch',
        category: 'Technisch',
        created: '15.03.2024',
        description: 'Ich kann mich seit heute Morgen nicht mehr im Portal einloggen. Die Fehlermeldung lautet: "Ungültige Anmeldedaten".',
        comments: [
            {
                author: 'Support Team',
                date: '15.03.2024 14:30',
                text: 'Wir haben Ihr Ticket erhalten und prüfen das Problem. Bitte versuchen Sie, Ihren Browser-Cache zu leeren.'
            },
            {
                author: 'Max Mustermann',
                date: '15.03.2024 14:45',
                text: 'Ich habe den Cache geleert, aber das Problem besteht weiterhin.'
            }
        ]
    };

    const detailsContainer = document.getElementById('ticketDetails');
    detailsContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-bold">Ticket-Nummer</label>
                <p>${details.number}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Status</label>
                <p>${details.status}</p>
            </div>
            <div class="col-md-12">
                <label class="form-label fw-bold">Betreff</label>
                <p>${details.subject}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Priorität</label>
                <p>${details.priority}</p>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-bold">Kategorie</label>
                <p>${details.category}</p>
            </div>
            <div class="col-md-12">
                <label class="form-label fw-bold">Beschreibung</label>
                <p>${details.description}</p>
            </div>
        </div>
    `;

    const commentsContainer = document.getElementById('ticketComments');
    commentsContainer.innerHTML = details.comments.map(comment => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <strong>${comment.author}</strong>
                    <small class="text-muted">${comment.date}</small>
                </div>
                <p class="mb-0 mt-2">${comment.text}</p>
            </div>
        </div>
    `).join('');

    const modal = new bootstrap.Modal(document.getElementById('ticketDetailsModal'));
    modal.show();
}

/**
 * Fügt einen neuen Kommentar hinzu
 * @function
 */
function addComment() {
    const commentForm = document.getElementById('commentForm');
    const commentText = commentForm.querySelector('textarea').value;
    
    if (commentText.trim()) {
        const commentsContainer = document.getElementById('ticketComments');
        const newComment = document.createElement('div');
        newComment.className = 'card mb-2';
        newComment.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <strong>Max Mustermann</strong>
                    <small class="text-muted">${new Date().toLocaleString()}</small>
                </div>
                <p class="mb-0 mt-2">${commentText}</p>
            </div>
        `;
        commentsContainer.appendChild(newComment);
        
        // Formular zurücksetzen
        commentForm.querySelector('textarea').value = '';
    }
}

// Initialisiere das Support-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initSupport();
}
