import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

const ContactSection: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey 👋 I'm CredaBot — your assistant from CreditX!" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Dummy bot reply logic
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // simulate typing delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = getDummyResponse(input);
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 1000);
  };

  // simple mock bot replies
  const getDummyResponse = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("hello")) return "Hey there 👋! How can I help you today?";
    if (lower.includes("offer")) return "🎁 We have 5% cashback offers on Gold Cards!";
    if (lower.includes("creditx")) return "💳 CreditX helps you manage cards, track payments, and earn rewards!";
    if (lower.includes("bye")) return "Goodbye 👋! Hope to chat again soon.";
    return "🤔 Hmm... interesting! Could you tell me more?";
  };

  return (
    <>
      {/* 🌟 Contact Footer */}
      <footer
        id="contact"
        className="relative overflow-hidden py-20 mt-10 bg-gradient-to-br from-[#0f0f10] via-[#1a1a1d] to-[#2c2c2f] text-white"
      >
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h4
            className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Let's Connect ✨
          </motion.h4>

          <motion.p
            className="text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Got feedback, ideas, or want to collaborate?  
            We’d love to hear from you — drop us a message anytime.
          </motion.p>

          <motion.a
            href="mailto:support@creditx.example"
            whileHover={{ scale: 1.1, boxShadow: "0px 0px 20px #E3C770" }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 rounded-full bg-[#E3C770] text-black font-semibold tracking-wide transition-transform"
          >
            Email Us 📧
          </motion.a>

          <motion.div
            className="mt-10 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <motion.span
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white">CreditX</span> — Built with ❤️
            </motion.span>
          </motion.div>
        </div>
      </footer>

      {/* 💬 Floating Chat Button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 bg-yellow-400 text-black p-4 rounded-full shadow-lg hover:shadow-yellow-400/50 z-50"
      >
        {chatOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
        )}
      </motion.button>

      {/* 💭 Chat Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-28 right-8 bg-[#1c1c1f] border border-gray-700 rounded-2xl w-80 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#232326]">
              <h5 className="font-semibold text-yellow-300">CredaBot 💬</h5>
              <span className="text-xs text-gray-400">Ask anything</span>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "bot" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.sender === "user"
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs">
                    CredaBot is typing<span className="animate-pulse">...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-700 flex items-center bg-[#232326]">
              <input
                type="text"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="p-2 text-yellow-400 hover:text-yellow-300"
              >
                <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactSection;
