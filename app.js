document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const errorMessage = document.getElementById('errorMessage');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const editModal = document.getElementById('editModal');
    const editInput = document.getElementById('editInput');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveEdit = document.getElementById('saveEdit');
    
    let tasks = [];
    let currentFilter = 'all';
    let currentEditId = null;
    
     function init() {
        loadTasks();
        renderTasks();
        setupEventListeners();
    }
    
    // Load tasks from local storage
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }
    
    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCount();
    }
    
    // Update task counter
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
     }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = [];
        
        switch(currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = [...tasks];
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'py-4 px-6 text-gray-400 text-center';
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet!' : `No ${currentFilter} tasks!`;
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
        
        updateTaskCount();
    }
    
    // Create a task element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `group py-3 px-6 hover:bg-gray-700 transition flex items-center ${task.completed ? 'opacity-70' : ''}`;
        li.dataset.id = task.id;
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'mr-3 h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        
        // Task text
        const span = document.createElement('span');
        span.className = `flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`;
        span.textContent = task.text;
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'ml-2 text-gray-400 hover:text-blue-400 transition opacity-0 group-hover:opacity-100';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(task.id);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'ml-2 text-gray-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        
        return li;
    }
    
    // Add a new task
    function addTask(text) {
        if (!text.trim()) {
            errorMessage.classList.remove('hidden');
            return;
        }
        
        errorMessage.classList.add('hidden');
        
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }
    
    // Toggle task completion status
    function toggleTaskCompletion(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }
    
    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
    
    // Open edit modal
    function openEditModal(id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            currentEditId = id;
            editInput.value = task.text;
            editModal.classList.remove('hidden');
            editInput.focus();
        }
    }
    
    // Save edited task
    function saveEditedTask() {
        if (!editInput.value.trim()) {
            return;
        }
        
        tasks = tasks.map(task => 
            task.id === currentEditId ? { ...task, text: editInput.value.trim() } : task
        );
        
        saveTasks();
        renderTasks();
        closeEditModal();
    }
    
    // Close edit modal
    function closeEditModal() {
        editModal.classList.add('hidden');
        currentEditId = null;
        editInput.value = '';
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add task form
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTask(taskInput.value);
        });
        
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.dataset.filter;
                renderTasks();
            });
        });
        
        // Edit modal
        cancelEdit.addEventListener('click', closeEditModal);
        saveEdit.addEventListener('click', saveEditedTask);
        
        // Close modal when clicking outside
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
                closeEditModal();
            }
        });
        
        // Save edit with Enter key
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEditedTask();
            }
        });
    }
    
    // Initialize the app
    init();
});