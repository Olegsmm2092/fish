export interface CellPosition {
  row: number;
  col: number;
}

export interface PathData {
  path: CellPosition[];
  totalSum: number;
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
  data?: any;
}
