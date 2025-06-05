<script>
export default {
  name: 'TaskList',
  props: {
    tasks: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <div class="task-list">
    <h3>Tasks:</h3>
    <ul>
      <li v-for="task in tasks" :key="task">{{ task }}</li>
    </ul>
  </div>
</template>

<style scoped>
.task-list {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  border-bottom: 1px solid #eee;
}
</style>
