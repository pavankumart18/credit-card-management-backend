import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type Transaction = { id: number; merchant: string; category: string; amount: number; date: string; cardTitle?: string };

interface TransactionsQuickListProps {
  transactions: Transaction[];
  onDispute?: (tx: Transaction) => void;
  onViewAll?: () => void;
}

const TransactionsQuickList: React.FC<TransactionsQuickListProps> = ({ transactions, onDispute, onViewAll }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Recent Transactions</div>
          <div className="text-xl font-bold mt-1">Latest activity</div>
        </div>
        <button onClick={onViewAll} className="text-sm text-gray-400 hover:text-white">View all</button>
      </div>

      <div className="space-y-3">
        {transactions.slice(0, 6).map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-gray-800/40 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-yellow-400/10 text-yellow-300"><AlertTriangle size={16} /></div>
              <div>
                <div className="font-semibold">{t.merchant}</div>
                <div className="text-xs text-gray-400">{t.category} · {t.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">₹{t.amount.toLocaleString()}</div>
              <button onClick={() => onDispute?.(t)} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Dispute</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionsQuickList;
