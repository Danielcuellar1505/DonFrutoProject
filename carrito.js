document.addEventListener('DOMContentLoaded', function() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('#cart-total');

  // Función para convertir cualquier valor a número seguro
  function safeNumber(value) {
    // Si ya es número, lo devolvemos
    if (typeof value === 'number') return value;
    
    // Si es string, extraemos solo dígitos y punto decimal
    if (typeof value === 'string') {
      const numericString = value.replace(/[^0-9.]/g, '');
      return parseFloat(numericString) || 0;
    }
    
    // Para otros tipos (boolean, object, etc.) devolvemos 0
    return 0;
  }

  function renderCart() {
  console.group("Debug del Carrito");
  let total = 0;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    cart.forEach((item, index) => {
      // Conversión segura a números
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      const subtotal = price * quantity;
      total += subtotal;

      console.log(`Ítem ${index + 1}:`, {
        Nombre: item.name,
        Precio: price,
        Cantidad: quantity,
        Subtotal: subtotal,
        TipoPrecio: typeof item.price,
        TipoCantidad: typeof item.quantity
      });

      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h3 class="cart-item-title">${item.name}</h3>
          <p class="cart-item-price">Bs. ${price.toFixed(2)}</p>
          <div class="cart-item-quantity">
            <button class="decrease-quantity" data-index="${index}">-</button>
            <input type="number" value="${quantity}" min="1" data-index="${index}">
            <button class="increase-quantity" data-index="${index}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-index="${index}">Eliminar</button>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
  }

  console.log("Total calculado:", total);
  console.groupEnd();
  
  cartTotalElement.textContent = `Bs. ${total.toFixed(2)}`;
}

  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }

  // Event listeners
  cartItemsContainer.addEventListener('click', function(e) {
    const index = e.target.dataset.index;
    if (!index) return;

    if (e.target.classList.contains('increase-quantity')) {
      cart[index].quantity = safeNumber(cart[index].quantity) + 1;
      updateCart();
    }
    else if (e.target.classList.contains('decrease-quantity')) {
      const newQuantity = safeNumber(cart[index].quantity) - 1;
      if (newQuantity >= 1) {
        cart[index].quantity = newQuantity;
        updateCart();
      }
    }
    else if (e.target.classList.contains('cart-item-remove')) {
      cart.splice(index, 1);
      updateCart();
    }
  });

  cartItemsContainer.addEventListener('change', function(e) {
    if (e.target.type === 'number') {
      const index = e.target.dataset.index;
      const value = parseInt(e.target.value) || 1;
      cart[index].quantity = Math.max(1, value);
      updateCart();
    }
  });

  // Modal de pago
  const modal = document.getElementById('payment-modal');
  const btnCheckout = document.querySelector('.btn-checkout');
  const closeModal = document.querySelector('.close-modal');

  if (btnCheckout && modal && closeModal) {
    btnCheckout.addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.add('show');
    });

    closeModal.addEventListener('click', function() {
      modal.classList.remove('show');
    });

    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }

  // Resaltar enlace activo
  const currentPage = window.location.pathname.split('/').pop() || 'carrito.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Inicialización
  renderCart();
});