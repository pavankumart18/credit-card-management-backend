import React from "react";
import { motion } from "framer-motion";
import CardStack from "./CardStack";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pb-24 bg-gradient-to-b from-black via-[#0B0B0E] to-[#111] text-white">
      {/* --- animated colorful orbs background --- */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 30, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 -top-20 w-96 h-96 bg-gradient-to-tr from-violet-600 to-cyan-400 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, -20, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-10rem] top-24 w-80 h-80 bg-gradient-to-r from-pink-400 to-yellow-300 rounded-full opacity-15 blur-3xl"
        />
      </div>

      {/* --- content grid --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center pt-28">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-7xl leading-tight font-extrabold tracking-tight">
            Manage your{" "}
            <span className="bg-gradient-to-r from-[#E3C770] via-[#FACC15] to-[#F59E0B] bg-clip-text text-transparent">
              credit cards
            </span>{" "}
            the smart way.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg max-w-lg leading-relaxed"
          >
            Track payments, get reminders, compare offers, and earn rewards —
            all from one beautifully crafted dashboard powered by secure AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <a
              href="#features"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold shadow-[0_0_20px_rgba(255,225,100,0.3)] hover:shadow-[0_0_30px_rgba(255,225,100,0.5)] transition-transform transform hover:scale-105"
            >
              Get Started
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 border border-white/20 text-sm text-gray-200 hover:bg-white/10 transition"
            >
              Contact Sales
            </a>
          </motion.div>

          <motion.div
            className="pt-4 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <strong className="text-gray-100">Trusted by banks & fintechs</strong> — secured with JWT + AES-256 encryption.
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center md:justify-end"
        >
          <CardStack />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
