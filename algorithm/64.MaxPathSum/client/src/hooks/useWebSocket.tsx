import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export function useWebSocket(options?: UseWebSocketOptions) {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isReconnectingRef = useRef(false);
  
  // Start a heartbeat interval to detect disconnects and keep the connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // Send a ping message to the server
        try {
          socketRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending ping:', error);
        }
      }
    }, 20000); // Ping every 20 seconds
  }, []);
  
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);
  
  const connectWebSocket = useCallback(() => {
    // Don't attempt to reconnect if we're already trying to connect
    if (isReconnectingRef.current) return;
    
    setConnectionStatus('connecting');
    isReconnectingRef.current = true;
    
    // Clean up previous connection if it exists
    if (socketRef.current) {
      if (socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    try {
      // Determine the WebSocket URL based on the current protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create a new WebSocket connection with a unique cache-busting parameter
      const cacheBuster = new Date().getTime();
      const socket = new WebSocket(`${wsUrl}?t=${cacheBuster}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        isReconnectingRef.current = false;
        
        // Start heartbeat after successful connection
        startHeartbeat();
        
        options?.onOpen?.();
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle pong responses (server is alive)
          if (message.type === 'pong') {
            // Connection is still alive, nothing else to do
            return;
          }
          
          // Process other messages normally
          setLastMessage(event.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setLastMessage(event.data);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setConnectionStatus('disconnected');
        options?.onClose?.();
        isReconnectingRef.current = false;
        
        // Stop the heartbeat
        stopHeartbeat();
        
        // Only attempt reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          // Clean up any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Exponential backoff for reconnection with a bit of randomness
          const jitter = Math.random() * 1000;
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current) + jitter, 10000);
          
          console.log(`Scheduling reconnect in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            reconnectAttemptsRef.current += 1;
            connectWebSocket();
          }, delay);
        } else {
          console.log('Maximum reconnection attempts reached. Giving up.');
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        options?.onError?.();
        // Don't close the socket here, let the onclose handler deal with reconnection
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setConnectionStatus('disconnected');
      isReconnectingRef.current = false;
      
      // Try to reconnect after error in connection creation
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect after connection error...');
          reconnectAttemptsRef.current += 1;
          connectWebSocket();
        }, delay);
      }
    }
  }, [options, startHeartbeat, stopHeartbeat]);

  // Connect on component mount
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket, stopHeartbeat]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      
      // If not connected and not in the process of reconnecting, try to reconnect
      if (!isReconnectingRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        connectWebSocket();
      }
      return false;
    }
  }, [connectWebSocket]);

  return { sendMessage, lastMessage, connectionStatus, socket: socketRef.current };
}
