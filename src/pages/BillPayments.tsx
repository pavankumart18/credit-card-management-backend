import React, { useState } from "react";
import Navbar2 from "../components/Navbar2";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

interface Bill {
  id: number;
  title: string;
  amount: string;
  dueDate: string;
  status: "Pending" | "Paid";
}

const initialBills: Bill[] = [
  { id: 1, title: "Electricity Bill", amount: "$120.50", dueDate: "2025-10-20", status: "Pending" },
  { id: 2, title: "Internet Bill", amount: "$45.00", dueDate: "2025-10-18", status: "Paid" },
  { id: 3, title: "Credit Card Payment", amount: "$500.00", dueDate: "2025-10-25", status: "Pending" },
  { id: 4, title: "Water Bill", amount: "$30.20", dueDate: "2025-10-22", status: "Pending" },
];

const BillPayments: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const payBill = (id: number) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: "Paid" } : b));
    alert("Payment successful! (mock)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar2 />

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Bill Payments</h1>

        {/* Pending Bills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Pending Bills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bills.filter(b => b.status === "Pending").map(bill => (
              <motion.div
                key={bill.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/60 p-5 rounded-2xl shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="text-lg font-semibold">{bill.title}</div>
                  <div className="text-gray-300 mt-1">Due: {bill.dueDate}</div>
                  <div className="text-yellow-400 mt-2 font-bold">{bill.amount}</div>
                </div>
                <button
                  className="mt-4 bg-yellow-400 text-black font-bold rounded-xl py-2 shadow hover:scale-105 transition"
                  onClick={() => payBill(bill.id)}
                >
                  Pay Now
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="mt-8">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Recent Transactions</h2>
          <div className="space-y-3">
            {bills.map(bill => (
              <motion.div
                key={bill.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 p-4 rounded-2xl shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{bill.title}</div>
                  <div className="text-gray-400 text-sm">Status: {bill.status}</div>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                  <DollarSign size={20} />
                  {bill.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BillPayments;
