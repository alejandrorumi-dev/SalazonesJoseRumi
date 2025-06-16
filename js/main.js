// Importar el archivo de las navegaciones
import { setupHamburgerMenu } from '../js/navigation.js';

// Importar el archivo de las animaciones
import { animateTitle } from '../js/animations.js';

// Importar el archivo de los filtros
import { setupFilters, resetFilters } from '../js/filters.js';

// Importar el archivo del carrusel
import { setupCarousel } from '../js/carousel.js';

// Importar el sistema de paginación
import { initPagination } from '../js/pagination.js';

// Importar el sistema de búsqueda
import { initSearchSystem } from '../js/search.js';

// Importar el sistema de cantidades
import { initQuantitySystem } from '../js/quantity.js';

document.addEventListener('DOMContentLoaded', () => {
  // Configurar menú hamburguesa
  setupHamburgerMenu();

  // Configurar animación del título (solo si estamos en la página principal)
  if (document.querySelector('.main-title')) {
    animateTitle();
  }

  // Configurar filtros (solo si estamos en la página de pedidos)
  if (document.querySelector('.product-actions')) {
    setupFilters();

    // Event listeners para los eventos personalizados de filtros
    document.addEventListener('searchProducts', (e) => {
      console.log('Evento de búsqueda:', e.detail.searchTerm);
      // La paginación se encarga automáticamente de esto
    });

    document.addEventListener('filterChange', (e) => {
      console.log('Filtro cambiado:', e.detail);
      // La paginación se encarga automáticamente de esto
    });

    document.addEventListener('showHighlighted', () => {
      console.log('Mostrar productos destacados');
      // Aquí puedes agregar la lógica para mostrar solo productos destacados
    });

    document.addEventListener('filtersReset', () => {
      console.log('Filtros reseteados');
      // La paginación se encarga automáticamente de esto
    });
  }

  // === Configurar carrusel de recomendaciones ===
  if (document.querySelector('.recommendations-carousel')) {
    setupCarousel();
    console.log('🎠 Carrusel de recomendaciones activado');
  }

  // === NUEVO: Configurar sistema de búsqueda ===
  if (document.querySelector('#search-products')) {
    const searchSystem = initSearchSystem();
    console.log('🔍 Sistema de búsqueda con sugerencias activado');
    
    // Hacer disponible globalmente para debug (opcional)
    window.searchSystem = searchSystem;
  }

  // === NUEVO: Configurar sistema de cantidades ===
  if (document.querySelector('.product-card')) {
    const quantitySystem = initQuantitySystem();
    console.log('📦 Sistema de cantidades activado');
    
    // Hacer disponible globalmente para debug (opcional)
    window.quantitySystem = quantitySystem;
  }

  // === NUEVO: Configurar sistema de paginación ===
  if (document.querySelector('.product-cards')) {
    const pagination = initPagination();
    console.log('📄 Sistema de paginación activado');

    // Hacer disponible globalmente para debug (opcional)
    window.pagination = pagination;
  }
});

// Hacer disponible la función resetFilters globalmente si es necesario
window.resetFilters = resetFilters;