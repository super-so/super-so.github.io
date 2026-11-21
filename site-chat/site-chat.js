/* Super site chat badge for super.so: an "Ask Super AI · Build my site" pill in the bottom-right corner of every page.
   After a few seconds a short teaser offers to rebuild the visitor's old website; a click opens a small chat panel
   with a field for the old site's address and ready-made prompts. Sending opens app.super.so/?ai=<prompt>, which
   starts the in-app AI chat with that prompt. Nothing is sent anywhere from this page.
   Sister of template-chat.js (template demos); skips itself when that badge is on the page.
   Usage (body slot): <script src="https://sites.super.so/site-chat/site-chat.js" defer></script>
   data-bottom = distance from the bottom edge in px (optional), data-teaser = "off" to never show the teaser. */
(function () {
  if (window.__superSiteChat || window.__superTplChat) return;
  window.__superSiteChat = true;
  var me = document.currentScript || document.querySelector('script[src*="site-chat.js"]');
  var ds = (me && me.dataset) || {};
  var APP = "https://app.super.so/";
  var LOGO = '<svg class="ssc-logo" width="20" height="20" viewBox="0 0 128 128" fill="none" aria-hidden="true"><path d="M0 64.0002C0 15.9999 15.9998 0 64 0C112 0 128 15.9999 128 64.0002C128 112 112 128 64 128C15.9998 128 0 112 0 64.0002Z" fill="#ffb400"/><path fill-rule="evenodd" clip-rule="evenodd" d="M64.7197 32.5686L40.2317 70.0172C39.4549 71.2052 40.3072 72.7809 41.7266 72.7809H54.3396H60.8434H64.1768L60.0179 95.4841C59.6667 97.4015 62.2029 98.4149 63.2697 96.7835L87.7577 59.3349C88.5345 58.1469 87.6822 56.5712 86.2628 56.5712H71.1568H67.146H63.8126L67.9715 33.868C68.3227 31.9506 65.7865 30.9372 64.7197 32.5686Z" fill="#111"/></svg>';
  var SEND = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  var X = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SPARK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
  var GLOBE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';
  var NO_URL = "[my old website]";
  var P = {
    rebuild: "Create a new Super site from my existing website {URL}. Read all its pages and content, move them into a new Notion page and rebuild the site in a fresh, modern style. Keep my texts, images and page structure. Show me the plan first, then build it.",
    keep: "Move my existing website {URL} to Super. Copy all its pages and content into a new Notion page and keep the current look as close as possible. Show me the plan first, then build it.",
    scratch: "Build me a new Super website from scratch. Ask me what it is for, then create the Notion page and publish the site."
  };
  /* One chip depends on the page the visitor is on. */
  function ctx() {
    var p = location.pathname;
    if (/^\/templates/.test(p)) return ["Use a template's style", "Create a new Super site from my existing website {URL} in the style of one of Super's templates (https://super.so/templates). Suggest 3 templates that fit, then rebuild it in the one I pick."];
    if (/^\/pricing/.test(p)) return ["Which plan do I need?", "Look at my existing website {URL} and tell me which Super plan I need to run it on Super, then rebuild it on Super."];
    return ["Help me pick a start", "I'm not sure what to build yet. Ask me a few questions and suggest the right kind of Super site for me, then build it."];
  }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function track(ev) { try { (window.dataLayer = window.dataLayer || []).push({ event: "super_site_chat", action: ev, page: location.pathname }); } catch (e) {} }
  var CSS = '#ssc{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font:14px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#171717;letter-spacing:0;text-transform:none;text-align:left}'
  + '#ssc *{box-sizing:border-box;font-family:inherit;letter-spacing:inherit;text-transform:none}#ssc button{cursor:pointer;margin:0}'
  + '#ssc .ssc-badge{display:flex;align-items:center;gap:8px;background:#111;color:#fff;border:0;border-radius:999px;padding:7px 7px 7px 11px;box-shadow:0 8px 24px rgba(0,0,0,.22);font-size:13px;font-weight:600;line-height:1}'
  + '#ssc .ssc-badge em{font-style:normal;display:inline-flex;gap:5px;align-items:center;background:#ffb400;color:#111;border-radius:999px;padding:6px 11px;font-weight:700}'
  + '@keyframes sscpop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
  + '#ssc .ssc-tease{position:relative;display:none;background:#fff;border:1px solid #ececea;border-radius:14px 14px 4px 14px;padding:10px 32px 10px 12px;max-width:260px;font-size:13.5px;box-shadow:0 10px 30px rgba(0,0,0,.14);animation:sscpop .35s ease-out;cursor:pointer}'
  + '#ssc.tease .ssc-tease{display:block}#ssc.open .ssc-tease{display:none}'
  + '#ssc .ssc-tx{position:absolute;top:6px;right:6px;border:0;background:transparent;color:#999;display:flex;padding:3px}'
  + '#ssc .ssc-panel{display:none;width:350px;max-height:calc(100vh - 90px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.25)}'
  + '#ssc.open .ssc-panel{display:block;animation:sscpop .25s ease-out}'
  + '#ssc .ssc-ph{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eee;font-weight:700}#ssc .ssc-ph small{font-weight:400;color:#888}'
  + '#ssc .ssc-dot{width:7px;height:7px;border-radius:50%;background:#22c55e}'
  + '#ssc .ssc-x{margin-left:auto;border:0;background:#f3f3f1;color:#111;border-radius:6px;padding:5px;display:flex}'
  + '#ssc .ssc-msgs{padding:14px;display:flex;flex-direction:column;gap:8px;background:#fafaf8}'
  + '#ssc .ssc-bot{background:#fff;border:1px solid #ececea;border-radius:12px 12px 12px 4px;padding:9px 11px;font-size:13.5px}'
  + '#ssc .ssc-bot.ssc-ok{border-color:#ffd77a;background:#fff8e6}'
  + '#ssc .ssc-url{display:flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #111;border-radius:10px;padding:8px 10px;color:#666}'
  + '#ssc .ssc-url input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:14px;color:#171717;padding:0;margin:0;box-shadow:none}'
  + '#ssc .ssc-hint{font-size:12.5px;color:#555;padding:0 2px}'
  + '#ssc .ssc-chips{display:flex;flex-wrap:wrap;gap:6px}#ssc .ssc-chips button{border:1px solid #e0ddd5;background:#fff;color:#171717;border-radius:999px;padding:5px 10px;font-size:12.5px;line-height:1.3}'
  + '#ssc .ssc-chips button:hover,#ssc .ssc-chips button.on{border-color:#111;background:#111;color:#fff}'
  + '#ssc .ssc-inp{display:flex;gap:8px;align-items:flex-end;padding:10px 12px;border-top:1px solid #eee}'
  + '#ssc textarea{flex:1;min-width:0;border:1px solid #e3e3df;border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.4;color:#171717;background:#fff;resize:none;outline:none;margin:0}#ssc textarea:focus{border-color:#111}'
  + '#ssc .ssc-send{flex:none;border:0;background:#ffb400;color:#111;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}'
  + '#ssc .ssc-foot{font-size:11.5px;color:#888;padding:0 14px 11px}'
  /* Phone: inputs at 16px (iOS zooms into smaller fields and the page slides sideways); the open panel is a sheet that
     JS fits into the visual viewport, so the on-screen keyboard never covers it; the badge hides while it is open. */
  + '@media (max-width:480px){#ssc{right:10px;left:10px;bottom:10px}#ssc .ssc-panel{width:100%}'
  + '#ssc .ssc-url input,#ssc textarea{font-size:16px}#ssc textarea{height:76px}'
  + '#ssc.open{top:10px}#ssc.open .ssc-badge{display:none}'
  + '#ssc.open .ssc-panel{display:flex;flex-direction:column;flex:1;min-height:0;max-height:none;overflow:hidden}'
  + '#ssc.open .ssc-ph,#ssc.open .ssc-inp,#ssc.open .ssc-foot{flex:none}#ssc.open .ssc-msgs{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain}}'
  + '@media print{#ssc{display:none}}';
  function el(h) { var d = document.createElement("div"); d.innerHTML = h; return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function build() {
    if (document.getElementById("ssc") || document.getElementById("stc")) return;
    if (!document.getElementById("ssc-css")) { var st = document.createElement("style"); st.id = "ssc-css"; st.textContent = CSS; document.head.appendChild(st); }
    var w = el('<div id="ssc">'
      + '<div class="ssc-panel" role="dialog" aria-label="Super AI chat">'
      + '<div class="ssc-ph">' + LOGO + '<span>Super AI</span><span class="ssc-dot"></span><small>in-app chat</small><button type="button" class="ssc-x" aria-label="Close">' + X + "</button></div>"
      + '<div class="ssc-msgs"><div class="ssc-bot">Hi! I build Super sites for you. Tell me what you want, no settings to click through.</div>'
      + '<div class="ssc-bot ssc-ok">Got a website already? Paste the link and I\'ll rebuild it on Notion in a fresh style.</div>'
      + '<label class="ssc-url">' + GLOBE + '<input type="text" inputmode="url" autocomplete="url" placeholder="your-old-website.com" aria-label="Your current website"></label>'
      + '<div class="ssc-hint">Or pick a start:</div><div class="ssc-chips">'
      + '<button type="button" class="on" data-k="rebuild">Rebuild my site</button><button type="button" data-k="keep">Keep my look</button>'
      + '<button type="button" data-k="ctx"></button><button type="button" data-k="scratch">Start from scratch</button></div></div>'
      + '<div class="ssc-inp"><textarea rows="4" aria-label="Your prompt"></textarea><button type="button" class="ssc-send" aria-label="Open in Super">' + SEND + "</button></div>"
      + '<div class="ssc-foot">Opens app.super.so with this prompt ready. Free to start.</div></div>'
      + '<div class="ssc-tease" role="button" tabindex="0">Have an old website? I\'ll rebuild it on Super.<button type="button" class="ssc-tx" aria-label="Dismiss">' + X + "</button></div>"
      + '<button type="button" class="ssc-badge" aria-expanded="false">' + LOGO + "<span>Ask Super AI</span><em>" + SPARK + " Build my site</em></button></div>");
    document.body.appendChild(w);
    var base = ds.bottom && !isNaN(+ds.bottom) ? +ds.bottom + "px" : "";
    w.style.bottom = base;
    var badge = w.querySelector(".ssc-badge"), ta = w.querySelector("textarea"), inp = w.querySelector(".ssc-url input"),
      msgs = w.querySelector(".ssc-msgs"), ctxBtn = w.querySelector('[data-k="ctx"]'), kind = "rebuild", edited = false;
    function text() {
      var u = inp.value.trim() || NO_URL;
      var t = kind === "ctx" ? ctx()[1] : P[kind];
      return t.replace("{URL}", u);
    }
    function refresh() { ctxBtn.textContent = ctx()[0]; if (!edited) ta.value = text(); }
    function setOpen(o) {
      w.classList.toggle("open", o); badge.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) { w.classList.remove("tease"); store("ssc-tease", "1"); refresh(); if (!touch) inp.focus(); track("open"); }
      fit();
    }
    /* Phone: keep the open sheet inside the visible area above the keyboard. */
    var phone = window.matchMedia ? matchMedia("(max-width:480px)") : null, vv = window.visualViewport,
      touch = window.matchMedia && matchMedia("(pointer:coarse)").matches;
    function fit() {
      if (!vv || !phone || !phone.matches || !w.classList.contains("open")) { w.style.top = w.style.height = ""; w.style.bottom = base; return; }
      w.style.top = (vv.offsetTop + 10) + "px"; w.style.bottom = "auto"; w.style.height = Math.max(200, vv.height - 20) + "px";
    }
    if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
    badge.addEventListener("click", function () { setOpen(!w.classList.contains("open")); });
    w.querySelector(".ssc-x").addEventListener("click", function () { setOpen(false); badge.focus(); });
    w.querySelector(".ssc-tease").addEventListener("click", function () { setOpen(true); });
    w.querySelector(".ssc-tx").addEventListener("click", function (e) { e.stopPropagation(); w.classList.remove("tease"); store("ssc-tease", "1"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && w.classList.contains("open")) setOpen(false); });
    inp.addEventListener("input", function () { edited = false; refresh(); });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); send(); } });
    ta.addEventListener("input", function () { edited = true; });
    w.querySelectorAll(".ssc-chips button").forEach(function (c) {
      c.addEventListener("click", function () {
        w.querySelectorAll(".ssc-chips button").forEach(function (x) { x.classList.toggle("on", x === c); });
        kind = c.getAttribute("data-k"); edited = false; refresh();
      });
    });
    function send() {
      var p = ta.value.trim() || text();
      track("send");
      window.open(APP + "?ai=" + encodeURIComponent(p), "_blank", "noopener");
      var old = msgs.querySelector(".ssc-sent"); if (old) old.remove();
      var m = el('<div class="ssc-bot ssc-ok ssc-sent">Super opens in a new tab with your prompt in its chat.</div>');
      msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
    }
    w.querySelector(".ssc-send").addEventListener("click", send);
    refresh();
    /* Teaser once per browser session, a few seconds after load; hides itself after a while. */
    if (ds.teaser !== "off" && !store("ssc-tease")) {
      setTimeout(function () {
        if (w.classList.contains("open")) return;
        w.classList.add("tease"); store("ssc-tease", "1");
        setTimeout(function () { w.classList.remove("tease"); }, 15000);
      }, 4000);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
  /* The page shell can be rebuilt on client-side navigation; put the badge back when it disappears. */
  setInterval(function () { if (document.body && !document.getElementById("ssc") && !document.getElementById("stc")) build(); }, 1500);
})();
