/* Lanyard - badge progress for the personal onboarding pages (https://sites.super.so/lanyard/lanyard.js)
   The ID badge on a personal page is a callout with a user icon. The script reads its line "Starts <weekday> D Month YYYY"
   and replaces the line under it with "Day N of 90" (or "Starts in N days") plus a progress bar.
   It counts from today. A site can freeze the date (the demo does, on Maya's day 3) with a line placed before this script:
   <script>window.LANYARD_DEMO_TODAY = "2026-03-04";</script>
   Idempotent, re-runs after client-side navigation. */
(function () {
  var DEMO_TODAY = window.LANYARD_DEMO_TODAY || null;
  var MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  function parseStart(t) {
    var m = /Starts\s+\w+\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(t || "");
    if (!m) return null;
    var mo = MONTHS.indexOf(m[2].toLowerCase()); if (mo < 0) return null;
    return Date.UTC(+m[3], mo, +m[1]);
  }
  function badge() {
    document.querySelectorAll(".notion-root .notion-callout").forEach(function (c) {
      var icon = c.querySelector(":scope > .notion-callout__icon img");
      if (!icon || !/\/user_/.test(icon.getAttribute("src") || "") || c.dataset.lyDone) return;
      var ps = c.querySelectorAll(":scope > .notion-callout__content > p.notion-text");
      var startP = null, dayP = null;
      ps.forEach(function (p) { if (/^\s*Starts\s+\w+\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/.test(p.textContent)) startP = p; else if (/Day \d+ of 90|Starts in/.test(p.textContent)) dayP = p; });
      if (!startP || !dayP) return;
      var start = parseStart(startP.textContent); if (start === null) return;
      var now = new Date(); var today = DEMO_TODAY ? Date.parse(DEMO_TODAY + "T00:00:00Z") : Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      var day = Math.floor((today - start) / 86400000) + 1;
      var label = day >= 1 ? "Day " + Math.min(day, 90) + " of 90" : "Starts in " + (1 - day) + (1 - day === 1 ? " day" : " days");
      var pct = day >= 1 ? Math.min(100, Math.max(2, (Math.min(day, 90) / 90) * 100)) : 0;
      dayP.textContent = label; dayP.classList.add("ly-day");
      var bar = document.createElement("span"); bar.className = "ly-bar"; bar.setAttribute("aria-hidden", "true");
      var fill = document.createElement("i"); fill.style.setProperty("--lanyard-progress", pct + "%"); if (!pct) fill.style.minWidth = "0";
      bar.appendChild(fill); dayP.parentNode.insertBefore(bar, dayP);
      c.dataset.lyDone = "1"; c.setAttribute("data-ly-day", String(day));
    });
  }
  var queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; badge(); }); }
  function start() {
    if (document.body.dataset.lanyardDone) return;
    document.body.dataset.lanyardDone = "1";
    badge();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();
