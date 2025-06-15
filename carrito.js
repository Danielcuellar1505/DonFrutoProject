import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

  function showSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.innerHTML = `
      <div class="spinner-circle"></div>
    `;
    document.body.appendChild(spinner);
  }

  function hideSpinner() {
    const spinner = document.querySelector('.spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  function renderCart() {
    let total = 0;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
      cart.forEach((item, index) => {
        const precio = safeNumber(item.precio);
        const cantidad = safeNumber(item.cantidad);
        const precioTotal = precio * cantidad;
        total += precioTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <img src="${item.imagen}" alt="${item.nombre}">
          <div class="cart-item-info">
            <h3 class="cart-item-title">${item.nombre}</h3>
            <p class="cart-item-price">Bs. ${precio.toFixed(2)}</p>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-quantity">
              <button class="decrease-quantity" data-index="${index}">-</button>
              <input type="number" value="${cantidad}" min="1" data-index="${index}">
              <button class="increase-quantity" data-index="${index}">+</button>
            </div>
            <button class="cart-item-remove" data-index="${index}">Eliminar</button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItem);
      });
    }
    
    cartTotalElement.textContent = `Bs. ${total.toFixed(2)}`;
  }

  async function updateQuantityInFirestore(productName, newQuantity) {
    try {
      showSpinner(); // Mostrar spinner antes de la operación
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || userInfo.userId !== user.uid) {
        throw new Error('Información de usuario no válida');
      }

      const q = query(
        collection(db, `usuarios/${user.uid}/pedidos`),
        where('producto.nombre', '==', productName),
        where('pagado', '==', false)
      );
      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const precio = doc.data().producto.precio;
        await updateDoc(doc.ref, {
          'producto.cantidad': newQuantity,
          'producto.precioTotal': precio * newQuantity
        });
      }
    } catch (error) {
      console.error('Error al actualizar cantidad en Firestore:', error);
      alert('Error al actualizar la cantidad. Intenta de nuevo.');
    } finally {
      hideSpinner(); // Ocultar spinner después de la operación
    }
  }

  async function deleteFromFirestore(productName) {
    try {
      showSpinner(); // Mostrar spinner antes de la operación
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || userInfo.userId !== user.uid) {
        throw new Error('Información de usuario no válida');
      }

      const q = query(
        collection(db, `usuarios/${user.uid}/pedidos`),
        where('producto.nombre', '==', productName),
        where('pagado', '==', false)
      );
      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error('Error al eliminar de Firestore:', error);
      alert('Error al eliminar el producto. Intenta de nuevo.');
    } finally {
      hideSpinner(); // Ocultar spinner después de la operación
    }
  }

  async function confirmPayment() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || userInfo.userId !== user.uid) {
        throw new Error('Información de usuario no válida');
      }

      const q = query(collection(db, `usuarios/${user.uid}/pedidos`), where('pagado', '==', false));
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, { pagado: true });
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

  function updateCart() {
    cart.forEach(item => {
      item.precioTotal = item.precio * item.cantidad;
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
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

  cartItemsContainer.addEventListener('click', async function(e) {
    const index = e.target.dataset.index;
    if (!index) return;

    const productName = cart[index].nombre;

    if (e.target.classList.contains('increase-quantity')) {
      cart[index].cantidad = safeNumber(cart[index].cantidad) + 1;
      await updateQuantityInFirestore(productName, cart[index].cantidad);
      updateCart();
    }
    else if (e.target.classList.contains('decrease-quantity')) {
      const newQuantity = safeNumber(cart[index].cantidad) - 1;
      if (newQuantity >= 1) {
        cart[index].cantidad = newQuantity;
        await updateQuantityInFirestore(productName, cart[index].cantidad);
        updateCart();
      }
    }
    else if (e.target.classList.contains('cart-item-remove')) {
      await deleteFromFirestore(productName);
      cart.splice(index, 1);
      updateCart();
    }
  });

  cartItemsContainer.addEventListener('change', async function(e) {
    if (e.target.type === 'number') {
      const index = e.target.dataset.index;
      const value = parseInt(e.target.value) || 1;
      cart[index].cantidad = Math.max(1, value);
      await updateQuantityInFirestore(cart[index].nombre, cart[index].cantidad);
      updateCart();
    }
  });

  const modal = document.getElementById('payment-modal');
  const btnCheckout = document.querySelector('.btn-checkout');
  const closeModal = document.querySelector('.close-modal');
  const btnConfirmPayment = document.querySelector('.btn-confirm-payment');

  if (modal && btnCheckout && closeModal && btnConfirmPayment) {
    // Ocultar modal al cargar la página
    modal.classList.remove('show');

    btnCheckout.addEventListener('click', function(e) {
      e.preventDefault();
      if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
      }
      console.log('Abriendo modal de pago');
      modal.classList.add('show');
    });

    btnConfirmPayment.addEventListener('click', async function(e) {
      e.preventDefault();
      console.log('Confirmando pago');
      await confirmPayment();
    });

    closeModal.addEventListener('click', function() {
      console.log('Cerrando modal');
      modal.classList.remove('show');
    });

    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        console.log('Cerrando modal por clic fuera');
        modal.classList.remove('show');
      }
    });
  } else {
    console.error('Elementos del modal no encontrados:', {
      modal: !!modal,
      btnCheckout: !!btnCheckout,
      closeModal: !!closeModal,
      btnConfirmPayment: !!btnConfirmPayment
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .spinner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .spinner-circle {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  const currentPage = window.location.pathname.split('/').pop() || 'carrito.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});