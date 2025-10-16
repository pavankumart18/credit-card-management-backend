// src/components/SpendingTracker.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Settings2, Download, Plus, Minus } from "lucide-react";

type Transaction = { id: number; cardId: number; merchant: string; category: string; amount: number; date: string };

interface SpendingTrackerProps {
  transactions: Transaction[];
  timeRange?: "30d" | "90d" | "6m";
}

const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#f97316", "#06b6d4", "#f43f5e"];
const formatINR = (v: number) => `₹${v.toLocaleString()}`;

export default function SpendingTracker({ transactions, timeRange = "30d" }: SpendingTrackerProps) {
  const reduce = useReducedMotion();
  const [selectedRange, setSelectedRange] = useState<"30d" | "90d" | "6m">(timeRange);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterMerchant, setFilterMerchant] = useState<string | null>(null);

  // budgets live state and optimistic pending state for UX
  const initialBudgets = useMemo(
    () => ({ Food: 3000, Shopping: 5000, Groceries: 4000, Travel: 10000 }),
    []
  );
  const [budgets, setBudgets] = useState<Record<string, number>>(initialBudgets);
  const [pendingBudgets, setPendingBudgets] = useState<Record<string, number>>(initialBudgets);

  // Debounce commit for pending budgets -> budgets
  useEffect(() => {
    const timers: number[] = [];
    Object.entries(pendingBudgets).forEach(([cat, val]) => {
      if (budgets[cat] !== val) {
        const t = window.setTimeout(() => {
          setBudgets((prev) => ({ ...prev, [cat]: val }));
        }, 700);
        timers.push(t);
      }
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, [pendingBudgets]); // eslint-disable-line

  // ------------- Date range filtering -------------
  const rangeCutoff = useMemo(() => {
    const now = new Date();
    if (selectedRange === "30d") {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      return d;
    }
    if (selectedRange === "90d") {
      const d = new Date(now);
      d.setDate(now.getDate() - 90);
      return d;
    }
    // 6 months
    const d = new Date(now);
    d.setMonth(now.getMonth() - 6);
    return d;
  }, [selectedRange]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const dt = new Date(t.date);
      return dt >= rangeCutoff;
    });
  }, [transactions, rangeCutoff]);

  // Optionally apply merchant/category filter on top of range
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => {
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterMerchant && t.merchant !== filterMerchant) return false;
      return true;
    });
  }, [filteredTransactions, filterCategory, filterMerchant]);

  // ------------- Aggregations derived from visibleTransactions -------------
  const categorySums = useMemo(() => {
    const map: Record<string, number> = {};
    visibleTransactions.forEach((t) => (map[t.category] = (map[t.category] || 0) + t.amount));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [visibleTransactions]);

  const topMerchants = useMemo(() => {
    const map: Record<string, number> = {};
    visibleTransactions.forEach((t) => (map[t.merchant] = (map[t.merchant] || 0) + t.amount));
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [visibleTransactions]);

  // monthly aggregation (month label) based on filteredTransactions (not merchant/category filtered)
  const monthly = useMemo(() => {
    const monthMap: Record<string, { label: string; spend: number; ts: number }> = {};
    filteredTransactions.forEach((t) => {
      const d = new Date(t.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      if (!monthMap[monthKey]) monthMap[monthKey] = { label, spend: 0, ts: +new Date(d.getFullYear(), d.getMonth(), 1) };
      monthMap[monthKey].spend += t.amount;
    });
    const arr = Object.values(monthMap)
      .sort((a, b) => a.ts - b.ts)
      .map((m) => ({ month: m.label, spend: m.spend }));
    // ensure we show at least last N months for context (especially for 6m)
    if (selectedRange === "6m") {
      const now = new Date();
      const months: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months[d.toLocaleString("default", { month: "short" })] = 0;
      }
      arr.forEach((r) => (months[r.month] = r.spend));
      return Object.entries(months).map(([m, spend]) => ({ month: m, spend }));
    }
    return arr;
  }, [filteredTransactions, selectedRange]);

  const total = useMemo(() => categorySums.reduce((acc, c) => acc + c.value, 0), [categorySums]);

  // ------------- UI helpers -------------
  const exportCSV = useCallback(() => {
    const rows = [["Category", "Spend"]];
    categorySums.forEach((c) => rows.push([c.name, String(c.value)]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `category-breakdown-${selectedRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [categorySums, selectedRange]);

  function handleBudgetInput(category: string, value: number) {
    setPendingBudgets((p) => ({ ...p, [category]: value }));
  }

  function incBudget(category: string, delta = 500) {
    setPendingBudgets((p) => ({ ...p, [category]: Math.max(500, (p[category] || 500) + delta) }));
  }
  function decBudget(category: string, delta = 500) {
    setPendingBudgets((p) => ({ ...p, [category]: Math.max(500, (p[category] || 500) - delta) }));
  }

  function toggleFilterCategory(cat?: string) {
    setFilterCategory((c) => (c === cat ? null : cat || null));
  }

  function toggleFilterMerchant(merchant?: string) {
    setFilterMerchant((m) => (m === merchant ? null : merchant || null));
  }

  // quick preset budgets (demo)
  const applyPreset = (preset: "low" | "medium" | "high") => {
    const multiplier = preset === "low" ? 0.75 : preset === "high" ? 1.6 : 1.0;
    const next: Record<string, number> = {};
    Object.entries(pendingBudgets).forEach(([k, v]) => (next[k] = Math.max(500, Math.round(v * multiplier))));
    setPendingBudgets(next);
  };

  // small motion item variant
  const item = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  // ---------- NEW PIE: active slice + external labels ----------
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function onPieEnter(_: any, index: number) {
    setActiveIndex(index);
  }
  function onPieLeave() {
    setActiveIndex(null);
  }

  // Customized label renderer that draws leader line + external label
  const CustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 16; // place label outside the slice
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // leader line points: start at edge, mid, label
    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    const mx = cx + (outerRadius + 8) * Math.cos(-midAngle * RADIAN);
    const my = cy + (outerRadius + 8) * Math.sin(-midAngle * RADIAN);

    const displayPercent = `${Math.round(percent * 100)}%`;
    const amount = payload?.value ? formatINR(payload.value) : "";

    const textAnchor = x > cx ? "start" : "end";

    return (
      <g>
        <path d={`M ${sx} ${sy} L ${mx} ${my} L ${x} ${y}`} stroke="#4b5563" strokeWidth={1} fill="none" />
        <circle cx={x} cy={y} r={3} fill="#fbbf24" />
        <text x={x + (x > cx ? 8 : -8)} y={y - 4} textAnchor={textAnchor} fill="#e5e7eb" fontSize={12} fontWeight={700}>
          {payload.name}
        </text>
        <text x={x + (x > cx ? 8 : -8)} y={y + 12} textAnchor={textAnchor} fill="#9ca3af" fontSize={11}>
          {amount} · {displayPercent}
        </text>
      </g>
    );
  };

  return (
    <motion.div {...item} transition={{ duration: 0.45 }} className="p-6 rounded-3xl bg-gradient-to-br from-gray-900/60 to-black/40 border border-gray-800 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-400">Spending Tracker</div>
          <div className="text-2xl font-bold mt-1">Where you're spending</div>
          <div className="text-xs text-gray-400 mt-1 max-w-xl">Visual breakdown by category & month — set budgets, spot leaks and export data.</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400 mr-2 hidden sm:block">Range</div>
          <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value as any)} className="bg-gray-800 px-2 py-1 rounded-md text-sm">
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
            <option value="6m">6 months</option>
          </select>

          <button title="Export categories" onClick={exportCSV} className="p-2 rounded-md bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/12">
            <Download size={16} />
          </button>

          <button title="Settings" className="p-2 rounded-md bg-yellow-400/10 text-yellow-300">
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut with external labels */}
        <motion.div {...item} className="lg:col-span-1 p-4 rounded-2xl bg-gray-800/40 border border-gray-700">
          <div className="h-44">
            <ResponsiveContainer width="100%" height={176}>
              <RePieChart>
                <Pie
                  data={categorySums}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={64}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  labelLine={false}
                  label={CustomizedLabel}
                >
                  {categorySums.map((entry, index) => {
                    const isActive = index === activeIndex;
                    const outer = isActive ? 70 : 64;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={isActive ? "#fff" : "transparent"}
                        strokeWidth={isActive ? 2 : 0}
                      // Note: Recharts doesn't accept outerRadius per Cell; active expansion handled via activeIndex hover state for visual emphasis
                      />
                    );
                  })}
                </Pie>
                <ReTooltip formatter={(value: any) => formatINR(value)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom compact legend */}
          <div className="mt-3 grid gap-2 max-h-36 overflow-auto pr-2">
            {categorySums.map((c, i) => {
              const used = c.value;
              const limit = budgets[c.name] ?? 0;
              const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
              const over = limit > 0 && used > limit;
              return (
                <div
                  key={c.name}
                  className={`flex items-center justify-between gap-3 p-2 rounded-md ${filterCategory === c.name ? "ring-1 ring-yellow-400/30 bg-yellow-400/4" : "hover:bg-gray-900/20"}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFilterCategory(c.name)}
                  onKeyDown={(e) => { if (e.key === "Enter") toggleFilterCategory(c.name); }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div style={{ width: 12, height: 12, background: COLORS[i % COLORS.length], borderRadius: 4 }} />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-100 truncate">{c.name}</div>
                      <div className="text-xs text-gray-400">{formatINR(used)}</div>
                    </div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className={`text-sm font-semibold ${over ? "text-red-400" : "text-gray-100"}`}>{formatINR(used)}</div>
                    <div className="text-xs text-gray-400">{limit ? `Budget ₹${limit}` : "No budget"}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-gray-400">Total spend <span className="font-semibold text-gray-100 ml-1">{formatINR(total)}</span></div>
        </motion.div>

        {/* Middle: Monthly bar chart */}
        <motion.div {...item} className="lg:col-span-2 p-4 rounded-2xl bg-gray-800/40 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">Monthly Spend</div>
            <div className="text-xs text-gray-400">Hover bars for detail • Click merchant to filter</div>
          </div>

          <div className="w-full h-56 mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value: any) => formatINR(value)} />
                <Bar dataKey="spend" fill="#f59e0b" radius={[6, 6, 0, 0]} isAnimationActive={!reduce} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-300">Top merchants</h4>
              <div className="mt-2 space-y-2">
                {topMerchants.map((m, idx) => (
                  <div key={m.name} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-900/20">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.name}</div>
                      <div className="text-xs text-gray-400">Last {selectedRange === "6m" ? "6 months" : selectedRange === "90d" ? "90 days" : "30 days"}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div style={{ width: 80, height: 32 }}>
                        <MiniSparkline merchant={m.name} transactions={filteredTransactions} color={COLORS[idx % COLORS.length]} onClick={() => toggleFilterMerchant(m.name)} />
                      </div>
                      <div className="text-sm font-semibold">{formatINR(m.value)}</div>
                    </div>
                  </div>
                ))}
                {topMerchants.length === 0 && <div className="text-xs text-gray-400">No merchants in this range.</div>}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-300">Budgets</h4>
              <div className="mt-2 space-y-3">
                {Object.keys(pendingBudgets).map((cat) => {
                  const used = categorySums.find((s) => s.name === cat)?.value || 0;
                  const limit = pendingBudgets[cat];
                  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                  const over = limit > 0 && used > limit;
                  return (
                    <div key={cat} className="p-3 rounded-md bg-gray-900/30 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{cat}</div>
                        <div className="text-xs text-gray-400">{formatINR(used)} / {formatINR(limit)}</div>
                      </div>

                      <div className="mt-2 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div style={{ width: `${Math.max(4, pct)}%` }} className={`h-2 ${over ? "bg-red-500" : "bg-yellow-400"}`} />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => decBudget(cat)} className="p-1 rounded-md bg-gray-800/50" title="Decrease budget">
                          <Minus size={14} />
                        </button>
                        <input
                          type="range"
                          min={500}
                          max={20000}
                          step={100}
                          value={limit}
                          onChange={(e) => handleBudgetInput(cat, Number(e.target.value))}
                          className="w-full"
                          aria-label={`Budget for ${cat}`}
                        />
                        <button onClick={() => incBudget(cat)} className="p-1 rounded-md bg-gray-800/50" title="Increase budget">
                          <Plus size={14} />
                        </button>

                        <div className={`ml-2 text-xs font-medium ${over ? "text-red-400" : "text-gray-100"}`}>{formatINR(limit)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => applyPreset("low")} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Preset: Low</button>
                <button onClick={() => applyPreset("medium")} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Preset: Medium</button>
                <button onClick={() => applyPreset("high")} className="px-3 py-1 rounded-md border border-gray-700 text-sm">Preset: High</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 text-xs text-gray-500">Tip: click a category in the donut legend or a merchant sparkline to filter the charts. Export downloads the currently visible category breakdown.</div>
    </motion.div>
  );
}

/* ---------------------------
   MiniSparkline (small line chart for a merchant)
   --------------------------- */
const MiniSparkline: React.FC<{ merchant: string; transactions: Transaction[]; color?: string; onClick?: () => void }> = ({ merchant, transactions, color = "#f59e0b", onClick }) => {
  // aggregate by month label for last 6 months, using the provided transactions (already filtered by range)
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      map[label] = 0;
    }
    transactions.forEach((t) => {
      if (t.merchant !== merchant) return;
      const d = new Date(t.date);
      const label = d.toLocaleString("default", { month: "short" });
      if (label in map) map[label] += t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [merchant, transactions]);

  return (
    <div style={{ width: 80, height: 32, cursor: onClick ? "pointer" : "default" }} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
