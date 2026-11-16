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

/* >>> GATED DEMO BOX >>> */
/* GATED DEMO BOX (shared source: _shared/gated-demo.js, copied into each gated template script by _shared/gen_gated_demo.py)
   On the template's own demo host only, a floating box on the pages that would sit behind a login on a real site:
   who is signed in (an invented member) and a Log out button, so the visitor sees at once that the page is private.
   Colours come from the template's navbar (or sidebar) and its button. The cross closes it for this visit only (nothing is stored; a reload shows it again).
   Your own site never shows it: delete this block or keep it, it checks the host name. */
(function (C) {
  if (location.hostname !== C.host || window.__gatedDemo) return; window.__gatedDemo = 1;
  var closed = false; /* the cross closes the box for this visit only: nothing is stored, a reload or the next visit shows it again */
  function gated(p) {
    p = p.replace(/\/+$/, "") || "/";
    if ((C.except || []).some(function (x) { return p === x || p.indexOf(x + "/") === 0; })) return false;
    return (C.exact || []).indexOf(p) >= 0 || (C.prefix || []).some(function (x) { return p === x || p.indexOf(x + "/") === 0; });
  }
  function solid(c) { return c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c); }
  function css(nav, cta) {
    /* ground and ink: the navbar's; with a sidebar layout (no navbar) the page's own ground, which reads better than a coloured sidebar */
    var top = nav.classList.contains("super-navbar") ? nav : (document.querySelector(".super-content") || document.body);
    var n = getComputedStyle(top), bg = n.backgroundColor, ink = n.color || "#111";
    if (!solid(bg)) bg = getComputedStyle(document.body).backgroundColor;
    if (!solid(bg)) bg = "#fff";
    var a = cta ? getComputedStyle(cta) : null, acc = a && solid(a.backgroundColor) ? a.backgroundColor : ink, accInk = a && solid(a.backgroundColor) ? a.color : bg;
    n = getComputedStyle(nav);
    var s = document.createElement("style"); s.id = "gx-style";
    s.textContent = ".gx{--gx-bg:" + bg + ";--gx-ink:" + ink + ";--gx-acc:" + acc + ";--gx-acc-ink:" + accInk + ";" +
      "position:fixed;right:20px;bottom:20px;z-index:9999;width:310px;box-sizing:border-box;font:14px/1.4 " + n.fontFamily + ";color:var(--gx-ink);background:var(--gx-bg);" +
      "border:1px solid color-mix(in srgb,var(--gx-ink) 14%,transparent);border-radius:16px;box-shadow:0 18px 40px -16px rgba(0,0,0,.35);padding:14px 16px}" +
      ".gx *{box-sizing:border-box}.gx-row{display:flex;align-items:center;gap:10px}.gx-row+.gx-row{margin-top:12px}" +
      ".gx-lock{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:color-mix(in srgb,var(--gx-acc) 16%,transparent);white-space:nowrap}" +
      ".gx-x{margin-left:auto;border:0;background:none;color:inherit;opacity:.55;font-size:20px;line-height:1;cursor:pointer;padding:0 2px}.gx-x:hover{opacity:1}" +
      ".gx-av{width:32px;height:32px;border-radius:50%;background:var(--gx-acc);color:var(--gx-acc-ink);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex:0 0 auto}" +
      ".gx-who{min-width:0;line-height:1.2;font-size:13px}.gx-who b{display:block}.gx-who span{display:block;opacity:.7;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".gx-out{margin-left:auto;display:inline-flex;align-items:center;gap:6px;border:1.5px solid currentColor;border-radius:999px;padding:5px 12px;font:600 13px/1.2 inherit;background:transparent;color:inherit;cursor:pointer;white-space:nowrap}" +
      ".gx-foot{margin-top:12px;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--gx-ink) 12%,transparent);font-size:12px;line-height:1.45}" +
      "@media (max-width:700px){.gx{left:12px;right:12px;bottom:12px;width:auto;padding:10px 12px}.gx-foot{font-size:11.5px;margin-top:8px;padding-top:8px}}" +
      "@media print{.gx{display:none}}";
    document.head.appendChild(s);
  }
  var lock = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var out = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
  var NOTE = "<b>Template demo.</b> On your site this box can look any way you like and sit anywhere: floating like here, in the header or in the footer.";
  function render() {
    var box = document.querySelector(".gx"), want = gated(location.pathname);
    if (closed) want = false;
    if (!want) { if (box) box.remove(); return; }
    if (box) return;
    var nav = document.querySelector(".super-navbar") || document.querySelector(".super-sidebar"); if (!nav) return;
    if (!document.getElementById("gx-style")) css(nav, document.querySelector(".super-navbar__cta, .super-navbar__actions a.notion-link:not(.super-navbar__logo), .super-navigation-menu__cta a, .super-navigation-menu__cta"));
    var ini = C.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
    box = document.createElement("aside"); box.className = "gx"; box.setAttribute("aria-label", "Signed in");
    box.innerHTML = '<div class="gx-row"><span class="gx-lock">' + lock + C.area + '</span><button class="gx-x" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="gx-row"><span class="gx-av">' + ini + '</span><span class="gx-who"><b>' + C.name + '</b><span>' + C.email + '</span></span>' +
      '<button class="gx-out" type="button">' + out + 'Log out</button></div><div class="gx-foot">' + NOTE + '</div>';
    box.querySelector(".gx-x").onclick = function () { closed = true; box.remove(); };
    box.querySelector(".gx-out").onclick = function () { box.querySelector(".gx-foot").innerHTML = "<b>Demo:</b> log out is switched off here. On your site Super signs the member out and shows the login page."; };
    document.body.appendChild(box);
  }
  var last = "";
  function tick() { if (location.pathname !== last || !document.querySelector(".gx") === gated(location.pathname)) { last = location.pathname; render(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  setInterval(tick, 400);
})({"name": "Odile Marchetti", "email": "odile@example.com", "area": "Client portal", "prefix": ["/clients/quillstone", "/deliverables", "/files", "/invoices", "/meetings", "/projects", "/requests", "/updates", "/comments"], "host": "hinge-template.super.site"});
/* <<< GATED DEMO BOX <<< */
