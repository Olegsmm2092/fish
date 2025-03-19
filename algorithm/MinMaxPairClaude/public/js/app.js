const socket = io();

document.getElementById('findPairsBtn').addEventListener('click', sendInput);

function sendInput() {
  const input = document.getElementById('arrayInput').value.trim();
  const array = input.split(',').map(x => parseInt(x.trim()));

  if (array.some(isNaN)) {
    showNotification('Invalid input! Use comma-separated integers.', false);
    return;
  }

  socket.emit('processInput', { array });
}

socket.on('result', (result) => {
  updateResults(result);
  updateLastUpdated();
  showNotification('Pairs found successfully!', true);
});

socket.on('error', (message) => {
  showNotification(message, false);
});

function updateResults(result) {
  // Min difference row
  document.getElementById('minIndices').textContent = result.min.indices.join(', ');
  document.getElementById('minValues').textContent = result.min.values.join(', ');
  document.getElementById('minDifference').textContent = result.min.difference;

  // Max difference row
  document.getElementById('maxIndices').textContent = result.max.indices.join(', ');
  document.getElementById('maxValues').textContent = result.max.values.join(', ');
  document.getElementById('maxDifference').textContent = result.max.difference;
}

function updateLastUpdated() {
  const now = new Date().toLocaleString();
  document.getElementById('lastUpdated').textContent = `Last updated: ${now}`;
}

function showNotification(message, isSuccess) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('hidden', 'success');
  if (isSuccess) notification.classList.add('success');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}