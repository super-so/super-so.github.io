/* Galley: checklist rows can be ticked with a tap (or Space/Enter).
   Ticks are kept in this browser for the current day only (localStorage, key = page path + date), so every
   shift starts with an empty list. Nothing is sent anywhere and Notion is not changed. */
(function () {
  if (window.__galleyDone) return;
  window.__galleyDone = true;
  function key() { var d = new Date(); return "galley:" + location.pathname + ":" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function load() { try { return JSON.parse(localStorage.getItem(key()) || "{}"); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(key(), JSON.stringify(s)); } catch (e) {} }
  function paint() {
    var s = load(), rows = document.querySelectorAll(".notion-root .notion-to-do");
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      r.classList.toggle("is-ticked", !!s[r.id]);
      var c = r.querySelector(".notion-to-do__content");
      if (c && !c.hasAttribute("role")) { c.setAttribute("role", "checkbox"); c.setAttribute("tabindex", "0"); }
      if (c) c.setAttribute("aria-checked", s[r.id] ? "true" : "false");
    }
  }
  function toggle(row) { var s = load(); if (s[row.id]) delete s[row.id]; else s[row.id] = 1; save(s); paint(); }
  document.addEventListener("click", function (e) {
    var row = e.target.closest && e.target.closest(".notion-root .notion-to-do");
    if (row && row.id) { e.preventDefault(); toggle(row); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    var row = e.target.closest && e.target.closest(".notion-root .notion-to-do");
    if (row && row.id) { e.preventDefault(); toggle(row); }
  });
  var last = "";
  setInterval(function () { if (location.pathname !== last || !document.querySelector(".notion-to-do__content[role]")) { last = location.pathname; paint(); } }, 600);
  paint();
})();
