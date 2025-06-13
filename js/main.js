// Importar el archivo de las navegaciones
import { setupHamburgerMenu } from '../js/navigation.js';

// Importar el archivo de las animaciones
import { animateTitle } from '../js/animations.js';

// Importar el archivo de los filtros
import { setupFilters, resetFilters } from '../js/filters.js';

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
      // Aquí puedes agregar la lógica para filtrar productos por búsqueda
    });
    
    document.addEventListener('filterChange', (e) => {
      console.log('Filtro cambiado:', e.detail);
      // Aquí puedes agregar la lógica para filtrar productos por categoría u ordenar
    });
    
    document.addEventListener('showHighlighted', () => {
      console.log('Mostrar productos destacados');
      // Aquí puedes agregar la lógica para mostrar solo productos destacados
    });
    
    document.addEventListener('filtersReset', () => {
      console.log('Filtros reseteados');
      // Aquí puedes agregar la lógica para mostrar todos los productos
    });
  }
});

// Hacer disponible la función resetFilters globalmente si es necesario
window.resetFilters = resetFilters;