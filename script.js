const addBtn = document.getElementById('addBtn');
const modalOverlay = document.getElementById('modal-overlay');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
let targetColumn = 'todo';
let editingTaskId = null;

async function loadTasks() {
    const response = await fetch('/tasks');
    const data = await response.json();
    renderTasks(data);
}

async function addTask(){
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descInput').value;
    const priority = document.getElementById('priorityInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, priority, dueDate, column: targetColumn})
    });
}

function renderTasks(data){
    const priorityColor = { low: 'green', medium: 'orange', high: 'red' };

    for (const column in data){ 
        const container = document.querySelector(`#${column} .cards-container`)
        container.innerHTML = '';
        for(const task of data[column]){
            const card = document.createElement('div');


            card.innerHTML = `
                <div class="card-header">
                    <h3>${task.title}</h3>
                    <div class="card-menu-wrapper">
                        <button class="card-menu-btn">...</button>
                            <div class="card-dropdown hidden">
                                <button class="delete-btn">Delete</button>
                                <button class="edit-btn">Edit</button>
                            </div>
                        </div>
                    </div>
                <p>${task.description}</p>
                <p style="color: ${priorityColor[task.priority]}">Priority: ${task.priority}</p>   
                <p>Due: ${task.dueDate || 'No date'}</p>         

            `;


            card.classList.add('card');
            card.draggable=true;
            card.dataset.id = task.id;
            card.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('taskId', task.id);
            })
            card.querySelector('.delete-btn').addEventListener('click', async () => {
                await fetch(`/tasks/${task.id}`, {
                    method: 'DELETE'
                });
                await loadTasks();
            });
            card.querySelector('.edit-btn').addEventListener('click', () => {
                editingTaskId = task.id;
                document.getElementById('titleInput').value = task.title;
                document.getElementById('descInput').value = task.description;
                document.getElementById('priorityInput').value = task.priority;
                document.getElementById('dueDateInput').value = task.dueDate;
                modalOverlay.style.display = 'flex';
            });

            container.appendChild(card);
        }
    }
}

addBtn.addEventListener('click', () => {
    const quickTitle = document.getElementById('taskInput').value;
    document.getElementById('titleInput').value = quickTitle;
    modalOverlay.style.display = 'flex';
    targetColumn = 'todo';
});

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (editingTaskId) {
        await editTask();
    } else {
        await addTask();
    }
    editingTaskId = null;
    modalOverlay.style.display = 'none';
    taskForm.reset();
    document.getElementById('taskInput').value = '';
    await loadTasks();
});

async function editTask() {
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descInput').value;
    const priority = document.getElementById('priorityInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    await fetch(`/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, dueDate })
    });
}

cancelBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

['todo', 'inprogress', 'done'].forEach(column => {
    const container = document.querySelector(`#${column} .cards-container`);
    const menuBtn = document.querySelector(`#${column} .menu-btn`);
    const dropdown = document.querySelector(`#${column} .column-dropdown`);
    const clearBtn = document.querySelector(`#${column} .clear-btn`);
    const addToColumnBtn = document.querySelector(`#${column} .add-to-column-btn`);


    container.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    menuBtn.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');

    });    
    addToColumnBtn.addEventListener('click', () => {
        targetColumn = column;
        modalOverlay.style.display = 'flex';
        dropdown.classList.add('hidden');
    });

    container.addEventListener('drop', async (event) => {
        const taskId = event.dataTransfer.getData('taskId');
        await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({column: column})
        });
        await loadTasks();
    });

    clearBtn.addEventListener('click', async () => {
        const response = await fetch('/tasks');
        const data = await response.json();
        for (const task of data[column]) {
            await fetch(`/tasks/${task.id}`, { method: 'DELETE' });
        }
        dropdown.classList.toggle('hidden');
        await loadTasks();
    });
});

document.addEventListener('click', (event) => {
    document.querySelectorAll('.column-dropdown').forEach(dropdown => {
        if (!dropdown.closest('.column-menu-wrapper').contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
});

loadTasks();


