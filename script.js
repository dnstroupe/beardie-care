// ═══════════════════════════════════════════════
//   BEARDIE CARE COMMAND CENTER — script.js v2
// ═══════════════════════════════════════════════

// Feeder emoji icons used as visual stand-ins — reliable, no broken images
const FEEDER_ICONS = {
  roach:    "🪳",
  bsfl:     "🐛",
  silkworm: "🐛",
  hornworm: "🐛",
  discoid:  "🪳",
};

const WEEK_DATA = [
  {
    day: "Monday",
    feeders: "Dubia Roaches", qty: "8–12",
    feederIcon: "🪳",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Blaptica_dubia_2.jpg/240px-Blaptica_dubia_2.jpg",
    salad: "Collard + Mustard Greens + Squash",
    supplement: "Calcium Plus LoD",
    hydration: "Fresh water",
    task: "Spot clean enclosure"
  },
  {
    day: "Tuesday",
    feeders: "BSFL", qty: "15–20",
    feederIcon: "🐛",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hermetia_illucens_larva.jpg/240px-Hermetia_illucens_larva.jpg",
    salad: "Turnip Greens + Bell Pepper",
    supplement: "Bee Pollen",
    hydration: "Hornworm optional",
    task: "Wipe glass / check poop"
  },
  {
    day: "Wednesday",
    feeders: "Silkworms", qty: "6–10",
    feederIcon: "🐛",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Silkworm_bombyx_mori.jpg/240px-Silkworm_bombyx_mori.jpg",
    salad: "Dandelion Greens + Zucchini",
    supplement: "Calcium Plus LoD",
    hydration: "Fresh water",
    task: "Check humidity"
  },
  {
    day: "Thursday",
    feeders: "Dubia Roaches", qty: "8–12",
    feederIcon: "🪳",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Blaptica_dubia_2.jpg/240px-Blaptica_dubia_2.jpg",
    salad: "Endive + Bok Choy",
    supplement: "SuperPig",
    hydration: "Fresh water",
    task: "Spot clean"
  },
  {
    day: "Friday",
    feeders: "Hornworms", qty: "2–4",
    feederIcon: "🐛",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Manduca_sexta_caterpillar.jpg/240px-Manduca_sexta_caterpillar.jpg",
    salad: "Collard Greens + Prickly Pear",
    supplement: "Calcium Plus LoD",
    hydration: "Extra hydration day",
    task: "Clean food dish"
  },
  {
    day: "Saturday",
    feeders: "Discoid / Dubia", qty: "8–12",
    feederIcon: "🪳",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Blaptica_dubia_2.jpg/240px-Blaptica_dubia_2.jpg",
    salad: "Mustard Greens + Squash",
    supplement: "Bee Pollen",
    hydration: "Fresh water",
    task: "Inspect sheds / nails"
  },
  {
    day: "Sunday",
    feeders: "Light — Few BSFL", qty: "Few",
    feederIcon: "🐛",
    feederImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hermetia_illucens_larva.jpg/240px-Hermetia_illucens_larva.jpg",
    salad: "Mixed greens rotation",
    supplement: "SuperVite",
    hydration: "Fresh water",
    task: "Deep enclosure check"
  }
];

const ROW_FIELDS = [
  { key: "salad",      label: "Salad" },
  { key: "supplement", label: "Supplement" },
  { key: "hydration",  label: "Hydration" },
  { key: "task",       label: "Care Task" }
];

// 0=Sun,1=Mon...6=Sat → our 0=Mon array
function todayIdx() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function sk(key) { return "beardie_" + key; }
function save(key, val) { try { localStorage.setItem(sk(key), val ? "1" : "0"); } catch(e) {} }
function load(key) { try { return localStorage.getItem(sk(key)) === "1"; } catch(e) { return false; } }

