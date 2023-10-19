const attachListenersToImages = () => {
    const images = document.querySelectorAll('.notion-image');
    images.forEach(image => {
        image.addEventListener('click', (e) => {
            const lightboxImage = document.querySelector('.lightbox-image');
            const lightboxWrapper = document.querySelector('.lightbox-wrapper');
            lightboxImage.setAttribute("src", e.target.src);
            lightboxWrapper.style.display = 'flex';
            lightboxWrapper.classList.add('open');
        });
    });
};

const initLightbox = () => {
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');
    const closeLightbox = document.querySelector('.close-lightbox');

    attachListenersToImages();

    [lightboxWrapper, closeLightbox].forEach(button => {
        button.addEventListener('click', (e) => {
            if (lightboxWrapper.classList.contains('open')) {
                lightboxWrapper.style.display = 'none';
                lightboxWrapper.classList.remove('open');
                lightboxImage.setAttribute("src", '');
            }
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            lightboxWrapper.style.display = 'none';
        }
    });
};

const observeNewImages = () => {
    const observerConfig = { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] };
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.matches && node.matches('.notion-image')) {
                        attachListenersToImages();
                        break;
                    }
                }
            } else if (mutation.type === 'attributes' && mutation.target.matches('.notion-image')) {
                attachListenersToImages();
            }
        }
    });

    observer.observe(document.body, observerConfig);
};

window.addEventListener('load', e => {
    setTimeout(function () {

        initLightbox();
        observeNewImages();
        next.router.events.on('routeChangeComplete', url => {
            initLightbox();
        });
    }, 500);  // 2000ms = 2 seconds delay

});
