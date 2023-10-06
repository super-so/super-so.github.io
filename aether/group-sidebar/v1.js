let userClosedSection = false;
const currentUrl = window.location.pathname;
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
    sections.forEach((section) => {
        processSection(section);
    });
    userClosedSection = false;
}
function processSections() {
    
    const sections = document.querySelectorAll(".notion-collection-group__section");
    let sectionToReopen;
    sections.forEach((section) => {
        const collectionItems = section.querySelectorAll(".notion-collection-list__item");
        let containsCurrentPage = false;
        collectionItems.forEach((item) => {
            const link = item.querySelector(".notion-link.notion-collection-list__item-anchor");
            if (link && link.getAttribute("href") === currentUrl) {
                item.classList.add("highlighted-bg");
                const notionSemanticString = item.querySelector(".notion-semantic-string");
                if (notionSemanticString) {
                    notionSemanticString.classList.add("highlighted-text");
                }
                containsCurrentPage = true;
            }
        });
        if (containsCurrentPage) {
            sectionToReopen = section;
        } else if (section.classList.contains("open")) {
            // Close the section if it's not the current page's section
            const sectionTitle = section.querySelector(".notion-collection-group__section-header");
            if (sectionTitle) {
                simulateClick(sectionTitle);
            }
        }
    });
    userClosedSection = false;
    // Add the 'open' class back to the section containing the current page
    if (sectionToReopen && !sectionToReopen.classList.contains("open")) {
        const sectionTitle = sectionToReopen.querySelector(".notion-collection-group__section-header");
        if (sectionTitle) {
            simulateClick(sectionTitle);
        }
    }
}
function setupObserversAndListeners() {
    const sections = document.querySelectorAll(".notion-collection-group__section");
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                console.log("ChildList mutation detected");
                const section = mutation.target.closest(".notion-collection-group__section");
                if (section) {
                    const collectionList = section.querySelector(".notion-collection-list");
                    if (mutation.addedNodes.length && collectionList) {
                        console.log("Processing section due to childList mutation");
                        processSection(section);
                    }
                }
            } else if (mutation.type === "attributes" && mutation.attributeName === "href") {
                console.log("Href attribute mutation detected");
                const section = mutation.target.closest(".notion-collection-group__section");
                if (section) {
                    console.log("Processing section due to href attribute mutation");
                    processSection(section);
                }
            }
        });
    });
    sections.forEach((section) => {
        observer.observe(section, {
            childList: true,
            subtree: true,
        });
        const links = section.querySelectorAll(".notion-link.notion-collection-list__item-anchor");
        links.forEach((link) => {
            observer.observe(link, {
                attributes: true,
                attributeFilter: ["href"],
            });
        });
        // Add a click event listener to section headers
        const sectionTitle = section.querySelector(".notion-collection-group__section-header");
        if (sectionTitle) {
            sectionTitle.addEventListener("click", () => {
                console.log("Section header clicked");
                userClosedSection = true;
            });
        }
    });
}
document.addEventListener("DOMContentLoaded", function () {
    console.log("Initial page load");
    processSections();
    setupObserversAndListeners();
    // Add event listener for route changes
    const { router } = window.next;
    router.events.on("routeChangeComplete", () => {
        console.log("Route change complete");
        processSections();
        setupObserversAndListeners();
    });
});