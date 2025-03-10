const WebSocket = require('ws');

// Create a WebSocket server listening on port 3000 on all interfaces
const wss = new WebSocket.Server({ 
    host: '0.0.0.0',  // Listen on all interfaces
    port: 3000 
});

console.log('WebSocket server starting on 0.0.0.0:3000');

// Store all connected clients
const clients = new Set();

// Handle new connections
wss.on('connection', (ws, req) => {
    // Add the client to our set
    clients.add(ws);
    console.log(`Client connected from ${req.socket.remoteAddress}`);
    
    // Send welcome message
    ws.send('Welcome to the chat!');
    
    // Handle messages from this client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Broadcast the message to all clients
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

wss.on('error', (error) => {
    console.error('Server error:', error);
});

console.log('WebSocket server started on 0.0.0.0:3000');
