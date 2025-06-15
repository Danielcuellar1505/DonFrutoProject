import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);

const mensajeError = document.getElementById("mensaje-error");

const handleAuthError = (error) => {
  let message = error.message;
  if (error.code === 'auth/wrong-password') {
    message = 'Contraseña incorrecta';
  } else if (error.code === 'auth/user-not-found') {
    message = 'Usuario no encontrado';
  } else if (error.code === 'auth/email-already-in-use') {
    message = 'El correo ya está en uso';
  } else if (error.code === 'auth/weak-password') {
    message = 'La contraseña debe tener al menos 6 caracteres';
  }
  mensajeError.textContent = message;
};

const generateGuestIdentifier = () => {
  const guestCount = parseInt(localStorage.getItem('guestCount') || '0') + 1;
  localStorage.setItem('guestCount', guestCount);
  return `Invitado_${guestCount}`;
};

const saveUserInfo = (user, identifier) => {
  localStorage.setItem('userInfo', JSON.stringify({
    userId: user.uid,
    identifier: identifier
  }));
};

if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      saveUserInfo(userCredential.user, email);
      window.location.href = "productos.html";
    } catch (error) {
      handleAuthError(error);
    }
  });

  document.getElementById("guest-btn").addEventListener("click", async () => {
    mensajeError.textContent = "";
    try {
      const userCredential = await signInAnonymously(auth);
      const guestIdentifier = generateGuestIdentifier();
      saveUserInfo(userCredential.user, guestIdentifier);
      window.location.href = "productos.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const passwordConfirm = document.getElementById("password-confirm").value.trim();

    if (password !== passwordConfirm) {
      mensajeError.textContent = "Las contraseñas no coinciden.";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      saveUserInfo(userCredential.user, email);
      window.location.href = "login.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}