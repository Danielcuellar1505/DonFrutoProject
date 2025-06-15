import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('#cart-total');

  function safeNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numericString = value.replace(/[^0-9.]/g, '');
      return parseFloat(numericString) || 0;
    }
    return 0;
  }

  function renderCart() {
    let total = 0;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
      cart.forEach((item, index) => {
        const price = safeNumber(item.price);
        const quantity = safeNumber(item.quantity);
        const subtotal = price * quantity;
        total += subtotal;

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
    
    cartTotalElement.textContent = `Bs. ${total.toFixed(2)}`;
  }

  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }

  async function confirmPayment() {
    try {
      const user = auth.currentUser;
      if (!user) {
        await signInAnonymously(auth);
      }
      const userId = auth.currentUser.uid;

      const q = query(collection(db, 'orders'), where('userId', '==', userId), where('isPaid', '==', false));
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, { isPaid: true });
      }

      alert('¡Pago confirmado! Tu pedido ha sido procesado.');
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
      
      const modal = document.getElementById('payment-modal');
      if (modal) {
        modal.classList.remove('show');
      }
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      alert('Error al confirmar el pago. Intenta de nuevo.');
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch(error => {
        console.error('Error en login anónimo:', error);
        alert('Error de autenticación. Intenta de nuevo.');
      });
    }
    renderCart();
  });

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

  const modal = document.getElementById('payment-modal');
  const btnCheckout = document.querySelector('.btn-checkout');
  const closeModal = document.querySelector('.close-modal');

  if (btnCheckout && modal && closeModal) {
    btnCheckout.addEventListener('click', async function(e) {
      e.preventDefault();
      if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
      }
      await confirmPayment();
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

  const currentPage = window.location.pathname.split('/').pop() || 'carrito.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});