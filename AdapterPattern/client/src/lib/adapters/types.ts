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
