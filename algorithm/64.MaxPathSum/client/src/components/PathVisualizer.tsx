import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { 
  drawGrid, 
  type CellPosition, 
  type PathUpdate,
  initPathData,
  nextStep as apiNextStep,
  resetPath as apiResetPath 
} from "@/lib/utils";

interface PathVisualizerProps {
  matrix: number[][];
  needsRecalculation?: boolean;
  onRecalculationComplete?: () => void;
}

export function PathVisualizer({ matrix, needsRecalculation, onRecalculationComplete }: PathVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSum, setCurrentSum] = useState(matrix[0][0]); // Start with the first cell value
  const [totalSum, setTotalSum] = useState(0);
  const [isPathComplete, setIsPathComplete] = useState(false);
  const [path, setPath] = useState<CellPosition[]>([{ row: 0, col: 0 }]); // Start with the first cell
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const webSocketFailedAttemptsRef = useRef(0);
  const maxFailedAttempts = 2; // Trigger HTTP fallback mode quickly

  const cellSize = 60;
  const rows = matrix.length;
  const cols = matrix[0].length;

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();

  // Initialize data using HTTP fallback when WebSocket fails too many times
  const initializeWithFallback = useCallback(async () => {
    console.log('Initializing with HTTP fallback...');
    setLoading(true);
    setUsingFallback(true);
    
    try {
      const response = await initPathData(matrix);
      
      if (response.success && response.data) {
        const { 
          path, 
          totalSum, 
          currentStep, 
          currentSum, 
          isComplete 
        } = response.data;
        
        setPath(path);
        setTotalSum(totalSum);
        setCurrentStep(currentStep);
        setCurrentSum(currentSum);
        setIsPathComplete(isComplete);
        setInitializing(false);
      } else {
        console.error('Failed to initialize with fallback:', response.error);
      }
    } catch (error) {
      console.error('Error in fallback initialization:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize and draw the grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial grid
    drawGrid(ctx, matrix, path, currentStep, cellSize);

    // Request path data from server when connected
    if (connectionStatus === 'connected' && !usingFallback) {
      sendMessage({ type: 'init', matrix });
      webSocketFailedAttemptsRef.current = 0;
    } else if (connectionStatus === 'disconnected') {
      webSocketFailedAttemptsRef.current += 1;
      
      // If WebSocket fails multiple times, use HTTP fallback
      if (webSocketFailedAttemptsRef.current >= maxFailedAttempts && !usingFallback && initializing) {
        console.log('Switching to HTTP fallback mode after', webSocketFailedAttemptsRef.current, 'failed WebSocket attempts');
        initializeWithFallback();
      }
    }
  }, [connectionStatus, usingFallback, initializing, sendMessage, matrix, path, currentStep, initializeWithFallback]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || usingFallback) return;

    try {
      const message = JSON.parse(lastMessage);
      
      if (message.type === 'init_response') {
        const { path, totalSum } = message.data;
        setPath(path);
        setTotalSum(totalSum);
        setInitializing(false);
      } else if (message.type === 'path_update') {
        const update: PathUpdate = message.data;
        setCurrentStep(update.currentStep);
        setCurrentSum(update.currentSum);
        setIsPathComplete(update.isComplete);
        setInitializing(false);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [lastMessage, usingFallback]);

  // Update canvas when path or currentStep changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx, matrix, path, currentStep, cellSize);
  }, [path, currentStep, matrix]);
  
  // Handle matrix recalculation when prop changes
  useEffect(() => {
    if (needsRecalculation) {
      console.log('Matrix has changed, recalculating path...');
      setInitializing(true);
      setCurrentStep(0);
      setCurrentSum(matrix[0][0]);
      setIsPathComplete(false);
      
      // Request new path data based on connection status
      if (usingFallback) {
        // Use HTTP fallback
        (async () => {
          setLoading(true);
          try {
            const response = await initPathData(matrix);
            if (response.success && response.data) {
              const { path, totalSum, currentStep, currentSum, isComplete } = response.data;
              setPath(path);
              setTotalSum(totalSum);
              setCurrentStep(currentStep);
              setCurrentSum(currentSum);
              setIsPathComplete(isComplete);
              
              if (onRecalculationComplete) {
                onRecalculationComplete();
              }
            } else {
              console.error('Failed to recalculate path:', response.error);
            }
          } catch (error) {
            console.error('Error recalculating path:', error);
          } finally {
            setLoading(false);
            setInitializing(false);
          }
        })();
      } else if (connectionStatus === 'connected') {
        // Use WebSocket
        sendMessage({ type: 'init', matrix });
        
        // Notify parent component when complete
        if (onRecalculationComplete) {
          onRecalculationComplete();
        }
      } else {
        // Connection not available, try fallback
        initializeWithFallback().then(() => {
          if (onRecalculationComplete) {
            onRecalculationComplete();
          }
        });
      }
    }
  }, [needsRecalculation, usingFallback, connectionStatus, matrix, sendMessage, initializeWithFallback, onRecalculationComplete]);

  const handleNextStep = async () => {
    if (isPathComplete || loading) return;
    
    if (usingFallback) {
      // Use REST API fallback
      setLoading(true);
      try {
        const response = await apiNextStep();
        if (response.success && response.data) {
          const { currentStep, currentSum, isComplete } = response.data;
          setCurrentStep(currentStep);
          setCurrentSum(currentSum);
          setIsPathComplete(isComplete);
        } else {
          console.error('Failed to advance step:', response.error);
        }
      } catch (error) {
        console.error('Error advancing step:', error);
      } finally {
        setLoading(false);
      }
    } else if (connectionStatus === 'connected') {
      // Use WebSocket
      sendMessage({ type: 'next_step' });
    }
  };

  const handleReset = async () => {
    if (loading) return;
    
    if (usingFallback) {
      // Use REST API fallback
      setLoading(true);
      try {
        const response = await apiResetPath();
        if (response.success && response.data) {
          const { currentStep, currentSum, isComplete } = response.data;
          setCurrentStep(currentStep);
          setCurrentSum(currentSum);
          setIsPathComplete(isComplete);
        } else {
          console.error('Failed to reset path:', response.error);
        }
      } catch (error) {
        console.error('Error resetting path:', error);
      } finally {
        setLoading(false);
      }
    } else if (connectionStatus === 'connected') {
      // Use WebSocket
      setCurrentStep(0);
      setCurrentSum(matrix[0][0]);
      setIsPathComplete(false);
      sendMessage({ type: 'reset' });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span 
            className={`h-3 w-3 rounded-full ${
              usingFallback 
                ? 'bg-orange-500' 
                : connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'connecting' 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {usingFallback
              ? 'Using HTTP fallback mode'
              : connectionStatus === 'connected' 
                ? 'Connected to server' 
                : connectionStatus === 'connecting' 
                  ? 'Connecting to server...' 
                  : 'Disconnected from server'}
          </span>
        </div>
        {initializing && (
          <div className="text-xs text-gray-500 mt-1">
            {usingFallback ? 'Loading data...' : 'Waiting for server response...'}
          </div>
        )}
      </div>

      <Card className="bg-card-bg rounded-lg shadow-md p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">grid_on</span>
            <span className="font-medium">Matrix Grid</span>
          </div>
          <div className="text-sm text-gray-500">
            <span>Step {currentStep + 1}/{path.length}</span>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <canvas 
            ref={canvasRef} 
            width={cols * cellSize} 
            height={rows * cellSize} 
            className="border border-grid-border rounded"
          />
        </div>

        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-gray-50 rounded-md border border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Current Path Sum</div>
            <div className="text-2xl font-medium text-primary">{currentSum}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Maximum Path Sum</div>
            <div className="text-2xl font-medium text-gray-700">{totalSum}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={loading || (!usingFallback && connectionStatus !== 'connected')}
            className="flex items-center gap-1"
          >
            <span className="material-icons text-sm">refresh</span>
            Reset
          </Button>
          <Button 
            onClick={handleNextStep}
            disabled={isPathComplete || loading || (!usingFallback && connectionStatus !== 'connected')}
            className="flex items-center gap-2"
          >
            <span>Next Step</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </Button>
        </div>
      </Card>
    </>
  );
}
