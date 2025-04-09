// Añade esto a tu archivo assets/js/script.js

/*Marca el enlace activo en el menú*/ 
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene la URL actual
    const currentLocation = window.location.pathname;
    
    // Obtiene todos los enlaces del menú
    const menuItems = document.querySelectorAll('.header__item a');
    
    // Revisa cada enlace para ver si coincide con la URL actual
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        
        // Si la URL termina con el href del enlace, marca ese ítem como activo
        if (currentLocation.endsWith(href)) {
            item.parentElement.classList.add('header__item--active');
        }
    });
});

/*Menú hamburguesa*/
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.header__nav');
    
    hamburger.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.header__item a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
        });
    });
});
