
(function () {
  /************************************
    Helpers
  ************************************/

  function isMobileScrollOnly() {
    return window.matchMedia('(max-width: 520px)').matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getMarqueeSpeed() {
    if (prefersReducedMotion()) return 0;
    if (window.matchMedia('(max-width: 899px)').matches) return 18;

    return 35;
  }

  function isToolRow(row) {
    return !!row.querySelector(
      ':scope > .notion-column > .notion-callout.bg-orange-light.border'
    );
  }

  function getToolColumns(track) {
    return Array.from(
      track.querySelectorAll(
        ':scope > .notion-column:has(> .notion-callout.bg-orange-light.border)'
      )
    );
  }

  /************************************
    Cleanup
  ************************************/

  function removeOldCarouselElements(section) {
    section.querySelectorAll('.super-tools-carousel-nav').forEach(function (nav) {
      nav.remove();
    });

    section
      .querySelectorAll('[data-super-marquee-clone="true"]')
      .forEach(function (clone) {
        clone.remove();
      });
  }

  function removeMarqueeClones(track) {
    track
      .querySelectorAll('[data-super-marquee-clone="true"]')
      .forEach(function (clone) {
        clone.remove();
      });
  }

  /************************************
    Marquee Frame
  ************************************/

  function createMarqueeFrame(track) {
    const parent = track.parentElement;

    if (parent && parent.classList.contains('super-tools-marquee-frame')) {
      return parent;
    }

    if (parent && parent.classList.contains('super-tools-carousel-frame')) {
      parent.classList.remove('super-tools-carousel-frame');
      parent.classList.add('super-tools-marquee-frame');

      return parent;
    }

    const frame = document.createElement('div');
    frame.className = 'super-tools-marquee-frame';

    track.parentNode.insertBefore(frame, track);
    frame.appendChild(track);

    return frame;
  }

  /************************************
    Clones
  ************************************/

  function makeCloneUnfocusable(clone) {
    clone.setAttribute('aria-hidden', 'true');

    clone
      .querySelectorAll('a, button, input, select, textarea, [tabindex]')
      .forEach(function (element) {
        element.setAttribute('tabindex', '-1');
      });
  }

  function duplicateCards(track) {
    removeMarqueeClones(track);

    const originalColumns = getToolColumns(track).filter(function (column) {
      return column.dataset.superMarqueeClone !== 'true';
    });

    if (!originalColumns.length) return 0;

    originalColumns.forEach(function (column) {
      const clone = column.cloneNode(true);

      clone.dataset.superMarqueeClone = 'true';
      makeCloneUnfocusable(clone);

      track.appendChild(clone);
    });

    const firstClone = track.querySelector('[data-super-marquee-clone="true"]');

    if (!firstClone) return 0;

    return firstClone.offsetLeft - originalColumns[0].offsetLeft;
  }

  /************************************
    Marquee Setup
  ************************************/

  function initToolsMarquee() {
    const rows = Array.from(
      document.querySelectorAll('.notion-root .notion-column-list')
    ).filter(isToolRow);

    if (!rows.length) return;

    const processedSections = new Set();

    rows.forEach(function (row) {
      const section =
        row.closest('.notion-callout.bg-red-light.border') ||
        row.parentElement;

      if (!section || processedSections.has(section)) return;

      processedSections.add(section);

      if (section.dataset.superToolsMarqueeReady === 'true') return;

      const rowsInsideSection = Array.from(
        section.querySelectorAll('.notion-column-list')
      ).filter(isToolRow);

      if (!rowsInsideSection.length) return;

      section.dataset.superToolsMarqueeReady = 'true';

      removeOldCarouselElements(section);

      const mainTrack = rowsInsideSection[0];

      mainTrack.classList.remove('super-tools-carousel-track');
      mainTrack.classList.add('super-tools-marquee-track');

      rowsInsideSection.slice(1).forEach(function (extraRow) {
        getToolColumns(extraRow).forEach(function (column) {
          mainTrack.appendChild(column);
        });

        extraRow.remove();
      });

      const frame = createMarqueeFrame(mainTrack);

      let distance = 0;
      let offset = 0;
      let lastTime = performance.now();
      let animationFrame = null;

      /************************************
        Marquee Controls
      ************************************/

      function rebuildMarquee() {
        mainTrack.style.transform = 'translate3d(0, 0, 0)';

        offset = 0;
        distance = 0;

        removeMarqueeClones(mainTrack);

        if (isMobileScrollOnly()) {
          frame.scrollLeft = 0;
          return;
        }

        distance = duplicateCards(mainTrack);
      }

      function shouldAnimate() {
        return !isMobileScrollOnly() && !prefersReducedMotion() && distance > 0;
      }

      function animate(currentTime) {
        if (!shouldAnimate()) {
          animationFrame = null;
          mainTrack.style.transform = 'translate3d(0, 0, 0)';
          return;
        }

        const delta = currentTime - lastTime;
        const speed = getMarqueeSpeed();

        lastTime = currentTime;
        offset += (speed * delta) / 1000;

        if (offset >= distance) {
          offset = offset % distance;
        }

        mainTrack.style.transform = 'translate3d(' + -offset + 'px, 0, 0)';

        animationFrame = requestAnimationFrame(animate);
      }

      function restartMarquee() {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }

        rebuildMarquee();

        if (!shouldAnimate()) return;

        lastTime = performance.now();
        animationFrame = requestAnimationFrame(animate);
      }

      restartMarquee();

      window.addEventListener('resize', restartMarquee);

      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
          restartMarquee();
        }
      });

      window.addEventListener('pageshow', restartMarquee);
    });
  }

  /************************************
    Init
  ************************************/

  initToolsMarquee();

  const observer = new MutationObserver(function () {
    initToolsMarquee();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
