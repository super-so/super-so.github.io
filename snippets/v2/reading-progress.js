/*
 * Super.so snippet: reading progress bar
 * A thin bar at the top of the screen that fills up as the visitor scrolls.
 *
 * Install (Code page -> Body):
 *   <script src="https://sites.super.so/snippets/v2/reading-progress.js"></script>
 *
 * Optional settings, placed BEFORE the line above:
 *   <script>
 *     window.superReadingProgress = {
 *       color: "linear-gradient(90deg, #335DA8, #FAB624)", // any CSS color or gradient
 *       height: "3px",
 *       hideOnHomepage: true
 *     };
 *   </script>
 */
(function () {
  if (window.__superReadingProgress) return;
  window.__superReadingProgress = true;

  var cfg = window.superReadingProgress || {};
  var COLOR = cfg.color || "#111827";
  var HEIGHT = cfg.height || "3px";
  var HIDE_ON_HOMEPAGE = cfg.hideOnHomepage !== false;

  var bar = null;
  var ticking = false;

  function ensure() {
    if (bar) return;
    var st = document.createElement("style");
    st.textContent =
      ".sp-progress{position:fixed;left:0;right:0;top:0;height:" + HEIGHT + ";z-index:1000;pointer-events:none}" +
      ".sp-progress__fill{height:100%;background:" + COLOR + ";transform-origin:0 50%;transform:scaleX(0)}";
    document.head.appendChild(st);
    bar = document.createElement("div");
    bar.className = "sp-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<div class="sp-progress__fill"></div>';
    document.body.appendChild(bar);
  }

  function update() {
    if (!bar) return;
    bar.hidden = HIDE_ON_HOMEPAGE && !!document.querySelector("main.page__index");
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.firstChild.style.transform = "scaleX(" + p + ")";
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  function start() {
    ensure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Super swaps pages without a full reload
    document.addEventListener("routeChangeComplete", function () { requestAnimationFrame(update); });
    window.addEventListener("popstate", function () { requestAnimationFrame(update); });
    window.addEventListener("load", update, { once: true });
  }

  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
