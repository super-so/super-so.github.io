/* Notch - release dates for Super (https://sites.super.so/notch/notch.js)
   - Date properties read "10 NOV 2026": the day goes into <b>, month and year into <span>, so the stylesheet
     can set the large day number on the release timeline.
   - Screenshots in list views load at a readable width instead of a thumbnail.
   No DOM moves, safe with client-side navigation. */
(function () {
  if (window.__notch) return; window.__notch = true;
  var M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function run() {
    var ds = document.querySelectorAll(".notion-property__date .date:not([data-n])");
    for (var i = 0; i < ds.length; i++) {
      var m = ds[i].textContent.trim().match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
      ds[i].setAttribute("data-n", "1");
      var k = m ? M.indexOf(m[1]) : -1;
      if (k < 0) continue;
      ds[i].innerHTML = "<b>" + m[2] + "</b> <span>" + m[1].slice(0, 3).toUpperCase() + " " + m[3] + "</span>";
    }
    var im = document.querySelectorAll(".notion-collection-list__item .notion-property__file img:not([data-n])");
    for (var j = 0; j < im.length; j++) { im[j].setAttribute("data-n", "1"); im[j].setAttribute("sizes", "(max-width: 720px) 92vw, 720px"); }
  }
  run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
})();
