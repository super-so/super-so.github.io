/* Dossier press kit template for Super: https://sites.super.so/dossier/dossier.js
   (1) "Copy" buttons on the boilerplate cards (first line ends in "words") and "Copy hex" on the colour cards
       (second line is a hex value); each colour card also takes its swatch colour from that hex value.
   (2) A sticky "Download all" pill on desktop that links to the page's own zip file block; no zip block, no pill. */
(function () {
  function sectionCards(icon) {
    return document.querySelectorAll('.notion-root > .notion-callout:has(> .notion-callout__icon img[src*="/' + icon + '_"]) > .notion-callout__content > .notion-callout');
  }
  function copyText(btn, text, label) {
    var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done();
  }
  function addCopy() {
    sectionCards("book").forEach(function (card) {
      var ps = card.querySelectorAll(":scope > .notion-callout__content > p.notion-text");
      if (ps.length < 2) return;
      var first = ps[0].textContent.trim(), second = ps[1].textContent.trim(), text, label;
      if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(second)) card.style.setProperty("--chip", second);
      if (card.querySelector(".d-copy")) return;
      if (/words$/i.test(first)) { text = Array.prototype.slice.call(ps, 1).map(function (p) { return p.textContent.trim(); }).join("\n\n"); label = "Copy"; }
      else if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(second)) { text = second; label = "Copy hex"; }
      else return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "d-copy"; b.textContent = label;
      b.addEventListener("click", function (e) { e.preventDefault(); copyText(b, text, label); });
      card.appendChild(b);
    });
  }
  function zipBlock() { return document.querySelector('.notion-root a.notion-file[href*=".zip"]'); }
  function addPill() {
    var own = zipBlock();
    var pill = document.querySelector(".d-pill");
    if (!own) { if (pill) pill.classList.remove("is-on"); return; }
    if (!pill) {
      pill = document.createElement("a");
      pill.className = "d-pill"; pill.target = "_blank"; pill.rel = "noopener";
      pill.textContent = "↓  Download all";
      document.body.appendChild(pill);
      window.addEventListener("scroll", toggle, { passive: true });
    }
    pill.href = own.href;
    toggle();
  }
  function toggle() {
    var pill = document.querySelector(".d-pill"), own = zipBlock();
    if (!pill) return;
    pill.classList.toggle("is-on", !!own && own.getBoundingClientRect().bottom <= 0);
  }
  function run() { addCopy(); addPill(); }
  run();
  var t;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 120); }).observe(document.body, { childList: true, subtree: true });
})();
