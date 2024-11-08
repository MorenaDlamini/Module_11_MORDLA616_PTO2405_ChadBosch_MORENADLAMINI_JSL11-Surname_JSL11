// utils/taskFunctions.js

// Retrieve tasks from localStorage or fallback to initialData
export const getTasks = () => {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [...initialData];
};

// Save tasks to localStorage
const saveTasks = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Create a new task
export const createNewTask = (task) => {
  const tasks = getTasks();
  const newTask = { ...task, id: Date.now() };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

// Update a task with new data
export const patchTask = (id, updates) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex > -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks(tasks);
  }
  return tasks;
};

// Delete a task
export const deleteTask = (id) => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== id);
  saveTasks(updatedTasks);
  return updatedTasks;
};
