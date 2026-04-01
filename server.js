const express = require('express');
const fs = require('fs'); 
const path = require('path'); 

const app = express(); 
const PORT = 3000; 

app.use(express.json()); 
app.use(express.static(__dirname));

//helper fuctions for tasks.json
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

function readTasks() {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
}

    function writeTasks(data){
    fs.writeFileSync(TASKS_FILE,JSON.stringify(data,null,2));
}


//API endpoints

app.get('/tasks', (req, res) => {
    const data = readTasks();
    res.json(data);
});

app.post('/tasks', (req, res) => {  //using a database would be better here but i dont know how to use postgreSQL or MongoDB yet.
    const data = readTasks();
    const newTask = {
        id: Date.now(),
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        column: req.body.column
    }
    data[newTask.column].push(newTask);
    writeTasks(data);
    res.status(201).json(newTask)
});

app.put('/tasks/:id', (req,res) => {
    const data = readTasks();
    const id = Number(req.params.id);
    let foundColumn = null;
    let foundTask = null;
    for (const column in data){
         const task = data[column].find(t => t.id === id);
         if (task){
            foundColumn = column;
            foundTask = task;
            break;
         }
    }
    if (!foundTask){
        return res.status(404).json({message : 'Task not found'});
    }
    if (req.body.column && req.body.column !== foundColumn){
        data[foundColumn] = data[foundColumn].filter(t => t.id !== id);
        data[req.body.column].push(foundTask);
        foundColumn = req.body.column;
    }
    foundTask.title = req.body.title || foundTask.title
    foundTask.description = req.body.description || foundTask.description
    foundTask.priority = req.body.priority || foundTask.priority
    foundTask.dueDate = req.body.dueDate || foundTask.dueDate
    foundTask.column = req.body.column || foundTask.column

    writeTasks(data);
    res.json(foundTask);
});

app.delete('/tasks/:id', (req, res) =>{
    const data = readTasks();
    const id = Number(req.params.id);
    let foundColumn = null;
    let foundTask = null;
    for (const column in data){
        const task = data[column].find(t => t.id === id);
        if (task){
            foundColumn = column;
            foundTask = task;
            break;
        }
    }
    if (!foundTask){
        return res.status(404).json({message : 'Task not found'});
    }
    data[foundColumn] = data[foundColumn].filter(t => t.id !== id);
    writeTasks(data);
    res.json(foundTask);
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})