document.addEventListener('DOMContentLoaded', () => {
    // 更新日期显示
    const dateElement = document.querySelector('.date');
    dateElement.textContent = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    // 获取DOM元素
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTask');
    const tasksList = document.getElementById('tasksList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // 从localStorage加载任务
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // 添加日历相关变量
    const currentMonth = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const calendarDays = document.getElementById('calendarDays');
    let currentDate = new Date();

    // 添加任务
    function addTask(text) {
        const task = {
            id: Date.now(),
            text,
            completed: false
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    // 删除任务
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // 切换任务完成状态
    function toggleTask(id) {
        tasks = tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        );
        saveTasks();
        renderTasks();
    }

    // 保存任务到localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 渲染任务列表
    function renderTasks(filter = 'all') {
        let filteredTasks = tasks;
        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        tasksList.innerHTML = '';
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-content">${task.text}</div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="toggleTask(${task.id})">
                        ${task.completed ? '取消完成' : '完成'}
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
                </div>
            `;
            tasksList.appendChild(taskElement);
        });
    }

    // 渲染日历
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // 更新月份显示
        currentMonth.textContent = `${year}年${month + 1}月`;
        
        // 获取月份的第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取上个月的天数
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // 计算日历开始和结束日期
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let calendarHTML = '';
        
        // 添加上个月的日期
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        // 添加当前月份的日期
        for (let day = 1; day <= totalDays; day++) {
            const currentDay = new Date(year, month, day);
            const isToday = isSameDay(currentDay, new Date());
            const completedTasks = getCompletedTasksForDate(currentDay);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}">
                    ${day}
                    ${completedTasks > 0 ? `<div class="task-count">${completedTasks}完成</div>` : ''}
                </div>
            `;
        }
        
        // 添加下个月的日期
        const remainingDays = 42 - (startDay + totalDays); // 6行7列 = 42个格子
        for (let day = 1; day <= remainingDays; day++) {
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        calendarDays.innerHTML = calendarHTML;
    }

    // 检查是否是同一天
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // 获取指定日期完成的任务数量
    function getCompletedTasksForDate(date) {
        return tasks.filter(task => {
            const taskDate = new Date(task.id);
            return task.completed && isSameDay(taskDate, date);
        }).length;
    }

    // 月份导航事件监听
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // 事件监听器
    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (text) {
            addTask(text);
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = taskInput.value.trim();
            if (text) {
                addTask(text);
            }
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    // 将函数暴露到全局作用域
    window.deleteTask = deleteTask;
    window.toggleTask = toggleTask;

    // 修改任务相关函数，使其在任务状态改变时更新日历
    const originalRenderTasks = renderTasks;
    renderTasks = function(filter = 'all') {
        originalRenderTasks(filter);
        renderCalendar(currentDate);
    };

    // 初始渲染
    renderTasks();

    // 初始化日历
    renderCalendar(currentDate);
}); 