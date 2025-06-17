// js/loader.js - Sistema de loaders temáticos
export class LoaderSystem {
  constructor(options = {}) {
    this.duration = options.duration || 3000;
    this.isLoading = false;
    this.loaderTypes = {
      order: this.createOrderLoader(),
      products: this.createProductsLoader(),
      gallery: this.createGalleryLoader(),
      default: this.createDefaultLoader()
    };
  }

  // 🫒 Loader para "Hacer Pedido" - Tema salazones y productos artesanales
  createOrderLoader() {
    return `
      <div class="page-loader order-loader" id="page-loader">
        <div class="loader-container">
          <div class="loader-brand">
            <h2>🫒 Salazones José Rumí</h2>
            <p>Preparando tu pedido artesanal...</p>
          </div>
          
          <div class="loader-animation">
            <div class="deli-scene">
              <div class="cutting-board">
                <div class="products-selection">
                  <div class="product-item item-1">🫒</div>
                  <div class="product-item item-2">🥓</div>
                  <div class="product-item item-3">🍷</div>
                  <div class="product-item item-4">🥜</div>
                </div>
                <div class="knife-cutting">
                  <div class="knife">🔪</div>
                </div>
              </div>
              <div class="artisan-hands">
                <div class="hand-left">👐</div>
                <div class="ingredients-floating">
                  <span class="ingredient">🧄</span>
                  <span class="ingredient">🌿</span>
                  <span class="ingredient">🧂</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="loader-text">
            <p class="animated-text">
              <span>Seleccionando los mejores salazones</span>
              <span>Cortando embutidos artesanales</span>
              <span>Preparando tu pedido con cariño</span>
            </p>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill artisan-gradient"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 🛒 Loader para "Ver Productos" - Tema delicatessen artesanal
  createProductsLoader() {
    return `
      <div class="page-loader products-loader" id="page-loader">
        <div class="loader-container">
          <div class="loader-brand">
            <h2>🛒 Productos Artesanales</h2>
            <p>Cargando nuestras especialidades...</p>
          </div>
          
          <div class="loader-animation">
            <div class="deli-counter">
              <div class="counter-display">
                <div class="showcase">
                  <div class="deli-item rotate-1">🫒</div>
                  <div class="deli-item rotate-2">🥓</div>
                  <div class="deli-item rotate-3">🧀</div>
                  <div class="deli-item rotate-4">🍷</div>
                  <div class="deli-item rotate-5">🥜</div>
                  <div class="deli-item rotate-6">🫘</div>
                </div>
                <div class="counter-glass"></div>
              </div>
              <div class="scale-weighing">
                <div class="scale">⚖️</div>
                <div class="weight-bouncing">250g</div>
              </div>
              <div class="artisan-quality">
                <div class="quality-stamp">✨ ARTESANAL ✨</div>
              </div>
            </div>
          </div>
          
          <div class="loader-text">
            <p class="animated-text">
              <span>Organizando nuestros salazones</span>
              <span>Actualizando productos frescos</span>
              <span>Mostrando lo mejor de la casa</span>
            </p>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill deli-gradient"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 📸 Loader para "Ver Galería" - Tema fotográfico
  createGalleryLoader() {
    return `
      <div class="page-loader gallery-loader" id="page-loader">
        <div class="loader-container">
          <div class="loader-brand">
            <h2>📸 Galería de Momentos</h2>
            <p>Poniéndonos guapos para la foto...</p>
          </div>
          
          <div class="loader-animation">
            <div class="camera-scene">
              <div class="camera">
                <div class="camera-body">
                  <div class="lens">
                    <div class="lens-inner"></div>
                    <div class="lens-reflection"></div>
                  </div>
                  <div class="flash-light"></div>
                </div>
              </div>
              <div class="photo-frames">
                <div class="photo-frame frame-1">
                  <div class="photo-content">🐟</div>
                </div>
                <div class="photo-frame frame-2">
                  <div class="photo-content">📷</div>
                </div>
                <div class="photo-frame frame-3">
                  <div class="photo-content">✨</div>
                </div>
              </div>
              <div class="sparkles">
                <div class="sparkle sparkle-1">✨</div>
                <div class="sparkle sparkle-2">⭐</div>
                <div class="sparkle sparkle-3">💫</div>
              </div>
            </div>
          </div>
          
          <div class="loader-text">
            <p class="animated-text">
              <span>Ajustando la iluminación perfecta</span>
              <span>Capturando nuestros mejores momentos</span>
              <span>Revelando recuerdos especiales</span>
            </p>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill photo-gradient"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 🌊 Loader por defecto - Tema general
  createDefaultLoader() {
    return `
      <div class="page-loader default-loader" id="page-loader">
        <div class="loader-container">
          <div class="loader-brand">
            <h2>Salazones José Rumí</h2>
            <p>Mercado Central de Almería</p>
          </div>
          
          <div class="loader-animation">
            <div class="general-animation">
              <div class="rotating-logo">🌊</div>
            </div>
          </div>
          
          <div class="loader-text">
            <p>Cargando...</p>
          </div>
          
          <div class="progress-bar">
            <div class="progress-fill default-gradient"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Comprobar si ya estamos en la página de destino
  isCurrentPage(targetUrl) {
    // Obtener la URL actual sin parámetros ni fragmentos
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    // Obtener el archivo de destino desde la URL del enlace
    let targetFile;
    try {
      const url = new URL(targetUrl, window.location.origin);
      targetFile = url.pathname.split('/').pop() || 'index.html';
    } catch {
      // Si es una URL relativa
      targetFile = targetUrl.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    }
    
    // Normalizar nombres de archivos
    const normalizeFileName = (filename) => {
      if (!filename || filename === '' || filename === '/') return 'index.html';
      if (filename.endsWith('/')) return 'index.html';
      return filename;
    };
    
    const normalizedCurrent = normalizeFileName(currentFile);
    const normalizedTarget = normalizeFileName(targetFile);
    
    console.log(`🔍 Comparando páginas: actual="${normalizedCurrent}" vs destino="${normalizedTarget}"`);
    
    return normalizedCurrent === normalizedTarget;
  }

  // Detectar tipo de loader según la URL de destino
  detectLoaderType(url) {
    if (url.includes('order.html') || url.includes('/order')) {
      return 'order';
    } else if (url.includes('products.html') || url.includes('/products')) {
      return 'products';
    } else if (url.includes('prices.html') || url.includes('/prices') || 
               url.includes('gallery.html') || url.includes('/gallery')) {
      return 'gallery';
    }
    return 'default';
  }

  // Mostrar el loader específico
  show(type = 'default') {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    const loaderHTML = this.loaderTypes[type] || this.loaderTypes.default;
    const loaderElement = document.createElement('div');
    loaderElement.innerHTML = loaderHTML;
    const loader = loaderElement.firstElementChild;
    
    document.body.appendChild(loader);
    
    // Activar animaciones
    requestAnimationFrame(() => {
      loader.classList.add('active');
      this.startProgressBar();
      this.startTextAnimation();
    });

    return loader;
  }

  // Ocultar el loader
  hide(loader) {
    if (!this.isLoading) return;
    
    loader.classList.add('fade-out');
    
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
      this.isLoading = false;
    }, 500);
  }

