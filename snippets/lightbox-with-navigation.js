(() => {
  if (window.__superGalleryLightboxInstalled) return;
  window.__superGalleryLightboxInstalled = true;

  const historyKey = '__superGalleryLightbox';
  const session = Math.random().toString(36).slice(2);
  const dialog = document.createElement('dialog');
  dialog.id = 'super-gallery-lightbox';
  dialog.setAttribute('aria-label', 'Image gallery');
  dialog.innerHTML = `
    <img class="sg-image" alt="" draggable="false">
    <button class="sg-close" type="button" aria-label="Close image gallery">&#215;</button>
    <button class="sg-prev" type="button" aria-label="Previous image">&#8249;</button>
    <button class="sg-next" type="button" aria-label="Next image">&#8250;</button>
    <p class="sg-counter" role="status" aria-live="polite" aria-atomic="true"></p>
  `;
  document.body.appendChild(dialog);

  const image = dialog.querySelector('.sg-image');
  const closeButton = dialog.querySelector('.sg-close');
  const previousButton = dialog.querySelector('.sg-prev');
  const nextButton = dialog.querySelector('.sg-next');
  const counter = dialog.querySelector('.sg-counter');
  let gallery = [];
  let index = 0;
  let pageURL = '';
  let closing = false;
  let previousOverflow = '';
  let touchStart = null;

  function render() {
    image.src = gallery[index].src;
    image.alt = gallery[index].alt || `Image ${index + 1} of ${gallery.length}`;
    counter.textContent = `${index + 1} / ${gallery.length}`;
    previousButton.hidden = nextButton.hidden = gallery.length < 2;
  }

  function show() {
    render();
    if (dialog.open) return;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
  }

  function hide() {
    closing = false;
    touchStart = null;
    if (!dialog.open) return;
    dialog.close();
    image.removeAttribute('src');
    document.body.style.overflow = previousOverflow;
  }

  function step(direction) {
    if (!dialog.open || closing) return;
    index = (index + direction + gallery.length) % gallery.length;
    render();
  }

  function open(clickedImage) {
    if (closing || dialog.open) return;
    const root = clickedImage.closest('.notion-root') || document;
    const images = [...root.querySelectorAll('.notion-image img')]
      .filter(img => img.getClientRects().length && (img.currentSrc || img.src));
    index = images.indexOf(clickedImage);
    if (index < 0) return;
    gallery = images.map(img => ({
      src: img.currentSrc || img.src,
      alt: img.alt === 'image' ? '' : img.alt
    }));
    pageURL = location.href;

    // Preserve Next.js router state and add ONE entry for the whole gallery.
    // Next/previous images do not add browser history entries.
    history.pushState({ ...history.state, [historyKey]: session }, '', pageURL);
    show();
  }

  function requestClose() {
    if (!dialog.open || closing) return;
    if (history.state?.[historyKey] === session && location.href === pageURL) {
      closing = true;
      history.back();
    } else {
      hide();
    }
  }

  // Delegation also covers images mounted after navigating between Super pages.
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.target.closest?.('.notion-root .notion-image img');
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    open(target);
  }, true);

  previousButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  closeButton.addEventListener('click', requestClose);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) requestClose();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener('keydown', event => {
    // Leave browser navigation shortcuts to the browser; popstate handles them.
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Tab') {
      const buttons = [...dialog.querySelectorAll('button')].filter(button => !button.hidden);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  dialog.addEventListener('pointerdown', event => {
    touchStart = event.isPrimary && event.pointerType === 'touch' && event.target === image
      ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
  });
  dialog.addEventListener('pointerup', event => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      step(dx < 0 ? 1 : -1);
    }
  });
  dialog.addEventListener('pointercancel', () => { touchStart = null; });

  window.addEventListener('popstate', () => {
    if (history.state?.[historyKey] === session && location.href === pageURL && gallery.length) {
      closing = false;
      show(); // Browser Forward can reopen the gallery at its last viewed image.
    } else {
      hide(); // Browser/mouse Back closes the gallery before leaving the page.
    }
  });

  // A client-side route change must never leave the overlay covering another page.
  new MutationObserver(() => {
    if (dialog.open && location.href !== pageURL) hide();
  }).observe(document.body, { childList: true, subtree: true });
})();