/* Annex - client portal helpers (https://sites.super.so/annex/annex.js)
   1. Single login: make /clients members-only for every client tier and turn on "Expose member data" with a member
      column "client_page" holding the path of that client's space (for example /clients/harbor-pine-dental).
      After login, a member who opens /clients is sent straight to that path. Without member data nothing happens.
   2. Gated demo box (below): only on the template's own demo host. */
(function () {
  function isClientsIndex() { return location.pathname.replace(/\/+$/, "") === "/clients"; }
  function go(member) {
    if (!isClientsIndex() || !member || !member.loggedIn) return;
    var target = member.client_page;
    if (typeof target === "string" && /^\/clients\/[a-z0-9-]+$/.test(target)) location.replace(target);
  }
  function check() {
    if (!isClientsIndex()) return;
    if (window.superMember) return go(window.superMember);
    if (window.superMemberReady && window.superMemberReady.then) window.superMemberReady.then(go);
  }
  window.addEventListener("super:member", function (e) { go((e && e.detail) || window.superMember); });
  document.addEventListener("routeChangeComplete", function () { requestAnimationFrame(check); });
  if (document.readyState === "complete") check(); else window.addEventListener("load", check, { once: true });
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
      ".gx-dlg{--gx-bg:" + bg + ";--gx-ink:" + ink + ";--gx-acc:" + acc + ";--gx-acc-ink:" + accInk + ";width:min(480px,calc(100vw - 32px));box-sizing:border-box;border:1px solid color-mix(in srgb,var(--gx-ink) 14%,transparent);border-radius:18px;padding:24px 24px 20px;background:var(--gx-bg);color:var(--gx-ink);font:15px/1.5 " + n.fontFamily + ";box-shadow:0 30px 70px -20px rgba(0,0,0,.45)}" +
      ".gx-dlg::backdrop{background:rgba(0,0,0,.45)}.gx-dlg *{box-sizing:border-box}.gx-dlg h2{margin:12px 0 8px;font:700 22px/1.2 " + n.fontFamily + ";color:inherit;letter-spacing:-.01em}.gx-dlg p{margin:0 0 10px;color:inherit}" +
      ".gx-dlg ul{margin:0 0 12px;padding:0;list-style:none}.gx-dlg li{margin:0 0 8px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--gx-acc) 10%,transparent)}.gx-dlg li b{display:block}" +
      ".gx-dlg .gx-acts{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:16px}.gx-dlg .gx-go{border:0;border-radius:999px;padding:10px 18px;background:var(--gx-acc);color:var(--gx-acc-ink);font:600 15px/1.2 inherit;cursor:pointer}" +
      ".gx-dlg .gx-stay{border:1.5px solid currentColor;border-radius:999px;padding:9px 16px;background:transparent;color:inherit;font:600 15px/1.2 inherit;cursor:pointer}.gx-dlg .gx-how{margin-left:auto;color:inherit;font-size:13px;text-decoration:underline;text-underline-offset:3px}" +
      "@media (max-width:520px){.gx-dlg{padding:20px 18px 16px}.gx-dlg .gx-how{margin-left:0;width:100%}}" +
      "@media print{.gx{display:none}}";
    document.head.appendChild(s);
  }
  function style() {
    if (document.getElementById("gx-style")) return true;
    var nav = document.querySelector(".super-navbar") || document.querySelector(".super-sidebar"); if (!nav) return false;
    css(nav, document.querySelector(".super-navbar__cta, .super-navbar__actions a.notion-link:not(.super-navbar__logo), .super-navigation-menu__cta a, .super-navigation-menu__cta"));
    return true;
  }
  var lock = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var out = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>';
  var NOTE = "<b>Template demo.</b> On your site this box can look any way you like and sit anywhere: floating like here, in the header or in the footer.";
  function render() {
    var box = document.querySelector(".gx"), want = gated(location.pathname);
    if (closed) want = false;
    if (!want) { if (box) box.remove(); return; }
    if (box) return;
    if (!style()) return;
    var ini = C.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
    box = document.createElement("aside"); box.className = "gx"; box.setAttribute("aria-label", "Signed in");
    box.innerHTML = '<div class="gx-row"><span class="gx-lock">' + lock + C.area + '</span><button class="gx-x" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="gx-row"><span class="gx-av">' + ini + '</span><span class="gx-who"><b>' + C.name + '</b><span>' + C.email + '</span></span>' +
      '<button class="gx-out" type="button">' + out + 'Log out</button></div><div class="gx-foot">' + NOTE + '</div>';
    box.querySelector(".gx-x").onclick = function () { closed = true; box.remove(); };
    box.querySelector(".gx-out").onclick = function () { box.querySelector(".gx-foot").innerHTML = "<b>Demo:</b> log out is switched off here. On your site Super signs the member out and shows the login page."; };
    document.body.appendChild(box);
  }
  /* Login links: a click from a public page to a page that would be private opens a short note instead of a login screen */
  function note(href) {
    if (!style()) { location.assign(href); return; }
    var d = document.querySelector(".gx-dlg");
    if (!d) {
      d = document.createElement("dialog"); d.className = "gx-dlg"; d.setAttribute("aria-labelledby", "gx-dlg-t");
      d.innerHTML = '<span class="gx-lock">' + lock + C.area + '</span><h2 id="gx-dlg-t">We skip the login in this demo</h2>' +
        '<p>On your own site this ' + C.place + ' is private: your ' + C.who + ' sign in before they see it. Super gives you two ways to do it:</p>' +
        '<ul><li><b>Memberships</b>Each person signs in with their email and sees only the pages of their tier.</li>' +
        '<li><b>Password</b>Set a password on the page under Pages and share it with the people who need it.</li></ul>' +
        '<p>Here the login is switched off, so you can look around.</p>' +
        '<div class="gx-acts"><button class="gx-go" type="button">Continue to the ' + C.place + '</button><button class="gx-stay" type="button">Stay here</button>' +
        '<a class="gx-how" href="/instructions">How to set it up</a></div>';
      d.querySelector(".gx-stay").onclick = function () { d.close(); };
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      document.body.appendChild(d);
    }
    d.querySelector(".gx-go").onclick = function () { d.close(); location.assign(href); };
    d.showModal(); d.querySelector(".gx-go").focus();
  }
  /* Whole-site gating (wiki, intranet, handbook): on a real site every page sits behind the login, so the same note opens at once on arrival.
     Closing it counts for the whole visit (sessionStorage, ignored when blocked). */
  function arrive() {
    if (!C.whole) return;
    try { if (sessionStorage.getItem("gx-arrived")) return; sessionStorage.setItem("gx-arrived", "1"); } catch (x) {}
    if (!style()) { setTimeout(arrive, 300); return; }
    var d = document.createElement("dialog"); d.className = "gx-dlg"; d.setAttribute("aria-labelledby", "gx-arr-t");
    d.innerHTML = '<span class="gx-lock">' + lock + C.area + '</span><h2 id="gx-arr-t">We skip the login in this demo</h2>' +
      '<p>On your own site this whole ' + C.whole + ' is private: your ' + C.who + ' sign in before they see any page. Super gives you two ways to do it:</p>' +
      '<ul><li><b>Memberships</b>Each person signs in with their email; you can let in everyone with your company domain.</li>' +
      '<li><b>Password</b>One password for the whole site, shared with the people who need it.</li></ul>' +
      '<p>Here the login is switched off, so you can look around.</p>' +
      '<div class="gx-acts"><button class="gx-go" type="button">Look around</button><a class="gx-how" href="/instructions">How to set it up</a></div>';
    d.querySelector(".gx-go").onclick = function () { d.close(); };
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    document.body.appendChild(d); d.showModal(); d.querySelector(".gx-go").focus();
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]"); if (!a || a.closest(".gx-dlg")) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.host !== location.host || !gated(u.pathname) || gated(location.pathname)) return;
    e.preventDefault(); e.stopImmediatePropagation(); note(u.pathname + u.search + u.hash);
  }, true);
  var last = "";
  function tick() { if (location.pathname !== last || !document.querySelector(".gx") === gated(location.pathname)) { last = location.pathname; render(); } }
  function start() { render(); if (location.pathname.replace(/\/+$/, "") !== "/instructions") arrive(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  setInterval(tick, 400);
})({"who": "clients", "place": "client space", "name": "Theo Marsh", "email": "theo@example.com", "area": "Client portal", "prefix": ["/clients"], "host": "annex-template.super.site"});
/* <<< GATED DEMO BOX <<< */
