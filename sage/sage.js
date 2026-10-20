/* Resolves #slug and /#slug links to headings by their slugified text (Super heading anchors are block ids). */
(function () {
  function slug(t) { return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function heading(hash) {
    var id = (hash || "").slice(1); if (!id) return null;
    var hs = document.querySelectorAll(".notion-root .notion-heading");
    for (var i = 0; i < hs.length; i++) {
      if (slug(hs[i].textContent) === id) return hs[i];
    }
    return null;
  }
  function go(hash) {
    var h = heading(hash);
    if (h) h.scrollIntoView({ behavior: "smooth", block: "start" });
    return !!h;
  }
  /* A /#slug link on a subpage loads the home page in place, so retry until its heading is rendered. */
  function goWhenReady(hash) {
    var tries = 0;
    var timer = setInterval(function () {
      if (++tries > 40) return clearInterval(timer);
      if (!go(hash)) return;
      clearInterval(timer);
      [900, 1800].forEach(function (ms) { setTimeout(function () { realign(hash); }, ms); });
    }, 150);
  }
  /* Images and widgets above the heading can still push it down after the first scroll. */
  function realign(hash) {
    var h = heading(hash);
    if (h && Math.abs(h.getBoundingClientRect().top) > 160) h.scrollIntoView({ block: "start" });
  }
  if (document.body.dataset.anchorNavDone) return;
  document.body.dataset.anchorNavDone = "1";
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"], a[href*="/#"]');
    if (!a) return;
    var href = a.getAttribute("href"); var hash = href.slice(href.indexOf("#"));
    if (hash.indexOf("#block-") === 0) return;
    if (go(hash)) { e.preventDefault(); history.replaceState(null, "", hash); return; }
    goWhenReady(hash);
  });
  if (location.hash) goWhenReady(location.hash);
})();
