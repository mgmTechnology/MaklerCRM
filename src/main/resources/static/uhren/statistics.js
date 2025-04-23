// ChronoFolio Statistik-Skript mit festen Chart-Höhen
/**
 * Globale Chart-Instanzen, damit sie vor Neuanlage zerstört werden können
 * Dadurch wird das Anwachsen der Charts verhindert.
 */
let growthChartInstance = null;
let totalChartInstance = null;
let acquisitionChartInstance = null;
let cumulativeCountChartInstance = null;

/**
 * Replaces a canvas element with a new one (to reset Chart.js state).
 * @param {string} id - The ID of the canvas element to replace.
 * @returns {HTMLCanvasElement|null} The new canvas element or null if not found.
 */
function replaceCanvas(id) {
  const oldCanvas = document.getElementById(id);
  if (oldCanvas) {
    const newCanvas = oldCanvas.cloneNode(false);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);
    console.log(`[DEBUG] Canvas für #${id} ersetzt.`);
    return newCanvas;
  }
  return null;
}

let chartCanvas = document.getElementById('growthChart');
let totalChartCanvas = document.getElementById('totalChart');
let acquisitionChartCanvas = document.getElementById('acquisitionChart');
let cumulativeCountCanvas = document.getElementById('cumulativeCountChart');

const FIXED_COLORS = ['#4b6cb7', '#182848', '#1e3a8a', '#ffc107', '#20c997', '#6f42c1', '#dc3545', '#fd7e14', '#198754', '#0dcaf0'];

Chart.defaults.set('plugins.legend.labels', {
  boxWidth: 12,
  boxHeight: 12
});

Chart.defaults.font.size = 12;

/**
 * Gibt Chart.js-Optionen für responsive, nicht zu große Charts zurück.
 * Die Höhe wird nur noch per CSS geregelt.
 * @param {number} height - (ignoriert, bleibt für Kompatibilität)
 */
/**
 * Returns Chart.js options for responsive charts with fixed height via CSS.
 * @param {number} height - (Ignored, kept for compatibility)
 * @returns {Object} Chart.js options object
 */
function fixedChartHeight(height = 400) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };
}

fetch('uhren.json')
  .then(res => res.json())
  .then(json => {
    const watches = json.Uhren || [];
    renderWatchTable(watches);
    renderCumulativeCountChart(watches);
    renderAcquisitionChart(watches);
    renderGrowthChart(watches);
    renderTotalChart(watches);
    renderBarChart(watches, 'Hersteller', 'brandChart', 'Uhren pro Marke');
    renderBarChart(watches, 'Typ', 'typeChart', 'Uhren pro Typ');
    renderBarChart(watches, 'CaseSize', 'caseSizeChart', 'Uhren nach Case Size');
    renderBarChart(watches, 'Movement', 'movementChart', 'Uhren nach Movement');
    renderBarChart(watches, 'Glass', 'glassChart', 'Uhren nach Glas');
    renderBarValueChart(watches, 'Hersteller', 'brandValueChart', 'Wert nach Marke');
    renderBarValueChart(watches, 'Typ', 'typeValueChart', 'Wert nach Typ');
  });

/**
 * Rendert die Tabelle mit allen Uhren.
 * Fügt für jede Uhr eine Zeile in die Tabelle ein und zeigt alle relevanten Informationen an,
 * inklusive der ID der Uhr als erste Spalte.
 * @param {Array<Object>} watches - Array von Uhrenobjekten
 */
