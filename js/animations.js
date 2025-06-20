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

// Evitar expansión por clic en dispositivos táctiles,
// pero permitir que los enlaces funcionen correctamente
export function blockExpandButtonClickOnTouchDevices() {
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) {
    const buttons = document.querySelectorAll('.expand-button');

    buttons.forEach(button => {
      // Eliminar cualquier clase o animación visual si la tuviera
      const text = button.querySelector('.text');
      if (text) {
        text.style.transform = 'none';
        text.style.opacity = '1';
        text.style.visibility = 'visible';
      }

      // ⚠️ Si el botón contiene un enlace (<a>), NO bloquear el click
      const hasLink = button.querySelector('a');
      if (!hasLink) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('❌ Clic bloqueado en botón expansible (modo táctil, sin enlace)');
        });
      }
    });
  }
}
