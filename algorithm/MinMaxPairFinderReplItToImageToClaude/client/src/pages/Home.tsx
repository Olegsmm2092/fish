import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ConnectionStatus from '@/components/ConnectionStatus';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import { useSocket } from '@/hooks/useSocket';
import { PairResult } from '@shared/schema';
import { formatTime } from '@/utils/arrayUtils';

export default function Home() {
  const [arrayInput, setArrayInput] = useState<string>('');
  const [result, setResult] = useState<PairResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const { toast } = useToast();
  
  const { 
    isConnected, 
    sendMessage, 
    lastMessage 
  } = useSocket();

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        
        if (data.type === 'update' && data.result) {
          setResult(data.result);
          setLastUpdated(Date.now());
          setIsCalculating(false);
          
          // Success notification
          toast({
            title: 'Calculation Complete',
            description: 'The min/max pairs have been updated.',
            variant: 'default'
          });
          
          // Clear the input field
          setArrayInput('');
        } else if (data.type === 'error' && data.error) {
          setIsCalculating(false);
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive'
          });
        }
      } catch (error) {
        setIsCalculating(false);
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Set calculating state to show loading
      setIsCalculating(true);
      
      const arr = arrayInput.split(',').map(num => parseInt(num.trim(), 10));
      
      // Basic validation
      if (arr.some(isNaN)) {
        setIsCalculating(false);
        toast({
          title: 'Invalid input',
          description: 'Please enter valid integers separated by commas.',
          variant: 'destructive'
        });
        return;
      }
      
      // Show toast to indicate calculation started
      toast({
        title: 'Calculating...',
        description: `Processing array with ${arr.length} elements`,
      });
      
      sendMessage(JSON.stringify({
        type: 'array',
        array: arr
      }));
    } catch (error) {
      setIsCalculating(false);
      console.error('Error processing input:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing your input',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-800">Array Pair Finder</h1>
            <ConnectionStatus isConnected={isConnected} />
          </div>
          <p className="text-neutral-600 mt-2">Find pairs with minimum and maximum differences in an array</p>
        </header>

        {/* Main Content */}
        <main>
          {/* Input Card */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-4 text-neutral-700">Input Array</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="array-input" className="block text-sm font-medium text-neutral-600 mb-1">
                    Enter comma-separated integers
                  </Label>
                  <div className="relative">
                    <Input
                      id="array-input"
                      type="text"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="e.g., 3,1,4,2,7,5"
                      value={arrayInput}
                      onChange={(e) => setArrayInput(e.target.value)}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Array must contain 3-100,000 integers between 1-100,000</p>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    disabled={!isConnected || isCalculating}
                  >
                    {isCalculating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Calculate Pairs'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Results Card */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-4 text-neutral-700">Results</h2>
              
              {/* Last Update Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-neutral-500">Last updated</span>
                    <span className="text-xs ml-2 text-neutral-400">
                      {result ? formatTime(result.timestamp) : 'Never'}
                    </span>
                  </div>
                  {lastUpdated > 0 && Date.now() - lastUpdated < 5000 && (
                    <Badge className="animate-pulse bg-primary-500 text-white border-primary-600">
                      Updated
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Indices (1-based)</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Values</th>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {/* Min Difference Row */}
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          Min Difference
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.min ? result.min.join(' ') : '-'}
                        </code>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.minValues ? result.minValues.join(' ') : '-'}
                        </code>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.minDifference ?? '-'}
                        </code>
                      </td>
                    </tr>
                    
                    {/* Max Difference Row */}
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Max Difference
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.max ? result.max.join(' ') : '-'}
                        </code>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.maxValues ? result.maxValues.join(' ') : '-'}
                        </code>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="font-mono text-sm">
                          {result?.maxDifference ?? '-'}
                        </code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visualization Section */}
              {result?.originalArray && (
                <div className="mt-6 pt-5 border-t border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">Array Visualization</h3>
                  <ArrayVisualizer 
                    array={result.originalArray} 
                    minPair={result.min.map(i => i - 1)}
                    maxPair={result.max.map(i => i - 1)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-neutral-500 text-sm">
          <p>Real-time Array Processor &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
