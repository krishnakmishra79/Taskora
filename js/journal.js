import { store, requireAuth } from "./store.js";
import { toggleTheme, updateToggleIcon } from "./theme.js";

requireAuth();
// --- Ye 2 lines theme ke liye hain ---
updateToggleIcon();
document.getElementById("themeBtn").onclick = toggleTheme;
// ------------------------------------

document.getElementById("logoutBtn").onclick = () => { store.logout(); location.href = "index.html"; };

const form = document.getElementById("journalForm");
const list = document.getElementById("journalList");

function render() {
  const entries = store.get("journal");
  list.innerHTML = "";
  if (!entries.length) {
    list.innerHTML = "<p class='empty'>No journal entries yet. Start writing today ✍️</p>";
    return;
  }

  entries.forEach(j => {
    const card = document.createElement("div");
    card.className = "journal-card";
    card.innerHTML = `
      <div class="journal-header">
        <h4>${j.mood || ""} ${j.title || "Untitled"}</h4>
        <small>${j.date}</small>
        <button class="del-btn" data-del="${j.id}">✕</button>
      </div>
      <p>${j.content.replace(/\n/g, "<br>")}</p>
    `;
    list.appendChild(card);
  });
}

form.onsubmit = (e) => {
  e.preventDefault();
  store.addJournal({
    title: document.getElementById("jTitle").value.trim(),
    content: document.getElementById("jContent").value.trim(),
    mood: document.getElementById("jMood").value,
  });
  form.reset();
  render();
};

list.addEventListener("click", (e) => {
  const id = e.target.dataset.del;
  if (id) { store.deleteJournal(id); render(); }
});

render();