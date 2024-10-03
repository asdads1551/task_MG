document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const filterPriority = document.getElementById('filter-priority');
    const filterStatus = document.getElementById('filter-status');
    const sortBy = document.getElementById('sort-by');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = document.getElementById('task-name').value;
        const taskPriority = document.getElementById('task-priority').value;
        const taskDueDate = document.getElementById('task-due-date').value;

        if (taskName && taskPriority) {
            const task = {
                id: Date.now(),
                name: taskName,
                priority: taskPriority,
                dueDate: taskDueDate,
                status: '進行中'
            };
            tasks.push(task);
            saveTasks();
            renderTasks();
            taskForm.reset();
        }
    });

    filterPriority.addEventListener('change', renderTasks);
    filterStatus.addEventListener('change', renderTasks);
    sortBy.addEventListener('change', renderTasks);

    function renderTasks() {
        let filteredTasks = tasks;

        // 過濾
        const priorityFilter = filterPriority.value;
        const statusFilter = filterStatus.value;
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }

        // 排序
        const sortValue = sortBy.value;
        filteredTasks.sort((a, b) => {
            if (sortValue === 'name') return a.name.localeCompare(b.name);
            if (sortValue === 'priority') return b.priority.localeCompare(a.priority);
            if (sortValue === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        });

        taskList.innerHTML = '';
        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.name}</td>
                <td>${task.priority}</td>
                <td>${task.dueDate || '無'}</td>
                <td>${task.status}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="completeTask(${task.id})"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-info" onclick="editTask(${task.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            taskList.appendChild(row);
        });
    }

    window.completeTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === '進行中' ? '已完成' : '進行中';
            saveTasks();
            renderTasks();
        }
    };

    window.editTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newName = prompt('編輯任務名稱', task.name);
            if (newName !== null) {
                task.name = newName;
                saveTasks();
                renderTasks();
            }
        }
    };

    window.deleteTask = (id) => {
        if (confirm('確定要刪除這個任務嗎？')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    renderTasks();
});