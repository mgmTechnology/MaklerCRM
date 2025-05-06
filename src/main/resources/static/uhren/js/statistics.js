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

let chartCanvas = document.getElementById("growthChart");
let totalChartCanvas = document.getElementById("totalChart");
let acquisitionChartCanvas = document.getElementById("acquisitionChart");
let cumulativeCountCanvas = document.getElementById("cumulativeCountChart");

const FIXED_COLORS = [
  "#4b6cb7",
  "#182848",
  "#1e3a8a",
  "#ffc107",
  "#20c997",
  "#6f42c1",
  "#dc3545",
  "#fd7e14",
  "#198754",
  "#0dcaf0",
];

Chart.defaults.set("plugins.legend.labels", {
  boxWidth: 12,
  boxHeight: 12,
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
    scales: { y: { beginAtZero: true } },
  };
}

fetch("uhren.json")
  .then((res) => res.json())
  .then((json) => {
    const watches = json.Uhren || [];
    renderWatchTable(watches);

    /**
     * Lazy-Initialization für alle Statistik-Charts in Bootstrap-Tabs.
     * Charts werden erst beim ersten Öffnen ihres Tabs erzeugt.
     * Dadurch werden Anzeigeprobleme mit Chart.js in unsichtbaren Tabs vermieden.
     * Die Tabelle bleibt davon unberührt und wird immer sofort gerendert.
     */
    const chartInit = {
      cumulativeCount: false, // Gesamtanzahl der Uhren über Zeit
      acquisition: false, // Neue Uhren pro Monat
      growth: false, // Wertzuwachs pro Monat
      total: false, // Kumulativer Gesamtwert
      brand: false, // Uhren nach Marke
      type: false, // Uhren nach Typ
      caseSize: false, // Uhren nach Case Size
      movement: false, // Uhren nach Movement
      glass: false, // Uhren nach Glass
      brandValue: false, // Wert nach Marke
      typeValue: false, // Wert nach Typ
    };

    /**
     * Initialisiert den jeweiligen Chart, falls noch nicht geschehen.
     * @param {string} tabId - Die ID des Tab-Panels (ohne #)
     */
    function initChart(tabId) {
      switch (tabId) {
        case "cumulativeCount":
          if (!chartInit.cumulativeCount) {
            renderCumulativeCountChart(watches);
            chartInit.cumulativeCount = true;
          }
          break;
        case "acquisition":
          if (!chartInit.acquisition) {
            renderAcquisitionChart(watches);
            chartInit.acquisition = true;
          }
          break;
        case "growth":
          if (!chartInit.growth) {
            renderGrowthChart(watches);
            chartInit.growth = true;
          }
          break;
        case "total":
          if (!chartInit.total) {
            renderTotalChart(watches);
            chartInit.total = true;
          }
          break;
        case "brand":
          if (!chartInit.brand) {
            renderBarChart(
              watches,
              "Hersteller",
              "brandChart",
              "Uhren pro Marke",
            );
            chartInit.brand = true;
          }
          break;
        case "type":
          if (!chartInit.type) {
            renderBarChart(watches, "Typ", "typeChart", "Uhren pro Typ");
            chartInit.type = true;
          }
          break;
        case "caseSize":
          if (!chartInit.caseSize) {
            renderBarChart(
              watches,
              "CaseSize",
              "caseSizeChart",
              "Uhren nach Case Size",
            );
            chartInit.caseSize = true;
          }
          break;
        case "movement":
          if (!chartInit.movement) {
            renderBarChart(
              watches,
              "Movement",
              "movementChart",
              "Uhren nach Movement",
            );
            chartInit.movement = true;
          }
          break;
        case "glass":
          if (!chartInit.glass) {
            renderBarChart(watches, "Glass", "glassChart", "Uhren nach Glas");
            chartInit.glass = true;
          }
          break;
        case "brandValue":
          if (!chartInit.brandValue) {
            renderBarValueChart(
              watches,
              "Hersteller",
              "brandValueChart",
              "Wert nach Marke",
            );
            chartInit.brandValue = true;
          }
          break;
        case "typeValue":
          if (!chartInit.typeValue) {
            renderBarValueChart(
              watches,
              "Typ",
              "typeValueChart",
              "Wert nach Typ",
            );
            chartInit.typeValue = true;
          }
          break;
      }
    }

    // Direkt initialisieren: erstes Tab (wichtig für sofort sichtbaren Chart)
    initChart("cumulativeCount");

    /**
     * Bootstrap-Tab-Event: Beim Öffnen eines Tabs wird der zugehörige Chart erzeugt (falls noch nicht vorhanden)
     * und per resize()/update() korrekt dargestellt.
     */
    document
      .querySelectorAll('button[data-bs-toggle="tab"]')
      .forEach((tabBtn) => {
        tabBtn.addEventListener("shown.bs.tab", function (event) {
          const tabId = event.target
            .getAttribute("data-bs-target")
            .replace("#", "");
          initChart(tabId);
          // Chart ggf. nachträglich anpassen (z.B. bei Fenstergröße-Änderung)
          const targetPane = document.querySelector(
            event.target.getAttribute("data-bs-target"),
          );
          if (!targetPane) return;
          const canvas = targetPane.querySelector("canvas");
          if (!canvas) return;
          if (window.barChartInstances && window.barChartInstances[canvas.id]) {
            window.barChartInstances[canvas.id].resize();
            window.barChartInstances[canvas.id].update();
          }
          if (
            window.lineChartInstances &&
            window.lineChartInstances[canvas.id]
          ) {
            window.lineChartInstances[canvas.id].resize();
            window.lineChartInstances[canvas.id].update();
          }
        });
      });
  });

