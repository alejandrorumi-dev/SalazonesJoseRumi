// Funcionalidad para los filtros y búsqueda de productos - VERSIÓN CORREGIDA

export function setupFilters() {
  // Funcionalidad para los dropdowns personalizados
  function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const allDropdowns = document.querySelectorAll('.dropdown');
    
    // Cerrar todos los otros dropdowns
    allDropdowns.forEach(dd => {
      if (dd.id !== dropdownId) {
        dd.classList.remove('active');
        // Solo cerrar visualmente otros dropdowns que no sean de sorting
        if (dd.id !== 'sort-dropdown') {
          const options = dd.querySelector('.dropdown-options');
          if (options) options.style.display = 'none';
        }
      }
    });
    
    // Toggle del dropdown actual
    const isActive = dropdown.classList.contains('active');
    dropdown.classList.toggle('active');
    
    // Manejar visibilidad visual
    const options = dropdown.querySelector('.dropdown-options');
    if (options) {
      if (isActive) {
        options.style.display = 'none';
      } else {
        options.style.display = 'block';
      }
    }
  }

  // Manejar la selección de opciones
  function handleOptionSelect(option, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const label = dropdown.querySelector('label');
    const hiddenSelect = dropdown.querySelector('select');
    
    // Remover selección anterior
    const previousSelected = dropdown.querySelector('.dropdown-option.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    
    // Marcar nueva opción como seleccionada
    option.classList.add('selected');
    
    // Actualizar el texto del label (manteniendo el SVG)
    const svg = label.querySelector('svg');
    const svgClone = svg.cloneNode(true);
    
    // NUEVO: Manejar "Todos los productos" de forma especial
    if (option.dataset.value === '' || option.dataset.value === 'todos') {
      label.innerHTML = 'Categorías ';
    } else {
      label.innerHTML = option.textContent + ' ';
    }
    label.appendChild(svgClone);
    
    // Actualizar el select oculto
    if (hiddenSelect) {
      hiddenSelect.value = option.dataset.value;
    }
    
    // Cerrar el dropdown
    dropdown.classList.remove('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) options.style.display = 'none';
    
    // Disparar evento personalizado para filtrar productos
    const filterEvent = new CustomEvent('filterChange', {
      detail: {
        type: dropdownId.replace('-dropdown', ''),
        value: option.dataset.value,
        text: option.textContent
      }
    });
    document.dispatchEvent(filterEvent);
  }

  // Configurar event listeners SOLO para categorías (no para sorting)
  const categoryLabel = document.querySelector('#categories-dropdown label');
  
  if (categoryLabel) {
    categoryLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown('categories-dropdown');
    });
  }

  // Event listeners para todas las opciones de los dropdowns (solo categorías)
  const categoryOptions = document.querySelectorAll('#categories-dropdown .dropdown-option');
  categoryOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = option.closest('.dropdown');
      handleOptionSelect(option, dropdown.id);
    });
  });
  
  // Event listener para el botón de productos destacados
  const btnDestacados = document.querySelector('.btn-destacados');
  if (btnDestacados) {
    btnDestacados.addEventListener('click', function() {
      console.log('Mostrar productos destacados');
      
      // Disparar evento personalizado
      const highlightEvent = new CustomEvent('showHighlighted');
      document.dispatchEvent(highlightEvent);
      
      // Aquí puedes agregar la lógica para mostrar productos destacados
      // Por ejemplo: filtrar productos con una propiedad 'destacado: true'
    });
  }
  
  // Event listener para el buscador con debounce
  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      
      // Limpiar timeout anterior
      clearTimeout(searchTimeout);
      
      // Crear nuevo timeout para evitar búsquedas excesivas
      searchTimeout = setTimeout(() => {
        console.log('Buscando:', searchTerm);
        
        // Disparar evento personalizado para búsqueda
        const searchEvent = new CustomEvent('searchProducts', {
          detail: { searchTerm }
        });
        document.dispatchEvent(searchEvent);
        
      }, 300); // Esperar 300ms después de que el usuario pare de escribir
    });

    // Limpiar búsqueda cuando se borre el input
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        this.value = '';
        const searchEvent = new CustomEvent('searchProducts', {
          detail: { searchTerm: '' }
        });
        document.dispatchEvent(searchEvent);
      }
    });
  }

  // Cerrar dropdowns al hacer clic fuera - MEJORADO
  document.addEventListener('click', function(event) {
    // Solo cerrar dropdowns que no sean de sorting (que maneja su propio cierre)
    const dropdowns = document.querySelectorAll('.dropdown:not(#sort-dropdown)');
    
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
        // Asegurar cierre visual
        const options = dropdown.querySelector('.dropdown-options');
        if (options) options.style.display = 'none';
      }
    });
  });

  // Cerrar dropdowns con tecla Escape - MEJORADO
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      // Solo cerrar dropdowns que no sean de sorting
      const dropdowns = document.querySelectorAll('.dropdown:not(#sort-dropdown)');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        const options = dropdown.querySelector('.dropdown-options');
        if (options) options.style.display = 'none';
      });
    }
  });
}

// Función adicional para resetear filtros
export function resetFilters() {
  const categoryLabel = document.querySelector('#categories-dropdown label');
  const sortLabel = document.querySelector('#sort-dropdown label');
  const searchInput = document.querySelector('input[type="search"]');
  
  // Resetear labels a su estado inicial
  if (categoryLabel) {
    const svg = categoryLabel.querySelector('svg');
    const svgClone = svg.cloneNode(true);
    categoryLabel.innerHTML = 'Categorías ';
    categoryLabel.appendChild(svgClone);
  }
  
  if (sortLabel) {
    const svg = sortLabel.querySelector('svg');
    const svgClone = svg.cloneNode(true);
    sortLabel.innerHTML = 'Ordenar ';
    sortLabel.appendChild(svgClone);
  }
  
  // Limpiar input de búsqueda
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Resetear selects ocultos
  const categoriesSelect = document.getElementById('categories');
  const sortSelect = document.getElementById('sort');
  
  if (categoriesSelect) categoriesSelect.value = '';
  if (sortSelect) sortSelect.value = '';
  
  // Remover clases selected de todas las opciones
  const selectedOptions = document.querySelectorAll('.dropdown-option.selected');
  selectedOptions.forEach(option => option.classList.remove('selected'));
  
  // Cerrar todos los dropdowns
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.classList.remove('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) options.style.display = 'none';
  });
  
  // Disparar evento de reset
  const resetEvent = new CustomEvent('filtersReset');
  document.dispatchEvent(resetEvent);
}