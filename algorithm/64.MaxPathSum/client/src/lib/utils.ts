import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface PathUpdate {
  currentStep: number;
  currentPosition: CellPosition;
  currentSum: number;
  totalSum: number;
  isComplete: boolean;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// HTTP API fallback for WebSocket communications
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

// Path API operations for HTTP fallback
export async function initPathData(customMatrix?: number[][]): Promise<APIResponse<{
  path: CellPosition[];
  totalSum: number;
  currentStep: number;
  currentPosition: CellPosition;
  currentSum: number;
  isComplete: boolean;
}>> {
  try {
    const body: any = { action: 'init' };
    
    // Include custom matrix if provided
    if (customMatrix) {
      body.matrix = customMatrix;
    }
    
    const response = await fetchWithTimeout('/api/path/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initializing path data:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function nextStep(): Promise<APIResponse<PathUpdate>> {
  try {
    const response = await fetchWithTimeout('/api/path/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'next_step' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error advancing path:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function resetPath(): Promise<APIResponse<PathUpdate>> {
  try {
    const response = await fetchWithTimeout('/api/path/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting path:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Canvas drawing utils
export const drawCell = (
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  cellSize: number,
  color: string,
  value: number
) => {
  const x = col * cellSize;
  const y = row * cellSize;
  
  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(x, y, cellSize, cellSize);
  
  // Draw border
  ctx.strokeStyle = 'hsl(var(--grid-border))';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellSize, cellSize);
  
  // Draw value
  ctx.fillStyle = '#212121';
  ctx.font = '16px Roboto';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value.toString(), x + cellSize/2, y + cellSize/2);
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  path: CellPosition[],
  currentStep: number,
  cellSize: number
) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let color = '#ffffff'; // default white
      
      // Check if this cell is in the path up to current step
      const isInPath = path.slice(0, currentStep + 1).some(
        pos => pos.row === i && pos.col === j
      );
      
      const isCurrentPos = currentStep >= 0 && 
        path[currentStep]?.row === i && 
        path[currentStep]?.col === j;
      
      if (isCurrentPos) {
        color = 'hsl(var(--destructive))'; // Current position: red
      } else if (isInPath) {
        color = 'hsl(var(--path-highlight))'; // Visited path: light green
      }
      
      drawCell(ctx, i, j, cellSize, color, matrix[i][j]);
    }
  }
};
