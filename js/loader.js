// loader.js - VERSIÓN CORREGIDA

export function initLoader(options = {}) {
  const config = {
    duration: 3000,
    showOnFirstLoad: true,
    showOnNavigation: false, // ✅ CAMBIADO: No mostrar en navegación
    ...options
  };

  let loaderElement = null;
  let isFirstLoad = true;

  function createLoader() {
    if (loaderElement) return loaderElement;

    loaderElement = document.createElement('div');
    loaderElement.className = 'page-loader';
    loaderElement.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo">
          <img src="${getLogoPath()}" alt="Salazones José Rumí" />
        </div>
        <div class="loader-spinner"></div>
        <div class="loader-text">Cargando...</div>
      </div>
    `;

    // Estilos CSS integrados
    const style = document.createElement('style');
    style.textContent = `
      .page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.5s ease;
      }

      .page-loader.fade-out {
        opacity: 0;
        pointer-events: none;
      }

      .loader-content {
        text-align: center;
        color: white;
      }

      .loader-logo img {
        width: 820px;
        height: auto;
        margin-bottom: 20px;
        animation: pulse 2s ease-in-out infinite;
      }

      .loader-spinner {
        width: 80px;
        height: 80px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        margin: 20px auto;
        animation: spin 1s linear infinite;
      }

      .loader-text {
        font-family: 'Segoe UI', sans-serif;
        font-size: 32px;
        font-weight: 500;
        margin-top: 10px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(loaderElement);
    return loaderElement;
  }

  function getLogoPath() {
    // Detectar si estamos en la raíz o en una subcarpeta
    const isInSubfolder = window.location.pathname.includes('/pages/');
    return isInSubfolder ? '../assets/images/logoSalazones.png' : 'assets/images/logoSalazones.png';
  }

  function showLoader() {
    const loader = createLoader();
    loader.classList.remove('fade-out');
    document.body.style.overflow = 'hidden';
  }

  function hideLoader() {
    if (!loaderElement) return;
    
    loaderElement.classList.add('fade-out');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (loaderElement && loaderElement.parentNode) {
        loaderElement.parentNode.removeChild(loaderElement);
        loaderElement = null;
      }
    }, 500);
  }

  // ✅ SOLO mostrar loader en la primera carga
  function init() {
    // Verificar si es la primera carga real de la página
    const navigationEntries = performance.getEntriesByType('navigation');
    const isReload = navigationEntries.length > 0 && 
                    (navigationEntries[0].type === 'reload' || 
                     navigationEntries[0].type === 'navigate');

    if (config.showOnFirstLoad && (isFirstLoad || isReload)) {
      showLoader();
      
      // Asegurar que la página esté completamente cargada
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(hideLoader, config.duration);
        });
      } else {
        setTimeout(hideLoader, config.duration);
      }
      
      isFirstLoad = false;
    }

    // ✅ NO interceptar clics en enlaces - dejar navegación normal
    // Comentamos o eliminamos esta parte problemática:
    /*
    if (config.showOnNavigation) {
      document.addEventListener('click', handleLinkClick);
    }
    */
  }

  // ✅ Función comentada para evitar interferencias
  /*
  function handleLinkClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
        href.startsWith('tel:') || link.target === '_blank') return;
    
    e.preventDefault();
    showLoader();
    
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  }
  */

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API pública
  return {
    show: showLoader,
    hide: hideLoader,
    isVisible: () => loaderElement && !loaderElement.classList.contains('fade-out')
  };
}