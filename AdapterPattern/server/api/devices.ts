import { logger } from "./logger";

export interface DataSource {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
}

export interface USBInterface extends DataSource {
  sendData(data: string): Promise<string>;
  receiveData(): Promise<string>;
}

export interface HDMIInterface extends DataSource {
  displayData(data: string): Promise<boolean>;
  getDisplayStatus(): Promise<{ resolution: string; refresh: number }>;
}

export class USBService implements USBInterface {
  private connected: boolean = false;

  async connect(): Promise<boolean> {
    // Simulate USB connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        resolve(true);
      }, 500);
    });
  }

  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sendData(data: string): Promise<string> {
    if (!this.connected) {
      throw new Error('USB not connected');
    }
    
    // Simulate data sending
    return `USB_PROCESSED:${data}`;
  }

  async receiveData(): Promise<string> {
    if (!this.connected) {
      throw new Error('USB not connected');
    }
    
    return 'USB_DATA_SAMPLE';
  }
}

export class HDMIService implements HDMIInterface {
  private connected: boolean = false;
  private resolution: string = '1080p';
  private refreshRate: number = 60;

  async connect(): Promise<boolean> {
    // Simulate HDMI connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        resolve(true);
      }, 700);
    });
  }

  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async displayData(data: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('HDMI not connected');
    }
    
    // Simulate displaying data
    logger.info(`Displaying on HDMI: ${data}`);
    return true;
  }

  async getDisplayStatus(): Promise<{ resolution: string; refresh: number }> {
    if (!this.connected) {
      throw new Error('HDMI not connected');
    }
    
    return {
      resolution: this.resolution,
      refresh: this.refreshRate
    };
  }
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }
  
  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }
  
  error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta);
  }
  
  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }
  
  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    // In production, you might use a more sophisticated logging solution
    console.log(`[${level.toUpperCase()}] ${message}`, meta || '');
  }
}

export const logger = new Logger();

export class DeviceAdapterService {
  private usbService: USBService;
  private hdmiService: HDMIService;

  constructor() {
    this.usbService = new USBService();
    this.hdmiService = new HDMIService();
  }

  async initializeDevices(): Promise<{ usb: boolean; hdmi: boolean }> {
    try {
      const [usbConnected, hdmiConnected] = await Promise.all([
        this.usbService.connect(),
        this.hdmiService.connect()
      ]);
      
      logger.info('All devices initialized successfully');
      return { usb: usbConnected, hdmi: hdmiConnected };
    } catch (error) {
      logger.error('Device initialization failed', { error });
      throw new Error('Failed to initialize devices');
    }
  }

  async disconnectDevices(): Promise<{ usb: boolean; hdmi: boolean }> {
    const [usbDisconnected, hdmiDisconnected] = await Promise.all([
      this.usbService.disconnect(),
      this.hdmiService.disconnect()
    ]);
    
    logger.info('All devices disconnected successfully');
    return { usb: usbDisconnected, hdmi: hdmiDisconnected };
  }

  async connectDevice(deviceType: string): Promise<boolean> {
    try {
      if (deviceType === 'usb') {
        const result = await this.usbService.connect();
        logger.info('USB device connected successfully');
        return result;
      } else if (deviceType === 'hdmi') {
        const result = await this.hdmiService.connect();
        logger.info('HDMI device connected successfully');
        return result;
      } else {
        throw new Error(`Unknown device type: ${deviceType}`);
      }
    } catch (error) {
      logger.error(`Failed to connect ${deviceType} device`, { error });
      throw error;
    }
  }

  async disconnectDevice(deviceType: string): Promise<boolean> {
    try {
      if (deviceType === 'usb') {
        const result = await this.usbService.disconnect();
        logger.info('USB device disconnected successfully');
        return result;
      } else if (deviceType === 'hdmi') {
        const result = await this.hdmiService.disconnect();
        logger.info('HDMI device disconnected successfully');
        return result;
      } else {
        throw new Error(`Unknown device type: ${deviceType}`);
      }
    } catch (error) {
      logger.error(`Failed to disconnect ${deviceType} device`, { error });
      throw error;
    }
  }

  async transferData(data: string): Promise<boolean> {
    try {
      logger.debug(`Transferring data: ${data}`);
      
      // Get data from USB
      const usbData = await this.usbService.sendData(data);
      logger.debug(`USB processed data: ${usbData}`);
      
      // Convert USB data format to HDMI format (adapter pattern)
      const hdmiCompatibleData = this.convertToHDMIFormat(usbData);
      logger.debug(`Converted to HDMI format: ${hdmiCompatibleData}`);
      
      // Send to HDMI display
      const result = await this.hdmiService.displayData(hdmiCompatibleData);
      
      if (result) {
        logger.info('Data successfully transferred between devices');
      }
      
      return result;
    } catch (error) {
      logger.error('Data transfer failed', { error });
      throw new Error(`Failed to transfer data between devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDeviceStatus(): Promise<{
    usb: { connected: boolean };
    hdmi: { connected: boolean; resolution?: string; refresh?: number };
  }> {
    const hdmiConnected = this.hdmiService.isConnected();
    let hdmiStatus: any = { connected: hdmiConnected };
    
    if (hdmiConnected) {
      try {
        const displayStatus = await this.hdmiService.getDisplayStatus();
        hdmiStatus = { ...hdmiStatus, ...displayStatus };
      } catch (error) {
        logger.error('Failed to get HDMI display status', { error });
        // Keep the connected status but don't add additional properties
      }
    }
    
    return {
      usb: { connected: this.usbService.isConnected() },
      hdmi: hdmiStatus
    };
  }

  private convertToHDMIFormat(usbData: string): string {
    // Convert USB data format to HDMI format (adapter pattern in action)
    return `[HDMI_FORMAT]${usbData}`;
  }
}
