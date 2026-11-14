/* Rubric handbook script (https://sites.super.so/rubric/rubric.js)
   1. Keeps every chapter of the sidebar open, so all chapters show their pages.
   2. Numbers the handbook from the sidebar order: chapter N on the chapter page (the first link of a
      sidebar group, or a single sidebar link), N.M on the other pages of the group. The stylesheet shows
      the numbers before the page title, the section headings and the page lists.
   3. Copies the first sidebar button (Navigation > Sidebar > Call to action) into the Notion-style navbar,
      which has no button of its own.
   Runs after hydration and again after client-side navigation. Without the script the site still works,
   only the numbers and the navbar button are missing. */
(function () {
  if (window.__rubricDone) return;
  window.__rubricDone = true;

  function norm(href) {
    try { var p = new URL(href, location.href).pathname; } catch (e) { return ''; }
    return p.replace(/\/+$/, '') || '/';
  }

  function openChapters() {
    var hs = document.querySelectorAll('.super-sidebar .super-navigation-menu__list-header[data-state="closed"]');
    for (var i = 0; i < hs.length; i++) hs[i].click();
  }

  function numbers() {
    var main = document.querySelector('main.super-content');
    var items = document.querySelector('.super-sidebar .super-navigation-menu__items');
    if (!main || !items) return;
    var here = norm(location.href), ch = 0, found = null;
    for (var i = 0; i < items.children.length && !found; i++) {
      var el = items.children[i];
      if (el.matches('a.super-navigation-menu__item')) {
        ch++;
        if (norm(el.href) === here) found = { ch: ch };
      } else if (el.matches('.super-navigation-menu__list')) {
        ch++;
        var links = el.querySelectorAll('.super-navigation-menu__list-items a.super-navigation-menu__item');
        if (!links.length) continue;
        var first = norm(links[0].href), hub = true;
        for (var k = 1; k < links.length; k++) if (norm(links[k].href).indexOf(first + '/') !== 0) hub = false;
        var m = 0;
        for (var j = 0; j < links.length; j++) {
          var p = norm(links[j].href);
          if (j === 0 && hub) { if (p === here) { found = { ch: ch }; break; } continue; }
          m++;
          if (p === here) { found = { ch: ch, n: ch + '.' + m }; break; }
        }
      }
    }
    var key = found ? (found.n || found.ch) + '' : '';
    if (main.getAttribute('data-rubric') === key + '@' + here) return;
    main.setAttribute('data-rubric', key + '@' + here);
    main.style.removeProperty('--ch'); main.style.removeProperty('--n');
    if (!found || here === '/') return;
    main.style.setProperty('--ch', '"' + found.ch + '"');
    if (found.n) main.style.setProperty('--n', '"' + found.n + '"');
  }

  function addCta() {
    var bar = document.querySelector('.notion-navbar__actions');
    var src = document.querySelector('.super-sidebar .super-navigation-menu__cta a');
    if (!bar || !src || bar.querySelector('.rubric-cta')) return;
    var a = document.createElement('a');
    a.className = 'rubric-cta';
    a.href = src.getAttribute('href');
    if (src.target) { a.target = src.target; a.rel = 'noopener'; }
    a.textContent = (src.textContent || '').trim();
    bar.appendChild(a);
  }

  function run() { openChapters(); numbers(); addCta(); }
  var n = 0;
  var t = setInterval(function () { run(); if (++n > 20) clearInterval(t); }, 300);
  var last = location.pathname;
  new MutationObserver(function () {
    if (location.pathname !== last) { last = location.pathname; n = 0; }
    numbers(); addCta();
  }).observe(document.body, { childList: true, subtree: true });
})();
