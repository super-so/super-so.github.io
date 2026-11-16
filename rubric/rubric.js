/* Rubric handbook script (https://sites.super.so/rubric/rubric.js)
   1. Keeps every chapter of the sidebar open, so all chapters show their pages.
   2. Numbers the handbook from the sidebar order: chapter N on the chapter page (the first link of a
      sidebar group, or a single sidebar link), N.M on the other pages of the group. The stylesheet shows
      the numbers before the page title, the section headings and the page lists.
   3. Copies the first sidebar button (Navigation > Sidebar > Call to action) into the Notion-style navbar,
      which has no button of its own.
   Runs after hydration and again after client-side navigation. Without the script the site still works,
   only the numbers and the navbar button are missing. */
(function () {
  if (window.__rubricDone) return;
  window.__rubricDone = true;

  function norm(href) {
    try { var p = new URL(href, location.href).pathname; } catch (e) { return ''; }
    return p.replace(/\/+$/, '') || '/';
  }

  function openChapters() {
    var hs = document.querySelectorAll('.super-sidebar .super-navigation-menu__list-header[data-state="closed"]');
    for (var i = 0; i < hs.length; i++) hs[i].click();
  }

  function numbers() {
    var main = document.querySelector('main.super-content');
    var items = document.querySelector('.super-sidebar .super-navigation-menu__items');
    if (!main || !items) return;
    var here = norm(location.href), ch = 0, found = null;
    for (var i = 0; i < items.children.length && !found; i++) {
      var el = items.children[i];
      if (el.matches('a.super-navigation-menu__item')) {
        ch++;
        if (norm(el.href) === here) found = { ch: ch };
      } else if (el.matches('.super-navigation-menu__list')) {
        ch++;
        var links = el.querySelectorAll('.super-navigation-menu__list-items a.super-navigation-menu__item');
        if (!links.length) continue;
        var first = norm(links[0].href), hub = true;
        for (var k = 1; k < links.length; k++) if (norm(links[k].href).indexOf(first + '/') !== 0) hub = false;
        var m = 0;
        for (var j = 0; j < links.length; j++) {
          var p = norm(links[j].href);
          if (j === 0 && hub) { if (p === here) { found = { ch: ch }; break; } continue; }
          m++;
          if (p === here) { found = { ch: ch, n: ch + '.' + m }; break; }
        }
      }
    }
    var key = found ? (found.n || found.ch) + '' : '';
    if (main.getAttribute('data-rubric') === key + '@' + here) return;
    main.setAttribute('data-rubric', key + '@' + here);
    main.style.removeProperty('--ch'); main.style.removeProperty('--n');
    if (!found || here === '/') return;
    main.style.setProperty('--ch', '"' + found.ch + '"');
    if (found.n) main.style.setProperty('--n', '"' + found.n + '"');
  }

  function addCta() {
    var bar = document.querySelector('.notion-navbar__actions');
    var src = document.querySelector('.super-sidebar .super-navigation-menu__cta a');
    if (!bar || !src || bar.querySelector('.rubric-cta')) return;
    var a = document.createElement('a');
    a.className = 'rubric-cta';
    a.href = src.getAttribute('href');
    if (src.target) { a.target = src.target; a.rel = 'noopener'; }
    a.textContent = (src.textContent || '').trim();
    bar.appendChild(a);
  }

  function run() { openChapters(); numbers(); addCta(); }
  var n = 0;
  var t = setInterval(function () { run(); if (++n > 20) clearInterval(t); }, 300);
  var last = location.pathname;
  new MutationObserver(function () {
    if (location.pathname !== last) { last = location.pathname; n = 0; }
    numbers(); addCta();
  }).observe(document.body, { childList: true, subtree: true });
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
})({"name": "Jonas Berg", "email": "jonas@example.com", "area": "Team only", "exact": ["/people/compensation"], "host": "rubric-template.super.site"});
/* <<< GATED DEMO BOX <<< */
