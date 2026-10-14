/* Encore template for Super (encore-template.super.site).
   1. Works gallery filter: the star section gets one chip per category, read from the first line
      of every card ("Stage · 2025" -> Stage). Works on every page that has a star section.
   2. Smooth scrolling for #anchor links: #works scrolls to the heading "Works". */
(function () {
  function slug(t) { return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function go(hash) {
    var id = (hash || "").slice(1); if (!id) return false;
    var hs = document.querySelectorAll(".notion-root .notion-heading");
    for (var i = 0; i < hs.length; i++) {
      if (slug(hs[i].textContent) === id) { hs[i].scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
    }
    return false;
  }
  /* Gallery filter: one chip per work type, read from the first line of every card ("Stage · 2025"). */
  function gallery() {
    var icon = document.querySelector('.notion-root > .notion-callout > .notion-callout__icon img[src*="/star_"]');
    if (!icon) return;
    var box = icon.closest(".notion-callout").querySelector(":scope > .notion-callout__content");
    if (!box || box.querySelector(":scope > .encore-filter")) return;
    var cards = box.querySelectorAll(":scope > .notion-callout");
    if (!cards.length) return;
    var cats = [];
    cards.forEach(function (c) {
      var p = c.querySelector(":scope > .notion-callout__content > p");
      var cat = p ? p.textContent.split("·")[0].trim() : "";
      c.setAttribute("data-encore-cat", cat);
      if (cat && cats.indexOf(cat) < 0) cats.push(cat);
    });
    if (cats.length < 2) return;
    var bar = document.createElement("div");
    bar.className = "encore-filter"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Filter works");
    function chip(label, cat, n) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "encore-chip"; b.setAttribute("aria-pressed", cat === "" ? "true" : "false");
      b.textContent = label + " "; var s = document.createElement("span"); s.textContent = n; b.appendChild(s);
      b.addEventListener("click", function () {
        bar.querySelectorAll(".encore-chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        cards.forEach(function (c) { c.classList.toggle("encore-hide", cat !== "" && c.getAttribute("data-encore-cat") !== cat); });
      });
      bar.appendChild(b);
    }
    chip("All", "", cards.length);
    cats.forEach(function (cat) {
      chip(cat, cat, box.querySelectorAll(':scope > .notion-callout[data-encore-cat="' + cat + '"]').length);
    });
    box.insertBefore(bar, cards[0]);
  }
  gallery();
  if (document.body.dataset.encoreDone) return;
  document.body.dataset.encoreDone = "1";
  new MutationObserver(function () { requestAnimationFrame(gallery); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"], a[href*="/#"]');
    if (!a) return;
    var href = a.getAttribute("href"); var hash = href.slice(href.indexOf("#"));
    if (go(hash)) { e.preventDefault(); history.replaceState(null, "", hash); }
  });
  if (location.hash) setTimeout(function () { go(location.hash); }, 400);
})();
