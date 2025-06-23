// === CARRUSEL DE BANNERS PROMOCIONALES ===
export function setupBannerCarousel() {
	// Solo activar en tablets (max-width: 1024px)
	const mediaQuery = window.matchMedia('(max-width: 1024px)');

	if (!mediaQuery.matches) {
		console.log('🖥️ Desktop detectado - carrusel de banners desactivado');
		return null; // No activar en desktop
	}

	// Usar los selectores que SÍ existen en tu HTML
	const carousel = document.querySelector('.banner-carousel-wrapper');
	const indicators = document.querySelectorAll('.banner-indicator');
	const banners = document.querySelectorAll('.banner-promocional');

	if (!carousel || banners.length === 0) {
		console.warn('❌ Elementos del carrusel de banners no encontrados');
		console.log('Carousel:', carousel);
		console.log('Banners:', banners.length);
		return null;
	}

	let currentSlide = 0;
	const totalSlides = banners.length;

	// === FUNCIÓN PRINCIPAL ===
	function goToSlide(slideIndex) {
		currentSlide = slideIndex;

		// Usar clases .active como tu CSS espera
		banners.forEach((banner, index) => {
			banner.classList.remove('active');
			if (index === slideIndex) {
				banner.classList.add('active');
			}
		});

		// Actualizar indicadores
		indicators.forEach((indicator, index) => {
			indicator.classList.toggle('active', index === slideIndex);
		});

		console.log(`🎠 Banner activo: ${slideIndex === 0 ? 'Ofertas' : slideIndex === 1 ? 'Packs' : 'Top Ventas'}`);
	}

	// === NAVEGACIÓN CIRCULAR ===
	function nextSlide() {
		const nextIndex = (currentSlide + 1) % totalSlides;
		goToSlide(nextIndex);
	}

	function prevSlide() {
		const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
		goToSlide(prevIndex);
	}

	// === EVENT LISTENERS ===

	// Indicadores
	indicators.forEach((indicator, index) => {
		indicator.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			console.log(`🎯 Clic en indicador: ${index}`);
			goToSlide(index);
		});
	});

	// === GESTOS TÁCTILES ===
	let startX = 0;
	let endX = 0;

	carousel.addEventListener('touchstart', (e) => {
		startX = e.touches[0].clientX;
		console.log('👆 Touch start');
	}, { passive: true });

	carousel.addEventListener('touchend', (e) => {
		endX = e.changedTouches[0].clientX;
		const deltaX = startX - endX;

		console.log(`👆 Touch end - Diferencia: ${deltaX}px`);

		if (Math.abs(deltaX) > 50) {
			if (deltaX > 0) {
				console.log('👉 Swipe hacia siguiente');
				nextSlide();
			} else {
				console.log('👈 Swipe hacia anterior');
				prevSlide();
			}
		}
	}, { passive: true });

	// === RESPONSIVE LISTENER ===
	function handleMediaChange(e) {
		if (e.matches) {
			// Activar carrusel - asegurar que el primer banner esté activo
			goToSlide(0);
			console.log('🎠 Carrusel de banners activado para tablet');
		} else {
			// Desactivar carrusel - remover todas las clases active
			banners.forEach(banner => banner.classList.remove('active'));
			console.log('🎠 Carrusel de banners desactivado para desktop');
		}
	}

	mediaQuery.addListener(handleMediaChange);

	// === INICIALIZACIÓN ===
	// Asegurar que solo el primer banner tenga la clase active
	goToSlide(0);
	console.log('🎠 Carrusel de banners inicializado para tablet');

	// === API PÚBLICA ===
	return {
		goToSlide,
		nextSlide,
		prevSlide,
		getCurrentSlide: () => currentSlide,
		getTotalSlides: () => totalSlides
	};
}