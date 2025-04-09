// Añade esto a tu archivo assets/js/script.js

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
