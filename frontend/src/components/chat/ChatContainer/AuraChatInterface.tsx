"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAuraStore } from "@/stores";
import PersonalityRadar3D from "@/components/visualization/PersonalitySpectrum/PersonalityRadar3D";
import { useAuraWebSocket } from "@/hooks/core/useAuraWebSocket";

function WsStatusBadge() {
  const ws = useAuraStore(s => s.websocketStatus);
  const color =
    ws === "connected" || ws === "open" ? "bg-green-500" :
    ws === "connecting" ? "bg-yellow-500" :
    ws === "error" ? "bg-red-500" : "bg-gray-400";
  const label = ws ?? "disconnected";
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-gray-600 dark:text-gray-300">WS: {label}</span>
    </div>
  );
}

export default function AuraChatInterface() {
  const { messages, addMessage, isLoading, setLoading, personality } = useAuraStore();
  const { send: wsSend } = useAuraWebSocket();

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setLoading(true);
    addMessage({ id: "u-"+Date.now(), content: text, role: "user", timestamp: Date.now() });

    const ok = wsSend({ type: "chat", content: text });
    if (!ok) {
      // локальный фолбэк-ответ для стабильной сборки
      setTimeout(() => {
        addMessage({ id: "a-"+Date.now(), content: "Acknowledged: "+text, role: "assistant", timestamp: Date.now() });
        setLoading(false);
      }, 300);
    } else {
      setLoading(false);
    }
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-96 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Personality</h2>
        <PersonalityRadar3D personality={personality} />
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AuraPartner AI</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Natural Contextual Intelligence</p>
            </div>
            <WsStatusBadge />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${m.role==="user"?"bg-blue-600 text-white":"bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"} px-4 py-2 rounded-lg max-w-2xl`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div className="text-xs opacity-70 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-3">
            <textarea
              rows={1}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
              placeholder="Type your message…"
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-400"
            >Send</button>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter — send, Shift+Enter — newline</div>
        </footer>
      </main>
    </div>
  );
}
