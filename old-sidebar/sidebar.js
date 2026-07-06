(function () {
  const SIDEBAR = ".super-sidebar";
  const LIST = ".super-navigation-menu__list";
  const HEADER = ".super-navigation-menu__list-header";
  const LIST_ITEMS = ".super-navigation-menu__list-items";
  const ITEM = ".super-navigation-menu__list-items .super-navigation-menu__item";
  const VIEWPORT = ".super-sidebar .super-navigation-menu__items-viewport";

  const STORAGE_KEY = "super-sidebar-scroll-position";
  const OPEN_DELAYS = [0, 50, 120, 260, 500];
  const ITEM_OPEN_DELAYS = [0, 50, 120, 260, 500, 800];

  const CLOSED_HEADER_SELECTOR = `
    ${LIST}.closed ${HEADER},
    ${LIST}[data-state="closed"] ${HEADER},
    ${LIST} ${HEADER}[aria-expanded="false"]
  `;

  const SIDEBAR_CHANGE_SELECTOR = `${LIST}, ${HEADER}, ${LIST_ITEMS}`;

  let opening = false;
  let openTimer;
  let unlockTimer;
  let scrollTimer;
  let restoreTimer;
  let restoreFrame;
  let currentSidebar;
  let sidebarStateObserver;

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

    viewport.scrollTop = Number(savedPosition);
  }

  function scheduleRestore() {
    clearTimeout(restoreTimer);
    cancelAnimationFrame(restoreFrame);

    restoreFrame = requestAnimationFrame(restoreScrollPosition);

    restoreTimer = setTimeout(() => {
      restoreScrollPosition();
      setTimeout(restoreScrollPosition, 120);
      setTimeout(restoreScrollPosition, 300);
      setTimeout(restoreScrollPosition, 600);
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

      if (getClosedHeaders().length) {
        scheduleOpen(16);
      }
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

  function runOpenSequence(delays) {
    delays.forEach((delay) => {
      if (delay === 0) {
        scheduleOpen(0);
      } else {
        setTimeout(() => scheduleOpen(0), delay);
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

  function isRelevantSidebarChange(mutation) {
    if (mutation.type === "attributes") {
      return mutation.target.matches?.(SIDEBAR_CHANGE_SELECTOR);
    }

    return hasRelevantNode(mutation.addedNodes, SIDEBAR_CHANGE_SELECTOR);
  }

  function watchSidebar(sidebar) {
    if (sidebarStateObserver) {
      sidebarStateObserver.disconnect();
    }

    sidebarStateObserver = new MutationObserver((mutations) => {
      if (opening) return;
      if (!mutations.some(isRelevantSidebarChange)) return;

      if (getClosedHeaders().length) {
        scheduleOpen(0);
      } else {
        scheduleRestore();
      }
    });

    sidebarStateObserver.observe(sidebar, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "class",
        "data-state",
        "aria-expanded",
        "aria-hidden",
        "hidden",
        "style"
      ],
    });
  }

  function setupSidebar() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    if (sidebar !== currentSidebar) {
      currentSidebar = sidebar;
      watchSidebar(sidebar);
    }

    runOpenSequence(OPEN_DELAYS);
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
        runOpenSequence(ITEM_OPEN_DELAYS);
        scheduleRestore();
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
  function normalizePath(path) {
  return path.replace(/\/$/, "") || "/";
}

function setActiveSidebarItem() {
  const currentPath = normalizePath(window.location.pathname);

  document
    .querySelectorAll(`${SIDEBAR} .super-navigation-menu__item[href]`)
    .forEach((item) => {
      const itemPath = normalizePath(new URL(item.href, window.location.origin).pathname);
      const isCurrent = itemPath === currentPath;

      item.toggleAttribute("data-sidebar-current", isCurrent);
    });
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSidebar);
  } else {
    setupSidebar();
  }
})();
