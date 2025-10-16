import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, CreditCard } from "lucide-react";
import Navbar2 from "../components/Navbar2";

interface Card {
  id: number;
  title: string;
  number: string;
  blocked: boolean;
}

const CardBlock: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, title: "Platinum", number: "**** **** **** 2451", blocked: false },
    { id: 2, title: "Gold", number: "**** **** **** 8741", blocked: false },
    { id: 3, title: "Titanium", number: "**** **** **** 1290", blocked: false },
  ]);

  const toggleBlock = (id: number) => {
    setCards((cards) =>
      cards.map((c) =>
        c.id === id ? { ...c, blocked: !c.blocked } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Navbar2 />

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-10 mb-12"
      >
        <h1 className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg">
          🛡️ Card Block Management
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Instantly block or unblock your cards with a single tap.
        </p>
      </motion.div>

      {/* Card List */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer group`}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                card.blocked
                  ? "from-red-500/80 to-orange-500/80"
                  : "from-indigo-500/90 to-blue-500/90"
              } transition-all duration-500`}
            ></div>

            {/* Animated glow overlay */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -inset-24 bg-gradient-to-r from-yellow-400/10 via-pink-500/10 to-blue-500/10 blur-3xl"
            />

            {/* Card content */}
            <div className="relative p-6 flex flex-col justify-between h-48 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">
                    {card.title} Card
                  </h2>
                  <p className="text-sm opacity-80 mt-1">
                    {card.number}
                  </p>
                </div>
                <div className="p-2 bg-black/30 rounded-full">
                  <CreditCard size={22} />
                </div>
              </div>

              {/* Status and button */}
              <div className="flex justify-between items-center mt-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    card.blocked
                      ? "bg-red-800/70 text-red-200"
                      : "bg-green-800/70 text-green-200"
                  }`}
                >
                  {card.blocked ? "Blocked" : "Active"}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleBlock(card.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold shadow-md transition-all duration-300 ${
                    card.blocked
                      ? "bg-green-400 text-black hover:shadow-green-500/30"
                      : "bg-red-500 text-white hover:shadow-red-500/30"
                  }`}
                >
                  {card.blocked ? (
                    <>
                      <Unlock size={18} /> Unblock
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Block
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CardBlock;
