/* Locker (https://sites.super.so/locker/locker.js): shows the checklist groups of a personal page in phase order
   (Before day 1 to Day 90) and turns the paragraph "Checklist: x of y done" into a progress bar counted from the
   checkboxes on the page. Rename the phases here if you rename the options of the When property. */
(function () {
  var ORDER = ["Before day 1", "Week 1", "Weeks 2 to 4", "Day 30", "Day 60", "Day 90"];
  function run() {
    document.querySelectorAll(".notion-collection-group__section").forEach(function (s) {
      var pill = s.querySelector(".notion-collection-group__section-header .notion-pill");
      var i = pill ? ORDER.indexOf(pill.textContent.trim()) : -1;
      if (i < 0) return;
      if (s.style.order !== String(i)) s.style.order = i;
      var par = s.parentElement;
      if (par.style.display !== "flex") { par.style.display = "flex"; par.style.flexDirection = "column"; }
    });
    var boxes = document.querySelectorAll(".notion-root .notion-collection-group__section .notion-checkbox");
    if (!boxes.length) return;
    var done = document.querySelectorAll(".notion-root .notion-collection-group__section .notion-checkbox.checked").length;
    var txt = "Checklist: " + done + " of " + boxes.length + " done";
    document.querySelectorAll(".notion-root p.notion-text").forEach(function (p) {
      if (!p.classList.contains("locker-progress") && !/^Checklist: \d+ of \d+ done$/.test(p.textContent.trim())) return;
      p.classList.add("locker-progress");
      p.style.setProperty("--locker-pct", Math.round(done * 100 / boxes.length) + "%");
      if (p.textContent !== txt) p.textContent = txt;
    });
  }
  run();
  var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 120); }).observe(document.body, { childList: true, subtree: true });
})();