/**
 * Rendert die Tabelle mit allen Uhren.
 * Fügt für jede Uhr eine Zeile in die Tabelle ein und zeigt alle relevanten Informationen an,
 * inklusive der ID der Uhr als erste Spalte. Die Spaltenreihenfolge und Anzahl entspricht exakt dem <thead>.
 *
 * Spalten: ID, Bild, Name, Modell, Typ, Case Size, Glass, Movement, Kaufdatum, Kaufpreis, Hersteller, Herkunft, Hommage, Video, Bemerkungen
 *
 * @param {Array<Object>} watches - Array von Uhrenobjekten
 */
function renderWatchTable(watches) {
  /**
   * Fügt Click-Listener für alle Specs-Trigger (ID/Steckbrief-Icon) hinzu.
   * @param {Array<Object>} watches - Array aller Uhrenobjekte
   */
  /**
   * Adds click listeners for all specs triggers (ID/profile icon).
   * @param {Array<Object>} watches - Array of all watch objects
   */
  function setupSpecsTriggers(watches) {
    console.log("[DEBUG] setupSpecsTriggers initialisiert");
    const tableBody = document.querySelector("#watchTable tbody");
    tableBody.querySelectorAll(".specs-trigger").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        showSpecsCard(watches[idx]);
        // Optional: Switch tab
        document.getElementById("specs-tab")?.click();
      });
    });
    // Remove individual aiinfo-trigger listeners and use event delegation
  }

  // Event delegation for aiinfo-trigger clicks
  document
    .querySelector("#watchTable tbody")
    .addEventListener("click", function (event) {
      const target = event.target.closest(".aiinfo-trigger");
      if (target) {
        console.log("[DEBUG] aiinfo-trigger clicked");
        const row = target.closest("tr");
        if (!row) return;
        // Use DataTables API to get row data
        const table = $("#watchTable").DataTable();
        const rowData = table.row(row).data();
        if (!rowData) return;
        document.getElementById("aiinfo-tab")?.click();
        fetchAndShowAiInfo(rowData);
      }
    });

  // Add event delegation for video-link clicks to ensure click works on icon and span
  document
    .querySelector("#watchTable tbody")
    .addEventListener("click", function (event) {
      const target = event.target.closest(".video-link");
      if (target) {
        console.log("[DEBUG] video-link clicked");
        const videoUrl = target.getAttribute("data-video-url");
        if (!videoUrl) return;
        const modal = new bootstrap.Modal(
          document.getElementById("mediaModal"),
        );
        let embedUrl = "";
        if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
          let vid = videoUrl.match(/[?&]v=([^&]+)/);
          if (!vid) {
            vid = videoUrl.match(/youtu\.be\/([^?&]+)/);
          }
          if (vid && vid[1]) {
            embedUrl = `https://www.youtube.com/embed/${vid[1]}?autoplay=1`;
          }
        }
        const modalContent = document.getElementById("mediaModalContent");
        if (embedUrl) {
          modalContent.innerHTML = `<div class='ratio ratio-16x9 w-100'><iframe src='${embedUrl}' allowfullscreen allow='autoplay' style='border:0;'></iframe></div>`;
        } else {
          modalContent.innerHTML = `<a href='${videoUrl}' target='_blank' class='btn btn-primary'>Video öffnen</a>`;
        }
        modal.show();
      }
    });

  // Nach dem Rendern der Tabelle Specs-Trigger setzen
  setTimeout(() => setupSpecsTriggers(watches), 0);

  const svgFallback = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e0e7f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%235c7185' font-family='Arial' font-size='12'>Kein Bild</text></svg>`;
  const tableBody = document.querySelector("#watchTable tbody");
  tableBody.innerHTML = "";
  watches.forEach((uhr) => {
    const row = document.createElement("tr");
    const getValue = (v) => (v === undefined || v === null ? "" : v);
    // Dreistellige ID generieren
    const paddedId = getValue(uhr.ID).toString().padStart(3, "0");
    // Bildpfad im img-Verzeichnis
    const localImg = `./img/${paddedId}.jpg`;
    const jsonImg =
      getValue(uhr.BildURL) && getValue(uhr.BildURL).trim() !== ""
        ? uhr.BildURL
        : svgFallback;
    // Das Bild wird zuerst lokal versucht, bei Fehler auf JSON oder Fallback gesetzt
    const imgTag = `<img src='${localImg}' alt='${getValue(uhr.Name)}' style='width:80px;height:80px;object-fit:contain;border:1px solid #ccc;border-radius:5px;cursor:pointer;' data-img-url='${localImg}' data-img-fallback='${jsonImg.replace(/'/g, "'")}' title='Bild vergrößern' onerror=\"this.onerror=null;this.src='${jsonImg.replace(/'/g, "'")}'\">`;
    const preisFormatted = uhr.Kaufpreis
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(parseFloat(uhr.Kaufpreis))
      : "";
    const videoLink =
      getValue(uhr.VideoURL).trim() !== ""
        ? `<span class='video-link' data-video-url='${uhr.VideoURL}' style='cursor:pointer;font-size:1.3em;' title='Video ansehen'>🎥</span>`
        : "";
    row.innerHTML = `
      <td>
        <div class="d-flex flex-column align-items-center">
          <div>${getValue(uhr.ID)}</div>
          <div class="d-flex gap-2 mt-1">
            <span class="specs-trigger text-primary" data-id="${getValue(uhr.ID)}" style="cursor:pointer;" title="Specs anzeigen"><i class="bi bi-person-vcard"></i></span>
            <span class="aiinfo-trigger text-primary" title="KI-Info anzeigen" style="cursor:pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;"><i class="bi bi-robot"></i></span>
            ${videoLink ? `<span class="video-link text-primary" data-video-url="${uhr.VideoURL}" style="cursor:pointer; font-size: 1.2rem;" title="Video ansehen"><i class="bi bi-camera-video"></i></span>` : ""}
          </div>
        </div>
      </td>
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
      <td>${getValue(uhr.Bemerkungen)}</td>
    `;
    tableBody.appendChild(row);
  });
  // DataTable ggf. vorher zerstören
  if ($.fn.DataTable.isDataTable("#watchTable")) {
    $("#watchTable").DataTable().destroy();
  }
  // Moment.js Datumsparser für DataTables aktivieren
  if (window.moment && $.fn.dataTable.moment) {
    $.fn.dataTable.moment("DD.MM.YYYY");
  }
  if ($.fn.DataTable.isDataTable("#watchTable")) {
    $("#watchTable").DataTable().destroy();
  }
  $("#watchTable").DataTable({
    paging: true,
    pageLength: 50,
    lengthMenu: [
      [50, 100, -1],
      [50, 100, "Alle"],
    ],
    responsive: true,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/de-DE.json",
    },
    footerCallback: function (row, data, start, end, display) {
      var api = this.api();
      // Kaufpreis-Summe berechnen (nur sichtbare Zeilen)
      var sum = api
        .column(8, { search: "applied" })
        .data()
        .reduce(function (a, b) {
          // b ist z.B. "175,00 €"; entferne alles außer Zahl und Komma
          var num =
            typeof b === "string"
              ? b.replace(/[^\d,.-]/g, "").replace(",", ".")
              : b;
          num = parseFloat(num) || 0;
          return a + num;
        }, 0);
      // Anzahl sichtbare Zeilen
      var count = api.column(0, { search: "applied" }).data().length;
      // Ausgabe formatieren
      $(api.column(5).footer()).html(
        sum.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
      );
      $("#sumCount").html(count + " Uhren");
    },
  });
}

