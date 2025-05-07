import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MatrixInfoProps {
  matrix: number[][];
  onMatrixChange?: (newMatrix: number[][]) => void;
}

export function MatrixInfo({ matrix, onMatrixChange }: MatrixInfoProps) {
  const [editableMatrix, setEditableMatrix] = useState<number[][]>(
    JSON.parse(JSON.stringify(matrix)) // Create a deep copy
  );
  const [isEditing, setIsEditing] = useState(false);

  // Handle cell value change
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    // Convert to number and validate
    const numValue = parseInt(value, 10);
    // If not a valid number, return
    if (isNaN(numValue)) return;

    // Create a new matrix with the updated value
    const newMatrix = editableMatrix.map((row, rIndex) =>
      row.map((cell, cIndex) =>
        rIndex === rowIndex && cIndex === colIndex ? numValue : cell
      )
    );

    // Update the editable matrix
    setEditableMatrix(newMatrix);
  };

  // Handle save button click
  const handleSave = () => {
    setIsEditing(false);
    if (onMatrixChange) {
      onMatrixChange(editableMatrix);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original matrix
    setEditableMatrix(JSON.parse(JSON.stringify(matrix)));
  };

  return (
    <div className="mt-8 w-full max-w-2xl">
      <Card className="bg-card-bg rounded-lg shadow-md p-6">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium flex items-center">
              <span className="material-icons text-primary mr-2">info</span>
              Matrix Values
            </h2>
            {onMatrixChange && (
              <Button 
                variant={isEditing ? "outline" : "default"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "hidden" : ""}
              >
                <span className="material-icons text-sm mr-1">edit</span>
                Edit Matrix
              </Button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody>
                {editableMatrix.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((value, colIndex) => (
                      <td 
                        key={`cell-${rowIndex}-${colIndex}`} 
                        className={`
                          px-2 py-2 text-center border border-gray-200
                          ${isEditing ? 'bg-gray-50' : ''}
                        `}
                        style={{ minWidth: '60px' }}
                      >
                        {isEditing ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="h-8 text-center p-1 w-14"
                            min={0}
                            max={99}
                          />
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isEditing && (
            <div className="flex justify-end mt-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
