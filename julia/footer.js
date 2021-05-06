window.onload = function () {
  const copyright = document.createElement('p')
  copyright.innerHTML = 'ily all, have a great day!'
  copyright.style.color = '#ffffff'
  copyright.style.margin = '50px 0 0 0'

  const img = document.createElement("img")
  img.setAttribute('src', 'https://code.tr.af/julia/assets/logo.jpg')
  img.style.width = '160px'
  img.setAttribute('class', 'logo')

  const footerLinks = document.createElement('div')
  footerLinks.setAttribute('class', 'super-footer-links')

  const link1 = document.createElement("a")
  link1.innerHTML = 'Newsletter'
  link1.setAttribute('href', 'https://newsletter.com')
  link1.setAttribute('class', 'link')

  const link2 = document.createElement("a")
  link2.innerHTML = 'Instagram'
  link2.setAttribute('href', 'http://instagram.com/juliakcrist')
  link2.setAttribute('class', 'link')

  const link3 = document.createElement("a")
  link3.innerHTML = 'Pinterest'
  link3.setAttribute('href', 'http://pinterest.com/juliakcrist')
  link3.setAttribute('class', 'link')

  const link4 = document.createElement("a")
  link4.innerHTML = 'YouTube'
  link4.setAttribute('href', 'http://youtube.com/juliakcrist')
  link4.setAttribute('class', 'link')

  const footer = document.createElement('div')
  footer.setAttribute('class', 'super-footer')

  footerLinks.appendChild(link1)
  footerLinks.appendChild(link2)
  footerLinks.appendChild(link3)
  footerLinks.appendChild(link4)
  footer.appendChild(img)
  footer.appendChild(footerLinks)
  footer.appendChild(copyright)

  document.body.appendChild(footer)
}