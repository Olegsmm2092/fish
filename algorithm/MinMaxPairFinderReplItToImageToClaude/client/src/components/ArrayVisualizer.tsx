import React from 'react';

interface ArrayVisualizerProps {
  array: number[];
  minPair?: number[];
  maxPair?: number[];
}

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ array, minPair = [], maxPair = [] }) => {
  if (!array || array.length === 0) {
    return <p className="text-sm text-neutral-500">No data to visualize</p>;
  }

  if (array.length > 50) {
    return <p className="text-sm text-neutral-500">Array too large to visualize</p>;
  }

  // Find max value for scaling
  const maxValue = Math.max(...array);

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {array.map((value, index) => {
        const heightPercent = (value / maxValue) * 100;
        const isInMinPair = minPair.includes(index);
        const isInMaxPair = maxPair.includes(index);
        
        // Determine bar highlighting
        let bgColor = "bg-primary-500";
        if (isInMinPair) bgColor = "bg-blue-600";
        if (isInMaxPair) bgColor = "bg-green-600";
        
        return (
          <div key={index} className="flex flex-col items-center">
            <div className="h-20 w-8 bg-primary-200 flex items-end justify-center rounded-sm overflow-hidden">
              <div className={`${bgColor} w-full transition-all duration-300 ease-in-out`} style={{ height: `${heightPercent}%` }}></div>
            </div>
            <span className="text-xs mt-1 font-mono">{value}</span>
            <span className={`text-xs ${isInMinPair ? 'text-blue-600 font-medium' : isInMaxPair ? 'text-green-600 font-medium' : 'text-neutral-500'}`}>
              [{index + 1}]
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ArrayVisualizer;
