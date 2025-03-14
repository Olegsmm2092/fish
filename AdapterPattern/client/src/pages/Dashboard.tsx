import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DeviceStatusPanel from "@/components/DeviceStatusPanel";
import DataTransferPanel from "@/components/DataTransferPanel";
import LoggingPanel from "@/components/LoggingPanel";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogEntry } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Fetch device status
  const { data: deviceStatus, error, isLoading, refetch } = useQuery({
    queryKey: ['/api/devices'],
  });

  // Add a log entry
  const addLogEntry = (level: string, message: string) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    setLogs(prevLogs => [
      ...prevLogs,
      {
        level,
        timestamp,
        message
      }
    ]);
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Refresh device status
  const refreshDeviceStatus = async () => {
    try {
      await refetch();
      addLogEntry("info", "Device status refreshed");
      toast({
        title: "Status Updated",
        description: "Device status has been refreshed.",
      });
    } catch (err) {
      addLogEntry("error", `Failed to refresh status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to refresh device status.",
        variant: "destructive",
      });
    }
  };

  // Handle settings dialog
  const handleSettings = () => {
    setIsSettingsOpen(true);
  };

  // Initial data fetch and log
  useEffect(() => {
    refreshDeviceStatus();
    addLogEntry("info", "Dashboard initialized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log errors from data fetching
  useEffect(() => {
    if (error) {
      addLogEntry("error", `Error fetching device status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [error]);

  // Extract device statuses or set defaults with debugging
  useEffect(() => {
    if (deviceStatus) {
      console.log("Device status data:", deviceStatus);
    }
  }, [deviceStatus]);
  
  const usbStatus = deviceStatus?.data?.usb || { connected: false };
  const hdmiStatus = deviceStatus?.data?.hdmi || { connected: false, resolution: "N/A", refresh: 0 };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader onRefresh={refreshDeviceStatus} onSettings={handleSettings} />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Device Status Panel */}
          <DeviceStatusPanel 
            usbStatus={usbStatus} 
            hdmiStatus={hdmiStatus}
            refreshStatus={refreshDeviceStatus}
          />
          
          {/* Data Transfer and Logging panels */}
          <section className="lg:col-span-7 space-y-6">
            <DataTransferPanel 
              usbStatus={usbStatus} 
              hdmiStatus={hdmiStatus}
              addLogEntry={addLogEntry}
            />
            <LoggingPanel logs={logs} clearLogs={clearLogs} />
          </section>
        </div>
      </main>
      
      <Footer />
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure device adapter settings. This feature is not yet implemented.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Settings functionality will be available in a future update.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
