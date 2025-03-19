const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('processInput', (data) => {
    const { array } = data;
    try {
      const result = solveDifferenceProblem(array);
      socket.emit('result', result);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Core logic adapted to return detailed results
function solveDifferenceProblem(elements) {
  const n = elements.length;

  // Validate input
  if (n < 3 || n > 100000) throw new Error('Array must contain 3-100,000 integers');
  if (elements.some(x => x < 1 || x > 100000)) throw new Error('Elements must be between 1 and 100,000');

  // Preprocess max_after array
  let currentMaxVal = -Infinity;
  let currentMaxIdx = -1;
  const maxAfter = new Array(n).fill(null).map(() => [0, 0]);
  for (let i = n - 1; i >= 0; i--) {
    maxAfter[i] = [currentMaxVal, currentMaxIdx];
    if (elements[i] > currentMaxVal) {
      currentMaxVal = elements[i];
      currentMaxIdx = i;
    }
  }

  // Preprocess min_after array
  let currentMinVal = Infinity;
  let currentMinIdx = -1;
  const minAfter = new Array(n).fill(null).map(() => [0, 0]);
  for (let i = n - 1; i >= 0; i--) {
    minAfter[i] = [currentMinVal, currentMinIdx];
    if (elements[i] < currentMinVal) {
      currentMinVal = elements[i];
      currentMinIdx = i;
    }
  }

  // Find min and max differences
  let minDiff = Infinity;
  let iMin = -1, jMin = -1;
  let maxDiff = -Infinity;
  let iMax = -1, jMax = -1;

  for (let i = 0; i < n - 1; i++) {
    const [maxVal, maxIdx] = maxAfter[i];
    if (maxIdx !== -1) {
      const diff = elements[i] - maxVal;
      if (diff < minDiff) {
        minDiff = diff;
        iMin = i;
        jMin = maxIdx;
      } else if (diff === minDiff) {
        if (i < iMin || (i === iMin && maxIdx < jMin)) {
          iMin = i;
          jMin = maxIdx;
        }
      }
    }

    const [minVal, minIdx] = minAfter[i];
    const diff = elements[i] - minVal;
    if (diff > maxDiff) {
      maxDiff = diff;
      iMax = i;
      jMax = minIdx;
    } else if (diff === maxDiff) {
      if (i < iMax || (i === iMax && minIdx < jMax)) {
        iMax = i;
        jMax = minIdx;
      }
    }
  }

  // Return detailed result for the table
  return {
    min: {
      indices: [iMin + 1, jMin + 1], // 1-based
      values: [elements[iMin], elements[jMin]],
      difference: minDiff
    },
    max: {
      indices: [iMax + 1, jMax + 1], // 1-based
      values: [elements[iMax], elements[jMax]],
      difference: maxDiff
    }
  };
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});