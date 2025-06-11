const createLightbox = () => {
    if (document.getElementById('lightbox-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';

    const lightboxImg = document.createElement('img');
    lightboxImg.id = 'lightbox-image';

    const closeBtn = document.createElement('button');
    closeBtn.id = 'lightbox-close';
    closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <title>x-close</title>
      <g fill="none">
        <path d="M18 6L6 18M6 6L18 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </g>
    </svg>
  `;

    overlay.appendChild(lightboxImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    const hideLightbox = () => {
        overlay.style.display = 'none';
        lightboxImg.src = '';
    };

    closeBtn.addEventListener('click', hideLightbox);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideLightbox();
    });
};

const showLightbox = (src) => {
    const img = document.getElementById('lightbox-image');
    const overlay = document.getElementById('lightbox-overlay');
    img.src = src;
    overlay.style.display = 'flex';
};

const initLightboxForImage = (imgEl) => {
    if (imgEl.dataset.lightboxInitialized) return;
    imgEl.dataset.lightboxInitialized = 'true';

    imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = imgEl.currentSrc || imgEl.src;
        if (src) showLightbox(src);
    });
};

const initializeAllNotionImages = () => {
    document.querySelectorAll('.notion-image img').forEach(initLightboxForImage);
};

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (node.matches('.notion-image img')) {
                initLightboxForImage(node);
            } else {
                node.querySelectorAll('.notion-image img').forEach(initLightboxForImage);
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

createLightbox();
initializeAllNotionImages();