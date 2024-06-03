let userClosedSection = false;


function simulateClick(element) {
    if (!element) return;
    const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    element.dispatchEvent(clickEvent);
}

function processSections() {
    const sections = document.querySelectorAll(".notion-collection-group__section");
    let sectionToReopen;

    sections.forEach((section) => {
        const currentUrl = window.location.pathname;
        const collectionItems = section.querySelectorAll(".notion-collection-list__item");
        let containsCurrentPage = false;

        collectionItems.forEach((item) => {
            const link = item.querySelector(".notion-link.notion-collection-list__item-anchor");
            if (link && link.getAttribute("href") === currentUrl) {
                item.classList.add("active-bg");
                const notionSemanticString = item.querySelector(".notion-semantic-string");
                if (notionSemanticString) {
                    notionSemanticString.classList.add("active-text");
                }
                containsCurrentPage = true;
            }
        });

        if (containsCurrentPage) {
            sectionToReopen = section;
        } else if (section.classList.contains("open")) {
            const sectionTitle = section.querySelector(".notion-collection-group__section-header");
            if (sectionTitle) {
                simulateClick(sectionTitle);
            }
        }
    });

    userClosedSection = false;
    if (sectionToReopen && !sectionToReopen.classList.contains("open")) {
        const sectionTitle = sectionToReopen.querySelector(".notion-collection-group__section-header");
        if (sectionTitle) {
            simulateClick(sectionTitle);
        }
    }
}

// function listener() {
//     const sections = document.querySelectorAll(".notion-collection-group__section");
//     sections.forEach((section) => {
//         section.addEventListener("click", () => {
//             setTimeout(function () {
//                 const collectionItems = section.querySelectorAll(".notion-collection-list__item");
//                 collectionItems.forEach((item) => {
//                     const link = item.querySelector(".notion-link.notion-collection-list__item-anchor");
//                     if (link && link.getAttribute("href") === currentUrl) {
//                         item.classList.add("active-bg");
//                         const notionSemanticString = item.querySelector(".notion-semantic-string");
//                         if (notionSemanticString) {
//                             notionSemanticString.classList.add("active-text");
//                         }
//                         containsCurrentPage = true;
//                     }
//                 });
//             }, 10);

//         });
//     });
// }

window.addEventListener('load', e => {
    processSections();
    // listener();

    window.events.on('routeChangeComplete', url => {
        processSections();
        // listener();
    })
})