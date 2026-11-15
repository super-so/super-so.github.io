/* Cubby: client portal template for Super. https://sites.super.so/cubby/cubby.js
   Counts the days left on each missing document from its Due date (from today, or from window.CUBBY_TODAY = "YYYY-MM-DD"
   when set before this script), marks received documents, places comment-thread rows left (office) or right (client),
   highlights the active portal tab and adds a back link with the portal tabs on item pages. */
/* Active portal tab, pigeonhole cells (days left / received tick), chat-thread sides. */
(function () {
  if (window.__cubby) return; window.__cubby = true;
  var M = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var TICK = '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function today() { var t = window.CUBBY_TODAY ? new Date(window.CUBBY_TODAY + "T00:00:00") : new Date(); t.setHours(0, 0, 0, 0); return t; }
  function parse(s) { var m = (s || "").trim().match(/^([A-Za-z]+) (\d{1,2}), (\d{4})/); if (!m || M.indexOf(m[1]) < 0) return null; return new Date(+m[3], M.indexOf(m[1]), +m[2]); }
  function pillText(el) { var out = []; var ps = el.querySelectorAll(".notion-pill"); for (var i = 0; i < ps.length; i++) out.push(ps[i].textContent.trim()); return out; }
  function run() {
    /* active tab in the portal tab row */
    var tabs = document.querySelectorAll('.notion-root > .notion-callout:has(> .notion-callout__icon img[src*="/sun_"]) a');
    for (var t = 0; t < tabs.length; t++) {
      var p = (tabs[t].getAttribute("href") || "").split("?")[0];
      tabs[t].classList.toggle("is-active", p === location.pathname);
    }
    /* pigeonhole cells */
    var cards = document.querySelectorAll(".notion-collection-card.gallery:not([data-cc])");
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], pills = pillText(c);
      var st = pills.indexOf("Missing") >= 0 ? "missing" : (pills.indexOf("Received") >= 0 || pills.indexOf("Checked") >= 0) ? "in" : "";
      c.setAttribute("data-cc", "1");
      if (!st) continue;
      c.setAttribute("data-cubby", st);
      var box = document.createElement("div"); box.className = "cubby-count";
      if (st === "in") { box.innerHTML = TICK + "<span>With us</span>"; }
      else {
        var d = parse((c.querySelector(".notion-property__date .date") || {}).textContent);
        if (!d) continue;
        var n = Math.round((d - today()) / 86400000);
        box.innerHTML = n > 0 ? "<b>" + n + "</b><span>" + (n === 1 ? "day left" : "days left") + "</span>" : n === 0 ? "<b>0</b><span>due today</span>" : "<b>" + (-n) + "</b><span>" + (n === -1 ? "day late" : "days late") + "</span>";
      }
      var content = c.querySelector(".notion-collection-card__content");
      if (content) content.insertBefore(box, content.firstChild);
    }
    /* chat thread: client on the right, office on the left */
    var items = document.querySelectorAll(".notion-collection-list__item:not([data-cs])");
    for (var j = 0; j < items.length; j++) {
      var ps = pillText(items[j]);
      items[j].setAttribute("data-cs", "1");
      var side = ps.length === 1 && ps[0] === "Client" ? "client" : ps.length === 1 && ps[0] === "Office" ? "office" : "";
      if (side) items[j].setAttribute("data-side", side);
      var dt = items[j].querySelector(".notion-property__date .date");
      if (dt && / \(GMT[^)]*\)$/.test(dt.textContent)) dt.textContent = dt.textContent.replace(/ \(GMT[^)]*\)$/, "");
    }
  }
  run();
  var q; new MutationObserver(function () { clearTimeout(q); q = setTimeout(run, 60); }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", function () { setTimeout(run, 200); });
})();

/* Portal back link + tab row on database item pages. The portal page remembers its tab row in this browser tab;
   item pages (a row of one of the "items" databases) show "Back to your portal" and the same tabs.
   Settings can be overridden with window.PORTAL_NAV = {home: "/clients/your-client", ...} in a script before this one;
   "home" is used when a visitor opens an item page directly. */
(function () {
  var D = {"portal": /^\/clients\/[^\/]+/, "home": "/", "label": "Back to your portal", "items": ["documents", "questions", "reports", "deadlines", "invoices"], "tabFor": {"questions": "ask-us"}};
  var C = window.PORTAL_NAV || {}, KEY = "portalNav:" + location.host;
  for (var k in D) if (C[k] === undefined) C[k] = D[k];
  function cls() { var m = document.querySelector("main.super-content"); return m ? m.className : ""; }
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function remember() {
    var m = location.pathname.match(C.portal); if (!m) return;
    /* every tab of the row: a link, or the current page shown as plain bold text */
    var as = document.querySelectorAll('.notion-root > .notion-callout:has(> .notion-callout__icon img[src*="/sun_"]) .notion-callout__content > p.notion-text > *');
    var tabs = [];
    for (var i = 0; i < as.length; i++) {
      var a = as[i].matches("a[href]") ? as[i] : as[i].querySelector("a[href]"), text = as[i].textContent.trim();
      if (!text) continue;
      tabs.push({ href: a ? a.getAttribute("href").split("?")[0].split("#")[0] : location.pathname, text: text });
    }
    if (!tabs.length) return;
    save({ home: m[0], tabs: tabs });
  }
  function itemDb() {
    var c = cls(), parts = location.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    for (var i = 0; i < C.items.length; i++) if ((" " + c + " ").indexOf(" parent-page__" + C.items[i] + " ") >= 0) return C.items[i];
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
    var nav = document.createElement("nav"); nav.className = "portal-nav"; nav.setAttribute("data-path", location.pathname); nav.setAttribute("aria-label", "Portal");
    var back = document.createElement("a"); back.className = "portal-nav__back"; back.href = st.home; back.textContent = "← " + C.label; nav.appendChild(back);
    if (st.tabs && st.tabs.length) {
      var row = document.createElement("div"); row.className = "portal-nav__tabs";
      for (var i = 0; i < st.tabs.length; i++) {
        var a = document.createElement("a"); a.href = st.tabs[i].href; a.textContent = st.tabs[i].text;
        var target = tab ? st.home + "/" + tab : st.home;
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
