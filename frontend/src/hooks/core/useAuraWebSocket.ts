"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAuraStore } from "@/stores";

type Opts = {
  url?: string;
  heartbeatMs?: number;
  reconnectBaseMs?: number;
  maxReconnects?: number;
};

export function useAuraWebSocket(opts: Opts = {}) {
  const addMessage = useAuraStore((s) => s.addMessage);
  const setWebsocketStatus = useAuraStore((s) => s.setWebsocketStatus);

  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectsRef = useRef(0);
  const sendRef = useRef<(data: unknown) => boolean>(() => false);

  const url =
    opts.url ??
    (typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_WS_URL as string)
      : "") ??
    "";

  const heartbeatMs = opts.heartbeatMs ?? 30000;
  const baseMs = opts.reconnectBaseMs ?? 1000;
  const maxReconnects = opts.maxReconnects ?? 10;

  const connect = useCallback(() => {
    if (!url) { setWebsocketStatus("error"); return; }

    try {
      setWebsocketStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      sendRef.current = (data: unknown) => {
        try {
          if (!ws || ws.readyState !== WebSocket.OPEN) return false;
          ws.send(typeof data === "string" ? data : JSON.stringify(data));
          return true;
        } catch { return false; }
      };

      ws.onopen = () => {
        setWebsocketStatus("connected");
        reconnectsRef.current = 0;
        if (hbRef.current) clearInterval(hbRef.current);
        hbRef.current = setInterval(() => {
          try { ws.send(JSON.stringify({ type: "ping", t: Date.now() })); } catch {}
        }, heartbeatMs);
      };

      ws.onmessage = (ev) => {
        let payload: any = ev.data;
        try { payload = JSON.parse(String(ev.data)); } catch {}
        const text =
          typeof payload === "string" ? payload :
          payload?.content ?? payload?.message ?? JSON.stringify(payload);
        addMessage({
          id: "ws-" + Date.now(),
          role: "assistant",
          content: String(text),
          timestamp: Date.now(),
        });
      };

      ws.onerror = () => { setWebsocketStatus("error"); };

      ws.onclose = () => {
        setWebsocketStatus("disconnected");
        if (hbRef.current) { clearInterval(hbRef.current); hbRef.current = null; }
        if (reconnectsRef.current < maxReconnects) {
          const delay = Math.min(baseMs * 2 ** reconnectsRef.current, 15000);
          reconnectsRef.current += 1;
          setTimeout(connect, delay);
        }
      };
    } catch {
      setWebsocketStatus("error");
    }
  }, [url, heartbeatMs, baseMs, maxReconnects, setWebsocketStatus, addMessage]);

  useEffect(() => {
    connect();
    return () => {
      try { wsRef.current?.close(); } catch {}
      if (hbRef.current) { clearInterval(hbRef.current); hbRef.current = null; }
    };
  }, [connect]);

  return { send: (data: unknown) => sendRef.current(data) };
}
