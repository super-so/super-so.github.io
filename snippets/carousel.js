
(function () {
    const initCarousel = (gallery) => {
        if (!gallery || gallery.dataset.carouselInitialized === "true") return;

        // Check if gallery is inside a .notion-callout.bg-brown-light container
        let parent = gallery.closest('.notion-callout.bg-brown-light');
        if (!parent) return;

        const cards = Array.from(gallery.querySelectorAll('.notion-collection-card'));
        if (cards.length === 0) return;

        gallery.dataset.carouselInitialized = "true";

        let currentIndex = 0;

        // Hide all cards except the first one
        cards.forEach((card, i) => {
            card.classList.remove('active');
            card.style.display = i === 0 ? '' : 'none';
        });
        cards[0].classList.add('active');

        // Create navigation buttons
        const leftBtn = document.createElement('button');
        leftBtn.className = 'carousel-button left';
        leftBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14 6 8 12 14 18" /></svg>`;

        const rightBtn = document.createElement('button');
        rightBtn.className = 'carousel-button right';
        rightBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="10 6 16 12 10 18" /></svg>`;

        gallery.appendChild(leftBtn);
        gallery.appendChild(rightBtn);

        // Create indicators
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        cards.forEach((_, i) => {
            const dot = document.createElement('span');
            if (i === 0) dot.classList.add('active');
            indicators.appendChild(dot);
        });
        gallery.appendChild(indicators);

        const updateCarousel = () => {
            cards.forEach((card, i) => {
                const isActive = i === currentIndex;
                card.classList.toggle('active', isActive);
                card.style.display = isActive ? '' : 'none';
            });

            indicators.querySelectorAll('span').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            updateCarousel();
        });

        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % cards.length;
            updateCarousel();
        });
    };

    const initializeAllGalleries = () => {
        const galleries = document.querySelectorAll('.notion-collection-gallery');
        galleries.forEach(initCarousel);
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                const galleries = node.matches('.notion-collection-gallery')
                    ? [node]
                    : node.querySelectorAll('.notion-collection-gallery');
                galleries.forEach(initCarousel);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Run once for any galleries already in the DOM
    initializeAllGalleries();
})();