 import { store, requireAuth } from "./store.js";
import { toggleTheme, updateToggleIcon } from "./theme.js";

requireAuth();
updateToggleIcon();
document.getElementById("themeBtn").onclick = toggleTheme;
document.getElementById("logoutBtn").onclick = () => { store.logout(); location.href = "index.html"; };

const tasks = store.get("tasks");
const journal = store.get("journal");
const schedule = store.get("schedule");

// KPIs
const done = tasks.filter(t => t.completed).length;
const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
document.getElementById("completionRate").textContent = rate + "%";
document.getElementById("eventsCount").textContent = schedule.length;
document.getElementById("journalTotal").textContent = journal.length;

// Journal streak
const dates = new Set(journal.map(j => j.date));
let streak = 0;
let d = new Date();
while (dates.has(d.toISOString().split("T")[0])) {
  streak++;
  d.setDate(d.getDate() - 1);
}
document.getElementById("streak").textContent = streak;

// --- Heatmap Logic ---
const heatmapEl = document.getElementById("heatmap");
for (let i = 29; i >= 0; i--) {
  const day = new Date();
  day.setDate(day.getDate() - i);
  const dateStr = day.toISOString().split("T")[0];
  
  // Count tasks completed on this date
  const count = tasks.filter(t => t.completedAt === dateStr).length;
  
  let level = 0;
  if (count > 0) level = 1;
  if (count > 2) level = 2;
  if (count > 4) level = 3;
  if (count > 6) level = 4;

  const div = document.createElement("div");
  div.className = `heatmap-day level-${level}`;
  div.title = `${dateStr}: ${count} tasks completed`;
  heatmapEl.appendChild(div);
}

// --- Charts ---
new Chart(document.getElementById("statusChart"), {
  type: "doughnut",
  data: {
    labels: ["Completed", "Pending"],
    datasets: [{ data: [done, tasks.length - done], backgroundColor: ["#10b981", "#f59e0b"] }],
  },
  options: { plugins: { legend: { position: "bottom" } } },
});

const prio = { low: 0, medium: 0, high: 0 };
tasks.forEach(t => prio[t.priority]++);
new Chart(document.getElementById("priorityChart"), {
  type: "bar",
  data: {
    labels: ["Low", "Medium", "High"],
    datasets: [{ label: "Tasks", data: [prio.low, prio.medium, prio.high],
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], borderRadius: 8 }],
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
});

const labels = [];
const counts = [];
for (let i = 6; i >= 0; i--) {
  const day = new Date();
  day.setDate(day.getDate() - i);
  const key = day.toISOString().split("T")[0];
  labels.push(day.toLocaleDateString("en-IN", { weekday: "short" }));
  counts.push(tasks.filter(t => t.completed && t.completedAt === key).length);
}
new Chart(document.getElementById("weekChart"), {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Completed Tasks",
      data: counts,
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.15)",
      fill: true, tension: 0.4,
    }],
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
});