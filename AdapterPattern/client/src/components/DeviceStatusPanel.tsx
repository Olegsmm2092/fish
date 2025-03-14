import { Card } from "@/components/ui/card";
import DeviceStatusCard from "./DeviceStatusCard";
import { Button } from "@/components/ui/button";
import { 
  Activity as Power, 
  PowerOff, 
  Gauge, 
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface DeviceStatusPanelProps {
  usbStatus: any;
  hdmiStatus: any;
  refreshStatus: () => void;
}

export default function DeviceStatusPanel({ 
  usbStatus, 
  hdmiStatus,
  refreshStatus
}: DeviceStatusPanelProps) {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const allDevicesReady = usbStatus?.connected && hdmiStatus?.connected;
  const transferReady = allDevicesReady;

  const handleInitializeAllDevices = async () => {
    try {
      setIsInitializing(true);
      await apiRequest("POST", "/api/devices?action=connect", {});
      toast({
        title: "Success",
        description: "All devices initialized successfully.",
      });
      refreshStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to initialize devices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDisconnectAllDevices = async () => {
    try {
      setIsDisconnecting(true);
      await apiRequest("DELETE", "/api/devices?action=disconnect", {});
      toast({
        title: "Success",
        description: "All devices disconnected successfully.",
      });
      refreshStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to disconnect devices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRunDeviceTest = async () => {
    try {
      setIsRunningTest(true);
      // Simulate a test by sending and receiving data
      await apiRequest("POST", "/api/devices?action=transfer", { data: "TEST_DIAGNOSTIC_DATA" });
      toast({
        title: "Success",
        description: "Diagnostic test completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to run diagnostic test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleExportDeviceStatus = () => {
    try {
      setIsExporting(true);
      const statusData = {
        usb: usbStatus,
        hdmi: hdmiStatus,
        timestamp: new Date().toISOString()
      };
      
      // Create a blob and download it
      const blob = new Blob([JSON.stringify(statusData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `device-status-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Status report exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export status report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="lg:col-span-5 space-y-6">
      <Card className="p-5">
        <h2 className="text-xl font-medium mb-4">Device Status</h2>

        <DeviceStatusCard 
          type="usb" 
          status={usbStatus} 
          refreshStatus={refreshStatus}
        />
        
        <DeviceStatusCard 
          type="hdmi" 
          status={hdmiStatus}
          refreshStatus={refreshStatus}
        />

        <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">Connection Summary</h4>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                <span className="text-sm">All Devices Ready</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-success rounded-full h-2 ${allDevicesReady ? 'w-full' : 'w-0'}`}></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm">Transfer Capability</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-primary rounded-full h-2 ${transferReady ? 'w-full' : 'w-0'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            className="bg-primary text-white p-3 h-auto flex items-center justify-center"
            onClick={handleInitializeAllDevices}
            disabled={isInitializing || allDevicesReady}
          >
            <Power className="mr-2 h-5 w-5" />
            {isInitializing ? "Initializing..." : "Initialize All Devices"}
          </Button>
          
          <Button 
            className="bg-secondary text-white p-3 h-auto flex items-center justify-center"
            onClick={handleRunDeviceTest}
            disabled={isRunningTest || !transferReady}
          >
            <Gauge className="mr-2 h-5 w-5" />
            {isRunningTest ? "Running Test..." : "Run Diagnostic Test"}
          </Button>
          
          <Button 
            variant="outline"
            className="p-3 h-auto flex items-center justify-center"
            onClick={handleDisconnectAllDevices}
            disabled={isDisconnecting || (!usbStatus?.connected && !hdmiStatus?.connected)}
          >
            <PowerOff className="mr-2 h-5 w-5" />
            {isDisconnecting ? "Disconnecting..." : "Disconnect All Devices"}
          </Button>
          
          <Button 
            variant="outline"
            className="p-3 h-auto flex items-center justify-center"
            onClick={handleExportDeviceStatus}
            disabled={isExporting}
          >
            <Download className="mr-2 h-5 w-5" />
            {isExporting ? "Exporting..." : "Export Status Report"}
          </Button>
        </div>
      </Card>
    </section>
  );
}