/**
 * Renders the table of all watches, including images, prices, manufacturer, type, and more.
 * Initializes DataTable with sorting, search, and sum calculation.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderWatchTable(watches) {
  const svgFallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e0e7f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%235c7185' font-family='Arial' font-size='12'>Kein Bild</text></svg>`;
  const tableBody = document.querySelector('#watchTable tbody');
  tableBody.innerHTML = '';
  watches.forEach(uhr => {
    const row = document.createElement('tr');
    const getValue = v => (v === undefined || v === null) ? '' : v;
    // Dreistellige ID generieren
    const paddedId = getValue(uhr.ID).toString().padStart(3, '0');
    // Bildpfad im img-Verzeichnis
    const localImg = `./img/${paddedId}.jpg`;
    const jsonImg = getValue(uhr.BildURL) && getValue(uhr.BildURL).trim() !== '' ? uhr.BildURL : svgFallback;
    // Das Bild wird zuerst lokal versucht, bei Fehler auf JSON oder Fallback gesetzt
    const imgTag = `<img src='${localImg}' alt='${getValue(uhr.Name)}' style='width:80px;height:80px;object-fit:contain;border:1px solid #ccc;border-radius:5px;cursor:pointer;' data-img-url='${localImg}' data-img-fallback='${jsonImg.replace(/'/g, "'")}' title='Bild vergrößern' onerror=\"this.onerror=null;this.src='${jsonImg.replace(/'/g, "'")}'\">`;
    const preisFormatted = uhr.Kaufpreis ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(uhr.Kaufpreis)) : '';
    const videoLink = getValue(uhr.VideoURL).trim() !== ''
      ? `<span class='video-link' data-video-url='${uhr.VideoURL}' style='cursor:pointer;font-size:1.3em;' title='Video ansehen'>🎥</span>`
      : '';
    row.innerHTML = `
      <td>${getValue(uhr.ID)}</td>
      <td>${imgTag}</td>
      <td>${getValue(uhr.Name)}</td>
      <td>${getValue(uhr.Modell)}</td>
      <td>${getValue(uhr.Typ)}</td>
      <td>${getValue(uhr.CaseSize)}</td>
      <td>${getValue(uhr.Glass)}</td>
      <td>${getValue(uhr.Movement)}</td>
      <td>${getValue(uhr.Kaufdatum)}</td>
      <td>${preisFormatted}</td>
      <td>${getValue(uhr.Hersteller)}</td>
      <td>${getValue(uhr.Herkunft)}</td>
      <td>${getValue(uhr.Hommage)}</td>
      <td>${videoLink}</td>
      <td>${getValue(uhr.Bemerkungen)}</td>
    `;
    tableBody.appendChild(row);
  });
  // DataTable ggf. vorher zerstören
  if ($.fn.DataTable.isDataTable('#watchTable')) {
    $('#watchTable').DataTable().destroy();
  }
  // Moment.js Datumsparser für DataTables aktivieren
  if (window.moment && $.fn.dataTable.moment) {
    $.fn.dataTable.moment('DD.MM.YYYY');
  }
  if ($.fn.DataTable.isDataTable('#watchTable')) {
    $('#watchTable').DataTable().destroy();
  }
  $('#watchTable').DataTable({
    pageLength: 50,
    lengthMenu: [[50, 100, -1], [50, 100, 'Alle']],
    responsive: true,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/de-DE.json'
    },
    footerCallback: function ( row, data, start, end, display ) {
      var api = this.api();
      // Kaufpreis-Summe berechnen (nur sichtbare Zeilen)
      var sum = api.column(6, {search:'applied'}).data().reduce(function(a, b) {
        // b ist z.B. "175,00 €"; entferne alles außer Zahl und Komma
        var num = (typeof b === 'string') ? b.replace(/[^\d,.-]/g, '').replace(',', '.') : b;
        num = parseFloat(num) || 0;
        return a + num;
      }, 0);
      // Anzahl sichtbare Zeilen
      var count = api.column(0, {search:'applied'}).data().length;
      // Ausgabe formatieren
      $(api.column(6).footer()).html(sum.toLocaleString('de-DE', {style:'currency', currency:'EUR'}));
      $('#sumCount').html(count + ' Uhren');
    }
  });
}

// --- Modal-Logik für Bild- und Videoanzeige ---
document.addEventListener('click', function(e) {
  // Bild-Modal
  if (e.target.matches('img[data-img-url]')) {
    const imgUrl = e.target.getAttribute('data-img-url');
    const fallback = e.target.getAttribute('data-img-fallback');
    const modalContent = document.getElementById('mediaModalContent');
    modalContent.innerHTML = `<img src='${imgUrl}' alt='Großansicht' class='img-fluid rounded shadow' style='max-height:80vh;max-width:100%;background:#222;' onerror=\"this.onerror=null;this.src='${fallback}'\">`;
    const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
    modal.show();
  }
  // Video-Modal
  if (e.target.matches('.video-link[data-video-url]')) {
    const videoUrl = e.target.getAttribute('data-video-url');
    let embedUrl = '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // YouTube-Video-ID extrahieren
      let vid = videoUrl.match(/[?&]v=([^&]+)/);
      if (!vid) {
        // youtu.be Kurzlink
        vid = videoUrl.match(/youtu\.be\/([^?&]+)/);
      }
      if (vid && vid[1]) {
        embedUrl = `https://www.youtube.com/embed/${vid[1]}?autoplay=1`;
      }
    }
    if (embedUrl) {
      document.getElementById('mediaModalContent').innerHTML = `<div class='ratio ratio-16x9 w-100'><iframe src='${embedUrl}' allowfullscreen allow='autoplay' style='border:0;'></iframe></div>`;
      const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
      modal.show();
    } else {
      // Fallback: Link anzeigen
      document.getElementById('mediaModalContent').innerHTML = `<a href='${videoUrl}' target='_blank' class='btn btn-primary'>Video öffnen</a>`;
      const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
      modal.show();
    }
  }
});



/**
 * Erstellt oder aktualisiert das Linien-Diagramm für die Gesamtanzahl der Uhren über Zeit.
 * @param {Array} watches - Uhren-Objekte
 */