/**
 * Holt das OpenAI-Token aus localStorage oder fordert es per Modal vom User an.
 * Gibt ein Promise zurück, das das Token liefert.
 */
function getOpenAiToken() {
  return new Promise((resolve) => {
    let token = localStorage.getItem("open_ai_token");
    if (token && token.trim() !== "") {
      console.log("[DEBUG] OpenAI Token aus localStorage gefunden.");
      resolve(token);
      return;
    }
    console.log(
      "[DEBUG] Kein Token im localStorage, Eingabeaufforderung wird angezeigt.",
    );
    // Alternative Eingabeaufforderung statt Modal
    let inputToken = prompt(
      "Bitte gib dein OpenAI API-Token ein (wird lokal gespeichert):",
      "",
    );
    if (inputToken && inputToken.trim() !== "") {
      localStorage.setItem("open_ai_token", inputToken.trim());
      console.log("[DEBUG] Token eingegeben und gespeichert via prompt.");
      resolve(inputToken.trim());
    } else {
      alert("OpenAI API-Token ist erforderlich, um fortzufahren.");
      // Wiederhole die Eingabeaufforderung rekursiv
      resolve(getOpenAiToken());
    }
  });
}

/**
 * Fetches AI information for a watch from OpenAI and displays it in the #aiInfoPane.
 * @param {Object} uhr - The watch object
 */
