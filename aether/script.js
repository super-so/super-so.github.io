// New code
const initPrism = () => {
    (function () {
    
        if (typeof Prism === 'undefined' || typeof document === 'undefined') {
            return;
        }
    
        var callbacks = [];
        var map = {};
        var noop = function () {};
    
        Prism.plugins.toolbar = {};
    
        /**
         * @typedef ButtonOptions
         * @property {string} text The text displayed.
         * @property {string} [url] The URL of the link which will be created.
         * @property {Function} [onClick] The event listener for the `click` event of the created button.
         * @property {string} [className] The class attribute to include with element.
         */
    
        /**
         * Register a button callback with the toolbar.
         *
         * @param {string} key
         * @param {ButtonOptions|Function} opts
         */
        var registerButton = Prism.plugins.toolbar.registerButton = function (key, opts) {
            var callback;
    
            if (typeof opts === 'function') {
                callback = opts;
            } else {
                callback = function (env) {
                    var element;
    
                    if (typeof opts.onClick === 'function') {
                        element = document.createElement('button');
                        element.type = 'button';
                        element.addEventListener('click', function () {
                            opts.onClick.call(this, env);
                        });
                    } else if (typeof opts.url === 'string') {
                        element = document.createElement('a');
                        element.href = opts.url;
                    } else {
                        element = document.createElement('span');
                    }
    
                    if (opts.className) {
                        element.classList.add(opts.className);
                    }
    
                    element.textContent = opts.text;
    
                    return element;
                };
            }
    
            if (key in map) {
                console.warn('There is a button with the key "' + key + '" registered already.');
                return;
            }
    
            callbacks.push(map[key] = callback);
        };
    
        /**
         * Returns the callback order of the given element.
         *
         * @param {HTMLElement} element
         * @returns {string[] | undefined}
         */
        function getOrder(element) {
            while (element) {
                var order = element.getAttribute('data-toolbar-order');
                if (order != null) {
                    order = order.trim();
                    if (order.length) {
                        return order.split(/\s*,\s*/g);
                    } else {
                        return [];
                    }
                }
                element = element.parentElement;
            }
        }
    
        /**
         * Post-highlight Prism hook callback.
         *
         * @param env
         */
        var hook = Prism.plugins.toolbar.hook = function (env) {
            // Check if inline or actual code block (credit to line-numbers plugin)
            var pre = env.element.parentNode;
            if (!pre || !/pre/i.test(pre.nodeName)) {
                return;
            }
    
            // Autoloader rehighlights, so only do this once.
            if (pre.parentNode.classList.contains('code-toolbar')) {
                return;
            }
    
            // Create wrapper for <pre> to prevent scrolling toolbar with content
            var wrapper = document.createElement('div');
            wrapper.classList.add('code-toolbar');
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
    
            // Setup the toolbar
            var toolbar = document.createElement('div');
            toolbar.classList.add('toolbar');
    
            // order callbacks
            var elementCallbacks = callbacks;
            var order = getOrder(env.element);
            if (order) {
                elementCallbacks = order.map(function (key) {
                    return map[key] || noop;
                });
            }
    
            elementCallbacks.forEach(function (callback) {
                var element = callback(env);
    
                if (!element) {
                    return;
                }
    
                var item = document.createElement('div');
                item.classList.add('toolbar-item');
    
                item.appendChild(element);
                toolbar.appendChild(item);
            });
    
            // Add our toolbar to the currently created wrapper of <pre> tag
            wrapper.appendChild(toolbar);
        };
    
        registerButton('label', function (env) {
            var pre = env.element.parentNode;
            if (!pre || !/pre/i.test(pre.nodeName)) {
                return;
            }
    
            if (!pre.hasAttribute('data-label')) {
                return;
            }
    
            var element; var template;
            var text = pre.getAttribute('data-label');
            try {
                // Any normal text will blow up this selector.
                template = document.querySelector('template#' + text);
            } catch (e) { /* noop */ }
    
            if (template) {
                element = template.content;
            } else {
                if (pre.hasAttribute('data-url')) {
                    element = document.createElement('a');
                    element.href = pre.getAttribute('data-url');
                } else {
                    element = document.createElement('span');
                }
    
                element.textContent = text;
            }
    
            return element;
        });
    
        /**
         * Register the toolbar with Prism.
         */
        Prism.hooks.add('complete', hook);
    }());
    
    (function () {
    
        if (typeof Prism === 'undefined' || typeof document === 'undefined') {
            return;
        }
    
        if (!Prism.plugins.toolbar) {
            console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');
    
            return;
        }
    
        /**
         * When the given elements is clicked by the user, the given text will be copied to clipboard.
         *
         * @param {HTMLElement} element
         * @param {CopyInfo} copyInfo
         *
         * @typedef CopyInfo
         * @property {() => string} getText
         * @property {() => void} success
         * @property {(reason: unknown) => void} error
         */
        function registerClipboard(element, copyInfo) {
            element.addEventListener('click', function () {
                copyTextToClipboard(copyInfo);
            });
        }
        // https://stackoverflow.com/a/30810322/7595472
    
        /** @param {CopyInfo} copyInfo */
        function fallbackCopyTextToClipboard(copyInfo) {
            var textArea = document.createElement('textarea');
            textArea.value = copyInfo.getText();
    
            // Avoid scrolling to bottom
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
    
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
    
            try {
                var successful = document.execCommand('copy');
                setTimeout(function () {
                    if (successful) {
                        copyInfo.success();
                    } else {
                        copyInfo.error();
                    }
                }, 1);
            } catch (err) {
                setTimeout(function () {
                    copyInfo.error(err);
                }, 1);
            }
    
            document.body.removeChild(textArea);
        }
        /** @param {CopyInfo} copyInfo */
        function copyTextToClipboard(copyInfo) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(copyInfo.getText()).then(copyInfo.success, function () {
                    // try the fallback in case `writeText` didn't work
                    fallbackCopyTextToClipboard(copyInfo);
                });
            } else {
                fallbackCopyTextToClipboard(copyInfo);
            }
        }
    
        /**
         * Selects the text content of the given element.
         *
         * @param {Element} element
         */
        function selectElementText(element) {
            // https://stackoverflow.com/a/20079910/7595472
            window.getSelection().selectAllChildren(element);
        }
    
        /**
         * Traverses up the DOM tree to find data attributes that override the default plugin settings.
         *
         * @param {Element} startElement An element to start from.
         * @returns {Settings} The plugin settings.
         * @typedef {Record<"copy" | "copy-error" | "copy-success" | "copy-timeout", string | number>} Settings
         */
    function getSettings(startElement) {
            /** @type {Settings} */
            var settings = {
                'copy': 'Copy',
                'copy-error': 'Press Ctrl+C to copy',
                'copy-success': 'Copied!',
                'copy-timeout': 5000
            };
    
            var prefix = 'data-prismjs-';
            for (var key in settings) {
                var attr = prefix + key;
                var element = startElement;
                while (element && !element.hasAttribute(attr)) {
                    element = element.parentElement;
                }
                if (element) {
                    settings[key] = element.getAttribute(attr);
                }
            }
            return settings;
        }
    
        Prism.plugins.toolbar.registerButton('copy-to-clipboard', function (env) {
            var element = env.element;
    
            var settings = getSettings(element);
    
            var linkCopy = document.createElement('button');
            linkCopy.className = 'copy-to-clipboard-button';
            linkCopy.setAttribute('type', 'button');
            var linkSpan = document.createElement('span');
            linkCopy.appendChild(linkSpan);
    
            setState('copy');
    
            registerClipboard(linkCopy, {
                getText: function () {
                    return element.textContent;
                },
                success: function () {
                    setState('copy-success');
    
                    resetText();
                },
                error: function () {
                    setState('copy-error');
    
                    setTimeout(function () {
                        selectElementText(element);
                    }, 1);
    
                    resetText();
                }
            });
    
            return linkCopy;
    
            function resetText() {
                setTimeout(function () { setState('copy'); }, settings['copy-timeout']);
            }
    
            /** @param {"copy" | "copy-error" | "copy-success"} state */
            function setState(state) {
                linkSpan.textContent = settings[state];
                linkCopy.setAttribute('data-copy-state', state);
            }
        });
    }());
    }; 
initPrism()

const setActivePage = () => {
    const currentPage = document.querySelectorAll('a[href="' + window.location.pathname + '"]');
    currentPage.forEach(function(page) {
        if (!page.classList.contains('super-navbar__logo') && !page.classList.contains('super-footer__logo') && !page.parentNode.classList.contains('notion-image')) {
            page.classList.add('page-active')
        }
        const pageIcon = page.querySelector('.notion-page__icon')
        if (pageIcon) {
            pageIcon.setAttribute("style", "opacity:1!important; filter:grayscale(0%)!important;")
        }
    });
}

window.addEventListener('load', e => {
    setActivePage()
    next.router.events.on('routeChangeComplete', url => {
        setActivePage()
    })
})