import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Usb as UsbIcon, 
  MonitorIcon as HdmiIcon, 
  Activity as Power, 
  PowerOff 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeviceStatusCardProps {
  type: "usb" | "hdmi";
  status: any;
  refreshStatus: () => void;
}

export default function DeviceStatusCard({ 
  type, 
  status,
  refreshStatus
}: DeviceStatusCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  const icon = type === "usb" ? <UsbIcon className="text-primary mr-2" /> : <HdmiIcon className="text-primary mr-2" />;
  const title = type === "usb" ? "USB Interface" : "HDMI Interface";

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await apiRequest("POST", `/api/devices/${type}?action=connect`, {});
      toast({
        title: "Success",
        description: `${title} connected successfully.`,
      });
      refreshStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect ${title}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await apiRequest("DELETE", `/api/devices/${type}?action=disconnect`, {});
      toast({
        title: "Success",
        description: `${title} disconnected successfully.`,
      });
      refreshStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to disconnect ${title}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = status?.connected;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {icon}
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isConnected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${
            isConnected ? "bg-success" : "bg-destructive"
          }`}></span>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {type === "usb" ? (
          <>
            <div>
              <p className="text-muted-foreground mb-1">Connection Status</p>
              <p className="font-medium">{isConnected ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Activity</p>
              <p className="font-medium">{isConnected ? "Just now" : "N/A"}</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-muted-foreground mb-1">Resolution</p>
              <p className="font-medium">{isConnected ? status.resolution : "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Refresh Rate</p>
              <p className="font-medium">{isConnected ? `${status.refresh} Hz` : "N/A"}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex space-x-3">
        <Button 
          className="bg-primary text-white"
          disabled={isConnected || isConnecting}
          onClick={handleConnect}
        >
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
        <Button 
          variant="outline"
          disabled={!isConnected || isDisconnecting}
          onClick={handleDisconnect}
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </Button>
      </div>
    </div>
  );
}
