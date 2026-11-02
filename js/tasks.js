 import { store, requireAuth } from "./store.js";
import { toggleTheme, updateToggleIcon } from "./theme.js";

requireAuth();
updateToggleIcon();
document.getElementById("themeBtn").onclick = toggleTheme;
document.getElementById("logoutBtn").onclick = () => { store.logout(); location.href = "index.html"; };

const form = document.getElementById("taskForm");
const list = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
let currentFilter = "all";
let searchQuery = "";

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

document.getElementById("exportBtn").onclick = () => {
  const tasks = store.get("tasks");
  if (!tasks.length) return alert("No tasks to export!");
  let csv = "Title,Priority,Deadline,Status\n";
  tasks.forEach(t => {
    csv += `"${t.title}","${t.priority}","${t.deadline || "-"}","${t.completed ? "Done" : "Pending"}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Taskora_Tasks.csv';
  a.click();
};

function render() {
  let tasks = store.get("tasks").sort((a, b) => (a.completed - b.completed) || (b.createdAt.localeCompare(a.createdAt)));

  // Filter by status
  if (currentFilter === "active") tasks = tasks.filter(t => !t.completed);
  else if (currentFilter === "done") tasks = tasks.filter(t => t.completed);
  else if (currentFilter === "high") tasks = tasks.filter(t => t.priority === "high" && !t.completed);

  // Filter by Search
  if (searchQuery) tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery));

  list.innerHTML = "";
  if (!tasks.length) {
    list.innerHTML = "<li class='empty'>No tasks found</li>";
    return;
  }

  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = `task ${t.completed ? "done" : ""} prio-${t.priority}`;
    li.innerHTML = `
      <input type="checkbox" ${t.completed ? "checked" : ""} data-id="${t.id}" />
      <div class="task-body">
        <span>${t.title}</span>
        <small>${t.deadline ? "📅 " + t.deadline : ""} &nbsp; <span class="badge ${t.priority}">${t.priority}</span></small>
      </div>
      <button class="edit-btn" data-edit="${t.id}" title="Edit">✏️</button>
      <button class="del-btn" data-del="${t.id}" title="Delete">✕</button>
    `;
    list.appendChild(li);
  });
}

form.onsubmit = (e) => {
  e.preventDefault();
  store.addTask({
    title: document.getElementById("title").value.trim(),
    deadline: document.getElementById("deadline").value || null,
    priority: document.getElementById("priority").value,
  });
  form.reset();
  render();
};

list.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    store.toggleTask(e.target.dataset.id);
    render();
  }
});

list.addEventListener("click", (e) => {
  // Delete
  const delId = e.target.closest("[data-del]")?.dataset.del;
  if (delId) { store.deleteTask(delId); render(); return; }
  
  // Edit
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  if (editId) {
    const task = store.get("tasks").find(t => t.id === editId);
    const newTitle = prompt("Edit Task Title:", task.title);
    if (newTitle && newTitle.trim() !== "") {
      const newPriority = prompt("Edit Priority (low/medium/high):", task.priority);
      store.editTask(editId, { 
        title: newTitle.trim(), 
        priority: ["low","medium","high"].includes(newPriority) ? newPriority : task.priority 
      });
      render();
    }
  }
});

document.querySelectorAll(".chip[data-filter]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".chip[data-filter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  };
});

render();