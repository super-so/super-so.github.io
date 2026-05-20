function openToggles() {
  document.querySelectorAll(".notion-toggle.closed .notion-toggle__content").forEach(function (content) {
    content.style.setProperty("display", "block", "important");
  });
}

var interval = setInterval(openToggles, 100);
setTimeout(function () { clearInterval(interval); }, 5000);

var pendingToggles = new Map();

var globalObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    var toggle = mutation.target;
    if (!toggle.classList.contains("notion-toggle")) return;

    var content = toggle.querySelector(".notion-toggle__content");
    if (!content) return;

    if (pendingToggles.has(toggle)) {
      clearTimeout(pendingToggles.get(toggle));
    }

    var timer = setTimeout(function () {
      pendingToggles.delete(toggle);
      clearInterval(interval);
      if (toggle.classList.contains("open")) {
        content.style.setProperty("display", "none", "important");
      } else {
        content.style.setProperty("display", "block", "important");
      }
    }, 50);

    pendingToggles.set(toggle, timer);
  });
});

// Waiting for toggles
var domInterval = setInterval(function () {
  var toggles = document.querySelectorAll(".notion-toggle");
  if (toggles.length > 0) {
    toggles.forEach(function (toggle) {
      globalObserver.observe(toggle, { attributes: true, attributeFilter: ["class"] });
    });
    clearInterval(domInterval);
  }
}, 100);
