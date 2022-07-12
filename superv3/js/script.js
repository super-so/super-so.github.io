
// const card = document.querySelector("#block-46a1c2fe8a194580a4e2adb75269c77b");
// const motionMatchMedia = window.matchMedia("(prefers-reduced-motion)");
// const THRESHOLD = 5;

// function handleHover(e) {
//   const { clientX, clientY, currentTarget } = e;
//   const { clientWidth, clientHeight, offsetLeft, offsetTop } = currentTarget;

//   const horizontal = (clientX - offsetLeft) / clientWidth;
//   const vertical = (clientY - offsetTop) / clientHeight;
//   const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2);
//   const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2);
  
//   card.style.transform = `perspective(${clientWidth}px)  rotateX(${rotateX}deg) rotateY(${rotateX}deg) scale3d(1.01, 1.01, 1.01)`;
// }

// function resetStyles(e) {
//   card.style.transform = `perspective(${e.currentTarget.clientWidth}px) rotateX(0deg) rotateY(0deg)`;
// }

// if (!motionMatchMedia.matches) {
//     card.addEventListener("mousemove", handleHover);
//     card.addEventListener("mouseleave", resetStyles);
// }


// DB VIEW SWITCHER
const setActiveTab = (options, currentTabContent) => {
  const active = Array.from(options).find(el => el.textContent === currentTabContent);
  active.classList.add('active-filter')

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const activeFilter = document.querySelector('.active-filter')
      if (activeFilter) {
        activeFilter.classList.remove('active-filter')
      }
      option.classList.add('active-filter')
    })
  })
}

const onRouteChangeComplete = (url) => {
  if (url === '/') {
    // Video modal
    const openModalBtn = document.querySelector('#block-ca319f58fb8f4a0ab5bb814aeffd6062')
    const videoModal = document.querySelector('#block-0566e957626d48dfb97500a48d34fe8e')
    const closeModalBtn = document.querySelector('#block-89f4c511b4d945a586e530a8a1f4bc13')
    const onOpenModalBtnClick = () => {
      console.log('OPEN')
      videoModal.classList.add("modal-open");
    }
    const onCloseModalBtnClick = () => {
      console.log('CLOSE')
      videoModal.classList.remove("modal-open");
    }

    openModalBtn.addEventListener('click', onOpenModalBtnClick);
    closeModalBtn.addEventListener('click', onCloseModalBtnClick);
  }

  const options = document.querySelectorAll('.notion-dropdown__option')
  const currentTab = document.querySelector('.notion-dropdown__button-title')

  if (options && currentTab) {
    setActiveTab(options, currentTab.textContent)
  }
}

const onRouteChangeStart = () => {
  if (next.router.state.route === '/') {
    const openModalBtn = document.querySelector('#block-ca319f58fb8f4a0ab5bb814aeffd6062')
    const videoModal = document.querySelector('#block-0566e957626d48dfb97500a48d34fe8e')
    const closeModalBtn = document.querySelector('#block-89f4c511b4d945a586e530a8a1f4bc13')
    const onOpenModalBtnClick = () => {
      console.log('OPEN')
      videoModal.classList.add("modal-open");
    }
    const onCloseModalBtnClick = () => {
      console.log('CLOSE')
      videoModal.classList.remove("modal-open");
    }

    openModalBtn.removeEventListener('click', onOpenModalBtnClick);
    closeModalBtn.removeEventListener('click', onCloseModalBtnClick);
  }
}

const onLoad = () => {
  console.log('LOADED')
  onRouteChangeComplete(next.router.state.route)
  next.router.events.on('routeChangeStart', onRouteChangeStart)
  next.router.events.on('routeChangeComplete', onRouteChangeComplete)
}

onLoad()

// Navbar Code
window.addEventListener("scroll", () => {
  const nav = document.getElementsByClassName("super-navbar")[0]
  if (window.scrollY > 50) {
      nav.classList.add("scrolled")
  } else {
      nav.classList.remove("scrolled")
  }
})