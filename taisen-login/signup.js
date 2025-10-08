import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const signupForm = document.getElementById("signup-form");
const errorMsg = document.getElementById("signup-error");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "search.html";
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
