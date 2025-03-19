// Tab switching
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.remove('active');
    }
  
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
      tabButtons[i].classList.remove('active');
    }
  
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
  }
  
  // WebSocket setup
  const socket = io();
  
  socket.on('result', (result) => {
    const output = document.getElementById('output');
    output.textContent = `${result.minIndices[0]} ${result.minIndices[1]}\n${result.maxIndices[0]} ${result.maxIndices[1]}`;
  });
  
  function sendInput() {
    const n = parseInt(document.getElementById('n').value);
    const elementsInput = document.getElementById('elements').value.trim();
    const elements = elementsInput.split(' ').map(Number);
  
    if (isNaN(n) || n < 2 || elements.length !== n || elements.some(isNaN)) {
      document.getElementById('output').textContent = 'Invalid input! Ensure n matches the number of elements and all are numbers.';
      return;
    }
  
    socket.emit('processInput', { n, elements });
  }
  
  // Set default active tab
  document.getElementsByClassName('tab-button')[0].classList.add('active');
  document.getElementsByClassName('tab-content')[0].classList.add('active');