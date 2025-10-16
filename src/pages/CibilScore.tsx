import React, { useState } from "react";
import Navbar2 from "../components/Navbar2";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle, RefreshCcw, ChevronDown } from "lucide-react";

const CibilScore: React.FC = () => {
  const [score, setScore] = useState(720);
  const maxScore = 900;

  const getScoreColor = (score: number) => {
    if (score < 550) return "from-red-500 to-orange-500";
    if (score < 700) return "from-yellow-400 to-yellow-500";
    return "from-green-400 to-emerald-500";
  };

  const handleRefresh = () => {
    const newScore = Math.floor(550 + Math.random() * 350);
    setScore(newScore);
  };

  const faqs = [
    {
      q: "What is a CIBIL score and why does it matter?",
      a: "CIBIL score is a 3-digit numeric summary of your credit history maintained by TransUnion CIBIL. Lenders use it to evaluate creditworthiness — higher scores improve loan/credit approval chances and better interest rates.",
    },
    {
      q: "How is my CIBIL score calculated?",
      a: "It’s calculated using factors like payment history, credit utilisation, length of credit history, types of credit, and recent credit enquiries. Payment punctuality and low utilisation are especially important.",
    },
    {
      q: "How often should I check my CIBIL score?",
      a: "Checking monthly or quarterly is fine. Soft checks (by you) don’t affect your score; only lender hard enquiries may cause small temporary dips.",
    },
    {
      q: "Will closing a credit card improve my CIBIL score?",
      a: "Not always. It can lower available credit and raise utilisation, possibly reducing your score. Evaluate the card’s benefits vs. cost before closing.",
    },
    {
      q: "How can I improve my CIBIL score quickly?",
      a: "Pay bills on time, keep utilisation <30%, limit new loans, and correct report errors by raising disputes with CIBIL.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Navbar2 />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Main section */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col items-center justify-center text-center lg:text-left"
          >
            <div className="w-full flex flex-col items-center lg:items-start">
              <h1 className="text-5xl font-extrabold text-yellow-400 mb-2">
                Your CIBIL Score
              </h1>
              <p className="text-gray-400 mb-10 text-base max-w-md text-center lg:text-left">
                Stay financially confident — monitor and grow your credit health every month.
              </p>
            </div>

            {/* Main Gauge Section */}
            <div className="relative flex flex-col items-center justify-center mb-10">
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${getScoreColor(
                  score
                )} blur-3xl opacity-40 w-80 h-80`}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <div className="relative w-80 h-80">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-gray-800"
                    strokeWidth="16"
                    stroke="currentColor"
                    fill="transparent"
                    r="120"
                    cx="160"
                    cy="160"
                  />
                  <motion.circle
                    className="text-yellow-400"
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="transparent"
                    r="120"
                    cx="160"
                    cy="160"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={
                      2 * Math.PI * 120 * (1 - score / maxScore)
                    }
                    style={{
                      stroke: `url(#gradient)`,
                    }}
                    initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 120 * (1 - score / maxScore),
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#facc15" />
                      <stop offset="50%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={score}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-7xl font-extrabold text-white drop-shadow-lg"
                  >
                    {score}
                  </motion.div>
                  <div className="text-gray-400 text-sm mt-1">/ {maxScore}</div>
                  <div
                    className={`mt-2 text-base font-semibold ${score < 550
                      ? "text-red-400"
                      : score < 700
                        ? "text-yellow-400"
                        : "text-green-400"
                      }`}
                  >
                    {score < 550 ? "Poor" : score < 700 ? "Fair" : "Excellent"}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="bg-gray-900/60 p-8 rounded-3xl shadow-xl space-y-4 text-left backdrop-blur-md max-w-xl mx-auto lg:mx-0"
            >
              <h2 className="text-xl font-semibold text-yellow-400 mb-2 text-center lg:text-left">
                💡 Smart Credit Insights
              </h2>
              <div className="space-y-4 text-gray-300">
                <InsightItem
                  icon={<TrendingUp size={20} className="text-green-400" />}
                  text="Maintain timely payments to boost your credit score steadily."
                />
                <InsightItem
                  icon={<CheckCircle size={20} className="text-yellow-400" />}
                  text="Keep your credit utilisation below 30% to strengthen your score."
                />
                <InsightItem
                  icon={<AlertTriangle size={20} className="text-red-400" />}
                  text="Avoid frequent loan or card applications to reduce enquiry impact."
                />
              </div>
            </motion.div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              className="mt-8 flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 text-black font-bold rounded-2xl shadow-lg hover:shadow-yellow-500/40 transition-all"
            >
              <RefreshCcw size={18} /> Refresh Score
            </motion.button>
          </motion.section>

          {/* RIGHT: FAQ Section */}
          <aside className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="sticky top-24"
            >
              <div className="bg-gray-900/60 p-6 rounded-3xl shadow-lg text-left backdrop-blur-md">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                  CIBIL FAQs
                </h3>
                <FAQAccordion items={faqs} />
              </div>
            </motion.div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const InsightItem: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <p className="text-sm leading-snug">{text}</p>
  </div>
);

const FAQAccordion: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700"
          >
            <button
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <span className="text-sm font-medium text-gray-100">{it.q}</span>
              <ChevronDown
                size={18}
                className={`text-gray-300 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>
            <div
              className={`px-4 pb-4 text-sm text-gray-300 transition-all ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              style={{ overflow: "hidden" }}
            >
              <div className="pt-2">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CibilScore;
