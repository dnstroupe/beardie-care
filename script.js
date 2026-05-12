// ═══════════════════════════════════════
//   SHOTO — CARE COMMAND CENTER
//   script.js v3 — Fixed checkboxes
// ═══════════════════════════════════════

const WEEK_DATA = [
  { day:"Monday",    feeders:"Dubia Roaches",      qty:"8–12",  feederIcon:"🪳", salad:"Collard + Mustard Greens + Squash", supplement:"Calcium Plus LoD",  hydration:"Fresh water",        task:"Spot clean enclosure" },
  { day:"Tuesday",   feeders:"BSFL",               qty:"15–20", feederIcon:"🐛", salad:"Turnip Greens + Bell Pepper",       supplement:"Bee Pollen",        hydration:"Hornworm optional",  task:"Wipe glass / check poop" },
  { day:"Wednesday", feeders:"Silkworms",           qty:"6–10",  feederIcon:"🐛", salad:"Dandelion Greens + Zucchini",       supplement:"Calcium Plus LoD",  hydration:"Fresh water",        task:"Check humidity" },
  { day:"Thursday",  feeders:"Dubia Roaches",       qty:"8–12",  feederIcon:"🪳", salad:"Endive + Bok Choy",                 supplement:"SuperPig",          hydration:"Fresh water",        task:"Spot clean" },
  { day:"Friday",    feeders:"Hornworms",            qty:"2–4",   feederIcon:"🐛", salad:"Collard Greens + Prickly Pear",     supplement:"Calcium Plus LoD",  hydration:"Extra hydration day",task:"Clean food dish" },
  { day:"Saturday",  feeders:"Discoid / Dubia",     qty:"8–12",  feederIcon:"🪳", salad:"Mustard Greens + Squash",           supplement:"Bee Pollen",        hydration:"Fresh water",        task:"Inspect sheds / nails" },
  { day:"Sunday",    feeders:"Light — Few BSFL",    qty:"Few",   feederIcon:"🐛", salad:"Mixed greens rotation",             supplement:"SuperVite",         hydration:"Fresh water",        task:"Deep enclosure check" }
];

const ROW_FIELDS = [
  { key:"salad",       label:"Salad" },
  { key:"supplement",  label:"Supplement" },
  { key:"hydration",   label:"Hydration" },
  { key:"task",        label:"Care Task" }
];

const TIPS = [
  "💡 Consistency today = a healthy dragon tomorrow.",
  "🔥 Always verify basking temps before adjusting Shoto's diet.",
  "❄️ Cool side should stay 75–82°F — check it daily.",
  "💧 Soaking 2–3× per week keeps Shoto hydrated and helps shedding.",
  "🥗 Variety in greens = better nutrition — rotate daily!",
  "🪲 Remove uneaten insects within 15 minutes — they can bite.",
  "⚖️ Weigh Shoto monthly — steady weight gain means a healthy dragon.",
  "☀️ UVB bulbs lose effectiveness before they burn out — replace every 6 months.",
  "🦎 A basking Shoto is a happy Shoto — that's normal behavior!",
  "💊 Don't skip supplements — they prevent metabolic bone disease.",
  "🌡️ Wrong temps are the #1 cause of illness in bearded dragons.",
  "❤️ Shoto knows your voice — talk to him during feeding time.",
  "🐛 Hornworms are high in water content — great for hydration days.",
  "🪳 Dubia roaches are the gold standard feeder — high protein, low fat."
];

// Helpers
function todayIdx() { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }
function sk(k) { return "shoto_" + k; }
function save(k, v) { try { localStorage.setItem(sk(k), v ? "1" : "0"); } catch(e) {} }
function load(k) { try { return localStorage.getItem(sk(k)) === "1"; } catch(e) { return false; } }
function saveStr(k, v) { try { localStorage.setItem(sk(k), v); } catch(e) {} }
function loadStr(k, def) { try { return localStorage.getItem(sk(k)) || def; } catch(e) { return def; } }
function saveJSON(k, v) { try { localStorage.setItem(sk(k), JSON.stringify(v)); } catch(e) {} }
function loadJSON(k, def) { try { const v = localStorage.getItem(sk(k)); return v ? JSON.parse(v) : def; } catch(e) { return def; } }

// Greeting
function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById("heroGreeting");
  if (!el) return;
  if (h < 12) el.textContent = "Good morning!";
  else if (h < 17) el.textContent = "Good afternoon!";
  else el.textContent = "Good evening!";
}