async function fetchAndShowAiInfo(uhr) {
  const pane = document.getElementById("aiInfoPane");
  if (pane)
    pane.innerHTML =
      '<div class="card shadow"><div class="card-body text-center text-muted"><span class="spinner-border"></span> Lade KI-Informationen ...</div></div>';
  try {
    const OPENAI_API_KEY = await getOpenAiToken();
    const prompt = `Gib mir eine ausführliche, aber kompakte Beschreibung dieser Uhr. Nur objektive Fakten darstellen, inklusive Besonderheiten, Geschichte und Bewertung. Antworte auf Deutsch. Keine Inhalte, die schon bekannt sind. Keine Bewertungen oder Meinungen äußern. Verweise nicht auf Bilder oder Videos.\n\nUhrendaten: ${JSON.stringify(uhr)}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Uhrenexperte und erklärst Uhrenmodelle für Sammler.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 700,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error("Fehler beim Abrufen der KI-Infos");
    const data = await response.json();
    const aiText =
      data.choices?.[0]?.message?.content || "Keine KI-Antwort erhalten.";
    if (pane)
      pane.innerHTML = `<div class="card shadow"><div class="card-body">${aiText.replace(/\n/g, "<br>")}</div></div>`;
  } catch (err) {
    if (pane)
      pane.innerHTML = `<div class='alert alert-danger'>Fehler beim Laden der KI-Informationen: ${err.message}</div>`;
  }
}

// --- Modal-Logik für Bild- und Videoanzeige ---
document.addEventListener("click", function (e) {
  // Bild-Modal
  if (e.target.matches("img[data-img-url]")) {
    const imgUrl = e.target.getAttribute("data-img-url");
    const fallback = e.target.getAttribute("data-img-fallback");
    const modalContent = document.getElementById("mediaModalContent");
    modalContent.innerHTML = `<img src='${imgUrl}' alt='Großansicht' class='img-fluid rounded shadow' style='max-height:80vh;max-width:100%;background:#222;' onerror=\"this.onerror=null;this.src='${fallback}'\">`;
    const modal = new bootstrap.Modal(document.getElementById("mediaModal"));
    modal.show();
  }
  // Video-Modal
  if (e.target.matches(".video-link[data-video-url]")) {
    const videoUrl = e.target.getAttribute("data-video-url");
    let embedUrl = "";
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
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
      document.getElementById("mediaModalContent").innerHTML =
        `<div class='ratio ratio-16x9 w-100'><iframe src='${embedUrl}' allowfullscreen allow='autoplay' style='border:0;'></iframe></div>`;
      const modal = new bootstrap.Modal(document.getElementById("mediaModal"));
      modal.show();
    } else {
      // Fallback: Link anzeigen
      document.getElementById("mediaModalContent").innerHTML =
        `<a href='${videoUrl}' target='_blank' class='btn btn-primary'>Video öffnen</a>`;
      const modal = new bootstrap.Modal(document.getElementById("mediaModal"));
      modal.show();
    }
  }
});

