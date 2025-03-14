import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SendHorizontal as Send, Info } from "lucide-react";

interface DataTransferPanelProps {
  usbStatus: any;
  hdmiStatus: any;
  addLogEntry: (level: string, message: string) => void;
}

export default function DataTransferPanel({ 
  usbStatus, 
  hdmiStatus,
  addLogEntry
}: DataTransferPanelProps) {
  const [transferData, setTransferData] = useState("");
  const [sourceDevice, setSourceDevice] = useState("usb");
  const [targetDevice, setTargetDevice] = useState("hdmi");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<null | {
    success: boolean;
    originalData: string;
    processedData: string;
    message?: string;
  }>(null);
  
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!transferData.trim()) {
      toast({
        title: "Error",
        description: "Please enter data to transfer",
        variant: "destructive",
      });
      return;
    }
    
    if (sourceDevice === targetDevice) {
      toast({
        title: "Error",
        description: "Source and target devices cannot be the same",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsTransferring(true);
      
      // Check if devices are connected before transferring
      if (
        (sourceDevice === "usb" && !usbStatus.connected) || 
        (sourceDevice === "hdmi" && !hdmiStatus.connected) ||
        (targetDevice === "usb" && !usbStatus.connected) ||
        (targetDevice === "hdmi" && !hdmiStatus.connected)
      ) {
        throw new Error("All devices must be connected to transfer data");
      }
      
      const response = await apiRequest("POST", "/api/devices?action=transfer", { 
        data: transferData,
        source: sourceDevice,
        target: targetDevice
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTransferResult({
          success: true,
          originalData: transferData,
          processedData: `[HDMI_FORMAT]USB_PROCESSED:${transferData}`
        });
        
        addLogEntry("info", `Data successfully transferred from ${sourceDevice.toUpperCase()} to ${targetDevice.toUpperCase()}`);
        toast({
          title: "Success",
          description: "Data transferred successfully",
        });
      } else {
        throw new Error(result.error || "Transfer failed");
      }
    } catch (error) {
      addLogEntry("error", `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setTransferResult({
        success: false,
        originalData: transferData,
        processedData: "",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Error",
        description: `Failed to transfer data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleReset = () => {
    setTransferData("");
    setTransferResult(null);
  };

  return (
    <Card className="p-5">
      <h2 className="text-xl font-medium mb-4">Data Transfer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="dataInput" className="text-sm font-medium text-muted-foreground">
            Data Payload
          </Label>
          <Textarea 
            id="dataInput"
            rows={3}
            placeholder="Enter data to transfer..."
            value={transferData}
            onChange={(e) => setTransferData(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sourceDevice" className="text-sm font-medium text-muted-foreground">
              Source Device
            </Label>
            <Select
              value={sourceDevice}
              onValueChange={setSourceDevice}
            >
              <SelectTrigger id="sourceDevice" className="mt-1">
                <SelectValue placeholder="Select source device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usb">USB Interface</SelectItem>
                <SelectItem value="hdmi">HDMI Interface</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="targetDevice" className="text-sm font-medium text-muted-foreground">
              Target Device
            </Label>
            <Select
              value={targetDevice}
              onValueChange={setTargetDevice}
            >
              <SelectTrigger id="targetDevice" className="mt-1">
                <SelectValue placeholder="Select target device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hdmi">HDMI Interface</SelectItem>
                <SelectItem value="usb">USB Interface</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="bg-primary text-white"
            disabled={isTransferring}
          >
            {isTransferring ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Transfer Data
              </>
            )}
          </Button>
          <Button 
            type="reset" 
            variant="outline"
            onClick={handleReset}
            disabled={isTransferring}
          >
            Clear
          </Button>
        </div>
      </form>
      
      <div className="mt-6 border-t border-divider pt-4">
        <h3 className="text-lg font-medium mb-3">Transfer Results</h3>
        <div id="resultPanel" className="bg-gray-50 rounded-lg p-4 mb-3 border border-divider min-h-24">
          {transferResult ? (
            transferResult.success ? (
              <div>
                <div className="text-success font-medium mb-2">Transfer Successful</div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="mb-1 text-sm font-medium">Original Data:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs mb-2">{transferResult.originalData}</pre>
                  <p className="mb-1 text-sm font-medium">Processed Data:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs">{transferResult.processedData}</pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-destructive">
                <Info className="h-5 w-5 mr-2" />
                <p>{transferResult.message || "Transfer failed"}</p>
              </div>
            )
          ) : (
            <div className="flex items-center text-muted-foreground">
              <Info className="h-5 w-5 mr-2" />
              <p>Results will appear here after transfer</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
