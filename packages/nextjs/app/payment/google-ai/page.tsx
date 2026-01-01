"use client";

import { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";
import { ExclamationCircleIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { GOOGLE_AI_API_AMOUNT } from "~~/constants";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

const GoogleAIPage: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash-exp");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (!walletClient) {
      setError("Please connect your wallet first.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      console.log("Submitting Google AI request with x402...");
      const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as any);

      const response = await fetchWithPayment("/api/payment/google-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": walletClient.account.address,
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          model,
        }),
      });

      // Extract x-payment-response header for tx hash
      const paymentResponseHeader = response.headers.get("x-payment-response");
      console.log("x-payment-response:", paymentResponseHeader);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        usage: data.usage,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An error occurred during generation");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10 pb-10">
      <div className="px-5 max-w-5xl w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-base-100 shadow-lg rounded-t-3xl p-6 border border-base-300 border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Google AI Chat</h1>
                <p className="text-xs text-base-content/60">Powered by Gemini</p>
              </div>
            </div>
            <select className="select select-bordered select-sm" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          className="bg-base-200/50 border-x border-base-300 flex-1 overflow-y-auto p-6 space-y-4"
          style={{ height: "600px" }}
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-base-content/50">
                <SparklesIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold mb-2">Start a conversation</p>
                <p className="text-sm">Ask me anything about AI, code, or creative writing!</p>
                <p className="text-xs mt-2">Price: ${GOOGLE_AI_API_AMOUNT} per message</p>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-content rounded-br-sm"
                    : "bg-base-100 text-base-content rounded-bl-sm border border-base-300"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                {message.usage && (
                  <div className="text-xs opacity-60 mt-2 pt-2 border-t border-current/10">
                    {message.usage.totalTokens} tokens
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-base-100 rounded-2xl px-4 py-3 border border-base-300">
                <div className="flex gap-1">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border-x border-base-300 px-6 py-3 flex items-center gap-2 text-error text-sm">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-base-100 shadow-lg rounded-b-3xl p-6 border border-base-300 border-t-0">
          <div className="flex gap-3">
            <textarea
              className="textarea textarea-bordered rounded-none flex-1 resize-none focus:outline-none"
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={2}
            />
            <button
              className={`btn btn-primary btn-square ${loading ? "loading" : ""}`}
              onClick={handleSend}
              disabled={!prompt.trim() || loading}
              type="button"
            >
              {!loading && <PaperAirplaneIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-base-content/50 mt-2">
            💰 ${GOOGLE_AI_API_AMOUNT} per message · Protected by x402 Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAIPage;
