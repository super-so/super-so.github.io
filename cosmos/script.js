function onPageLoad() {
    const header = document.querySelector('.notion-header');
    const html = document.querySelector('html');
    const moonIcon = 'https://sites.super.so/cosmos/images/moon-dark.svg';
    const sunIcon = 'https://sites.super.so/cosmos/images/sun-light.svg';
    
    const footerCover = () => {
      const footerCoverNode = document.querySelector('.footer-cover');
      if(footerCoverNode){
        footerCoverNode.remove();
      }
      const cover = document.querySelector('.notion-header__cover');
      const clone = cover.cloneNode(true);
      clone.classList.add('footer-cover');
      clone.classList.remove('notion-header__cover', 'has-cover');
      const content = document.querySelector('.super-content');
     
     content.appendChild(clone);
    }
    footerCover();
    
    const setTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      html.className = '';
      html.classList.add(savedTheme);
    }
    setTheme();
    
    const toggleTheme = () => {
      const navbar = document.querySelector('.super-navbar')
      const themeModeBtn = document.createElement('div')
      const themeModeImg = document.createElement('img')
      themeModeBtn.appendChild(themeModeImg)
      themeModeBtn.setAttribute('id', 'toggle-theme')
      themeModeImg.setAttribute('src', sunIcon)

      if(!document.querySelector('#toggle-theme')) {
        navbar.appendChild(themeModeBtn)
      }
      
      switch (html.classList[0]) {
        case 'theme-default':
            themeModeImg.setAttribute('src', moonIcon);
          break;
        case 'theme-blackout':
            themeModeImg.setAttribute('src', sunIcon);
          break;
        case 'theme-darkmode': 
            themeModeImg.setAttribute('src', sunIcon);
          break
        case 'theme-neutral': 
            themeModeImg.setAttribute('src', moonIcon);
      }
      
      themeModeBtn.addEventListener('click', () => {
        if(html.classList[0] == 'theme-default') {
          html.classList.remove('theme-default');
          html.classList.add('theme-blackout');
          themeModeImg.setAttribute('src', sunIcon);
         localStorage.setItem("theme", "theme-blackout");
        } else if (html.classList[0] == 'theme-blackout') {
          html.classList.remove('theme-blackout');
          html.classList.add('theme-default');
          themeModeImg.setAttribute('src', moonIcon);
          localStorage.setItem("theme", "theme-default");
        } else {
          html.classList.remove('theme-default');
          html.classList.add('theme-blackout');
          themeModeImg.setAttribute('src', sunIcon);
         localStorage.setItem("theme", "theme-blackout");
        }
      });
    }
    toggleTheme();


    const config = { subtree: true, characterData: true };

    const callback = function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData') {
                footerCover();
                setTheme();
                toggleTheme();
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(header, config);
}

document.addEventListener("DOMContentLoaded", onPageLoad);