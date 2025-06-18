// cart.js - Sistema de carrito modal que se integra con quantity.js

export class CartModal {
    constructor() {
        this.isOpen = false;
        this.cartData = new Map(); // Sincronizado con quantity.js
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
        console.log('🛒 Sistema de carrito modal inicializado');
    }

    createModal() {
        // Crear estructura del modal
        const modalHTML = `
            <div id="cart-modal" class="cart-modal hidden">
                <div class="cart-modal-overlay"></div>
                <div class="cart-modal-content">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> Tu Carrito</h3>
                        <button id="close-cart" class="close-cart-btn" aria-label="Cerrar carrito">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="cart-body">
                        <div class="cart-items" id="cart-items">
                            <div class="empty-cart">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8L15 21m2-8l2 8" />
                                </svg>
                                <p>Tu carrito está vacío</p>
                                <p>¡Agrega algunos productos deliciosos!</p>
                            </div>
                        </div>
                    </div>

                    <div class="cart-footer">
                        <div class="cart-summary">
                            <div class="cart-total">
                                <span class="total-label">Total:</span>
                                <span class="total-amount">€<span id="cart-total">0.00</span></span>
                            </div>
                            <button class="pay-btn" id="pay-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Proceder al Pago
                            </button>
                            <button class="continue-shopping" id="continue-shopping">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Seguir Comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar modal en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Referencias a elementos
        this.modal = document.getElementById('cart-modal');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalElement = document.getElementById('cart-total');
    }

    setupEventListeners() {
        // Click en el icono del carrito
        const cartButton = document.querySelector('.btn-cart');
        if (cartButton) {
            cartButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal();
            });
        }

        // Click en el contenedor del carrito (por si acaso)
        const cartContainer = document.querySelector('.container-cart-icon');
        if (cartContainer) {
            cartContainer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal();
            });
        }

        // Cerrar modal
        const closeBtn = document.getElementById('close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Click en overlay
        const overlay = document.querySelector('.cart-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        // Botón continuar comprando
        const continueBtn = document.getElementById('continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeModal());
        }

        // Botón de pago
        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', () => this.proceedToPayment());
        }

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
    }

    openModal() {
        if (!this.modal) return;
        
        // Sincronizar con quantity.js
        this.syncWithQuantitySystem();
        
        // Renderizar items
        this.renderCartItems();
        
        // Mostrar modal
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
        
        this.isOpen = true;
        console.log('🛒 Modal abierto');
    }

    closeModal() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
        
        this.isOpen = false;
        console.log('🛒 Modal cerrado');
    }

    syncWithQuantitySystem() {
        // Obtener datos del sistema de cantidades
        if (window.quantitySystem && window.quantitySystem.cart) {
            this.cartData = new Map(window.quantitySystem.cart);
            console.log('✅ Sincronizado con quantity.js:', this.cartData.size, 'productos');
        }
    }

    renderCartItems() {
        if (!this.cartItemsContainer) return;

        if (this.cartData.size === 0) {
            // Mostrar carrito vacío
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8L15 21m2-8l2 8" />
                    </svg>
                    <p>Tu carrito está vacío</p>
                    <p>¡Agrega algunos productos deliciosos!</p>
                </div>
            `;
            this.updateTotal(0);
            return;
        }

        // Renderizar productos
        let html = '';
        let total = 0;

        this.cartData.forEach((item, productId) => {
            const formattedAmount = this.formatQuantity(item.quantity);
            const itemTotal = item.totalPrice;
            total += itemTotal;

            // Obtener imagen del producto
            const productCard = document.querySelector(`[data-product="producto-${productId}"]`);
            const imageSrc = productCard?.querySelector('.product-image img')?.src || '../assets/images/fondoSalazones.png';

            html += `
                <div class="cart-item" data-id="${productId}">
                    <img src="${imageSrc}" alt="${item.name}" class="cart-item-image">
                    
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-weight">${formattedAmount}</div>
                        <div class="cart-item-details">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${productId}" data-action="decrease">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <span class="quantity-display">${item.quantity.amount}${item.quantity.isUnit ? '' : 'g'}</span>
                                <button class="quantity-btn plus" data-id="${productId}" data-action="increase">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                            <div class="cart-item-price">€${itemTotal.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <button class="remove-item" data-id="${productId}" title="Eliminar producto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;
        });

        this.cartItemsContainer.innerHTML = html;
        this.updateTotal(total);

        // Configurar event listeners para los botones
        this.setupItemEventListeners();
    }

    setupItemEventListeners() {
        // Botones de cantidad
        const quantityBtns = this.cartItemsContainer.querySelectorAll('.quantity-btn');
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.dataset.id;
                const action = btn.dataset.action;
                this.updateQuantity(productId, action);
            });
        });

        // Botones de eliminar
        const removeBtns = this.cartItemsContainer.querySelectorAll('.remove-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.dataset.id;
                this.removeItem(productId);
            });
        });
    }

    formatQuantity(quantity) {
        if (quantity.isUnit) {
            return quantity.amount === 1 ? '1 unidad' : `${quantity.amount} unidades`;
        } else {
            if (quantity.amount >= 1000) {
                const kg = quantity.amount / 1000;
                return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(2)}kg`;
            }
            return `${quantity.amount}g`;
        }
    }

    updateQuantity(productId, action) {
        const item = this.cartData.get(productId);
        if (!item) return;

        const step = item.quantity.isUnit ? 1 : 50;
        const currentAmount = item.quantity.amount;
        let newAmount;

        if (action === 'decrease') {
            newAmount = Math.max(item.quantity.isUnit ? 1 : 50, currentAmount - step);
        } else {
            newAmount = currentAmount + step;
        }

        // Actualizar en quantity.js
        if (window.quantitySystem) {
            // Actualizar cantidad
            item.quantity.amount = newAmount;
            
            // Recalcular precio
            if (item.quantity.isUnit) {
                item.totalPrice = item.displayPrice * newAmount;
            } else {
                item.totalPrice = item.unitPrice * newAmount;
            }

            // Actualizar en el sistema principal
            window.quantitySystem.cart.set(productId, item);
            window.quantitySystem.updateCartDisplay();
            window.quantitySystem.updateCartCounter();
        }

        // Re-renderizar
        this.syncWithQuantitySystem();
        this.renderCartItems();
    }

    removeItem(productId) {
        // Eliminar de quantity.js
        if (window.quantitySystem) {
            window.quantitySystem.removeFromCart(productId);
        }

        // Re-renderizar
        this.syncWithQuantitySystem();
        this.renderCartItems();
    }

    updateTotal(total) {
        if (this.cartTotalElement) {
            this.cartTotalElement.textContent = total.toFixed(2);
        }
    }

    proceedToPayment() {
        if (this.cartData.size === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        // Aquí puedes implementar la lógica de pago
        const orderData = {
            items: Array.from(this.cartData.values()),
            total: this.calculateTotal(),
            timestamp: new Date().toISOString()
        };

        console.log('📦 Procesando pedido:', orderData);
        alert(`Procesando pago por €${orderData.total.toFixed(2)}`);
        
        // Cerrar modal después del pago
        // this.closeModal();
    }

    calculateTotal() {
        let total = 0;
        this.cartData.forEach(item => {
            total += item.totalPrice;
        });
        return total;
    }
}

// Exportar para uso en main.js
export function initCartModal() {
    const cartModal = new CartModal();
    window.cartModal = cartModal;
    return cartModal;
}