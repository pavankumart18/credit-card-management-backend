import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound, CreditCard } from "lucide-react";
import Navbar2 from "../components/Navbar2";

interface Card {
  id: number;
  title: string;
  number: string;
  gradient: string;
}

const PinManagement: React.FC = () => {
  const [cards] = useState<Card[]>([
    { id: 1, title: "Platinum", number: "**** **** **** 2451", gradient: "from-indigo-500 to-blue-500" },
    { id: 2, title: "Gold", number: "**** **** **** 8741", gradient: "from-yellow-500 to-orange-400" },
    { id: 3, title: "Titanium", number: "**** **** **** 1290", gradient: "from-gray-500 to-gray-700" },
  ]);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleChangePin = () => {
    if (newPin !== confirmPin) {
      alert("New PIN and Confirm PIN do not match!");
      return;
    }
    alert(`PIN for ${selectedCard?.title} card changed successfully! (mock)`);
    setPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Navbar2 />

      <div className="flex flex-col items-center justify-center py-10 px-6">
        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-yellow-400 mb-8 text-center drop-shadow-lg"
        >
          🔐 PIN Management
        </motion.h1>

        {/* Card Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10"
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCard(card)}
              className={`relative p-6 rounded-2xl shadow-lg cursor-pointer bg-gradient-to-r ${card.gradient} transition-all duration-300 ${
                selectedCard?.id === card.id ? "ring-4 ring-yellow-400/60" : "hover:ring-2 hover:ring-yellow-300/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-90 font-medium">{card.title}</div>
                  <div className="text-lg font-semibold mt-2 tracking-widest">{card.number}</div>
                </div>
                <CreditCard size={28} className="text-white opacity-80" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Show PIN Management after card selection */}
        {selectedCard && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md overflow-hidden"
          >
            {/* Animated Glow Background */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="absolute -inset-24 bg-gradient-to-r from-yellow-500/10 via-blue-500/10 to-pink-500/10 rounded-full blur-3xl"
            />

            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 bg-yellow-400/20 rounded-full border border-yellow-300/40 shadow-lg">
                <Lock size={36} className="text-yellow-400" />
              </div>
            </motion.div>

            {/* Card Title */}
            <h2 className="text-center text-xl font-semibold text-yellow-400 mb-6">
              {selectedCard.title} Card
            </h2>

            {/* Input Fields */}
            <div className="space-y-5 relative z-10">
              <InputField
                label="Current PIN"
                value={pin}
                onChange={setPin}
                icon={<KeyRound size={18} className="text-yellow-400" />}
              />
              <InputField
                label="New PIN"
                value={newPin}
                onChange={setNewPin}
                icon={<KeyRound size={18} className="text-yellow-400" />}
              />
              <InputField
                label="Confirm New PIN"
                value={confirmPin}
                onChange={setConfirmPin}
                icon={<KeyRound size={18} className="text-yellow-400" />}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleChangePin}
                className="w-full py-3 mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-2xl shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                Change PIN
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ✅ Reusable Input Field Component
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="relative"
  >
    <label className="block text-gray-300 mb-1">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3">{icon}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••"
        className="w-full pl-10 p-3 rounded-xl bg-gray-800/80 border border-gray-700 focus:border-yellow-400 text-white transition-all duration-200 focus:ring-2 focus:ring-yellow-400/30 outline-none"
      />
    </div>
  </motion.div>
);

export default PinManagement;
