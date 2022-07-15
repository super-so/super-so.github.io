// NAVBAR
const onNavbarScroll = () => {
  const nav = document.getElementsByClassName("super-navbar")[0]
  return window.scrollY > 50
    ? nav.classList.add("scrolled")
    : nav.classList.remove("scrolled")
}

window.addEventListener("scroll", onNavbarScroll)