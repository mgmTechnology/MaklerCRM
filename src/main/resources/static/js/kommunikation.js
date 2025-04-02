/**
 * Initialisiert das Kommunikations-Modul
 * @function
 */
function initKommunikation() {
    loadContacts();
    initializeEventListeners();
    setupMessageForm();
}

/**
 * Lädt die Dummy-Kontaktdaten
 * @function
 */
function loadContacts() {
    const contacts = [
        {
            id: 'contact1',
            firstName: 'Thomas',
            lastName: 'Schmidt',
            email: 'thomas.schmidt@email.de',
            phone: '+49 123 456789',
            category: 'kunde',
            status: 'online',
            lastMessage: 'Vielen Dank für die Informationen.',
            lastMessageTime: '10:30'
        },
        {
            id: 'contact2',
            firstName: 'Maria',
            lastName: 'Müller',
            email: 'maria.mueller@email.de',
            phone: '+49 987 654321',
            category: 'kunde',
            status: 'offline',
            lastMessage: 'Ich melde mich morgen wieder.',
            lastMessageTime: 'Gestern'
        },
        {
            id: 'contact3',
            firstName: 'AllSecure',
            lastName: 'Versicherung',
            email: 'support@allsecure.de',
            phone: '+49 800 123456',
            category: 'versicherung',
            status: 'online',
            lastMessage: 'Neue Tarife verfügbar',
            lastMessageTime: 'Vor 2h'
        }
    ];

    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = contacts.map(contact => `
        <a href="#" class="list-group-item list-group-item-action" onclick="selectContact('${contact.id}')">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <div class="d-flex align-items-center">
                        <div class="avatar me-3">
                            <img src="https://via.placeholder.com/32" class="rounded-circle" alt="Avatar">
                            <span class="position-absolute bottom-0 end-0 transform-translate-middle p-1 bg-${contact.status === 'online' ? 'success' : 'secondary'} rounded-circle">
                            </span>
                        </div>
                        <div>
                            <h6 class="mb-0">${contact.firstName} ${contact.lastName}</h6>
                            <small class="text-muted">${contact.lastMessage}</small>
                        </div>
                    </div>
                </div>
                <small class="text-muted">${contact.lastMessageTime}</small>
            </div>
        </a>
    `).join('');
}

/**
 * Initialisiert die Event-Listener
 * @function
 */
function initializeEventListeners() {
    // Kontaktsuche
    document.getElementById('contactSearch').addEventListener('input', filterContacts);
}

/**
 * Richtet das Nachrichtenformular ein
 * @function
 */
function setupMessageForm() {
    const form = document.getElementById('messageForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
}

/**
 * Filtert die Kontakte basierend auf dem Suchbegriff
 * @function
 */
function filterContacts() {
    const searchTerm = document.getElementById('contactSearch').value.toLowerCase();
    // Implementierung der Suchlogik hier
    console.log('Filtering contacts:', searchTerm);
}

/**
 * Wählt einen Kontakt aus und lädt den Chat
 * @param {string} contactId - Die ID des Kontakts
 */
function selectContact(contactId) {
    // Dummy-Chatverlauf
    const messages = [
        {
            sender: 'user',
            text: 'Guten Tag, ich habe eine Frage zu meiner Versicherung.',
            time: '10:15'
        },
        {
            sender: 'contact',
            text: 'Guten Tag! Wie kann ich Ihnen helfen?',
            time: '10:20'
        },
        {
            sender: 'user',
            text: 'Ich möchte gerne wissen, ob meine Versicherung auch im Ausland gilt.',
            time: '10:25'
        },
        {
            sender: 'contact',
            text: 'Ja, Ihre Versicherung gilt in allen EU-Ländern. Für Details schauen Sie bitte in Ihre Police.',
            time: '10:30'
        }
    ];

    // Chat anzeigen
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = messages.map(message => `
        <div class="d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3">
            <div class="message ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-white'} rounded p-2" style="max-width: 75%;">
                <div class="message-text">${message.text}</div>
                <small class="text-${message.sender === 'user' ? 'light' : 'muted'}">${message.time}</small>
            </div>
        </div>
    `).join('');

    // Scroll zum letzten Nachricht
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Sendet eine neue Nachricht
 * @function
 */
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        // Nachricht zum Chat hinzufügen
        const messagesList = document.getElementById('messagesList');
        const messageElement = document.createElement('div');
        messageElement.className = 'd-flex justify-content-end mb-3';
        messageElement.innerHTML = `
            <div class="message bg-primary text-white rounded p-2" style="max-width: 75%;">
                <div class="message-text">${message}</div>
                <small class="text-light">${new Date().toLocaleTimeString().slice(0, 5)}</small>
            </div>
        `;
        messagesList.appendChild(messageElement);

        // Input leeren und zum Ende scrollen
        input.value = '';
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

/**
 * Startet einen Audioanruf
 * @function
 */
function startCall() {
    console.log('Starting audio call...');
}

/**
 * Startet einen Videoanruf
 * @function
 */
function startVideoCall() {
    console.log('Starting video call...');
}

/**
 * Fügt eine Datei an
 * @function
 */
function attachFile() {
    console.log('Attaching file...');
}

/**
 * Fügt ein Emoji ein
 * @function
 */
function insertEmoji() {
    console.log('Inserting emoji...');
}

/**
 * Speichert einen neuen Kontakt
 * @function
 */
function saveNewContact() {
    console.log('Saving new contact...');
    const modal = bootstrap.Modal.getInstance(document.getElementById('newContactModal'));
    modal.hide();
}

/**
 * Bearbeitet einen Kontakt
 * @function
 */
function editContact() {
    console.log('Editing contact...');
}

/**
 * Löscht einen Kontakt
 * @function
 */
function deleteContact() {
    if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
        console.log('Deleting contact...');
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactDetailsModal'));
        modal.hide();
    }
}

// Initialisiere das Kommunikations-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initKommunikation();
}
