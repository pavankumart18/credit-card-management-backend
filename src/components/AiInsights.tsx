// src/components/AIInsights.tsx
import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Lightbulb,
  CheckCircle,
  Zap,
  Icon as LucideIcon,
  ArrowRight,
  BarChart2,
  PieChart,
} from "lucide-react";

type Card = { id: number; title: string; outstanding?: string };
type Bill = { id: number; title: string; amount: string; dueDate: string };
type Transaction = { id: number; cardId: number; merchant: string; category: string; amount: number; date: string };

interface AIInsightsProps {
  cards: Card[];
  bills: Bill[];
  transactions: Transaction[];
  onApply?: (suggestionId: string) => void;
}

type Suggestion = {
  id: string;
  title: string;
  confidence: number; // 0..1
  why: string;
  action: string;
  impact?: { outstandingDelta?: number; utilDeltaPct?: number }; // simulated impact
};

const ringCircumference = (r: number) => 2 * Math.PI * r;

const AIInsights: React.FC<AIInsightsProps> = ({ cards, bills, transactions, onApply }) => {
  const reduce = useReducedMotion();

  // Basic derived values
  const totalOutstanding = useMemo(
    () =>
      cards.reduce(
        (acc, c) => acc + (parseInt((c.outstanding || "0").replace(/[^0-9]/g, "")) || 0),
        0
      ),
    [cards]
  );

  const categorySums = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => (map[t.category] = (map[t.category] || 0) + t.amount));
    return Object.entries(map).map(([k, v]) => ({ category: k, amount: v })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topCategory = categorySums[0];

  // richer suggestion set with simulated impact
  const suggestions: Suggestion[] = useMemo(() => {
    const items: Suggestion[] = [];

    if (totalOutstanding > 20000) {
      items.push({
        id: "emi-3mo",
        title: "Convert high outstanding to EMI — 3 mo",
        confidence: 0.86,
        why: "Large outstanding can be split to reduce monthly pressure and avoid missed payments.",
        action: "Preview EMI",
        impact: { outstandingDelta: -Math.round(totalOutstanding * 0.15), utilDeltaPct: -8 },
      });
    }

    if (topCategory && topCategory.amount > 2000) {
      items.push({
        id: "budget-cat",
        title: `Set budget for ${topCategory.category}`,
        confidence: 0.78,
        why: `You've spent ₹${topCategory.amount.toLocaleString()} on ${topCategory.category}. A budget reduces leak.`,
        action: "Create Budget",
        impact: { utilDeltaPct: -6 },
      });
    }

    if (bills.length > 0) {
      items.push({
        id: "autopay",
        title: "Enable auto-pay for upcoming bills",
        confidence: 0.72,
        why: "Auto-pay avoids late payments and protects credit history.",
        action: "Enable Auto-pay",
        impact: { outstandingDelta: -Math.round(totalOutstanding * 0.02) },
      });
    }

    // a positive reinforcement suggestion
    items.push({
      id: "keep-going",
      title: "You're on track — small wins",
      confidence: 0.65,
      why: "Patterns look steady. Keep on paying on time to gradually raise score.",
      action: "View Progress",
    });

    return items;
  }, [totalOutstanding, topCategory, bills]);

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(suggestions[0]?.id ?? null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [explaining, setExplaining] = useState<string | null>(null);

  const applySuggestion = (s: Suggestion) => {
    setApplied((p) => ({ ...p, [s.id]: true }));
    onApply?.(s.id);
    // lightweight demo feedback
    alert(`${s.action} — demo applied: ${s.title}`);
  };

  const explain = (s: Suggestion) => {
    setExplaining(s.id === explaining ? null : s.id);
  };

  // motion variants
  const container = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="p-6 rounded-3xl bg-gradient-to-br from-gray-900/60 to-black/40 border border-gray-800 shadow-2xl"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-400">AI Insights</div>
          <div className="text-2xl font-bold mt-1">Smart suggestions to save & prioritise</div>
          <div className="text-xs text-gray-400 mt-1 max-w-xl">
            Actionable recommendations based on your recent spend, dues and balances. Try previewing impacts before applying.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-400/10 text-yellow-300">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* top row: snapshot tiles */}
      <motion.div variants={item} className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SnapshotTile
          title="Total outstanding"
          value={`₹${totalOutstanding.toLocaleString()}`}
          sub="What you owe across cards"
          progress={Math.min(100, Math.round((totalOutstanding / 200000) * 100))}
          icon={<BarChart2 size={18} />}
        />

        <SnapshotTile
          title="Upcoming bills"
          value={`${bills.length}`}
          sub="Bills in next 30 days"
          progress={Math.min(100, Math.round((bills.length / 6) * 100))}
          icon={<Lightbulb size={18} />}
        />

        <SnapshotTile
          title="Top spend"
          value={topCategory ? `₹${topCategory.amount.toLocaleString()}` : "—"}
          sub={topCategory ? topCategory.category : "—"}
          progress={Math.min(100, topCategory ? Math.round((topCategory.amount / Math.max(1, totalOutstanding || 1)) * 100) : 0)}
          icon={<PieChart size={18} />}
        />
      </motion.div>

      {/* suggestions area */}
      <motion.div variants={item} className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* left: suggestion list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">Top suggestions</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-xs text-gray-400 px-3 py-1 rounded border border-gray-700"
                aria-pressed={expanded}
              >
                {expanded ? "Collapse" : "Expand"}
              </button>
              <div className="text-xs text-gray-400">Showing {expanded ? suggestions.length : Math.min(2, suggestions.length)}</div>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {(expanded ? suggestions : suggestions.slice(0, 2)).map((s) => {
              const isActive = activeId === s.id;
              return (
                <motion.div
                  key={s.id}
                  whileHover={reduce ? {} : { y: -6, scale: 1.01 }}
                  whileTap={reduce ? {} : { scale: 0.995 }}
                  layout
                  className={`p-4 rounded-2xl bg-gradient-to-br ${isActive ? "from-yellow-700/5 to-black/20 ring-1 ring-yellow-400/20" : "bg-gray-900/30"} border border-gray-800 flex items-start justify-between gap-3`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-yellow-300">
                      <Zap size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-gray-100">{s.title}</div>
                        <div className="text-xs text-gray-400">{Math.round(s.confidence * 100)}%</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{s.why}</div>

                      {/* small extra line */}
                      <div className="text-xs text-gray-500 mt-2">AI looked at recent balances, recurring bills and category trends.</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveId(s.id); }}
                        className="px-3 py-1 rounded-md border border-gray-700 text-xs text-gray-100"
                        aria-pressed={isActive}
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => { applySuggestion(s); }}
                        disabled={!!applied[s.id]}
                        className={`px-3 py-1 rounded-md text-xs font-medium ${applied[s.id] ? "bg-gray-700 text-gray-300" : "bg-yellow-400 text-black"}`}
                      >
                        {applied[s.id] ? "Applied" : s.action}
                      </button>
                    </div>

                    <button
                      onClick={() => explain(s)}
                      className="text-xs text-gray-400"
                      aria-expanded={explaining === s.id}
                    >
                      {explaining === s.id ? "Hide explanation" : "Explain"}
                    </button>
                  </div>

                  {/* explanation block */}
                  {explaining === s.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 col-span-full w-full"
                    >
                      <div className="mt-3 rounded-lg bg-gray-900/50 p-3 border border-gray-700 text-sm text-gray-300">
                        <div className="font-medium mb-1">Why this recommendation?</div>
                        <div>{s.why}</div>
                        <div className="mt-2 text-xs text-gray-500">Data points: last 3 statements, 6 months transactions, 2 recurring bills.</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* right: preview / impact panel */}
        <motion.aside className="space-y-3 p-4 rounded-2xl bg-gray-900/40 border border-gray-800" layout>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">Preview impact</div>
            <div className="text-xs text-gray-400">Simulated</div>
          </div>

          {/* active suggestion preview */}
          {(() => {
            const s = suggestions.find((x) => x.id === activeId) || suggestions[0];
            if (!s) return <div className="text-sm text-gray-400">No suggestion selected</div>;

            const appliedFlag = !!applied[s.id];
            const newOutstanding = s.impact?.outstandingDelta ? totalOutstanding + s.impact.outstandingDelta : totalOutstanding;
            const utilChange = s.impact?.utilDeltaPct ?? 0;

            // ring progress
            const r = 36;
            const circ = ringCircumference(r);
            const pct = Math.round((s.confidence || 0) * 100);
            const dash = (1 - pct / 100) * circ;

            return (
              <div>
                <div className="flex items-center gap-3">
                  <svg width={84} height={84} viewBox="0 0 84 84">
                    <defs>
                      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <g transform="translate(6,6)">
                      <circle cx="36" cy="36" r={r} stroke="#0b1220" strokeWidth="8" fill="transparent" />
                      <circle cx="36" cy="36" r={r} stroke="url(#g1)" strokeWidth="8" fill="transparent" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={dash} transform="rotate(-90 36 36)" />
                      <text x="36" y="42" textAnchor="middle" fontSize="12" fill="#e5e7eb" fontWeight={700}>{pct}%</text>
                    </g>
                  </svg>

                  <div className="flex-1 text-sm">
                    <div className="font-semibold text-gray-100">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.why}</div>

                    <div className="mt-3 text-xs text-gray-300">
                      <div>Outstanding now: <span className="font-medium">₹{totalOutstanding.toLocaleString()}</span></div>
                      <div>Projected outstanding: <span className="font-medium">₹{newOutstanding.toLocaleString()}</span></div>
                      <div>Estimated utilisation change: <span className="font-medium">{utilChange > 0 ? `+${utilChange}%` : `${utilChange}%`}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => applySuggestion(s)}
                    disabled={appliedFlag}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${appliedFlag ? "bg-gray-700 text-gray-300" : "bg-yellow-400 text-black"}`}
                  >
                    {appliedFlag ? "Applied" : s.action}
                  </button>
                  <button
                    onClick={() => alert("Open planner (demo)")}
                    className="px-3 py-2 rounded-lg border border-gray-700 text-sm"
                  >
                    Plan this
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  This preview is illustrative. Connect your backend to produce exact impact estimates.
                </div>
              </div>
            );
          })()}
        </motion.aside>
      </motion.div>

      <div className="mt-4 text-xs text-gray-500">Demo AI • tweak thresholds in backend for production.</div>
    </motion.div>
  );
};

export default AIInsights;

/* ---------------------------
   SnapshotTile subcomponent
   --------------------------- */
function SnapshotTile({ title, value, sub, progress, icon }: { title: string; value: string; sub: string; progress: number; icon: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="p-3 rounded-2xl bg-gray-800/40 border border-gray-700 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center text-yellow-300">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400">{title}</div>
        <div className="font-semibold text-gray-100">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{sub}</div>

        <div className="mt-3 h-2 w-full bg-gray-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
            transition={{ duration: reduce ? 0 : 0.9 }}
            className="h-2 bg-yellow-400"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
