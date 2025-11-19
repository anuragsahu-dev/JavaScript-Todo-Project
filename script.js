document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todo-input");
  const addBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const listEmpty = document.getElementById("list-empty");
  const remainingCount = document.getElementById("remaining-count");
  const themeToggle = document.getElementById("theme-toggle");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let tasks = JSON.parse(localStorage.getItem("focusflow_tasks") || "[]");
  let theme = localStorage.getItem("focusflow_theme") || "dark";

  applyTheme(theme);

  function applyTheme(t) {
    if (t === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");

    themeToggle.textContent = t === "light" ? "🌙" : "☀️";
    localStorage.setItem("focusflow_theme", t);
  }

  themeToggle.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
  });

  function save() {
    localStorage.setItem("focusflow_tasks", JSON.stringify(tasks));
    updateUI();
  }

  function updateUI() {
    todoList.innerHTML = "";
    const filter = document.querySelector(".filter-btn.active").dataset.filter;

    const filtered = tasks.filter(t =>
      filter === "all" ? true :
      filter === "active" ? !t.completed :
      t.completed
    );

    listEmpty.style.display = filtered.length ? "none" : "block";
    remainingCount.textContent = tasks.filter(t => !t.completed).length;

    filtered.forEach(renderTask);
  }

  function renderTask(task) {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="todo-left">
        <div class="check-wrap">
          <input type="checkbox" class="check" ${task.completed ? "checked" : ""} />
        </div>
        <span class="task-text">${task.text}</span>
      </div>

      <div class="todo-actions">
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </div>
    `;

    const checkbox = li.querySelector(".check");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      li.classList.toggle("completed");
      save();
    });

    li.querySelector(".edit-btn").addEventListener("click", () => {
      const updated = prompt("Update task:", task.text);
      if (updated && updated.trim()) {
        task.text = updated.trim();
        li.querySelector(".task-text").textContent = task.text;
        save();
      }
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      li.style.animation = "fadeOut .28s ease forwards";
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== task.id);
        save();
      }, 250);
    });

    todoList.appendChild(li);
  }

  addBtn.addEventListener("click", () => {
    const text = todoInput.value.trim();
    if (text === "") return;

    tasks.unshift({ id: Date.now(), text, completed: false });
    todoInput.value = "";
    save();
  });

  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateUI();
    });
  });

  updateUI();
});
