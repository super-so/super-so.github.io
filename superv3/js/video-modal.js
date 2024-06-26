const handleVideoModal = (url, mount) => {
  if (mount) {
    if (url === '/') {
      const openModalBtn = document.querySelector('#block-ca319f58fb8f4a0ab5bb814aeffd6062')
      const videoModal = document.querySelector('#block-0566e957626d48dfb97500a48d34fe8e')
      const closeModalBtn = document.querySelector('#block-89f4c511b4d945a586e530a8a1f4bc13')
      const onOpenModalBtnClick = () => {
        videoModal.classList.add("modal-open");
      }
      const onCloseModalBtnClick = () => {
        videoModal.classList.remove("modal-open");
      }
  
      openModalBtn.addEventListener('click', onOpenModalBtnClick);
      closeModalBtn.addEventListener('click', onCloseModalBtnClick);
    }
  } else {
    if (url === '/') {
      const video = document.getElementById("#block-579642c3c43749958ba0f1a38e9ecdb7 video");
      const openModalBtn = document.querySelector('#block-ca319f58fb8f4a0ab5bb814aeffd6062')
      const videoModal = document.querySelector('#block-0566e957626d48dfb97500a48d34fe8e')
      const closeModalBtn = document.querySelector('#block-89f4c511b4d945a586e530a8a1f4bc13')
      const onOpenModalBtnClick = () => {
        videoModal.classList.add("modal-open");
        video.play();
      }
      const onCloseModalBtnClick = () => {
        videoModal.classList.remove("modal-open");
        video.pause();
      }
  
      openModalBtn.removeEventListener('click', onOpenModalBtnClick);
      closeModalBtn.removeEventListener('click', onCloseModalBtnClick);
    }
  }
}

const onRouteChangeComplete = (url) => handleVideoModal(url, true)
const onRouteChangeStart = () => handleVideoModal(next.router.state.route, false)

const onLoad = () => {
  onRouteChangeComplete(next.router.state.route)
  next.router.events.on('routeChangeStart', onRouteChangeStart)
  next.router.events.on('routeChangeComplete', onRouteChangeComplete)
}

window.onload = onLoad