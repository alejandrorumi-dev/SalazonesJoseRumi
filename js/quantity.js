// js/quantity.js - Sistema simplificado que SÍ funciona - VERSIÓN CORREGIDA

export class QuantitySystem {
  constructor() {
    this.quantities = new Map();
    this.cart = new Map();
    this.debug = true;
    this.init();
  }

  init() {
    this.log('🚀 Iniciando QuantitySystem simplificado...');

    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
      this.setupAddToCartButtons();
      this.setupQuantityDropdowns();
      this.setupCartInterface();
      this.updateCartCounter();
      this.setupGlobalClickListener(); // NUEVO: Configurar listener global una sola vez
      this.log('✅ Sistema inicializado correctamente');
    }, 500);
  }

  // === NUEVO: CONFIGURAR LISTENER GLOBAL UNA SOLA VEZ ===
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

      // Establecer cantidad inicial
      const defaultAmount = isUnit ? 1 : 250;
      this.quantities.set(productId, {
        amount: defaultAmount,
        isUnit: isUnit
      });

      // Configurar dropdown
      this.setupDropdown(dropdown, productId, isUnit);

      // IMPORTANTE: Ocultar precio total inicialmente - solo aparecerá cuando seleccionen cantidad
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
    // NUEVO: Reemplazar opciones según el tipo de producto
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

    // Configurar opciones predefinidas (después de reemplazarlas)
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

    // SIMPLIFICADO: Solo configurar input básico aquí
    const customInput = dropdown.querySelector('input[type="number"]');
    if (customInput) {
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const amount = parseInt(e.target.value) || (isUnit ? 1 : 250);
          this.selectQuantity(productId, amount, dropdown, isUnit);
        }
      });
    }
  }

  // === NUEVO: REEMPLAZAR OPCIONES DEL DROPDOWN ===
  replaceDropdownOptions(dropdown, isUnit) {
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    if (!optionsContainer) return;

    // Remover opciones existentes (pero conservar custom-trigger y custom-amount-container)
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

      // Insertar antes del custom-trigger
      if (customTrigger) {
        optionsContainer.insertBefore(button, customTrigger);
      } else {
        optionsContainer.appendChild(button);
      }
    });

    // NUEVO: Actualizar el contenedor personalizado con botones +/-
    this.updateCustomAmountContainer(optionsContainer, isUnit);

    this.log(`🔄 Opciones reemplazadas para ${isUnit ? 'UNIDADES' : 'PESO'}: ${newOptions.map(o => o.text).join(', ')}`);
  }

  // === NUEVO: ACTUALIZAR CONTENEDOR DE CANTIDAD PERSONALIZADA ===
  updateCustomAmountContainer(optionsContainer, isUnit) {
    const customContainer = optionsContainer.querySelector('.custom-amount-container');
    if (!customContainer) return;

    // Crear nuevo HTML con botones +/-
    const inputId = customContainer.querySelector('input')?.id || 'custom-input';
    const stepValue = isUnit ? 1 : 50;
    const minValue = isUnit ? 1 : 50;
    const maxValue = isUnit ? 100 : 10000;
    const defaultValue = isUnit ? 1 : 250;
    const unit = isUnit ? 'u' : ''; // Para peso, no mostrar unidad inicial (se mostrará dinámicamente)

    customContainer.innerHTML = `
      <div class="quantity-input-wrapper">
        <button type="button" class="quantity-btn minus" data-action="decrease">−</button>
        <input type="text" 
               id="${inputId}" 
               value="${defaultValue}${isUnit ? '' : 'g'}" 
               data-min="${minValue}" 
               data-max="${maxValue}" 
               data-step="${stepValue}" />
        <button type="button" class="quantity-btn plus" data-action="increase">+</button>
        <span class="unit-label">${unit}</span>
      </div>
      <div class="quantity-actions">
        <button type="button" class="confirm-quantity">✓</button>
        <button type="button" class="cancel-quantity">✕</button>
      </div>
    `;

    // Añadir estilos inline para que funcione inmediatamente
    this.addCustomQuantityStyles();

    // Configurar event listeners
    this.setupCustomQuantityListeners(customContainer, isUnit, stepValue, minValue, maxValue);
  }

  // === NUEVO: AÑADIR ESTILOS PARA CANTIDAD PERSONALIZADA ===
  addCustomQuantityStyles() {
    // Solo añadir una vez
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
        /* Ocultar flechas del input number */
        -moz-appearance: textfield !important;
      }

      /* Ocultar flechas en WebKit (Chrome, Safari, Edge) */
      .quantity-input-wrapper input::-webkit-outer-spin-button,
      .quantity-input-wrapper input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }

      .quantity-input-wrapper input:focus {
        background: rgba(0,123,255,0.05) !important;
        color: #0d6efd !important;
      }

      .unit-label {
        font-size: 14px !important;
        color: #6c757d !important;
        font-weight: 600 !important;
        min-width: 0 !important;
        padding-right: 0 !important;
        display: none !important;  
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

  // === NUEVO: CONFIGURAR LISTENERS PARA CANTIDAD PERSONALIZADA ===
  setupCustomQuantityListeners(container, isUnit, stepValue, minValue, maxValue) {
    // MÉTODO OBSOLETO - Ahora se usa setupCustomInputListeners
    this.log('⚠️ setupCustomQuantityListeners obsoleto - usando setupCustomInputListeners');
  }

  // === EXTRAER ID DEL PRODUCTO ===
  extractProductId(dropdownId) {
    return dropdownId.replace('amount-dropdown-', '');
  }

  // === SELECCIONAR CANTIDAD ===
  selectQuantity(productId, amount, dropdown, isUnit) {
    this.quantities.set(productId, { amount, isUnit });
    this.updateDropdownLabel(dropdown, amount, isUnit);
    this.updateTotalPrice(productId); // Esto ahora creará y mostrará el elemento si no existe
    this.closeDropdown(dropdown);

    this.log(`📦 Cantidad actualizada: Producto ${productId} = ${amount} ${isUnit ? 'unidades' : 'gramos'}`);
  }

  // === ACTUALIZAR LABEL DEL DROPDOWN ===
  updateDropdownLabel(dropdown, amount, isUnit) {
    const label = dropdown.querySelector('.select-label');
    const svg = label.querySelector('svg');

    let text;
    if (isUnit) {
      text = amount === 1 ? `Cantidad: ${amount} unidad` : `Cantidad: ${amount} unidades`;
    } else {
      text = amount >= 1000 ? `Cantidad: ${amount / 1000}kg` : `Cantidad: ${amount}g`;
    }

    label.innerHTML = `${text} `;
    if (svg) label.appendChild(svg.cloneNode(true));
  }

  // === MOSTRAR INPUT PERSONALIZADO ===
  showCustomInput(dropdown, productId, isUnit) {
    const customContainer = dropdown.querySelector('.custom-amount-container');

    if (customContainer) {
      // Mantener el dropdown abierto
      dropdown.classList.add('active');
      dropdown.querySelector('.dropdown-options').style.display = 'block';

      // Mostrar container personalizado
      customContainer.style.display = 'block';

      // NUEVO: Configurar listeners específicos para este container
      this.setupCustomInputListeners(customContainer, dropdown, productId, isUnit);

      // Enfocar el input SIN seleccionar el texto
      setTimeout(() => {
        const input = customContainer.querySelector('input');
        if (input) {
          input.focus();
          // IMPORTANTE: No seleccionar el texto, solo posicionar el cursor al final
          const length = input.value.length;
          input.setSelectionRange(length, length);
          this.log(`🎯 Input enfocado SIN selección para producto ${productId}`);
        }
      }, 100);

      this.log(`📝 Input personalizado mostrado para ${isUnit ? 'unidades' : 'gramos'}`);
    } else {
      this.log('❌ No se encontró el container personalizado');
    }
  }

  // === NUEVO: CONFIGURAR LISTENERS ESPECÍFICOS PARA EL INPUT PERSONALIZADO ===
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

    // CRÍTICO: Prevenir propagación de eventos para todo el container
    container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Botón menos - CORREGIDO DEFINITIVO
    if (minusBtn) {
      minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let currentValue = this.extractNumericValue(input.value);
        currentValue = Math.round(currentValue / stepValue) * stepValue;

        const newValue = Math.max(minValue, currentValue - stepValue);

        this.updateInputDisplay(input, newValue, isUnit);

        setTimeout(() => {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 10);

        this.log(`➖ Decrementado a: ${newValue} (display: ${input.value})`);
      });
    }

    // Botón más - CORREGIDO DEFINITIVO
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extraer valor numérico actual y redondear al múltiplo más cercano del step
        let currentValue = this.extractNumericValue(input.value);
        currentValue = Math.round(currentValue / stepValue) * stepValue;

        const newValue = Math.min(maxValue, currentValue + stepValue);

        this.updateInputDisplay(input, newValue, isUnit);

        setTimeout(() => {
          input.setSelectionRange(input.value.length, input.value.length);
        }, 10);

        this.log(`➕ Incrementado a: ${newValue} (display: ${input.value})`);
      });
    }

    // Input - MEJORADO para manejar escritura manual
    input.addEventListener('focus', (e) => {
      e.stopPropagation();
      // Posicionar cursor al final sin seleccionar
      setTimeout(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }, 10);
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // NUEVO: Manejar teclas mientras se escribe
    input.addEventListener('keydown', (e) => {
      // Permitir teclas de navegación y control
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      const isNumber = (e.key >= '0' && e.key <= '9');

      if (e.key === 'Enter') {
        e.preventDefault();
        const numericValue = this.extractNumericValue(input.value);
        const amount = Math.max(minValue, Math.min(maxValue, numericValue || (isUnit ? 1 : 250)));
        this.selectQuantity(productId, amount, dropdown, isUnit);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeDropdown(dropdown);
        return;
      }

      // Solo permitir números y teclas de control
      if (!allowedKeys.includes(e.key) && !isNumber) {
        e.preventDefault();
        return;
      }
    });

    // MEJORADO: Validar y formatear al terminar de escribir
    input.addEventListener('blur', (e) => {
      this.validateAndFormatInput(e.target, isUnit, minValue, maxValue);
    });

    // NUEVO: Validar en tiempo real sin formatear constantemente
    let inputTimeout;
    input.addEventListener('input', (e) => {
      // Limpiar timeout previo
      clearTimeout(inputTimeout);

      // Permitir escritura libre por un momento
      inputTimeout = setTimeout(() => {
        this.validateAndFormatInput(e.target, isUnit, minValue, maxValue);
      }, 1000); // Formatear después de 1 segundo de inactividad
    });

    // Confirmar cantidad
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extraer valor numérico del input
        const numericValue = this.extractNumericValue(input.value);
        const amount = Math.max(minValue, Math.min(maxValue, numericValue || (isUnit ? 1 : 250)));

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

  // === NUEVO: EXTRAER VALOR NUMÉRICO DE CUALQUIER FORMATO ===
  extractNumericValue(inputValue) {
    if (!inputValue) return 0;

    // Si contiene 'kg', convertir a gramos
    if (inputValue.includes('kg')) {
      const kgValue = parseFloat(inputValue.replace(/[^\d.]/g, ''));
      return Math.round(kgValue * 1000);
    }

    // Si contiene solo números o 'g', extraer el número
    const numericValue = parseFloat(inputValue.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : Math.round(numericValue);  // ← CORREGIDO
  }

  // === NUEVO: VALIDAR Y FORMATEAR INPUT ===
  validateAndFormatInput(input, isUnit, minValue, maxValue) {
    const numericValue = this.extractNumericValue(input.value);
    let validValue = numericValue;

    // Validar rango
    if (validValue < minValue) {
      validValue = minValue;
    } else if (validValue > maxValue) {
      validValue = maxValue;
    }

    // Solo actualizar si cambió
    if (validValue !== numericValue) {
      this.updateInputDisplay(input, validValue, isUnit);
    } else if (numericValue > 0) {
      // Formatear sin cambiar el valor
      this.updateInputDisplay(input, validValue, isUnit);
    }

    this.log(`🔍 Validado: ${numericValue} → ${validValue} (display: ${input.value})`);
  }

  // === MEJORADO: ACTUALIZAR DISPLAY DEL INPUT CON FORMATO INTELIGENTE ===
  updateInputDisplay(input, value, isUnit) {
    if (isUnit) {
      // Para unidades, mostrar solo el número
      input.value = value.toString();
    } else {
      // Para peso, formato inteligente: g hasta 999, luego kg
      if (value >= 1000) {
        const kg = value / 1000;
        if (kg === Math.floor(kg)) {
          // Número entero de kg
          input.value = `${kg}kg`;
        } else {
          // Decimales de kg con máximo 2 decimales
          const formattedKg = kg.toFixed(2).replace(/\.?0+$/, ''); // Quitar ceros innecesarios
          input.value = `${formattedKg}kg`;
        }
      } else {
        // Menos de 1000g, mostrar en gramos
        input.value = `${value}g`;
      }
    }

    // Actualizar también la etiqueta de unidad
    const unitLabel = input.parentNode?.querySelector('.unit-label');
    if (unitLabel && !isUnit) {
      unitLabel.textContent = value >= 1000 ? '' : ''; // Siempre vacío ahora, la unidad está en el input
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

    if (!priceElement) return;

    // Si no existe el elemento, no lo creamos - ya existe en el HTML
    if (!totalPriceElement) {
      this.log(`❌ No se encontró elemento .total-price para producto ${productId}`);
      return;
    }

    // Extraer precio del texto
    const priceText = priceElement.textContent.toLowerCase();
    const priceMatch = priceText.match(/(\d+[,.]?\d*)/);

    if (!priceMatch) {
      totalPriceElement.style.display = 'none'; // Ocultar si no hay precio válido
      return;
    }

    const displayPrice = parseFloat(priceMatch[1].replace(',', '.'));
    const quantity = this.quantities.get(productId);

    if (quantity) {
      let totalPrice;

      if (quantity.isUnit) {
        // Precio por unidad - directo
        totalPrice = displayPrice * quantity.amount;
        this.log(`💰 Unidad: ${displayPrice}€ x ${quantity.amount} = ${totalPrice.toFixed(2)}€`);
      } else {
        // Precio por peso - necesitamos determinar la unidad base del precio
        let pricePerGram;

        if (priceText.includes('/kg') || priceText.includes('kg')) {
          // El precio es por kilogramo
          pricePerGram = displayPrice / 1000; // Convertir €/kg a €/g
          this.log(`💰 Precio base: ${displayPrice}€/kg = ${pricePerGram.toFixed(6)}€/g`);
        } else if (priceText.includes('/250g') || priceText.includes('250g')) {
          // El precio es por 250g
          pricePerGram = displayPrice / 250; // Convertir €/250g a €/g
          this.log(`💰 Precio base: ${displayPrice}€/250g = ${pricePerGram.toFixed(6)}€/g`);
        } else if (priceText.includes('/500g') || priceText.includes('500g')) {
          // El precio es por 500g
          pricePerGram = displayPrice / 500; // Convertir €/500g a €/g
          this.log(`💰 Precio base: ${displayPrice}€/500g = ${pricePerGram.toFixed(6)}€/g`);
        } else if (priceText.includes('/100g') || priceText.includes('100g')) {
          // El precio es por 100g
          pricePerGram = displayPrice / 100; // Convertir €/100g a €/g
          this.log(`💰 Precio base: ${displayPrice}€/100g = ${pricePerGram.toFixed(6)}€/g`);
        } else {
          // Fallback: asumir que es por kg si no se especifica
          pricePerGram = displayPrice / 1000;
          this.log(`💰 Precio asumido como €/kg: ${displayPrice}€/kg = ${pricePerGram.toFixed(6)}€/g`);
        }

        totalPrice = pricePerGram * quantity.amount;

        this.log(`💰 Peso: ${pricePerGram.toFixed(6)}€/g x ${quantity.amount}g = ${totalPrice.toFixed(2)}€`);
      }

      // MOSTRAR el precio total solo cuando hay cantidad seleccionada
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

      this.log(`✅ Total mostrado: ${totalPrice.toFixed(2)}€ para ${quantity.amount}${quantity.isUnit ? ' unidades' : 'g'}`);
    } else {
      // OCULTAR el total si no hay cantidad seleccionada
      totalPriceElement.style.display = 'none';
      this.log(`👁️ Total oculto para producto ${productId} (sin cantidad seleccionada)`);
    }
  }

  // === AÑADIR AL CARRITO ===
  addToCart(productCard) {
    this.log('🛒 Añadiendo producto al carrito...');

    // Verificar disponibilidad
    if (productCard.classList.contains('unavailable')) {
      this.showMessage('Este producto no está disponible', 'warning');
      return;
    }

    // Extraer datos del producto
    const productId = this.extractProductIdFromCard(productCard);
    const productName = productCard.querySelector('.product-name')?.textContent?.trim() || 'Producto';
    const quantity = this.quantities.get(productId);

    if (!quantity) {
      this.showMessage('Selecciona una cantidad primero', 'warning');
      return;
    }

    // Extraer precio usando la misma lógica que updateTotalPrice
    const priceElement = productCard.querySelector('.price');
    const priceText = priceElement?.textContent.toLowerCase() || '';
    const priceMatch = priceText.match(/(\d+[,.]?\d*)/);
    const displayPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;

    // Calcular precio total usando la misma lógica
    let totalPrice;
    let unitPriceForCart = displayPrice; // Para mostrar en el carrito

    if (quantity.isUnit) {
      // Precio por unidad - directo
      totalPrice = displayPrice * quantity.amount;
    } else {
      // Precio por peso - determinar unidad base
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
        // Fallback: asumir €/kg
        pricePerGram = displayPrice / 1000;
      }

      totalPrice = pricePerGram * quantity.amount;
      unitPriceForCart = pricePerGram; // Precio por gramo para el carrito
    }

    // NUEVO: Verificar si el producto ya existe en el carrito
    const existingItem = this.cart.get(productId);

    if (existingItem) {
      // SUMAR a la cantidad existente
      const newAmount = existingItem.quantity.amount + quantity.amount;
      const newTotalPrice = quantity.isUnit ?
        (displayPrice * newAmount) :
        (unitPriceForCart * newAmount);

      // Actualizar item existente
      existingItem.quantity.amount = newAmount;
      existingItem.totalPrice = newTotalPrice;
      existingItem.timestamp = Date.now(); // Actualizar timestamp

      this.log(`➕ Cantidad sumada: ${quantity.amount}${quantity.isUnit ? ' unidades' : 'g'} → Total: ${newAmount}${quantity.isUnit ? ' unidades' : 'g'}`);

      // Mostrar mensaje específico de suma
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
        displayPrice: displayPrice, // Precio original mostrado
        priceText: priceElement?.textContent || '',
        totalPrice: totalPrice,
        timestamp: Date.now()
      };

      // Añadir al carrito
      this.cart.set(productId, cartItem);

      this.log(`🆕 Producto nuevo añadido: ${quantity.amount}${quantity.isUnit ? ' unidades' : 'g'}`);

      // Mostrar confirmación normal
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

  // === NUEVO: RESETEAR CARD DESPUÉS DE AÑADIR AL CARRITO ===
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
      this.log(`👁️ Total oculto para producto ${productId}`);
    }

    // 3. Resetear cantidad en memoria (mantener tipo pero cantidad inicial)
    const currentQuantity = this.quantities.get(productId);
    if (currentQuantity) {
      const defaultAmount = currentQuantity.isUnit ? 1 : 250;
      this.quantities.set(productId, {
        amount: defaultAmount,
        isUnit: currentQuantity.isUnit
      });
      this.log(`📦 Cantidad reseteada: ${defaultAmount}${currentQuantity.isUnit ? ' unidades' : 'g'}`);
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

    // Buscar dropdown
    const dropdown = productCard.querySelector('[id^="amount-dropdown-"]');
    if (dropdown) {
      return dropdown.id.replace('amount-dropdown-', '');
    }

    // Fallback: usar posición
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

/* === ERRORES A SOLUCIONAR === */

/*

- Solucionar el incremento de "Otra Cantidad"
    * Si se añaden 250g, luego si se quiere intentar aumentar o disminuir cantidad, sube o baja en 100g, en lugar de 50g

- Solucionar la cantidad predefinida en "Añadir Producto"
    * A la hora de querer añadir un producto sin elegir una cantidad, es decir, sin desplegar el menú, que sea predefinido en 1kg, en lugar de 250g

- Resetear input "Cantidad"
    * Cuando un usuario elige 100g, si hace clic fuera del input, no se resetea la card, se queda en 100g.

- Solucionar aumentar o disminuir cantidad en el modal del carrito
    * El botón (-) y (+) no reaccionan al clic para disminuir o aumentar la cantidad deseada

- Solucionar eliminar producto en el modal del carrito
    * El botón de eliminar no reacciona y no elimina el producto deseado

- Eliminar toda parte del aside que ya no sea necesaria para el correcto funcionamiento de la página

*/