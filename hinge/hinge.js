/* =====================================================================
   HINGE - gated client portal template for Super (hinge-template.super.site)
   1. Progress bars: a gallery card's number property (Progress, 0-100) becomes a bar.
   2. Comment threads: list rows with a Side pill "Client" or "Studio" become chat bubbles
      with initials avatars taken from the Author text (client right, studio left).
   3. Portal tabs on item pages: a portal page (a page with the sun tab row) remembers its tabs in this
      browser tab; database item pages (Deliverables, Files, Invoices ...) show "Back to your portal"
      and the same tab row with the right tab active.
   Optional config before this script:
     <script>window.PORTAL_NAV = { home: "/clients/your-client" };</script>
   Source and docs: https://github.com/super-so/super-so.github.io
   ===================================================================== */
(function () {
  function decorate() {
    document.querySelectorAll(".notion-collection-card.gallery .notion-property__number").forEach(function (n) {
      var v = parseFloat((n.textContent || "").replace(/[^0-9.]/g, ""));
      if (isNaN(v)) return;
      n.style.setProperty("--hinge-progress", Math.max(0, Math.min(100, v)) + "%");
      n.setAttribute("data-h-progress", Math.round(v) + " %");
      n.classList.add("h-progress");
    });
    document.querySelectorAll(".notion-collection-list__item").forEach(function (it) {
      var pill = it.querySelector(".notion-property__select .notion-pill");
      var side = pill && (pill.textContent || "").trim();
      if (side !== "Client" && side !== "Studio") return;
      it.classList.add("h-comment", side === "Client" ? "h-client" : "h-studio");
      var who = it.querySelector(".notion-property__text");
      if (!who || it.querySelector(".h-avatar")) return;
      var ini = (who.textContent || "").trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
      var av = document.createElement("span");
      av.className = "h-avatar"; av.setAttribute("aria-hidden", "true"); av.textContent = ini;
      it.appendChild(av);
    });
  }
  var queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; decorate(); }); }
  function start() {
    if (document.body.dataset.hingeDone) return;
    document.body.dataset.hingeDone = "1";
    decorate();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("routeChangeComplete", schedule);
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();

(function () {
  var D = { home: "/clients/quillstone", label: "Back to your portal",
    items: ["deliverables", "files", "invoices", "meetings", "updates", "projects", "requests"],
    tabFor: { requests: "request", projects: "" } };
  var C = window.PORTAL_NAV || {};
  for (var k in D) if (C[k] === undefined) C[k] = D[k];
  var KEY = "portalNav:" + location.host;
  var TAB_ROW = '.notion-root > .notion-callout:has(> .notion-callout__icon img[src*="/sun_"]) .notion-callout__content > p.notion-text > *';
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function clean(h) { return h.split("?")[0].split("#")[0]; }
  /* a portal page: every tab of its row, a link or the current page shown as plain bold text; the first tab is the overview */
  function remember() {
    var as = document.querySelectorAll(TAB_ROW), tabs = [];
    for (var i = 0; i < as.length; i++) {
      var a = as[i].matches("a[href]") ? as[i] : as[i].querySelector("a[href]"), text = as[i].textContent.trim();
      if (!text) continue;
      tabs.push({ href: a ? clean(a.getAttribute("href")) : location.pathname, text: text });
    }
    if (!tabs.length) return;
    save({ home: tabs[0].href, tabs: tabs });
  }
  /* an item page: a database row (it has a property list) one level below a database listed in items */
  function itemDb() {
    var main = document.querySelector("main.super-content");
    if (!main || !main.querySelector(":scope > .notion-root > .notion-page__properties")) return null;
    var c = " " + main.className + " ";
    for (var i = 0; i < C.items.length; i++) if (c.indexOf(" parent-page__" + C.items[i] + " ") >= 0) return C.items[i];
    return null;
  }
  function mount() {
    remember();
    var db = itemDb(), main = document.querySelector("main.super-content");
    if (!db || !main) return;
    var old = main.querySelector(":scope > .portal-nav");
    if (old && old.getAttribute("data-path") === location.pathname) return;
    if (old) old.remove();
    var st = load() || { home: C.home, tabs: null };
    var tab = C.tabFor[db] === undefined ? db : C.tabFor[db];
    var target = tab ? st.home + "/" + tab : st.home;
    var nav = document.createElement("nav"); nav.className = "portal-nav"; nav.setAttribute("data-path", location.pathname); nav.setAttribute("aria-label", "Portal");
    var back = document.createElement("a"); back.className = "portal-nav__back"; back.href = st.home; back.textContent = "← " + C.label; nav.appendChild(back);
    if (st.tabs && st.tabs.length) {
      var row = document.createElement("div"); row.className = "portal-nav__tabs";
      for (var i = 0; i < st.tabs.length; i++) {
        var a = document.createElement("a"); a.href = st.tabs[i].href; a.textContent = st.tabs[i].text;
        if (st.tabs[i].href === target) a.className = "is-active";
        row.appendChild(a);
      }
      nav.appendChild(row);
    }
    var head = main.querySelector(":scope > .notion-header");
    main.insertBefore(nav, head || main.firstChild);
  }
  var q = false; function schedule() { if (q) return; q = true; requestAnimationFrame(function () { q = false; mount(); }); }
  function start() {
    if (window.__portalNav) return; window.__portalNav = true;
    mount();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("routeChangeComplete", schedule); window.addEventListener("popstate", schedule);
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();
