import React, { useState } from "react";
import Navbar2 from "../components/Navbar2";
import { motion } from "framer-motion";
import { MessageCircle, Send, Bot, User, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I add a new card?",
    a: "Go to Dashboard → Add New Card, fill in your card details and tap 'Save'.",
  },
  {
    q: "How do I view my card details?",
    a: "Tap on any card in Dashboard and select the eye icon to view details.",
  },
  {
    q: "How can I block a card?",
    a: "Go to Dashboard → Manage Cards → Select your card → Click 'Block Card'.",
  },
  {
    q: "How do I reset my PIN?",
    a: "Go to 'PIN Management' and follow the steps to securely reset your PIN.",
  },
];

const Support: React.FC = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    { text: string; from: "user" | "bot" | "manual" }[]
  >([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = { text: chatInput, from: "user" } as const;
    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    setTimeout(() => {
      const lower = newMessage.text.toLowerCase();
      let response = "Hmm, could you please clarify that?";
      if (lower.includes("card")) response = "You can manage cards from the Dashboard.";
      else if (lower.includes("pin")) response = "Visit the 'PIN Management' page to reset or update your PIN.";
      else if (lower.includes("loan")) response = "You can check your loan details under Financial Info.";
      else if (lower.includes("help")) response = "I'm here to help! Try asking about 'card', 'PIN', or 'loan'.";

      setMessages((prev) => [
        ...prev,
        { text: response, from: "bot" },
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Navbar2 />
      <div className="max-w-5xl mx-auto p-6 space-y-10">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-yellow-400 text-center"
        >
          💬 Support & Help Center
        </motion.h1>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                onClick={() =>
                  setExpandedFaq(expandedFaq === idx ? null : idx)
                }
                className="bg-gray-800/80 p-5 rounded-2xl cursor-pointer hover:bg-gray-700/70 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    expandedFaq === idx
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-300 mt-3">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
            Chat with Support
          </h2>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 px-2">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-xs md:max-w-sm ${
                    msg.from === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {msg.from === "bot" ? (
                    <Bot className="text-yellow-400 mt-1" size={20} />
                  ) : (
                    <User className="text-gray-400 mt-1" size={20} />
                  )}
                  <div
                    className={`p-3 rounded-2xl shadow-md ${
                      msg.from === "user"
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-3">
            <input
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="bg-yellow-400 p-3 rounded-full shadow-lg hover:shadow-yellow-500/30 transition"
            >
              <Send className="text-black" size={20} />
            </motion.button>
          </div>

          {/* Manual Contact */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>
              Still need help? Email us at{" "}
              <span className="text-yellow-400 font-semibold">
                support@finassist.com
              </span>{" "}
              or call{" "}
              <span className="text-yellow-400 font-semibold">
                +91 98765 43210
              </span>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
