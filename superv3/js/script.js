// NAVBAR
const onNavbarScroll = () => {
  const nav = document.getElementsByClassName("super-navbar")[0]
  return window.scrollY > 50
    ? nav.classList.add("scrolled")
    : nav.classList.remove("scrolled")
}

window.addEventListener("scroll", onNavbarScroll)

// INTERCOM
window.intercomSettings = {
  api_base: "https://api-iam.intercom.io",
  app_id: "e4lzyrcc"
};
(function () {
  var w = window;
  var ic = w.Intercom;
  if (typeof ic === "function") {
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var d = document;
    var i = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.Intercom = i;
    var l = function () {
      var s = d.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://widget.intercom.io/widget/e4lzyrcc';
      var x = d.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    };
    setTimeout(l, 1500);
  }
})();

// HOTJAR
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:3067055,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.defer=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    setTimeout(() => a.appendChild(r), 1500);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');