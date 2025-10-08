import { auth, RecaptchaVerifier } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const googleBtn = document.getElementById("google-login");
const guestBtn = document.getElementById("guest-login");
const sendCodeBtn = document.getElementById("send-code");
const verifyCodeBtn = document.getElementById("verify-code");
const errorMsg = document.getElementById("login-error");

let confirmationResult;

// Email/Password
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "https://taisenaccounts.pages.dev/account";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Google
googleBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "https://taisenaccounts.pages.dev/account";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Anonymous
guestBtn.addEventListener("click", async () => {
  try {
    await signInAnonymously(auth);
    window.location.href = "https://taisenaccounts.pages.dev/account";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

// Phone OTP
sendCodeBtn.addEventListener("click", async () => {
  const phoneNumber = document.getElementById("phone-number").value;

  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible"
    });
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    alert("OTP sent!");
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

verifyCodeBtn.addEventListener("click", async () => {
  const code = document.getElementById("otp-code").value;
  try {
    await confirmationResult.confirm(code);
    window.location.href = "https://taisen.pages.dev";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
