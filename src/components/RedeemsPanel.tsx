import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, CreditCard, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RedeemOption {
  id: string;
  title: string;
  description: string;
  cost: number; // points
}

interface RedeemsPanelProps {
  initialPoints?: number;
  options?: RedeemOption[];
  onRedeem?: (option: RedeemOption) => void;
}

const defaultOptions: RedeemOption[] = [
  { id: "amazon-500", title: "Amazon Voucher ₹500", description: "Use on Amazon purchases.", cost: 10000 },
  { id: "statement-250", title: "Statement credit ₹250", description: "Apply as statement credit.", cost: 5000 },
  { id: "cashback-100", title: "Cashback ₹100", description: "Instant wallet cashback.", cost: 2000 },
];

const RedeemsPanel: React.FC<RedeemsPanelProps> = ({ initialPoints = 12500, options = defaultOptions, onRedeem }) => {
  const [points, setPoints] = useState(initialPoints);
  const [showOptions, setShowOptions] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; cost: number; date: string }[]>([]);
  const navigate = useNavigate();
  const handleRedeem = (opt: RedeemOption) => {
    if (points < opt.cost) {
      alert('Not enough points');
      return;
    }
    setPoints((p) => p - opt.cost);
    const entry = { id: opt.id, title: opt.title, cost: opt.cost, date: new Date().toISOString().split('T')[0] };
    setHistory((h) => [entry, ...h]);
    onRedeem?.(opt);
    navigate("/redeems");

  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400">Rewards & Redeems</div>
          <div className="text-2xl font-bold mt-1">{points.toLocaleString()} pts</div>
          <div className="text-xs text-gray-400 mt-1">Redeem points for vouchers, cashback or statement credits.</div>
        </div>
        <div className="p-3 rounded-full bg-yellow-400/10 text-yellow-300"><Gift size={20} /></div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowOptions((s) => !s)} className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold">Redeem</button>
          <button onClick={() => alert('Open Redeem history (demo)')} className="px-3 py-2 rounded-lg border border-gray-700">History</button>
        </div>

        {showOptions && (
          <div className="mt-2 space-y-2">
            {options.map((opt) => (
              <div key={opt.id} className="p-3 rounded-lg bg-gray-800/40 border border-gray-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{opt.title}</div>
                  <div className="text-xs text-gray-400">{opt.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-300">{opt.cost.toLocaleString()} pts</div>
                  <button onClick={() => handleRedeem(opt)} className="px-3 py-1 rounded-md bg-yellow-400 text-black">Redeem</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-2 p-3 rounded-lg bg-gray-900/30 border border-gray-700">
            <div className="text-sm text-gray-300">Recent Redeems</div>
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between">
                  <div className="text-sm">{h.title}</div>
                  <div className="text-xs text-gray-400">-{h.cost.toLocaleString()} pts · {h.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RedeemsPanel;
