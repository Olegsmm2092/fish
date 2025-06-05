<script setup>
import { computed, onMounted, ref } from 'vue'

const name = ref('Butterfly Card')
const status = ref('active') // 'active', 'pending', or 'inactive'
const tasks = ref([{
    question: 'What does === do in JS?',
    answer: 'Compares value and type',
    showAnswers: false
  },
  {
    question: 'What is the output of console.log(typeof null)?',
    answer: 'object',
    showAnswers: false
  }])
const link = ref('https://vuejs.org')
const newTask = ref({
  question:'',
  answer: '',
  showAnswers: false
})
const quizContainer = ref(null);
const loading = ref(false);
const displayedTasks = ref([]);

const toggleStatus = () => {
  if (status.value === 'active') {
    status.value = 'pending'
  } else if (status.value === 'pending') {
    status.value = 'inactive'
  } else {
    status.value = 'active'
  }
}


const addTask = () => {
  // if not current state
  // User put info in the field to Post request
  // Validate to dublicates
  const isDublicate = displayedTasks.value.some(
    task => task.question.trim().toLowerCase() === newTask.value.question.trim().toLowerCase()
  )
  if (newTask.value.question.trim() != '' && newTask.value.answer.trim() && !isDublicate) {
    const task = {
    'question': newTask.value.question,
    'answer': {'answer_a': newTask.value.answer, 'answer_b': null},
    'showAnswers': false}
    displayedTasks.value.push(task)

    // save to JsonDatabase
    newTask.value = {question: '', answer: ''}
  }
}

const removeTask = (index) => {
  displayedTasks.value.splice(index, 1)
}

const toggleAnswer = (index) => {
  displayedTasks.value[index].showAnswers = !displayedTasks.value[index].showAnswers

}

const handleScroll = () => {
  const container = quizContainer.value;
  // if user scroll down catch this event n whats to do; parsing tag; listen event; whats to do;
  if (container && container.scrollTop + container.clientHeight >= container.scrollHeight - 40) {
    console.log('scrolled')
    if (!loading.value && isTasksYet.value) {
      loadMoreTasks();
    }
  }

}

// calculate by len(streamed at len(all data)) by compare
const isTasksYet = computed( () => {
  return displayedTasks.value.length < tasks.value.length;
})

const loadMoreTasks = () => {
  if (loading.value) {
    return;
  }
  loading.value = true;

  // simulate a delay to show t loading indicator
  setTimeout(() => {

    const startIndex = displayedTasks.value.length;
    const endIndex = Math.min(startIndex + 2, tasks.value.length);
    const newTasks = tasks.value.slice(startIndex, endIndex);

    console.log('len displayed tasks:', startIndex)
    console.log('newtasks',newTasks)

    displayedTasks.value.push(...newTasks); // 3 dot to unpack same *
    loading.value = false
  }, 1000);
}

onMounted(async () => {
  try {
    const response = await fetch('data/js easy.json')
    // const url = new URL('https://quizapi.io/api/v1/questions');
    const params = {
      apiKey: 'fuyeRzi0CRxO4gP1jATXCWrI87en5N01V3IX5lKI',
      limit: 10,
      category: 'code',
      tags: 'JavaScript',
      difficulty: 'easy'
    }
    // Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    // const response = await fetch(url)
    const data = await response.json()

    // Assuming you want to extract question titles
    tasks.value = data.map((item) => ({
      question: item.question,
      answer: item.answer, // answers to `url api`
      showAnswers: false
    }))

    // load t first chunk of tasks
    loadMoreTasks();

    // console.log('Fetched questions:', tasks.value)
  } catch (error) {
    console.log('Error fetching questions:', error)
  }
})
</script>

