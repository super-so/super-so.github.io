const card = document.querySelector("#block-46a1c2fe8a194580a4e2adb75269c77b");
const motionMatchMedia = window.matchMedia("(prefers-reduced-motion)");
const THRESHOLD = 5;

function handleHover(e) {
  const { clientX, clientY, currentTarget } = e;
  const { clientWidth, clientHeight, offsetLeft, offsetTop } = currentTarget;

  const horizontal = (clientX - offsetLeft) / clientWidth;
  const vertical = (clientY - offsetTop) / clientHeight;
  const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2);
  const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2);
  
  card.style.transform = `perspective(${clientWidth}px)  rotateX(${rotateX}deg) rotateY(${rotateX}deg) scale3d(1.01, 1.01, 1.01)`;
}

function resetStyles(e) {
  card.style.transform = `perspective(${e.currentTarget.clientWidth}px) rotateX(0deg) rotateY(0deg)`;
}

if (!motionMatchMedia.matches) {
    card.addEventListener("mousemove", handleHover);
    card.addEventListener("mouseleave", resetStyles);
}