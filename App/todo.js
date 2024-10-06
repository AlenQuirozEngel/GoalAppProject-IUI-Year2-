// Array to store todo items
let todos = JSON.parse(localStorage.getItem('todos')) || [];
  function renderTodos() {
      const activeTodoList = document.getElementById('active-todo-list');
      const completedTodoList = document.getElementById('completed-todo-list');
      activeTodoList.innerHTML = '';
      completedTodoList.innerHTML = '';

      todos.forEach((todo, index) => {
          const li = document.createElement('li');
          li.className = 'todo-item';
          li.innerHTML = `
              <input type="checkbox" id="todo-${index}" ${todo.completed ? 'checked' : ''}>
              <label for="todo-${index}">${todo.text}</label>
              <button class="delete-btn" onclick="deleteTodo(${index})">Delete</button>
          `;
          li.querySelector('input').addEventListener('change', () => toggleTodo(index));
        
          if (todo.completed) {
              completedTodoList.appendChild(li);
          } else {
              activeTodoList.appendChild(li);
          }
      });
  }

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}
function addTodo(e) {
    e.preventDefault();
    const todoInput = document.getElementById('todo-input');
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}
  document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    renderTodos();
    document.getElementById('todo-form').addEventListener('submit', addTodo);
});  function saveTodos() {
      localStorage.setItem('todos', JSON.stringify(todos));
  }



function applyButtonColor() {
    const colorPreference = localStorage.getItem('colorPreference');
    if (colorPreference) {
        const buttons = document.querySelectorAll('.nav-btn, button[type="submit"]');
        buttons.forEach(button => {
            button.style.backgroundColor = colorPreference;
        });
    }
}