// Date labels
function setDates() {
  const now = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const titleEl = document.getElementById("todayTitle");
  const dateEl  = document.getElementById("todayDate");
  if (titleEl) titleEl.textContent = `${days[now.getDay()]}'s Care — Shoto`;
  if (dateEl)  dateEl.textContent = todayStr;

  const rangeEl = document.getElementById("weekRange");
  if (rangeEl) {
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = d => `${months[d.getMonth()]} ${d.getDate()}`;
    rangeEl.textContent = `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
  }
}

// Rotating tip
function setTip() {
  const el = document.getElementById("dailyTip");
  if (!el) return;
  const idx = new Date().getDay() % TIPS.length;
  el.textContent = TIPS[idx];
}

// Progress bar
function updateProgress() {
  const grid = document.getElementById("morningChecklist");
  if (!grid) return;
  const total = grid.querySelectorAll(".chk").length;
  const done  = grid.querySelectorAll(".chk.done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const bar = document.getElementById("heroBar");
  const pctEl = document.getElementById("heroPct");
  const countEl = document.getElementById("heroCount");
  if (bar) bar.style.width = pct + "%";
  if (pctEl) pctEl.textContent = pct + "% Complete";
  if (countEl) countEl.textContent = `${done} of ${total} tasks`;
}

// ── MORNING CHECKLIST ──────────────────
function initMorningChecklist() {
  const grid = document.getElementById("morningChecklist");
  if (!grid) return;

  grid.querySelectorAll(".chk").forEach(function(item) {
    const key = item.dataset.key;
    if (load(key)) item.classList.add("done");

    item.addEventListener("click", function(e) {
      e.preventDefault();
      const nowDone = !item.classList.contains("done");
      item.classList.toggle("done", nowDone);
      save(key, nowDone);
      updateProgress();
    });
  });

  updateProgress();
}

// ── GENERIC CHECKLIST ──────────────────
function initChecklist(bodyId) {
  const el = document.getElementById(bodyId);
  if (!el) return;
  el.querySelectorAll(".chk").forEach(function(item) {
    const key = item.dataset.key;
    if (!key) return;
    if (load(key)) item.classList.add("done");
    item.addEventListener("click", function(e) {
      e.preventDefault();
      const nowDone = !item.classList.contains("done");
      item.classList.toggle("done", nowDone);
      save(key, nowDone);
    });
  });
}

// ── TODAY CARD ─────────────────────────
function buildTodayCard() {
  const grid = document.getElementById("todayGrid");
  if (!grid) return;
  const t = WEEK_DATA[todayIdx()];
  grid.innerHTML = `
    <div class="today-cell">
      <span class="today-cell-label">🪲 Live Feeders</span>
      <span class="today-cell-value">${t.feeders} <span class="qty-pill">${t.qty}</span></span>
    </div>
    <div class="today-cell">
      <span class="today-cell-label">🥗 Salad Mix</span>
      <span class="today-cell-value">${t.salad}</span>
    </div>
    <div class="today-cell">
      <span class="today-cell-label">💊 Supplement</span>
      <span class="today-cell-value">${t.supplement}</span>
    </div>
    <div class="today-cell ice-cell">
      <span class="today-cell-label">💧 Hydration</span>
      <span class="today-cell-value">${t.hydration}</span>
    </div>
    <div class="today-cell ice-cell">
      <span class="today-cell-label">🔧 Care Task</span>
      <span class="today-cell-value">${t.task}</span>
    </div>
    <div class="today-cell" style="border-left-color:var(--fire-3)">
      <span class="today-cell-label">📅 Day</span>
      <span class="today-cell-value">${t.day}</span>
    </div>
  `;
}

// ── DAILY NOTES ────────────────────────
function initDailyNotes() {
  const key = "notes_" + new Date().toDateString();
  const ta  = document.getElementById("dailyNotes");
  const btn = document.getElementById("saveNotesBtn");
  const msg = document.getElementById("notesSaved");
  if (!ta || !btn) return;

  ta.value = loadStr(key, "");

  btn.addEventListener("click", function() {
    saveStr(key, ta.value);
    if (msg) { msg.textContent = "✓ Saved!"; setTimeout(function() { msg.textContent = ""; }, 2000); }
  });
}

// ── WEEKLY TABLE ───────────────────────
function buildWeekTable() {
  const head = document.getElementById("weekHead");
  const body = document.getElementById("weekBody");
  if (!head || !body) return;
  const today = todayIdx();

  // Header
  const headRow = document.createElement("tr");
  WEEK_DATA.forEach(function(d, i) {
    const th = document.createElement("th");
    if (i === today) th.classList.add("col-today");
    th.innerHTML = `<span>${d.day}</span>${i === today ? '<br><span class="th-today-badge">Today ★</span>' : ""}`;
    headRow.appendChild(th);
  });
  head.appendChild(headRow);

  // Feeder icons
  const imgRow = document.createElement("tr");
  imgRow.className = "row-img";
  WEEK_DATA.forEach(function(d, i) {
    const td = document.createElement("td");
    if (i === today) td.style.background = "rgba(230,57,37,0.08)";
    td.innerHTML = `<div class="feeder-icon-wrap"><span class="feeder-emoji">${d.feederIcon}</span></div><br><span class="qty-badge">${d.qty}</span>`;
    imgRow.appendChild(td);
  });
  body.appendChild(imgRow);

  // Data rows
  ROW_FIELDS.forEach(function(field) {
    const tr = document.createElement("tr");
    tr.className = "data-row";
    WEEK_DATA.forEach(function(d, i) {
      const td = document.createElement("td");
      if (i === today) td.style.background = "rgba(230,57,37,0.04)";
      const rowKey = "w" + i + "_" + field.key;
      const isDone = load(rowKey);
      td.innerHTML = `
        <span class="cell-label">${field.label}</span>
        <label class="cell-check ${isDone ? "row-done" : ""}" data-key="${rowKey}">
          <input type="checkbox" ${isDone ? "checked" : ""}/>
          <span class="cell-dot"></span>
          <span class="cell-val">${d[field.key]}</span>
        </label>`;
      td.querySelector(".cell-check").addEventListener("click", function(e) {
        e.preventDefault();
        const lbl = this;
        const nowDone = !lbl.classList.contains("row-done");
        lbl.classList.toggle("row-done", nowDone);
        save(rowKey, nowDone);
        updateWeekProgress();
      });
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  // Progress row
  const progRow = document.createElement("tr");
  progRow.className = "prog-row";
  WEEK_DATA.forEach(function(_, i) {
    const td = document.createElement("td");
    td.id = "prog" + i;
    progRow.appendChild(td);
  });
  body.appendChild(progRow);
  updateWeekProgress();
}

function updateWeekProgress() {
  WEEK_DATA.forEach(function(_, i) {
    const td = document.getElementById("prog" + i);
    if (!td) return;
    let done = 0;
    ROW_FIELDS.forEach(function(f) { if (load("w" + i + "_" + f.key)) done++; });
    td.textContent = "Completed " + done + " / " + ROW_FIELDS.length;
  });
}

// ── RESET WEEK ─────────────────────────
function initResetBtn() {
  const btn = document.getElementById("resetWeekBtn");
  if (!btn) return;
  btn.addEventListener("click", function() {
    if (!confirm("Reset all weekly checkboxes for Shoto?")) return;
    WEEK_DATA.forEach(function(_, i) {
      ROW_FIELDS.forEach(function(f) { save("w" + i + "_" + f.key, false); });
    });
    document.getElementById("weekHead").innerHTML = "";
    document.getElementById("weekBody").innerHTML = "";
    buildWeekTable();
  });
}

// ── SOAK TRACKER ───────────────────────
function buildSoakTracker() {
  const grid = document.getElementById("soakGrid");
  if (!grid) return;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  grid.innerHTML = "";
  days.forEach(function(day, i) {
    const key = "soak_" + i;
    const div = document.createElement("div");
    div.className = "soak-day" + (load(key) ? " soaked" : "");
    div.innerHTML = `<div class="soak-day-name">${day}</div><div class="soak-icon">🛁</div><div class="soak-check">✓ Done</div>`;
    div.addEventListener("click", function() {
      const nowSoaked = !div.classList.contains("soaked");
      div.classList.toggle("soaked", nowSoaked);
      save(key, nowSoaked);
    });
    grid.appendChild(div);
  });
}

// ── WEIGHT LOG ─────────────────────────
function loadWeightEntries() { return loadJSON("weight_entries", []); }
function saveWeightEntries(arr) { saveJSON("weight_entries", arr); }

function renderWeightTable() {
  const tbody = document.getElementById("weightBody");
  if (!tbody) return;
  const entries = loadWeightEntries();
  tbody.innerHTML = "";
  if (!entries.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="no-entries">No entries yet — add Shoto\'s first weight above!</td></tr>';
    return;
  }
  entries.slice().reverse().forEach(function(e, ri) {
    const i = entries.length - 1 - ri;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.date}</td><td><strong style="color:var(--fire-3)">${e.weight}g</strong></td><td>${e.note || "—"}</td><td><button class="btn-del" data-idx="${i}">🗑</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll(".btn-del").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const arr = loadWeightEntries();
      arr.splice(parseInt(this.dataset.idx), 1);
      saveWeightEntries(arr);
      renderWeightTable();
    });
  });
}

function initWeightLog() {
  const btn      = document.getElementById("addWeightBtn");
  const dateInp  = document.getElementById("weightDate");
  const valInp   = document.getElementById("weightVal");
  const noteInp  = document.getElementById("weightNote");
  if (!btn) return;

  // Default date to today
  const now = new Date();
  dateInp.value = now.toISOString().split("T")[0];

  btn.addEventListener("click", function() {
    const date   = dateInp.value;
    const weight = parseFloat(valInp.value);
    const note   = noteInp.value.trim();
    if (!date || isNaN(weight) || weight <= 0) { alert("Please enter a valid date and weight."); return; }
    const arr = loadWeightEntries();
    arr.push({ date, weight, note });
    arr.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
    saveWeightEntries(arr);
    valInp.value = "";
    noteInp.value = "";
    renderWeightTable();
  });

  renderWeightTable();
}

// ── COLLAPSIBLES ───────────────────────
function initCollapsibles() {
  document.querySelectorAll(".ctrigger").forEach(function(btn) {
    const targetId = btn.dataset.target;
    const body = document.getElementById(targetId);
    const arr  = btn.querySelector(".carr");
    if (!body) return;
    const saved = localStorage.getItem("col_" + targetId) === "1";
    if (saved) { body.classList.add("closed"); if (arr) arr.classList.add("up"); }
    btn.addEventListener("click", function() {
      const closing = !body.classList.contains("closed");
      body.classList.toggle("closed", closing);
      if (arr) arr.classList.toggle("up", closing);
      try { localStorage.setItem("col_" + targetId, closing ? "1" : "0"); } catch(e) {}
    });
  });
}

// ── SIDEBAR ────────────────────────────
function initSidebar() {
  const ham     = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (ham && sidebar && overlay) {
    ham.addEventListener("click", function() {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", function() {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  // Active state on scroll
  const sections = document.querySelectorAll("section[id],div[id]");
  const navItems = document.querySelectorAll(".snav");
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(function(n) {
          n.classList.toggle("active", n.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(function(s) { observer.observe(s); });

  navItems.forEach(function(n) {
    n.addEventListener("click", function() {
      if (window.innerWidth <= 700) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      }
    });
  });
}

// ── PRINT TODAY ────────────────────────
function printToday() {
  const overlay = document.getElementById("printOverlay");
  const sheet   = document.getElementById("printSheet");
  if (!overlay || !sheet) return;

  const t    = WEEK_DATA[todayIdx()];
  const now  = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const checklistItems = [
    "Lights On — Turn on basking + UVB lights",
    "Basking Temp — Verify 100–105°F at basking spot",
    "Cool Side Temp — Verify 75–82°F on cool side",
    "Fresh Water — Refresh & clean water dish",
    "Prepare Salad — Chop and plate fresh salad mix",
    "Live Feeders — Feed insects if scheduled",
    "Dust Supplements — Apply correct supplement",
    "Remove Insects — Clear uneaten insects after 15 min",
    "Spot Clean — Spot clean any mess in enclosure",
    "Observe — Check behavior, appetite & poop"
  ];

  sheet.innerHTML = `
    <button class="print-close" onclick="closePrint()">✕ Close</button>
    <h1>🔥 Shoto's Daily Care Sheet ❄️</h1>
    <p>${dateStr}</p>
    <h2>Today's Feeding Schedule</h2>
    <div class="print-detail"><span>Live Feeders</span>${t.feeders} — ${t.qty}</div>
    <div class="print-detail"><span>Salad Mix</span>${t.salad}</div>
    <div class="print-detail"><span>Supplement</span>${t.supplement}</div>
    <div class="print-detail"><span>Hydration</span>${t.hydration}</div>
    <div class="print-detail"><span>Care Task</span>${t.task}</div>
    <h2>Morning Checklist</h2>
    ${checklistItems.map(function(item) {
      const parts = item.split(" — ");
      return `<div class="print-row"><div class="print-box"></div><div class="print-label"><strong>${parts[0]}</strong>${parts[1] || ""}</div></div>`;
    }).join("")}
    <h2>Emergency Reminders</h2>
    <div class="print-detail"><span>No poop + lethargic</span>Review temps immediately — basking should be 100–105°F</div>
    <div class="print-detail"><span>Refusing food</span>Normal during shedding — monitor for 1–2 days</div>
    <div class="print-detail"><span>Wrinkled skin</span>Dehydration — offer water and give a 10-min lukewarm soak</div>
    <div class="print-detail"><span>Never leave insects in enclosure overnight</span>They can bite and stress Shoto</div>
    <br><p style="text-align:center;color:#C96A3A;font-weight:bold;">🔥 Shoto — Half Fire. Half Ice. ❄️</p>
    <button class="print-close" onclick="window.print()">🖨️ Print This Page</button>
  `;

  overlay.style.display = "block";
}

function closePrint() {
  document.getElementById("printOverlay").style.display = "none";
}

// ── BOOT ───────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  setGreeting();
  setDates();
  setTip();
  buildTodayCard();
  initMorningChecklist();
  buildWeekTable();
  initChecklist("monthlyBody");
  initChecklist("shoppingBody");
  initResetBtn();
  buildSoakTracker();
  initWeightLog();
  initDailyNotes();
  initCollapsibles();
  initSidebar();
});
