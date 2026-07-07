
(function () {
  const SIDEBAR = ".super-sidebar";
  const LIST = ".super-navigation-menu__list";
  const HEADER = ".super-navigation-menu__list-header";
  const ITEM = ".super-navigation-menu__list-items .super-navigation-menu__item";
  const VIEWPORT = ".super-sidebar .super-navigation-menu__items-viewport";

  const STORAGE_KEY = "super-sidebar-scroll-position";
  const OPEN_DELAYS = [0, 50, 120, 260, 500];

  const CLOSED_HEADER_SELECTOR = `
    ${LIST}.closed ${HEADER},
    ${LIST}[data-state="closed"] ${HEADER},
    ${LIST} ${HEADER}[aria-expanded="false"]
  `;

  let opening = false;
  let openTimer;
  let unlockTimer;
  let scrollTimer;
  let restoreTimer;
  let restoreFrame;
  let openSequenceTimers = [];
  let restoreTimers = [];

  function getSidebar() {
    return document.querySelector(SIDEBAR);
  }

  function getViewport() {
    return document.querySelector(VIEWPORT);
  }

  function getClosedHeaders() {
    const sidebar = getSidebar();
    if (!sidebar) return [];

    return Array.from(sidebar.querySelectorAll(CLOSED_HEADER_SELECTOR)).filter(
      (header) => header.getAttribute("aria-expanded") !== "true"
    );
  }

  function saveScrollPosition() {
    const viewport = getViewport();
    if (!viewport) return;

    sessionStorage.setItem(STORAGE_KEY, String(viewport.scrollTop));
  }

  function restoreScrollPosition() {
    const viewport = getViewport();
    if (!viewport) return;

    const savedPosition = sessionStorage.getItem(STORAGE_KEY);
    if (savedPosition === null) return;

    const savedTop = Number(savedPosition);
    if (!Number.isFinite(savedTop)) return;

    if (viewport.scrollTop !== savedTop) {
      viewport.scrollTop = savedTop;
    }
  }

  function clearRestoreTimers() {
    restoreTimers.forEach(clearTimeout);
    restoreTimers = [];
  }

  function scheduleRestore() {
    clearTimeout(restoreTimer);
    cancelAnimationFrame(restoreFrame);
    clearRestoreTimers();

    restoreFrame = requestAnimationFrame(restoreScrollPosition);

    restoreTimer = setTimeout(() => {
      restoreScrollPosition();

      restoreTimers.push(setTimeout(restoreScrollPosition, 120));
      restoreTimers.push(setTimeout(restoreScrollPosition, 300));
      restoreTimers.push(setTimeout(restoreScrollPosition, 600));
    }, 50);
  }

  function openClosedLists() {
    if (opening) return;

    const headers = getClosedHeaders();

    if (!headers.length) {
      scheduleRestore();
      return;
    }

    opening = true;

    headers.forEach((header) => {
      header.click();
    });

    clearTimeout(unlockTimer);

    unlockTimer = setTimeout(() => {
      opening = false;
      scheduleRestore();
    }, 0);
  }

  function scheduleOpen(delay = 0) {
    clearTimeout(openTimer);

    if (delay === 0) {
      openClosedLists();
      return;
    }

    openTimer = setTimeout(openClosedLists, delay);
  }

  function runOpenSequence() {
    openSequenceTimers.forEach(clearTimeout);
    openSequenceTimers = [];

    OPEN_DELAYS.forEach((delay) => {
      if (delay === 0) {
        scheduleOpen(0);
      } else {
        const timer = setTimeout(() => scheduleOpen(0), delay);
        openSequenceTimers.push(timer);
      }
    });
  }

  function hasRelevantNode(nodes, selector) {
    return Array.from(nodes).some((node) => {
      if (node.nodeType !== 1) return false;

      return node.matches?.(selector) || node.querySelector?.(selector);
    });
  }

  function isSidebarMountChange(mutation) {
    return hasRelevantNode(mutation.addedNodes, `${SIDEBAR}, ${LIST}`);
  }

  function normalizePath(path) {
    return path.replace(/\/$/, "") || "/";
  }

  function setActiveSidebarItem() {
    const currentPath = normalizePath(window.location.pathname);

    document
      .querySelectorAll(`${SIDEBAR} .super-navigation-menu__item[href]`)
      .forEach((item) => {
        const itemPath = normalizePath(
          new URL(item.href, window.location.origin).pathname
        );

        item.toggleAttribute("data-sidebar-current", itemPath === currentPath);
      });
  }

  function setupSidebar() {
    if (!getSidebar()) return;

    setActiveSidebarItem();
    runOpenSequence();
  }

  document.addEventListener(
    "click",
    function (event) {
      const header = event.target.closest(`${SIDEBAR} ${HEADER}`);

      if (header && event.isTrusted) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        scheduleOpen(0);
        return;
      }

      const item = event.target.closest(`${SIDEBAR} ${ITEM}`);

      if (item && event.isTrusted) {
        saveScrollPosition();
        setTimeout(setActiveSidebarItem, 120);
      }
    },
    true
  );

  document.addEventListener(
    "scroll",
    function (event) {
      if (!event.target.matches?.(VIEWPORT)) return;

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(saveScrollPosition, 80);
    },
    true
  );

  new MutationObserver((mutations) => {
    if (!mutations.some(isSidebarMountChange)) return;

    setupSidebar();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("popstate", setupSidebar);
  window.addEventListener("pageshow", setupSidebar);
  window.addEventListener("load", setupSidebar);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSidebar);
  } else {
    setupSidebar();
  }
})();
