import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type Bill = { id: number; title: string; amount: string; dueDate: string };

interface PendingBillsListProps {
  bills: Bill[];
  onPay: (bill: Bill) => void;
  onSchedule: (bill: Bill) => void;
}

const PendingBillsList: React.FC<PendingBillsListProps> = ({ bills, onPay, onSchedule }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Pending Bills</div>
          <div className="text-xl font-bold mt-1">Manage upcoming payments</div>
        </div>
        <div className="text-sm text-gray-400">{bills.length} due</div>
      </div>

      <div className="space-y-3">
        {bills.map((bill) => (
          <div key={bill.id} className="flex items-center justify-between bg-gray-800/40 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-400" />
              <div>
                <div className="font-semibold">{bill.title}</div>
                <div className="text-xs text-gray-400">Due {bill.dueDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-yellow-400 font-semibold">{bill.amount}</div>
              <button onClick={() => onPay(bill)} className="px-3 py-1 rounded-md bg-yellow-400 text-black text-sm">Pay</button>
              <button onClick={() => onSchedule(bill)} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PendingBillsList;
