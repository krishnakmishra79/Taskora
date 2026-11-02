// Check local storage for theme
const currentTheme = localStorage.getItem("taskora_theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("taskora_theme", newTheme);
  updateToggleIcon();
}

export function updateToggleIcon() {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const current = document.documentElement.getAttribute("data-theme");
  btn.textContent = current === "light" ? "🌙" : "☀️";
}