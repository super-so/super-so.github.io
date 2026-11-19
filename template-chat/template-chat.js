/* Super template chat badge: a "Made with Super" pill in the bottom-right corner of a template demo.
   A click opens a small chat panel that offers ready-made prompts for launching the template as the
   visitor's own site. Sending opens app.super.so/?ai=<prompt>, which starts the in-app chat with that
   prompt. Nothing is sent anywhere from this page.
   Usage (body slot): <script src="https://sites.super.so/template-chat/template-chat.js" data-name="Zine" data-get="/instructions" defer></script>
   data-name = template name (default: the first part of the host name), data-get = page with the manual
   instructions (optional), data-accent = colour of the pink in the template, used in one chip (optional). */
(function () {
  if (window.__superTplChat) return;
  window.__superTplChat = true;
  var me = document.currentScript || document.querySelector('script[src*="template-chat.js"]');
  var ds = (me && me.dataset) || {};
  var host = location.hostname;
  var name = ds.name || host.split(".")[0].replace(/-template$/, "").replace(/^./, function (c) { return c.toUpperCase(); });
  var url = host;
  var APP = "https://app.super.so/";
  var LOGO = '<svg class="stc-logo" width="20" height="20" viewBox="0 0 128 128" fill="none" aria-hidden="true"><path d="M0 64.0002C0 15.9999 15.9998 0 64 0C112 0 128 15.9999 128 64.0002C128 112 112 128 64 128C15.9998 128 0 112 0 64.0002Z" fill="#111111"/><path fill-rule="evenodd" clip-rule="evenodd" d="M64.7197 32.5686L40.2317 70.0172C39.4549 71.2052 40.3072 72.7809 41.7266 72.7809H54.3396H60.8434H64.1768L60.0179 95.4841C59.6667 97.4015 62.2029 98.4149 63.2697 96.7835L87.7577 59.3349C88.5345 58.1469 87.6822 56.5712 86.2628 56.5712H71.1568H67.146H63.8126L67.9715 33.868C68.3227 31.9506 65.7865 30.9372 64.7197 32.5686Z" fill="white"/></svg>';
  var SEND = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  var X = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SPARK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
  var CHIPS = [
    ["Launch it as is", "Launch " + url + " as my own site."],
    ["Use my brand colours", "Launch " + url + " as my own site and use my brand colours: #1E3A8A and #F59E0B."],
    ["Dark & calmer", "Launch " + url + " as my own site in a dark version with a calmer font."],
    ["Make it a shop", "Launch " + url + " as my own site, but make it a shop for my work."]
  ];
  var DEFAULT = "Launch " + url + " as my own site. Put in my name, swap the main colour for my brand colour and keep the layout.";
  var CSS = '#stc{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font:14px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#171717;letter-spacing:0;text-transform:none;text-align:left}'
  + '#stc *{box-sizing:border-box;font-family:inherit;letter-spacing:inherit;text-transform:none}#stc button{cursor:pointer;margin:0}'
  + '#stc .stc-badge{display:flex;align-items:center;gap:8px;background:#111;color:#fff;border:0;border-radius:999px;padding:7px 7px 7px 11px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-size:13px;font-weight:600;line-height:1}'
  + '#stc .stc-badge .stc-logo path:first-child{fill:#fff}#stc .stc-badge .stc-logo path+path{fill:#111}'
  + '#stc .stc-badge em{font-style:normal;display:inline-flex;gap:5px;align-items:center;background:#ffb400;color:#111;border-radius:999px;padding:6px 11px;font-weight:700}'
  + '#stc .stc-panel{width:340px;max-height:calc(100vh - 100px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.25);display:none}'
  + '#stc.open .stc-panel{display:block}'
  + '#stc .stc-ph{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eee;font-weight:700}'
  + '#stc .stc-ph .stc-logo path:first-child{fill:#111}#stc .stc-ph .stc-logo path+path{fill:#fff}'
  + '#stc .stc-dot{width:7px;height:7px;border-radius:50%;background:#22c55e}'
  + '#stc .stc-x{margin-left:auto;border:0;background:#f3f3f1;color:#111;border-radius:6px;padding:5px;display:flex}'
  + '#stc .stc-msgs{padding:14px;display:flex;flex-direction:column;gap:8px;background:#fafaf8}'
  + '#stc .stc-bot{background:#fff;border:1px solid #ececea;border-radius:12px 12px 12px 4px;padding:9px 11px;font-size:13.5px}'
  + '#stc .stc-bot.stc-ok{border-color:#ffd77a;background:#fff8e6}'
  + '#stc .stc-hint{font-size:12.5px;color:#555;padding:0 2px}'
  + '#stc .stc-chips{display:flex;flex-wrap:wrap;gap:6px}#stc .stc-chips button{border:1px solid #e0ddd5;background:#fff;color:#171717;border-radius:999px;padding:5px 10px;font-size:12.5px;line-height:1.3}'
  + '#stc .stc-chips button:hover,#stc .stc-chips button.on{border-color:#111;background:#111;color:#fff}'
  + '#stc .stc-inp{display:flex;gap:8px;align-items:flex-end;padding:10px 12px;border-top:1px solid #eee}'
  + '#stc textarea{flex:1;min-width:0;border:1px solid #e3e3df;border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.4;color:#171717;background:#fff;resize:none;outline:none}#stc textarea:focus{border-color:#111}'
  + '#stc .stc-send{flex:none;border:0;background:#ffb400;color:#111;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center}'
  + '#stc .stc-foot{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;color:#888;padding:0 14px 11px}#stc .stc-foot a{color:#555;text-decoration:underline}'
  + '@media (max-width:480px){#stc{right:10px;left:10px;bottom:10px}#stc .stc-panel{width:100%}}'
  + '@media print{#stc{display:none}}';
  function el(h) { var d = document.createElement("div"); d.innerHTML = h; return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function build() {
    if (document.getElementById("stc")) return;
    var st = document.createElement("style"); st.id = "stc-css"; st.textContent = CSS; document.head.appendChild(st);
    var chips = CHIPS.map(function (c) { return '<button type="button" data-p="' + esc(c[1]) + '">' + esc(c[0]) + "</button>"; }).join("");
    var get = ds.get ? '<a href="' + esc(ds.get) + '">Set it up by hand</a>' : "";
    var w = el('<div id="stc"><div class="stc-panel" role="dialog" aria-label="Super chat">'
      + '<div class="stc-ph">' + LOGO + '<span>Super chat</span><span class="stc-dot"></span><button type="button" class="stc-x" aria-label="Close">' + X + "</button></div>"
      + '<div class="stc-msgs"><div class="stc-bot">Hi! You’re looking at <b>' + esc(name) + "</b>, a Super template. Our chat can launch it as your own site in about a minute, then restyle it with you.</div>"
      + '<div class="stc-hint">Try one of these or write your own:</div><div class="stc-chips">' + chips + "</div></div>"
      + '<div class="stc-inp"><textarea rows="3" aria-label="Your prompt">' + esc(DEFAULT) + '</textarea><button type="button" class="stc-send" aria-label="Send to Super chat">' + SEND + "</button></div>"
      + '<div class="stc-foot"><span>Free to start · built on your Notion</span>' + get + "</div></div>"
      + '<button type="button" class="stc-badge" aria-expanded="false">' + LOGO + "<span>Made with Super</span><em>" + SPARK + " Get this site</em></button></div>");
    document.body.appendChild(w);
    var badge = w.querySelector(".stc-badge"), ta = w.querySelector("textarea"), msgs = w.querySelector(".stc-msgs");
    function setOpen(o) { w.classList.toggle("open", o); badge.setAttribute("aria-expanded", o ? "true" : "false"); if (o) ta.focus(); }
    badge.addEventListener("click", function () { setOpen(!w.classList.contains("open")); });
    w.querySelector(".stc-x").addEventListener("click", function () { setOpen(false); badge.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && w.classList.contains("open")) setOpen(false); });
    w.querySelectorAll(".stc-chips button").forEach(function (c) {
      c.addEventListener("click", function () {
        w.querySelectorAll(".stc-chips button").forEach(function (x) { x.classList.toggle("on", x === c); });
        ta.value = c.getAttribute("data-p"); ta.focus();
      });
    });
    w.querySelector(".stc-send").addEventListener("click", function () {
      var p = ta.value.trim() || DEFAULT;
      window.open(APP + "?ai=" + encodeURIComponent(p), "_blank", "noopener");
      var old = msgs.querySelector(".stc-ok"); if (old) old.remove();
      var m = el('<div class="stc-bot stc-ok">Super opens in a new tab with your prompt in its chat.</div>');
      msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
  /* The page shell can be rebuilt on client-side navigation; put the badge back when it disappears. */
  setInterval(function () { if (document.body && !document.getElementById("stc")) build(); }, 1500);
})();
