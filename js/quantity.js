// js/quantity.js - Sistema de gestión de cantidades para productos

export class QuantitySystem {
  constructor() {
    this.quantities = new Map(); // Almacena las cantidades seleccionadas por producto
    this.cart = new Map(); // ✅ NUEVO: Almacena los productos del carrito
    this.globalClickListenerAdded = false; // ✅ NUEVO: Control de listener global
    this.init();
  }

  init() {
    this.setupQuantityDropdowns();
    this.setupAddToCartButtons();
    this.setupCartInterface();
    console.log('📦 Sistema de cantidades inicializado');
  }

  // ✅ NUEVO MÉTODO: Configurar interfaz del carrito
  setupCartInterface() {
    // Configurar botón de finalizar pedido
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.handleCheckout();
      });
    }

    // Configurar estado inicial del carrito
    this.updateCartDisplay();
  }

  handleCheckout() {
    if (this.cart.size === 0) {
      this.showMessage('El carrito está vacío', 'warning');
      return;
    }

    // Aquí puedes agregar la lógica de checkout
    this.showMessage('Funcionalidad de checkout en desarrollo', 'info');
    console.log('🛒 Procesando pedido:', Array.from(this.cart.values()));
  }

  setupQuantityDropdowns() {
    // Configurar todos los dropdowns de cantidad
    const quantityDropdowns = document.querySelectorAll('[id^="amount-dropdown-"]');
    
    quantityDropdowns.forEach(dropdown => {
      this.initializeDropdown(dropdown);
    });
  }

  initializeDropdown(dropdown) {
    const productId = this.extractProductId(dropdown.id);
    const productCard = dropdown.closest('.product-card');
    const label = dropdown.querySelector('.select-label');
    const customTrigger = dropdown.querySelector('.custom-trigger');
    const customContainer = dropdown.querySelector('.custom-amount-container');
    const customInput = dropdown.querySelector('input[type="number"]');
    const hiddenSelect = dropdown.querySelector('select');

    // ✅ Detectar tipo de producto para determinar unidades
    const productType = this.detectProductType(productCard);

    // ✅ Configurar opciones según el tipo de producto
    this.setupDropdownOptions(dropdown, productType);

    // Establecer cantidad inicial según el tipo
    const initialAmount = productType.isUnit ? 1 : 250;
    const initialUnit = productType.isUnit ? 'unidad' : 'g';
    
    this.quantities.set(productId, { 
      amount: initialAmount, 
      unit: initialUnit,
      productType: productType
    });
    this.updateTotalPrice(productId);

    // ✅ Configurar event listeners DESPUÉS de crear las opciones
    this.setupDropdownEventListeners(dropdown, productId, productType);
  }

  extractProductId(dropdownId) {
    // Extraer ID del producto desde "amount-dropdown-X"
    return dropdownId.replace('amount-dropdown-', '');
  }

  // ✅ NUEVO: Configurar event listeners DESPUÉS de crear las opciones dinámicamente
  setupDropdownEventListeners(dropdown, productId, productType) {
    const label = dropdown.querySelector('.select-label');
    const options = dropdown.querySelectorAll('.dropdown-option:not(.custom-trigger)');
    const customTrigger = dropdown.querySelector('.custom-trigger');
    const customInput = dropdown.querySelector('input[type="number"]');

    // ✅ Event listener para el label (toggle dropdown)
    if (label) {
      // Remover cualquier listener previo
      label.replaceWith(label.cloneNode(true));
      const newLabel = dropdown.querySelector('.select-label');
      
      newLabel.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = dropdown.classList.contains('active');
        
        // Cerrar todos los otros dropdowns primero
        document.querySelectorAll('[id^="amount-dropdown-"]').forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('active');
            const otherOptions = otherDropdown.querySelector('.dropdown-options');
            if (otherOptions) otherOptions.style.display = 'none';
          }
        });
        
        // Toggle este dropdown
        if (isActive) {
          dropdown.classList.remove('active');
          dropdown.querySelector('.dropdown-options').style.display = 'none';
        } else {
          dropdown.classList.add('active');
          dropdown.querySelector('.dropdown-options').style.display = 'block';
        }
      });
    }

    // ✅ Event listeners para opciones predefinidas
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const amount = parseInt(option.dataset.value);
        console.log('✅ Opción seleccionada:', amount, productType.isUnit ? 'unidades' : 'gramos');
        this.selectQuantity(productId, amount, dropdown);
      });
    });

    // ✅ Event listener para "Otra cantidad"
    if (customTrigger) {
      customTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.showCustomInput(dropdown);
      });
    }

    // ✅ Event listener para input personalizado
    if (customInput) {
      customInput.addEventListener('input', (e) => {
        const amount = parseInt(e.target.value) || (productType.isUnit ? 1 : 250);
        this.updateQuantity(productId, amount);
        this.updateTotalPrice(productId);
        
        // Actualizar el label en tiempo real
        this.updateDropdownLabel(dropdown, amount);
      });

      customInput.addEventListener('blur', () => {
        setTimeout(() => {
          this.hideCustomInput(dropdown);
        }, 300);
      });

      customInput.addEventListener('keydown', (e) => {
        // Permitir teclas de navegación y números
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight'];
        const isNumber = (e.key >= '0' && e.key <= '9');
        
        if (!allowedKeys.includes(e.key) && !isNumber) {
          e.preventDefault();
          return;
        }
        
        if (e.key === 'Enter') {
          const amount = parseInt(e.target.value) || (productType.isUnit ? 1 : 250);
          this.selectQuantity(productId, amount, dropdown);
        }
        if (e.key === 'Escape') {
          this.hideCustomInput(dropdown);
        }
      });
    }

    // ✅ Event listener global para cerrar dropdown al hacer clic fuera
    if (!this.globalClickListenerAdded) {
      document.addEventListener('click', (e) => {
        const clickedDropdown = e.target.closest('[id^="amount-dropdown-"]');
        
        if (!clickedDropdown) {
          // Click fuera de cualquier dropdown - cerrar todos
          document.querySelectorAll('[id^="amount-dropdown-"]').forEach(dropdown => {
            dropdown.classList.remove('active');
            const options = dropdown.querySelector('.dropdown-options');
            if (options) options.style.display = 'none';
          });
        }
      });
      this.globalClickListenerAdded = true;
    }

    console.log(`✅ Event listeners configurados para ${options.length} opciones`);
  }

  // ✅ NUEVO: Detectar tipo de producto basado en categoría y nombre
  detectProductType(productCard) {
    const category = productCard.getAttribute('data-category');
    const productName = productCard.querySelector('.product-name')?.textContent.toLowerCase() || '';
    
    // Productos que se venden por unidades
    const unitCategories = ['vinos', 'reposteria'];
    const unitKeywords = ['vino', 'botella', 'tarta', 'pastel', 'rosquilla', 'galleta', 'pan'];
    
    const isUnitCategory = unitCategories.includes(category);
    const hasUnitKeyword = unitKeywords.some(keyword => productName.includes(keyword));
    
    if (isUnitCategory || hasUnitKeyword) {
      return {
        isUnit: true,
        unitName: 'unidad',
        unitNamePlural: 'unidades',
        defaultAmount: 1,
        options: [1, 2, 3, 6, 12]
      };
    }
    
    // Productos que se venden por peso (por defecto)
    return {
      isUnit: false,
      unitName: 'g',
      unitNamePlural: 'g',
      defaultAmount: 250,
      options: [100, 250, 500, 1000, 2000]
    };
  }

  // ✅ NUEVO: Configurar opciones del dropdown según el tipo
  setupDropdownOptions(dropdown, productType) {
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    const customContainer = dropdown.querySelector('.custom-amount-container');
    const customInput = dropdown.querySelector('input[type="number"]');
    const customSpan = customContainer?.querySelector('span');
    
    if (!optionsContainer) return;
    
    // Limpiar opciones existentes (excepto "Otra cantidad" y el input personalizado)
    const existingOptions = optionsContainer.querySelectorAll('.dropdown-option:not(.custom-trigger)');
    existingOptions.forEach(option => option.remove());
    
    // Crear nuevas opciones según el tipo de producto
    productType.options.forEach((value, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'dropdown-option';
      option.dataset.value = value.toString();
      
      if (productType.isUnit) {
        option.textContent = value === 1 ? `${value} unidad` : `${value} unidades`;
      } else {
        option.textContent = value >= 1000 ? `${value/1000}kg` : `${value}g`;
      }
      
      // Insertar antes del trigger "Otra cantidad"
      const customTrigger = optionsContainer.querySelector('.custom-trigger');
      if (customTrigger) {
        optionsContainer.insertBefore(option, customTrigger);
      } else {
        optionsContainer.appendChild(option);
      }
      
      console.log(`✅ Opción creada: ${option.textContent} (valor: ${value})`);
    });
    
    // Actualizar el span del input personalizado
    if (customSpan) {
      customSpan.textContent = productType.isUnit ? 'unidades' : 'g';
    }
    
    // Actualizar placeholder y configuración del input
    if (customInput) {
      if (productType.isUnit) {
        customInput.setAttribute('min', '1');
        customInput.setAttribute('max', '100');
        customInput.setAttribute('step', '1');
        customInput.value = '1';
      } else {
        customInput.setAttribute('min', '50');
        customInput.setAttribute('max', '10000');
        customInput.setAttribute('step', '50');
        customInput.value = '250';
      }
    }
    
    console.log(`✅ Opciones configuradas para ${productType.isUnit ? 'unidades' : 'peso'}`);
  }

  closeDropdown(dropdown) {
    dropdown.classList.remove('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) options.style.display = 'none';
    this.hideCustomInput(dropdown);
  }

  closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll('[id^="amount-dropdown-"]');
    allDropdowns.forEach(dropdown => {
      this.closeDropdown(dropdown);
    });
  }

  selectQuantity(productId, amount, dropdown) {
    this.updateQuantity(productId, amount);
    this.updateDropdownLabel(dropdown, amount);
    this.updateTotalPrice(productId);
    this.closeDropdown(dropdown);
    
    console.log(`Producto ${productId}: ${amount}${this.quantities.get(productId)?.unit || 'g'} seleccionados`);
  }

  updateQuantity(productId, amount) {
    const existingQuantity = this.quantities.get(productId);
    const productType = existingQuantity?.productType;
    
    // Validar cantidad según el tipo de producto
    let validAmount;
    if (productType && productType.isUnit) {
      validAmount = Math.max(1, Math.min(100, amount));
    } else {
      validAmount = Math.max(50, Math.min(10000, amount));
    }
    
    this.quantities.set(productId, {
      amount: validAmount,
      unit: productType?.isUnit ? 'unidad' : 'g',
      productType: productType
    });
  }

  updateDropdownLabel(dropdown, amount) {
    const label = dropdown.querySelector('.select-label');
    const svg = label.querySelector('svg');
    const svgClone = svg ? svg.cloneNode(true) : null;
    
    const quantity = this.quantities.get(this.extractProductId(dropdown.id));
    const formattedAmount = this.formatAmount(amount, quantity?.productType);
    
    label.innerHTML = `Cantidad: ${formattedAmount} `;
    if (svgClone) {
      label.appendChild(svgClone);
    }

    // Actualizar select oculto
    const hiddenSelect = dropdown.querySelector('select');
    if (hiddenSelect) {
      hiddenSelect.value = amount.toString();
    }
  }

  showCustomInput(dropdown) {
    const customContainer = dropdown.querySelector('.custom-amount-container');
    const customInput = dropdown.querySelector('input[type="number"]');
    
    if (customContainer && customInput) {
      dropdown.classList.add('active');
      dropdown.querySelector('.dropdown-options').style.display = 'block';
      customContainer.style.display = 'flex';
      
      setTimeout(() => {
        customInput.focus();
        customInput.select();
        console.log('✅ Input personalizado enfocado');
      }, 150);
      
      console.log('✅ Input personalizado mostrado');
    } else {
      console.error('❌ No se encontró el container o input personalizado');
    }
  }

  hideCustomInput(dropdown) {
    const customContainer = dropdown.querySelector('.custom-amount-container');
    if (customContainer) {
      customContainer.style.display = 'none';
      this.closeDropdown(dropdown);
    }
  }

  // ✅ MEJORADO: Formato que acepta productType como parámetro
  formatAmount(amount, productType = null) {
    if (productType && productType.isUnit) {
      return amount === 1 ? `${amount} unidad` : `${amount} unidades`;
    }
    
    if (amount >= 1000) {
      return `${amount / 1000}kg`;
    }
    return `${amount}g`;
  }

  updateTotalPrice(productId) {
    const productCard = document.querySelector(`[data-product="producto-${productId}"]`);
    if (!productCard) return;

    const priceElement = productCard.querySelector('.price');
    const totalPriceElement = productCard.querySelector('.total-price');
    
    if (!priceElement || !totalPriceElement) return;

    // Extraer precio del texto
    const priceText = priceElement.textContent;
    const priceMatch = priceText.match(/(\d+[,.]?\d*)/);
    
    if (!priceMatch) {
      totalPriceElement.textContent = 'Total: X,XX €';
      return;
    }

    const price = parseFloat(priceMatch[1].replace(',', '.'));
    const quantity = this.quantities.get(productId);
    
    if (quantity) {
      let totalPrice;
      
      if (quantity.productType && quantity.productType.isUnit) {
        // Precio por unidad - multiplicar directamente
        totalPrice = price * quantity.amount;
      } else {
        // Precio por peso - convertir a kg y multiplicar
        const weightInKg = quantity.amount / 1000;
        totalPrice = price * weightInKg;
      }
      
      totalPriceElement.textContent = `Total: ${totalPrice.toFixed(2).replace('.', ',')} €`;
    }
  }

  setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productCard = button.closest('.product-card');
        if (productCard) {
          this.addToCart(productCard);
        }
      });
    });
  }

  addToCart(productCard) {
    // Verificar si el producto está disponible
    if (productCard.classList.contains('unavailable')) {
      this.showMessage('Este producto no está disponible actualmente', 'warning');
      return;
    }

    const productId = productCard.dataset.product.replace('producto-', '');
    const productName = productCard.querySelector('.product-name')?.textContent || 'Producto';
    const quantity = this.quantities.get(productId);
    const totalPriceElement = productCard.querySelector('.total-price');

    if (!quantity) {
      this.showMessage('Selecciona una cantidad antes de añadir al carrito', 'warning');
      return;
    }

    // ✅ CORREGIDO: Calcular precio total basado en la lógica existente
    const priceElement = productCard.querySelector('.price');
    let calculatedTotalPrice = 0;
    
    if (priceElement) {
      const priceText = priceElement.textContent;
      const priceMatch = priceText.match(/(\d+[,.]?\d*)/);
      
      if (priceMatch) {
        const unitPrice = parseFloat(priceMatch[1].replace(',', '.'));
        
        if (quantity.productType && quantity.productType.isUnit) {
          calculatedTotalPrice = unitPrice * quantity.amount;
        } else {
          const weightInKg = quantity.amount / 1000;
          calculatedTotalPrice = unitPrice * weightInKg;
        }
      }
    }

    // Crear objeto del producto para el carrito
    const cartItem = {
      id: productId,
      name: productName,
      quantity: quantity,
      unitPrice: parseFloat(priceElement?.textContent.match(/(\d+[,.]?\d*)/)?.[1].replace(',', '.') || '0'),
      totalPrice: calculatedTotalPrice,
      timestamp: Date.now()
    };

    // Añadir al carrito
    this.addItemToCart(cartItem);
    
    // Mostrar confirmación
    const formattedAmount = this.formatAmount(quantity.amount, quantity.productType);
    this.showMessage(`${productName} (${formattedAmount}) añadido al carrito`, 'success');
    
    // Animación del botón
    this.animateButton(productCard.querySelector('.add-to-cart'));

    console.log('✅ Producto añadido al carrito:', cartItem);
  }

  addItemToCart(item) {
    const existingItem = this.cart.get(item.id);
    
    if (existingItem) {
      // Si ya existe, sumar la nueva cantidad
      const oldAmount = existingItem.quantity.amount;
      const newAmount = oldAmount + item.quantity.amount;
      
      existingItem.quantity.amount = newAmount;
      existingItem.totalPrice = this.calculateItemPrice(existingItem);
      
      console.log(`🔄 Producto actualizado: ${existingItem.name} - ${oldAmount} + ${item.quantity.amount} = ${newAmount}`);
    } else {
      // Si es nuevo, añadir al carrito
      const newItem = { 
        ...item,
        totalPrice: this.calculateItemPrice(item)
      };
      this.cart.set(item.id, newItem);
      
      console.log(`➕ Nuevo producto añadido: ${item.name} - ${item.quantity.amount}`);
    }

    // Actualizar interfaces
    this.updateCartCounter();
    this.updateCartDisplay();

    // Disparar evento personalizado
    const cartEvent = new CustomEvent('addToCart', {
      detail: { item, cartSize: this.cart.size }
    });
    document.dispatchEvent(cartEvent);
    
    console.log('🛒 Carrito actualizado:', Array.from(this.cart.values()));
  }

  // ✅ NUEVO: Método unificado para calcular precio de un item
  calculateItemPrice(item) {
    if (item.quantity.productType && item.quantity.productType.isUnit) {
      return item.unitPrice * item.quantity.amount;
    } else {
      const weightInKg = item.quantity.amount / 1000;
      return item.unitPrice * weightInKg;
    }
  }

  animateButton(button) {
    button.style.transform = 'scale(0.95)';
    button.style.backgroundColor = '#28a745';
    button.textContent = '¡AÑADIDO!';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = '';
      button.textContent = 'AÑADIR PRODUCTO';
    }, 1000);
  }

  showMessage(text, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `quantity-notification ${type}`;
    notification.textContent = text;
    
    // Estilos inline para la notificación
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
    });

    // Colores según el tipo
    const colors = {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;

    // Añadir al DOM
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // ✅ MÉTODOS PARA MANEJAR EL CARRITO

  updateCartCounter() {
    const cartCount = document.querySelector('.number-product');
    if (cartCount) {
      let totalItems = 0;
      
      this.cart.forEach(item => {
        if (item.quantity.productType && item.quantity.productType.isUnit) {
          // Para productos por unidad, contar las unidades
          totalItems += item.quantity.amount;
        } else {
          // Para productos por peso, contar cada 250g como 1 item
          totalItems += Math.ceil(item.quantity.amount / 250);
        }
      });
      
      cartCount.textContent = totalItems.toString();
      console.log(`🛒 Contador actualizado: ${totalItems} items`);
    }
  }

  updateCartDisplay() {
    const cartEmpty = document.querySelector('.cart-empty');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');

    console.log(`🔍 Actualizando carrito display. Items en carrito: ${this.cart.size}`);
    console.log('🔍 Elementos encontrados:', { cartEmpty: !!cartEmpty, cartItems: !!cartItems, cartTotal: !!cartTotal });

    if (this.cart.size === 0) {
      // Mostrar estado vacío
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartItems) cartItems.style.display = 'none';
      if (cartTotal) cartTotal.style.display = 'none';
      console.log('📦 Carrito vacío mostrado');
    } else {
      // Mostrar productos
      if (cartEmpty) cartEmpty.style.display = 'none';
      if (cartItems) cartItems.style.display = 'block';
      if (cartTotal) cartTotal.style.display = 'block';

      // Renderizar productos del carrito
      this.renderCartItems();
      this.updateCartTotalPrice();
      console.log('🛒 Productos del carrito mostrados');
    }
  }

  renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) {
      console.error('❌ No se encontró el contenedor .cart-items');
      return;
    }

    console.log(`🔄 Renderizando ${this.cart.size} items del carrito`);

    // Limpiar contenido actual
    cartItemsContainer.innerHTML = '';

    // Renderizar cada producto del carrito
    this.cart.forEach((item, productId) => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      
      const formattedAmount = this.formatAmount(item.quantity.amount, item.quantity.productType);
      const formattedPrice = this.formatPrice(item.totalPrice);
      
      cartItemElement.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-details">${formattedAmount}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-price">${formattedPrice}</div>
          <button class="remove-item-btn" data-product-id="${productId}" title="Eliminar producto">
            <svg class="trash-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      `;

      // Event listener para eliminar producto
      const removeBtn = cartItemElement.querySelector('.remove-item-btn');
      removeBtn.addEventListener('click', () => {
        this.removeFromCart(productId);
      });

      cartItemsContainer.appendChild(cartItemElement);
      
      console.log(`✅ Item renderizado: ${item.name} - ${formattedAmount} - ${formattedPrice}`);
    });
  }

  updateCartTotalPrice() {
    const cartTotalElement = document.querySelector('.cart-total-price');
    if (!cartTotalElement) {
      console.error('❌ No se encontró el elemento .cart-total-price');
      return;
    }

    const total = Array.from(this.cart.values())
      .reduce((sum, item) => sum + item.totalPrice, 0);

    cartTotalElement.textContent = `Total: ${this.formatPrice(total)}`;
    console.log(`💰 Total del carrito actualizado: ${this.formatPrice(total)}`);
  }

  formatPrice(price) {
    return `${price.toFixed(2).replace('.', ',')} €`;
  }

  removeFromCart(productId) {
    const item = this.cart.get(productId);
    if (item) {
      this.cart.delete(productId);
      this.updateCartCounter();
      this.updateCartDisplay();
      
      this.showMessage('Producto eliminado del carrito', 'info');
      console.log('🗑️ Producto eliminado del carrito:', productId);
    }
  }

  clearCart() {
    this.cart.clear();
    this.updateCartCounter();
    this.updateCartDisplay();
    this.showMessage('Carrito vaciado', 'info');
  }

  // Métodos públicos para interactuar con el sistema
  getQuantity(productId) {
    return this.quantities.get(productId);
  }

  setQuantity(productId, amount) {
    const dropdown = document.getElementById(`amount-dropdown-${productId}`);
    if (dropdown) {
      this.selectQuantity(productId, amount, dropdown);
    }
  }

  getAllQuantities() {
    return Object.fromEntries(this.quantities);
  }

  clearAllQuantities() {
    this.quantities.clear();
    
    // Resetear todos los dropdowns
    const dropdowns = document.querySelectorAll('[id^="amount-dropdown-"]');
    dropdowns.forEach(dropdown => {
      const productId = this.extractProductId(dropdown.id);
      const productCard = dropdown.closest('.product-card');
      const productType = this.detectProductType(productCard);
      const defaultAmount = productType.isUnit ? 1 : 250;
      
      this.quantities.set(productId, { 
        amount: defaultAmount, 
        unit: productType.isUnit ? 'unidad' : 'g',
        productType: productType 
      });
      this.updateDropdownLabel(dropdown, defaultAmount);
      this.updateTotalPrice(productId);
    });
  }
}

// Función para inicializar desde main.js
export function initQuantitySystem() {
  const quantitySystem = new QuantitySystem();
  
  // Hacer disponible globalmente
  window.quantitySystem = quantitySystem;
  
  return quantitySystem;
}