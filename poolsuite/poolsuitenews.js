function onPageLoad() {
    const header = document.querySelector('.notion-header');

    const insertSpacer = () => {
        const title = document.querySelector('.notion-header__content.max-width')
        const spacerWrapper = document.createElement('span')
        const spacer = document.createElement('i')
        spacerWrapper.classList.add('spacer')
        spacerWrapper.appendChild(spacer)
        spacerWrapper.appendChild(spacer.cloneNode(true))
        spacerWrapper.appendChild(spacer.cloneNode(true))
        title.parentNode.insertBefore(spacerWrapper, title);
        console.log('done')

    }
    insertSpacer()

    const config = { subtree: true, characterData: true };

    const callback = function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData') {
                insertSpacer()
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(header, config);
}

document.addEventListener("DOMContentLoaded", onPageLoad);