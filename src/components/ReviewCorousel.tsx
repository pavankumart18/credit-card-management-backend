import React from "react";
import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "Aarav",
    text: "Made my card payments frictionless — love the reminders!",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Isha",
    text: "Beautiful UI, quick insights and excellent reward tracking.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Rohit",
    text: "Saved me from late fees multiple times.",
    img: "https://randomuser.me/api/portraits/men/68.jpg",
  },
];

const ReviewsCarousel: React.FC = () => {
  return (
    <section
      id="reviews"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-950"
    >
      {/* subtle background animation */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_60%)]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
        <motion.h3
          className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          What users say
        </motion.h3>

        {/* carousel */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {[...reviews, ...reviews].map((r, idx) => (
              <motion.div
                key={idx}
                className="min-w-[320px] bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg shadow-black/30"
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  boxShadow: "0 10px 40px rgba(255,255,255,0.1)",
                }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="flex flex-col items-center">
                  <motion.img
                    src={r.img}
                    alt={r.name}
                    className="w-20 h-20 rounded-full mb-4 border-2 border-white/30 shadow-md"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  <p className="text-gray-200 mb-4 italic text-lg leading-relaxed">“{r.text}”</p>
                  <div className="text-sm font-semibold text-gray-300">{r.name}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
