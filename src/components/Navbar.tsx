import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E3C770] to-white/60 flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12h18" stroke="#0b0f1a" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3v18" stroke="#0b0f1a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-wide">CreditX</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm text-gray-300">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#reviews" className="hover:underline">Reviews</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
