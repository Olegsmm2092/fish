import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onSettings: () => void;
}

export default function DashboardHeader({ onRefresh, onSettings }: DashboardHeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Device Adapter Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-white/10 hover:bg-white/20" 
            variant="ghost"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            className="bg-white/10 hover:bg-white/20" 
            variant="ghost"
            onClick={onSettings}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
