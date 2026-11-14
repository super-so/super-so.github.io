/* Lodestar - milestone progress for Super (https://sites.super.so/lodestar/lodestar.js)
   - Roadmap list grouped by a select (Milestone): Super lists the groups alphabetically, so the script puts
     them in version order (v1.0, v1.1, v1.2 ...; groups that are not a version number go last) and counts
     the rows with a "Done" pill to draw the progress bar and the "67% · 4 of 6 done" line of each group.
   - Milestone cards (a callout inside a callout with a line that starts with "NN%"): the bar follows that number.
   No DOM moves, safe with client-side navigation. */
(function () {
  if (window.__lodestar) return; window.__lodestar = true;
  function decorate() {
    var secs = document.querySelectorAll(".notion-collection-group__section");
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var head = s.querySelector(".notion-collection-group__section-header");
      var pill = head && head.querySelector(".notion-pill");
      if (!pill || head.dataset.v) continue;
      var name = pill.textContent.trim();
      var rows = s.querySelectorAll(".notion-collection-list__item, .notion-collection-card");
      var done = 0;
      for (var r = 0; r < rows.length; r++) {
        var ps = rows[r].querySelectorAll(".notion-pill");
        for (var k = 0; k < ps.length; k++) if (ps[k].textContent.trim() === "Done") { done++; break; }
      }
      var n = rows.length, p = n ? Math.round(100 * done / n) : 0;
      var isVersion = /^v?\d/i.test(name);
      head.dataset.v = isVersion ? name.replace(/^v/i, "") : name;
      pill.dataset.meta = isVersion ? (p + "% · " + done + " of " + n + " done") : (n + (n === 1 ? " idea" : " ideas") + " · no date");
      s.style.setProperty("--p", (isVersion ? p : 0) + "%");
      s.classList.add("lodestar-ms");
      if (!isVersion) s.classList.add("lodestar-ms--someday");
      var parts = name.replace(/^v/i, "").split(".");
      s.style.order = isVersion ? String((parseInt(parts[0], 10) || 0) * 10000 + (parseInt(parts[1], 10) || 0) * 100 + (parseInt(parts[2], 10) || 0)) : "999999";
    }
    var cards = document.querySelectorAll(".notion-callout .notion-callout");
    for (var c = 0; c < cards.length; c++) {
      var card = cards[c];
      if (card.classList.contains("lodestar-card")) continue;
      var lines = card.querySelectorAll(":scope > .notion-callout__content > p.notion-text");
      for (var l = 0; l < lines.length; l++) {
        var m = lines[l].textContent.trim().match(/^(\d{1,3})%/);
        if (m) {
          card.style.setProperty("--p", Math.min(100, parseInt(m[1], 10)) + "%");
          lines[l].classList.add("lodestar-progress");
          card.classList.add("lodestar-card");
          var first = card.querySelector(":scope > .notion-callout__content > span.notion-semantic-string:empty + p.notion-text");
          if (first && !/^\d/.test(first.textContent.trim())) card.classList.add("lodestar-card--word");
          break;
        }
      }
    }
  }
  decorate();
  var t = null;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(decorate, 80); }).observe(document.body, { childList: true, subtree: true });
})();