<template>
  <div class="app-container">
    <div class="butterfly-card">
      <h1>{{ name }}</h1>
      <p :class="`status-${status}`">
        <span v-if="status === 'active'">User is active</span>
        <span v-else-if="status === 'pending'">User is pending</span>
        <span v-else>User is inactive</span>
      </p>

      <form @submit.prevent="addTask" class="add-task-form">
        <label for="newTask" class="label-addtask">Add Task</label>

        <div class="form-row">
          <input type="text" id="newTaskQ" class="form-input" name="newTaskQ" v-model="newTask.question" placeholder="Enter your question" />
          <input type="text" id="newTaskA" class="form-input" name="newTaskA" v-model="newTask.answer" placeholder="Enter the answer" />
          <button type="submit" class="btn-newtask">ok</button>
        </div>

      </form>

      <div ref="quizContainer" @scroll="handleScroll" class="task-list">
        <h3>Tasks:</h3>
        <ul>
          <li v-for="(task, index) in displayedTasks" :key="index" class="task-item">
            <div class="task-question">
              <span class="question-text">{{ task.question }}
                <button @click="removeTask(index)" class="btn-remove">x</button>
              </span>
              <div class="task-buttons">
                <button @click="toggleAnswer(index)" class="btn-answer">
                  {{ task.showAnswers ? '-' : '+' }}
                </button>
              </div>
            </div>
            <div v-if="task.showAnswers" class="task-answer">
              <strong>Answer:</strong>
              <ul>
                <li v-for="(answer, index) in task.answer" :key="index" class="answer-item">
                  <!-- add logic in the func like toggle add checker validator to read answer n compare by index if ok not cc color else cc -->
                  <p v-if="answer" @click="$event.target.style.color = $event.target.style.color === 'red' ? 'green': 'red'">
                    <br />
                    <strong>{{ `${index.split('_').slice(-1)}` }}:</strong>
                     {{ answer }}
                  </p>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div class="footer-actions">
        <div v-if="loading" class="loading-start">
          <p>Loading more tasks ...</p>
        </div>
        <div v-if="!isTasksYet && displayedTasks.length > 0" class="loading-done">
          <p>Y're reached t end of the task!</p>
        </div>
        <a :href="link" target="_blank" class="link">Vue.js Documentation</a>
        <button @click="toggleStatus" class="btn">Change Status</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Font */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.app-container {
  font-family: 'Poppins', sans-serif;
  padding: 40px;
  background: linear-gradient(135deg, #e8f4f8 0%, #f8fbff 50%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.butterfly-card {
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  animation: butterflyEntrance 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2a9063, #4ade80);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 25px 0;
  animation: fadeInSlideUp 0.8s ease-out 0.2s both;
}

h3 {
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2a9063, #4ade80);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 30px 0 20px 0;
  text-align: left;
  animation: fadeInSlideUp 0.8s ease-out 0.2s both;
}

/* Status badge improvements */
.status-active,
.status-pending,
.status-inactive {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.status-active {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.status-pending {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.status-inactive {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

/* Form Styling */
.add-task-form {
  background: rgba(42, 144, 99, 0.03);
  padding: 25px;
  border-radius: 15px;
  margin: 25px 0;
  border: 1px solid rgba(42, 144, 99, 0.1);
}

.label-addtask {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2a9063, #4ade80);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  text-align: left;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.form-row:last-child {
  justify-content: center;
  margin-top: 20px;
}

.input-label {
  min-width: 80px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  font-size: 0.95rem;
}

.form-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 16px;
  border: 2px solid rgba(42, 144, 99, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #374151;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.btn-newtask {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 5px 6px;
  font-weight: 400;
  font-size: 0.9rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}

.btn-newtask:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

/* Tasks Styling */
.task-list {
  text-align: left;
  margin: 30px 0;
  height: 500px;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  background: rgba(42, 144, 99, 0.05);
  margin-bottom: 15px;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #10b981;
  transition: all 0.3s ease;
  animation: slideInLeft 0.6s ease-out forwards;
}

.task-item:hover {
  background: rgba(42, 144, 99, 0.08);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(42, 144, 99, 0.15);
}

.task-question {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 10px;
}

.question-text {
  flex: 1;
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
}

.task-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-answer,
.btn-remove {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 6px 12px;
  font-weight: 500;
  font-size: 0.85rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}

.btn-remove {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.btn-answer:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-remove:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.task-answer {
  padding: 15px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.task-answer strong {
  color: #059669;
}

/* Footer Actions */
.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  padding: 8px 0;
}

.link:hover {
  color: #2a9063;
  border-bottom-color: rgba(42, 144, 99, 0.3);
}

/* Main Button */
.btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px 28px;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.btn:active {
  transform: translateY(0);
}

/* Animations */
@keyframes fadeInSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .input-label {
    min-width: auto;
    margin-bottom: 5px;
  }

  .task-question {
    flex-direction: column;
    gap: 10px;
  }

  .task-buttons {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 15px;
  }

  .butterfly-card {
    padding: 30px 25px;
  }

  .add-task-form {
    padding: 20px;
  }

  h1 {
    font-size: 1.8rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  .task-item {
    padding: 16px;
  }

  .btn {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.btn:focus,
.btn-newtask:focus,
.btn-answer:focus,
.btn-remove:focus,
.form-input:focus,
.link:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
</style>
