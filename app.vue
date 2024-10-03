<template>
  <div class="task-manager-bg d-flex align-items-center justify-content-center min-vh-100">
    <div class="container-fluid p-3 p-md-5">
      <div class="row justify-content-center">
        <div class="col-12 col-xxl-10">
          <div class="bg-white bg-opacity-90 shadow-lg rounded-4 p-4 p-md-5 animate__animated animate__fadeIn">
            <h1 class="mb-5 text-center text-primary fw-bold fs-1">進階任務管理系統</h1>
            
            <!-- 添加任務表單 -->
            <form @submit.prevent="addTask" class="mb-5 bg-light p-4 rounded-4 shadow-sm">
              <div class="row g-4">
                <div class="col-md-4 mb-4">
                  <input v-model="newTask.name" type="text" class="form-control form-control-lg rounded-pill text-center custom-input" placeholder="任務名稱" required>
                </div>
                <div class="col-md-3 mb-4">
                  <select v-model="newTask.priority" class="form-select form-select-lg rounded-pill text-center custom-select" required>
                    <option value="">選擇優先級</option>
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
                <div class="col-md-3 mb-4">
                  <input v-model="newTask.dueDate" type="date" class="form-control form-control-lg rounded-pill text-center custom-input">
                </div>
                <div class="col-md-2 mb-4">
                  <button type="submit" class="btn btn-primary btn-lg w-100 rounded-pill btn-hover-effect custom-btn">
                    <i class="fas fa-plus me-2"></i>添加任務
                  </button>
                </div>
              </div>
            </form>

            <!-- 過濾和排序選項 -->
            <div class="row mb-5 g-4">
              <div class="col-md-4 mb-4">
                <select v-model="filters.priority" class="form-select form-select-lg rounded-pill text-center custom-select">
                  <option value="">所有優先級</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
              <div class="col-md-4 mb-4">
                <select v-model="filters.status" class="form-select form-select-lg rounded-pill text-center custom-select">
                  <option value="">所有狀態</option>
                  <option value="進行中">進行中</option>
                  <option value="已完成">已完成</option>
                </select>
              </div>
              <div class="col-md-4 mb-4">
                <select v-model="sortBy" class="form-select form-select-lg rounded-pill text-center custom-select">
                  <option value="name">按名稱排序</option>
                  <option value="priority">按優先級排序</option>
                  <option value="dueDate">按截止日期排序</option>
                </select>
              </div>
            </div>

            <!-- 任務列表 -->
            <div class="table-responsive">
              <table class="table table-hover custom-table">
                <thead class="table-light">
                  <tr>
                    <th class="text-center py-3 fs-5">任務名稱</th>
                    <th class="text-center py-3 fs-5">優先級</th>
                    <th class="text-center py-3 fs-5">截止日期</th>
                    <th class="text-center py-3 fs-5">狀態</th>
                    <th class="text-center py-3 fs-5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in filteredAndSortedTasks" :key="task.id" 
                      :class="{'table-success': task.status === '已完成'}"
                      class="animate__animated animate__fadeIn">
                    <td class="text-center py-4 fs-5">{{ task.name }}</td>
                    <td class="text-center py-4">
                      <span class="badge rounded-pill fs-6 custom-badge" :class="priorityClass(task.priority)">{{ task.priority }}</span>
                    </td>
                    <td class="text-center py-4 fs-5">{{ task.dueDate || '無' }}</td>
                    <td class="text-center py-4">
                      <span class="badge rounded-pill fs-6 custom-badge" :class="statusClass(task.status)">{{ task.status }}</span>
                    </td>
                    <td class="text-center py-4">
                      <button class="btn btn-outline-success me-2 rounded-circle btn-hover-effect custom-btn-circle" @click="completeTask(task.id)" :title="task.status === '進行中' ? '標記為完成' : '標記為進行中'">
                        <i class="fas" :class="task.status === '進行中' ? 'fa-check' : 'fa-undo'"></i>
                      </button>
                      <button class="btn btn-outline-info me-2 rounded-circle btn-hover-effect custom-btn-circle" @click="editTask(task.id)" title="編輯任務">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger rounded-circle btn-hover-effect custom-btn-circle" @click="deleteTask(task.id)" title="刪除任務">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  setup() {
    const tasks = ref([])
    const newTask = ref({
      name: '',
      priority: '',
      dueDate: '',
    })
    const filters = ref({
      priority: '',
      status: '',
    })
    const sortBy = ref('name')

    const loadTasks = () => {
      if (process.client) {
        const savedTasks = localStorage.getItem('tasks')
        if (savedTasks) {
          tasks.value = JSON.parse(savedTasks)
        }
      }
    }

    const saveTasks = () => {
      if (process.client) {
        localStorage.setItem('tasks', JSON.stringify(tasks.value))
      }
    }

    onMounted(() => {
      loadTasks()
    })

    watch(tasks, () => {
      saveTasks()
    }, { deep: true })

    const filteredAndSortedTasks = computed(() => {
      let filteredTasks = tasks.value

      if (filters.value.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === filters.value.priority)
      }
      if (filters.value.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.value.status)
      }

      filteredTasks.sort((a, b) => {
        if (sortBy.value === 'name') return a.name.localeCompare(b.name)
        if (sortBy.value === 'priority') return b.priority.localeCompare(a.priority)
        if (sortBy.value === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate)
      })

      return filteredTasks
    })

    const addTask = () => {
      const task = {
        id: Date.now(),
        name: newTask.value.name,
        priority: newTask.value.priority,
        dueDate: newTask.value.dueDate,
        status: '進行中',
      }
      tasks.value.push(task)
      newTask.value = { name: '', priority: '', dueDate: '' }
    }

    const completeTask = (id) => {
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.status = task.status === '���行中' ? '已完成' : '進行中'
      }
    }

    const editTask = (id) => {
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        const newName = prompt('編輯任務名稱', task.name)
        if (newName !== null) {
          task.name = newName
        }
      }
    }

    const deleteTask = (id) => {
      if (confirm('確定要刪除這個任務嗎？')) {
        tasks.value = tasks.value.filter(t => t.id !== id)
      }
    }

    const priorityClass = (priority) => {
      return {
        '高': 'bg-danger',
        '中': 'bg-warning',
        '低': 'bg-info',
      }[priority] || 'bg-secondary'
    }

    const statusClass = (status) => {
      return status === '已完成' ? 'bg-success' : 'bg-primary'
    }

    return {
      tasks,
      newTask,
      filters,
      sortBy,
      filteredAndSortedTasks,
      addTask,
      completeTask,
      editTask,
      deleteTask,
      priorityClass,
      statusClass,
    }
  }
}
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';

