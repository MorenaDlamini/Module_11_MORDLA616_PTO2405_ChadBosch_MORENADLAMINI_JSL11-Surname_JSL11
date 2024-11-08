import { initialData } from './initialData.js';
import { getTasks, createNewTask, patchTask, deleteTask as removeTaskInstance } from './utils/taskFunctions.js';

// Initialize data in localStorage if not already present
function initializeData() {
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify(initialData));
    }
    if (!localStorage.getItem('showSideBar')) {
        localStorage.setItem('showSideBar', 'true');
    }
    if (!localStorage.getItem('light-theme')) {
        localStorage.setItem('light-theme', 'disabled');
    }
    if (!localStorage.getItem('activeBoard')) {
        const tasks = getTasks();
        const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
        localStorage.setItem('activeBoard', JSON.stringify(boards[0] || ''));
    }
}

// DOM elements
const elements = {
    headerBoardName: document.getElementById('header-board-name'),
    boardsContainer: document.getElementById('boards-nav-links-div'),
    todoColumn: document.querySelector('.column-div[data-status="todo"] .tasks-container'),
    doingColumn: document.querySelector('.column-div[data-status="doing"] .tasks-container'),
    doneColumn: document.querySelector('.column-div[data-status="done"] .tasks-container'),
    modalWindow: document.getElementById('new-task-modal-window'),
    editTaskModal: document.querySelector('.edit-task-modal-window'),
    filterDiv: document.getElementById('filterDiv'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    themeSwitch: document.getElementById('switch'),
    createNewTaskBtn: document.getElementById('add-new-task-btn'),
    createTaskBtn: document.getElementById('create-task-btn'),
    cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
    saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    deleteTaskBtn: document.getElementById('delete-task-btn')
};

let activeBoard = "";

// Fetch and display boards and tasks
function fetchAndDisplayBoardsAndTasks() {
    const tasks = getTasks();
    const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
    displayBoards(boards);

    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0] || '';
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
}

// Display boards in sidebar
function displayBoards(boards) {
    elements.boardsContainer.innerHTML = '';
    boards.forEach(board => {
        const boardElement = document.createElement("button");
        boardElement.textContent = board;
        boardElement.classList.add("board-btn");
        boardElement.addEventListener('click', () => {
            elements.headerBoardName.textContent = board;
            filterAndDisplayTasksByBoard(board);
            activeBoard = board;
            localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
            styleActiveBoard(activeBoard);
        });
        elements.boardsContainer.appendChild(boardElement);
    });
}

// Filter and display tasks by board
function filterAndDisplayTasksByBoard(boardName) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.board === boardName);

    ['todo', 'doing', 'done'].forEach(status => {
        const column = document.querySelector(`.column-div[data-status="${status}"] .tasks-container`);
        column.innerHTML = ''; // Clear the column

        filteredTasks
            .filter(task => task.status === status)
            .forEach(task => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("task-div");
                taskElement.textContent = task.title;
                taskElement.dataset.taskId = task.id;

                taskElement.addEventListener('click', () => openEditTaskModal(task));
                column.appendChild(taskElement);
            });
    });
}

// Open the edit task modal and populate it with task data
function openEditTaskModal(task) {
    elements.editTaskModal.style.display = 'block';
    document.getElementById('edit-task-title-input').value = task.title;
    document.getElementById('edit-task-desc-input').value = task.description;
    document.getElementById('edit-select-status').value = task.status;

    elements.saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id);
    elements.deleteTaskBtn.onclick = () => removeTask(task.id);
    elements.cancelEditBtn.onclick = closeEditTaskModal;
}

// Save task changes
function saveTaskChanges(taskId) {
    const updatedTitle = document.getElementById('edit-task-title-input').value;
    const updatedDesc = document.getElementById('edit-task-desc-input').value;
    const updatedStatus = document.getElementById('edit-select-status').value;

    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].title = updatedTitle;
        tasks[taskIndex].description = updatedDesc;
        tasks[taskIndex].status = updatedStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTasksUI();
        closeEditTaskModal();
    }
}

// Delete a task
function removeTask(taskId) {
    const tasks = getTasks().filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTasksUI();
    closeEditTaskModal();
}

// Close the edit task modal
function closeEditTaskModal() {
    elements.editTaskModal.style.display = 'none';
}

// Refresh the UI with the latest task data
function refreshTasksUI() {
    filterAndDisplayTasksByBoard(activeBoard);
}

// Style the active board
function styleActiveBoard(boardName) {
    document.querySelectorAll('.board-btn').forEach(btn => { 
        if (btn.textContent === boardName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Toggle sidebar visibility
function toggleSidebar(show) {
    const sidebar = document.getElementById('side-bar-div');
    const showSidebarBtn = elements.showSideBarBtn;

    sidebar.style.display = show ? 'block' : 'none';
    showSidebarBtn.style.display = show ? 'none' : 'block';
    localStorage.setItem('showSideBar', show.toString());
}

// Toggle the modal for adding new tasks
function toggleModal(show) {
    elements.modalWindow.style.display = show ? 'block' : 'none';
}

// Function to add a new task to local storage and update UI
function addNewTask() {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('desc-input').value;
    const status = document.getElementById('select-status').value;

    if (title) {
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            status,
            board: activeBoard
        };

        const tasks = getTasks();
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        refreshTasksUI();
        toggleModal(false);
    }
}

// Toggle theme between light and dark
function toggleTheme() {
    const isLightTheme = document.body.classList.toggle('light-theme');
    localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

// Set up event listeners
function setupEventListeners() {
    elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
    elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
    elements.themeSwitch.addEventListener('change', toggleTheme);
    elements.createNewTaskBtn.addEventListener('click', () => toggleModal(true));
    elements.createTaskBtn.addEventListener('click', addNewTask);
    elements.cancelAddTaskBtn.addEventListener('click', () => toggleModal(false));
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();

    const showSidebar = JSON.parse(localStorage.getItem('showSideBar')) !== false;
    toggleSidebar(showSidebar);

    const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
    document.body.classList.toggle('light-theme', isLightTheme);

    fetchAndDisplayBoardsAndTasks(); 
});
