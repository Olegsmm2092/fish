const socket = new WebSocket('ws://172.27.158.125:3000');

function sendMessage(e) {
    e.preventDefault();
    const input = document.querySelector('input'); // parsing tag `input`
    // validate if input has value
    if (input.value) {
        socket.send(input.value);
        input.value = ""; // reset
    }
    input.focus();
}

document.querySelector('form') // get the form element
    .addEventListener('submit', sendMessage); // listen for form submission

// Listen for messages
socket.addEventListener("message", ({ data }) => { // if message got data
    const li = document.createElement('li'); // create li element
    li.textContent = data; // set the text content to the received data
    document.querySelector('ul').appendChild(li); // append the li element to the ul
});

// Add connection status indicators
socket.addEventListener('open', () => {
    console.log('Connected to server');
    const status = document.createElement('li');
    status.textContent = 'Connected to server';
    status.className = 'status';
    document.querySelector('ul').appendChild(status);
});

socket.addEventListener('close', () => {
    console.log('Disconnected from server');
    const status = document.createElement('li');
    status.textContent = 'Disconnected from server';
    status.className = 'status';
    document.querySelector('ul').appendChild(status);
});

socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
    const status = document.createElement('li');
    status.textContent = 'Connection error';
    status.className = 'status error';
    document.querySelector('ul').appendChild(status);
});