/**
 * Creates or updates the line chart for cumulative watch count over time.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderCumulativeCountChart(watches) {
  const { DateTime } = luxon;
  const byMonth = {};
  watches.forEach(w => {
    const dt = DateTime.fromFormat(w.Kaufdatum, 'dd.MM.yyyy');
    if (!dt.isValid) return;
    const key = dt.toFormat('yyyy-MM');
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map(k => byMonth[k]);
  const cumulative = [];
  let total = 0;
  counts.forEach(v => { total += v; cumulative.push(total); });
  cumulativeCountCanvas = replaceCanvas('cumulativeCountChart');
  if (cumulativeCountChartInstance) cumulativeCountChartInstance.destroy();
  cumulativeCountChartInstance = new Chart(cumulativeCountCanvas, {
    type: 'line',
    data: { labels: keys, datasets: [{ label: 'Kumulative Anzahl', data: cumulative, borderColor: '#198754', fill: false }] },
    options: fixedChartHeight(400)
  });
}

/**
 * Erstellt oder aktualisiert das Balken-Diagramm für neue Uhren pro Monat.
 * @param {Array} watches - Uhren-Objekte
 */
/**
 * Creates or updates the bar chart for new watch acquisitions per month.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderAcquisitionChart(watches) {
  const { DateTime } = luxon;
  const byMonth = {};
  watches.forEach(w => {
    const dt = DateTime.fromFormat(w.Kaufdatum, 'dd.MM.yyyy');
    if (!dt.isValid) return;
    const key = dt.toFormat('yyyy-MM');
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map(k => byMonth[k]);
  acquisitionChartCanvas = replaceCanvas('acquisitionChart');
  if (acquisitionChartInstance) acquisitionChartInstance.destroy();
  acquisitionChartInstance = new Chart(acquisitionChartCanvas, {
    type: 'bar',
    data: { labels: keys, datasets: [{ label: 'Neuzugänge', data: counts, backgroundColor: '#6610f2' }] },
    options: fixedChartHeight(400)
  });
}

/**
 * Erstellt oder aktualisiert das Balken-Diagramm für Wertzuwachs pro Monat.
 * @param {Array} watches - Uhren-Objekte
 */
/**
 * Creates or updates the bar chart for value growth per month.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderGrowthChart(watches) {
  const { DateTime } = luxon;
  const monthly = {};
  watches.forEach(w => {
    if (!w.Kaufdatum || !w.Kaufpreis) return;
    const dt = DateTime.fromFormat(w.Kaufdatum, 'dd.MM.yyyy');
    if (!dt.isValid) return;
    const key = dt.toFormat('yyyy-MM');
    const price = parseFloat((w.Kaufpreis + '').replace(',', '.'));
    if (!price || isNaN(price)) return;
    monthly[key] = (monthly[key] || 0) + price;
  });
  const keys = Object.keys(monthly).sort();
  const deltas = keys.map(k => monthly[k]);
  chartCanvas = replaceCanvas('growthChart');
  if (growthChartInstance) growthChartInstance.destroy();
  growthChartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: { labels: keys, datasets: [{ label: 'Wertzuwachs', data: deltas, backgroundColor: '#1e3a8a' }] },
    options: fixedChartHeight(400)
  });
}

/**
 * Erstellt oder aktualisiert das Linien-Diagramm für den kumulierten Gesamtwert.
 * @param {Array} watches - Uhren-Objekte
 */
