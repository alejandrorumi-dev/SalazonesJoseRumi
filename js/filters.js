// Funcionalidad para los filtros y búsqueda de productos

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
      }
    });
    
    // Toggle del dropdown actual
    dropdown.classList.toggle('active');
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
    label.innerHTML = option.textContent + ' ';
    label.appendChild(svgClone);
    
    // Actualizar el select oculto
    if (hiddenSelect) {
      hiddenSelect.value = option.dataset.value;
    }
    
    // Cerrar el dropdown
    dropdown.classList.remove('active');
    
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

  // Configurar event listeners para los labels clicables
  const categoryLabel = document.querySelector('#categories-dropdown label');
  const sortLabel = document.querySelector('#sort-dropdown label');
  
  if (categoryLabel) {
    categoryLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown('categories-dropdown');
    });
  }
  
  if (sortLabel) {
    sortLabel.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown('sort-dropdown');
    });
  }

  // Event listeners para todas las opciones de los dropdowns
  const allOptions = document.querySelectorAll('.dropdown-option');
  allOptions.forEach(option => {
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

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
      }
    });
  });

  // Cerrar dropdowns con tecla Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const dropdowns = document.querySelectorAll('.dropdown');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
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
  dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
  
  // Disparar evento de reset
  const resetEvent = new CustomEvent('filtersReset');
  document.dispatchEvent(resetEvent);
}