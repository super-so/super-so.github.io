function clearBlock(el) {
    const node = el.parentElement.parentElement;
    node.innerHTML = '';
    return node;
}

const SELECTOR = 'code:not([super-embed-seen])';

function setupEmbeds() {
    document.querySelectorAll(SELECTOR).forEach((node) => {
        node.setAttribute('super-embed-seen', 1);
        if (node.innerText.startsWith('super-embed:')) {
            const code = node.innerText.replace('super-embed:', '');
            const parentNode = clearBlock(node);
            parentNode.innerHTML = code;
            
            parentNode.querySelectorAll('script').forEach((script) => {
                if (!script.src && script.innerText) {
                    eval(script.innerText);
                    script.remove();  // Removing the original inline script after evaluation
                } else {
                    const scr = document.createElement('script');
                    Array.from(script.attributes).forEach(attr => {
                        scr.setAttribute(attr.name, attr.value);
                    });
                    script.parentNode.insertBefore(scr, script.nextSibling); // Insert new script right after the original one
                    script.remove(); // Remove the original script
                }
            });
        }
    });
}

setupEmbeds();

var observer = new MutationObserver(function (mutations) {
    if (document.querySelector(SELECTOR)) {
        setupEmbeds();
    }
});

observer.observe(document, {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
});