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
  
  // Traducción de mensajes comunes de error
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

// Login
if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "productos.html";
    } catch (error) {
      handleAuthError(error);
    }
  });

  // Login anónimo
  document.getElementById("guest-btn").addEventListener("click", async () => {
    mensajeError.textContent = "";
    try {
      await signInAnonymously(auth);
      window.location.href = "productos.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// Registro
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
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "login.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}