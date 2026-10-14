/* Resolves #slug and /#slug links to headings by their slugified text (Super heading anchors are block ids). */
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
  if (document.body.dataset.anchorNavDone) return;
  document.body.dataset.anchorNavDone = "1";
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"], a[href*="/#"]');
    if (!a) return;
    var href = a.getAttribute("href"); var hash = href.slice(href.indexOf("#"));
    if (go(hash)) { e.preventDefault(); history.replaceState(null, "", hash); }
  });
  if (location.hash) setTimeout(function () { go(location.hash); }, 400);
})();
