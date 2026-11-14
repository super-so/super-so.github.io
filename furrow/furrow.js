/* Furrow phase ribbon (https://sites.super.so/furrow/furrow.js)
   A five-step strip at the top of every page that marks where the programme is now.
   Configure it in the Body slot BEFORE this script, for example:
   <script>window.furrowRibbon = { label: "Your programme · five phases, 2025 to 2029", phases: [
     { y: "2025", n: "Riverside", s: "Done", href: "/phases/phase-1" }, ... ] };</script>
   s is Done, Now or Planned. Without a config the demo phases below are used.
   The page's own phase is marked from the path /phases/phase-N or from a "Phase N" property of a database row. */
(function () {
  var DEFAULT = {
    label: "Greenways Brenmoor · five phases, 2025 to 2029",
    phases: [
      { y: "2025", n: "Riverside", s: "Done", href: "/phases/phase-1" },
      { y: "2026", n: "Old Town", s: "Now", href: "/phases/phase-2" },
      { y: "2027", n: "Northfield", s: "Planned", href: "/phases/phase-3" },
      { y: "2028", n: "Market Hill", s: "Planned", href: "/phases/phase-4" },
      { y: "2029", n: "Eastgate", s: "Planned", href: "/phases/phase-5" }
    ]
  };

  function config() {
    var c = window.furrowRibbon || {};
    return { label: c.label || DEFAULT.label, phases: (c.phases && c.phases.length) ? c.phases : DEFAULT.phases };
  }

  function current(phases) {
    var path = location.pathname.replace(/\/$/, "");
    for (var i = 0; i < phases.length; i++) {
      if (phases[i].href && path === phases[i].href.replace(/\/$/, "")) return i + 1;
    }
    var m = path.match(/\/phase-(\d+)$/);
    if (m) return +m[1];
    var props = document.querySelector(".notion-page__properties");
    if (props) {
      var t = props.textContent.match(/Phase (\d+)/);
      if (t) return +t[1];
    }
    return 0;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function build() {
    var c = config();
    var nav = el("nav", "furrow-ribbon");
    nav.setAttribute("aria-label", "Programme phases");
    nav.appendChild(el("p", "furrow-ribbon__label", c.label));
    var ol = el("ol", "furrow-ribbon__list");
    var here = current(c.phases);
    c.phases.forEach(function (p, i) {
      var s = (p.s || "Planned").toLowerCase();
      var li = el("li", "furrow-ribbon__item is-" + s + (here === i + 1 ? " is-here" : ""));
      var a = el("a");
      a.href = p.href || "#";
      a.appendChild(el("span", "furrow-ribbon__year", p.y));
      a.appendChild(el("span", "furrow-ribbon__name", p.n));
      a.appendChild(el("span", "furrow-ribbon__status", s === "now" ? "We are here" : p.s));
      li.appendChild(a);
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    return nav;
  }

  var key = null, queued = false;
  function mount() {
    queued = false;
    var main = document.querySelector("main.super-content");
    var root = document.querySelector("article.notion-root");
    if (!main || !root) return;
    var k = root.id + location.pathname;
    var has = main.querySelector(":scope > .furrow-ribbon");
    if (has && key === k) return;
    if (has) has.remove();
    main.insertBefore(build(), main.firstChild);
    key = k;
  }
  function soon() { if (!queued) { queued = true; requestAnimationFrame(mount); } }
  function start() {
    mount();
    document.addEventListener("routeChangeComplete", soon);
    window.addEventListener("popstate", soon);
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
