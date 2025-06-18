// js/quantity.js - Sistema corregido con todas las mejoras

export class QuantitySystem {
  constructor() {
    this.quantities = new Map();
    this.cart = new Map();
    this.debug = true;
    this.init();
  }

  init() {
    this.log('🚀 Iniciando QuantitySystem corregido...');

    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
      this.setupAddToCartButtons();
      this.setupQuantityDropdowns();
      this.setupCartInterface();
      this.updateCartCounter();
      this.setupGlobalClickListener();
      this.log('✅ Sistema inicializado correctamente');
    }, 500);
  }

  // === CONFIGURAR LISTENER GLOBAL ===
  setupGlobalClickListener() {
    document.addEventListener('click', (e) => {
      // Solo cerrar dropdowns si el click es completamente fuera de cualquier dropdown
      const clickedDropdown = e.target.closest('[id^="amount-dropdown-"]');
      const clickedCustomContainer = e.target.closest('.custom-amount-container');

      if (!clickedDropdown && !clickedCustomContainer) {
        // Cerrar todos los dropdowns abiertos
        document.querySelectorAll('[id^="amount-dropdown-"]').forEach(dropdown => {
          dropdown.classList.remove('active');
          const options = dropdown.querySelector('.dropdown-options');
          if (options) options.style.display = 'none';
        });
      }
    });

    this.log('🎯 Listener global configurado');
  }

  // === CONFIGURAR BOTONES AÑADIR AL CARRITO ===
  setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart');
    this.log(`🔍 Encontrados ${buttons.length} botones`);

    buttons.forEach((button, index) => {
      this.log(`⚙️ Configurando botón ${index + 1}: "${button.textContent?.trim()}"`);

      // Remover listeners previos
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.log('🖱️ Click en AÑADIR PRODUCTO');

        const productCard = newButton.closest('.product-card');
        if (productCard) {
          this.addToCart(productCard);
        } else {
          this.log('❌ No se encontró product-card');
        }
      });
    });

    this.log(`✅ ${buttons.length} botones configurados`);
  }

  // === CONFIGURAR DROPDOWNS DE CANTIDAD ===
  setupQuantityDropdowns() {
    const dropdowns = document.querySelectorAll('[id^="amount-dropdown-"]');
    this.log(`🔍 Encontrados ${dropdowns.length} dropdowns`);

    dropdowns.forEach(dropdown => {
      const productId = this.extractProductId(dropdown.id);
      const productCard = dropdown.closest('.product-card');

      // Detectar si es por unidad basándose en el precio
      const isUnit = this.isUnitProduct(productCard);
      this.log(`📦 Producto ${productId}: ${isUnit ? 'POR UNIDAD' : 'POR PESO'}`);

      // CORREGIDO: Establecer cantidad inicial predefinida en 1kg para peso
      const defaultAmount = isUnit ? 1 : 1000; // ← CORREGIDO: 1kg por defecto
      this.quantities.set(productId, {
        amount: defaultAmount,
        isUnit: isUnit
      });

      // Configurar dropdown
      this.setupDropdown(dropdown, productId, isUnit);

      // Ocultar precio total inicialmente
      const totalPriceElement = productCard.querySelector('.total-price');
      if (totalPriceElement) {
        totalPriceElement.style.display = 'none';
        this.log(`👁️ Total oculto inicialmente para producto ${productId}`);
      }
    });
  }

  // === DETECTAR SI ES PRODUCTO POR UNIDAD ===
  isUnitProduct(productCard) {
    const priceText = productCard.querySelector('.price')?.textContent?.toLowerCase() || '';
    return priceText.includes('/unidad') || priceText.includes('/u');
  }

  // === CONFIGURAR UN DROPDOWN ESPECÍFICO ===
  setupDropdown(dropdown, productId, isUnit) {
    // Reemplazar opciones según el tipo de producto
    this.replaceDropdownOptions(dropdown, isUnit);

    const label = dropdown.querySelector('.select-label');

    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Cerrar otros dropdowns
        document.querySelectorAll('[id^="amount-dropdown-"]').forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('active');
            const options = other.querySelector('.dropdown-options');
            if (options) options.style.display = 'none';
          }
        });

        // Toggle este dropdown
        const isActive = dropdown.classList.contains('active');
        if (isActive) {
          dropdown.classList.remove('active');
          dropdown.querySelector('.dropdown-options').style.display = 'none';
        } else {
          dropdown.classList.add('active');
          dropdown.querySelector('.dropdown-options').style.display = 'block';
        }
      });
    }

    // Configurar opciones predefinidas
    const options = dropdown.querySelectorAll('.dropdown-option:not(.custom-trigger)');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const amount = parseInt(option.dataset.value);
        this.log(`✅ Seleccionada cantidad: ${amount}`);

        this.selectQuantity(productId, amount, dropdown, isUnit);
      });
    });

    // Configurar "Otra cantidad"
    const customTrigger = dropdown.querySelector('.custom-trigger');
    if (customTrigger) {
      customTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showCustomInput(dropdown, productId, isUnit);
      });
    }

    // Configurar input básico
    const customInput = dropdown.querySelector('input[type="number"]');
    if (customInput) {
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const amount = parseInt(e.target.value) || (isUnit ? 1 : 1000); // ← CORREGIDO
          this.selectQuantity(productId, amount, dropdown, isUnit);
        }
      });
    }
  }

  // === REEMPLAZAR OPCIONES DEL DROPDOWN ===
  replaceDropdownOptions(dropdown, isUnit) {
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    if (!optionsContainer) return;

    // Remover opciones existentes
    const existingOptions = optionsContainer.querySelectorAll('.dropdown-option:not(.custom-trigger)');
    existingOptions.forEach(option => option.remove());

    // Definir opciones según el tipo
    let newOptions;
    if (isUnit) {
      newOptions = [
        { value: 1, text: '1 unidad' },
        { value: 2, text: '2 unidades' },
        { value: 3, text: '3 unidades' },
        { value: 6, text: '6 unidades' },
        { value: 12, text: '12 unidades' }
      ];
    } else {
      newOptions = [
        { value: 100, text: '100g' },
        { value: 250, text: '250g' },
        { value: 500, text: '500g' },
        { value: 1000, text: '1kg' },
        { value: 2000, text: '2kg' }
      ];
    }

    // Crear nuevas opciones
    const customTrigger = optionsContainer.querySelector('.custom-trigger');

    newOptions.forEach(optionData => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dropdown-option';
      button.dataset.value = optionData.value.toString();
      button.textContent = optionData.text;

      if (customTrigger) {
        optionsContainer.insertBefore(button, customTrigger);
      } else {
        optionsContainer.appendChild(button);
      }
    });

    // Actualizar el contenedor personalizado
    this.updateCustomAmountContainer(optionsContainer, isUnit);

    this.log(`🔄 Opciones reemplazadas para ${isUnit ? 'UNIDADES' : 'PESO'}`);
  }

  // === ACTUALIZAR CONTENEDOR DE CANTIDAD PERSONALIZADA ===
  updateCustomAmountContainer(optionsContainer, isUnit) {
    const customContainer = optionsContainer.querySelector('.custom-amount-container');
    if (!customContainer) return;

    const inputId = customContainer.querySelector('input')?.id || 'custom-input';
    const stepValue = isUnit ? 1 : 50;
    const minValue = isUnit ? 1 : 50;
    const maxValue = isUnit ? 100 : 10000;
    const defaultValue = isUnit ? 1 : 1000; // 1kg en gramos
    const defaultDisplay = isUnit ? '1' : '1kg'; // ← CORREGIDO: Mostrar directamente 1kg

    customContainer.innerHTML = `
      <div class="quantity-input-wrapper">
        <button type="button" class="quantity-btn minus" data-action="decrease">−</button>
        <input type="text" 
               id="${inputId}" 
               value="${defaultDisplay}" 
               data-min="${minValue}" 
               data-max="${maxValue}" 
               data-step="${stepValue}" />
        <button type="button" class="quantity-btn plus" data-action="increase">+</button>
      </div>
      <div class="quantity-actions">
        <button type="button" class="confirm-quantity">✓</button>
        <button type="button" class="cancel-quantity">✕</button>
      </div>
    `;

    this.addCustomQuantityStyles();
  }

  // === AÑADIR ESTILOS PARA CANTIDAD PERSONALIZADA ===
  addCustomQuantityStyles() {
    if (document.getElementById('custom-quantity-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'custom-quantity-styles';
    styles.textContent = `
      .custom-amount-container {
        padding: 12px !important;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
        border-radius: 8px !important;
        border: 2px solid #dee2e6 !important;
        margin-top: 5px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        text-align: center !important;
      }

      .quantity-input-wrapper {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        margin-bottom: 10px !important;
        background: white !important;
        border-radius: 6px !important;
        padding: 4px !important;
        border: 1px solid #ced4da !important;
      }

      .quantity-btn {
        width: 32px !important;
        height: 32px !important;
        border: 1px solid #adb5bd !important;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 18px !important;
        font-weight: bold !important;
        user-select: none !important;
        transition: all 0.15s ease !important;
        color: #495057 !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
      }

      .quantity-btn:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
        border-color: #6c757d !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important;
      }

      .quantity-btn:active {
        background: linear-gradient(135deg, #dee2e6 0%, #ced4da 100%) !important;
        transform: translateY(0) !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      }

      .quantity-input-wrapper input {
        flex: 1 !important;
        text-align: center !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 8px 12px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        min-width: 70px !important;
        background: transparent !important;
        color: #212529 !important;
        outline: none !important;
        -moz-appearance: textfield !important;
      }

      .quantity-input-wrapper input::-webkit-outer-spin-button,
      .quantity-input-wrapper input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }

      .quantity-input-wrapper input:focus {
        background: rgba(0,123,255,0.05) !important;
        color: #0d6efd !important;
      }

      .quantity-actions {
        display: flex !important;
        gap: 10px !important;
        justify-content: center !important;
      }

      .confirm-quantity, .cancel-quantity {
        width: 36px !important;
        height: 32px !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.15s ease !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }

      .confirm-quantity {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
        color: white !important;
      }

      .confirm-quantity:hover {
        background: linear-gradient(135deg, #218838 0%, #1fa187 100%) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 3px 6px rgba(40,167,69,0.3) !important;
      }

      .cancel-quantity {
        background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%) !important;
        color: white !important;
      }

      .cancel-quantity:hover {
        background: linear-gradient(135deg, #c82333 0%, #c0392b 100%) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 3px 6px rgba(220,53,69,0.3) !important;
      }

      .confirm-quantity:active, .cancel-quantity:active {
        transform: translateY(0) !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
      }
    `;

    document.head.appendChild(styles);
  }

  // === EXTRAER ID DEL PRODUCTO ===
  extractProductId(dropdownId) {
    return dropdownId.replace('amount-dropdown-', '');
  }

  // === CORREGIDA: SELECCIONAR CANTIDAD CON LOGGING DETALLADO ===
  selectQuantity(productId, amount, dropdown, isUnit) {
    this.log(`📦 Seleccionando cantidad: ${amount}${isUnit ? ' unidades' : 'g'} para producto ${productId}`);
    
    this.quantities.set(productId, { amount, isUnit });
    this.updateDropdownLabel(dropdown, amount, isUnit);
    this.updateTotalPrice(productId);
    this.closeDropdown(dropdown);

    this.log(`✅ Cantidad establecida: Producto ${productId} = ${amount} ${isUnit ? 'unidades' : 'gramos'}`);
    
    // VERIFICAR que el label se actualizó correctamente
    const label = dropdown.querySelector('.select-label');
    this.log(`🔍 Label final: "${label.textContent.trim()}"`);
  }

  // === CORREGIDA: ACTUALIZAR LABEL DEL DROPDOWN CON FORMATO CORRECTO ===
  updateDropdownLabel(dropdown, amount, isUnit) {
    const label = dropdown.querySelector('.select-label');
    const svg = label.querySelector('svg');

    // CORREGIDO: Usar formatQuantityDisplay para consistencia total
    const formattedQuantity = this.formatQuantityDisplay(amount, isUnit);
    const text = `Cantidad: ${formattedQuantity}`;

    label.innerHTML = `${text} `;
    if (svg) label.appendChild(svg.cloneNode(true));
    
    this.log(`🏷️ Label actualizado: ${text}`);
  }

  // === MOSTRAR INPUT PERSONALIZADO ===
  showCustomInput(dropdown, productId, isUnit) {
    const customContainer = dropdown.querySelector('.custom-amount-container');

    if (customContainer) {
      // Mantener dropdown abierto
      dropdown.classList.add('active');
      dropdown.querySelector('.dropdown-options').style.display = 'block';

      // Mostrar container personalizado
      customContainer.style.display = 'block';

      // Configurar listeners específicos
      this.setupCustomInputListeners(customContainer, dropdown, productId, isUnit);

      // Enfocar input
      setTimeout(() => {
        const input = customContainer.querySelector('input');
        if (input) {
          input.focus();
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 100);

      this.log(`📝 Input personalizado mostrado para ${isUnit ? 'unidades' : 'gramos'}`);
    }
  }

  // === CONFIGURAR LISTENERS ESPECÍFICOS PARA EL INPUT PERSONALIZADO ===
  setupCustomInputListeners(container, dropdown, productId, isUnit) {
    const input = container.querySelector('input');
    const minusBtn = container.querySelector('.minus');
    const plusBtn = container.querySelector('.plus');
    const confirmBtn = container.querySelector('.confirm-quantity');
    const cancelBtn = container.querySelector('.cancel-quantity');

    if (!input) return;

    const stepValue = isUnit ? 1 : 50;
    const minValue = isUnit ? 1 : 50;
    const maxValue = isUnit ? 100 : 10000;

    // Prevenir propagación de eventos
    container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // CORREGIDO: Botón menos con cálculo correcto del step
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let currentValue = this.extractNumericValue(input.value);
        
        // CORREGIDO: Simplificar el cálculo para evitar acumulación
        const newValue = Math.max(minValue, currentValue - stepValue);

        this.updateInputDisplay(input, newValue, isUnit);

        setTimeout(() => {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 10);

        this.log(`➖ Decrementado: ${currentValue} → ${newValue} (step fijo: ${stepValue})`);
      });
    }

    // CORREGIDO: Botón más con cálculo correcto del step
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let currentValue = this.extractNumericValue(input.value);
        
        // CORREGIDO: Simplificar el cálculo para evitar acumulación
        const newValue = Math.min(maxValue, currentValue + stepValue);

        this.updateInputDisplay(input, newValue, isUnit);

        setTimeout(() => {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 10);

        this.log(`➕ Incrementado: ${currentValue} → ${newValue} (step fijo: ${stepValue})`);
      });
    }

    // Input events
    input.addEventListener('focus', (e) => {
      e.stopPropagation();
      setTimeout(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }, 10);
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    input.addEventListener('keydown', (e) => {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      const isNumber = (e.key >= '0' && e.key <= '9');

      if (e.key === 'Enter') {
        e.preventDefault();
        const numericValue = this.extractNumericValue(input.value);
        const amount = Math.max(minValue, Math.min(maxValue, numericValue || (isUnit ? 1 : 1000))); // ← CORREGIDO
        this.selectQuantity(productId, amount, dropdown, isUnit);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeDropdown(dropdown);
        return;
      }

      if (!allowedKeys.includes(e.key) && !isNumber) {
        e.preventDefault();
        return;
      }
    });

    // CORREGIDO: Mejor manejo del blur para resetear card
    input.addEventListener('blur', (e) => {
      // Solo validar y formatear, NO resetear la card aquí
      this.validateAndFormatInput(e.target, isUnit, minValue, maxValue);
    });

    let inputTimeout;
    input.addEventListener('input', (e) => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        this.validateAndFormatInput(e.target, isUnit, minValue, maxValue);
      }, 1000);
    });

    // Confirmar cantidad
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const numericValue = this.extractNumericValue(input.value);
        const amount = Math.max(minValue, Math.min(maxValue, numericValue || (isUnit ? 1 : 1000))); // ← CORREGIDO

        this.selectQuantity(productId, amount, dropdown, isUnit);
        this.log(`✅ Cantidad confirmada: ${amount}`);
      });
    }

    // Cancelar
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown(dropdown);
        this.log(`❌ Cantidad cancelada`);
      });
    }

    this.log(`🎛️ Listeners específicos configurados para ${isUnit ? 'unidades' : 'gramos'}`);
  }

  // === EXTRAER VALOR NUMÉRICO ===
  extractNumericValue(inputValue) {
    if (!inputValue) return 0;

    if (inputValue.includes('kg')) {
      const kgValue = parseFloat(inputValue.replace(/[^\d.]/g, ''));
      return Math.round(kgValue * 1000);
    }

    const numericValue = parseFloat(inputValue.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : Math.round(numericValue);
  }

  // === VALIDAR Y FORMATEAR INPUT ===
  validateAndFormatInput(input, isUnit, minValue, maxValue) {
    const numericValue = this.extractNumericValue(input.value);
    let validValue = numericValue;

    if (validValue < minValue) {
      validValue = minValue;
    } else if (validValue > maxValue) {
      validValue = maxValue;
    }

    if (validValue !== numericValue) {
      this.updateInputDisplay(input, validValue, isUnit);
    } else if (numericValue > 0) {
      this.updateInputDisplay(input, validValue, isUnit);
    }
  }

  // === ACTUALIZAR DISPLAY DEL INPUT ===
  updateInputDisplay(input, value, isUnit) {
    if (isUnit) {
      input.value = value.toString();
    } else {
      if (value >= 1000) {
        const kg = value / 1000;
        if (kg === Math.floor(kg)) {
          input.value = `${kg}kg`;
        } else {
          const formattedKg = kg.toFixed(2).replace(/\.?0+$/, '');
          input.value = `${formattedKg}kg`;
        }
      } else {
        input.value = `${value}g`;
      }
    }
  }

  // === CERRAR DROPDOWN ===
  closeDropdown(dropdown) {
    dropdown.classList.remove('active');
    const options = dropdown.querySelector('.dropdown-options');
    if (options) options.style.display = 'none';

    const customContainer = dropdown.querySelector('.custom-amount-container');
    if (customContainer) customContainer.style.display = 'none';
  }

  // === ACTUALIZAR PRECIO TOTAL ===
  updateTotalPrice(productId) {
    const productCard = document.querySelector(`[data-product="producto-${productId}"]`);
    if (!productCard) return;

    const priceElement = productCard.querySelector('.price');
    let totalPriceElement = productCard.querySelector('.total-price');

    if (!priceElement || !totalPriceElement) return;

    const priceText = priceElement.textContent.toLowerCase();
    const priceMatch = priceText.match(/(\d+[,.]?\d*)/);

    if (!priceMatch) {
      totalPriceElement.style.display = 'none';
      return;
    }

    const displayPrice = parseFloat(priceMatch[1].replace(',', '.'));
    const quantity = this.quantities.get(productId);

    if (quantity) {
      let totalPrice;

      if (quantity.isUnit) {
        totalPrice = displayPrice * quantity.amount;
      } else {
        let pricePerGram;

        if (priceText.includes('/kg') || priceText.includes('kg')) {
          pricePerGram = displayPrice / 1000;
        } else if (priceText.includes('/250g') || priceText.includes('250g')) {
          pricePerGram = displayPrice / 250;
        } else if (priceText.includes('/500g') || priceText.includes('500g')) {
          pricePerGram = displayPrice / 500;
        } else if (priceText.includes('/100g') || priceText.includes('100g')) {
          pricePerGram = displayPrice / 100;
        } else {
          pricePerGram = displayPrice / 1000;
        }

        totalPrice = pricePerGram * quantity.amount;
      }

      totalPriceElement.textContent = `Total: ${totalPrice.toFixed(2).replace('.', ',')} €`;
      totalPriceElement.style.cssText = `
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        color: #e74c3c !important;
        margin-top: 8px !important;
        padding: 6px 12px !important;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%) !important;
        border: 1px solid #ffcdcd !important;
        border-radius: 6px !important;
        text-align: center !important;
        box-shadow: 0 2px 4px rgba(231, 76, 60, 0.1) !important;
        display: block !important;
      `;
    } else {
      totalPriceElement.style.display = 'none';
    }
  }

  // === AÑADIR AL CARRITO ===
  addToCart(productCard) {
    this.log('🛒 Añadiendo producto al carrito...');

    if (productCard.classList.contains('unavailable')) {
      this.showMessage('Este producto no está disponible', 'warning');
      return;
    }

    const productId = this.extractProductIdFromCard(productCard);
    const productName = productCard.querySelector('.product-name')?.textContent?.trim() || 'Producto';
    let quantity = this.quantities.get(productId);

    // CORREGIDO: Si no hay cantidad seleccionada, usar la predefinida (1kg para peso)
    if (!quantity) {
      const isUnit = this.isUnitProduct(productCard);
      const defaultAmount = isUnit ? 1 : 1000; // ← CORREGIDO: 1kg por defecto
      quantity = { amount: defaultAmount, isUnit };
      this.quantities.set(productId, quantity);
      this.log(`📦 Usando cantidad predefinida: ${defaultAmount}${isUnit ? ' unidades' : 'g'}`);
    }

    // Extraer precio
    const priceElement = productCard.querySelector('.price');
    const priceText = priceElement?.textContent.toLowerCase() || '';
    const priceMatch = priceText.match(/(\d+[,.]?\d*)/);
    const displayPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;

    // Calcular precio total
    let totalPrice;
    let unitPriceForCart = displayPrice;

    if (quantity.isUnit) {
      totalPrice = displayPrice * quantity.amount;
    } else {
      let pricePerGram;

      if (priceText.includes('/kg') || priceText.includes('kg')) {
        pricePerGram = displayPrice / 1000;
      } else if (priceText.includes('/250g') || priceText.includes('250g')) {
        pricePerGram = displayPrice / 250;
      } else if (priceText.includes('/500g') || priceText.includes('500g')) {
        pricePerGram = displayPrice / 500;
      } else if (priceText.includes('/100g') || priceText.includes('100g')) {
        pricePerGram = displayPrice / 100;
      } else {
        pricePerGram = displayPrice / 1000;
      }

      totalPrice = pricePerGram * quantity.amount;
      unitPriceForCart = pricePerGram;
    }

    // Verificar si el producto ya existe en el carrito
    const existingItem = this.cart.get(productId);

    if (existingItem) {
      // Sumar a la cantidad existente
      const newAmount = existingItem.quantity.amount + quantity.amount;
      const newTotalPrice = quantity.isUnit ?
        (displayPrice * newAmount) :
        (unitPriceForCart * newAmount);

      existingItem.quantity.amount = newAmount;
      existingItem.totalPrice = newTotalPrice;
      existingItem.timestamp = Date.now();

      this.log(`➕ Cantidad sumada: ${quantity.amount}${quantity.isUnit ? ' unidades' : 'g'} → Total: ${newAmount}${quantity.isUnit ? ' unidades' : 'g'}`);

      const formattedNewAmount = quantity.isUnit ?
        (quantity.amount === 1 ? `${quantity.amount} unidad` : `${quantity.amount} unidades`) :
        (quantity.amount >= 1000 ? `${quantity.amount / 1000}kg` : `${quantity.amount}g`);

      const formattedTotalAmount = quantity.isUnit ?
        (newAmount === 1 ? `${newAmount} unidad` : `${newAmount} unidades`) :
        (newAmount >= 1000 ? `${newAmount / 1000}kg` : `${newAmount}g`);

      this.showMessage(`+${formattedNewAmount} de ${productName} añadido. Total: ${formattedTotalAmount}`, 'success');

    } else {
      // Crear nuevo item del carrito
      const cartItem = {
        id: productId,
        name: productName,
        quantity: quantity,
        unitPrice: unitPriceForCart,
        displayPrice: displayPrice,
        priceText: priceElement?.textContent || '',
        totalPrice: totalPrice,
        timestamp: Date.now()
      };

      this.cart.set(productId, cartItem);

      const formattedAmount = quantity.isUnit ?
        (quantity.amount === 1 ? `${quantity.amount} unidad` : `${quantity.amount} unidades`) :
        (quantity.amount >= 1000 ? `${quantity.amount / 1000}kg` : `${quantity.amount}g`);

      this.showMessage(`${productName} (${formattedAmount}) añadido al carrito`, 'success');
    }

    // Actualizar interfaz del carrito
    this.updateCartCounter();
    this.updateCartDisplay();

    // Animar botón
    this.animateButton(productCard.querySelector('.add-to-cart'));

    // Resetear la card después de añadir al carrito
    this.resetProductCard(productId, productCard);

    this.log('✅ Carrito actualizado:', Array.from(this.cart.values()));
  }

  // === RESETEAR CARD DESPUÉS DE AÑADIR AL CARRITO ===
  resetProductCard(productId, productCard) {
    this.log(`🔄 Reseteando card del producto ${productId}...`);

    // 1. Resetear dropdown label a estado inicial
    const dropdown = productCard.querySelector(`#amount-dropdown-${productId}`);
    if (dropdown) {
      const label = dropdown.querySelector('.select-label');
      const svg = label?.querySelector('svg');

      if (label) {
        label.innerHTML = 'Cantidad: ';
        if (svg) {
          label.appendChild(svg.cloneNode(true));
        }
      }

      // Cerrar dropdown si está abierto
      dropdown.classList.remove('active');
      const options = dropdown.querySelector('.dropdown-options');
      if (options) options.style.display = 'none';

      // Ocultar input personalizado si está visible
      const customContainer = dropdown.querySelector('.custom-amount-container');
      if (customContainer) customContainer.style.display = 'none';
    }

    // 2. Ocultar el precio total
    const totalPriceElement = productCard.querySelector('.total-price');
    if (totalPriceElement) {
      totalPriceElement.style.display = 'none';
    }

    // 3. Resetear cantidad en memoria (mantener tipo pero cantidad inicial)
    const currentQuantity = this.quantities.get(productId);
    if (currentQuantity) {
      const defaultAmount = currentQuantity.isUnit ? 1 : 1000; // 1kg por defecto
      this.quantities.set(productId, {
        amount: defaultAmount,
        isUnit: currentQuantity.isUnit
      });
      this.log(`📦 Cantidad reseteada: ${defaultAmount}${currentQuantity.isUnit ? ' unidades' : 'g (1kg)'}`);
    }

    // 4. Remover selección de opciones del dropdown
    const selectedOptions = dropdown?.querySelectorAll('.dropdown-option.selected');
    selectedOptions?.forEach(option => option.classList.remove('selected'));

    this.log(`✅ Card reseteada correctamente para producto ${productId}`);
  }

  // === EXTRAER ID DEL PRODUCTO DESDE CARD ===
  extractProductIdFromCard(productCard) {
    const dataProduct = productCard.dataset.product;
    if (dataProduct) {
      return dataProduct.replace('producto-', '');
    }

    const dropdown = productCard.querySelector('[id^="amount-dropdown-"]');
    if (dropdown) {
      return dropdown.id.replace('amount-dropdown-', '');
    }

    const allCards = document.querySelectorAll('.product-card');
    const index = Array.from(allCards).indexOf(productCard);
    return (index + 1).toString();
  }

  // === ACTUALIZAR CONTADOR DEL CARRITO ===
  updateCartCounter() {
    const counter = document.querySelector('.number-product');
    if (counter) {
      counter.textContent = this.cart.size.toString();
      this.log(`🔢 Contador actualizado: ${this.cart.size}`);
    }
  }

  // === CORREGIDA: CONFIGURAR INTERFAZ DEL CARRITO PARA TU HTML ===
  setupCartInterface() {
    // CORREGIDO: Buscar el botón correcto en tu HTML
    const cartButton = document.querySelector('.cart-button .btn-cart') || 
                      document.querySelector('.cart-button') ||
                      document.querySelector('.btn-cart');

    if (cartButton) {
      this.log(`🛒 Botón del carrito encontrado en tu HTML`);
      
      cartButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.log('🛒 Click en botón del carrito');
        this.openCartModal();
      });
    } else {
      this.log('⚠️ No se encontró botón del carrito en tu HTML');
    }

    this.log('🛒 Interfaz del carrito configurada para tu HTML');
  }

  // === CORREGIDA: ABRIR MODAL CON VALIDACIÓN MEJORADA ===
  openCartModal() {
    this.log('🛒 Abriendo modal del carrito...');
    
    let modal = document.querySelector('.cart-modal');
    
    // Si no existe el modal, crearlo
    if (!modal) {
      this.log('🔨 Creando modal del carrito...');
      modal = this.createCartModal();
      
      // Verificar que se creó correctamente
      if (!modal) {
        this.log('❌ Error al crear modal del carrito');
        return;
      }
    }

    // Verificar que el modal tiene la estructura correcta
    const cartItems = modal.querySelector('.cart-items');
    if (!cartItems) {
      this.log('❌ Modal del carrito no tiene estructura correcta, recreando...');
      modal.remove();
      modal = this.createCartModal();
    }

    // Actualizar contenido del carrito
    this.updateCartDisplay();
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    this.log('✅ Modal del carrito abierto');
  }

  // === SIMPLIFICADA: CREAR MODAL DEL CARRITO ===
  createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-modal-backdrop"></div>
      <div class="cart-modal-content">
        <div class="cart-header">
          <h2>Mi Carrito</h2>
          <button class="close-cart" type="button">×</button>
        </div>
        <div class="cart-body">
          <div class="cart-items"></div>
          <div class="cart-empty" style="display: none;">
            <p>Tu carrito está vacío</p>
          </div>
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            <strong>Total: <span class="total-amount">0,00 €</span></strong>
          </div>
          <div class="cart-actions">
            <button class="continue-shopping">Seguir Comprando</button>
            <button class="checkout-btn">Finalizar Compra</button>
          </div>
        </div>
      </div>
    `;

    // Añadir estilos del modal
    this.addCartModalStyles();

    // Configurar eventos del modal de forma simple
    this.setupCartModal(modal);

    document.body.appendChild(modal);
    return modal;
  }

  // === SIMPLIFICADA: CONFIGURAR MODAL DEL CARRITO ===
  setupCartModal(modal) {
    // Configurar eventos de cierre de forma simple
    const closeBtn = modal.querySelector('.close-cart');
    const backdrop = modal.querySelector('.cart-modal-backdrop');
    const continueBtn = modal.querySelector('.continue-shopping');
    const checkoutBtn = modal.querySelector('.checkout-btn');

    // Función para cerrar modal
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      this.log('🛒 Modal cerrado');
    };

    // Eventos de cierre
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }
    if (continueBtn) {
      continueBtn.addEventListener('click', closeModal);
    }

    // Checkout
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.checkout();
      });
    }

    this.log('🛒 Modal configurado');
  }

  // === ELIMINAR MÉTODOS NO USADOS ===

  // === CORREGIDA: ACTUALIZAR DISPLAY PARA TU HTML EXISTENTE ===
  updateCartDisplay() {
    // CORREGIDO: Buscar primero tu estructura HTML existente
    let cartItems = document.querySelector('.cart-summary .cart-items');
    let cartEmpty = document.querySelector('.cart-summary .cart-empty');
    let totalAmount = document.querySelector('.cart-summary .cart-total-price');
    
    // Si no existe tu estructura, buscar el modal creado
    if (!cartItems) {
      const modal = document.querySelector('.cart-modal');
      if (modal) {
        cartItems = modal.querySelector('.cart-items');
        cartEmpty = modal.querySelector('.cart-empty');
        totalAmount = modal.querySelector('.total-amount');
      }
    }

    if (!cartItems) {
      this.log('❌ No se encontró estructura de carrito');
      return;
    }

    this.log(`🛒 Actualizando carrito en tu HTML. Items: ${this.cart.size}`);

    if (this.cart.size === 0) {
      cartItems.innerHTML = '';
      cartItems.style.display = 'none';
      
      if (cartEmpty) {
        cartEmpty.style.display = 'block';
        cartEmpty.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Tu carrito está vacío</p>';
      }
      
      if (totalAmount) {
        totalAmount.textContent = '0,00 €';
      }
      
      this.log('📭 Carrito vacío mostrado en tu HTML');
      return;
    }

    // Mostrar items y ocultar mensaje vacío
    if (cartEmpty) {
      cartEmpty.style.display = 'none';
    }
    cartItems.style.display = 'block';

    // Configurar event delegation solo una vez
    if (!cartItems.dataset.eventsConfigured) {
      this.log('🎛️ Configurando eventos del carrito en tu HTML');
      this.setupCartEventDelegation(cartItems);
      cartItems.dataset.eventsConfigured = 'true';
    }

    // Recrear contenido usando tu estructura HTML
    cartItems.innerHTML = '';
    let total = 0;

    this.cart.forEach((item, productId) => {
      const itemElement = this.createCartItemElementForYourHTML(item, productId);
      cartItems.appendChild(itemElement);
      total += item.totalPrice;
    });

    // Actualizar total
    if (totalAmount) {
      totalAmount.textContent = `${total.toFixed(2).replace('.', ',')} €`;
    }
    
    // Mostrar el total si estaba oculto
    const cartTotalContainer = document.querySelector('.cart-summary .cart-total');
    if (cartTotalContainer && this.cart.size > 0) {
      cartTotalContainer.style.display = 'block';
    }
    
    this.log(`✅ Carrito actualizado en tu HTML. Total: ${total.toFixed(2)}€`);
  }

  // === NUEVA: CREAR ELEMENTO ADAPTADO A TU HTML ===
  createCartItemElementForYourHTML(item, productId) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.dataset.productId = productId;

    const formattedQuantity = this.formatQuantityDisplay(item.quantity.amount, item.quantity.isUnit);

    // ADAPTADO: Usar la estructura de tu HTML existente
    element.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-details">${formattedQuantity} - ${item.priceText}</div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-decrease" data-product-id="${productId}">−</button>
        <span class="quantity-display">${formattedQuantity}</span>
        <button class="quantity-increase" data-product-id="${productId}">+</button>
        <button class="remove-item" data-product-id="${productId}">🗑️</button>
      </div>
      <div class="cart-item-price">${item.totalPrice.toFixed(2).replace('.', ',')} €</div>
    `;

    this.log(`📦 Elemento creado para tu HTML: ${productId} - ${formattedQuantity}`);

    return element;
  }

  // === CORREGIDA: CONFIGURAR EVENT DELEGATION CON MEJOR DETECCIÓN ===
  setupCartEventDelegation(cartItems) {
    cartItems.addEventListener('click', (e) => {
      const target = e.target;
      
      // CORREGIDO: Mejor detección del productId y tipo de botón
      let productId = target.dataset.productId;
      let buttonType = null;

      // Detectar tipo de botón
      if (target.classList.contains('quantity-decrease')) {
        buttonType = 'decrease';
      } else if (target.classList.contains('quantity-increase')) {
        buttonType = 'increase';
      } else if (target.classList.contains('remove-item')) {
        buttonType = 'remove';
      }

      // Si no encontramos productId o buttonType, salir
      if (!productId || !buttonType) {
        this.log(`⚠️ Click ignorado: productId=${productId}, buttonType=${buttonType}`);
        return;
      }

      // Prevenir comportamiento por defecto
      e.preventDefault();
      e.stopPropagation();

      this.log(`🖱️ Click en botón ${buttonType} para producto ${productId}`);

      // Ejecutar acción correspondiente
      switch (buttonType) {
        case 'decrease':
          this.decreaseCartItemQuantity(productId);
          break;
        case 'increase':
          this.increaseCartItemQuantity(productId);
          break;
        case 'remove':
          this.removeCartItem(productId);
          break;
      }
    });

    this.log('🎛️ Event delegation configurado con mejor detección');
  }

  // === CORREGIDA: CREAR ELEMENTO DE ITEM DEL CARRITO CON FORMATO MEJORADO ===
  createCartItemElement(item, productId) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.dataset.productId = productId;

    // CORREGIDO: Formato inteligente para mostrar cantidades
    const formattedQuantity = this.formatQuantityDisplay(item.quantity.amount, item.quantity.isUnit);

    element.innerHTML = `
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-price">${item.priceText}</p>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-decrease" data-product-id="${productId}">−</button>
        <span class="quantity-display">${formattedQuantity}</span>
        <button class="quantity-increase" data-product-id="${productId}">+</button>
      </div>
      <div class="cart-item-total">
        ${item.totalPrice.toFixed(2).replace('.', ',')} €
      </div>
      <button class="remove-item" data-product-id="${productId}">🗑️</button>
    `;

    this.log(`📦 Elemento creado para ${productId}: ${formattedQuantity}`);

    return element;
  }

  // === CORREGIDA: FORMATEAR QUANTITY DISPLAY CON MEJOR PRECISIÓN ===
  formatQuantityDisplay(amount, isUnit) {
    if (isUnit) {
      return amount === 1 ? `${amount} unidad` : `${amount} unidades`;
    } else {
      // CORREGIDO: Formato más preciso para peso
      if (amount >= 1000) {
        const kg = amount / 1000;
        if (kg === Math.floor(kg)) {
          // Número entero de kg (ej: 1000g → 1kg, 2000g → 2kg)
          return `${kg}kg`;
        } else {
          // Decimales de kg (ej: 1050g → 1.1kg, 1500g → 1.5kg)
          const formattedKg = kg.toFixed(1).replace(/\.0$/, '');
          return `${formattedKg}kg`;
        }
      } else {
        // Menos de 1000g, mostrar en gramos (ej: 999g, 500g, 250g)
        return `${amount}g`;
      }
    }
  }

  // === NUEVA: CONFIGURAR EVENTOS DE ITEMS DEL CARRITO ===
  setupCartItemEvents(element, productId, item) {
    // CORREGIDO: Configurar eventos sin reemplazar elementos
    const decreaseBtn = element.querySelector('.quantity-decrease');
    const increaseBtn = element.querySelector('.quantity-increase');
    const removeBtn = element.querySelector('.remove-item');

    // Botón para disminuir cantidad
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.log(`🖱️ Click en botón DISMINUIR para producto ${productId}`);
        this.decreaseCartItemQuantity(productId);
      });
    }

    // Botón para aumentar cantidad  
    if (increaseBtn) {
      increaseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.log(`🖱️ Click en botón AUMENTAR para producto ${productId}`);
        this.increaseCartItemQuantity(productId);
      });
    }

    // Botón para eliminar item
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.log(`🖱️ Click en botón ELIMINAR para producto ${productId}`);
        this.removeCartItem(productId);
      });
    }

    this.log(`🎛️ Eventos configurados correctamente para item ${productId}`);
  }

  // === CORREGIDA: DISMINUIR/AUMENTAR CANTIDAD CON LOGGING ===
  decreaseCartItemQuantity(productId) {
    this.log(`➖ Disminuyendo cantidad para producto ${productId}`);
    
    const item = this.cart.get(productId);
    if (!item) {
      this.log(`❌ No se encontró producto ${productId} en el carrito`);
      return;
    }

    const stepValue = item.quantity.isUnit ? 1 : 50;
    const minValue = item.quantity.isUnit ? 1 : 50;

    this.log(`📊 Cantidad actual: ${item.quantity.amount}, step: ${stepValue}, min: ${minValue}`);

    if (item.quantity.amount > minValue) {
      const oldAmount = item.quantity.amount;
      item.quantity.amount = Math.max(minValue, item.quantity.amount - stepValue);
      
      // Recalcular precio
      item.totalPrice = item.quantity.isUnit ?
        (item.displayPrice * item.quantity.amount) :
        (item.unitPrice * item.quantity.amount);

      this.log(`✅ Cantidad actualizada: ${oldAmount} → ${item.quantity.amount}`);

      // IMPORTANTE: Actualizar display después de cambiar los datos
      this.updateCartDisplay();
      this.updateCartCounter();

    } else {
      this.log(`⚠️ Cantidad mínima alcanzada`);
      if (confirm('¿Eliminar este producto del carrito?')) {
        this.removeCartItem(productId);
      }
    }
  }

  increaseCartItemQuantity(productId) {
    this.log(`➕ Aumentando cantidad para producto ${productId}`);
    
    const item = this.cart.get(productId);
    if (!item) {
      this.log(`❌ No se encontró producto ${productId} en el carrito`);
      return;
    }

    const stepValue = item.quantity.isUnit ? 1 : 50;
    const maxValue = item.quantity.isUnit ? 100 : 10000;

    this.log(`📊 Cantidad actual: ${item.quantity.amount}, step: ${stepValue}, max: ${maxValue}`);

    if (item.quantity.amount < maxValue) {
      const oldAmount = item.quantity.amount;
      item.quantity.amount = Math.min(maxValue, item.quantity.amount + stepValue);
      
      // Recalcular precio
      item.totalPrice = item.quantity.isUnit ?
        (item.displayPrice * item.quantity.amount) :
        (item.unitPrice * item.quantity.amount);

      this.log(`✅ Cantidad actualizada: ${oldAmount} → ${item.quantity.amount}`);

      // IMPORTANTE: Actualizar display después de cambiar los datos
      this.updateCartDisplay();
      this.updateCartCounter();

    } else {
      this.log(`⚠️ Cantidad máxima alcanzada: ${maxValue}`);
      this.showMessage('Cantidad máxima alcanzada', 'warning');
    }
  }

  // === NUEVA: ELIMINAR ITEM DEL CARRITO ===
  removeCartItem(productId) {
    const item = this.cart.get(productId);
    if (!item) return;

    this.cart.delete(productId);

    // Actualizar displays
    this.updateCartDisplay();
    this.updateCartCounter();

    this.showMessage(`${item.name} eliminado del carrito`, 'info');
    this.log(`🗑️ Producto eliminado del carrito: ${productId}`);
  }

  // === NUEVA: AÑADIR ESTILOS DEL MODAL DEL CARRITO ===
  addCartModalStyles() {
    if (document.getElementById('cart-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'cart-modal-styles';
    styles.textContent = `
      .cart-modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 10000 !important;
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cart-modal-backdrop {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.5) !important;
        cursor: pointer !important;
      }

      .cart-modal-content {
        position: relative !important;
        background: white !important;
        border-radius: 12px !important;
        max-width: 600px !important;
        width: 90% !important;
        max-height: 80vh !important;
        overflow: hidden !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
      }

      .cart-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 20px !important;
        border-bottom: 1px solid #eee !important;
        background: #f8f9fa !important;
      }

      .cart-header h2 {
        margin: 0 !important;
        color: #333 !important;
        font-size: 1.5rem !important;
      }

      .close-cart {
        background: none !important;
        border: none !important;
        font-size: 24px !important;
        cursor: pointer !important;
        color: #666 !important;
        padding: 5px !important;
        border-radius: 50% !important;
        width: 35px !important;
        height: 35px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .close-cart:hover {
        background: #e9ecef !important;
        color: #333 !important;
      }

      .cart-body {
        padding: 20px !important;
        max-height: 400px !important;
        overflow-y: auto !important;
      }

      .cart-empty {
        text-align: center !important;
        padding: 40px 20px !important;
        color: #666 !important;
      }

      .cart-item {
        display: flex !important;
        align-items: center !important;
        gap: 15px !important;
        padding: 15px 0 !important;
        border-bottom: 1px solid #eee !important;
      }

      .cart-item:last-child {
        border-bottom: none !important;
      }

      .cart-item-info {
        flex: 1 !important;
      }

      .cart-item-name {
        margin: 0 0 5px 0 !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: #333 !important;
      }

      .cart-item-price {
        margin: 0 !important;
        font-size: 0.9rem !important;
        color: #666 !important;
      }

      .cart-item-quantity {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: #f8f9fa !important;
        border-radius: 6px !important;
        padding: 5px !important;
      }

      .quantity-decrease, .quantity-increase {
        width: 30px !important;
        height: 30px !important;
        border: 1px solid #ddd !important;
        background: white !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: bold !important;
        color: #333 !important;
      }

      .quantity-decrease:hover, .quantity-increase:hover {
        background: #e9ecef !important;
        border-color: #adb5bd !important;
      }

      .quantity-display {
        min-width: 80px !important;
        text-align: center !important;
        font-weight: 600 !important;
        color: #333 !important;
        font-size: 0.9rem !important;
      }

      .cart-item-total {
        font-weight: 600 !important;
        color: #e74c3c !important;
        min-width: 80px !important;
        text-align: right !important;
      }

      .remove-item {
        background: #dc3545 !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 8px 10px !important;
        cursor: pointer !important;
        font-size: 14px !important;
      }

      .remove-item:hover {
        background: #c82333 !important;
      }

      .cart-footer {
        padding: 20px !important;
        border-top: 1px solid #eee !important;
        background: #f8f9fa !important;
      }

      .cart-total {
        text-align: center !important;
        margin-bottom: 15px !important;
        font-size: 1.2rem !important;
        color: #333 !important;
      }

      .total-amount {
        color: #e74c3c !important;
      }

      .cart-actions {
        display: flex !important;
        gap: 10px !important;
        justify-content: center !important;
      }

      .continue-shopping, .checkout-btn {
        padding: 12px 24px !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
      }

      .continue-shopping {
        background: #6c757d !important;
        color: white !important;
      }

      .continue-shopping:hover {
        background: #5a6268 !important;
      }

      .checkout-btn {
        background: #28a745 !important;
        color: white !important;
      }

      .checkout-btn:hover {
        background: #218838 !important;
      }
    `;

    document.head.appendChild(styles);
  }

  // === NUEVA: CHECKOUT ===
  checkout() {
    if (this.cart.size === 0) {
      this.showMessage('Tu carrito está vacío', 'warning');
      return;
    }

    // Aquí puedes implementar la lógica de checkout
    // Por ahora, solo mostrar un mensaje
    let total = 0;
    this.cart.forEach(item => {
      total += item.totalPrice;
    });

    this.showMessage(`Procesando compra por ${total.toFixed(2).replace('.', ',')} €...`, 'info');
    
    // Simular proceso de checkout
    setTimeout(() => {
      this.showMessage('¡Compra realizada con éxito!', 'success');
      this.cart.clear();
      this.updateCartCounter();
      this.updateCartDisplay();
      
      // Cerrar modal
      const modal = document.querySelector('.cart-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }, 2000);

    this.log('💰 Iniciando proceso de checkout');
  }

  // === ANIMAR BOTÓN ===
  animateButton(button) {
    if (!button) return;

    button.style.transform = 'scale(0.95)';
    button.style.backgroundColor = '#28a745';
    button.textContent = '¡AÑADIDO!';

    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = '';
      button.textContent = 'AÑADIR PRODUCTO';
    }, 1000);
  }

  // === MOSTRAR MENSAJE ===
  showMessage(text, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = text;

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
      transition: 'all 0.3s ease',
      backgroundColor: type === 'success' ? '#28a745' :
        type === 'warning' ? '#ffc107' :
          type === 'error' ? '#dc3545' : '#17a2b8'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);

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

  // === LOGGING ===
  log(message, data = null) {
    if (this.debug) {
      if (data) {
        console.log(`[QuantitySystem] ${message}`, data);
      } else {
        console.log(`[QuantitySystem] ${message}`);
      }
    }
  }

  // === MÉTODO DE DIAGNÓSTICO ===
  diagnose() {
    const diagnosis = {
      productCards: document.querySelectorAll('.product-card').length,
      addToCartButtons: document.querySelectorAll('.add-to-cart').length,
      quantityDropdowns: document.querySelectorAll('[id^="amount-dropdown-"]').length,
      cartSize: this.cart.size,
      quantitiesSize: this.quantities.size
    };

    console.log('🔍 DIAGNÓSTICO:', diagnosis);
    return diagnosis;
  }
}

// === FUNCIÓN DE INICIALIZACIÓN ===
export function initQuantitySystem() {
  const quantitySystem = new QuantitySystem();
  window.quantitySystem = quantitySystem;
  return quantitySystem;
}

// === DIAGNÓSTICO GLOBAL ===
window.debugQuantitySystem = function () {
  console.log('🔍 === DIAGNÓSTICO QUANTITY SYSTEM ===');

  const elements = {
    productCards: document.querySelectorAll('.product-card').length,
    addToCartButtons: document.querySelectorAll('.add-to-cart').length,
    quantityDropdowns: document.querySelectorAll('[id^="amount-dropdown-"]').length
  };

  console.log('📊 Elementos encontrados:', elements);

  if (window.quantitySystem) {
    console.log('✅ QuantitySystem disponible');
    window.quantitySystem.diagnose();
  } else {
    console.log('❌ QuantitySystem NO disponible');
  }
};