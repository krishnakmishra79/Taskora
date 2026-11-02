 const PREFIX = "taskora_";

export const store = {
  getUsers() { return JSON.parse(localStorage.getItem(PREFIX + "users") || "[]"); },
  saveUsers(users) { localStorage.setItem(PREFIX + "users", JSON.stringify(users)); },
  
  getCurrentUser() {
    const email = localStorage.getItem(PREFIX + "current");
    if (!email) return null;
    return this.getUsers().find(u => u.email === email) || null;
  },
  setCurrentUser(email) { localStorage.setItem(PREFIX + "current", email); },
  logout() { localStorage.removeItem(PREFIX + "current"); },

  signup(name, email, password) {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    if (users.find(u => u.email === cleanEmail)) throw new Error("Email already registered");
    
    const user = { name, email: cleanEmail, password: password.trim(), id: Date.now().toString() };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser(cleanEmail);
    return user;
  },

  login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = this.getUsers().find(u => u.email === cleanEmail && u.password === cleanPassword);
    
    if (!user) throw new Error("Invalid email or password");
    
    this.setCurrentUser(cleanEmail);
    return user;
  },

  _key(bucket) {
    const u = this.getCurrentUser();
    return PREFIX + bucket + "_" + (u ? u.email : "guest");
  },
  get(bucket) { return JSON.parse(localStorage.getItem(this._key(bucket)) || "[]"); },
  set(bucket, data) { localStorage.setItem(this._key(bucket), JSON.stringify(data)); },

  // --- TASKS ---
  addTask(task) {
    const tasks = this.get("tasks");
    tasks.push({ id: Date.now().toString(), completed: false, completedAt: null, createdAt: new Date().toISOString(), ...task });
    this.set("tasks", tasks);
  },
  editTask(id, updatedData) {
    const tasks = this.get("tasks").map(t => t.id === id ? { ...t, ...updatedData } : t);
    this.set("tasks", tasks);
  },
  toggleTask(id) {
    const tasks = this.get("tasks").map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString().split("T")[0] : null };
      }
      return t;
    });
    this.set("tasks", tasks);
  },
  deleteTask(id) { this.set("tasks", this.get("tasks").filter(t => t.id !== id)); },

  // --- SCHEDULE ---
  addSchedule(item) {
    const items = this.get("schedule");
    items.push({ id: Date.now().toString(), ...item });
    this.set("schedule", items);
  },
  deleteSchedule(id) { this.set("schedule", this.get("schedule").filter(s => s.id !== id)); },

  // --- JOURNAL ---
  addJournal(entry) {
    const items = this.get("journal");
    items.unshift({ id: Date.now().toString(), date: new Date().toISOString().split("T")[0], ...entry });
    this.set("journal", items);
  },
  deleteJournal(id) { this.set("journal", this.get("journal").filter(j => j.id !== id)); },
};

export function requireAuth() {
  const user = store.getCurrentUser();
  if (!user) { window.location.href = "index.html"; return null; }
  return user;
}