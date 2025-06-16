// Funcionalidad del carrusel de recomendaciones

export function setupCarousel() {
	// === ELEMENTOS DEL DOM ===
	const carousel = document.querySelector('.recommendations-carousel');
	const prevBtn = document.querySelector('.carousel-btn.prev');
	const nextBtn = document.querySelector('.carousel-btn.next');
	const items = document.querySelectorAll('.recommendation-item');

	// Verificar que existen los elementos necesarios
	if (!carousel || !prevBtn || !nextBtn || items.length === 0) {
		console.log('Carrusel no encontrado o sin elementos');
		return;
	}

	// === VARIABLES DE CONFIGURACIÓN ===
	let currentIndex = 0; // Índice del primer elemento visible
	let itemsToShow = getItemsToShow(); // Cuántos elementos mostrar según pantalla
	let itemWidth = getItemWidth(); // Ancho de cada elemento

	console.log('Carrusel iniciado con', items.length, 'productos');

	// === FUNCIÓN: Calcular cuántos elementos mostrar según el tamaño de pantalla ===
	function getItemsToShow() {
		const width = window.innerWidth;
		if (width <= 480) return 2;      // Móvil pequeño: 2 productos
		if (width <= 768) return 3;      // Móvil: 3 productos  
		if (width <= 992) return 4;      // Tablet: 4 productos
		return 5;                        // Desktop: 5 productos
	}

	// === FUNCIÓN: Calcular el ancho de cada elemento ===
	function getItemWidth() {
		if (items.length > 0) {
			const firstItem = items[0];
			const style = window.getComputedStyle(firstItem);
			const width = firstItem.offsetWidth;
			const marginLeft = parseFloat(style.marginLeft) || 0;
			const marginRight = parseFloat(style.marginRight) || 0;

			// === MEJORADO: Incluir gap del contenedor ===
			const containerStyle = window.getComputedStyle(carousel);
			const gap = parseFloat(containerStyle.gap) || 24; // 1.5rem = 24px por defecto

			return width + marginLeft + marginRight + gap;
		}
		return 220; // Valor por defecto
	}

	// === FUNCIÓN: Actualizar estado de los botones ===
	function updateButtons() {
		const maxIndex = Math.max(0, items.length - itemsToShow);

		// Botón anterior
		if (currentIndex <= 0) {
			prevBtn.disabled = true;
			prevBtn.style.opacity = '0.5';
		} else {
			prevBtn.disabled = false;
			prevBtn.style.opacity = '1';
		}

		// Botón siguiente
		if (currentIndex >= maxIndex) {
			nextBtn.disabled = true;
			nextBtn.style.opacity = '0.5';
		} else {
			nextBtn.disabled = false;
			nextBtn.style.opacity = '1';
		}
	}

	// === FUNCIÓN: Mover el carrusel ===
	function moveCarousel(direction) {
		const maxIndex = Math.max(0, items.length - itemsToShow);

		if (direction === 'next' && currentIndex < maxIndex) {
			currentIndex++;
		} else if (direction === 'prev' && currentIndex > 0) {
			currentIndex--;
		}

		// === MEJORADO: Cálculo más preciso del scroll ===
		const containerWidth = carousel.offsetWidth;
		const totalItemsWidth = items.length * itemWidth;

		// Si estamos en el último grupo, ajustar para mostrar las cards completas
		let scrollDistance;
		if (currentIndex >= maxIndex && totalItemsWidth > containerWidth) {
			// Scroll hasta el final, pero asegurando que la última card se vea completa
			scrollDistance = totalItemsWidth - containerWidth + 20; // +20px de margen
		} else {
			// Scroll normal
			scrollDistance = currentIndex * itemWidth;
		}

		// Aplicar el scroll suave
		carousel.scrollTo({
			left: scrollDistance,
			behavior: 'smooth'
		});

		// Actualizar botones
		updateButtons();

		console.log(`Movido a índice ${currentIndex}, scroll: ${scrollDistance}px`);
	}

	// === EVENT LISTENERS: Botones de navegación ===
	prevBtn.addEventListener('click', (e) => {
		e.preventDefault(); // 🔹 Prevenir comportamiento por defecto
		e.stopPropagation(); // 🔹 Evitar que el evento se propague
		e.stopImmediatePropagation(); // 🔹 Parar TODOS los eventos
		moveCarousel('prev');
		return false; // 🔹 Seguridad extra
	});

	nextBtn.addEventListener('click', (e) => {
		e.preventDefault(); // 🔹 Prevenir comportamiento por defecto
		e.stopPropagation(); // 🔹 Evitar que el evento se propague
		e.stopImmediatePropagation(); // 🔹 Parar TODOS los eventos
		moveCarousel('next');
		return false; // 🔹 Seguridad extra
	});

	// === EVENTOS ADICIONALES PARA LOS BOTONES ===
	// Prevenir cualquier comportamiento extraño
	[prevBtn, nextBtn].forEach(btn => {
		btn.addEventListener('mousedown', (e) => {
			e.preventDefault();
		});

		btn.addEventListener('mouseup', (e) => {
			e.preventDefault();
		});

		btn.addEventListener('submit', (e) => {
			e.preventDefault();
			return false;
		});
	});

	// === FUNCIONALIDAD: Touch/Swipe para móviles ===
	let startX = 0;
	let endX = 0;
	let isDragging = false;

	carousel.addEventListener('touchstart', (e) => {
		startX = e.touches[0].clientX;
		isDragging = true;
	});

	carousel.addEventListener('touchmove', (e) => {
		if (!isDragging) return;
		endX = e.touches[0].clientX;
	});

	carousel.addEventListener('touchend', () => {
		if (!isDragging) return;
		isDragging = false;

		const difference = startX - endX;
		const threshold = 50; // Mínima distancia para considerar swipe

		if (Math.abs(difference) > threshold) {
			if (difference > 0) {
				// Swipe izquierda = siguiente
				moveCarousel('next');
			} else {
				// Swipe derecha = anterior
				moveCarousel('prev');
			}
		}
	});

	// === FUNCIONALIDAD: Click en productos (scroll hasta el producto en las cards) ===
	items.forEach((item, index) => {
		item.addEventListener('click', (e) => {
			e.preventDefault(); // 🔹 Prevenir comportamiento por defecto
			e.stopPropagation(); // 🔹 Evitar que el evento se propague

			const productId = item.dataset.product;
			console.log(`Click en producto: ${productId}`);

			// Buscar el producto en las cards principales
			scrollToProduct(productId, item);
		});

		// Agregar cursor pointer para indicar que es clickeable
		item.style.cursor = 'pointer';
	});

	// === FUNCIÓN: Buscar y hacer scroll hasta el producto en las cards ===
	function scrollToProduct(productId, clickedItem) {
		// Buscar en las cards principales por data-product, nombre, o contenido
		const productCards = document.querySelectorAll('.product-card');
		let targetCard = null;

		// Obtener el nombre del producto desde el item clickeado
		const productName = clickedItem.querySelector('h3').textContent.toLowerCase();

		productCards.forEach(card => {
			// Buscar por data-product si existe
			if (card.dataset.product === productId) {
				targetCard = card;
				return;
			}

			// Buscar por nombre del producto
			const cardName = card.querySelector('.product-name');
			if (cardName && cardName.textContent.toLowerCase().includes(productName)) {
				targetCard = card;
				return;
			}
		});

		if (targetCard) {
			// Scroll suave hasta el producto encontrado
			targetCard.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest'
			});

			// Efecto visual temporal para resaltar el producto
			highlightProduct(targetCard);

			console.log(`Scroll hacia producto: ${productName}`);
		} else {
			console.log(`Producto no encontrado en las cards: ${productName}`);

			// Mostrar mensaje amigable al usuario
			showMessage(`Producto "${productName}" no encontrado en el catálogo actual`);
		}
	}

	// === FUNCIÓN: Resaltar producto temporalmente ===
	function highlightProduct(card) {
		// Guardar estilos originales
		const originalTransform = card.style.transform;
		const originalBoxShadow = card.style.boxShadow;
		const originalBorder = card.style.border;

		// Aplicar resaltado
		card.style.transform = 'scale(1.05)';
		card.style.boxShadow = '0 8px 25px rgba(160, 112, 64, 0.4)';
		card.style.border = '3px solid var(--color-accent)';
		card.style.transition = 'all 0.3s ease';

		// Quitar resaltado después de 2 segundos
		setTimeout(() => {
			card.style.transform = originalTransform;
			card.style.boxShadow = originalBoxShadow;
			card.style.border = originalBorder;

			// Quitar transition después de la animación
			setTimeout(() => {
				card.style.transition = '';
			}, 300);
		}, 2000);
	}

	// === FUNCIÓN: Mostrar mensaje al usuario ===
	function showMessage(text) {
		// Crear elemento de mensaje si no existe
		let messageDiv = document.querySelector('.carousel-message');
		if (!messageDiv) {
			messageDiv = document.createElement('div');
			messageDiv.className = 'carousel-message';
			messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--color-bg-secundary);
        color: var(--color-text-buttons);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-size: 0.9rem;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
			document.body.appendChild(messageDiv);
		}

		// Actualizar texto y mostrar
		messageDiv.textContent = text;
		messageDiv.style.transform = 'translateX(0)';

		// Ocultar después de 3 segundos
		setTimeout(() => {
			messageDiv.style.transform = 'translateX(100%)';
		}, 3000);
	}

	// === RESPONSIVE: Actualizar al cambiar tamaño de ventana ===
	function handleResize() {
		const newItemsToShow = getItemsToShow();
		const newItemWidth = getItemWidth();

		if (newItemsToShow !== itemsToShow || newItemWidth !== itemWidth) {
			itemsToShow = newItemsToShow;
			itemWidth = newItemWidth;

			// Ajustar currentIndex si es necesario
			const maxIndex = Math.max(0, items.length - itemsToShow);
			if (currentIndex > maxIndex) {
				currentIndex = maxIndex;
			}

			// Actualizar posición y botones
			const scrollDistance = currentIndex * itemWidth;
			carousel.scrollTo({
				left: scrollDistance,
				behavior: 'smooth'
			});

			updateButtons();

			console.log(`Resize: mostrando ${itemsToShow} elementos`);
		}
	}

	// Event listener para resize con debounce
	let resizeTimeout;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(handleResize, 250);
	});

	// === INICIALIZACIÓN ===
	// Actualizar estado inicial de los botones
	updateButtons();

	console.log('✅ Carrusel configurado correctamente');
}