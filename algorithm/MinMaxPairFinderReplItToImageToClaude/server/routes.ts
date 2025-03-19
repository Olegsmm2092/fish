import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { ArrayData, PairResult, ServerMessage } from "@shared/schema";

// Compute the pair with minimum difference
function computeMinPair(arr: number[]): [number, number] {
  const n = arr.length;
  const minLeft: Array<{ value: number; index: number }> = new Array(n);
  minLeft[0] = { value: arr[0], index: 0 };
  
  for (let j = 1; j < n; j++) {
    if (arr[j] < minLeft[j-1].value) {
      minLeft[j] = { value: arr[j], index: j };
    } else {
      minLeft[j] = minLeft[j-1];
    }
  }

  let minDiff = Infinity;
  let bestI = -1, bestJ = -1;
  
  for (let j = 1; j < n; j++) {
    const iInfo = minLeft[j-1];
    const currentDiff = arr[j] - iInfo.value; // Note: flipped the subtraction order to find min positive difference
    
    if (currentDiff > 0 && currentDiff < minDiff) {
      minDiff = currentDiff;
      bestI = iInfo.index;
      bestJ = j;
    } else if (currentDiff === minDiff) {
      if (iInfo.index < bestI || (iInfo.index === bestI && j < bestJ)) {
        bestI = iInfo.index;
        bestJ = j;
      }
    }
  }
  
  return [bestI, bestJ];
}

// Compute the pair with maximum difference
function computeMaxPair(arr: number[]): [number, number] {
  const n = arr.length;
  const minRight: Array<{ value: number; index: number }> = new Array(n);
  minRight[n-1] = { value: arr[n-1], index: n-1 };
  
  for (let i = n-2; i >= 0; i--) {
    if (arr[i] <= minRight[i+1].value) {
      minRight[i] = { value: arr[i], index: i };
    } else {
      minRight[i] = minRight[i+1];
    }
  }

  let maxDiff = -Infinity;
  let bestI = -1, bestJ = -1;
  
  for (let i = 0; i < n-1; i++) {
    const jInfo = minRight[i+1];
    const currentDiff = arr[i] - jInfo.value;
    
    if (currentDiff > maxDiff) {
      maxDiff = currentDiff;
      bestI = i;
      bestJ = jInfo.index;
    } else if (currentDiff === maxDiff) {
      if (i < bestI || (i === bestI && jInfo.index < bestJ)) {
        bestI = i;
        bestJ = jInfo.index;
      }
    }
  }
  
  return [bestI, bestJ];
}

function calculatePairs(arr: number[]): PairResult {
  // Input validation
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array');
  }
  
  if (arr.length < 3 || arr.length > 1e5) {
    throw new Error('Array length must be between 3 and 100000');
  }
  
  for (const num of arr) {
    if (!Number.isInteger(num) || num < 1 || num > 1e5) {
      throw new Error(`Invalid element: ${num}. Must be an integer between 1 and 100000`);
    }
  }
  
  // Calculate index pairs (0-based indices)
  const minPair = computeMinPair(arr);
  const maxPair = computeMaxPair(arr);
  
  // Convert to 1-based indices for display
  const minIndices = [minPair[0] + 1, minPair[1] + 1];
  const maxIndices = [maxPair[0] + 1, maxPair[1] + 1];
  
  // Extract the values
  const minValues = [arr[minPair[0]], arr[minPair[1]]];
  const maxValues = [arr[maxPair[0]], arr[maxPair[1]]];
  
  // Calculate the differences
  const minDifference = arr[minPair[1]] - arr[minPair[0]];
  const maxDifference = arr[maxPair[0]] - arr[maxPair[1]];
  
  return {
    min: minIndices,
    max: maxIndices,
    originalArray: arr,
    minValues: minValues,
    maxValues: maxValues,
    minDifference: minDifference,
    maxDifference: maxDifference,
    timestamp: Date.now()
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store current result for sending to new connections
  let currentResult: PairResult | null = null;
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    // Send current result to new client if available
    if (currentResult) {
      const message: ServerMessage = { 
        type: 'update', 
        result: currentResult
      };
      ws.send(JSON.stringify(message));
    }
    
    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data) as ArrayData;
        
        if (message.type === 'array' && Array.isArray(message.array)) {
          try {
            const result = calculatePairs(message.array);
            currentResult = result;
            
            // Broadcast result to all clients
            const responseMessage: ServerMessage = { 
              type: 'update', 
              result 
            };
            
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(responseMessage));
              }
            });
          } catch (error) {
            // Send error only to the client that sent the request
            const errorMessage: ServerMessage = { 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
            ws.send(JSON.stringify(errorMessage));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage: ServerMessage = { 
          type: 'error', 
          error: 'Invalid message format' 
        };
        ws.send(JSON.stringify(errorMessage));
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // API endpoint for array calculation
  app.post('/api/calculate', (req, res) => {
    try {
      const { array } = req.body;
      const result = calculatePairs(array);
      res.json({ result });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  return httpServer;
}
