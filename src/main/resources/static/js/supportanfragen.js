/**
 * Initialisiert das Supportanfragen-Modul
 * @function
 */
function initSupportanfragen() {
    loadStatistics();
    loadSupportRequests();
    initializeFilters();
}

/**
 * Lädt die Statistiken
 * @function
 */
function loadStatistics() {
    document.getElementById('openRequests').textContent = '12';
    document.getElementById('avgResponseTime').textContent = '2.5h';
    document.getElementById('solvedRequests').textContent = '45';
    document.getElementById('customerSatisfaction').textContent = '94%';
}

/**
 * Lädt die Supportanfragen
 * @function
 */
function loadSupportRequests() {
    // Dummy-Daten für Supportanfragen
    const requests = [
        {
            id: 'TK2024001',
            broker: 'Thomas Schmidt',
            subject: 'Login-Problem',
            category: 'technical',
            priority: 'high',
            status: 'new',
            created: '29.03.2024 09:15',
            lastActivity: '29.03.2024 09:15'
        },
        {
            id: 'TK2024002',
            broker: 'Maria Weber',
            subject: 'Frage zu KFZ-Tarifen',
            category: 'product',
            priority: 'medium',
            status: 'inProgress',
            created: '28.03.2024 14:30',
            lastActivity: '29.03.2024 08:45'
        },
        {
            id: 'TK2024003',
            broker: 'Stefan Meyer',
            subject: 'Provision nicht erhalten',
            category: 'commission',
            priority: 'high',
            status: 'waiting',
            created: '27.03.2024 16:20',
            lastActivity: '28.03.2024 11:30'
        }
    ];

    const tableBody = document.getElementById('supportRequestsTableBody');
    tableBody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.id}</td>
            <td>${request.broker}</td>
            <td>${request.subject}</td>
            <td><span class="badge bg-${getCategoryBadgeClass(request.category)}">${getCategoryText(request.category)}</span></td>
            <td><span class="badge bg-${getPriorityBadgeClass(request.priority)}">${getPriorityText(request.priority)}</span></td>
            <td><span class="badge bg-${getStatusBadgeClass(request.status)}">${getStatusText(request.status)}</span></td>
            <td>${request.created}</td>
            <td>${request.lastActivity}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewTicketDetails('${request.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="assignTicket('${request.id}')">
                    <i class="bi bi-person-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="closeTicket('${request.id}')">
                    <i class="bi bi-x-circle"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialisiert die Filter
 * @function
 */
function initializeFilters() {
    document.getElementById('statusFilter').addEventListener('change', filterRequests);
    document.getElementById('priorityFilter').addEventListener('change', filterRequests);
    document.getElementById('categoryFilter').addEventListener('change', filterRequests);
    document.getElementById('searchRequest').addEventListener('input', filterRequests);
}

/**
 * Filtert die Supportanfragen
 * @function
 */
function filterRequests() {
    // Implementierung der Filter-Logik hier
    console.log('Filtering support requests...');
}

/**
 * Zeigt die Details eines Support-Tickets an
 * @param {string} ticketId - Die ID des Tickets
 */
function viewTicketDetails(ticketId) {
    // Dummy-Daten für Ticket-Details
    const ticket = {
        id: 'TK2024001',
        subject: 'Login-Problem',
        category: 'Technisch',
        priority: 'Hoch',
        status: 'Neu',
        created: '29.03.2024 09:15',
        lastActivity: '29.03.2024 09:15',
        description: 'Ich kann mich seit heute Morgen nicht mehr im Portal einloggen. Die Fehlermeldung lautet "Ungültige Anmeldedaten".',
        broker: {
            name: 'Thomas Schmidt',
            id: 'M2024001',
            email: 't.schmidt@email.de',
            phone: '+49 176 12345678',
            region: 'Nord',
            lastLogin: '28.03.2024 17:30'
        },
        comments: [
            {
                author: 'System',
                timestamp: '29.03.2024 09:15',
                content: 'Ticket wurde erstellt'
            },
            {
                author: 'Support',
                timestamp: '29.03.2024 09:30',
                content: 'Ticket wurde an IT-Support zugewiesen'
            }
        ]
    };

    // Ticket-Informationen
    document.getElementById('ticketInfo').innerHTML = `
        <dl class="row mb-0">
            <dt class="col-sm-4">Ticket-ID</dt>
            <dd class="col-sm-8">${ticket.id}</dd>
            
            <dt class="col-sm-4">Status</dt>
            <dd class="col-sm-8">
                <span class="badge bg-${getStatusBadgeClass(ticket.status.toLowerCase())}">
                    ${ticket.status}
                </span>
            </dd>
            
            <dt class="col-sm-4">Priorität</dt>
            <dd class="col-sm-8">
                <span class="badge bg-${getPriorityBadgeClass('high')}">
                    ${ticket.priority}
                </span>
            </dd>
            
            <dt class="col-sm-4">Kategorie</dt>
            <dd class="col-sm-8">
                <span class="badge bg-${getCategoryBadgeClass('technical')}">
                    ${ticket.category}
                </span>
            </dd>
            
            <dt class="col-sm-4">Erstellt am</dt>
            <dd class="col-sm-8">${ticket.created}</dd>
            
            <dt class="col-sm-4">Letzte Aktivität</dt>
            <dd class="col-sm-8">${ticket.lastActivity}</dd>
        </dl>
    `;

    // Makler-Informationen
    document.getElementById('brokerInfo').innerHTML = `
        <dl class="row mb-0">
            <dt class="col-sm-4">Name</dt>
            <dd class="col-sm-8">${ticket.broker.name}</dd>
            
            <dt class="col-sm-4">Makler-ID</dt>
            <dd class="col-sm-8">${ticket.broker.id}</dd>
            
            <dt class="col-sm-4">E-Mail</dt>
            <dd class="col-sm-8">${ticket.broker.email}</dd>
            
            <dt class="col-sm-4">Telefon</dt>
            <dd class="col-sm-8">${ticket.broker.phone}</dd>
            
            <dt class="col-sm-4">Region</dt>
            <dd class="col-sm-8">${ticket.broker.region}</dd>
            
            <dt class="col-sm-4">Letzter Login</dt>
            <dd class="col-sm-8">${ticket.broker.lastLogin}</dd>
        </dl>
    `;

    // Ticket-Beschreibung
    document.getElementById('ticketDescription').innerHTML = `
        <p class="mb-0">${ticket.description}</p>
    `;

    // Kommunikationsverlauf
    document.getElementById('ticketComments').innerHTML = ticket.comments.map(comment => `
        <div class="d-flex mb-3">
            <div class="flex-shrink-0">
                <div class="avatar avatar-sm">
                    <i class="bi bi-person-circle h3 mb-0"></i>
                </div>
            </div>
            <div class="flex-grow-1 ms-3">
                <div class="d-flex align-items-center mb-1">
                    <h6 class="mb-0">${comment.author}</h6>
                    <small class="text-muted ms-2">${comment.timestamp}</small>
                </div>
                <p class="mb-0">${comment.content}</p>
            </div>
        </div>
    `).join('<hr>');

    const modal = new bootstrap.Modal(document.getElementById('ticketDetailsModal'));
    modal.show();
}

/**
 * Weist ein Ticket einem Mitarbeiter zu
 * @param {string} ticketId - Die ID des Tickets
 */
function assignTicket(ticketId) {
    console.log('Assigning ticket:', ticketId);
}

/**
 * Schließt ein Ticket
 * @param {string} ticketId - Die ID des Tickets
 */
function closeTicket(ticketId) {
    console.log('Closing ticket:', ticketId);
}

/**
 * Fügt einen neuen Kommentar hinzu
 * @function
 */
function addComment() {
    const modal = new bootstrap.Modal(document.getElementById('newCommentModal'));
    modal.show();
}

/**
 * Speichert einen neuen Kommentar
 * @function
 */
function submitComment() {
    console.log('Submitting comment...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('newCommentModal'));
    modal.hide();
}

/**
 * Markiert ein Ticket als gelöst
 * @function
 */
function resolveTicket() {
    console.log('Resolving ticket...');
}

/**
 * Eskaliert ein Ticket
 * @function
 */
function escalateTicket() {
    console.log('Escalating ticket...');
}

/**
 * Exportiert die Supportanfragen
 * @function
 */
function exportSupportRequests() {
    console.log('Exporting support requests...');
}

/**
 * Gibt die CSS-Klasse für den Kategorie-Badge zurück
 * @param {string} category - Die Kategorie der Anfrage
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getCategoryBadgeClass(category) {
    switch(category) {
        case 'technical': return 'info';
        case 'product': return 'primary';
        case 'commission': return 'warning';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für die Kategorie zurück
 * @param {string} category - Die Kategorie der Anfrage
 * @returns {string} Der übersetzte Kategorie-Text
 */
function getCategoryText(category) {
    switch(category) {
        case 'technical': return 'Technisch';
        case 'product': return 'Produkt';
        case 'commission': return 'Provision';
        case 'other': return 'Sonstiges';
        default: return category;
    }
}

/**
 * Gibt die CSS-Klasse für den Prioritäts-Badge zurück
 * @param {string} priority - Die Priorität der Anfrage
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für die Priorität zurück
 * @param {string} priority - Die Priorität der Anfrage
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
 * Gibt die CSS-Klasse für den Status-Badge zurück
 * @param {string} status - Der Status der Anfrage
 * @returns {string} Die CSS-Klasse für den Badge
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'new': return 'primary';
        case 'inProgress': return 'warning';
        case 'waiting': return 'info';
        case 'solved': return 'success';
        default: return 'secondary';
    }
}

/**
 * Gibt den deutschen Text für den Status zurück
 * @param {string} status - Der Status der Anfrage
 * @returns {string} Der übersetzte Status-Text
 */
function getStatusText(status) {
    switch(status) {
        case 'new': return 'Neu';
        case 'inProgress': return 'In Bearbeitung';
        case 'waiting': return 'Wartend';
        case 'solved': return 'Gelöst';
        default: return status;
    }
}

// Initialisiere das Supportanfragen-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initSupportanfragen();
}
