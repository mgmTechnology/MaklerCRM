// ChronoFolio Statistik-Skript mit festen Chart-Höhen
/**
 * Globale Chart-Instanzen, damit sie vor Neuanlage zerstört werden können
 * Dadurch wird das Anwachsen der Charts verhindert.
 */
let growthChartInstance = null;
let totalChartInstance = null;
let acquisitionChartInstance = null;
let cumulativeCountChartInstance = null;

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
    renderGrowthCharts(watches);
    renderPieChart(watches, 'Hersteller', 'brandChart', 'Uhren pro Marke');
    renderPieChart(watches, 'Typ', 'typeChart', 'Uhren pro Typ');
    renderPieChart(watches, 'Material', 'materialChart', 'Materialverteilung');
    renderAcquisitionCharts(watches);
    renderPieValueChart(watches, 'Hersteller', 'brandValueChart', 'Wert nach Marke');
    renderPieValueChart(watches, 'Typ', 'typeValueChart', 'Wert nach Typ');
  });

/**
 * Rendert die Tabelle mit allen Uhren.
 * Fügt für jede Uhr eine Zeile in die Tabelle ein und zeigt alle relevanten Informationen an,
 * inklusive der ID der Uhr als erste Spalte.
 * @param {Array<Object>} watches - Array von Uhrenobjekten
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
    const imgTag = `<img src='${localImg}' alt='${getValue(uhr.Name)}' style='width:80px;height:80px;object-fit:contain;border:1px solid #ccc;border-radius:5px;' onerror="this.onerror=null;this.src='${jsonImg.replace(/'/g, '\'')}'">`;
    const preisFormatted = uhr.Kaufpreis ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parseFloat(uhr.Kaufpreis)) : '';
    const videoLink = getValue(uhr.VideoURL).trim() !== '' ? `<a href='${uhr.VideoURL}' target='_blank'>🎥</a>` : '';
    row.innerHTML = `
      <td>${getValue(uhr.ID)}</td>
      <td>${imgTag}</td>
      <td>${getValue(uhr.Name)}</td>
      <td>${getValue(uhr.Modell)}</td>
      <td>${getValue(uhr.Typ)}</td>
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
  new DataTable('#watchTable', {
    pageLength: 25,
    responsive: true,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/de-DE.json'
    }
  });
}

/**
 * Erstellt oder aktualisiert die Wertzuwachs- und Kumulativ-Charts.
 * Zerstört alte Instanzen, falls vorhanden.
 * @param {Array} watches - Uhren-Objekte
 */
/**
 * Erstellt oder aktualisiert die Wertzuwachs- und Kumulativ-Charts.
 * Zerstört alte Instanzen, falls vorhanden.
 * @param {Array} watches - Uhren-Objekte
 */
function renderGrowthCharts(watches) {
  chartCanvas = replaceCanvas('growthChart');
  totalChartCanvas = replaceCanvas('totalChart');
  console.log('[DEBUG] renderGrowthCharts aufgerufen.');
  if (growthChartInstance) {
    console.log('[DEBUG] growthChartInstance.destroy() wird ausgeführt.');
    growthChartInstance.destroy();
    growthChartInstance = null;
  }
  if (totalChartInstance) {
    console.log('[DEBUG] totalChartInstance.destroy() wird ausgeführt.');
    totalChartInstance.destroy();
    totalChartInstance = null;
  }
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
  const deltas = [];
  const cumulative = [];
  let sum = 0;
  keys.forEach(k => {
    sum += monthly[k];
    deltas.push(monthly[k]);
    cumulative.push(sum);
  });
  if (growthChartInstance) growthChartInstance.destroy();
  if (totalChartInstance) totalChartInstance.destroy();
  growthChartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: { labels: keys, datasets: [{ label: 'Wertzuwachs', data: deltas, backgroundColor: '#1e3a8a' }] },
    options: fixedChartHeight(400)
  });
  totalChartInstance = new Chart(totalChartCanvas, {
    type: 'line',
    data: { labels: keys, datasets: [{ label: 'Kumulativer Wert', data: cumulative, borderColor: '#0f5132', fill: false }] },
    options: fixedChartHeight(400)
  });
}

/**
 * Erstellt oder aktualisiert ein Pie-Chart für das angegebene Feld.
 * Zerstört alte Instanz, falls vorhanden.
 * @param {Array} watches - Uhren-Objekte
 * @param {string} field - Feldname (z.B. 'Hersteller')
 * @param {string} canvasId - ID des Canvas-Elements
 * @param {string} title - Titel des Diagramms
 */
const pieChartInstances = {};
/**
 * Erstellt oder aktualisiert ein Pie-Chart für den aggregierten Kaufpreis eines Feldes (z.B. Marke oder Typ).
 * Zerstört alte Instanz, falls vorhanden.
 * @param {Array} watches - Uhren-Objekte
 * @param {string} field - Feldname (z.B. 'Hersteller' oder 'Typ')
 * @param {string} canvasId - ID des Canvas-Elements
 * @param {string} title - Titel des Diagramms
 */
function renderPieValueChart(watches, field, canvasId, title) {
  const canvas = replaceCanvas(canvasId);
  console.log(`[DEBUG] renderPieValueChart(${canvasId}) aufgerufen.`);
  if (pieChartInstances[canvasId]) {
    console.log(`[DEBUG] pieChartInstances[${canvasId}].destroy() wird ausgeführt.`);
    pieChartInstances[canvasId].destroy();
    pieChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach(w => {
    const key = w[field] || 'Unbekannt';
    const price = parseFloat((w.Kaufpreis + '').replace(',', '.'));
    if (!isNaN(price)) {
      map[key] = (map[key] || 0) + price;
    }
  });
  const labels = Object.keys(map).sort();
  const values = labels.map(k => map[k]);
  pieChartInstances[canvasId] = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: labels.map((_, i) => FIXED_COLORS[i % FIXED_COLORS.length])
      }]
    },
    options: {
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
              let value = context.parsed;
              return `${context.label}: ${value.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;
            }
          }
        }
      }
    }
  });
}

function renderPieChart(watches, field, canvasId, title) {
  const canvas = replaceCanvas(canvasId);
  console.log(`[DEBUG] renderPieChart(${canvasId}) aufgerufen.`);
  if (pieChartInstances[canvasId]) {
    console.log(`[DEBUG] pieChartInstances[${canvasId}].destroy() wird ausgeführt.`);
    pieChartInstances[canvasId].destroy();
    pieChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach(w => {
    const key = w[field] || 'Unbekannt';
    map[key] = (map[key] || 0) + 1;
  });
  const labels = Object.keys(map).sort();
  const values = labels.map(k => map[k]);
  // Vorherige Instanz zerstören, falls vorhanden
  if (pieChartInstances[canvasId]) {
    pieChartInstances[canvasId].destroy();
  }
  pieChartInstances[canvasId] = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: labels.map((_, i) => FIXED_COLORS[i % FIXED_COLORS.length])
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      plugins: {
        legend: { position: 'right' },
        animation: { duration: 0 }
      }
    }
  });
}

/**
 * Erstellt oder aktualisiert die Charts für Neuzugänge und kumulative Anzahl.
 * Zerstört alte Instanzen, falls vorhanden.
 * @param {Array} watches - Uhren-Objekte
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
