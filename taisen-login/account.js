// account.js
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const nameEl = document.getElementById("accountName");
const emailEl = document.getElementById("accountEmail");
const uidEl = document.getElementById("accountUid");
const logoutBtn = document.getElementById("logoutBtn");
const deleteBtn = document.getElementById("deleteBtn");
const msgEl = document.getElementById("accountMsg");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  nameEl.textContent = user.displayName || "(no name)";
  emailEl.textContent = user.email || "(no email)";
  uidEl.textContent = user.uid;
});

// logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// delete account (Firestore first, then Auth)
deleteBtn.addEventListener("click", async () => {
  msgEl.textContent = "";
  if (!currentUser) return;

  if (!confirm("⚠️ Delete account? This will remove your profile and cannot be undone.")) return;

  try {
    // Step 1: Delete Firestore profile while user is still logged in
    await deleteDoc(doc(db, "users", currentUser.uid));

    // Step 2: Try to delete the auth user
    await deleteUser(currentUser);

    // Success
    msgEl.className = "success-msg";
    msgEl.textContent = "Account deleted. Redirecting...";
    setTimeout(() => (window.location.href = "index.html"), 1500);
  } catch (err) {
    if (err.code === "auth/requires-recent-login") {
      try {
        const providerId =
          currentUser.providerData &&
          currentUser.providerData[0] &&
          currentUser.providerData[0].providerId;

        if (providerId === "google.com") {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(currentUser, provider);
        } else {
          const pwd = prompt("Please enter your password to confirm account deletion:");
          if (!pwd) throw new Error("Password required.");
          const cred = EmailAuthProvider.credential(currentUser.email, pwd);
          await reauthenticateWithCredential(currentUser, cred);
        }

        // After re-auth → delete Firestore + user
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(auth.currentUser);

        msgEl.className = "success-msg";
        msgEl.textContent = "Account deleted after re-authentication.";
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } catch (reauthErr) {
        msgEl.className = "error-msg";
        msgEl.textContent = "Re-auth failed: " + reauthErr.message;
      }
    } else {
      msgEl.className = "error-msg";
      msgEl.textContent = "Delete failed: " + (err.message || err);
    }
  }
});
