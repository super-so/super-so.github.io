/* Satchel template for Super (satchel-template.super.site): a personal page tile whose label reads
   "days until <d> <Month> <yyyy>" (for example "days until 4 January 2027") counts down from today;
   the number above the label is replaced, and after the date it counts the days since. */
(function () {
  if (window.__satchel) return; window.__satchel = true;
  var M = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  function countdown() {
    var ps = document.querySelectorAll(".notion-root .notion-callout p.notion-text");
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i]; if (p.dataset.sc) continue;
      var m = p.textContent.trim().match(/^days? until (\d{1,2}) ([A-Za-z]+) (\d{4})$/);
      if (!m || M.indexOf(m[2].toLowerCase()) < 0) continue;
      var start = new Date(+m[3], M.indexOf(m[2].toLowerCase()), +m[1]);
      var now = new Date(); now.setHours(0, 0, 0, 0);
      var d = Math.round((start - now) / 864e5);
      var v = p.previousElementSibling; while (v && v.tagName !== "P") v = v.previousElementSibling;
      p.dataset.sc = "1";
      if (!v) continue;
      if (d > 0) { v.textContent = String(d); p.textContent = (d === 1 ? "day until " : "days until ") + m[1] + " " + m[2] + " " + m[3]; }
      else if (d === 0) { v.textContent = "Today"; p.textContent = "is your first day"; }
      else { v.textContent = String(-d); p.textContent = (d === -1 ? "day" : "days") + " since you started"; }
    }
  }
  countdown(); setInterval(countdown, 800);
})();
