"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// SignalR client library
let signalR = null;

/**
 * Custom hook for SignalR connection to receive real-time notifications
 * @param {string} userId - Current user's ID to join their notification group
 * @param {object} handlers - Event handlers for different notification types
 */
export function useSignalR(userId, handlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const connectionRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    if (!userId) return;

    try {
      // Dynamic import for SignalR
      if (!signalR) {
        signalR = await import("@microsoft/signalr");
      }

      // Create connection to SignalR Hub
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7001"}/hubs/notification`, {
          withCredentials: true,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Handle connection events
      connection.onclose((error) => {
        console.log("SignalR connection closed", error);
        setIsConnected(false);
      });

      connection.onreconnecting((error) => {
        console.log("SignalR reconnecting...", error);
        setIsConnected(false);
      });

      connection.onreconnected((connectionId) => {
        console.log("SignalR reconnected", connectionId);
        setIsConnected(true);
        // Rejoin user group after reconnection
        connection.invoke("JoinUserGroup", userId);
      });

      // Register event handlers
      
      // Bill payment received (for owner)
      connection.on("BillPaymentReceived", (notification) => {
        console.log("Bill payment received:", notification);
        handlers.onBillPaymentReceived?.(notification);
      });

      // Bill payment confirmed (for tenant)
      connection.on("BillPaymentConfirmed", (notification) => {
        console.log("Bill payment confirmed:", notification);
        handlers.onBillPaymentConfirmed?.(notification);
      });

      // Bill status updated (broadcast to all)
      connection.on("BillStatusUpdated", (data) => {
        console.log("Bill status updated:", data);
        handlers.onBillStatusUpdated?.(data);
      });

      // New bill created (for tenant)
      connection.on("NewBillCreated", (notification) => {
        console.log("New bill created:", notification);
        handlers.onNewBillCreated?.(notification);
      });

      // General message
      connection.on("ReceiveMessage", (message) => {
        console.log("Message received:", message);
        handlers.onMessage?.(message);
      });

      connection.on("ReceiveNotification", (notification) => {
        console.log("Notification received:", notification);
        handlers.onNotification?.(notification);
      });

      // Start connection
      await connection.start();
      console.log("SignalR connected successfully");
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      // Join user's notification group
      await connection.invoke("JoinUserGroup", userId);
      console.log(`Joined notification group for user: ${userId}`);

      connectionRef.current = connection;
    } catch (error) {
      console.error("SignalR connection error:", error);
      setConnectionError(error.message);
      setIsConnected(false);

      // Retry connection
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Retrying connection in ${delay}ms...`);
        setTimeout(connect, delay);
      }
    }
  }, [userId, handlers]);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        console.log("SignalR disconnected");
      } catch (error) {
        console.error("Error disconnecting SignalR:", error);
      }
      connectionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Hook specifically for bill-related real-time updates
 */
export function useBillNotifications(userId, onUpdate) {
  const handlersRef = useRef({});
  
  useEffect(() => {
    handlersRef.current = {
      onBillPaymentReceived: (notification) => {
        onUpdate?.("payment_received", notification);
      },
      onBillPaymentConfirmed: (notification) => {
        onUpdate?.("payment_confirmed", notification);
      },
      onBillStatusUpdated: (data) => {
        onUpdate?.("status_updated", data);
      },
      onNewBillCreated: (notification) => {
        onUpdate?.("bill_created", notification);
      },
    };
  }, [onUpdate]);

  return useSignalR(userId, handlersRef.current);
}

export default useSignalR;
