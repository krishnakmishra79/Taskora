 import { store } from "./store.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const errorBox = document.getElementById("authError");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
  setTimeout(() => (errorBox.style.display = "none"), 3000);
}

tabLogin.onclick = () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.style.display = "block";
  signupForm.style.display = "none";
};

tabSignup.onclick = () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupForm.style.display = "block";
  loginForm.style.display = "none";
};

loginForm.onsubmit = (e) => {
  e.preventDefault();
  try {
    store.login(
      document.getElementById("loginEmail").value.trim(), 
      document.getElementById("loginPassword").value.trim()
    );
    window.location.href = "dashboard.html";
  } catch (err) { showError(err.message); }
};

signupForm.onsubmit = (e) => {
  e.preventDefault();
  try {
    store.signup(
      document.getElementById("signupName").value.trim(),
      document.getElementById("signupEmail").value.trim(),
      document.getElementById("signupPassword").value.trim()
    );
    window.location.href = "dashboard.html";
  } catch (err) { showError(err.message); }
};