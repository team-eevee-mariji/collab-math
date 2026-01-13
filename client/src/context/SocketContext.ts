import { createContext, useContext } from "react";
import type { MessageToBackend, MessageToFrontend } from "../types";

export type SocketEventHandler = (event: MessageToFrontend) => void;

export type SocketContextValue = {
  isConnected: boolean;
  send: (msg: MessageToBackend) => void;
  subscribe: (handler: SocketEventHandler) => () => void;
};

export const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
}
