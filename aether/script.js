// New code
const initPrism = () => {
!function(){if("undefined"!=typeof Prism&&"undefined"!=typeof document){var t=[],e={},n=function(){};Prism.plugins.toolbar={};var r=Prism.plugins.toolbar.registerButton=function(n,r){var o;if(o="function"==typeof r?r:function(t){var e;return"function"==typeof r.onClick?((e=document.createElement("button")).type="button",e.addEventListener("click",function(){r.onClick.call(this,t)})):"string"==typeof r.url?(e=document.createElement("a")).href=r.url:e=document.createElement("span"),r.className&&e.classList.add(r.className),e.textContent=r.text,e},n in e){console.warn('There is a button with the key "'+n+'" registered already.');return}t.push(e[n]=o)},o=Prism.plugins.toolbar.hook=function(r){var o=r.element.parentNode;if(!(!o||!/pre/i.test(o.nodeName)||o.parentNode.classList.contains("code-toolbar"))){var a=document.createElement("div");a.classList.add("code-toolbar"),o.parentNode.insertBefore(a,o),a.appendChild(o);var i=document.createElement("div");i.classList.add("toolbar");var c=t,l=function t(e){for(;e;){var n=e.getAttribute("data-toolbar-order");if(null!=n){if((n=n.trim()).length)return n.split(/\s*,\s*/g);return[]}e=e.parentElement}}(r.element);l&&(c=l.map(function(t){return e[t]||n})),c.forEach(function(t){var e=t(r);if(e){var n=document.createElement("div");n.classList.add("toolbar-item"),n.appendChild(e),i.appendChild(n)}}),a.appendChild(i)}};r("label",function(t){var e,n,r=t.element.parentNode;if(r&&/pre/i.test(r.nodeName)&&r.hasAttribute("data-label")){var o=r.getAttribute("data-label");try{n=document.querySelector("template#"+o)}catch(a){}return n?e=n.content:(r.hasAttribute("data-url")?(e=document.createElement("a")).href=r.getAttribute("data-url"):e=document.createElement("span"),e.textContent=o),e}}),Prism.hooks.add("complete",o)}}(),function(){if("undefined"!=typeof Prism&&"undefined"!=typeof document){if(!Prism.plugins.toolbar){console.warn("Copy to Clipboard plugin loaded before Toolbar plugin.");return}Prism.plugins.toolbar.registerButton("copy-to-clipboard",function(e){var n=e.element,r=function t(e){var n={copy:"Copy","copy-error":"Press Ctrl+C to copy","copy-success":"Copied!","copy-timeout":5e3};for(var r in n){for(var o="data-prismjs-"+r,a=e;a&&!a.hasAttribute(o);)a=a.parentElement;a&&(n[r]=a.getAttribute(o))}return n}(n),o=document.createElement("button");o.className="copy-to-clipboard-button",o.setAttribute("type","button");var a=document.createElement("span");return o.appendChild(a),c("copy"),function e(n,r){n.addEventListener("click",function(){var e;e=r,navigator.clipboard?navigator.clipboard.writeText(e.getText()).then(e.success,function(){t(e)}):t(e)})}(o,{getText:function(){return n.textContent},success:function(){c("copy-success"),i()},error:function(){c("copy-error"),setTimeout(function(){var t;t=n,window.getSelection().selectAllChildren(t)},1),i()}}),o;function i(){setTimeout(function(){c("copy")},r["copy-timeout"])}function c(t){a.textContent=r[t],o.setAttribute("data-copy-state",t)}})}function t(t){var e=document.createElement("textarea");e.value=t.getText(),e.style.top="0",e.style.left="0",e.style.position="fixed",document.body.appendChild(e),e.focus(),e.select();try{var n=document.execCommand("copy");setTimeout(function(){n?t.success():t.error()},1)}catch(r){setTimeout(function(){t.error(r)},1)}document.body.removeChild(e)}}();
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
    initPrism()
    next.router.events.on('routeChangeComplete', url => {
        setActivePage()
        initPrism()
    })
})