// Stoppe Video beim Schließen des Modals
const mediaModalEl = document.getElementById("mediaModal");
if (mediaModalEl) {
  mediaModalEl.addEventListener("hidden.bs.modal", function () {
    const modalContent = document.getElementById("mediaModalContent");
    if (modalContent) {
      modalContent.innerHTML = "";
    }
  });
}

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
  watches.forEach((w) => {
    const dt = DateTime.fromFormat(w.Kaufdatum, "dd.MM.yyyy");
    if (!dt.isValid) return;
    const key = dt.toFormat("yyyy-MM");
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map((k) => byMonth[k]);
  const cumulative = [];
  let total = 0;
  counts.forEach((v) => {
    total += v;
    cumulative.push(total);
  });
  cumulativeCountCanvas = replaceCanvas("cumulativeCountChart");
  if (cumulativeCountChartInstance) cumulativeCountChartInstance.destroy();
  cumulativeCountChartInstance = new Chart(cumulativeCountCanvas, {
    type: "line",
    data: {
      labels: keys,
      datasets: [
        {
          label: "Kumulative Anzahl",
          data: cumulative,
          borderColor: "#198754",
          fill: false,
        },
      ],
    },
    options: fixedChartHeight(400),
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
  watches.forEach((w) => {
    const dt = DateTime.fromFormat(w.Kaufdatum, "dd.MM.yyyy");
    if (!dt.isValid) return;
    const key = dt.toFormat("yyyy-MM");
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map((k) => byMonth[k]);
  acquisitionChartCanvas = replaceCanvas("acquisitionChart");
  if (acquisitionChartInstance) acquisitionChartInstance.destroy();
  acquisitionChartInstance = new Chart(acquisitionChartCanvas, {
    type: "bar",
    data: {
      labels: keys,
      datasets: [
        { label: "Neuzugänge", data: counts, backgroundColor: "#6610f2" },
      ],
    },
    options: fixedChartHeight(400),
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
  watches.forEach((w) => {
    if (!w.Kaufdatum || !w.Kaufpreis) return;
    const dt = DateTime.fromFormat(w.Kaufdatum, "dd.MM.yyyy");
    if (!dt.isValid) return;
    const key = dt.toFormat("yyyy-MM");
    const price = parseFloat((w.Kaufpreis + "").replace(",", "."));
    if (!price || isNaN(price)) return;
    monthly[key] = (monthly[key] || 0) + price;
  });
  const keys = Object.keys(monthly).sort();
  const deltas = keys.map((k) => monthly[k]);
  chartCanvas = replaceCanvas("growthChart");
  if (growthChartInstance) growthChartInstance.destroy();
  growthChartInstance = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: keys,
      datasets: [
        { label: "Wertzuwachs", data: deltas, backgroundColor: "#1e3a8a" },
      ],
    },
    options: fixedChartHeight(400),
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
  watches.forEach((w) => {
    if (!w.Kaufdatum || !w.Kaufpreis) return;
    const dt = DateTime.fromFormat(w.Kaufdatum, "dd.MM.yyyy");
    if (!dt.isValid) return;
    const key = dt.toFormat("yyyy-MM");
    const price = parseFloat((w.Kaufpreis + "").replace(",", "."));
    if (!price || isNaN(price)) return;
    monthly[key] = (monthly[key] || 0) + price;
  });
  const keys = Object.keys(monthly).sort();
  const cumulative = [];
  let sum = 0;
  keys.forEach((k) => {
    sum += monthly[k];
    cumulative.push(sum);
  });
  totalChartCanvas = replaceCanvas("totalChart");
  if (totalChartInstance) totalChartInstance.destroy();
  totalChartInstance = new Chart(totalChartCanvas, {
    type: "line",
    data: {
      labels: keys,
      datasets: [
        {
          label: "Kumulativer Wert",
          data: cumulative,
          borderColor: "#0f5132",
          fill: false,
        },
      ],
    },
    options: fixedChartHeight(400),
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
    console.log(
      `[DEBUG] barChartInstances[${canvasId}].destroy() wird ausgeführt.`,
    );
    barChartInstances[canvasId].destroy();
    barChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach((w) => {
    const key = w[field] || "Unbekannt";
    const price = parseFloat((w.Kaufpreis + "").replace(",", "."));
    if (!isNaN(price)) {
      map[key] = (map[key] || 0) + price;
    }
  });
  let pairs = Object.entries(map);
  if (canvasId === "brandValueChart") {
    // Nur Marken mit mehr als einer Uhr anzeigen
    // Dazu zählen wir die Uhren pro Marke (erneut, da map hier Summen enthält)
    const countPerBrand = {};
    watches.forEach((w) => {
      const key = w[field] || "Unbekannt";
      countPerBrand[key] = (countPerBrand[key] || 0) + 1;
    });
    pairs = pairs.filter(([k, v]) => countPerBrand[k] > 1);
  }
  // Nach Wert absteigend sortieren, dann nach Name
  pairs = pairs.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const labels = pairs.map(([k]) => k);
  const values = pairs.map(([_, v]) => v);
  barChartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: labels.map(
            (_, i) => FIXED_COLORS[i % FIXED_COLORS.length],
          ),
        },
      ],
    },
    options: {
      indexAxis: "y", // horizontal
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.2,
      plugins: {
        legend: { display: false },
        animation: { duration: 0 },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Wert als EUR formatieren
              let value = context.parsed.x;
              return `${context.label}: ${value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}`;
            },
          },
        },
      },
      scales: {
        x: { beginAtZero: true },
      },
    },
  });
}

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
    console.log(
      `[DEBUG] barChartInstances[${canvasId}].destroy() wird ausgeführt.`,
    );
    barChartInstances[canvasId].destroy();
    barChartInstances[canvasId] = null;
  }
  const map = {};
  watches.forEach((w) => {
    let key = w[field] || "Unbekannt";
    // Konsolenwarnung für fehlenden Typ
    if (field === "Typ" && key === "Unbekannt") {
      console.log(
        "[WARN] Typ unbekannt bei Uhr ID:",
        w.ID,
        ", Modell:",
        w.Modell || w.Name || "",
      );
    }
    // Für CaseSize auf Ganzzahl runden
    if (field === "CaseSize") {
      // Ersetze Komma durch Punkt, um Dezimalzahlen aus JSON wie "42,6" korrekt zu parsen
      const rawValue = (w[field] + "").replace(",", ".");
      const num = Number(rawValue);
      if (
        isNaN(num) ||
        w[field] === undefined ||
        w[field] === null ||
        w[field] === "" ||
        w[field] === "Unbekannt"
      ) {
        console.log("[WARN] CaseSize unbekannt bei Uhr ID:", w.ID);
        key = "Unbekannt";
      } else if (num === 0) {
        console.log("[WARN] CaseSize 0 bei Uhr ID:", w.ID);
        key = "0";
      } else {
        key = Math.round(num).toString();
      }
    }
    map[key] = (map[key] || 0) + 1;
  });

  let pairs = Object.entries(map);
  if (canvasId === "brandChart") {
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
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: labels.map(
            (_, i) => FIXED_COLORS[i % FIXED_COLORS.length],
          ),
        },
      ],
    },
    options: {
      indexAxis: "y", // horizontal
      responsive: true,
      maintainAspectRatio:
        canvasId !== "movementChart" && canvasId !== "glassChart",
      aspectRatio: 1.2,
      plugins: {
        legend: { display: false },
        animation: { duration: 0 },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Anzahl anzeigen
              let value = context.parsed.x;
              return `${context.label}: ${value} Uhr${value !== 1 ? "en" : ""}`;
            },
          },
        },
      },
      scales: {
        x: { beginAtZero: true },
      },
    },
  });
}

