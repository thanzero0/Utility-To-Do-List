document.addEventListener('DOMContentLoaded', () => {
    const boardsContainer = document.getElementById('boards-container');
    const addBoardCard = document.getElementById('add-board-card');
    const addBoardBtn = document.getElementById('add-board-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    let boardIdToDelete = null;

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
                <div class="title-group">
                    <input type="text" class="board-title" value="${board.title}" placeholder="Board Name">
                    <span class="task-count">0/0</span>
                </div>
                <div class="header-actions">
                    <button class="reset-board-btn" title="Reset Aktivitas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                    </button>
                    <button class="delete-board-btn" title="Delete Board">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
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

        const resetBoardBtn = div.querySelector('.reset-board-btn');
        resetBoardBtn.addEventListener('click', () => {
            if (confirm('Reset semua aktivitas di papan ini?')) {
                board.tasks = [];
                saveBoards();
                renderBoards();
            }
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

        // Update task count
        const total = board.tasks.length;
        const completed = board.tasks.filter(t => t.completed).length;
        const countEl = listEl.closest('.board-card').querySelector('.task-count');
        if (countEl) {
            countEl.textContent = `${completed}/${total}`;
            countEl.classList.toggle('all-done', total > 0 && completed === total);
        }
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

    let modalAction = null; // 'delete' or 'create'

    function showModal(type, boardId = null) {
        modalAction = type;
        if (type === 'delete') {
            boardIdToDelete = boardId;
            document.getElementById('modal-title').textContent = 'Hapus Papan?';
            document.getElementById('modal-message').textContent = 'Tindakan ini tidak dapat dibatalkan.';
            modalConfirm.textContent = 'Hapus';
            modalConfirm.className = 'danger';
        } else if (type === 'create') {
            document.getElementById('modal-title').textContent = 'Buat Papan Baru?';
            document.getElementById('modal-message').textContent = 'Tambahkan papan baru ke daftar Anda.';
            modalConfirm.textContent = 'Buat';
            modalConfirm.className = 'primary';
        }
        modalOverlay.classList.add('active');
    }

    function deleteBoard(boardId) {
        showModal('delete', boardId);
    }

    modalCancel.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        boardIdToDelete = null;
        modalAction = null;
    });

    modalConfirm.addEventListener('click', () => {
        if (modalAction === 'delete' && boardIdToDelete) {
            boards = boards.filter(b => b.id !== boardIdToDelete);
            saveBoards();
            renderBoards();
        } else if (modalAction === 'create') {
            boards.push({ id: Date.now(), title: 'To Do Baru', tasks: [] });
            saveBoards();
            renderBoards();
            setTimeout(() => {
                document.querySelector('.boards-wrapper').scrollLeft = boardsContainer.scrollWidth;
            }, 100);
        }
        modalOverlay.classList.remove('active');
        boardIdToDelete = null;
        modalAction = null;
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            boardIdToDelete = null;
            modalAction = null;
        }
    });

    addBoardBtn.addEventListener('click', () => {
        if (boards.length < 5) {
            showModal('create');
        } else {
            alert('Maksimal 5 papan diperbolehkan.');
        }
    });

    addBoardCard.addEventListener('click', (e) => {
        if (e.target.closest('#add-board-btn')) return; // handled by btn
        if (boards.length < 5) {
            showModal('create');
        }
    });

    // Initial render
    renderBoards();
});
