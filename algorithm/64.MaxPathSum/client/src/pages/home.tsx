import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PathVisualizer } from "@/components/PathVisualizer";
import { MatrixInfo } from "@/components/MatrixInfo";

// The default 5x5 matrix as specified in requirements
const defaultMatrix = [
  [7, 15, 1, 3, 14],
  [2, 3, 0, 0, 1],
  [9, 2, 5, 8, 4],
  [1, 7, 2, 1, 2],
  [12, 3, 6, 1, 2]
];

export default function Home() {
  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix);
  const [recalculate, setRecalculate] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Handle matrix changes from the MatrixInfo component
  const handleMatrixChange = (newMatrix: number[][]) => {
    setMatrix(newMatrix);
    // Flag for recalculation
    setRecalculate(true);
    // Show info message
    setShowInfo(true);
    
    // Hide info message after 5 seconds
    setTimeout(() => {
      setShowInfo(false);
    }, 5000);
  };

  // Handle recalculation complete
  const handleRecalculationComplete = () => {
    setRecalculate(false);
  };

  return (
    <div className="bg-app-bg min-h-screen flex flex-col items-center justify-center font-sans text-gray-800 p-4">
      <header className="w-full max-w-2xl mb-6 text-center">
        <h1 className="text-3xl font-medium text-primary">Robot Path Visualizer</h1>
        <p className="text-gray-600 mt-2">Visualizing the maximum path sum algorithm</p>
      </header>
      
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded mb-4 flex items-center w-full max-w-2xl">
          <span className="material-icons text-blue-500 mr-2">info</span>
          <p>Matrix values updated. The path will recalculate automatically.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto p-1 h-6 w-6"
            onClick={() => setShowInfo(false)}
          >
            <span className="material-icons text-sm">close</span>
          </Button>
        </div>
      )}
      
      <PathVisualizer 
        matrix={matrix} 
        key={JSON.stringify(matrix)} 
        needsRecalculation={recalculate}
        onRecalculationComplete={handleRecalculationComplete}
      />
      
      <MatrixInfo 
        matrix={matrix} 
        onMatrixChange={handleMatrixChange} 
      />
      
      <footer className="mt-8 mb-4 text-center text-gray-500 text-sm">
        <p>Robot Path Visualizer - Maximum Path Sum Algorithm</p>
      </footer>
    </div>
  );
}
