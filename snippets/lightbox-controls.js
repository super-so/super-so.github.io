const initLightbox = () => {
    const cards = document.querySelectorAll('.notion-collection-card');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxWrapper = document.querySelector('.lightbox-wrapper');
    const closeLightbox = document.querySelector('.close-lightbox');
    let currentIndex = 0;
    console.log(currentIndex)

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
                let currentIndex = 0;
                console.log(currentIndex)
            }
        });
    });

    document.addEventListener('keydown', (event) => {
       if (lightboxWrapper.classList.contains = 'open') {
          const nextImage = cards[currentIndex];
          const childImgElement = nextImage.querySelector('img');
          const nextImageSrc = childImgElement.getAttribute('src');
          
        if (event.keyCode === 39) {
          // Right arrow key pressed
          currentIndex = (currentIndex + 1 + cards.length) % cards.length;
          
          lightboxImage.setAttribute("src", nextImageSrc);
        
          console.log(currentIndex)
        }
        if (event.keyCode === 37) {
          // Left arrow pressed
          currentIndex = (currentIndex - 1 + cards.length) % cards.length;
          
          lightboxImage.setAttribute("src", nextImageSrc);
        
          console.log(currentIndex)
        }
       }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            lightboxWrapper.style.display = 'none';
        }
    });
}

window.addEventListener('load', e => {
    initLightbox();
    window.events.on('routeChangeComplete', url => {
        initLightbox();
    })
})