  // Animar texto
  startTextAnimation() {
    const textElements = document.querySelectorAll('.animated-text span');
    if (textElements.length === 0) return;

    let currentIndex = 0;
    const interval = this.duration / textElements.length;

    textElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });

    const showText = () => {
      if (currentIndex < textElements.length) {
        const currentText = textElements[currentIndex];
        currentText.style.opacity = '1';
        currentText.style.transform = 'translateY(0)';
        
        if (currentIndex > 0) {
          textElements[currentIndex - 1].style.opacity = '0.5';
        }
        
        currentIndex++;
        setTimeout(showText, interval);
      }
    };

    showText();
  }

  // Iniciar la barra de progreso
  startProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = '100%';
    }
  }

  // Interceptar navegación con loader temático
  setupPageTransitions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      if (link && 
          !link.target && 
          !link.href.includes('#') && 
          !link.href.includes('mailto:') && 
          !link.href.includes('tel:') &&
          (link.href.includes(window.location.origin) || 
           link.getAttribute('href').startsWith('.') || 
           link.getAttribute('href').startsWith('/') ||
           !link.getAttribute('href').includes('://'))) {
        
        // Comprobar si ya estamos en la página de destino
        if (this.isCurrentPage(link.href)) {
          // Si ya estamos en la página, hacer refresh normal (como F5)
          e.preventDefault();
          window.location.reload();
          return;
        }
        
        // Si es una página diferente, mostrar loader
        e.preventDefault();
        const loaderType = this.detectLoaderType(link.href);
        this.navigateWithLoader(link.href, loaderType);
      }
    });
  }

  // Navegar con loader temático
  navigateWithLoader(url, type = 'default') {
    const loader = this.show(type);
    
    setTimeout(() => {
      window.location.href = url;
    }, this.duration);
  }

  // Inicializar sistema completo
  init() {
    this.setupPageTransitions();
    this.addStyles();
    console.log('🔄 Sistema de loaders temáticos activado');
  }

  // Añadir todos los estilos CSS
  addStyles() {
    if (document.getElementById('loader-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'loader-styles';
    styles.textContent = this.getCompleteStyles();
    document.head.appendChild(styles);
  }

  getCompleteStyles() {
    return `
      /* === ESTILOS BASE === */
      .page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .page-loader.active {
        opacity: 1;
      }

      .page-loader.fade-out {
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .loader-container {
        text-align: center;
        color: white;
        max-width: 450px;
        padding: 2rem;
      }

      .loader-brand h2 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }

      .loader-brand p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }

      .loader-animation {
        height: 120px;
        margin: 2rem 0;
        position: relative;
        overflow: hidden;
      }

      .animated-text span {
        display: block;
        transition: all 0.5s ease;
        margin: 0.5rem 0;
        font-style: italic;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 1.5rem;
      }

      .progress-fill {
        width: 0%;
        height: 100%;
        border-radius: 3px;
        transition: width 3s ease-out;
        position: relative;
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
        animation: shimmer 1.5s ease-in-out infinite;
      }

      /* === LOADER PEDIDOS (DELICATESSEN ARTESANAL) === */
      .order-loader {
        background: linear-gradient(135deg, #8d6e63 0%, #a1887f 50%, #bcaaa4 100%);
      }

      .deli-scene {
        position: relative;
        width: 140px;
        height: 100px;
        margin: 0 auto;
      }

      .cutting-board {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 40px;
        background: #8d6e63;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      }

      .products-selection {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
      }

      .product-item {
        font-size: 1.2rem;
        animation: product-bounce 2s ease-in-out infinite;
      }

      .item-1 { animation-delay: 0s; }
      .item-2 { animation-delay: 0.3s; }
      .item-3 { animation-delay: 0.6s; }
      .item-4 { animation-delay: 0.9s; }

      .knife-cutting {
        position: absolute;
        top: 5px;
        right: -10px;
        animation: knife-chop 1.5s ease-in-out infinite;
      }

      .knife {
        font-size: 1.5rem;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      }

      .artisan-hands {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
      }

      .hand-left {
        font-size: 1.5rem;
        animation: hands-work 2s ease-in-out infinite;
      }

      .ingredients-floating {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
      }

      .ingredient {
        position: absolute;
        font-size: 0.8rem;
        animation: ingredient-float 3s ease-in-out infinite;
      }

      .ingredient:nth-child(1) { left: 0; animation-delay: 0s; }
      .ingredient:nth-child(2) { left: 40px; animation-delay: 1s; }
      .ingredient:nth-child(3) { left: 80px; animation-delay: 2s; }

      .artisan-gradient {
        background: linear-gradient(90deg, #8d6e63, #a1887f, #d7ccc8);
      }

      /* === LOADER PRODUCTOS (DELICATESSEN) === */
      .products-loader {
        background: linear-gradient(135deg, #bf360c 0%, #d84315 50%, #ff5722 100%);
      }

      .deli-counter {
        position: relative;
        width: 120px;
        height: 90px;
        margin: 0 auto;
      }

      .counter-display {
        position: relative;
        width: 100px;
        height: 60px;
        background: #6d4c41;
        border-radius: 8px;
        margin: 0 auto;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }

      .showcase {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        width: 80px;
      }

      .deli-item {
        font-size: 1rem;
        animation: item-rotate 3s ease-in-out infinite;
        text-align: center;
      }

      .rotate-1 { animation-delay: 0s; }
      .rotate-2 { animation-delay: 0.3s; }
      .rotate-3 { animation-delay: 0.6s; }
      .rotate-4 { animation-delay: 0.9s; }
      .rotate-5 { animation-delay: 1.2s; }
      .rotate-6 { animation-delay: 1.5s; }

      .counter-glass {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.2);
      }

      .scale-weighing {
        position: absolute;
        bottom: 5px;
        right: -10px;
        text-align: center;
      }

      .scale {
        font-size: 1.2rem;
        animation: scale-balance 2s ease-in-out infinite;
      }

      .weight-bouncing {
        font-size: 0.7rem;
        color: #fff;
        font-weight: bold;
        margin-top: 2px;
        animation: weight-bounce 1.5s ease-in-out infinite;
      }

      .artisan-quality {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
      }

      .quality-stamp {
        font-size: 0.6rem;
        color: #ffeb3b;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        animation: stamp-glow 2s ease-in-out infinite;
      }

      .deli-gradient {
        background: linear-gradient(90deg, #ff5722, #ff7043, #ff8a65);
      }

      /* === LOADER GALERÍA (FOTOGRAFÍA) === */
      .gallery-loader {
        background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #9c27b0 100%);
      }

      .camera-scene {
        position: relative;
        width: 140px;
        height: 100px;
        margin: 0 auto;
      }

      .camera {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        animation: camera-focus 2s ease-in-out infinite;
      }

      .camera-body {
        width: 60px;
        height: 40px;
        background: #424242;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }

      .lens {
        width: 35px;
        height: 35px;
        background: #1a1a1a;
        border-radius: 50%;
        position: absolute;
        top: 2.5px;
        left: 12.5px;
        border: 3px solid #333;
      }

      .lens-inner {
        width: 20px;
        height: 20px;
        background: #0d47a1;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: lens-zoom 1.5s ease-in-out infinite;
      }

      .lens-reflection {
        width: 8px;
        height: 8px;
        background: rgba(255,255,255,0.8);
        border-radius: 50%;
        position: absolute;
        top: 6px;
        left: 6px;
      }

      .flash-light {
        width: 8px;
        height: 8px;
        background: #ffeb3b;
        border-radius: 50%;
        position: absolute;
        top: -5px;
        right: 5px;
        animation: camera-flash 3s ease-in-out infinite;
      }

      .photo-frames {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .photo-frame {
        position: absolute;
        width: 25px;
        height: 30px;
        background: #fff;
        border-radius: 3px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: photo-develop 3s ease-in-out infinite;
      }

      .frame-1 { top: 10px; left: 10px; animation-delay: 0.5s; }
      .frame-2 { top: 15px; right: 15px; animation-delay: 1s; }
      .frame-3 { bottom: 15px; left: 20px; animation-delay: 1.5s; }

      .photo-content {
        font-size: 1rem;
        text-align: center;
        line-height: 30px;
      }

      .sparkles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .sparkle {
        position: absolute;
        font-size: 1.2rem;
        animation: sparkle-twinkle 2s ease-in-out infinite;
      }

      .sparkle-1 { top: 5px; right: 20px; animation-delay: 0.2s; }
      .sparkle-2 { bottom: 20px; right: 5px; animation-delay: 0.8s; }
      .sparkle-3 { bottom: 5px; left: 5px; animation-delay: 1.4s; }

      .photo-gradient {
        background: linear-gradient(90deg, #9c27b0, #ba68c8, #ce93d8);
      }

      /* === LOADER POR DEFECTO === */
      .default-loader {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      }

      .rotating-logo {
        font-size: 3rem;
        animation: rotate-logo 2s linear infinite;
      }

      .default-gradient {
        background: linear-gradient(90deg, #4fc3f7, #29b6f6);
      }

      /* === ANIMACIONES ARTESANALES === */
      @keyframes product-bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-8px) scale(1.1); }
      }

      @keyframes knife-chop {
        0%, 100% { transform: rotateZ(0deg) translateY(0); }
        50% { transform: rotateZ(-15deg) translateY(3px); }
      }

      @keyframes hands-work {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      @keyframes ingredient-float {
        0%, 100% { transform: translateY(0) rotateZ(0deg); opacity: 0.7; }
        33% { transform: translateY(-10px) rotateZ(120deg); opacity: 1; }
        66% { transform: translateY(-5px) rotateZ(240deg); opacity: 0.8; }
      }

      @keyframes item-rotate {
        0%, 100% { transform: rotateZ(0deg) scale(1); }
        25% { transform: rotateZ(90deg) scale(1.1); }
        50% { transform: rotateZ(180deg) scale(1); }
        75% { transform: rotateZ(270deg) scale(1.1); }
      }

      @keyframes scale-balance {
        0%, 100% { transform: rotateZ(0deg); }
        25% { transform: rotateZ(-5deg); }
        75% { transform: rotateZ(5deg); }
      }

      @keyframes weight-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }

      @keyframes stamp-glow {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }

      @keyframes camera-focus {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.1); }
      }

      @keyframes lens-zoom {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
      }

      @keyframes camera-flash {
        0%, 90%, 100% { opacity: 0; transform: scale(1); }
        95% { opacity: 1; transform: scale(1.5); }
      }

      @keyframes photo-develop {
        0% { opacity: 0; transform: scale(0.8) rotateZ(-10deg); }
        50% { opacity: 0.7; transform: scale(1) rotateZ(0deg); }
        100% { opacity: 1; transform: scale(1) rotateZ(0deg); }
      }

      @keyframes sparkle-twinkle {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      @keyframes rotate-logo {
        from { transform: rotateZ(0deg); }
        to { transform: rotateZ(360deg); }
      }

      @keyframes shimmer {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }

      /* === RESPONSIVE === */
      @media (max-width: 768px) {
        .loader-container {
          padding: 1rem;
          max-width: 350px;
        }
        
        .loader-brand h2 {
          font-size: 1.5rem;
        }
        
        .loader-animation {
          height: 80px;
        }

        .camera-scene,
        .market-stall {
          transform: scale(0.8);
        }
      }
    `;
  }
}

// Función para inicializar el sistema de carga
export function initLoader(options = {}) {
  const loader = new LoaderSystem(options);
  loader.init();
  return loader;
}