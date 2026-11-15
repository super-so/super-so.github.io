/* Joist portal navigation (https://sites.super.so/joist/joist.js).
   Back link + tab row on database item pages. The portal page remembers its tab row in this
   browser tab; item pages (a row of one of the "items" databases) show "Back to your project" and the same tabs.
   "home" is used when a visitor opens an item page directly: change it to your own project page by defining
   window.PORTAL_NAV before this script, or leave it. */
window.PORTAL_NAV = window.PORTAL_NAV || {"portal": /^\/projects\/[^\/]+/, "home": "/projects/wren-terrace", "label": "Back to your project", "items": ["selections", "changes", "diary", "stages", "payments", "files"], "tabFor": {"selections": "choices", "files": "documents", "stages": "", "payments": ""}};
(function () {
  var C = window.PORTAL_NAV, KEY = "portalNav:" + location.host;
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
    var back = document.createElement("a"); back.className = "portal-nav__back"; back.href = st.home; back.textContent = "\u2190 " + C.label; nav.appendChild(back);
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
