// Sistema de paginación para productos - VERSIÓN CORREGIDA

export function setupPagination() {
	// === CONFIGURACIÓN ===
	const PRODUCTS_PER_PAGE = 12;
	let currentPage = 1;
	let totalProducts = 0;
	let filteredProducts = []; // Productos después de aplicar filtros
	let allProducts = []; // Todos los productos originales
	let currentFilters = { // Estado actual de los filtros
		category: '',
		search: '',
		sortBy: '',
		showOnlyAvailable: true // Por defecto solo disponibles
	};

	// === ELEMENTOS DEL DOM ===
	const productCardsContainer = document.querySelector('.product-cards');

	if (!productCardsContainer) {
		console.log('Contenedor de productos no encontrado');
		return;
	}

	// === FUNCIÓN: Crear contenedor de paginación ===
	function createPaginationContainer() {
		// Buscar si ya existe
		let existingContainer = document.querySelector('.pagination-container');
		if (existingContainer) {
			return existingContainer;
		}

		// Crear nuevo contenedor
		const container = document.createElement('div');
		container.className = 'pagination-container';
		container.innerHTML = `
      <div class="pagination-info">
        <span class="products-count">Cargando productos...</span>
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn prev-btn" disabled>❮ Anterior</button>
        <div class="pagination-numbers"></div>
        <button class="pagination-btn next-btn" disabled>Siguiente ❯</button>
      </div>
    `;

		// Insertar después del contenedor de productos
		const orderContent = document.querySelector('.order-content');
		if (orderContent) {
			orderContent.appendChild(container);
		}

		return container;
	}

	// CREAR EL CONTENEDOR INMEDIATAMENTE
	const paginationContainer = createPaginationContainer();

	// === FUNCIÓN: Obtener todos los productos ===
	function getAllProducts() {
		const productCards = Array.from(document.querySelectorAll('.product-card'));
		allProducts = productCards.map((card, index) => ({
			element: card,
			id: index,
			name: card.querySelector('.product-name')?.textContent || '',
			price: card.querySelector('.price')?.textContent || '',
			available: !card.classList.contains('unavailable'),
			category: card.dataset.category || '',
			originalIndex: index
		}));

		console.log(`Productos cargados: ${allProducts.length} total`);
		return allProducts;
	}

	// === FUNCIÓN: Mostrar productos de la página actual ===
	function showCurrentPage() {
		const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
		const endIndex = startIndex + PRODUCTS_PER_PAGE;
		const productsToShow = filteredProducts.slice(startIndex, endIndex);

		// Ocultar todos los productos
		allProducts.forEach(product => {
			product.element.style.display = 'none';
		});

		// Mostrar solo los productos de la página actual
		productsToShow.forEach(product => {
			product.element.style.display = 'block';
		});

		// ACTUALIZAR CONTROLES DESPUÉS DE MOSTRAR PRODUCTOS
		updatePaginationControls();
		updateProductsInfo();

		console.log(`Página ${currentPage}: mostrando productos ${startIndex + 1}-${Math.min(endIndex, totalProducts)} de ${totalProducts} totales`);
	}

	// === FUNCIÓN AUXILIAR: Formatear nombre de categoría ===
	function formatCategoryName(category) {
		if (!category) return '';
		
		// Convertir guiones en espacios y capitalizar cada palabra
		return category
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// === FUNCIÓN: Actualizar información de productos ===
	function updateProductsInfo() {
		const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
		const endIndex = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

		const infoElement = paginationContainer?.querySelector('.products-count');
		if (infoElement) {
			if (totalProducts === 0) {
				infoElement.innerHTML = 'No se encontraron productos';
			} else {
				let infoText = `Mostrando ${startIndex}-${endIndex} de ${totalProducts} productos`;
				
				// NUEVO: Añadir indicador de qué tipo de productos se muestran con estilos
				const { category, showOnlyAvailable } = currentFilters;
				
				if (category) {
					// Formatear y mostrar categoría específica
					const categoryFormatted = formatCategoryName(category);
					infoText += ` en <strong>${categoryFormatted}</strong>`;
				} else if (!showOnlyAvailable) {
					// Mostrando "Todos los productos" (disponibles + agotados)
					infoText += ` <strong>(incluye agotados)</strong>`;
				} else {
					// Estado inicial - solo disponibles
					infoText += ` <strong>disponibles</strong>`;
				}
				
				infoElement.innerHTML = infoText; // Usar innerHTML para renderizar el HTML
			}
		}
	}

	// === FUNCIÓN: Actualizar controles de paginación ===
	function updatePaginationControls() {
		const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

		// Actualizar botones anterior/siguiente
		const prevBtn = paginationContainer?.querySelector('.prev-btn');
		const nextBtn = paginationContainer?.querySelector('.next-btn');

		if (prevBtn) {
			prevBtn.disabled = currentPage <= 1;
		}

		if (nextBtn) {
			nextBtn.disabled = currentPage >= totalPages;
		}

		// Actualizar números de página
		updatePageNumbers(totalPages);
	}

	// === FUNCIÓN: Actualizar números de página ===
	function updatePageNumbers(totalPages) {
		const numbersContainer = paginationContainer?.querySelector('.pagination-numbers');
		if (!numbersContainer) return;

		numbersContainer.innerHTML = '';

		if (totalPages <= 1) {
			return; // No mostrar números si solo hay una página
		}

		// Determinar qué números mostrar
		let startPage = Math.max(1, currentPage - 2);
		let endPage = Math.min(totalPages, startPage + 4);

		// Ajustar si estamos cerca del final
		if (endPage - startPage < 4) {
			startPage = Math.max(1, endPage - 4);
		}

		// Botón primera página
		if (startPage > 1) {
			numbersContainer.appendChild(createPageButton(1));
			if (startPage > 2) {
				numbersContainer.appendChild(createEllipsis());
			}
		}

		// Números de página
		for (let i = startPage; i <= endPage; i++) {
			numbersContainer.appendChild(createPageButton(i));
		}

		// Botón última página
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				numbersContainer.appendChild(createEllipsis());
			}
			numbersContainer.appendChild(createPageButton(totalPages));
		}
	}

	// === FUNCIÓN: Crear botón de página ===
	function createPageButton(pageNumber) {
		const button = document.createElement('button');
		button.className = `pagination-btn page-btn ${pageNumber === currentPage ? 'active' : ''}`;
		button.textContent = pageNumber;
		button.addEventListener('click', () => goToPage(pageNumber));
		return button;
	}

	// === FUNCIÓN: Crear puntos suspensivos ===
	function createEllipsis() {
		const span = document.createElement('span');
		span.className = 'pagination-ellipsis';
		span.textContent = '...';
		return span;
	}

	// === FUNCIÓN: Ir a página específica ===
	function goToPage(pageNumber) {
		const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

		if (pageNumber < 1 || pageNumber > totalPages) {
			return;
		}

		currentPage = pageNumber;
		showCurrentPage();
	}

	// === FUNCIÓN: Página anterior ===
	function goToPreviousPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}

	// === FUNCIÓN: Página siguiente ===
	function goToNextPage() {
		const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	// === FUNCIÓN: Aplicar filtros ===
	function applyFilters(newFilters = {}) {
		// Actualizar el estado de filtros actuales
		currentFilters = { ...currentFilters, ...newFilters };

		const { category, search, sortBy, showOnlyAvailable } = currentFilters;

		console.log('🔍 Aplicando filtros:', {
			category: category || '(todos)',
			search: search || '(sin búsqueda)',
			sortBy: sortBy || '(sin ordenar)',
			showOnlyAvailable,
			source: category ? 'categoría específica' : showOnlyAvailable ? 'estado inicial' : 'todos los productos'
		});

		// Empezar con todos los productos
		let filtered = [...allProducts];

		// 1. Filtrar por categoría PRIMERO
		if (category && category !== '') {
			filtered = filtered.filter(product =>
				product.category.toLowerCase() === category.toLowerCase()
			);
			console.log(`📂 Filtrado por categoría "${category}": ${filtered.length} productos`);
		}

		// 2. Filtrar por búsqueda
		if (search && search !== '') {
			const searchTerm = search.toLowerCase();
			filtered = filtered.filter(product => {
				const normalizedName = product.name.toLowerCase()
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '') // Remover acentos
					.replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
					.trim();

				return normalizedName.startsWith(searchTerm);
			});
			console.log(`🔍 Filtrado por búsqueda "${search}": ${filtered.length} productos`);
		}

		// 3. Filtrar por disponibilidad AL FINAL
		if (showOnlyAvailable) {
			const beforeFilter = filtered.length;
			filtered = filtered.filter(product => product.available);
			console.log(`✅ Filtrado solo disponibles: ${filtered.length} de ${beforeFilter} productos`);
		} else {
			console.log(`👁️ Mostrando todos (${filtered.filter(p => p.available).length} disponibles + ${filtered.filter(p => !p.available).length} agotados)`);
		}

		// 4. Ordenar
		if (sortBy) {
			filtered = sortProducts(filtered, sortBy);
			console.log(`📊 Ordenado por "${sortBy}": ${filtered.length} productos`);
			
			// IMPORTANTE: Reordenar físicamente en el DOM
			reorderProductsInDOM(filtered);
		}

		// Actualizar productos filtrados
		filteredProducts = filtered;
		totalProducts = filteredProducts.length;
		currentPage = 1; // Volver a la primera página

		// Mostrar resultados
		showCurrentPage();

		console.log(`✅ Resultado final: ${totalProducts} productos mostrados`);
	}

	// === FUNCIÓN: Ordenar productos ===
	function sortProducts(products, sortBy) {
		console.log(`🔄 Ordenando ${products.length} productos por: ${sortBy}`);
		
		const sortedProducts = [...products].sort((a, b) => {
			switch (sortBy) {
				case 'name-asc':
					return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
				case 'name-desc':
					return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
				case 'price-asc':
					const priceA = extractPrice(a.price);
					const priceB = extractPrice(b.price);
					return (priceA || 0) - (priceB || 0);
				case 'price-desc':
					const priceA2 = extractPrice(a.price);
					const priceB2 = extractPrice(b.price);
					return (priceB2 || 0) - (priceA2 || 0);
				case 'available':
					return b.available - a.available; // Disponibles primero
				default:
					return 0;
			}
		});

		// Log para debug
		if (sortBy === 'price-desc' || sortBy === 'price-asc') {
			console.log('💰 Precios ordenados:', sortedProducts.map(p => `${p.name}: ${p.price}`));
		}

		return sortedProducts;
	}

	// === FUNCIÓN: Reordenar productos en el DOM ===
	function reorderProductsInDOM(sortedProducts) {
		const container = productCardsContainer;
		if (!container) return;

		console.log('🔄 Reordenando productos en el DOM...');

		// Crear fragmento para reordenar eficientemente
		const fragment = document.createDocumentFragment();
		
		// Añadir productos en el orden correcto
		sortedProducts.forEach(product => {
			fragment.appendChild(product.element);
		});

		// Limpiar contenedor y añadir productos ordenados
		container.innerHTML = '';
		container.appendChild(fragment);
		
		console.log('✅ Productos reordenados en el DOM');
	}

	// === FUNCIÓN: Extraer precio numérico ===
	function extractPrice(priceText) {
		if (!priceText) return 0;
		
		// Buscar números en el texto del precio
		const priceMatch = priceText.match(/(\d+[,.]?\d*)/);
		if (!priceMatch) return 0;
		
		// Convertir a número (reemplazar coma por punto si es necesario)
		const price = parseFloat(priceMatch[1].replace(',', '.'));
		console.log(`💰 Precio extraído: "${priceText}" → ${price}`);
		return price;
	}

	// === EVENT LISTENERS ===
	function setupEventListeners() {
		// Botón anterior
		const prevBtn = paginationContainer?.querySelector('.prev-btn');
		if (prevBtn) {
			prevBtn.addEventListener('click', goToPreviousPage);
		}

		// Botón siguiente  
		const nextBtn = paginationContainer?.querySelector('.next-btn');
		if (nextBtn) {
			nextBtn.addEventListener('click', goToNextPage);
		}

		// Escuchar eventos de búsqueda
		document.addEventListener('searchProducts', (e) => {
			applyFilters({ 
				search: e.detail.searchTerm,
				// IMPORTANTE: Si hay búsqueda, mostrar todos los productos (disponibles + agotados)
				showOnlyAvailable: e.detail.searchTerm ? false : currentFilters.showOnlyAvailable
			});
		});

		// Escuchar eventos de filtros (categorías)
		document.addEventListener('filterChange', (e) => {
			if (e.detail.type === 'categories') {
				// NUEVO: Distinguir entre estado inicial y "Todos los productos"
				if (e.detail.value === '') {
					// "Todos los productos" seleccionado explícitamente → mostrar TODOS (disponibles + agotados)
					applyFilters({ 
						category: e.detail.value,
						showOnlyAvailable: false // Mostrar todos cuando se selecciona "Todos los productos"
					});
				} else {
					// Categoría específica → mostrar todos de esa categoría
					applyFilters({ 
						category: e.detail.value,
						showOnlyAvailable: false
					});
				}
			}
		});

		// Escuchar eventos de ordenación (sorting.js)
		document.addEventListener('productsSort', (e) => {
			const sortValue = e.detail.sortValue;
			
			// ESPECIAL: Si es "Solo disponibles", cambiar el filtro de disponibilidad
			if (sortValue === 'available') {
				applyFilters({ 
					sortBy: '',
					showOnlyAvailable: true 
				});
			} else {
				applyFilters({ 
					sortBy: sortValue,
					// IMPORTANTE: Para otras ordenaciones, mantener todos los productos visibles
					showOnlyAvailable: false
				});
			}
		});

		// Escuchar reset de filtros
		document.addEventListener('filtersReset', () => {
			// Reset completo a estado inicial
			currentFilters = {
				category: '',
				search: '',
				sortBy: '',
				showOnlyAvailable: true
			};
			applyFilters();
		});
	}

	// === FUNCIÓN DE INICIALIZACIÓN ===
	function init() {
		getAllProducts();
		setupEventListeners();
		
		// Aplicar filtros iniciales (solo disponibles por defecto)
		applyFilters();

		console.log('✅ Sistema de paginación configurado correctamente');
		console.log(`📊 Estado inicial: mostrando solo productos disponibles`);
	}

	// LLAMAR INIT INMEDIATAMENTE
	init();

	// === FUNCIONES PÚBLICAS ===
	return {
		goToPage,
		applyFilters,
		getCurrentPage: () => currentPage,
		getTotalPages: () => Math.ceil(totalProducts / PRODUCTS_PER_PAGE),
		getTotalProducts: () => totalProducts,
		getCurrentFilters: () => currentFilters,
		refresh: init
	};
}

// === FUNCIÓN PARA INICIALIZAR DESDE MAIN.JS ===
export function initPagination() {
	const pagination = setupPagination();

	// Hacer disponible globalmente para debug
	window.pagination = pagination;

	return pagination;
}