import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext, type SocketContextValue, type SocketEventHandler } from "./SocketContext";
import type { MessageToBackend, MessageToFrontend } from "../types";

// type PayloadFor<E extends MessageToFrontend["event"]> = Extract<
//   MessageToFrontend,
//   { event: E }
// >["payload"];

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Stable listener set (no re-render when subs change).
  const handlersRef = useRef(new Set<SocketEventHandler>());

  useEffect(() => {
    const socket = io("http://localhost:3000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Backend -> Frontend: IPC event names match the protocol.
    socket.on("message", (data: MessageToFrontend) => {
      handlersRef.current.forEach(handler => handler(data));
    });

    // Copy ref to local const for cleanup (silences lint warning).
    const handlers = handlersRef.current;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      handlers.clear();
    };
  }, []);

  const value = useMemo<SocketContextValue>(() => {
    return {
      isConnected,

      // Frontend -> Backend: IPC command names match the protocol.
      send: (msg: MessageToBackend) => {
        socketRef.current?.emit('message', msg);
      },

      // Subscribe returns an unsubscribe fn.
      subscribe: (handler: SocketEventHandler) => {
        handlersRef.current.add(handler);
        return () => handlersRef.current.delete(handler);
      },
    };
  }, [isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
