import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext, type SocketContextValue, type SocketEventHandler } from "./SocketContext";
import type { MessageToBackend, MessageToFrontend } from "../types";

type PayloadFor<E extends MessageToFrontend["event"]> = Extract<
  MessageToFrontend,
  { event: E }
>["payload"];

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
    socket.on("AWAITING_PLAYER", () => {
      handlersRef.current.forEach((fn) => fn({ event: "AWAITING_PLAYER", payload: null }));
    });
    socket.on("GAME_START", (payload: PayloadFor<"GAME_START">) => {
      handlersRef.current.forEach((fn) => fn({ event: "GAME_START", payload }));
    });
    socket.on("LIVE_FEEDBACK", (payload: PayloadFor<"LIVE_FEEDBACK">) => {
      handlersRef.current.forEach((fn) => fn({ event: "LIVE_FEEDBACK", payload }));
    });
    socket.on("NEXT_LEVEL", (payload: PayloadFor<"NEXT_LEVEL">) => {
      handlersRef.current.forEach((fn) => fn({ event: "NEXT_LEVEL", payload }));
    });
    socket.on("HELP_STATUS", (payload: PayloadFor<"HELP_STATUS">) => {
      handlersRef.current.forEach((fn) => fn({ event: "HELP_STATUS", payload }));
    });
    socket.on("GAME_OVER", (payload: PayloadFor<"GAME_OVER">) => {
      handlersRef.current.forEach((fn) => fn({ event: "GAME_OVER", payload }));
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
        socketRef.current?.emit(msg.command, msg.payload);
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
