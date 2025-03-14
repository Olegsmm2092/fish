import { HDMIInterface } from './types';

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
    console.log(`Displaying on HDMI: ${data}`);
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
