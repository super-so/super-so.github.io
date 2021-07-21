// Active nav links
$('a[href$="/' + location.pathname.split("/")[1] + '"]').addClass('nav-active');

// Add background to nav on scroll
$(window).scroll(function(event){
     var scroll = $(this).scrollTop();
     if (scroll > 0){
         $('.notion-navbar').addClass('nav-scrolled');
         $('.notion-quote').addClass('quote-scrolled');
     } else {
         $('.notion-navbar').removeClass('nav-scrolled');
         $('.notion-quote').removeClass('quote-scrolled');
     }
});

window.addEventListener('load', function(event) {
    $('.notion-quote .bg-yellow').click(function(){
        $('.notion-quote .notion-semantic-string').toggleClass('menu-show');
    });
});

// $(function(){
//     // Mobile nav menu
//     $('.notion-quote .bg-yellow').click(function(){
//         $('.notion-quote .notion-semantic-string').toggleClass('menu-show');
//     });
// });