/**
 * Creates or updates the line chart for cumulative total value over time.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderTotalChart(watches) {
  const { DateTime } = luxon;
  const monthly = {};
  watches.forEach(w => {
    if (!w.Kaufdatum || !w.Kaufpreis) return;
    const dt = DateTime.fromFormat(w.Kaufdatum, 'dd.MM.yyyy');
    if (!dt.isValid) return;
    const key = dt.toFormat('yyyy-MM');
    const price = parseFloat((w.Kaufpreis + '').replace(',', '.'));
    if (!price || isNaN(price)) return;
    monthly[key] = (monthly[key] || 0) + price;
  });
  const keys = Object.keys(monthly).sort();
  const cumulative = [];
  let sum = 0;
  keys.forEach(k => {
    sum += monthly[k];
    cumulative.push(sum);
  });
  totalChartCanvas = replaceCanvas('totalChart');
  if (totalChartInstance) totalChartInstance.destroy();
  totalChartInstance = new Chart(totalChartCanvas, {
    type: 'line',
    data: { labels: keys, datasets: [{ label: 'Kumulativer Wert', data: cumulative, borderColor: '#0f5132', fill: false }] },
    options: fixedChartHeight(400)
  });
}

/**
 * Globale Instanzen der Bar-Charts, um sie vor Neuanlage zerstören zu können
 */
const barChartInstances = {};

/**
 * Creates or updates a horizontal bar chart for the aggregated purchase value of a field (e.g., brand or type).
 * Only shows brands with more than one watch for 'brandValueChart'.
 * @param {Array<Object>} watches - Array of watch objects
 * @param {string} field - Field name (e.g., 'Hersteller' or 'Typ')
 * @param {string} canvasId - ID of the canvas element
 * @param {string} title - Chart title
 */
/**
 * Erstellt oder aktualisiert ein horizontales Balkendiagramm für den aggregierten Kaufwert eines Feldes (z.B. Marke oder Typ).
 * Zeigt für 'brandValueChart' nur Marken mit mehr als einer Uhr an.
 * @param {Array<Object>} watches - Array von Uhrenobjekten
 * @param {string} field - Feldname (z.B. 'Hersteller' oder 'Typ')
 * @param {string} canvasId - ID des Canvas-Elements
 * @param {string} title - Diagrammtitel
 */
