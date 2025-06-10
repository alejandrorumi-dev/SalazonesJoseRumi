// Script para el funcionamiento del menú hamburguesa con overlay

export function setupHamburgerMenu() {
	const hamburger = document.getElementById('hamburger-toggle');
	const mobileNav = document.getElementById('mobile-nav');
	const overlay = document.getElementById('overlay');

	hamburger.addEventListener('click', () => {
		const isOpen = hamburger.classList.contains('open');

		if (isOpen) {
			// Cerrar menú
			hamburger.classList.remove('open');
			mobileNav.classList.remove('open');
			overlay.classList.remove('active');
		} else {
			// Abrir menú
			hamburger.classList.add('open');
			mobileNav.classList.add('open');
			overlay.classList.add('active');
		}
	});

	// Cerrar menú al hacer clic en el overlay
	overlay.addEventListener('click', () => {
		hamburger.classList.remove('open');
		mobileNav.classList.remove('open');
		overlay.classList.remove('active');
	});

	// Cierre al hacer clic fuera (mantener funcionalidad original)
	document.addEventListener('click', (e) => {
		if (
			mobileNav.classList.contains('open') &&
			!mobileNav.contains(e.target) &&
			e.target !== hamburger &&
			!hamburger.contains(e.target) &&
			e.target !== overlay
		) {
			hamburger.classList.remove('open');
			mobileNav.classList.remove('open');
			overlay.classList.remove('active');
		}
	});
}