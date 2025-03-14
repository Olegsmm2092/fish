import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DeviceAdapterService } from "./api/devices";

// Create a singleton instance of the DeviceAdapterService
const deviceAdapter = new DeviceAdapterService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Device API routes
  app.post("/api/devices", async (req, res) => {
    try {
      if (req.query.action === "connect") {
        const result = await deviceAdapter.initializeDevices();
        return res.status(200).json({ success: true, data: result });
      } else if (req.query.action === "transfer") {
        const { data } = req.body;
        if (!data) {
          return res.status(400).json({ success: false, error: "Missing data payload" });
        }
        const result = await deviceAdapter.transferData(data);
        return res.status(200).json({ success: true, data: result });
      }
      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/devices", async (req, res) => {
    try {
      if (req.query.action === "status") {
        const status = await deviceAdapter.getDeviceStatus();
        return res.status(200).json({ success: true, data: status });
      }
      
      // Default behavior - return device status
      const status = await deviceAdapter.getDeviceStatus();
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/devices", async (req, res) => {
    try {
      if (req.query.action === "disconnect") {
        const result = await deviceAdapter.disconnectDevices();
        return res.status(200).json({ success: true, data: result });
      }
      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Individual device routes
  app.post("/api/devices/:deviceType", async (req, res) => {
    try {
      const { deviceType } = req.params;
      if (deviceType !== "usb" && deviceType !== "hdmi") {
        return res.status(400).json({ success: false, error: "Invalid device type" });
      }

      if (req.query.action === "connect") {
        const result = await deviceAdapter.connectDevice(deviceType);
        return res.status(200).json({ success: true, data: result });
      }
      
      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/devices/:deviceType", async (req, res) => {
    try {
      const { deviceType } = req.params;
      if (deviceType !== "usb" && deviceType !== "hdmi") {
        return res.status(400).json({ success: false, error: "Invalid device type" });
      }

      if (req.query.action === "disconnect") {
        const result = await deviceAdapter.disconnectDevice(deviceType);
        return res.status(200).json({ success: true, data: result });
      }
      
      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
