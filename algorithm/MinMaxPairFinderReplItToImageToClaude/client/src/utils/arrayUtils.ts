/**
 * Formats a timestamp as a relative time string
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return 'Never';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Just return the time
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Validates an array input against the constraints
 */
export function validateArrayInput(array: number[]): string | null {
  if (!Array.isArray(array)) {
    return 'Input must be an array';
  }
  
  if (array.length < 3) {
    return 'Array must have at least 3 elements';
  }
  
  if (array.length > 1e5) {
    return 'Array must have at most 100,000 elements';
  }
  
  for (const num of array) {
    if (!Number.isInteger(num)) {
      return `Invalid element: ${num}. Must be an integer`;
    }
    
    if (num < 1 || num > 1e5) {
      return `Invalid element: ${num}. Must be between 1 and 100,000`;
    }
  }
  
  return null;
}
