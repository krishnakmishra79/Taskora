 import { store, requireAuth } from "./store.js";
import { toggleTheme, updateToggleIcon } from "./theme.js";

requireAuth();
// --- Ye 2 lines theme ke liye hain ---
updateToggleIcon();
document.getElementById("themeBtn").onclick = toggleTheme;
// ------------------------------------

document.getElementById("logoutBtn").onclick = () => { store.logout(); location.href = "index.html"; };

const form = document.getElementById("scheduleForm");
const list = document.getElementById("scheduleList");
const dayLabel = document.getElementById("currentDayLabel");

let selectedDate = new Date();

function fmt(d) { return d.toISOString().split("T")[0]; }

function updateLabel() {
  dayLabel.textContent = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short"
  });
}

function render() {
  updateLabel();
  const key = fmt(selectedDate);
  const events = store.get("schedule").filter(s => s.date === key).sort((a, b) => a.time.localeCompare(b.time));

  list.innerHTML = "";
  if (!events.length) {
    list.innerHTML = "<li class='empty'>No events for this day</li>";
    return;
  }

  events.forEach(s => {
    const li = document.createElement("li");
    li.className = "task prio-medium";
    li.innerHTML = `
      <div class="task-body">
        <span><b>${s.time}</b> — ${s.title}</span>
      </div>
      <button class="del-btn" data-del="${s.id}">✕</button>
    `;
    list.appendChild(li);
  });
}

form.onsubmit = (e) => {
  e.preventDefault();
  store.addSchedule({
    title: document.getElementById("title").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
  });
  form.reset();
  render();
};

list.addEventListener("click", (e) => {
  const id = e.target.dataset.del;
  if (id) { store.deleteSchedule(id); render(); }
});

document.getElementById("prevDay").onclick = () => {
  selectedDate.setDate(selectedDate.getDate() - 1);
  render();
};
document.getElementById("nextDay").onclick = () => {
  selectedDate.setDate(selectedDate.getDate() + 1);
  render();
};

document.getElementById("date").value = fmt(selectedDate);
render();