function renderBarValueChart(watches, field, canvasId, title) {
  const canvas = replaceCanvas(canvasId);
  console.log(`[DEBUG] renderBarValueChart(${canvasId}) aufgerufen.`);
  if (barChartInstances[canvasId]) {
    console.log(`[DEBUG] barChartInstances[${canvasId}].destroy() wird ausgeführt.`);
    barChartInstances[canvasId].destroy();
    barChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach(w => {
    const key = w[field] || 'Unbekannt';
    const price = parseFloat((w.Kaufpreis + '').replace(',', '.'));
    if (!isNaN(price)) {
      map[key] = (map[key] || 0) + price;
    }
  });
  let pairs = Object.entries(map);
  if (canvasId === 'brandValueChart') {
    // Nur Marken mit mehr als einer Uhr anzeigen
    // Dazu zählen wir die Uhren pro Marke (erneut, da map hier Summen enthält)
    const countPerBrand = {};
    watches.forEach(w => {
      const key = w[field] || 'Unbekannt';
      countPerBrand[key] = (countPerBrand[key] || 0) + 1;
    });
    pairs = pairs.filter(([k, v]) => countPerBrand[k] > 1);
  }
  // Nach Wert absteigend sortieren, dann nach Name
  pairs = pairs.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const labels = pairs.map(([k]) => k);
  const values = pairs.map(([_, v]) => v);
  barChartInstances[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: labels.map((_, i) => FIXED_COLORS[i % FIXED_COLORS.length])
      }]
    },
    options: {
      indexAxis: 'y', // horizontal
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      plugins: {
        legend: { position: 'right' },
        animation: { duration: 0 },
        tooltip: {
          callbacks: {
            label: function(context) {
              // Wert als EUR formatieren
              let value = context.parsed.x;
              return `${context.label}: ${value.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;
            }
          }
        }
      },
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}


/**
 * Creates or updates a horizontal bar chart for a categorical field (e.g., brand or type).
 * Only shows brands with more than one watch for 'brandChart'.
 * @param {Array<Object>} watches - Array of watch objects
 * @param {string} field - Field name (e.g., 'Hersteller')
 * @param {string} canvasId - ID of the canvas element
 * @param {string} title - Chart title
 */
/**
 * Erstellt oder aktualisiert ein horizontales Balkendiagramm für ein kategorisches Feld (z.B. Marke oder Typ).
 * Für das Feld 'CaseSize' werden die Werte vor der Auswertung auf Ganzzahlen gerundet.
 * Zeigt für 'brandChart' nur Marken mit mehr als einer Uhr an.
 * @param {Array<Object>} watches - Array von Uhrenobjekten
 * @param {string} field - Feldname (z.B. 'Hersteller' oder 'CaseSize')
 * @param {string} canvasId - ID des Canvas-Elements
 * @param {string} title - Diagrammtitel
 */
function renderBarChart(watches, field, canvasId, title) {
  const canvas = replaceCanvas(canvasId);
  console.log(`[DEBUG] renderBarChart(${canvasId}) aufgerufen.`);
  if (barChartInstances[canvasId]) {
    console.log(`[DEBUG] barChartInstances[${canvasId}].destroy() wird ausgeführt.`);
    barChartInstances[canvasId].destroy();
    barChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach(w => {
    let key = w[field] || 'Unbekannt';
    // Für CaseSize auf Ganzzahl runden
    if (field === 'CaseSize') {
      // Ersetze Komma durch Punkt, um Dezimalzahlen aus JSON wie "42,6" korrekt zu parsen
      const rawValue = (w[field] + '').replace(',', '.');
      const num = Number(rawValue);
      if (isNaN(num) || w[field] === undefined || w[field] === null || w[field] === '' || w[field] === 'Unbekannt') {
        console.log('[WARN] CaseSize unbekannt bei Uhr ID:', w.ID);
        key = 'Unbekannt';
      } else if (num === 0) {
        console.log('[WARN] CaseSize 0 bei Uhr ID:', w.ID);
        key = '0';
      } else {
        key = Math.round(num).toString();
      }
    }
    map[key] = (map[key] || 0) + 1;
  });

  let pairs = Object.entries(map);
  if (canvasId === 'brandChart') {
    pairs = pairs.filter(([k, v]) => v > 1);
  }
  // Nach Wert absteigend sortieren, dann nach Name
  pairs = pairs.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  let labels = pairs.map(([k]) => k);
  let values = pairs.map(([_, v]) => v);
  // Vorherige Instanz zerstören, falls vorhanden
  if (barChartInstances[canvasId]) {
    barChartInstances[canvasId].destroy();
  }
  barChartInstances[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: labels.map((_, i) => FIXED_COLORS[i % FIXED_COLORS.length])
      }]
    },
    options: {
      indexAxis: 'y', // horizontal
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      plugins: {
        legend: { position: 'right' },
        animation: { duration: 0 },
        tooltip: {
          callbacks: {
            label: function(context) {
              // Anzahl anzeigen
              let value = context.parsed.x;
              return `${context.label}: ${value} Uhr${value !== 1 ? 'en' : ''}`;
            }
          }
        }
      },
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}


/**
 * Creates or updates both the acquisition and cumulative count charts.
 * Destroys old instances if present.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderAcquisitionCharts(watches) {
  acquisitionChartCanvas = replaceCanvas('acquisitionChart');
  cumulativeCountCanvas = replaceCanvas('cumulativeCountChart');
  console.log('[DEBUG] renderAcquisitionCharts aufgerufen.');
  if (acquisitionChartInstance) {
    console.log('[DEBUG] acquisitionChartInstance.destroy() wird ausgeführt.');
    acquisitionChartInstance.destroy();
    acquisitionChartInstance = null;
  }
  if (cumulativeCountChartInstance) {
    console.log('[DEBUG] cumulativeCountChartInstance.destroy() wird ausgeführt.');
    cumulativeCountChartInstance.destroy();
    cumulativeCountChartInstance = null;
  }
  const { DateTime } = luxon;
  const byMonth = {};
  watches.forEach(w => {
    const dt = DateTime.fromFormat(w.Kaufdatum, 'dd.MM.yyyy');
    if (!dt.isValid) return;
    const key = dt.toFormat('yyyy-MM');
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map(k => byMonth[k]);
  const cumulative = [];
  let total = 0;
  counts.forEach(v => { total += v; cumulative.push(total); });

  if (acquisitionChartInstance) acquisitionChartInstance.destroy();
  if (cumulativeCountChartInstance) cumulativeCountChartInstance.destroy();
  acquisitionChartInstance = new Chart(acquisitionChartCanvas, {
    type: 'bar',
    data: { labels: keys, datasets: [{ label: 'Neuzugänge', data: counts, backgroundColor: '#6610f2' }] },
    options: fixedChartHeight(400)
  });
  cumulativeCountChartInstance = new Chart(cumulativeCountCanvas, {
    type: 'line',
    data: { labels: keys, datasets: [{ label: 'Kumulative Anzahl', data: cumulative, borderColor: '#198754', fill: false }] },
    options: fixedChartHeight(400)
  });
}
