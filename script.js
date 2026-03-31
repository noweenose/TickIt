const addBtn = document.getElementById('addBtn');
const modalOverlay = document.getElementById('modal-overlay');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');


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
        body: JSON.stringify({title, description, priority, dueDate, column: 'todo'})
    });
}

function renderTasks(data){
    for (const column in data){ 
        const container = document.querySelector(`#${column} .cards-container`)
        container.innerHTML = '';
        for(const task of data[column]){
            const card = document.createElement('div');
            card.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Priority: ${task.priority}</p>
                <p>Due: ${task.dueDate}</p>
            `;
            card.classList.add('card');
            container.appendChild(card);
        }
    }
}


addBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
});

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask();
    modalOverlay.style.display = 'none';
    taskForm.reset();
    await loadTasks();
});


cancelBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

loadTasks();