/**
 * Creates or updates both the acquisition and cumulative count charts.
 * Destroys old instances if present.
 * @param {Array<Object>} watches - Array of watch objects
 */
function renderAcquisitionCharts(watches) {
  acquisitionChartCanvas = replaceCanvas("acquisitionChart");
  cumulativeCountCanvas = replaceCanvas("cumulativeCountChart");
  console.log("[DEBUG] renderAcquisitionCharts aufgerufen.");
  if (acquisitionChartInstance) {
    console.log("[DEBUG] acquisitionChartInstance.destroy() wird ausgeführt.");
    acquisitionChartInstance.destroy();
    acquisitionChartInstance = null;
  }
  if (cumulativeCountChartInstance) {
    console.log(
      "[DEBUG] cumulativeCountChartInstance.destroy() wird ausgeführt.",
    );
    cumulativeCountChartInstance.destroy();
    cumulativeCountChartInstance = null;
  }
  const { DateTime } = luxon;
  const byMonth = {};
  watches.forEach((w) => {
    const dt = DateTime.fromFormat(w.Kaufdatum, "dd.MM.yyyy");
    if (!dt.isValid) return;
    const key = dt.toFormat("yyyy-MM");
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  const counts = keys.map((k) => byMonth[k]);
  const cumulative = [];
  let total = 0;
  counts.forEach((v) => {
    total += v;
    cumulative.push(total);
  });

  if (acquisitionChartInstance) acquisitionChartInstance.destroy();
  if (cumulativeCountChartInstance) cumulativeCountChartInstance.destroy();
  acquisitionChartInstance = new Chart(acquisitionChartCanvas, {
    type: "bar",
    data: {
      labels: keys,
      datasets: [
        { label: "Neuzugänge", data: counts, backgroundColor: "#6610f2" },
      ],
    },
    options: fixedChartHeight(400),
  });
  cumulativeCountChartInstance = new Chart(cumulativeCountCanvas, {
    type: "line",
    data: {
      labels: keys,
      datasets: [
        {
          label: "Kumulative Anzahl",
          data: cumulative,
          borderColor: "#198754",
          fill: false,
        },
      ],
    },
    options: fixedChartHeight(400),
  });
}

/**
 * Zeigt die Specs-Karte für eine einzelne Uhr im Specs-Tab an.
 * @param {Object} uhr - Das Uhrenobjekt
 */
function showSpecsCard(uhr) {
  console.log("[DEBUG] showSpecsCard wird aufgerufen", uhr);
  const cardPane = document.getElementById("specsCardPane");
  if (!cardPane) return;
  // Bild-Logik mit Debug-Ausgaben
  const paddedId = (uhr.ID || "").toString().padStart(3, "0");
  const localImg = `./img/${paddedId}.jpg`;
  const fallbackImg =
    "https://fakeimg.pl/200x150/b82525/ebd8ae?text=No+watch+image+yet&font=bebas&font_size=22";
  // Bild-Logik: Zuerst lokal, dann BildURL, dann Fallback
  let imgSrc = localImg;
  console.log("[DEBUG] Versuche zuerst localImg:", localImg);
  // Die Fehlerbehandlung erfolgt im onerror-Handler weiter unten

  // Kompakte dreispaltige Tabelle
  const specRows = [
    { label: "ID", value: uhr.ID || "-" },
    { label: "Hersteller", value: uhr.Hersteller || "-" },
    { label: "Typ", value: uhr.Typ || "-" },
    { label: "Case Size", value: uhr.CaseSize || "-" },
    { label: "Glass", value: uhr.Glass || "-" },
    { label: "Movement", value: uhr.Movement || "-" },
    { label: "Kaufdatum", value: uhr.Kaufdatum || "-" },
    { label: "Kaufpreis", value: uhr.Kaufpreis || "-" },
    { label: "Herkunft", value: uhr.Herkunft || "-" },
    { label: "AKA", value: uhr.AKA || "-" },
    { label: "Hommage", value: uhr.Hommage || "-" },
    { label: "Wasserdicht", value: uhr.Waterproof || "-" },
    { label: "Bemerkungen", value: uhr.Bemerkungen || "-" },
    {
      label: "Video",
      value: uhr.VideoURL
        ? `<a href="${uhr.VideoURL}" target="_blank">Video</a>`
        : "-",
    },
    {
      label: "Shop",
      value: uhr.ShopURL
        ? `<a href="${uhr.ShopURL}" target="_blank">Shop</a>`
        : "-",
    },
  ];
  let col1 = "",
    col2 = "",
    col3 = "";
  // Bemerkungen als eigenes Feld behandeln
  let bemerkungRow = "";
  for (let i = 0; i < specRows.length; i++) {
    if (specRows[i].label === "Bemerkungen") {
      bemerkungRow = `<tr><th class='text-end text-nowrap'>${specRows[i].label}</th><td colspan="2"><textarea class='specs-bemerkung-field' readonly>${specRows[i].value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ")}</textarea></td></tr>`;
    } else {
      const row = `<tr><th class='text-end text-nowrap'>${specRows[i].label}</th><td>${specRows[i].value}</td></tr>`;
      if (i % 3 === 0) col1 += row;
      else if (i % 3 === 1) col2 += row;
      else col3 += row;
    }
  }

  cardPane.innerHTML = `
    <div class="card shadow" style="max-width:100vw; min-width:320px; width:100%; height:320px;">
      <div class="row g-0 align-items-stretch h-100 flex-nowrap">
        <div class="col-lg-3 col-md-4 col-12 d-flex align-items-center justify-content-center bg-light p-2" style="height:320px;">
          <img id="specsCardImg" src="${imgSrc}" alt="Uhrenbild" class="img-fluid rounded mb-2 shadow-sm" style="max-height:280px;max-width:100%;background:#222;object-fit:contain;cursor:pointer" data-img-url="${imgSrc}" data-img-fallback="${fallbackImg}">
        </div>
        <div class="col-lg-9 col-md-8 col-12 d-flex flex-column justify-content-center" style="height:320px;">
          <h5 class="card-title mb-2">${uhr.Name || ""}</h5>
          <div class="row h-100">
            <div class="col-12 col-md-4 d-flex align-items-start"><table class="table table-sm table-borderless mb-0 specs-table w-100" style="table-layout:fixed;"><tbody>${col1}</tbody></table></div>
            <div class="col-12 col-md-4 d-flex align-items-start"><table class="table table-sm table-borderless mb-0 specs-table w-100" style="table-layout:fixed;"><tbody>${col2}</tbody></table></div>
            <div class="col-12 col-md-4 d-flex align-items-start"><table class="table table-sm table-borderless mb-0 specs-table w-100" style="table-layout:fixed;"><tbody>${col3}</tbody></table></div>
          </div>
          <div class="mt-2">${bemerkungRow}</div>
        </div>
      </div>
    </div>
    <style>
      /* Specs-Tabellen-Optimierung */
      .specs-table {
        width: 100%;
        table-layout: fixed;
      }
      .specs-table td {
        white-space: normal;
        word-break: break-word;
        font-size: 1rem;
        padding: 0.35rem 0.5rem 0.35rem 0.2rem;
        vertical-align: top;
      }
      .specs-table tr {
        border-bottom: 1px solid #f0f0f0;
      }
      .specs-bemerkung-field {
        width: 100%;
        min-height: 60px;
        max-height: 120px;
        resize: vertical;
        overflow: auto;
        font-size: 1rem;
        font-family: inherit;
        background: #faf8f2;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0.5em;
      }
      @media (max-width: 900px) {
        .card.shadow { height: auto !important; }
      }
      @media (max-width: 700px) {
        .specs-table td { font-size: 0.95rem; }
      }
    </style>
  `;

  // Bild robust nachladen und Fehler behandeln
  const imgEl = document.getElementById("specsCardImg");
  if (imgEl) {
    let triedLocal = true;
    let triedJson = false;
    imgEl.onerror = function () {
      console.log("[DEBUG] Bild konnte nicht geladen werden:", imgEl.src);
      // Wenn localImg nicht klappt, versuche BildURL aus JSON
      if (
        triedLocal &&
        uhr.BildURL &&
        uhr.BildURL.trim() !== "" &&
        imgEl.src !== uhr.BildURL
      ) {
        imgEl.src = uhr.BildURL;
        triedLocal = false;
        triedJson = true;
        console.log("[DEBUG] Versuche BildURL aus JSON:", uhr.BildURL);
      } else if (triedJson && imgEl.src !== fallbackImg) {
        imgEl.src = fallbackImg;
        console.log("[DEBUG] Fallback auf Platzhalter:", fallbackImg);
      }
    };
  }
}