body {
  background-color: #f0f0f0;
}

.task-manager-bg {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-input, .custom-select {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  height: 65px;
  font-size: 1.2rem;
  border-radius: 32.5px;
}

.custom-input:focus, .custom-select:focus {
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.custom-btn {
  background: linear-gradient(45deg, #4a90e2, #5cb3ff);
  border: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 65px;
  font-size: 1.2rem;
  border-radius: 32.5px;
}

.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0,0,0,0.15);
}

.custom-badge {
  font-size: 1.1rem;
  padding: 0.7em 1.2em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 20px;
}

.custom-table {
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 25px;
  overflow: hidden;
}

.custom-table th, .custom-table td {
  text-align: center;
  vertical-align: middle;
}

.custom-table th {
  background-color: #f8f9fa;
  border-top: none;
}

.custom-btn-circle {
  width: 52px;
  height: 52px;
  padding: 0;
  line-height: 52px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 1.3rem;
  border-radius: 26px;
}

.btn-hover-effect {
  transition: all 0.3s ease;
}

.btn-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* 自定義動畫 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate__fadeIn {
  animation: fadeIn 0.5s ease-in;
}

/* 自定義滾動條 */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 新增：置中輸入框和下拉選單的文字 */
.form-control, .form-select {
  text-align: center;
  text-align-last: center;
}

/* 新增：修復 Firefox 中下拉選單文字不居中的問題 */
@-moz-document url-prefix() {
  .form-select {
    text-align: -moz-center;
  }
}

/* 新增：確保內容不會超出容器 */
.table-responsive {
  overflow-x: auto;
  max-width: 100%;
}

/* 新增：調整小屏幕上的間距 */
@media (max-width: 768px) {
  .container-fluid {
    padding: 1rem;
  }
  
  .custom-input, .custom-select, .custom-btn {
    height: 55px;
    font-size: 1.1rem;
  }
}

/* 新增：增加表格行的間距 */
.table tbody tr {
  border-bottom: 15px solid #ffffff;
}

/* 新增：增加表格單元格的內邊距 */
.table td, .table th {
  padding: 1.8rem;
}

/* 新增：表格行的圓角效果 */
.table tbody tr {
  border-radius: 25px;
  overflow: hidden;
}

.table tbody tr td:first-child {
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
}

.table tbody tr td:last-child {
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
}

/* 新增：整體容器的圓角效果 */
.bg-white {
  border-radius: 30px;
}

/* 新增：表單背景的圓角效果 */
form.bg-light {
  border-radius: 25px;
}
</style>