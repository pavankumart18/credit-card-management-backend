import React, { useState } from "react";
import { motion } from "framer-motion";

type AlertRule = { id: string; type: 'category' | 'amount'; target: string; threshold: number; active: boolean };

const defaultRules: AlertRule[] = [
  { id: 'rule-1', type: 'amount', target: 'Any', threshold: 5000, active: true },
  { id: 'rule-2', type: 'category', target: 'Food', threshold: 2000, active: true },
];

const SpendingAlerts: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [creating, setCreating] = useState(false);

  const toggleRule = (id: string) => setRules((r) => r.map((x) => x.id === id ? { ...x, active: !x.active } : x));
  const removeRule = (id: string) => setRules((r) => r.filter((x) => x.id !== id));

  const addRule = () => {
    const id = `rule-${Date.now()}`;
    setRules((r) => [{ id, type: 'amount', target: 'Any', threshold: 1000, active: true }, ...r]);
    setCreating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Spending Alerts & Rules</div>
          <div className="text-xl font-bold mt-1">Get notified on spend events</div>
        </div>
        <div>
          <button onClick={() => setCreating((c) => !c)} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">Create Rule</button>
        </div>
      </div>

      {creating && (
        <div className="mb-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700">
          <div className="text-sm text-gray-300">New rule (demo)</div>
          <div className="mt-2 flex gap-2">
            <select className="bg-gray-800 p-2 rounded-md">
              <option value="amount">Amount &gt; X</option>
              <option value="category">Category spend &gt; X</option>
            </select>
            <input className="bg-gray-800 p-2 rounded-md" placeholder="Threshold" />
            <button onClick={addRule} className="px-3 py-2 rounded-md bg-yellow-400 text-black">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border border-gray-700">
            <div>
              <div className="font-semibold">{r.type === 'amount' ? `Amount > ₹${r.threshold}` : `${r.target} spend > ₹${r.threshold}`}</div>
              <div className="text-xs text-gray-400">{r.active ? 'Active' : 'Paused'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleRule(r.id)} className="px-3 py-1 rounded-md border border-gray-700">{r.active ? 'Pause' : 'Enable'}</button>
              <button onClick={() => removeRule(r.id)} className="px-3 py-1 rounded-md border border-red-500 text-red-400">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-400">Rules are demo only — when connected to live transactions these will trigger notifications and actions.</div>
    </motion.div>
  );
};

export default SpendingAlerts;
