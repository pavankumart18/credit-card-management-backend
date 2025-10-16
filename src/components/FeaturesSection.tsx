import React from "react";
import { motion } from "framer-motion";
import { ShieldCheckIcon, ChartBarIcon, BellAlertIcon, CreditCardIcon } from "@heroicons/react/24/solid";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Payment Reminders",
      desc: "Never miss a due date — automatic reminders and calendar sync keep you stress-free.",
      icon: <BellAlertIcon className="w-8 h-8 text-yellow-400" />,
      image: "https://images.unsplash.com/photo-1556742400-b5cde9b6f7e4?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Smart Analytics",
      desc: "Get real-time insights on your spending habits with graphs, trends, and AI-driven tips.",
      icon: <ChartBarIcon className="w-8 h-8 text-blue-400" />,
      image: "https://images.unsplash.com/photo-1605902711622-cfb43c4437d7?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Secure & Private",
      desc: "Your data is encrypted with bank-grade AES-256 security and stored securely with JWT protection.",
      icon: <ShieldCheckIcon className="w-8 h-8 text-green-400" />,
      image: "https://images.unsplash.com/photo-1605902711622-2be52b0c8a65?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Compare & Apply",
      desc: "Browse top card offers, compare benefits, and apply instantly — all in one dashboard.",
      icon: <CreditCardIcon className="w-8 h-8 text-purple-400" />,
      image: "https://images.unsplash.com/photo-1591369750909-4c98f25b1f2e?auto=format&fit=crop&w=800&q=60",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-24 bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden"
    >
      {/* Decorative blurred gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#FFD70022,_transparent_60%)]"></div>

      <div className="max-w-6xl mx-auto px-6">
        <motion.h3
          className="text-4xl md:text-5xl font-extrabold text-center mb-14 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Experience Powerful <span className="text-yellow-400">Features</span>
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg overflow-hidden hover:shadow-yellow-400/20 transition-all"
            >
              {/* Image background */}
              <img
                src={f.image}
                alt={f.title}
                className="absolute inset-0 w-full h-full object-cover opacity-10"
              />
              <div className="relative flex items-start gap-4 z-10">
                <div className="p-3 bg-white/10 rounded-xl">{f.icon}</div>
                <div>
                  <h4 className="font-semibold text-xl mb-1">{f.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-500"
                layoutId="underline"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating background icons for animation */}
      <motion.div
        className="absolute top-10 left-10 text-yellow-500/10"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <CreditCardIcon className="w-24 h-24" />
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-10 text-blue-500/10"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <ShieldCheckIcon className="w-24 h-24" />
      </motion.div>
    </section>
  );
};

export default FeaturesSection;
