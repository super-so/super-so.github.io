
  (() => {
  const instanceKey = "__curvedCarouselController";
  window[instanceKey]?.destroy?.();

  const gallerySelector = ".notion-collection-gallery.large";
  const cardSelector = ".notion-collection-card.gallery";

  const speed = 48;
  const gap = 14;
  const hoverScale = 1.08;
  const scaleSmoothing = 0.14;
  const dragThreshold = 6;

  const routeSettleDelay = 120;
  const galleryStates = new Map();

  let currentPath = window.location.pathname;
  let routeReady = true;
  let routeTimer = null;

  // Use the normal arrow cursor and update any existing style element.
  const installInteractionStyles = () => {
    const styleId = "curved-carousel-interaction-styles";
    let style = document.getElementById(styleId);

    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      (document.head || document.documentElement).appendChild(style);
    }

    style.textContent = `
      .notion-collection-gallery.large.curved-carousel,
      .notion-collection-gallery.large.curved-carousel
        > .notion-collection-card.gallery,
      .notion-collection-gallery.large.curved-carousel
        > .notion-collection-card.gallery *,
      .notion-collection-gallery.large.curved-carousel.is-dragging,
      .notion-collection-gallery.large.curved-carousel.is-dragging
        > .notion-collection-card.gallery,
      .notion-collection-gallery.large.curved-carousel.is-dragging
        > .notion-collection-card.gallery * {
        cursor: default !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `;
  };

  const getCards = (gallery) =>
    [...gallery.children].filter(
      (element) =>
        element.matches(cardSelector) &&
        element.dataset.curvedCarouselClone !== "true"
    );

  const sameCards = (first, second) =>
    first.length === second.length &&
    first.every((card, index) => card === second[index]);

  // The carousel CSS follows Super's page-level or global-level scope.
  const hasCarouselStyles = (gallery) => {
    const alreadyMounted = gallery.classList.contains("curved-carousel");

    if (!alreadyMounted) {
      gallery.classList.add("curved-carousel");
    }

    const hasStyles = Boolean(
      getComputedStyle(gallery).getPropertyValue("--card-size").trim()
    );

    if (!alreadyMounted) {
      gallery.classList.remove("curved-carousel");
    }

    return hasStyles;
  };

  const restoreAttribute = (element, name, value, existed) => {
    if (existed) {
      element.setAttribute(name, value ?? "");
    } else {
      element.removeAttribute(name);
    }
  };

  // Disable card links, navigation, and Super's image lightbox.
  const disableCardInteractions = (cards) => {
    const restorers = [];

    const addClass = (element, className) => {
      const existed = element.classList.contains(className);

      if (!existed) {
        element.classList.add(className);
        restorers.push(() => element.classList.remove(className));
      }
    };

    const setAttribute = (element, name, value) => {
      const existed = element.hasAttribute(name);
      const originalValue = element.getAttribute(name);

      restorers.push(() =>
        restoreAttribute(element, name, originalValue, existed)
      );
      element.setAttribute(name, value);
    };

    const removeAttribute = (element, name) => {
      const existed = element.hasAttribute(name);
      const originalValue = element.getAttribute(name);

      restorers.push(() =>
        restoreAttribute(element, name, originalValue, existed)
      );
      element.removeAttribute(name);
    };

    const setStyle = (element, property, value, priority = "") => {
      const originalValue = element.style.getPropertyValue(property);
      const originalPriority = element.style.getPropertyPriority(property);

      restorers.push(() => {
        if (originalValue) {
          element.style.setProperty(
            property,
            originalValue,
            originalPriority
          );
        } else {
          element.style.removeProperty(property);
        }
      });

      element.style.setProperty(property, value, priority);
    };

    cards.forEach((card) => {
      addClass(card, "no-click");
      setAttribute(card, "aria-disabled", "true");
      setStyle(card, "cursor", "default", "important");

      const originalOnclick = card.onclick;
      restorers.push(() => {
        card.onclick = originalOnclick;
      });

      removeAttribute(card, "onclick");
      card.onclick = null;

      card.querySelectorAll("a").forEach((link) => {
        removeAttribute(link, "href");
        removeAttribute(link, "target");
        removeAttribute(link, "rel");
        removeAttribute(link, "onclick");
        setAttribute(link, "aria-disabled", "true");
        setAttribute(link, "tabindex", "-1");
        setStyle(link, "pointer-events", "none", "important");
        setStyle(link, "cursor", "default", "important");
      });

      card
        .querySelectorAll("[data-lightbox-src], [data-full-size]")
        .forEach((element) => {
          removeAttribute(element, "data-lightbox-src");
          removeAttribute(element, "data-full-size");
          removeAttribute(element, "onclick");
          setStyle(element, "pointer-events", "none", "important");
          setStyle(element, "cursor", "default", "important");
        });

      card.querySelectorAll("img").forEach((image) => {
        setAttribute(image, "draggable", "false");
      });
    });

    return () => {
      restorers.reverse().forEach((restore) => restore());
    };
  };

  const mountGallery = (gallery) => {
    const cards = getCards(gallery);
    const existingState = galleryStates.get(gallery);

    if (existingState) {
      if (hasCarouselStyles(gallery) && sameCards(existingState.cards, cards)) {
        return;
      }

      existingState.cleanup();
    }

    if (!hasCarouselStyles(gallery) || gallery.dataset.curvedCarousel) {
      return;
    }

    // Keep newly rendered cards disabled.
    const restoreInteractions = disableCardInteractions(cards);

    if (cards.length < 3) {
      let active = true;
      let state;

      const cleanup = () => {
        if (!active) {
          return;
        }

        active = false;
        restoreInteractions();

        if (galleryStates.get(gallery) === state) {
          galleryStates.delete(gallery);
        }
      };

      state = { cards, cleanup };
      galleryStates.set(gallery, state);
      return;
    }

    const originalData = gallery.getAttribute("data-curved-carousel");
    const hadData = gallery.hasAttribute("data-curved-carousel");
    const hadCarouselClass = gallery.classList.contains("curved-carousel");
    const hadReadyClass = gallery.classList.contains("is-ready");
    const hadDraggingClass = gallery.classList.contains("is-dragging");
    const originalCursor = gallery.style.getPropertyValue("cursor");
    const originalCursorPriority =
      gallery.style.getPropertyPriority("cursor");
    const originalTransforms = cards.map((card) => ({
      card,
      value: card.style.getPropertyValue("transform"),
      priority: card.style.getPropertyPriority("transform")
    }));

    gallery.dataset.curvedCarousel = "true";
    gallery.classList.add("curved-carousel");
    gallery.style.setProperty("cursor", "default", "important");

    // Keep the existing gallery instruction for the CSS to hide.
    let hint = gallery.nextElementSibling;
    let createdHint = false;

    if (!hint?.classList.contains("curved-carousel__hint")) {
      hint = document.createElement("div");
      hint.className = "curved-carousel__hint";
      hint.innerHTML =
        "<span>Scroll to view gallery</span>" +
        '<span aria-hidden="true">↓</span>';
      gallery.insertAdjacentElement("afterend", hint);
      createdHint = true;
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const desktopHover = matchMedia(
      "(min-width: 765px) and (hover: hover) and (pointer: fine)"
    );

    const clones = [];
    let displayCards = [...cards];

    const cardScales = new WeakMap(cards.map((card) => [card, 1]));

    const syncCardCoverage = (cardWidth) => {
      const step = cardWidth + gap;
      const stageWidth = gallery.clientWidth || window.innerWidth;

      if (!cardWidth || !step || !stageWidth) {
        return;
      }

      const minimumCardCount = Math.ceil((stageWidth + step) / step);
      const cycleCount = Math.max(
        1,
        Math.ceil(minimumCardCount / cards.length)
      );
      const targetCardCount = cycleCount * cards.length;

      if (displayCards.length === targetCardCount) {
        return;
      }

      clones.splice(0).forEach((clone) => clone.remove());

      const cloneCount = targetCardCount - cards.length;

      for (let index = 0; index < cloneCount; index += 1) {
        const clone = cards[index % cards.length].cloneNode(true);

        clone.dataset.curvedCarouselClone = "true";
        clone.setAttribute("aria-hidden", "true");
        clone.removeAttribute("id");
        clone.querySelectorAll("[id]").forEach((element) => {
          element.removeAttribute("id");
        });

        gallery.appendChild(clone);
        clones.push(clone);
        cardScales.set(clone, 1);
      }

      displayCards = [...cards, ...clones];
    };

    const listenerController = new AbortController();
    const { signal } = listenerController;

    let active = true;
    let state;
    let readyFrame = null;
    let animationFrame = null;
    let offset = 0;
    let lastTime = performance.now();
    let paused = false;

    let pointerDown = false;
    let dragging = false;
    let activePointerId = null;

    let startX = 0;
    let startOffset = 0;

    const draw = () => {
      const cardWidth = cards[0].offsetWidth;

      if (!cardWidth) {
        return;
      }

      syncCardCoverage(cardWidth);

      const step = cardWidth + gap;
      const totalWidth = step * displayCards.length;

      if (!totalWidth) {
        return;
      }

      displayCards.forEach((card, index) => {
        const rawX = index * step - offset;
        const x =
          (((rawX + step) % totalWidth) + totalWidth) % totalWidth - step;

        // Preserve the existing desktop hover effect.
        const targetScale =
          desktopHover.matches && card.matches(":hover") ? hoverScale : 1;

        let currentScale = cardScales.get(card) ?? 1;
        currentScale += (targetScale - currentScale) * scaleSmoothing;

        if (Math.abs(targetScale - currentScale) < 0.001) {
          currentScale = targetScale;
        }

        cardScales.set(card, currentScale);
        card.style.transform =
          `translate3d(${x}px, 0, 0) ` + `scale(${currentScale})`;
      });
    };

    const cleanup = () => {
      if (!active) {
        return;
      }

      active = false;
      listenerController.abort();

      if (readyFrame !== null) {
        cancelAnimationFrame(readyFrame);
      }

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      if (createdHint) {
        hint.remove();
      }

      clones.splice(0).forEach((clone) => clone.remove());
      displayCards = [...cards];

      if (hadData) {
        gallery.setAttribute("data-curved-carousel", originalData ?? "");
      } else {
        gallery.removeAttribute("data-curved-carousel");
      }

      gallery.classList.toggle("curved-carousel", hadCarouselClass);
      gallery.classList.toggle("is-ready", hadReadyClass);
      gallery.classList.toggle("is-dragging", hadDraggingClass);

      if (originalCursor) {
        gallery.style.setProperty(
          "cursor",
          originalCursor,
          originalCursorPriority
        );
      } else {
        gallery.style.removeProperty("cursor");
      }

      originalTransforms.forEach(({ card, value, priority }) => {
        if (value) {
          card.style.setProperty("transform", value, priority);
        } else {
          card.style.removeProperty("transform");
        }
      });

      restoreInteractions();

      if (galleryStates.get(gallery) === state) {
        galleryStates.delete(gallery);
      }
    };

    const animate = (time) => {
      if (!active) {
        return;
      }

      if (!gallery.isConnected || !hasCarouselStyles(gallery)) {
        cleanup();
        return;
      }

      const delta = Math.min(time - lastTime, 40);
      lastTime = time;

      if (!paused && !pointerDown && !reducedMotion.matches) {
        offset += (speed * delta) / 1000;
      }

      draw();
      animationFrame = requestAnimationFrame(animate);
    };

    gallery.addEventListener(
      "mouseenter",
      () => {
        paused = true;
      },
      { signal }
    );

    gallery.addEventListener(
      "mouseleave",
      () => {
        paused = false;
      },
      { signal }
    );

    // Record the press without entering drag mode until horizontal movement.
    gallery.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        const card = event.target.closest?.(cardSelector);

        if (card && card.parentElement === gallery) {
          if (event.pointerType !== "touch") {
            event.preventDefault();
          }

          event.stopPropagation();
        }

        pointerDown = true;
        dragging = false;
        activePointerId = event.pointerId;
        startX = event.clientX;
        startOffset = offset;
      },
      { capture: true, signal }
    );

    gallery.addEventListener(
      "pointermove",
      (event) => {
        if (!pointerDown || event.pointerId !== activePointerId) {
          return;
        }

        const movement = event.clientX - startX;

        if (!dragging && Math.abs(movement) < dragThreshold) {
          return;
        }

        if (!dragging) {
          dragging = true;
          gallery.classList.add("is-dragging");
          gallery.setPointerCapture?.(event.pointerId);
        }

        offset = startOffset - movement;
        draw();
      },
      { signal }
    );

    const stopPointer = (event) => {
      if (!pointerDown || event.pointerId !== activePointerId) {
        return;
      }

      pointerDown = false;
      dragging = false;
      activePointerId = null;
      gallery.classList.remove("is-dragging");

      if (gallery.hasPointerCapture?.(event.pointerId)) {
        gallery.releasePointerCapture(event.pointerId);
      }
    };

    gallery.addEventListener("pointerup", stopPointer, { signal });
    gallery.addEventListener("pointercancel", stopPointer, { signal });

    // Prevent normal, middle-button, and double-click card activation.
    const preventCardActivation = (event) => {
      const card = event.target.closest?.(cardSelector);

      if (!card || card.parentElement !== gallery) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    gallery.addEventListener("click", preventCardActivation, {
      capture: true,
      signal
    });
    gallery.addEventListener("auxclick", preventCardActivation, {
      capture: true,
      signal
    });
    gallery.addEventListener("dblclick", preventCardActivation, {
      capture: true,
      signal
    });

    window.addEventListener("resize", draw, { signal });

    draw();

    readyFrame = requestAnimationFrame(() => {
      gallery.classList.add("is-ready");
    });

    state = { cards, cleanup };
    galleryStates.set(gallery, state);
    animationFrame = requestAnimationFrame(animate);
  };

  const cleanupAll = () => {
    [...galleryStates.values()].forEach(({ cleanup }) => cleanup());
  };

  const mount = () => {
    [...galleryStates.entries()].forEach(([gallery, state]) => {
      const cards = gallery.isConnected ? getCards(gallery) : [];

      if (
        !gallery.isConnected ||
        !hasCarouselStyles(gallery) ||
        !sameCards(state.cards, cards)
      ) {
        state.cleanup();
      }
    });

    if (!routeReady) {
      return;
    }

    document.querySelectorAll(gallerySelector).forEach(mountGallery);
  };

  const settleRoute = () => {
    clearTimeout(routeTimer);
    routeReady = false;
    cleanupAll();

    let attempts = 0;

    const retryMount = () => {
      attempts += 1;
      routeReady = true;
      mount();

      const hasPendingGallery = [...document.querySelectorAll(gallerySelector)]
        .some((gallery) => !galleryStates.has(gallery));

      if (hasPendingGallery && attempts < 10) {
        routeTimer = window.setTimeout(retryMount, routeSettleDelay);
      }
    };

    routeTimer = window.setTimeout(retryMount, routeSettleDelay);
  };

  const handlePageChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      settleRoute();
      return;
    }

    mount();
  };

  installInteractionStyles();

  const observer = new MutationObserver(handlePageChange);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("popstate", handlePageChange);

  const destroy = () => {
    clearTimeout(routeTimer);
    observer.disconnect();
    window.removeEventListener("popstate", handlePageChange);
    cleanupAll();

    if (window[instanceKey]?.destroy === destroy) {
      delete window[instanceKey];
    }
  };

  window[instanceKey] = { destroy };

  mount();
})();
