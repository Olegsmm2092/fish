import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogEntry } from "@/lib/types";

interface LoggingPanelProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

export default function LoggingPanel({ logs, clearLogs }: LoggingPanelProps) {
  const [logLevel, setLogLevel] = useState("all");

  const filteredLogs = logLevel === "all" 
    ? logs 
    : logs.filter(log => log.level === logLevel);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-400";
      case "warn": return "text-yellow-400";
      case "debug": return "text-blue-400";
      case "info": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Operation Logs</h2>
        <div className="flex space-x-2">
          <Select
            value={logLevel}
            onValueChange={setLogLevel}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="h-8 px-3"
            onClick={clearLogs}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-900 text-gray-100 rounded-lg p-3 h-64 overflow-y-auto font-mono text-sm">
        {filteredLogs.length > 0 ? (
          [...filteredLogs].reverse().map((log, index) => (
            <div key={index} className="log-entry mb-2 pb-2 border-b border-gray-700">
              <div className="flex">
                <span className={`${getLevelColor(log.level)} mr-2`}>[{log.level.toUpperCase()}]</span>
                <span className="text-gray-300">{log.timestamp}</span>
              </div>
              <div className="pl-5 mt-1">{log.message}</div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-10">No logs to display</div>
        )}
      </div>
    </Card>
  );
}
