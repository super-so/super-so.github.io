const initMenu = () => {
  if (document.querySelector('.notion-navbar')) {
    document.querySelector('.notion-navbar').insertAdjacentHTML('beforeend', '<div id="nav-toggle" class="js-menu menu"><span class="bar"></span></div>');
  }
  if (document.querySelector('.super-navbar')) {
    document.querySelector('.super-navbar__actions ').insertAdjacentHTML('beforeend', '<div id="nav-toggle" class="js-menu menu"><span class="bar"></span></div>');
  }

  // Click nav button toggle nav visibility
  document.getElementById('nav-toggle').addEventListener('click', function (event) {
    document.querySelector('.notion-root > .notion-column-list > .notion-column:nth-child(1)').classList.toggle('show-nav');
    document.querySelector('#nav-toggle').classList.toggle('active')
  });
}

const setActivePage = () => {
  const currentPage = document.querySelectorAll('a[href="' + window.location.pathname + '"]');
  currentPage.forEach(function (page) {
    if (!page.classList.contains('super-navbar__logo') && !page.parentNode.classList.contains('notion-image')) {
      page.classList.add('page-active')
    }
  });
}

window.addEventListener('load', e => {
  setActivePage()
  initMenu()

  next.router.events.on('routeChangeComplete', url => {
    setActivePage()
    document.querySelector('#nav-toggle').classList.remove('active')
  })
})