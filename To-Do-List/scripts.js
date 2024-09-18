document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    updateWeeklySummary();
});

function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value;
    const daySelect = document.getElementById('day-select');
    const day = daySelect.value;

    if (taskText === '') return;

    const taskList = document.getElementById(`tasks-${day}`);

    const taskItem = document.createElement('li');
    taskItem.textContent = taskText;

    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.onclick = function() {
        completeTask(taskItem, day);
    };

    taskItem.appendChild(completeButton);
    taskList.appendChild(taskItem);

    saveTask(day, taskText);
    taskInput.value = '';
    updateWeeklySummary();
}

function completeTask(taskItem, day) {
    taskItem.classList.add('completed');
    taskItem.querySelector('button').remove();
    saveCompletedTask(day, taskItem.textContent);
    updateWeeklySummary();
}

function saveTask(day, task) {
    let tasks = JSON.parse(localStorage.getItem(`tasks-${day}`)) || [];
    tasks.push({ text: task, completed: false });
    localStorage.setItem(`tasks-${day}`, JSON.stringify(tasks));
}

function saveCompletedTask(day, task) {
    let tasks = JSON.parse(localStorage.getItem(`tasks-${day}`)) || [];
    tasks = tasks.map(t => t.text === task ? { ...t, completed: true } : t);
    localStorage.setItem(`tasks-${day}`, JSON.stringify(tasks));
}

function loadTasks() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    days.forEach(day => {
        const taskList = document.getElementById(`tasks-${day}`);
        const tasks = JSON.parse(localStorage.getItem(`tasks-${day}`)) || [];
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.textContent = task.text;

            if (task.completed) {
                taskItem.classList.add('completed');
            } else {
                const completeButton = document.createElement('button');
                completeButton.textContent = 'Complete';
                completeButton.onclick = function() {
                    completeTask(taskItem, day);
                };
                taskItem.appendChild(completeButton);
            }

            taskList.appendChild(taskItem);
        });
    });
}

function updateWeeklySummary() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let totalCompleted = 0;
    let totalPending = 0;

    days.forEach(day => {
        const tasks = JSON.parse(localStorage.getItem(`tasks-${day}`)) || [];
        totalCompleted += tasks.filter(task => task.completed).length;
        totalPending += tasks.length - tasks.filter(task => task.completed).length;
    });

    const totalTasks = totalCompleted + totalPending;
    const completedPercentage = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(2) : 0;
    const pendingPercentage = totalTasks > 0 ? ((totalPending / totalTasks) * 100).toFixed(2) : 0;

    const ctx = document.getElementById('weekly-summary').getContext('2d');
    if (window.weeklySummaryChart) {
        window.weeklySummaryChart.destroy(); // Destroy previous instance of chart
    }
    window.weeklySummaryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [totalCompleted, totalPending],
                backgroundColor: ['#28a745', '#dc3545'],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += context.raw.toLocaleString();
                            label += ` (${context.raw === totalCompleted ? completedPercentage : pendingPercentage}%)`;

                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        // Change label colors here
                        fontColor: ['#28a745', '#dc3545'],
                    },
                }
            }
        }
    });

    // Add refresh button functionality
    const refreshButton = document.querySelector('.refresh-button');
    refreshButton.addEventListener('click', function() {
        refreshData();
    });
}

function refreshData() {
    localStorage.clear(); // Clear all stored tasks
    const taskContainers = document.querySelectorAll('.day-section ul');
    taskContainers.forEach(container => {
        container.innerHTML = ''; // Clear task lists
    });
    updateWeeklySummary(); // Update the weekly summary chart
}
