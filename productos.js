import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIQXiPe8DhUeAIAr2Zt14nbLnw20U94No",
  authDomain: "don-fruto.firebaseapp.com",
  projectId: "don-fruto",
  storageBucket: "don-fruto.firebasestorage.app",
  messagingSenderId: "235335012940",
  appId: "1:235335012940:web:82209aa355684c08409ae9",
  measurementId: "G-Z70J0PWZY3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
    }
  }

  onAuthStateChanged(auth, (user) => {
    console.log('Estado de autenticación:', user ? { uid: user.uid, email: user.email } : 'No autenticado');
    if (!user) {
      console.log('Intentando login anónimo');
      signInAnonymously(auth).catch(error => {
        console.error('Error en login anónimo:', error.code, error.message);
        alert('Error de autenticación. Intenta de nuevo.');
      });
    }
  });

  const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      const productCard = this.closest('.product-card');
      const productName = productCard.querySelector('.product-title').textContent;
      const productPriceText = productCard.querySelector('.product-price').textContent;
      const productImage = productCard.querySelector('.product-image img').src;
      
      console.log('Producto a añadir:', { productName, productPriceText, productImage });
      
      const priceMatch = productPriceText.match(/Bs\.\s*(\d+)/);
      const priceValue = priceMatch ? parseInt(priceMatch[1]) : 0;
      const quantity = 1;
      const totalPrice = priceValue * quantity;

      const product = {
        name: productName,
        price: priceValue,
        image: productImage,
        quantity: quantity,
        totalPrice: totalPrice
      };

      try {
        const user = auth.currentUser;
        console.log('Usuario actual:', user ? { uid: user.uid, email: user.email } : 'No autenticado');
        if (!user) {
          console.log('Intentando login anónimo dentro de addToCart');
          await signInAnonymously(auth);
          console.log('Login anónimo exitoso:', auth.currentUser.uid);
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        console.log('userInfo:', userInfo);
        if (!userInfo || userInfo.userId !== user.uid) {
          throw new Error('Información de usuario no válida o no coincide con el usuario autenticado');
        }

        console.log('Guardando en Firestore en:', `users/${user.uid}/orders`);
        await addDoc(collection(db, `users/${user.uid}/orders`), {
          product: product,
          identifier: userInfo.identifier,
          isPaid: false,
          createdAt: new Date()
        });
        console.log('Producto guardado en Firestore');
        
        const existingProduct = cart.find(item => item.name === product.name);
        if (existingProduct) {
          existingProduct.quantity += 1;
          existingProduct.totalPrice = existingProduct.price * existingProduct.quantity;
        } else {
          cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`${productName} añadido al carrito`);
        updateCartCount();
      } catch (error) {
        console.error('Error al guardar en Firestore:', error.code, error.message);
        alert('Error al añadir el producto. Intenta de nuevo.');
      }
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

  const currentPage = window.location.pathname.split('/').pop() || 'productos.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  updateCartCount();
});