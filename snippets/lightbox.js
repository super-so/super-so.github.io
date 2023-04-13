const initLightbox = () => {
    // Get images
    const images = document.querySelectorAll('.notion-image');
    // Get image container
    const lightboxImage = document.querySelector('.lightbox-image')
    // Get lightbox wrapper
    const lightboxWrapper = document.querySelector('.lightbox-wrapper')
    // Get lightbox close button
    const closeLightbox = document.querySelector('.close-lightbox')

    // For each image, add click
    images.forEach(image => {
        image.addEventListener('click', (e) => {
            console.log(e.target.src)
            console.log('hello')
            lightboxImage.setAttribute("src", e.target.src)
            lightboxWrapper.style.display = 'flex';
            lightboxWrapper.classList.add('open');
            lightboxImage.classList.add('fade-in');

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
    initLightbox()
    next.router.events.on('routeChangeComplete', url => {
        initLightbox()
    })
})