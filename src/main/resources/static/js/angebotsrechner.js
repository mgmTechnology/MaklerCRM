/**
 * Initialisiert das Angebotsrechner-Modul
 * @function
 */
function initAngebotsrechner() {
    document.getElementById('customerSelect').addEventListener('change', toggleCustomerForm);
    hideAllForms();
}

/**
 * Wählt eine Versicherungsart aus und zeigt das entsprechende Formular
 * @param {string} type - Der Typ der Versicherung
 */
function selectInsuranceType(type) {
    const insuranceDetails = document.getElementById('insuranceDetails');
    insuranceDetails.classList.remove('d-none');
    
    // Template für verschiedene Versicherungsarten
    const templates = {
        kfz: createKfzTemplate(),
        leben: createLebenTemplate(),
        hausrat: createHausratTemplate(),
        haftpflicht: createHaftpflichtTemplate()
    };

    insuranceDetails.innerHTML = templates[type] || '';
    
    // Event-Listener für die Berechnung
    const form = document.querySelector('#insuranceDetails form');
    if (form) {
        form.addEventListener('change', calculateOffer);
    }
}

/**
 * Erstellt das Template für die KFZ-Versicherung
 * @returns {string} HTML-Template
 */
function createKfzTemplate() {
    return `
        <div class="card-header">
            <h5 class="card-title mb-0">KFZ-Versicherung</h5>
        </div>
        <div class="card-body">
            <form id="kfzForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Fahrzeugtyp</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="pkw">PKW</option>
                            <option value="motorrad">Motorrad</option>
                            <option value="lkw">LKW</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Erstzulassung</label>
                        <input type="date" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Schadenfreiheitsklasse</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="sf0">SF 0</option>
                            <option value="sf1">SF 1</option>
                            <option value="sf2">SF 2</option>
                            <option value="sf3">SF 3</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Jährliche Fahrleistung</label>
                        <input type="number" class="form-control" placeholder="km/Jahr" required>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Erstellt das Template für die Lebensversicherung
 * @returns {string} HTML-Template
 */
function createLebenTemplate() {
    return `
        <div class="card-header">
            <h5 class="card-title mb-0">Lebensversicherung</h5>
        </div>
        <div class="card-body">
            <form id="lebenForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Versicherungssumme</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">€</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Laufzeit</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">Jahre</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Beruf</label>
                        <input type="text" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Gesundheitszustand</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="sehr_gut">Sehr gut</option>
                            <option value="gut">Gut</option>
                            <option value="normal">Normal</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Erstellt das Template für die Hausratversicherung
 * @returns {string} HTML-Template
 */
function createHausratTemplate() {
    return `
        <div class="card-header">
            <h5 class="card-title mb-0">Hausratversicherung</h5>
        </div>
        <div class="card-body">
            <form id="hausratForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Wohnfläche</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">m²</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Versicherungssumme</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">€</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Gebäudetyp</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="einfamilienhaus">Einfamilienhaus</option>
                            <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                            <option value="wohnung">Wohnung</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Selbstbeteiligung</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">€</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Erstellt das Template für die Haftpflichtversicherung
 * @returns {string} HTML-Template
 */
function createHaftpflichtTemplate() {
    return `
        <div class="card-header">
            <h5 class="card-title mb-0">Haftpflichtversicherung</h5>
        </div>
        <div class="card-body">
            <form id="haftpflichtForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Versicherungstyp</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="privat">Privathaftpflicht</option>
                            <option value="familie">Familienhaftpflicht</option>
                            <option value="beruf">Berufshaftpflicht</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Deckungssumme</label>
                        <select class="form-select" required>
                            <option value="">Bitte wählen...</option>
                            <option value="3">3 Mio. €</option>
                            <option value="5">5 Mio. €</option>
                            <option value="10">10 Mio. €</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Selbstbeteiligung</label>
                        <div class="input-group">
                            <input type="number" class="form-control" required>
                            <span class="input-group-text">€</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Zeigt/versteckt das Formular für neue Kunden
 */
function toggleCustomerForm() {
    const selectedValue = document.getElementById('customerSelect').value;
    const newCustomerForm = document.getElementById('newCustomerForm');
    newCustomerForm.style.display = selectedValue ? 'none' : 'block';
}

/**
 * Versteckt alle Formulare beim Start
 */
function hideAllForms() {
    document.getElementById('insuranceDetails').classList.add('d-none');
    document.getElementById('calculationResult').classList.add('d-none');
}

/**
 * Berechnet das Angebot basierend auf den eingegebenen Daten
 */
function calculateOffer() {
    // Dummy-Berechnung für Demo-Zwecke
    const monthlyFee = Math.random() * 100 + 50;
    const yearlyFee = monthlyFee * 12;
    const insuranceSum = yearlyFee * 100;
    const deductible = yearlyFee * 0.01;

    // Ergebnisse anzeigen
    document.getElementById('monthlyFee').textContent = monthlyFee.toFixed(2) + ' €';
    document.getElementById('yearlyFee').textContent = yearlyFee.toFixed(2) + ' €';
    document.getElementById('insuranceSum').textContent = insuranceSum.toFixed(2) + ' €';
    document.getElementById('deductible').textContent = deductible.toFixed(2) + ' €';

    // Ergebnisbereich anzeigen
    document.getElementById('calculationResult').classList.remove('d-none');
}

/**
 * Erstellt ein Angebot aus den berechneten Daten
 */
function createOffer() {
    console.log('Erstelle Angebot...');
    // Hier würde die Logik für die Angebotserstellung implementiert
}

/**
 * Erstellt einen Vertrag aus den berechneten Daten
 */
function createContract() {
    console.log('Erstelle Vertrag...');
    // Hier würde die Logik für die Vertragserstellung implementiert
}

// Initialisiere das Angebotsrechner-Modul wenn es geladen wird
if (typeof router !== 'undefined') {
    initAngebotsrechner();
}