// ── GREETING ────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById("heroGreeting");
  if (!el) return;
  if (h < 12) el.textContent = "Good morning!";
  else if (h < 17) el.textContent = "Good afternoon!";
  else el.textContent = "Good evening!";
}

// ── WEEK RANGE LABEL ────────────────────────────
function setWeekRange() {
  const el = document.getElementById("weekRange");
  if (!el) return;
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  el.textContent = `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
}

// ── MORNING PROGRESS ────────────────────────────
function updateMorningProgress() {
  const grid = document.getElementById("morningChecklist");
  if (!grid) return;
  const items = grid.querySelectorAll(".chk-item");
  const done = grid.querySelectorAll(".chk-item.done").length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const bar = document.getElementById("heroBar");
  const pctEl = document.getElementById("heroPct");
  const countEl = document.getElementById("heroCount");
  if (bar) bar.style.width = pct + "%";
  if (pctEl) pctEl.textContent = pct + "% Complete";
  if (countEl) countEl.textContent = `${done} of ${total} tasks completed`;
}

// ── MORNING CHECKLIST ────────────────────────────
function initMorningChecklist() {
  const grid = document.getElementById("morningChecklist");
  if (!grid) return;
  grid.querySelectorAll(".chk-item").forEach(item => {
    const key = item.dataset.key;
    if (load(key)) item.classList.add("done");
    item.addEventListener("click", () => {
      const now = !item.classList.contains("done");
      item.classList.toggle("done", now);
      save(key, now);
      updateMorningProgress();
    });
  });
  updateMorningProgress();
}

// ── GENERIC CHECKLIST (monthly, shopping) ────────
function initChecklist(containerId) {
  const el = document.getElementById(containerId) || document.querySelector(containerId);
  if (!el) return;
  el.querySelectorAll(".chk-item").forEach(item => {
    const key = item.dataset.key;
    if (!key) return;
    if (load(key)) item.classList.add("done");
    item.addEventListener("click", () => {
      const now = !item.classList.contains("done");
      item.classList.toggle("done", now);
      save(key, now);
    });
  });
}

// ── WEEKLY TABLE ─────────────────────────────────
function buildWeekTable() {
  const head = document.getElementById("weekHead");
  const body = document.getElementById("weekBody");
  if (!head || !body) return;
  const today = todayIdx();

  // Header row: day names
  const headRow = document.createElement("tr");
  WEEK_DATA.forEach((d, i) => {
    const th = document.createElement("th");
    th.style.width = (100 / 7) + "%";
    if (i === today) th.classList.add("col-today");
    th.innerHTML = `<span class="th-day">${d.day}</span>${i === today ? '<span class="th-today-badge">Today ★</span>' : ""}`;
    headRow.appendChild(th);
  });
  head.appendChild(headRow);

    const imgRow = document.createElement("tr");
  imgRow.className = "row-img";
  WEEK_DATA.forEach((d, i) => {
    const td = document.createElement("td");
    if (i === today) td.style.background = "rgba(201,106,58,0.06)";
    td.innerHTML = `
      <div class="feeder-icon-wrap">
        <span class="feeder-emoji">${d.feederIcon}</span>
      </div>
      <span class="qty-badge">${d.qty}</span>
    `;
    imgRow.appendChild(td);
  });
  body.appendChild(imgRow);

  // Data rows: salad, supplement, hydration, task
  ROW_FIELDS.forEach(field => {
    const tr = document.createElement("tr");
    tr.className = "data-row";
    WEEK_DATA.forEach((d, i) => {
      const td = document.createElement("td");
      if (i === today) td.style.background = "rgba(201,106,58,0.04)";
      const rowKey = `w${i}_${field.key}`;
      const isDone = load(rowKey);
      td.innerHTML = `
        <span class="cell-label">${field.label}</span>
        <label class="cell-check ${isDone ? "row-done" : ""}" data-key="${rowKey}">
          <input type="checkbox" ${isDone ? "checked" : ""}/>
          <span class="cell-dot"></span>
          <span class="cell-val">${d[field.key]}</span>
        </label>
      `;
      const lbl = td.querySelector(".cell-check");
      lbl.addEventListener("click", () => {
        const now = !lbl.classList.contains("row-done");
        lbl.classList.toggle("row-done", now);
        lbl.querySelector("input").checked = now;
        save(rowKey, now);
        updateDayProgress();
      });
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  // Progress row
  const progRow = document.createElement("tr");
  progRow.className = "prog-row";
  progRow.id = "progRow";
  WEEK_DATA.forEach((_, i) => {
    const td = document.createElement("td");
    if (i === today) td.classList.add("col-today-prog");
    td.id = `prog${i}`;
    progRow.appendChild(td);
  });
  body.appendChild(progRow);

  updateDayProgress();
}

function updateDayProgress() {
  WEEK_DATA.forEach((_, i) => {
    const td = document.getElementById(`prog${i}`);
    if (!td) return;
    const total = ROW_FIELDS.length;
    let done = 0;
    ROW_FIELDS.forEach(f => { if (load(`w${i}_${f.key}`)) done++; });
    td.textContent = `Completed ${done} / ${total}`;
  });
}

// ── RESET WEEK ───────────────────────────────────
function initResetBtn() {
  const btn = document.getElementById("resetWeekBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!confirm("Reset all weekly checkboxes?")) return;
    WEEK_DATA.forEach((_, i) => {
      ROW_FIELDS.forEach(f => save(`w${i}_${f.key}`, false));
    });
    // Rebuild table
    document.getElementById("weekHead").innerHTML = "";
    document.getElementById("weekBody").innerHTML = "";
    buildWeekTable();
  });
}

// ── SCROLL TO TODAY ──────────────────────────────
function initScrollToday() {
  const btn = document.getElementById("scrollTodayBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const wrap = document.querySelector(".week-scroll");
    if (!wrap) return;
    const today = todayIdx();
    const th = document.querySelector(".week-table thead th.col-today");
    if (th) {
      const tableLeft = wrap.getBoundingClientRect().left;
      const thLeft = th.getBoundingClientRect().left;
      wrap.scrollLeft += (thLeft - tableLeft) - 20;
    }
  });
}

// ── COLLAPSIBLES ─────────────────────────────────
function initCollapsibles() {
  document.querySelectorAll(".ctrigger").forEach(btn => {
    const targetId = btn.dataset.target;
    const body = document.getElementById(targetId);
    const arr = btn.querySelector(".carr");
    if (!body) return;
    const saved = localStorage.getItem("col_" + targetId) === "1";
    if (saved) { body.classList.add("closed"); if (arr) arr.classList.add("up"); }
    btn.addEventListener("click", () => {
      const closing = !body.classList.contains("closed");
      body.classList.toggle("closed", closing);
      if (arr) arr.classList.toggle("up", closing);
      try { localStorage.setItem("col_" + targetId, closing ? "1" : "0"); } catch(e) {}
    });
  });
}

// ── SIDEBAR NAV ──────────────────────────────────
function initSidebar() {
  // Mobile hamburger
  const ham = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (ham && sidebar && overlay) {
    ham.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  // Active nav on scroll
  const sections = document.querySelectorAll("section[id], div[id]");
  const navItems = document.querySelectorAll(".snav-item");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(n => {
          n.classList.toggle("active", n.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));

  // Close sidebar on nav click (mobile)
  navItems.forEach(n => {
    n.addEventListener("click", () => {
      if (window.innerWidth <= 700) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      }
    });
  });
}

// ── BOOT ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setGreeting();
  setWeekRange();
  initMorningChecklist();
  buildWeekTable();
  initChecklist("monthlyBody");
  initChecklist("shoppingBody");
  initResetBtn();
  initScrollToday();
  initCollapsibles();
  initSidebar();
});
