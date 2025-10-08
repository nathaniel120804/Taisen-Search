// profile.js
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const form = document.getElementById("profile-form");
const nameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const emailView = document.getElementById("emailView");
const msg = document.getElementById("profile-msg");

let userDocRef = null;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  emailView.value = user.email || "";

  userDocRef = doc(db, "users", user.uid);
  try {
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      nameInput.value = data.displayName ?? user.displayName ?? "";
      bioInput.value = data.bio ?? "";
    } else {
      // Create a minimal profile doc so updateDoc later doesn't fail
      await setDoc(userDocRef, {
        displayName: user.displayName ?? (user.email ? user.email.split("@")[0] : ""),
        bio: "",
        email: user.email ?? "",
        createdAt: serverTimestamp()
      }, { merge: true });

      nameInput.value = user.displayName ?? (user.email ? user.email.split("@")[0] : "");
      bioInput.value = "";
    }
  } catch (error) {
    msg.textContent = "Error loading profile: " + error.message;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  const newName = nameInput.value.trim();
  const newBio = bioInput.value.trim();

  if (!currentUser) {
    msg.textContent = "Not authenticated.";
    return;
  }

  try {
    // Save to Firestore (merge so we don't overwrite other fields)
    await setDoc(userDocRef, {
      displayName: newName,
      bio: newBio,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update Firebase Auth profile displayName (not sensitive)
    await updateProfile(currentUser, { displayName: newName });

    msg.className = "success-msg";
    msg.textContent = "Profile updated successfully.";
  } catch (error) {
    msg.className = "error-msg";
    msg.textContent = "Update failed: " + error.message;
  }
});
