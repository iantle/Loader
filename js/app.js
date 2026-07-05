/* ============================================================
   Loader-web-app — asetukset, teema ja tallennus välimuistiin
   ============================================================ */

// Kaikki loaderit: avain -> { name, markup }
// markup on loaderin sisältö; juurielementille annetaan luokka ld-<key>.
const LOADERS = {
  ring:   { name: "Rengas",       html: "" },
  dots:   { name: "Pisteet",      html: "<span></span><span></span><span></span>" },
  pulse:  { name: "Syke",         html: "" },
  bars:   { name: "Palkit",       html: "<span></span><span></span><span></span><span></span><span></span>" },
  dual:   { name: "Kaksoisrengas", html: "" },
  ripple: { name: "Väreily",      html: "<span></span><span></span>" },
  grid:   { name: "Ruudukko",     html: "<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>" },
  orbit:  { name: "Kiertorata",   html: "<span></span><span></span>" },
  flip:   { name: "Kääntö",       html: "" },
};

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f59e0b", // amber
  "#22c55e", // green
  "#06b6d4", // cyan
  "#64748b", // slate
];

const STORAGE_KEY = "loaderAppSettings.v1";

const DEFAULTS = {
  theme: "dark",
  loader: "ring",
  accent: "#6366f1",
  scale: 1.7,
};

// ---------- Tallennus / lataus ----------
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const saved = JSON.parse(raw);
    return { ...DEFAULTS, ...saved };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    /* välimuisti ei käytettävissä — jatketaan silti */
  }
}

let settings = loadSettings();

// ---------- DOM ----------
const root = document.documentElement;
const loaderEl = document.getElementById("loader");
const gridEl = document.getElementById("loaderGrid");
const colorRowEl = document.getElementById("colorRow");
const themeColorMeta = document.getElementById("themeColorMeta");
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
const settingsBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeBtn");
const sizeSlider = document.getElementById("sizeSlider");
const sizeValue = document.getElementById("sizeValue");

// ---------- Renderöinti ----------
function renderLoader() {
  const def = LOADERS[settings.loader] || LOADERS.ring;
  loaderEl.className = "loader ld-" + settings.loader;
  loaderEl.innerHTML = def.html;
}

function applyTheme() {
  root.setAttribute("data-theme", settings.theme);
  // Selaimen palkin väri: korostusväri tummassa, vaalea tausta vaaleassa
  themeColorMeta.setAttribute(
    "content",
    settings.theme === "light" ? "#f3f4fb" : "#0e0f16"
  );
  document.querySelectorAll(".theme-opt").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === settings.theme);
  });
}

function applyAccent() {
  root.style.setProperty("--accent", settings.accent);
  document.querySelectorAll(".color-dot").forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.color === settings.accent);
  });
}

function applyScale() {
  root.style.setProperty("--loader-scale", settings.scale);
  sizeSlider.value = settings.scale;
  sizeValue.textContent = Math.round(settings.scale * 100) + " %";
}

// ---------- Ruudukon rakennus ----------
function buildGrid() {
  gridEl.innerHTML = "";
  Object.entries(LOADERS).forEach(([key, def]) => {
    const cell = document.createElement("button");
    cell.className = "loader-cell" + (key === settings.loader ? " active" : "");
    cell.dataset.loader = key;
    cell.setAttribute("aria-label", def.name);
    cell.title = def.name;

    // Pienennys tehdään kääreessä, jottei se törmää loaderin omaan
    // transform-animaatioon (pyörivät renkaat / kiertorata).
    const preview = document.createElement("div");
    preview.className = "preview";
    const inner = document.createElement("div");
    inner.className = "loader ld-" + key;
    inner.innerHTML = def.html;
    preview.appendChild(inner);
    cell.appendChild(preview);

    cell.addEventListener("click", () => {
      settings.loader = key;
      saveSettings();
      renderLoader();
      gridEl.querySelectorAll(".loader-cell").forEach((c) =>
        c.classList.toggle("active", c.dataset.loader === key)
      );
    });

    gridEl.appendChild(cell);
  });
}

function buildColors() {
  colorRowEl.innerHTML = "";
  COLORS.forEach((c) => {
    const dot = document.createElement("button");
    dot.className = "color-dot" + (c === settings.accent ? " active" : "");
    dot.dataset.color = c;
    dot.style.background = c;
    dot.style.color = c;
    dot.setAttribute("aria-label", "Väri " + c);
    dot.addEventListener("click", () => {
      settings.accent = c;
      saveSettings();
      applyAccent();
    });
    colorRowEl.appendChild(dot);
  });
}

// ---------- Kokosäädin ----------
// Päivitä koko heti liu'utettaessa; tallenna kun säätö päättyy.
sizeSlider.addEventListener("input", () => {
  settings.scale = parseFloat(sizeSlider.value);
  root.style.setProperty("--loader-scale", settings.scale);
  sizeValue.textContent = Math.round(settings.scale * 100) + " %";
});
sizeSlider.addEventListener("change", saveSettings);

// ---------- Teemanapit ----------
document.querySelectorAll(".theme-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    settings.theme = btn.dataset.theme;
    saveSettings();
    applyTheme();
  });
});

// ---------- Paneelin avaus / sulku ----------
function openPanel() {
  panel.hidden = false;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    panel.classList.add("show");
    overlay.classList.add("show");
  });
  settingsBtn.setAttribute("aria-expanded", "true");
}

function closePanel() {
  panel.classList.remove("show");
  overlay.classList.remove("show");
  settingsBtn.setAttribute("aria-expanded", "false");
  const done = () => {
    panel.hidden = true;
    overlay.hidden = true;
    panel.removeEventListener("transitionend", done);
  };
  panel.addEventListener("transitionend", done);
}

settingsBtn.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) closePanel();
});

// ---------- Käynnistys ----------
buildGrid();
buildColors();
renderLoader();
applyTheme();
applyAccent();
applyScale();

// ---------- Service worker (offline / asennettavuus) ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline-tuki ei pakollinen */
    });
  });
}
