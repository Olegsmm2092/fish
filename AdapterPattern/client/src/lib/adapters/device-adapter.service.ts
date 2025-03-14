import { USBService } from './usb.service';
import { HDMIService } from './hdmi.service';
import { logger } from '@/lib/logger';

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
    
    return { usb: usbDisconnected, hdmi: hdmiDisconnected };
  }

  async transferData(data: string): Promise<boolean> {
    try {
      // Get data from USB
      const usbData = await this.usbService.sendData(data);
      
      // Convert USB data format to HDMI format (adapter pattern)
      const hdmiCompatibleData = this.convertToHDMIFormat(usbData);
      
      // Send to HDMI display
      return await this.hdmiService.displayData(hdmiCompatibleData);
    } catch (error) {
      logger.error('Data transfer failed', { error });
      throw new Error('Failed to transfer data between devices');
    }
  }

  async getDeviceStatus(): Promise<{
    usb: { connected: boolean };
    hdmi: { connected: boolean; resolution?: string; refresh?: number };
  }> {
    const hdmiConnected = this.hdmiService.isConnected();
    let hdmiStatus: any = { connected: hdmiConnected };
    
    if (hdmiConnected) {
      const displayStatus = await this.hdmiService.getDisplayStatus();
      hdmiStatus = { ...hdmiStatus, ...displayStatus };
    }
    
    return {
      usb: { connected: this.usbService.isConnected() },
      hdmi: hdmiStatus
    };
  }

  private convertToHDMIFormat(usbData: string): string {
    // Convert USB data format to HDMI format
    return `[HDMI_FORMAT]${usbData}`;
  }
}
