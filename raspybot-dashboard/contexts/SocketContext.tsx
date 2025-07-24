"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Obtener la IP de .env o default RPI local...
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (!socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Conectado al server:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("Desconectado del server");
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
      };
    }
  }, [SOCKET_URL]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};