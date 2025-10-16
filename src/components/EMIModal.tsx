import React from "react";
import { motion } from "framer-motion";

interface Card {
  id: number;
  title: string;
  outstanding?: string;
}

interface EMIModalProps {
  card: Card;
  onClose: () => void;
  onApply: (plan: { months: number; monthly: number }) => void;
}

const EMIModal: React.FC<EMIModalProps> = ({ card, onClose, onApply }) => {
  const outstanding = parseInt((card.outstanding || "0").replace(/[^0-9]/g, "")) || 0;
  const plans = [3, 6, 9, 12].map((m) => ({ months: m, monthly: Math.ceil(outstanding / m) }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.12 }} className="relative z-50 w-[520px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">EMI Options</div>
            <div className="text-lg font-bold mt-1">Convert outstanding on {card.title}</div>
          </div>
          <div className="text-sm text-gray-400">Outstanding: {card.outstanding}</div>
        </div>

        <div className="mt-4 space-y-3">
          {plans.map((p) => (
            <div key={p.months} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
              <div>
                <div className="font-semibold">{p.months} months</div>
                <div className="text-xs text-gray-400">Monthly: ₹{p.monthly.toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => alert('View details (demo)')} className="px-3 py-1 rounded-lg border border-gray-700">Details</button>
                <button onClick={() => onApply(p)} className="px-3 py-1 rounded-lg bg-yellow-400 text-black">Apply</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-400">Note: This is a demo EMI flow. Real EMI requires bank validation, T&Cs and credit checks.</div>
      </motion.div>
    </div>
  );
};

export default EMIModal;
