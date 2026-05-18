(function () {
  if (window.SuperFloatingAutoToc && window.SuperFloatingAutoToc.destroy) {
    window.SuperFloatingAutoToc.destroy();
  }

  const CONFIG = {
    headingSelector: '.notion-heading',
    minHeadings: 2,
    buildDelay: 250,
    activeScrollDelay: 1800,
    headingHighlightDuration: 1400,

    titleSelectors: [
      '.notion-header__title',
      '.notion-page__title',
      '.notion-page-title',
      '.notion-title',
      'h1.notion-heading'
    ],

    coverSelectors: [
      '.notion-header__cover',
      '.notion-cover',
      '.notion-page-cover',
      '.notion-page__cover',
      '[class*="cover"]'
    ],

    excludeClosest: [
      '.super-floating-toc',
      '.notion-table-of-contents',
      '.notion-header',
      '.super-navbar',
      '.super-footer',
      '.notion-collection',
      '.notion-collection-card',
      '.notion-collection-list',
      '.notion-collection-table'
    ]
  };

  let currentToc = null;
  let buildTimer = null;
  let positionFrame = null;
  let activeScrollFrame = null;
  let mutationObserver = null;
  let currentSignature = '';
  let trackedHeadings = [];

  let clickedActiveId = '';
  let clickedActiveTimer = null;
  let headingHighlightTimer = null;

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function slugify(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getDocumentTop(element) {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function getDocumentBottom(element) {
    return element.getBoundingClientRect().bottom + window.scrollY;
  }

  function readCssNumber(name, fallback) {
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name);

    const number = parseFloat(value);

    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function isHoverDevice() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function isMobileToc() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function isVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function isNavigationLike(element) {
    return Boolean(
      element.closest(
        'nav, [role="navigation"], .super-navbar, [class*="super-navbar"], [class*="navbar"], [class*="navigation"]'
      )
    );
  }

  function shouldExcludeHeading(element) {
    return CONFIG.excludeClosest.some((selector) => element.closest(selector));
  }

  function getHeadingLevel(element) {
    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    const className = typeof element.className === 'string' ? element.className : '';

    if (tagName === 'h1') return 0;
    if (tagName === 'h2') return 1;
    if (tagName === 'h3') return 2;
    if (tagName === 'h4') return 3;

    const levelMatch =
      className.match(/heading[-_ ]?([1234])/i) ||
      className.match(/h[-_ ]?([1234])/i);

    if (levelMatch) {
      return Math.max(0, Math.min(Number(levelMatch[1]) - 1, 3));
    }

    return 0;
  }

  function ensureHeadingId(element, text, index) {
    if (element.id) return element.id;

    const baseSlug = slugify(text) || `section-${index + 1}`;
    let id = `super-toc-${baseSlug}`;
    let count = 2;

    while (document.getElementById(id)) {
      id = `super-toc-${baseSlug}-${count}`;
      count += 1;
    }

    element.id = id;
    element.classList.add('super-floating-toc-target');

    return id;
  }

  function getHeadings() {
    const headings = Array.from(document.querySelectorAll(CONFIG.headingSelector));
    const seen = new Set();

    return headings
      .map((heading, index) => {
        const text = cleanText(heading.textContent);

        if (!text || shouldExcludeHeading(heading) || !isVisible(heading)) {
          return null;
        }

        const id = ensureHeadingId(heading, text, index);
        const level = getHeadingLevel(heading);
        const key = `${id}|${text}`;

        if (seen.has(key)) return null;
        seen.add(key);

        return {
          id,
          text,
          level,
          element: heading
        };
      })
      .filter(Boolean);
  }

  function getLineWidth(level) {
    if (level === 1) return '18px';
    if (level === 2) return '14px';
    if (level >= 3) return '11px';
    return '22px';
  }

  function getCoverBottom() {
    const candidates = [];

    CONFIG.coverSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!isVisible(element) || isNavigationLike(element)) return;

        const rect = element.getBoundingClientRect();
        const isLargeCover =
          rect.width >= window.innerWidth * 0.45 &&
          rect.height >= 80 &&
          rect.top < window.innerHeight * 1.8;

        if (isLargeCover) {
          candidates.push(getDocumentBottom(element));
        }
      });
    });

    return candidates.length ? Math.max.apply(null, candidates) : 0;
  }

  function findTitleAnchor(headings) {
    const firstHeadingElement = headings[0] ? headings[0].element : null;
    const firstHeadingTop = firstHeadingElement ? getDocumentTop(firstHeadingElement) : Infinity;
    const coverBottom = getCoverBottom();

    const candidates = [];

    CONFIG.titleSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const text = cleanText(element.textContent);

        if (!text || !isVisible(element) || isNavigationLike(element)) return;

        const top = getDocumentTop(element);

        if (coverBottom && top < coverBottom - 20) return;
        if (firstHeadingTop !== Infinity && top > firstHeadingTop + 120) return;

        candidates.push({
          element,
          top
        });
      });
    });

    candidates.sort((a, b) => a.top - b.top);

    if (candidates[0]) {
      return candidates[0].element;
    }

    return firstHeadingElement || null;
  }

  function getStickyTop() {
    const minTop = readCssNumber('--floating-toc-sticky-min-top', 220);
    const maxTop = readCssNumber('--floating-toc-sticky-max-top', 320);
    const vhAmount = readCssNumber('--floating-toc-sticky-vh', 34);

    return clamp(window.innerHeight * (vhAmount / 100), minTop, maxTop);
  }

  function ensureMobileBehaviorStyle() {
    if (document.getElementById('super-floating-toc-mobile-behavior-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'super-floating-toc-mobile-behavior-style';

    style.textContent = `
      @media (max-width: 768px) {
        .super-floating-toc__panel {
          width: min(230px, calc(100vw - 28px)) !important;
          max-height: 46vh !important;
          padding: 12px 13px !important;
        }

        .super-floating-toc__list {
          gap: 2px !important;
        }

        .super-floating-toc__item {
          margin-left: calc(var(--toc-indent, 0px) * 0.58) !important;
          padding: 4px 6px !important;
          font-size: 12.75px !important;
          line-height: 1.3 !important;
        }

        .super-floating-toc.is-mobile-force-closed .super-floating-toc__panel,
        .super-floating-toc.is-mobile-force-closed:hover .super-floating-toc__panel,
        .super-floating-toc.is-mobile-force-closed:focus-within .super-floating-toc__panel {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(10px) scale(0.98) !important;
        }

        .super-floating-toc.is-mobile-force-closed .super-floating-toc__button,
        .super-floating-toc.is-mobile-force-closed:hover .super-floating-toc__button,
        .super-floating-toc.is-mobile-force-closed:focus-within .super-floating-toc__button {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }

        .super-floating-toc.is-open:not(.is-mobile-force-closed) .super-floating-toc__panel {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) scale(1) !important;
        }

        .super-floating-toc.is-open:not(.is-mobile-force-closed) .super-floating-toc__button {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function blurActiveTocElement(toc) {
    const activeElement = document.activeElement;

    if (
      activeElement &&
      toc &&
      toc.contains(activeElement) &&
      typeof activeElement.blur === 'function'
    ) {
      activeElement.blur();
    }
  }

  function forceCloseMobileToc(toc) {
    if (!toc || !isMobileToc()) return;

    toc.classList.remove('is-open');
    toc.classList.add('is-mobile-force-closed');
    blurActiveTocElement(toc);

    window.setTimeout(function () {
      toc.classList.remove('is-open');
      toc.classList.add('is-mobile-force-closed');
      blurActiveTocElement(toc);
    }, 60);

    window.setTimeout(function () {
      toc.classList.remove('is-open');
      toc.classList.add('is-mobile-force-closed');
      blurActiveTocElement(toc);
    }, 180);
  }

  function prepareToOpenToc(toc) {
    if (!toc) return;

    toc.classList.remove('is-mobile-force-closed');
  }

  function updateFloatingTocPosition() {
    if (!currentToc) return;

    if (isMobileToc()) {
      document.documentElement.style.removeProperty('--floating-toc-auto-top');
      currentToc.classList.remove('is-before-content');
      return;
    }

    const headings = getHeadings();
    const anchor = findTitleAnchor(headings);

    if (!anchor) {
      document.documentElement.style.removeProperty('--floating-toc-auto-top');
      currentToc.classList.remove('is-before-content');
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const customOffset = readCssNumber('--floating-toc-title-offset', 0);
    const beforeContentBuffer = readCssNumber('--floating-toc-before-content-buffer', 40);
    const stickyTop = getStickyTop();

    const anchorCenter = rect.top + Math.min(rect.height / 2, 36);
    const isBeforeContent = anchorCenter > window.innerHeight - beforeContentBuffer;

    let finalTop;

    if (anchorCenter > stickyTop) {
      finalTop = anchorCenter + customOffset;
    } else {
      finalTop = stickyTop + customOffset;
    }

    document.documentElement.style.setProperty(
      '--floating-toc-auto-top',
      `${Math.round(finalTop)}px`
    );

    currentToc.classList.toggle('is-before-content', isBeforeContent);
  }

  function schedulePositionUpdate() {
    if (positionFrame) {
      window.cancelAnimationFrame(positionFrame);
    }

    positionFrame = window.requestAnimationFrame(updateFloatingTocPosition);
  }

  function removeCurrentToc() {
    if (currentToc) {
      currentToc.remove();
      currentToc = null;
    }

    trackedHeadings = [];
  }

  function closeCurrentToc() {
    if (!currentToc) return;

    currentToc.classList.remove('is-open');
    blurActiveTocElement(currentToc);

    if (isMobileToc()) {
      currentToc.classList.add('is-mobile-force-closed');
    }
  }

  function setActiveItem(id) {
    if (!currentToc || !id) return;

    currentToc.querySelectorAll('.super-floating-toc__item').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.targetId === id);
    });

    currentToc.querySelectorAll('.super-floating-toc__line').forEach((line) => {
      line.classList.toggle('is-active', line.dataset.targetId === id);
    });
  }

  function getActiveHeadingFromScroll() {
    if (!trackedHeadings.length) return '';

    const activationLine = readCssNumber('--floating-toc-scroll-offset', 96) + 8;

    let activeId = trackedHeadings[0].id;
    let bestScore = Infinity;

    trackedHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);

      if (!element) return;

      const rect = element.getBoundingClientRect();
      const distance = Math.abs(rect.top - activationLine);
      const futurePenalty = rect.top > activationLine ? 40 : 0;
      const score = distance + futurePenalty;

      if (score < bestScore) {
        bestScore = score;
        activeId = heading.id;
      }
    });

    return activeId;
  }

  function updateActiveFromScroll() {
    if (clickedActiveId) {
      setActiveItem(clickedActiveId);
      return;
    }

    const activeId = getActiveHeadingFromScroll();

    if (activeId) {
      setActiveItem(activeId);
    }
  }

  function scheduleActiveUpdate() {
    if (activeScrollFrame) {
      window.cancelAnimationFrame(activeScrollFrame);
    }

    activeScrollFrame = window.requestAnimationFrame(updateActiveFromScroll);
  }

  function lockClickedActiveItem(id) {
    clickedActiveId = id;
    setActiveItem(id);

    window.clearTimeout(clickedActiveTimer);

    clickedActiveTimer = window.setTimeout(function () {
      clickedActiveId = '';
      updateActiveFromScroll();
    }, CONFIG.activeScrollDelay);
  }

  function ensureHeadingHighlightStyle() {
    if (document.getElementById('super-floating-toc-heading-highlight-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'super-floating-toc-heading-highlight-style';

    style.textContent = `
      .super-floating-toc-highlight-surface {
        position: relative !important;
        z-index: 1 !important;
        border-radius: var(--floating-toc-heading-highlight-radius, 6px) !important;
      }

      .super-floating-toc-highlight-surface::before {
        content: "" !important;
        position: absolute !important;
        top: -4px !important;
        right: -8px !important;
        bottom: -4px !important;
        left: -8px !important;
        z-index: -1 !important;
        pointer-events: none !important;
        border-radius: var(--floating-toc-heading-highlight-radius, 6px) !important;
        background: var(--floating-toc-heading-highlight-bg, rgba(47, 125, 225, 0.14)) !important;
      }
    `;

    document.head.appendChild(style);
  }

  function removeHeadingHighlights() {
    document
      .querySelectorAll('.super-floating-toc-highlight-surface')
      .forEach((heading) => {
        heading.classList.remove('super-floating-toc-highlight-surface');
      });
  }

  function getHeadingHighlightSurface(target) {
    return (
      target.closest('.notion-heading') ||
      target.closest('.notion-header__title') ||
      target.closest('.notion-page__title') ||
      target.closest('.notion-page-title') ||
      target.closest('.notion-title') ||
      target
    );
  }

  function highlightHeading(id) {
    const target = document.getElementById(id);

    if (!target) return;

    ensureHeadingHighlightStyle();
    removeHeadingHighlights();

    const highlightSurface = getHeadingHighlightSurface(target);

    highlightSurface.classList.add('super-floating-toc-highlight-surface');

    window.clearTimeout(headingHighlightTimer);

    headingHighlightTimer = window.setTimeout(function () {
      highlightSurface.classList.remove('super-floating-toc-highlight-surface');
    }, CONFIG.headingHighlightDuration);
  }

  function setupActiveTracking(headings) {
    trackedHeadings = headings.slice();
    updateActiveFromScroll();
  }

  function scrollToHeading(id) {
    const target = document.getElementById(id);

    if (!target) return;

    lockClickedActiveItem(id);
    highlightHeading(id);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function buildFloatingToc() {
    const headings = getHeadings();

    if (headings.length < CONFIG.minHeadings) {
      removeCurrentToc();
      currentSignature = '';
      document.documentElement.style.removeProperty('--floating-toc-auto-top');
      return;
    }

    const signature = `${window.location.pathname}|${headings
      .map((heading) => `${heading.id}:${heading.text}:${heading.level}`)
      .join('|')}`;

    if (signature === currentSignature && currentToc) {
      schedulePositionUpdate();
      scheduleActiveUpdate();
      return;
    }

    currentSignature = signature;
    removeCurrentToc();
    ensureMobileBehaviorStyle();

    const toc = document.createElement('nav');
    toc.className = 'super-floating-toc';
    toc.setAttribute('aria-label', 'Floating table of contents');

    const button = document.createElement('button');
    button.className = 'super-floating-toc__button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open table of contents');

    const panel = document.createElement('div');
    panel.className = 'super-floating-toc__panel';

    const list = document.createElement('div');
    list.className = 'super-floating-toc__list';

    headings.forEach((heading) => {
      const line = document.createElement('span');
      line.className = 'super-floating-toc__line';
      line.dataset.targetId = heading.id;
      line.style.setProperty('--line-width', getLineWidth(heading.level));
      button.appendChild(line);

      const item = document.createElement('a');
      item.className = 'super-floating-toc__item';
      item.href = `#${heading.id}`;
      item.textContent = heading.text;
      item.dataset.targetId = heading.id;
      item.style.setProperty('--toc-indent', `${heading.level * 14}px`);

      item.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        scrollToHeading(heading.id);

        if (isMobileToc()) {
          forceCloseMobileToc(toc);
          return;
        }

        toc.classList.add('is-open');
      });

      list.appendChild(item);
    });

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      prepareToOpenToc(toc);
      toc.classList.toggle('is-open');
    });

    toc.addEventListener('mouseleave', function () {
      if (isHoverDevice()) {
        closeCurrentToc();
      }
    });

    panel.appendChild(list);
    toc.appendChild(button);
    toc.appendChild(panel);
    document.body.appendChild(toc);

    currentToc = toc;

    setupActiveTracking(headings);
    schedulePositionUpdate();
  }

  function scheduleBuild() {
    window.clearTimeout(buildTimer);
    buildTimer = window.setTimeout(buildFloatingToc, CONFIG.buildDelay);
  }

  function handleScroll() {
    schedulePositionUpdate();
    scheduleActiveUpdate();
  }

  function handleDocumentClick(event) {
    if (!currentToc) return;

    if (!currentToc.contains(event.target)) {
      closeCurrentToc();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && currentToc) {
      closeCurrentToc();
    }
  }

  function handleRouteChange() {
    currentSignature = '';
    clickedActiveId = '';

    window.clearTimeout(clickedActiveTimer);
    document.documentElement.style.removeProperty('--floating-toc-auto-top');

    window.setTimeout(scheduleBuild, 500);
  }

  function patchHistoryMethod(methodName) {
    const originalMethod = history[methodName];

    if (!originalMethod || originalMethod._superFloatingTocPatched) {
      return;
    }

    history[methodName] = function () {
      const result = originalMethod.apply(this, arguments);
      window.dispatchEvent(new Event('super-floating-toc-route-change'));
      return result;
    };

    history[methodName]._superFloatingTocPatched = true;
  }

  function destroy() {
    window.clearTimeout(buildTimer);
    window.clearTimeout(clickedActiveTimer);
    window.clearTimeout(headingHighlightTimer);

    clickedActiveId = '';
    trackedHeadings = [];

    if (positionFrame) {
      window.cancelAnimationFrame(positionFrame);
      positionFrame = null;
    }

    if (activeScrollFrame) {
      window.cancelAnimationFrame(activeScrollFrame);
      activeScrollFrame = null;
    }

    removeCurrentToc();
    removeHeadingHighlights();

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    const highlightStyle = document.getElementById('super-floating-toc-heading-highlight-style');

    if (highlightStyle) {
      highlightStyle.remove();
    }

    const mobileStyle = document.getElementById('super-floating-toc-mobile-behavior-style');

    if (mobileStyle) {
      mobileStyle.remove();
    }

    document.documentElement.style.removeProperty('--floating-toc-auto-top');

    document.removeEventListener('click', handleDocumentClick, true);
    document.removeEventListener('keydown', handleKeydown);

    window.removeEventListener('load', scheduleBuild);
    window.removeEventListener('resize', schedulePositionUpdate);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('popstate', handleRouteChange);
    window.removeEventListener('super-floating-toc-route-change', handleRouteChange);
  }

  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('keydown', handleKeydown);

  window.addEventListener('load', scheduleBuild);
  window.addEventListener('resize', schedulePositionUpdate);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('super-floating-toc-route-change', handleRouteChange);

  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');

  mutationObserver = new MutationObserver(scheduleBuild);

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.SuperFloatingAutoToc = {
    rebuild: scheduleBuild,
    updatePosition: schedulePositionUpdate,
    destroy
  };

  scheduleBuild();
})();
