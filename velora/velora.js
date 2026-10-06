(() => {
  if (window.__superSeamlessCalloutMarquee) return;
  window.__superSeamlessCalloutMarquee = true;

  const TARGET_CALLOUT = '.notion-callout.bg-brown-light';
  const TARGET_ROW = '.notion-column-list';

  const marqueeMap = new WeakMap();

  function isTargetRow(row) {
    return row && row.matches(TARGET_ROW) && row.querySelector(TARGET_CALLOUT);
  }

  function getDirectColumns(row) {
    return Array.from(row.children).filter(el => el.classList && el.classList.contains('notion-column'));
  }

  function getOriginalColumns(row) {
    return getDirectColumns(row).filter(col => col.dataset.marqueeClone !== '1' && col.querySelector(TARGET_CALLOUT));
  }

  function getGap(row) {
    const cs = getComputedStyle(row);
    const gap = parseFloat(cs.gap || cs.columnGap || '0');
    return Number.isFinite(gap) ? gap : 0;
  }

  function measureSetWidth(row, originals) {
    const gap = getGap(row);
    if (!originals.length) return 0;

    let width = 0;
    originals.forEach((col, i) => {
      width += col.getBoundingClientRect().width;
      if (i < originals.length - 1) width += gap; // gaps inside original set
    });

    width += gap; // boundary gap between original set and cloned set
    return width;
  }

  function getDurationSeconds() {
    if (window.matchMedia('(max-width: 768px)').matches) return 18;   // match your CSS
    if (window.matchMedia('(max-width: 1024px)').matches) return 22;  // match your CSS
    return 24;                                                        // match your CSS
  }

  function initRow(row) {
    if (!isTargetRow(row) || row.dataset.seamlessMarqueeReady === '1') return;

    const originals = getOriginalColumns(row);
    if (originals.length < 2) return;

    row.dataset.seamlessMarqueeReady = '1';

    // Disable CSS keyframe animation (we'll animate via JS for a true seamless loop)
    row.style.setProperty('animation', 'none', 'important');
    row.style.setProperty('transform', 'translate3d(0,0,0)', 'important');
    row.style.setProperty('will-change', 'transform', 'important');

    // Wrap row in a viewport (clips clones cleanly)
    const viewport = document.createElement('div');
    viewport.className = 'super-seamless-marquee-viewport';
    viewport.style.overflow = 'hidden';
    viewport.style.width = '100%';
    viewport.style.position = 'relative';

    row.parentNode.insertBefore(viewport, row);
    viewport.appendChild(row);

    let paused = false;
    let rafId = null;
    let lastTs = 0;
    let offset = 0;
    let setWidth = 0;
    let resizeTimer = null;

    function removeClones() {
      getDirectColumns(row).forEach(col => {
        if (col.dataset.marqueeClone === '1') col.remove();
      });
    }

    function rebuild() {
      removeClones();
      offset = 0;
      row.style.setProperty('transform', 'translate3d(0,0,0)', 'important');

      const originalsNow = getOriginalColumns(row);
      if (!originalsNow.length) return;

      setWidth = measureSetWidth(row, originalsNow);
      if (!setWidth) return;

      // Clone until the track is long enough to cover the viewport while looping
      const neededWidth = viewport.clientWidth + setWidth * 2;
      while (row.scrollWidth < neededWidth) {
        originalsNow.forEach(col => {
          const clone = col.cloneNode(true);
          clone.dataset.marqueeClone = '1';
          clone.setAttribute('aria-hidden', 'true');
          // cloned cards should not be interactive
          clone.style.pointerEvents = 'none';
          row.appendChild(clone);
        });
      }
    }

    function tick(ts) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        row.style.setProperty('transform', 'translate3d(0,0,0)', 'important');
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!paused && setWidth > 0) {
        const duration = getDurationSeconds();
        const pxPerSec = setWidth / duration;

        offset += (pxPerSec * dt) / 1000;
        if (offset >= setWidth) offset -= setWidth;

        row.style.setProperty('transform', `translate3d(${-offset}px,0,0)`, 'important');
      }

      rafId = requestAnimationFrame(tick);
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        rebuild();
      }, 120);
    }

    viewport.addEventListener('mouseenter', () => { paused = true; });
    viewport.addEventListener('mouseleave', () => { paused = false; });
    viewport.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    viewport.addEventListener('touchend', () => { paused = false; }, { passive: true });

    window.addEventListener('resize', onResize);

    const start = () => {
      rebuild();
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      setTimeout(start, 400);
    }

    marqueeMap.set(row, {
      rebuild,
      stop() {
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }

  function scan() {
    document.querySelectorAll(TARGET_ROW).forEach(row => {
      if (row.closest('.super-seamless-marquee-viewport')) return;
      if (isTargetRow(row)) initRow(row);
    });
  }

  // Init now
  scan();

  // Re-scan if Super re-renders blocks
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();

