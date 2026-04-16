document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats();
    }

    function updateStats() {
        const remaining = todos.filter(t => !t.completed).length;
        taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
    }

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-index', index);
            
            li.innerHTML = `
                <div class="checkbox-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn" aria-label="Delete task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) {
                    deleteTodo(index);
                } else {
                    toggleTodo(index);
                }
            });

            todoList.appendChild(li);
        });
        updateStats();
    }

    function addTodo() {
        const text = input.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            input.value = '';
            saveTodos();
            renderTodos();
            
            // Subtle animation feedback
            const lastItem = todoList.lastElementChild;
            if (lastItem) {
                lastItem.style.animation = 'none';
                lastItem.offsetHeight; // trigger reflow
                lastItem.style.animation = 'slideIn 0.3s ease-out';
            }
        }
    }

    function toggleTodo(index) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
    }

    function deleteTodo(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }

    addBtn.addEventListener('click', addTodo);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
    });

    // Initial render
    renderTodos();
});
