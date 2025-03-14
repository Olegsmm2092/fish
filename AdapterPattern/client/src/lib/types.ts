export interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
}

export interface DeviceStatus {
  usb: {
    connected: boolean;
    lastActivity?: string;
  };
  hdmi: {
    connected: boolean;
    resolution?: string;
    refresh?: number;
  };
}

export interface TransferDataRequest {
  data: string;
  source?: string;
  target?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}
