(function () {
  if (window.__appleGalleryControlsV7) return;
  window.__appleGalleryControlsV7 = true;

  let observerFrame = null;

  function setupAppleGallery() {
    cleanupDuplicateAppleGalleries();

    const galleries = document.querySelectorAll('.notion-collection-gallery.small');

    galleries.forEach(function (gallery) {
      const root = getCollectionRoot(gallery);
      const existingWrap = gallery.closest('.apple-gallery-wrap');

      if (root && hasVisibleNonGalleryView(root, gallery)) {
        if (existingWrap) existingWrap.style.display = 'none';
        return;
      }

      if (existingWrap) {
        existingWrap.setAttribute('dir', 'ltr');
        existingWrap.style.display = '';
        gallery.style.direction = 'ltr';
        setupControls(existingWrap, gallery);
        return;
      }

      if (!gallery.parentNode) return;

      const oldWrap = root ? root.querySelector('.apple-gallery-wrap') : null;

      if (oldWrap && !oldWrap.contains(gallery)) {
        oldWrap.remove();
      }

      const wrap = document.createElement('div');
      wrap.className = 'apple-gallery-wrap';
      wrap.setAttribute('dir', 'ltr');

      gallery.parentNode.insertBefore(wrap, gallery);
      wrap.appendChild(gallery);

      gallery.style.direction = 'ltr';

      wrap.appendChild(createArrow('prev', 'Scroll left', 'M15 5L8 12L15 19'));
      wrap.appendChild(createArrow('next', 'Scroll right', 'M9 5L16 12L9 19'));

      setupControls(wrap, gallery);
    });

    cleanupDuplicateAppleGalleries();
  }

  function cleanupDuplicateAppleGalleries() {
    const roots = document.querySelectorAll('.notion-collection, .notion-block');

    roots.forEach(function (root) {
      const wraps = Array.from(root.querySelectorAll('.apple-gallery-wrap'));

      if (wraps.length <= 1) return;

      const visibleWraps = wraps.filter(isVisible);
      const keep = visibleWraps[visibleWraps.length - 1] || wraps[wraps.length - 1];

      wraps.forEach(function (wrap) {
        if (wrap !== keep) wrap.remove();
      });
    });
  }

  function getCollectionRoot(element) {
    return (
      element.closest('.notion-collection') ||
      element.closest('.notion-block') ||
      element.parentElement
    );
  }

  function hasVisibleNonGalleryView(root, gallery) {
    const otherViews = root.querySelectorAll(
      '.notion-collection-table, ' +
      '.notion-table-view, ' +
      '.notion-collection-list, ' +
      '.notion-list-view, ' +
      '.notion-collection-board, ' +
      '.notion-board-view, ' +
      '.notion-collection-calendar, ' +
      '.notion-calendar-view, ' +
      '.notion-collection-timeline, ' +
      '.notion-timeline-view, ' +
      '.notion-collection-feed, ' +
      '.notion-feed-view, ' +
      '.notion-feed'
    );

    return Array.from(otherViews).some(function (view) {
      if (view.contains(gallery)) return false;
      return isVisible(view);
    });
  }

  function isVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  function createArrow(direction, label, path) {
    const button = document.createElement('button');

    button.className = 'apple-gallery-arrow ' + direction;
    button.type = 'button';
    button.setAttribute('aria-label', label);

    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '</svg>';

    return button;
  }

  function setupControls(wrap, gallery) {
    const prev = wrap.querySelector('.apple-gallery-arrow.prev');
    const next = wrap.querySelector('.apple-gallery-arrow.next');

    if (!prev || !next) return;

    if (gallery.dataset.appleGalleryReady !== 'true') {
      gallery.dataset.appleGalleryReady = 'true';

      prev.addEventListener('click', function () {
        gallery.scrollBy({
          left: -getScrollAmount(gallery),
          behavior: 'smooth'
        });
      });

      next.addEventListener('click', function () {
        gallery.scrollBy({
          left: getScrollAmount(gallery),
          behavior: 'smooth'
        });
      });

      gallery.addEventListener('scroll', function () {
        updateArrows(gallery, prev, next);
      }, { passive: true });

      window.addEventListener('resize', function () {
        updateArrows(gallery, prev, next);
      });
    }

    setTimeout(function () {
      updateArrows(gallery, prev, next);
    }, 300);

    setTimeout(function () {
      updateArrows(gallery, prev, next);
    }, 1000);
  }

  function getScrollAmount(gallery) {
    return Math.max(260, gallery.clientWidth * 0.75);
  }

  function updateArrows(gallery, prev, next) {
    const maxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const currentScroll = Math.max(0, gallery.scrollLeft);
    const tolerance = 4;

    prev.classList.toggle('is-disabled', currentScroll <= tolerance);
    next.classList.toggle('is-disabled', currentScroll >= maxScroll - tolerance);
  }

  function scheduleSetup() {
    if (observerFrame) return;

    observerFrame = window.requestAnimationFrame(function () {
      observerFrame = null;
      setupAppleGallery();
    });
  }

  function start() {
    setupAppleGallery();

    const observer = new MutationObserver(scheduleSetup);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-selected']
    });
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();
