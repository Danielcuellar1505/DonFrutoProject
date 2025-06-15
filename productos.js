document.addEventListener('DOMContentLoaded', function() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
    }
  }

  const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
  
  addToCartButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    const productCard = this.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    const productPriceText = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image img').src;
    
    // Extracción mejorada del precio (maneja "Bs. 18 / 1L")
    const priceMatch = productPriceText.match(/Bs\.\s*(\d+)/);
    const priceValue = priceMatch ? parseInt(priceMatch[1]) : 0;
    
    console.log('Producto añadido:', {
      nombre: productName,
      precioTexto: productPriceText,
      precioNumerico: priceValue,
      tipoDato: typeof priceValue
    });

    const product = {
      name: productName,
      price: priceValue, // Guardamos como número
      priceText: `Bs. ${priceValue}.00`, // Texto formateado
      image: productImage,
      quantity: 1 // Siempre empezamos con cantidad 1
    };
    
    const existingProduct = cart.find(item => item.name === product.name);
    
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Carrito actual:', JSON.parse(localStorage.getItem('cart')));
    showNotification(`${productName} añadido al carrito`);
    updateCartCount();
  });
});

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    notification.style.opacity = '1';
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  // Estilos para notificación
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--secondary-color);
      color: white;
      padding: 15px 25px;
      border-radius: 5px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    }
  `;
  document.head.appendChild(style);

  // Animaciones para las tarjetas
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150 * index);
  });

  // Efecto hover para las tarjetas
  productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
      card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    });
  });

  // Efectos para botones
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-3px) scale(1.05)';
      button.style.boxShadow = '0 5px 10px rgba(0,0,0,0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = 'none';
    });
  });

  // Resaltar enlace activo
  const currentPage = window.location.pathname.split('/').pop() || 'productos.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Inicializar contador del carrito
  updateCartCount();
});