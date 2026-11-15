/* Liftoff: marks the current docs page in the sidebar (class liftoff-active). Runs after hydration and after client-side navigation.
   https://sites.super.so/liftoff/liftoff.js */
(function () {
  if (window.__liftoff) return; window.__liftoff = true;
  function mark() {
    var path = location.pathname.replace(/\/$/, '') || '/';
    var links = document.querySelectorAll('.super-sidebar a.super-navigation-menu__item');
    for (var i = 0; i < links.length; i++) {
      var h = (links[i].getAttribute('href') || '').replace(/\/$/, '');
      links[i].classList.toggle('liftoff-active', h === path);
    }
  }
  function start() {
    mark();
    document.addEventListener('routeChangeComplete', function () { setTimeout(mark, 50); });
    new MutationObserver(function () {
      if (!document.querySelector('.super-sidebar a.super-navigation-menu__item:not(.liftoff-seen)')) return;
      var a = document.querySelectorAll('.super-sidebar a.super-navigation-menu__item');
      for (var i = 0; i < a.length; i++) a[i].classList.add('liftoff-seen');
      mark();
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
