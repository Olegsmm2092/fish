import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { matrix, maxPathSum, calculatePathSum, type CellPosition } from "./path-calculator";
import { pathStorage } from "./storage";

// Calculate the max path sum and path once at server startup
const { maxSum, path } = maxPathSum(matrix);
pathStorage.storePath(path, maxSum);

// Track connected clients to avoid duplicate operations
const clients = new Set<WebSocket>();

// Helper function to safely send a message to a client
function safelySend(ws: WebSocket, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
}

// WebSocket message handler
function handleMessage(ws: WebSocket, message: string) {
  try {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'init':
        // Check if a custom matrix was provided
        if (data.matrix) {
          const customMatrix = data.matrix;
          // Calculate new path based on custom matrix
          const { maxSum, path } = maxPathSum(customMatrix);
          // Store the new path in the storage
          pathStorage.storePath(path, maxSum);
          pathStorage.setCurrentStep(0);
          
          // Return the custom path and total sum
          safelySend(ws, {
            type: 'init_response',
            data: {
              path: pathStorage.getPath(),
              totalSum: pathStorage.getMaxSum()
            }
          });
          
          // Also send initial path update
          safelySend(ws, {
            type: 'path_update',
            data: {
              currentStep: 0,
              currentPosition: path[0],
              currentSum: customMatrix[0][0],
              totalSum: maxSum,
              isComplete: path.length <= 1
            }
          });
        } else {
          // Return the existing path and total sum
          safelySend(ws, {
            type: 'init_response',
            data: {
              path: pathStorage.getPath(),
              totalSum: pathStorage.getMaxSum()
            }
          });
        }
        break;
        
      case 'next_step':
        // Move to the next step in the path
        const currentStep = pathStorage.getCurrentStep();
        const pathData = pathStorage.getPath();
        
        if (currentStep < pathData.length - 1) {
          const nextStep = currentStep + 1;
          pathStorage.setCurrentStep(nextStep);
          
          const currentSum = calculatePathSum(matrix, pathData, nextStep);
          const isComplete = nextStep >= pathData.length - 1;
          
          // Broadcast update to all connected clients
          clients.forEach(client => {
            safelySend(client, {
              type: 'path_update',
              data: {
                currentStep: nextStep,
                currentPosition: pathData[nextStep],
                currentSum,
                totalSum: pathStorage.getMaxSum(),
                isComplete
              }
            });
          });
        }
        break;
        
      case 'reset':
        // Reset the current step back to 0
        pathStorage.setCurrentStep(0);
        const initialSum = matrix[0][0]; // Sum of first cell
        
        // Broadcast reset to all connected clients
        clients.forEach(client => {
          safelySend(client, {
            type: 'path_update',
            data: {
              currentStep: 0,
              currentPosition: pathStorage.getPath()[0],
              currentSum: initialSum,
              totalSum: pathStorage.getMaxSum(),
              isComplete: false
            }
          });
        });
        break;
        
      case 'ping':
        // Respond with a pong to keep the connection alive
        safelySend(ws, { type: 'pong' });
        break;
        
      default:
        console.warn(`Unknown message type: ${data.type}`);
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error);
  }
}

