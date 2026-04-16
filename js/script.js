document.addEventListener('DOMContentLoaded', () => {
    const boardsContainer = document.getElementById('boards-container');
    const addBoardCard = document.getElementById('add-board-card');
    const addBoardBtn = document.getElementById('add-board-btn');

    let boards = JSON.parse(localStorage.getItem('taskboards')) || [
        { id: Date.now(), title: 'To Do', tasks: [] }
    ];

    function saveBoards() {
        localStorage.setItem('taskboards', JSON.stringify(boards));
    }

    function renderBoards() {
        // Remove existing boards but keep the add-board-card
        const existingBoards = document.querySelectorAll('.board-card:not(.add-card)');
        existingBoards.forEach(b => b.remove());

        boards.forEach((board) => {
            const boardEl = createBoardElement(board);
            boardsContainer.insertBefore(boardEl, addBoardCard);
        });

        // Toggle add board card visibility (max 5)
        if (boards.length >= 5) {
            addBoardCard.style.display = 'none';
        } else {
            addBoardCard.style.display = 'flex';
        }
    }

    function createBoardElement(board) {
        const div = document.createElement('div');
        div.className = 'board-card';
        div.setAttribute('data-id', board.id);

        div.innerHTML = `
            <div class="board-header">
                <input type="text" class="board-title" value="${board.title}" placeholder="Board Name">
                <button class="delete-board-btn" title="Delete Board">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            <div class="input-section">
                <div class="input-wrapper">
                    <input type="text" placeholder="Add a task..." class="task-input">
                    <button class="add-task-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
            <div class="list-section">
                <ul class="todo-list"></ul>
            </div>
        `;

        const titleInput = div.querySelector('.board-title');
        titleInput.addEventListener('change', (e) => {
            board.title = e.target.value;
            saveBoards();
        });

        const deleteBoardBtn = div.querySelector('.delete-board-btn');
        deleteBoardBtn.addEventListener('click', () => {
            deleteBoard(board.id);
        });

        const taskInput = div.querySelector('.task-input');
        const addTaskBtn = div.querySelector('.add-task-btn');
        
        addTaskBtn.addEventListener('click', () => addTask(board, taskInput));
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask(board, taskInput);
        });

        renderTasks(board, div.querySelector('.todo-list'));
        return div;
    }

    function renderTasks(board, listEl) {
        listEl.innerHTML = '';
        
        // Sort: active tasks first
        const sortedTasks = [...board.tasks].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        sortedTasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="checkbox-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="todo-text">${task.text}</span>
                <button class="delete-task-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.closest('.delete-task-btn')) {
                    deleteTask(board, task.id);
                } else {
                    toggleTask(board, task.id);
                }
            });

            listEl.appendChild(li);
        });
    }

    function addTask(board, inputEl) {
        const text = inputEl.value.trim();
        if (text) {
            board.tasks.push({ id: Date.now(), text, completed: false });
            inputEl.value = '';
            saveBoards();
            renderBoards();
        }
    }

    function toggleTask(board, taskId) {
        const task = board.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveBoards();
            renderBoards();
        }
    }

    function deleteTask(board, taskId) {
        board.tasks = board.tasks.filter(t => t.id !== taskId);
        saveBoards();
        renderBoards();
    }

    function deleteBoard(boardId) {
        if (confirm('Are you sure you want to delete this board?')) {
            boards = boards.filter(b => b.id !== boardId);
            saveBoards();
            renderBoards();
        }
    }

    addBoardBtn.addEventListener('click', () => {
        if (boards.length < 5) {
            boards.push({ id: Date.now(), title: 'New Board', tasks: [] });
            saveBoards();
            renderBoards();
            
            // Scroll to the end
            setTimeout(() => {
                document.querySelector('.boards-wrapper').scrollLeft = boardsContainer.scrollWidth;
            }, 100);
        }
    });

    addBoardCard.addEventListener('click', (e) => {
        if (e.target.closest('#add-board-btn')) return; // handled by btn
        addBoardBtn.click();
    });

    // Initial render
    renderBoards();
});
