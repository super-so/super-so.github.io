// const initCodeCopy = () => {
//     const codeBlocks = document.querySelectorAll('pre[class*="language-"]');

//     codeBlocks.forEach((block) => {
//         const copyBtn = document.createElement('button');
//         copyBtn.setAttribute('class', 'copy-button');
//         copyBtn.innerHTML = `Copy <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" fill="currentColor"/></svg>`;

//         block.appendChild(copyBtn);
//     });

//     function copy(e) {
//         const btn = e.currentTarget;
//         const text = e.currentTarget.previousSibling.children[0].textContent;

//         navigator.clipboard.writeText(text).then(
//             () => {
//                 btn.innerHTML = `Copied! <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" fill="currentColor"/></svg>`;
//                 btn.setAttribute('style', 'opacity: 1');

//             },
//             () => alert('failed to copy'),
//         );

//         setTimeout(() => {
//             btn.removeAttribute('style');
//             btn.innerHTML = `Copy <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" fill="currentColor"/></svg>`;
//         }, 3000);
//     }

//     const copyButtons = document.querySelectorAll('.copy-button');

//     copyButtons.forEach((btn) => {
//         btn.addEventListener('click', copy);
//     });
// }


// const addCopyButtonToCodeBlocks = () => {
//     const codeBlocks = document.querySelectorAll('code[class*="language-"]');

//     codeBlocks.forEach((codeBlock) => {
//         const button = document.createElement('button');
//         button.classList.add('copy-to-clipboard-button')
//         button.innerHTML = `Copy <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" fill="currentColor"/></svg>`;

//         button.addEventListener('click', () => {
//             navigator.clipboard.writeText(codeBlock.innerText);
//             button.innerHTML = `Copied! <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" fill="currentColor"/></svg>`;
//             setTimeout(() => {
//                 button.innerHTML = `Copy <svg viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" fill="currentColor"/></svg>`;
//             }, 2000);
//         });
//         codeBlock.parentNode.insertBefore(button, codeBlock.nextSibling);
//     });
// }


const setActivePage = () => {
    const currentPage = document.querySelectorAll('a[href="' + window.location.pathname + '"]');
    currentPage.forEach(function (page) {
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
   // addCopyButtonToCodeBlocks()

    next.router.events.on('routeChangeComplete', url => {
        setActivePage()
      //  addCopyButtonToCodeBlocks()
    })
})