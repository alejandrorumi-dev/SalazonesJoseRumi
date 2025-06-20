// Función para activar animación de borrado en texto
export function animateTitle() {
  const titleElement = document.querySelector('.main-title');
  if (!titleElement) return;
  const originalText = 'Mercado Central de Almería';
  const newText = '¡ SALAZONES JOSÉ RUMÍ !';
  let i = originalText.length;

  // Añade clase con cursor visual (estilo máquina de escribir)
  titleElement.classList.add('typing-cursor');

  // Espera 1 segundo antes de empezar a borrar
  setTimeout(() => {
    const eraseInterval = setInterval(() => {
      titleElement.textContent = originalText.slice(0, i) + '|';
      i--;

      if (i < 0) {
        clearInterval(eraseInterval);
        writeNewText();
      }
    }, 100); // velocidad de borrado
  }, 700); // espera inicial de 1 segundo

  function writeNewText() {
    let j = 0;
    const writeInterval = setInterval(() => {
      titleElement.textContent = newText.slice(0, j) + '|';
      j++;

      if (j > newText.length) {
        clearInterval(writeInterval);
        titleElement.textContent = newText; // quitar la barra al final
        titleElement.classList.remove('typing-cursor');
      }
    }, 120); // velocidad de escritura
  }
}

// No bloquear enlaces válidos en dispositivos táctiles
export function blockExpandButtonClickOnTouchDevices() {
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) {
    const buttons = document.querySelectorAll('.expand-button');

    buttons.forEach(button => {
      // ✅ SOLO bloqueamos si NO es un enlace válido
      const hasValidHref = button.hasAttribute('href') && button.getAttribute('href') !== '#';
      
      if (!hasValidHref) {
        // Solo bloquear botones sin enlace válido
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('❌ Clic bloqueado (sin enlace válido)');
        });
      } else {
        // ✅ Para enlaces válidos, permitir navegación normal
        console.log('✅ Enlace válido detectado:', button.getAttribute('href'));
      }
    });
  }
}