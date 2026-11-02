 import { store, requireAuth } from "./store.js";
import { toggleTheme, updateToggleIcon } from "./theme.js";

const user = requireAuth();
if (user) {
  updateToggleIcon();
  document.getElementById("themeBtn").onclick = toggleTheme;
  document.getElementById("logoutBtn").onclick = () => { store.logout(); window.location.href = "index.html"; };

  document.getElementById("welcome").textContent = `Welcome back, ${user.name} 👋`;
  document.getElementById("dateLine").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // --- Data Load ---
  const tasks = store.get("tasks");
  const journal = store.get("journal");
  const schedule = store.get("schedule");
  const today = new Date().toISOString().split("T")[0];

  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("doneTasks").textContent = tasks.filter(t => t.completed).length;
  document.getElementById("pendingTasks").textContent = tasks.filter(t => !t.completed).length;
  document.getElementById("journalCount").textContent = journal.length;

  const todayTasksEl = document.getElementById("todayTasks");
  const todays = tasks.filter(t => t.deadline === today && !t.completed);
  if (!todays.length) todayTasksEl.innerHTML = "<li class='empty'>No pending tasks for today 🎉</li>";
  else todays.forEach(t => {
    todayTasksEl.innerHTML += `<li><span class="dot prio-${t.priority}"></span>${t.title}</li>`;
  });

  const schedEl = document.getElementById("todaySchedule");
  const todaysSchedule = schedule.filter(s => s.date === today);
  if (!todaysSchedule.length) schedEl.innerHTML = "<li class='empty'>No events scheduled today</li>";
  else todaysSchedule.sort((a, b) => a.time.localeCompare(b.time)).forEach(s => {
    schedEl.innerHTML += `<li><b>${s.time}</b> — ${s.title}</li>`;
  });

  const jEl = document.getElementById("recentJournal");
  if (!journal.length) jEl.innerHTML = "<li class='empty'>No journal entries yet</li>";
  else journal.slice(0, 3).forEach(j => {
    jEl.innerHTML += `<li><div><b>${j.title || "Untitled"}</b> <small>${j.date}</small><br><span class="muted">${j.content.slice(0, 60)}...</span></div></li>`;
  });
}

// --- Pomodoro Timer Logic ---
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;

const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}

startTimerBtn.onclick = () => {
  if (isRunning) {
    clearInterval(timerInterval);
    startTimerBtn.textContent = "Resume Focus";
    startTimerBtn.style.background = "var(--primary)";
  } else {
    startTimerBtn.textContent = "Pause Focus";
    startTimerBtn.style.background = "#f59e0b";
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        timerDisplay.textContent = "Done! 🎉";
        startTimerBtn.textContent = "Start Again";
        startTimerBtn.style.background = "#10b981";
        timeLeft = 25 * 60;
        // Simple beep sound
        new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => {});
      }
    }, 1000);
  }
  isRunning = !isRunning;
};