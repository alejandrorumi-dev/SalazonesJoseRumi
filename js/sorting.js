// js/sorting.js - Sistema de ordenación de productos - VERSIÓN CORREGIDA

export class SortingSystem {
  constructor() {
    this.currentSort = '';
    this.debug = true;
    this.init();
  }

  init() {
    this.log('🔄 Iniciando sistema de ordenación...');
    this.setupSortDropdown();
    this.log('✅ Sistema de ordenación inicializado');
  }

  // === CONFIGURAR DROPDOWN DE ORDENACIÓN ===
  setupSortDropdown() {
    const sortDropdown = document.getElementById('sort-dropdown');
    if (!sortDropdown) {
      this.log('❌ No se encontró el dropdown de ordenación');
      return;
    }

    const label = sortDropdown.querySelector('label');
    const options = sortDropdown.querySelectorAll('.dropdown-option');
    const hiddenSelect = sortDropdown.querySelector('select');

    this.log(`📊 Configurando dropdown con ${options.length} opciones`);

    // Event listener para abrir/cerrar dropdown
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSortDropdown(sortDropdown);
      });
    }

    // Event listeners para las opciones
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const sortValue = option.dataset.value;
        const sortText = option.textContent.trim();

        this.log(`🔄 Aplicando ordenación: ${sortText} (${sortValue})`);

        // Marcar opción como seleccionada
        this.updateSelectedOption(sortDropdown, option);
        
        // Actualizar label
        this.updateSortDropdownLabel(sortDropdown, sortText);
        
        // Cerrar dropdown
        this.closeSortDropdown(sortDropdown);

        // Actualizar select oculto
        if (hiddenSelect) {
          hiddenSelect.value = sortValue;
        }

        // IMPORTANTE: Disparar evento para que pagination.js maneje la lógica
        this.dispatchSortEvent(sortValue, sortText);
        this.currentSort = sortValue;
      });
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#sort-dropdown')) {
        this.closeSortDropdown(sortDropdown);
      }
    });
  }

  // === MARCAR OPCIÓN SELECCIONADA ===
  updateSelectedOption(dropdown, selectedOption) {
    // Remover selección anterior
    const previousSelected = dropdown.querySelector('.dropdown-option.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    
    // Marcar nueva opción como seleccionada
    selectedOption.classList.add('selected');
  }

  // === TOGGLE DROPDOWN ===
  toggleSortDropdown(dropdown) {
    const isActive = dropdown.classList.contains('active');

    // Cerrar otros dropdowns (categorías, etc.)
    this.closeOtherDropdowns();

    if (isActive) {
      this.closeSortDropdown(dropdown);
    } else {
      this.openSortDropdown(dropdown);
    }
  }

  // === ABRIR DROPDOWN ===
  openSortDropdown(dropdown) {
    dropdown.classList.add('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) {
      options.style.display = 'block';
    }
  }

  // === CERRAR DROPDOWN ===
  closeSortDropdown(dropdown) {
    dropdown.classList.remove('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) {
      options.style.display = 'none';
    }
  }

  // === CERRAR OTROS DROPDOWNS ===
  closeOtherDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      if (dropdown.id !== 'sort-dropdown') {
        dropdown.classList.remove('active');
        // NO forzar cierre visual para dejar que cada sistema maneje su propio estado
      }
    });
  }

  // === ACTUALIZAR LABEL DEL DROPDOWN ===
  updateSortDropdownLabel(dropdown, selectedText) {
    const label = dropdown.querySelector('label');
    const arrow = label.querySelector('svg');

    if (label) {
      // Para "Solo disponibles" mostrar texto especial
      if (selectedText.toLowerCase().includes('disponible')) {
        label.innerHTML = 'Solo disponibles ';
      } else {
        label.innerHTML = `Ordenar: ${selectedText} `;
      }
      
      if (arrow) {
        label.appendChild(arrow.cloneNode(true));
      }
    }
  }

  // === DISPARAR EVENTO DE ORDENACIÓN ===
  dispatchSortEvent(sortValue, sortText) {
    const sortEvent = new CustomEvent('productsSort', {
      detail: {
        sortValue: sortValue,
        sortText: sortText,
        timestamp: Date.now()
      },
      bubbles: true
    });

    document.dispatchEvent(sortEvent);
    this.log(`📡 Evento de ordenación disparado: ${sortText}`);
  }

  // === RESETEAR ORDENACIÓN ===
  resetSorting() {
    this.currentSort = '';

    // Resetear label del dropdown
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
      // Resetear label
      const label = sortDropdown.querySelector('label');
      const arrow = label?.querySelector('svg');
      if (label) {
        label.innerHTML = 'Ordenar ';
        if (arrow) {
          label.appendChild(arrow.cloneNode(true));
        }
      }

      // Remover selección de opciones
      const selectedOption = sortDropdown.querySelector('.dropdown-option.selected');
      if (selectedOption) {
        selectedOption.classList.remove('selected');
      }

      // Resetear select oculto
      const hiddenSelect = sortDropdown.querySelector('select');
      if (hiddenSelect) {
        hiddenSelect.value = '';
      }
    }

    // Disparar evento de reset
    this.dispatchSortEvent('', 'Sin ordenar');

    this.log('🔄 Ordenación reseteada');
  }

  // === OBTENER ORDENACIÓN ACTUAL ===
  getCurrentSort() {
    return {
      value: this.currentSort,
      text: this.getCurrentSortText()
    };
  }

  // === OBTENER TEXTO DE ORDENACIÓN ACTUAL ===
  getCurrentSortText() {
    if (!this.currentSort) return 'Sin ordenar';

    const sortDropdown = document.getElementById('sort-dropdown');
    const currentOption = sortDropdown?.querySelector(`[data-value="${this.currentSort}"]`);

    return currentOption ? currentOption.textContent.trim() : 'Sin ordenar';
  }

  // === LOGGING ===
  log(message, data = null) {
    if (this.debug) {
      if (data) {
        console.log(`[SortingSystem] ${message}`, data);
      } else {
        console.log(`[SortingSystem] ${message}`);
      }
    }
  }

  // === DIAGNÓSTICO ===
  diagnose() {
    const allProducts = document.querySelectorAll('.product-card');
    const visibleProducts = Array.from(allProducts).filter(card => {
      const style = card.style.display;
      return style !== 'none' && !card.hasAttribute('hidden');
    });

    const diagnosis = {
      currentSort: this.currentSort,
      sortDropdown: !!document.getElementById('sort-dropdown'),
      sortOptions: document.querySelectorAll('#sort-dropdown .dropdown-option').length,
      totalProducts: allProducts.length,
      visibleProducts: visibleProducts.length,
      hiddenProducts: allProducts.length - visibleProducts.length,
      availableProducts: document.querySelectorAll('.product-card:not(.unavailable)').length,
      unavailableProducts: document.querySelectorAll('.product-card.unavailable').length
    };

    console.log('🔍 DIAGNÓSTICO SORTING SYSTEM:', diagnosis);
    return diagnosis;
  }
}

// === FUNCIÓN DE INICIALIZACIÓN ===
export function initSortingSystem() {
  const sortingSystem = new SortingSystem();

  // Hacer disponible globalmente
  window.sortingSystem = sortingSystem;

  // Escuchar evento de reset de filtros
  document.addEventListener('filtersReset', () => {
    sortingSystem.resetSorting();
  });

  return sortingSystem;
}

// === DIAGNÓSTICO GLOBAL ===
window.debugSortingSystem = function () {
  console.log('🔍 === DIAGNÓSTICO SORTING SYSTEM ===');

  if (window.sortingSystem) {
    console.log('✅ SortingSystem disponible');
    window.sortingSystem.diagnose();
  } else {
    console.log('❌ SortingSystem NO disponible');
  }

  // Verificar estructura HTML
  const sortDropdown = document.getElementById('sort-dropdown');
  if (sortDropdown) {
    console.log('✅ Dropdown de ordenación encontrado');
    console.log('📊 Opciones disponibles:', Array.from(sortDropdown.querySelectorAll('.dropdown-option')).map(opt => opt.textContent.trim()));
  } else {
    console.log('❌ Dropdown de ordenación NO encontrado');
  }
};