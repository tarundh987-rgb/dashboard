"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  initializeSocket,
  disconnectSocket,
  getSocket,
} from "@/lib/socket-client";
import { useAppSelector } from "@/redux/hooks";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (user) {
      // Get auth token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      if (token) {
        const newSocket = initializeSocket(token);

        newSocket.on("connect", () => {
          console.log("Socket connected");
          setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });

        setSocket(newSocket);
      }
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
