/* Dial - tap-to-call for Super (https://sites.super.so/dial/dial.js)
   - Phone properties of database rows become call buttons (tap or Enter dials the number).
   - Phone numbers written in a Megaphone callout (the alert banner) become tel: links.
   - A status that starts with "Open", "On call" or "Answering" gets the class dial-open (gold).
   No DOM moves, safe with client-side navigation. */
(function () {
  var NUMBER = /(\+?\d[\d ().-]{5,}\d)/g;
  var OPEN = /^\s*(open|on call|answering)\b/i;
  function digits(t) { return (t || "").replace(/[^0-9+]/g, ""); }

  function linkBanner(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (!n.parentElement.closest("a") && NUMBER.test(n.nodeValue)) nodes.push(n);
      NUMBER.lastIndex = 0;
    }
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment(), text = n.nodeValue, last = 0, m;
      NUMBER.lastIndex = 0;
      while ((m = NUMBER.exec(text))) {
        if (digits(m[1]).replace("+", "").length < 7) continue;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var a = document.createElement("a");
        a.className = "dial-tel"; a.href = "tel:" + digits(m[1]); a.textContent = m[1];
        frag.appendChild(a);
        last = m.index + m[1].length;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  function decorate() {
    document.querySelectorAll(".notion-root .notion-property__phone, .notion-page__properties .notion-property__phone").forEach(function (el) {
      if (!el.getAttribute("role")) { el.setAttribute("role", "link"); el.setAttribute("tabindex", "0"); el.setAttribute("aria-label", "Call " + el.textContent.trim()); }
    });
    document.querySelectorAll(".notion-collection-card__property-list > p:nth-child(2), .notion-collection-list__item-content > p:first-child").forEach(function (el) {
      var open = OPEN.test(el.textContent);
      if (open !== el.classList.contains("dial-open")) el.classList.toggle("dial-open", open);
    });
    document.querySelectorAll('.notion-root > .notion-callout:has(> .notion-callout__icon img[src*="/megaphone_"]) .notion-callout__content').forEach(function (el) {
      if (el.dataset.dialTel) return;
      el.dataset.dialTel = "1";
      linkBanner(el);
    });
  }

  function call(el) { var n = digits(el.textContent); if (n) window.location.href = "tel:" + n; }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest(".notion-property__phone");
    if (!el || el.closest("a[href^='tel:']")) return;
    e.preventDefault(); e.stopPropagation(); call(el);
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var el = e.target.closest && e.target.closest(".notion-property__phone");
    if (el) { e.preventDefault(); call(el); }
  }, true);

  var queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; decorate(); }); }
  function start() {
    decorate();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("routeChangeComplete", schedule);
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
})();
