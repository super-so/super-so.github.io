const initLightbox = () => {
    const cards = document.querySelectorAll('.notion-collection-card');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');
    const closeLightbox = document.querySelector('.close-lightbox');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            lightboxImage.setAttribute("src", e.target.src);
            lightboxWrapper.style.display = 'flex';
            lightboxWrapper.classList.add('open');
        });
    });

    [lightboxWrapper, closeLightbox].forEach(button => {
        button.addEventListener('click', (e) => {
            if (lightboxWrapper.classList.contains = 'open') {
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
}

window.addEventListener('load', e => {
    initLightbox();
    next.router.events.on('routeChangeComplete', url => {
        initLightbox();
    })
})