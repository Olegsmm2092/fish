# Array Pair Finder

A web application that finds pairs with minimum and maximum differences in an array of integers.

## Features

- Find pairs of elements with minimum difference
- Find pairs of elements with maximum difference
- Real-time processing using WebSockets
- Clean and responsive UI

## Requirements

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/array-pair-finder.git
   cd array-pair-finder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the TypeScript:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development

For development with hot reloading:

```
npm run dev
```

## How It Works

The application uses an efficient algorithm to find:

1. The pair of elements with the minimum difference between array[i] - array[j], where j > i
2. The pair of elements with the maximum difference between array[i] - array[j], where j > i

If multiple pairs have the same difference, the algorithm selects the pair with the smallest indices.

## Project Structure

```
array-pair-finder/
├── dist/               # Compiled JavaScript files
├── public/             # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── index.html      # Main HTML page
├── src/                # TypeScript source files
│   └── server.ts       # Main server file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## License

MIT