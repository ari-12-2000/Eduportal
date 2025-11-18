"use client";

import { useState, useRef, useEffect } from "react";
import { X, SendHorizonal, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Program } from "@/lib/generated/prisma";

export default function ChatbotSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false); // 👈 NEW: AI Typing indicator

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null); // 👈 NEW: Auto-scroll anchor

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Auto-scroll to bottom anytime messages or typing changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]); // 👈 NEW

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userInput = input;
    setInput("");

    // Show typing indicator
    setTyping(true); // 👈 NEW

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: userInput }),
    });

    const data = await res.json();

    let botText =
      data.success && data.results.length > 0
        ? data.results
          .map((c: Program) => {
            const parts = [];
            // Only print fields if they exist
            if (c.title) parts.push(`📘 *${c.title}*`);
            if (c.category) parts.push(`• Category: ${c.category}`);
            if (c.instructor) parts.push(`• Instructor: ${c.instructor}`);
            if (c.rating !== null && c.rating !== undefined)
              parts.push(`• Rating: ${c.rating} ⭐`);
            if (c.price !== null && c.price !== undefined)
              parts.push(`• Price: ₹${c.price}`);

            return parts.join("\n");
          })
          .join("\n\n")
        : "No matching course found 😕";
    console.log(data)
    // Small delay to make animation feel natural
    await new Promise((r) => setTimeout(r, 400));

    setTyping(false); // 👈 NEW
    setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
  };

  const firstName = user?.first_name;
  const lastName = user?.last_name;
  const nameText = firstName ? `${firstName}${lastName ? ` ${lastName}` : ""}` : null;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
            }}
            className="
              fixed top-0 right-0 bg-white shadow-xl z-50 flex flex-col
              h-screen 
              md:w-[380px]
              w-full max-w-full    /* 👈 MOBILE: full screen */
            "
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12">
                  <Image src="/images/chatbot.png" alt="AI Robot" fill className="object-contain" />
                </div>
                <Sparkles className='h-6 w-6' />
                <h2 className="font-semibold">Eduportal AI</h2>

              </div>

              <button onClick={onClose}>
                <X className="h-6 w-6 text-gray-600 hover:text-black transition" />
              </button>
            </div>

            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-700">
                <h3 className="text-sm text-gray-500">{nameText ? `Hi ${nameText},` : "Hi,"}</h3>
                <p className="text-lg font-semibold mt-1">Welcome! How can I help?</p>
              </div>
            )}

            {/* Chat Area */}
            {messages.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                      p-2 rounded-lg whitespace-pre-line max-w-[75%]
                      ${msg.sender === "user"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-gray-200 text-gray-800"
                        }
                  `}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}


                {/* 👇 NEW: Typing Indicator */}
                {typing && (
                  <div className="flex items-center gap-1 text-gray-500 px-2 py-1">
                    <div className="animate-bounce delay-0">•</div>
                    <div className="animate-bounce delay-150">•</div>
                    <div className="animate-bounce delay-300">•</div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t flex items-end gap-2">
              <textarea
                ref={textareaRef}
                className="flex-1 border rounded px-3 py-2 resize-none max-h-40 overflow-y-auto"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                onClick={sendMessage}
                className="p-3 bg-gradient-to-br from-blue-600 to bg-purple-600 text-white rounded-full hover:bg-blue-500 transition"
              >
                <SendHorizonal className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
