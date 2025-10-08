// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCMy4SNOU3eAl4iSfbmHWTxae9pVcnJFmc",
  authDomain: "taisen-search-ad9eb.firebaseapp.com",
  projectId: "taisen-search-ad9eb",
  storageBucket: "taisen-search-ad9eb.firebasestorage.app",
  messagingSenderId: "779736719927",
  appId: "1:779736719927:web:07ccea945f7549ad56d5b2",
  measurementId: "G-CZMHDK5R3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { auth, db, RecaptchaVerifier };
