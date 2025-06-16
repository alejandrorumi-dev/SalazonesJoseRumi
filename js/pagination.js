// Sistema de paginación para productos

export function setupPagination() {
	// === CONFIGURACIÓN ===
	const PRODUCTS_PER_PAGE = 12;
	let currentPage = 1;
	let totalProducts = 0;
	let filteredProducts = []; // Productos después de aplicar filtros
	let allProducts = []; // Todos los productos originales

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

		// Por defecto mostrar solo productos disponibles
		filteredProducts = allProducts.filter(product => product.available);
		totalProducts = filteredProducts.length;

		console.log(`Productos cargados: ${allProducts.length} total, ${totalProducts} disponibles mostrados inicialmente`);
		return filteredProducts;
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

		console.log(`Página ${currentPage}: mostrando productos ${startIndex + 1}-${Math.min(endIndex, totalProducts)}`);
	}

	// === FUNCIÓN: Actualizar información de productos ===
	function updateProductsInfo() {
		const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
		const endIndex = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

		const infoElement = paginationContainer?.querySelector('.products-count');
		if (infoElement) {
			if (totalProducts === 0) {
				infoElement.textContent = 'No se encontraron productos';
			} else {
				infoElement.textContent = `Mostrando ${startIndex}-${endIndex} de ${totalProducts} productos`;
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
	function applyFilters(filters = {}) {
		const { category = '', search = '', sortBy = '', showOnlyAvailable = null } = filters;

		// Empezar con todos los productos
		let filtered = [...allProducts];

		// Mostrar productos agotados
		let shouldShowOnlyAvailable;

		if (showOnlyAvailable !== null) {
			// Si se especifica explícitamente, usar ese valor
			shouldShowOnlyAvailable = showOnlyAvailable;
		} else if (search && search !== '') {
			// Si hay búsqueda activa, mostrar todos (disponibles + agotados)
			shouldShowOnlyAvailable = false;
		} else if (category && category !== '') {
			// Si hay categoría seleccionada, mostrar todos (disponibles + agotados)
			shouldShowOnlyAvailable = false;
		} else {
			// Estado inicial: mostrar solo disponibles
			shouldShowOnlyAvailable = true;
		}

		// Filtrar por disponibilidad
		if (shouldShowOnlyAvailable) {
			filtered = filtered.filter(product => product.available);
		}

		// Filtrar por categoría
		if (category && category !== '') {
			filtered = filtered.filter(product =>
				product.category.toLowerCase() === category.toLowerCase()
			);
		}

		// Filtrar por búsqueda
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
		}

		// Ordenar
		if (sortBy) {
			filtered = sortProducts(filtered, sortBy);
		}

		// Actualizar productos filtrados
		filteredProducts = filtered;
		totalProducts = filteredProducts.length;
		currentPage = 1; // Volver a la primera página

		// Mostrar resultados
		showCurrentPage();

		console.log(`Filtros aplicados: ${totalProducts} productos encontrados`);
		console.log(`Categoría: "${category}", Búsqueda: "${search}", Solo disponibles: ${shouldShowOnlyAvailable}`);
	}

	// === FUNCIÓN: Ordenar productos ===
	function sortProducts(products, sortBy) {
		return products.sort((a, b) => {
			switch (sortBy) {
				case 'name-asc':
					return a.name.localeCompare(b.name);
				case 'name-desc':
					return b.name.localeCompare(a.name);
				case 'price-asc':
					return parseFloat(a.price.replace(/[^\d.,]/g, '')) - parseFloat(b.price.replace(/[^\d.,]/g, ''));
				case 'price-desc':
					return parseFloat(b.price.replace(/[^\d.,]/g, '')) - parseFloat(a.price.replace(/[^\d.,]/g, ''));
				case 'available':
					return b.available - a.available; // Disponibles primero
				default:
					return 0;
			}
		});
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

		// Escuchar eventos de filtros
		document.addEventListener('searchProducts', (e) => {
			applyFilters({ search: e.detail.searchTerm });
		});

		document.addEventListener('filterChange', (e) => {
			const filters = {};
			if (e.detail.type === 'categories') {
				filters.category = e.detail.value;
			} else if (e.detail.type === 'sort') {
				filters.sortBy = e.detail.value;
			}
			applyFilters(filters);
		});

		document.addEventListener('filtersReset', () => {
			applyFilters(); // Aplicar filtros por defecto (solo disponibles)
		});
	}

	// === FUNCIÓN DE INICIALIZACIÓN ===
	function init() {
		
		getAllProducts();
		setupEventListeners();
		showCurrentPage(); 

		console.log('✅ Sistema de paginación configurado correctamente');
		console.log(`📊 Estado inicial: ${totalProducts} productos visibles de ${allProducts.length} totales`);
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