// Ping all clients every 30 seconds to keep connections alive
function startPingInterval(wss: WebSocketServer) {
  const interval = setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.ping();
        } catch (e) {
          console.error('Error sending ping:', e);
        }
      }
    });
  }, 30000);
  
  return interval;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server with ping-pong support
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    // Add WebSocket Server Options
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Below 10 should be good enough for most cases
      concurrencyLimit: 10,
      // Other options settable:
      serverNoContextTakeover: true, // Defaults to negotiated value.
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below is equal to default behavior
      clientMaxWindowBits: 10 // Defaults to negotiated value.
    }
  });
  
  // Start the ping interval
  const pingInterval = startPingInterval(wss);
  
  // Clean up interval when the server closes
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add client to the set
    clients.add(ws);
    
    // Initialize with current state
    const pathData = pathStorage.getPath();
    const currentStep = pathStorage.getCurrentStep();
    const currentSum = calculatePathSum(matrix, pathData, currentStep);
    const isComplete = currentStep >= pathData.length - 1;
    
    safelySend(ws, {
      type: 'path_update',
      data: {
        currentStep,
        currentPosition: pathData[currentStep],
        currentSum,
        totalSum: pathStorage.getMaxSum(),
        isComplete
      }
    });
    
    // Send full path data after initial state
    safelySend(ws, {
      type: 'init_response',
      data: {
        path: pathStorage.getPath(),
        totalSum: pathStorage.getMaxSum()
      }
    });
    
    ws.on('message', (message) => {
      handleMessage(ws, message.toString());
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Remove from the clients set
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Clean up on error
      clients.delete(ws);
    });
    
    // Handle pong response
    ws.on('pong', () => {
      // Client is still alive
      console.log('Received pong from client');
    });
  });
  
  // API route to get matrix data
  app.get('/api/matrix', (req, res) => {
    res.json({ matrix });
  });
  
  // API route to get path data (read-only)
  app.get('/api/path', (req, res) => {
    res.json({
      path: pathStorage.getPath(),
      maxSum: pathStorage.getMaxSum(),
      currentStep: pathStorage.getCurrentStep()
    });
  });
  
  // API route to interact with path data (for when WebSockets fail)
  app.post('/api/path/action', (req, res) => {
    try {
      const { action } = req.body;
      
      switch (action) {
        case 'next_step': {
          const currentStep = pathStorage.getCurrentStep();
          const pathData = pathStorage.getPath();
          
          if (currentStep < pathData.length - 1) {
            const nextStep = currentStep + 1;
            pathStorage.setCurrentStep(nextStep);
            
            const currentSum = calculatePathSum(matrix, pathData, nextStep);
            const isComplete = nextStep >= pathData.length - 1;
            
            return res.json({
              success: true,
              data: {
                currentStep: nextStep,
                currentPosition: pathData[nextStep],
                currentSum,
                totalSum: pathStorage.getMaxSum(),
                isComplete
              }
            });
          }
          
          return res.json({
            success: false,
            error: 'Already at the last step'
          });
        }
        
        case 'reset': {
          pathStorage.setCurrentStep(0);
          const initialSum = matrix[0][0]; // Sum of first cell
          
          return res.json({
            success: true,
            data: {
              currentStep: 0,
              currentPosition: pathStorage.getPath()[0],
              currentSum: initialSum,
              totalSum: pathStorage.getMaxSum(),
              isComplete: false
            }
          });
        }
        
        case 'init': {
          // Check if a custom matrix was provided
          if (req.body.matrix) {
            const customMatrix = req.body.matrix;
            // Calculate new path based on custom matrix
            const { maxSum, path } = maxPathSum(customMatrix);
            // Store the new path in the storage
            pathStorage.storePath(path, maxSum);
            pathStorage.setCurrentStep(0);
            
            return res.json({
              success: true,
              data: {
                path,
                totalSum: maxSum,
                currentStep: 0,
                currentPosition: path[0],
                currentSum: customMatrix[0][0],
                isComplete: path.length <= 1
              }
            });
          } else {
            // Use existing path
            const pathData = pathStorage.getPath();
            const currentStep = pathStorage.getCurrentStep();
            const currentSum = calculatePathSum(matrix, pathData, currentStep);
            const isComplete = currentStep >= pathData.length - 1;
            
            return res.json({
              success: true,
              data: {
                path: pathData,
                totalSum: pathStorage.getMaxSum(),
                currentStep,
                currentPosition: pathData[currentStep],
                currentSum,
                isComplete
              }
            });
          }
        }
        
        default:
          return res.status(400).json({
            success: false,
            error: `Unknown action: ${action}`
          });
      }
    } catch (error) {
      console.error('Error handling API action:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  return httpServer;
}
