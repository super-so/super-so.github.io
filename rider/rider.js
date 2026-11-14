/* Rider - press kit template for Super (rider-template.super.site)
   Tour-date rows read like a gig poster: "November 21, 2026" becomes "21 Nov" with the year set small.
   Works on every list view of a database with a Date property; runs again when Super swaps pages. */
(function () {
  if (window.__riderDates) return; window.__riderDates = true;
  var M = { January: "Jan", February: "Feb", March: "Mar", April: "Apr", May: "May", June: "Jun", July: "Jul", August: "Aug", September: "Sep", October: "Oct", November: "Nov", December: "Dec" };
  function fmt() {
    var ds = document.querySelectorAll(".notion-collection-list__item .notion-property__date .date:not([data-rider])");
    for (var i = 0; i < ds.length; i++) {
      var m = ds[i].textContent.trim().match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
      ds[i].setAttribute("data-rider", "1");
      if (!m || !M[m[1]]) continue;
      ds[i].innerHTML = m[2] + " " + M[m[1]] + "<i>" + m[3] + "</i>";
    }
  }
  fmt();
  new MutationObserver(fmt).observe(document.body, { childList: true, subtree: true });
})();
