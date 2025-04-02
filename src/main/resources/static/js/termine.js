/**
 * Initialisiert die Kalenderansicht
 */
document.addEventListener('DOMContentLoaded', function() {
    const calendarBody = document.getElementById('calendarBody');
    const currentMonthBtn = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    let currentDate = new Date();
    
    // Event-Listener für Monatsnavigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    /**
     * Rendert den Kalender für den aktuellen Monat
     */
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Aktualisiere Monatsanzeige
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        currentMonthBtn.textContent = `${monthNames[month]} ${year}`;
        
        // Leere den Kalender
        calendarBody.innerHTML = '';
        
        // Ermittle den ersten Tag des Monats
        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay() || 7; // Konvertiere 0 (Sonntag) zu 7
        
        // Ermittle die Anzahl der Tage im Monat
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        
        let date = 1;
        let html = '';
        
        // Erstelle die Kalenderwochen
        for (let i = 0; date <= totalDays; i++) {
            html += '<tr>';
            
            // Erstelle die Tage in der Woche
            for (let j = 1; j <= 7; j++) {
                if (i === 0 && j < startingDay) {
                    html += '<td></td>';
                } else if (date > totalDays) {
                    html += '<td></td>';
                } else {
                    const isWeekend = j > 5;
                    const isToday = date === new Date().getDate() && 
                                  month === new Date().getMonth() && 
                                  year === new Date().getFullYear();
                    
                    html += `
                        <td class="${isWeekend ? 'table-light' : ''} ${isToday ? 'table-primary' : ''}" style="height: 100px; vertical-align: top;">
                            <div class="d-flex justify-content-between">
                                <span>${date}</span>
                                <button class="btn btn-sm btn-link p-0" onclick="addTermin(${year}, ${month}, ${date})">
                                    <i class="bi bi-plus-circle"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    date++;
                }
            }
            
            html += '</tr>';
        }
        
        calendarBody.innerHTML = html;
    }
    
    // Initial rendern
    renderCalendar();
});

/**
 * Öffnet den Dialog für einen neuen Termin
 * @param {number} year - Das Jahr
 * @param {number} month - Der Monat (0-11)
 * @param {number} day - Der Tag
 */
function addTermin(year, month, day) {
    const date = new Date(year, month, day);
    const formattedDate = date.toLocaleDateString('de-DE');
    alert(`Neuer Termin für ${formattedDate}`);
    // Hier könnte ein Modal oder Formular geöffnet werden
}
