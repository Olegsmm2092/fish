import type { CellPosition } from "./path-calculator";

/**
 * A simple in-memory storage for the path data and current state
 */
class PathStorage {
  private path: CellPosition[] = [];
  private maxSum: number = 0;
  private currentStep: number = 0;
  
  /**
   * Store a new path and maximum sum
   */
  storePath(path: CellPosition[], maxSum: number): void {
    this.path = path;
    this.maxSum = maxSum;
    this.currentStep = 0; // Reset current step when a new path is stored
  }
  
  /**
   * Get the stored path
   */
  getPath(): CellPosition[] {
    return this.path;
  }
  
  /**
   * Get the maximum sum
   */
  getMaxSum(): number {
    return this.maxSum;
  }
  
  /**
   * Get the current step in the path
   */
  getCurrentStep(): number {
    return this.currentStep;
  }
  
  /**
   * Set the current step
   */
  setCurrentStep(step: number): void {
    if (step >= 0 && step < this.path.length) {
      this.currentStep = step;
    }
  }
}

// Export a singleton instance
export const pathStorage = new PathStorage();
