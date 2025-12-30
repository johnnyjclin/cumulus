"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";
import { ExclamationCircleIcon, PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const StabilityAIPage: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("sd3-large");
  const [aspectRatio, setAspectRatio] = useState("1:1");
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

  const handleGenerate = async () => {
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
      console.log("Submitting Stability AI request with x402...");
      const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as any);

      const response = await fetchWithPayment("/api/payment/stability-ai/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": walletClient.account.address,
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          model,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: userMessage.content,
        timestamp: new Date(),
        imageUrl: `data:image/png;base64,${data.image}`,
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
      handleGenerate();
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10 pb-10">
      <div className="px-5 max-w-5xl w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-base-100 shadow-lg rounded-t-3xl p-6 border border-base-300 border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhotoIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Stability AI</h1>
                <p className="text-xs text-base-content/60">Text-to-Image Generation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="select select-bordered select-sm"
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
              </select>
              <select
                className="select select-bordered select-sm"
                value={model}
                onChange={e => setModel(e.target.value)}
              >
                <option value="sd3-large">SD3 Large</option>
                <option value="sd3-large-turbo">SD3 Large Turbo</option>
                <option value="sd3-medium">SD3 Medium</option>
              </select>
            </div>
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
                <PhotoIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold mb-2">Create your first image</p>
                <p className="text-sm">Describe what you want to see and AI will generate it!</p>
                <p className="text-xs mt-2">Price: $0.15 per image</p>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "user" ? (
                <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-primary text-primary-content rounded-br-sm">
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                </div>
              ) : (
                <div className="max-w-[75%] rounded-2xl p-4 bg-base-100 rounded-bl-sm border border-base-300">
                  <div className="mb-2">
                    <p className="text-xs text-base-content/60 mb-2">{message.content}</p>
                  </div>
                  {message.imageUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={message.imageUrl}
                        alt="Generated"
                        className="w-full h-auto"
                        width={400}
                        height={192}
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-base-100 rounded-2xl px-4 py-3 border border-base-300">
                <div className="flex gap-1 items-center">
                  <span className="loading loading-dots loading-sm"></span>
                  <span className="text-xs text-base-content/60">Generating image...</span>
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
              placeholder="Describe the image you want to create... (Press Enter to generate)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={2}
            />
            <button
              className={`btn btn-primary btn-square ${loading ? "loading" : ""}`}
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
            >
              {!loading && <PaperAirplaneIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-base-content/50 mt-2">💰 $0.15 per image · Protected by x402 Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default StabilityAIPage;
