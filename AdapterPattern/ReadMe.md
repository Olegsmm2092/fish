# Adapter Pattern Example: Device Adapter Dashboard

This project demonstrates the Adapter Pattern using a simple Device Adapter Dashboard. The dashboard allows users to manage and transfer data between USB and HDMI interfaces.

## Overview

The Adapter Pattern is a structural design pattern that allows objects with incompatible interfaces to collaborate. It acts as a wrapper around an existing class, translating its interface into another interface that clients expect.

In this example, we have two interfaces:

* **USB Interface:** Represents a USB connection.
* **HDMI Interface:** Represents an HDMI connection.

The dashboard uses an adapter to allow data transfer between these interfaces, even though they have different ways of handling data.

## Frontend Screenshots

The provided screenshots show the frontend of the Device Adapter Dashboard in a sequence, as if going through a deployment process.

**1. Initial State - Device Status:**

![Initial Device Status](img/AdapterPattern%20to%20git.png)  


This screen shows the initial state of the devices. The USB interface is disconnected, while the HDMI interface is connected and displaying its resolution and refresh rate.

**2. Quick Actions and Data Transfer Setup:**

![Quick Actions and Data Transfer](img/AdapterPattern%202%20to%20git.png)  


Here, we see the "Quick Actions" available, such as initializing or disconnecting all devices. The "Data Transfer" section allows you to enter a data payload and select the source and target devices.

**3. Attempting Data Transfer with Disconnected USB:**

![Transfer Attempt with Disconnected USB](img/AdapterPattern%203%20to%20git.png)  

An attempt to transfer data from the disconnected USB interface to the HDMI interface results in an error, indicated in the "Transfer Results" and "Operation Logs" sections.

**4. Successful Data Transfer After Connecting USB:**

![Successful Data Transfer](img/AdapterPattern%204%20to%20git.png)  

After connecting the USB interface, a subsequent data transfer is successful, as shown in the "Transfer Results" and "Operation Logs". The logs also display device status refreshes.

**5. Operation Logs:**

![Operation Logs](img/AdapterPattern%204%20to%20git.png)  

This screenshot shows the latest state of the operation logs, perhaps after a refresh or further actions. It should reflect the most recent activities and statuses.



## Functionality

The dashboard provides the following functionality:

* **Connect/Disconnect:** Users can connect or disconnect the USB and HDMI interfaces.
* **Data Transfer:** Users can transfer data from the USB interface to the HDMI interface.
* **Status Reports:** Users can export status reports.
* **Operation Logs:** Users can view a log of events, including errors and successful operations.

## Adapter Pattern Implementation

The Adapter Pattern is implemented in the backend (not shown in the screenshots). The adapter acts as a bridge between the USB and HDMI interfaces, allowing data to be transferred between them.

The adapter class:

* Implements the target interface (e.g., a common interface for data transfer).
* Contains an instance of the adaptee class (e.g., the USB or HDMI interface).
* Translates the requests from the client to the adaptee's interface.

## How to Run

1.  Clone the repository.
2.  Install the necessary dependencies (if any).
3.  Run the application.
4.  Open the dashboard in your web browser.

## Conclusion

This example demonstrates how the Adapter Pattern can be used to allow objects with incompatible interfaces to collaborate. The Device Adapter Dashboard provides a simple interface for managing and transferring data between USB and HDMI interfaces.
