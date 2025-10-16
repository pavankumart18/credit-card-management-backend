import React from "react";
import { motion, Variants } from "framer-motion";
import { CreditCardIcon } from "@heroicons/react/24/solid";

const cardVariants: Variants = {
  float: (i: number) => ({
    y: [0, -15, 0],
    rotateY: [0, 10, -10, 0],
    transition: {
      duration: 5 + i,
      repeat: Infinity,
      ease: "easeInOut" as any,
      delay: i * 0.3,
    },
  }),
};

const CardStack: React.FC = () => {
  const cards = [
    {
      id: 1,
      title: "Platinum Card",
      subtitle: "Rewards 5%",
      gradient: "from-indigo-500 via-purple-500 to-blue-500",
      logo: "💎",
    },
    {
      id: 2,
      title: "Gold Card",
      subtitle: "Cashback 3%",
      gradient: "from-amber-400 via-orange-400 to-pink-500",
      logo: "🥇",
    },
    {
      id: 3,
      title: "Titanium Card",
      subtitle: "Miles 4%",
      gradient: "from-emerald-400 via-teal-400 to-cyan-500",
      logo: "✈️",
    },
  ];

  return (
    <div className="relative w-80 h-56 perspective-[1000px]">
      {cards.map((c, i) => (
        <motion.div
          key={c.id}
          custom={i}
          variants={cardVariants}
          animate="float"
          className={`absolute left-0 right-0 mx-auto w-72 h-44 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${i === 0 ? "z-30" : i === 1 ? "z-20" : "z-10"}`}
          style={{
            top: i * 22,
            transformStyle: "preserve-3d",
          }}
          whileHover={{
            rotateY: 6,
            scale: 1.05,
            boxShadow: "0px 0px 30px rgba(255,255,255,0.25)",
          }}
        >
          <div
            className={`relative w-full h-full rounded-2xl p-5 bg-gradient-to-r ${c.gradient} overflow-hidden`}
          >
            {/* shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-40 mix-blend-overlay"></div>

            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-white/80 tracking-wide">
                  CREDIT CARD
                </div>
                <div className="mt-6 text-xl font-semibold text-white drop-shadow-sm">
                  {c.title}
                </div>
              </div>
              <div className="text-2xl">{c.logo}</div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <CreditCardIcon className="w-6 h-6 text-white/80" />
              <div className="text-sm text-white/90 font-mono tracking-widest">
                **** **** **** 2451
              </div>
            </div>

            <div className="mt-6 flex justify-between text-xs text-white/70">
              <span>VALID 06/28</span>
              <span>{c.subtitle}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardStack;
