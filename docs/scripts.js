function onPageLoad() {
    const setActivePage = () => {
        const currentPage = document.querySelectorAll('a[href="' + window.location.pathname + '"]');
        currentPage.forEach(function (page) {
            if (!page.classList.contains('super-navbar__logo')) {
                page.classList.add('page-active')
            }
            const pageIcon = page.querySelector('.notion-page__icon')
            if (pageIcon) {
                pageIcon.setAttribute("style", "opacity:1!important; filter:grayscale(0%)!important;")
            }
        });
    }
    setActivePage()

    const header = document.querySelector('.notion-header');
    const fixHeader = () => {
        const content = document.querySelector('.notion-root > .notion-column-list > .notion-column:nth-child(2)');
        content.prepend(header, content.firstChild);
    }
    fixHeader()

    const config = { subtree: true, characterData: true };

    const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData') {
                fixHeader()
                setActivePage()
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(header, config);
}

document.addEventListener("DOMContentLoaded", onPageLoad);


if (location.hostname == "app.super.so") {
    document.querySelector('.notion-root > .notion-column-list > .notion-column:nth-child(2)').prepend(document.querySelector('.notion-header'), document.querySelector('.notion-root > .notion-column-list > .notion-column:nth-child(2)').firstChild);
}