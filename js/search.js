// js/search.js - Sistema de búsqueda con sugerencias en tiempo real y ocultación de secciones

export class SearchSystem {
  constructor() {
    this.searchInput = document.getElementById('search-products');
    this.suggestionsContainer = document.getElementById('search-suggestions');
    this.allProducts = [];
    this.isSearchActive = false;

    // === NUEVO: Referencias a las secciones que se ocultan durante la búsqueda ===
    this.sectionsToHide = [
      '.banner-delivery',          // Banner principal de envíos
      '.banners-promocionales',    // Los 3 banners promocionales
      '.recommendations-section'   // Sección de recomendaciones del día
    ];

    this.init();
  }

  init() {
    if (!this.searchInput || !this.suggestionsContainer) {
      console.warn('❌ Elementos de búsqueda no encontrados');
      return;
    }

    // Recopilar todos los productos disponibles
    this.collectProducts();

    // Configurar event listeners
    this.setupEventListeners();

    console.log('🔍 Sistema de búsqueda inicializado con', this.allProducts.length, 'productos');
  }

  collectProducts() {
    const productCards = document.querySelectorAll('.product-card');
    this.allProducts = [];

    productCards.forEach((card, index) => {
      const nameElement = card.querySelector('.product-name');
      const categoryElement = card.getAttribute('data-category');
      const stockElement = card.querySelector('.stock, .no-stock');
      const priceElement = card.querySelector('.price');

      if (nameElement) {
        const product = {
          id: index + 1,
          name: nameElement.textContent.trim(),
          category: categoryElement || 'sin-categoria',
          isAvailable: !card.classList.contains('unavailable'),
          stock: stockElement ? stockElement.textContent.trim() : 'DISPONIBLE',
          price: priceElement ? priceElement.textContent.trim() : '',
          element: card
        };

        this.allProducts.push(product);
      }
    });
  }

