
(() => {
  const gallerySelector = ".notion-collection-gallery.large";
  const cardSelector = ".notion-collection-card.gallery";

  const speed = 48;
  const gap = 14;
  const hoverScale = 1.08;
  const scaleSmoothing = 0.14;
  const dragThreshold = 6;

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

  // Disable card links, navigation, and Super's image lightbox.
  const disableCardInteractions = (cards) => {
    cards.forEach((card) => {
      card.classList.add("no-click");
      card.setAttribute("aria-disabled", "true");
      card.style.setProperty("cursor", "default", "important");
      card.removeAttribute("onclick");
      card.onclick = null;

      card.querySelectorAll("a").forEach((link) => {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.removeAttribute("onclick");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
        link.style.setProperty("pointer-events", "none", "important");
        link.style.setProperty("cursor", "default", "important");
      });

      card
        .querySelectorAll("[data-lightbox-src], [data-full-size]")
        .forEach((element) => {
          element.removeAttribute("data-lightbox-src");
          element.removeAttribute("data-full-size");
          element.removeAttribute("onclick");
          element.style.setProperty("pointer-events", "none", "important");
          element.style.setProperty("cursor", "default", "important");
        });

      card.querySelectorAll("img").forEach((image) => {
        image.setAttribute("draggable", "false");
      });
    });
  };

  const mount = () => {
    const gallery = document.querySelector(gallerySelector);

    if (!gallery) {
      return;
    }

    const cards = [...gallery.children].filter((element) =>
      element.matches(cardSelector)
    );

    // Keep newly rendered cards disabled.
    disableCardInteractions(cards);

    if (gallery.dataset.curvedCarousel || cards.length < 3) {
      return;
    }

    gallery.dataset.curvedCarousel = "true";
    gallery.classList.add("curved-carousel");
    gallery.style.setProperty("cursor", "default", "important");

    // Keep the existing gallery instruction for the CSS to hide.
    let hint = gallery.nextElementSibling;

    if (!hint?.classList.contains("curved-carousel__hint")) {
      hint = document.createElement("div");
      hint.className = "curved-carousel__hint";
      hint.innerHTML =
        "<span>Scroll to view gallery</span>" +
        '<span aria-hidden="true">↓</span>';
      gallery.insertAdjacentElement("afterend", hint);
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const desktopHover = matchMedia(
      "(min-width: 765px) and (hover: hover) and (pointer: fine)"
    );

    const cardScales = new WeakMap(cards.map((card) => [card, 1]));

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
      const step = cardWidth + gap;
      const totalWidth = step * cards.length;

      if (!cardWidth || !totalWidth) {
        return;
      }

      cards.forEach((card, index) => {
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

    const animate = (time) => {
      if (!gallery.isConnected) {
        return;
      }

      const delta = Math.min(time - lastTime, 40);
      lastTime = time;

      if (!paused && !pointerDown && !reducedMotion.matches) {
        offset += (speed * delta) / 1000;
      }

      draw();
      requestAnimationFrame(animate);
    };

    gallery.addEventListener("mouseenter", () => {
      paused = true;
    });

    gallery.addEventListener("mouseleave", () => {
      paused = false;
    });

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
      true
    );

    gallery.addEventListener("pointermove", (event) => {
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
    });

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

    gallery.addEventListener("pointerup", stopPointer);
    gallery.addEventListener("pointercancel", stopPointer);

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

    gallery.addEventListener("click", preventCardActivation, true);
    gallery.addEventListener("auxclick", preventCardActivation, true);
    gallery.addEventListener("dblclick", preventCardActivation, true);

    window.addEventListener("resize", draw);

    draw();

    requestAnimationFrame(() => {
      gallery.classList.add("is-ready");
    });

    requestAnimationFrame(animate);
  };

  installInteractionStyles();

  const observer = new MutationObserver(mount);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  mount();
})();