  setupEventListeners() {
    // Búsqueda en tiempo real
    this.searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim();
      this.handleSearch(searchTerm);
    });

    // Mostrar sugerencias al hacer foco
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim()) {
        this.showSuggestions(this.searchInput.value.trim());
      }
    });

    // Ocultar sugerencias al perder foco (con delay para permitir clics)
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        this.hideSuggestions();
      }, 200);
    });

    // Navegación con teclado
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  handleSearch(searchTerm) {
    if (searchTerm.length === 0) {
      this.hideSuggestions();
      this.resetProductsVisibility();
      this.showAllSections(); // === NUEVO: Mostrar todas las secciones ===
      this.dispatchSearchEvent('');
      return;
    }

    // === CAMBIADO: Buscar desde la primera letra ===
    if (searchTerm.length >= 1) {
      this.showSuggestions(searchTerm);
      this.filterProducts(searchTerm);
      this.hidePromotionalSections(); // === NUEVO: Ocultar secciones promocionales ===
    }
  }

  // === NUEVO MÉTODO: Ocultar secciones promocionales durante búsqueda ===
  hidePromotionalSections() {
    this.sectionsToHide.forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        // Guardar el estado de display original si no está guardado
        if (!section.hasAttribute('data-original-display')) {
          const originalDisplay = window.getComputedStyle(section).display;
          section.setAttribute('data-original-display', originalDisplay);
        }

        // Ocultar con transición suave
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        section.style.opacity = '0';
        section.style.transform = 'translateY(-20px)';

        // Ocultar completamente después de la animación
        setTimeout(() => {
          section.style.display = 'none';
        }, 300);
      }
    });

    console.log('🔍 Secciones promocionales ocultadas durante búsqueda');
  }

  // === NUEVO MÉTODO: Mostrar todas las secciones cuando no hay búsqueda ===
  // === MÉTODO CORREGIDO: Mostrar todas las secciones cuando no hay búsqueda ===
  showAllSections() {
    this.sectionsToHide.forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        // Restaurar display original inmediatamente
        const originalDisplay = section.getAttribute('data-original-display') || 'block';
        section.style.display = originalDisplay;

        // Configurar animación de entrada
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        section.style.opacity = '0';
        section.style.transform = 'translateY(-20px)';

        // Forzar reflow para asegurar que se apliquen los estilos iniciales
        section.offsetHeight;

        // Animar aparición
        requestAnimationFrame(() => {
          section.style.opacity = '1';
          section.style.transform = 'translateY(0)';
        });

        // Limpiar estilos de transición después de la animación
        setTimeout(() => {
          section.style.transition = '';
          section.style.opacity = '';
          section.style.transform = '';
          section.removeAttribute('data-original-display');
        }, 350);
      }
    });

    console.log('✨ Secciones promocionales restauradas');
  }

  // === MÉTODO MEJORADO: Ocultar secciones promocionales durante búsqueda ===
  hidePromotionalSections() {
    this.sectionsToHide.forEach(selector => {
      const section = document.querySelector(selector);
      if (section && section.style.display !== 'none') {
        // Guardar el estado de display original solo si no está guardado
        if (!section.hasAttribute('data-original-display')) {
          const originalDisplay = window.getComputedStyle(section).display;
          section.setAttribute('data-original-display', originalDisplay);
        }

        // Configurar transición suave
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        section.style.opacity = '0';
        section.style.transform = 'translateY(-20px)';

        // Ocultar completamente después de la animación
        setTimeout(() => {
          if (section.style.opacity === '0') { // Solo ocultar si aún está en estado oculto
            section.style.display = 'none';
          }
        }, 300);
      }
    });

    console.log('🔍 Secciones promocionales ocultadas durante búsqueda');
  }

  showSuggestions(searchTerm) {
    const suggestions = this.getSuggestions(searchTerm);

    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.renderSuggestions(suggestions);
    this.suggestionsContainer.style.display = 'block';
    this.isSearchActive = true;
  }

  getSuggestions(searchTerm) {
    const normalizedSearch = this.normalizeText(searchTerm);
    const suggestions = [];
    const uniqueNames = new Set();

    // Buscar productos que coincidan
    this.allProducts.forEach(product => {
      const normalizedName = this.normalizeText(product.name);

      // === MEJORADO: startsWith para búsquedas de 1 letra, includes para 2+ letras ===
      let isMatch;
      if (searchTerm.length === 1) {
        isMatch = normalizedName.startsWith(normalizedSearch);
      } else {
        isMatch = normalizedName.includes(normalizedSearch);
      }

      if (isMatch) {
        if (!uniqueNames.has(product.name)) {
          suggestions.push({
            type: 'product',
            text: product.name,
            category: product.category,
            isAvailable: product.isAvailable,
            product: product
          });
          uniqueNames.add(product.name);
        }
      }
    });

    // === AJUSTADO: Mostrar más sugerencias para búsquedas de 1 letra ===
    const maxSuggestions = searchTerm.length === 1 ? 6 : 8;

    return suggestions
      .slice(0, maxSuggestions)
      .sort((a, b) => {
        // Productos disponibles primero
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;

        return a.text.localeCompare(b.text);
      });
  }

  renderSuggestions(suggestions) {
    this.suggestionsContainer.innerHTML = '';

    suggestions.forEach((suggestion, index) => {
      const suggestionElement = document.createElement('div');
      suggestionElement.className = `search-suggestion ${suggestion.type}`;
      suggestionElement.setAttribute('data-index', index);

      // Solo renderizar productos (no categorías)
      suggestionElement.innerHTML = `
        <div class="suggestion-content">
          <span class="suggestion-name">${this.highlightMatch(suggestion.text, this.searchInput.value)}</span>
          <span class="suggestion-category">${this.formatCategoryName(suggestion.category)}</span>
          <span class="suggestion-status ${suggestion.isAvailable ? 'available' : 'unavailable'}">
            ${suggestion.isAvailable ? '✓ Disponible' : '✗ Agotado'}
          </span>
        </div>
      `;

      // Event listener para seleccionar sugerencia
      suggestionElement.addEventListener('click', () => {
        this.selectSuggestion(suggestion);
      });

      this.suggestionsContainer.appendChild(suggestionElement);
    });
  }

  selectSuggestion(suggestion) {
    // Solo manejar productos
    this.searchInput.value = suggestion.text;
    this.filterProducts(suggestion.text);
    this.scrollToProduct(suggestion.product);

    this.hideSuggestions();
    this.dispatchSearchEvent(this.searchInput.value);
  }

  filterProducts(searchTerm) {
    const normalizedSearch = this.normalizeText(searchTerm);
    let visibleCount = 0;

    this.allProducts.forEach(product => {
      const normalizedName = this.normalizeText(product.name);
      const normalizedCategory = this.normalizeText(this.formatCategoryName(product.category));

      // === MEJORADO: Lógica de búsqueda optimizada por longitud ===
      let nameMatch, categoryMatch;

      if (searchTerm.length === 1) {
        // Para 1 letra: solo buscar al inicio del nombre (más específico)
        nameMatch = normalizedName.startsWith(normalizedSearch);
        categoryMatch = normalizedCategory.startsWith(normalizedSearch);
      } else {
        // Para 2+ letras: buscar en cualquier parte
        nameMatch = normalizedName.includes(normalizedSearch);
        categoryMatch = normalizedCategory.includes(normalizedSearch);
      }

      const isMatch = nameMatch || categoryMatch;

      if (isMatch) {
        // MOSTRAR PRODUCTO COINCIDENTE (disponible o agotado)
        product.element.style.display = 'block';
        product.element.classList.add('search-match');

        // Destacar si es coincidencia exacta de nombre
        if (nameMatch) {
          product.element.classList.add('name-match');
        }

        visibleCount++;
      } else {
        product.element.style.display = 'none';
        product.element.classList.remove('search-match', 'name-match');
      }
    });

    // Mostrar mensaje si no hay resultados
    this.updateSearchResults(visibleCount, searchTerm);

    console.log(`🔍 Búsqueda "${searchTerm}" (${searchTerm.length} letra${searchTerm.length > 1 ? 's' : ''}): ${visibleCount} productos encontrados`);
  }

  scrollToProduct(product) {
    setTimeout(() => {
      // Scroll hasta la sección de productos si no está visible
      const productSection = document.querySelector('.product-cards');
      if (productSection) {
        productSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      // Luego scroll hasta el producto específico
      setTimeout(() => {
        product.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Efecto de destacado temporal
        product.element.classList.add('highlighted');
        setTimeout(() => {
          product.element.classList.remove('highlighted');
        }, 2000);
      }, 500);
    }, 300);
  }

  resetProductsVisibility() {
    // === MEJORADO: Mostrar productos según estado inicial (solo disponibles) ===
    this.allProducts.forEach(product => {
      if (product.isAvailable) {
        product.element.style.display = 'block';
      } else {
        product.element.style.display = 'none';
      }
      product.element.classList.remove('search-match', 'name-match', 'category-match');
    });

    // Limpiar mensajes de búsqueda
    const messageElement = document.querySelector('.search-results-message');
    if (messageElement) {
      messageElement.remove();
    }

    console.log('🔄 Visibilidad restablecida: Solo productos disponibles');
  }

  updateSearchResults(count, searchTerm) {
    // Remover mensaje anterior si existe
    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    if (count === 0) {
      const messageElement = document.createElement('div');
      messageElement.className = 'search-results-message no-results';
      messageElement.innerHTML = `
        <div class="no-results-content">
          <span class="no-results-icon">🔍</span>
          <h3>No se encontraron productos</h3>
          <p>No hay productos que coincidan con "<strong>${searchTerm}</strong>"</p>
          <button class="btn-clear-search" onclick="window.searchSystem.clearSearch()">
            Limpiar búsqueda
          </button>
        </div>
      `;

      document.querySelector('.product-cards').appendChild(messageElement);
    }
  }

  clearSearch() {
    this.searchInput.value = '';
    this.hideSuggestions();
    this.resetProductsVisibility();
    this.showAllSections(); // === NUEVO: Restaurar secciones ===
    this.dispatchSearchEvent('');

    const messageElement = document.querySelector('.search-results-message');
    if (messageElement) {
      messageElement.remove();
    }

    console.log('🧹 Búsqueda limpiada y secciones restauradas');
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
    this.isSearchActive = false;
  }

  handleKeyboardNavigation(e) {
    if (!this.isSearchActive) return;

    const suggestions = this.suggestionsContainer.querySelectorAll('.search-suggestion');
    const currentSelected = this.suggestionsContainer.querySelector('.selected');
    let selectedIndex = currentSelected ? parseInt(currentSelected.getAttribute('data-index')) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % suggestions.length;
        this.updateSelection(suggestions, selectedIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
        this.updateSelection(suggestions, selectedIndex);
        break;

      case 'Enter':
        e.preventDefault();
        if (currentSelected) {
          currentSelected.click();
        }
        break;

      case 'Escape':
        this.clearSearch(); // === MEJORADO: Limpiar completamente al presionar Escape ===
        this.searchInput.blur();
        break;
    }
  }

  updateSelection(suggestions, selectedIndex) {
    suggestions.forEach((suggestion, index) => {
      if (index === selectedIndex) {
        suggestion.classList.add('selected');
        suggestion.scrollIntoView({ block: 'nearest' });
      } else {
        suggestion.classList.remove('selected');
      }
    });
  }

  // === NUEVO MÉTODO: Verificar si hay búsqueda activa ===
  hasActiveSearch() {
    return this.searchInput.value.trim().length > 0;
  }

  // === NUEVO MÉTODO: Obtener término de búsqueda actual ===
  getCurrentSearchTerm() {
    return this.searchInput.value.trim();
  }

  // Utility functions
  normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .trim();
  }

  highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Event dispatchers
  dispatchSearchEvent(searchTerm) {
    const event = new CustomEvent('searchProducts', {
      detail: { searchTerm }
    });
    document.dispatchEvent(event);
  }

  dispatchFilterEvent(filterType, value) {
    const event = new CustomEvent('filterChange', {
      detail: {
        type: filterType,
        value: value
      }
    });
    document.dispatchEvent(event);
  }
}

// Inicializar el sistema de búsqueda
export function initSearchSystem() {
  const searchSystem = new SearchSystem();

  // Hacer disponible globalmente para uso en botones inline
  window.searchSystem = searchSystem;

  return searchSystem;
}