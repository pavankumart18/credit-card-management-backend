// src/components/EMIManager.tsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronRight,
  Info,
  Activity,
  DollarSign,
  CheckCircle,
  Zap,
  Clock,
  ArrowRightCircle,
  X,
} from "lucide-react";

type EMI = {
  id: string;
  cardTitle: string;
  originalAmount: number;
  remaining: number;
  monthsLeft: number;
  monthly: number;
  startedAt?: string;
};

interface EMIManagerProps {
  emis?: EMI[];
  onPrepay?: (id: string, amount: number) => void;
  onViewDetails?: (id: string) => void;
}

const demoEmisDefault: EMI[] = [
  {
    id: "emi-1",
    cardTitle: "Platinum Rewards",
    originalAmount: 24000,
    remaining: 12000,
    monthsLeft: 6,
    monthly: 2000,
    startedAt: "2025-04-01",
  },
  {
    id: "emi-2",
    cardTitle: "Gold Cashback",
    originalAmount: 8000,
    remaining: 4000,
    monthsLeft: 4,
    monthly: 1000,
    startedAt: "2025-06-01",
  },
];

const ringCircumference = (r: number) => 2 * Math.PI * r;

export default function EMIManager({ emis = demoEmisDefault, onPrepay, onViewDetails }: EMIManagerProps) {
  const reduce = useReducedMotion();

  // local state to let component be fully interactive in-demo
  const [localEmis, setLocalEmis] = useState<EMI[]>(emis);
  const [openDetails, setOpenDetails] = useState<EMI | null>(null);
  const [prepayOpenFor, setPrepayOpenFor] = useState<string | null>(null);
  const [prepayAmount, setPrepayAmount] = useState<number | "">("");
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Record<string, boolean>>({});
  const [aiExpanded, setAiExpanded] = useState(true);

  // simple derived values
  const totalRemaining = useMemo(
    () => localEmis.reduce((acc, e) => acc + e.remaining, 0),
    [localEmis]
  );

  // Mock AI suggestions generator (per EMI)
  const aiSuggestionsFor = (e: EMI) => {
    const suggestions = [
      {
        id: `${e.id}-pay-more`,
        title: "Prepay 1 month to reduce interest",
        confidence: 0.82,
        why: "Small prepayment reduces interest applied monthly and shortens tenor.",
        action: "Prepay 1 month",
        impact: { remainingDelta: -e.monthly, monthsDelta: -1 },
      },
      {
        id: `${e.id}-lump-suggest`,
        title: "Make a ₹2,000 lump-sum payment",
        confidence: 0.74,
        why: "Reduces principal quickly and may reduce future interest.",
        action: "Pay ₹2,000",
        impact: { remainingDelta: -2000, monthsDelta: Math.random() > 0.5 ? -1 : 0 },
      },
      {
        id: `${e.id}-balance-transfer`,
        title: "Consider balance transfer (0% intro)",
        confidence: 0.56,
        why: "If eligible, moving to 0% promo could save interest for short period.",
        action: "Explore transfer",
        impact: { remainingDelta: 0, monthsDelta: 0 },
      },
    ];
    return suggestions;
  };

  // Apply a prepay locally (optimistic)
  function applyPrepay(id: string, amount: number) {
    setLocalEmis((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            remaining: Math.max(0, Math.round((p.remaining - amount) / 1)), // keep integer rupees
            monthsLeft: Math.max(0, Math.round((p.remaining - amount) / (p.monthly || 1))),
          }
          : p
      )
    );

    onPrepay?.(id, amount);
    // close flow
    setPrepayOpenFor(null);
    setPrepayAmount("");
  }

  // Apply AI suggestion (simulate impact)
  function applySuggestion(emiId: string, suggestionId: string, impact: { remainingDelta?: number; monthsDelta?: number } | undefined) {
    if (appliedSuggestionIds[suggestionId]) return;
    setLocalEmis((prev) =>
      prev.map((p) =>
        p.id === emiId
          ? {
            ...p,
            remaining: Math.max(0, Math.round(p.remaining + (impact?.remainingDelta || 0))),
            monthsLeft: Math.max(0, p.monthsLeft + (impact?.monthsDelta || 0)),
          }
          : p
      )
    );
    setAppliedSuggestionIds((s) => ({ ...s, [suggestionId]: true }));
  }

  // small motion variants
  const container = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } } };
  const item = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="initial" animate="animate" variants={container} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-400">EMI Manager</div>
          <div className="text-2xl font-bold mt-1">Active EMI plans</div>
          <div className="text-xs text-gray-400 mt-1">Overview, prepay in-line, and AI suggestions to reduce interest.</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400">Total remaining</div>
          <div className="text-lg font-semibold text-yellow-300">₹{totalRemaining.toLocaleString()}</div>
        </div>
      </div>

      {/* list of EMIs */}
      <div className="mt-5 space-y-3">
        <AnimatePresence>
          {localEmis.map((e) => {
            const paidPct = Math.round(((e.originalAmount - e.remaining) / e.originalAmount) * 100);
            const r = 28;
            const circ = ringCircumference(r);
            const dash = ((100 - Math.max(0, Math.min(100, paidPct))) / 100) * circ;
            return (
              <motion.div
                key={e.id}
                variants={item}
                whileHover={reduce ? {} : { y: -6 }}
                className="relative p-4 rounded-2xl bg-gray-800/40 border border-gray-700 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* progress ring */}
                  <div className="w-16 h-16 flex items-center justify-center">
                    <svg width={72} height={72} viewBox="0 0 72 72" aria-hidden>
                      <defs>
                        <linearGradient id={`g-${e.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#facc15" />
                          <stop offset="60%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <g transform="translate(36,36)">
                        <circle r={r} stroke="#071018" strokeWidth={8} fill="transparent" />
                        <circle
                          r={r}
                          stroke={`url(#g-${e.id})`}
                          strokeWidth={8}
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray={circ}
                          strokeDashoffset={dash}
                          transform="rotate(-90)"
                        />
                        <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#e5e7eb" fontWeight={700}>
                          {paidPct}%
                        </text>
                      </g>
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{e.cardTitle}</div>
                      <div className="text-xs text-gray-400">· {e.monthsLeft} mo left</div>
                    </div>

                    <div className="text-sm text-gray-300 mt-1 truncate">
                      Remaining <span className="font-semibold text-gray-100">₹{e.remaining.toLocaleString()}</span> · Monthly <span className="font-semibold text-yellow-300">₹{e.monthly.toLocaleString()}</span>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">Started {e.startedAt ?? "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setOpenDetails(e);
                      onViewDetails?.(e.id);
                    }}
                    className="px-3 py-1 rounded-md border border-gray-700 text-sm flex items-center gap-2"
                    aria-label={`View details for ${e.cardTitle}`}
                  >
                    <Info size={14} /> Details
                  </button>

                  <button
                    onClick={() => {
                      setPrepayOpenFor(e.id);
                      setPrepayAmount(Math.min(e.monthly || 0, e.remaining));
                    }}
                    className="px-3 py-1 rounded-md bg-yellow-400 text-black font-medium shadow-sm"
                    aria-label={`Prepay for ${e.cardTitle}`}
                  >
                    <DollarSign size={14} /> Prepay
                  </button>

                  <button
                    onClick={() => {
                      // quick apply smallest AI suggestion
                      const sug = aiSuggestionsFor(e)[0];
                      applySuggestion(e.id, sug.id, sug.impact);
                    }}
                    className="px-3 py-1 rounded-md border border-gray-700 text-sm flex items-center gap-2"
                    aria-label={`Quick suggestion for ${e.cardTitle}`}
                  >
                    <Zap size={14} /> Suggest
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* inline prepay drawer */}
      <AnimatePresence>
        {prepayOpenFor && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="mt-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-300">Prepay — {localEmis.find((x) => x.id === prepayOpenFor)?.cardTitle}</div>
                <div className="text-xs text-gray-400 mt-1">Enter an amount to prepay (min ₹100, max remaining)</div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    value={prepayAmount as any}
                    onChange={(e) => setPrepayAmount(Number(e.target.value))}
                    className="w-40 bg-gray-800/30 px-3 py-2 rounded-md border border-gray-700 text-white"
                    aria-label="Prepay amount"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrepayAmount((a) => (typeof a === "number" ? Math.max(100, Math.round((a || 0) - 500)) : 100))}
                      className="px-3 py-1 rounded-md bg-gray-800/50"
                    >
                      -500
                    </button>
                    <button
                      onClick={() => setPrepayAmount((a) => (typeof a === "number" ? Math.round((a || 0) + 500) : 500))}
                      className="px-3 py-1 rounded-md bg-gray-800/50"
                    >
                      +500
                    </button>
                    <button
                      onClick={() => {
                        const emi = localEmis.find((x) => x.id === prepayOpenFor);
                        if (!emi) return;
                        setPrepayAmount(Math.min(emi.remaining, emi.monthly * 2));
                      }}
                      className="px-3 py-1 rounded-md border border-gray-700 text-sm"
                      title="Quick set to 2 months"
                    >
                      Quick 2 months
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Preview:{" "}
                  <span className="font-semibold text-gray-100">
                    Remaining →{" "}
                    {localEmis
                      .find((x) => x.id === prepayOpenFor)?.remaining != null
                      ? `₹${Math.max(
                        0,
                        (localEmis.find((x) => x.id === prepayOpenFor)!.remaining - (Number(prepayAmount) || 0))
                      ).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-gray-400">Action</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPrepayOpenFor(null);
                      setPrepayAmount("");
                    }}
                    className="px-3 py-1 rounded-md border border-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!prepayOpenFor) return;
                      const amt = Number(prepayAmount || 0);
                      if (isNaN(amt) || amt < 100) {
                        alert("Enter a valid amount (min ₹100).");
                        return;
                      }
                      const emi = localEmis.find((x) => x.id === prepayOpenFor);
                      if (!emi) return;
                      const maxAllow = emi.remaining;
                      const clamped = Math.min(maxAllow, Math.round(amt));
                      applyPrepay(prepayOpenFor, clamped);
                    }}
                    className="px-3 py-1 rounded-md bg-yellow-400 text-black font-medium"
                    aria-label="Confirm prepay"
                  >
                    Confirm Prepay
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI suggestions area */}
      <motion.div className="mt-6 p-4 rounded-2xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-400/10 text-yellow-300">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-sm text-gray-300">AI Suggestions</div>
              <div className="text-xs text-gray-400">Tailored recommendations to reduce interest and tenure</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiExpanded((s) => !s)}
              className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-300"
            >
              {aiExpanded ? "Collapse" : "Expand"}
            </button>
            <div className="text-xs text-gray-400">Auto prioritized</div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {aiExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {localEmis.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-gray-900/40 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{e.cardTitle}</div>
                        <div className="text-xs text-gray-400 mt-1">Remaining ₹{e.remaining.toLocaleString()} · {e.monthsLeft} months</div>
                      </div>

                      <div className="text-xs text-gray-400">Confidence</div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {aiSuggestionsFor(e).map((s) => {
                        const applied = !!appliedSuggestionIds[s.id];
                        return (
                          <motion.div
                            key={s.id}
                            whileHover={reduce ? {} : { scale: 1.01 }}
                            className="p-3 rounded-lg bg-gray-800/30 border border-gray-700 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-100">{s.title}</div>
                                <div className="text-xs text-gray-400">{Math.round(s.confidence * 100)}%</div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">{s.why}</div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => applySuggestion(e.id, s.id, s.impact)}
                                disabled={applied}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${applied ? "bg-gray-700 text-gray-300" : "bg-yellow-400 text-black"}`}
                              >
                                {applied ? "Applied" : s.action}
                              </button>

                              <button
                                onClick={() => {
                                  // preview -> open details and show simulated impact
                                  setOpenDetails({ ...e, remaining: Math.max(0, Math.round(e.remaining + (s.impact?.remainingDelta || 0))), monthsLeft: Math.max(0, e.monthsLeft + (s.impact?.monthsDelta || 0)) });
                                }}
                                className="text-xs text-gray-400"
                              >
                                Preview impact
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Details modal */}
      <AnimatePresence>
        {openDetails && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpenDetails(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 max-w-2xl w-full rounded-2xl bg-gray-900/90 border border-gray-700 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-400">EMI details</div>
                  <div className="text-lg font-semibold mt-1">{openDetails.cardTitle}</div>
                  <div className="text-xs text-gray-400 mt-1">Started {openDetails.startedAt ?? "—"}</div>
                </div>

                <button onClick={() => setOpenDetails(null)} className="p-2 rounded-md bg-gray-800/40" aria-label="Close details">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <div className="text-xs text-gray-400">Original amount</div>
                  <div className="font-semibold mt-1">₹{openDetails.originalAmount.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <div className="text-xs text-gray-400">Remaining</div>
                  <div className="font-semibold mt-1 text-yellow-300">₹{openDetails.remaining.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <div className="text-xs text-gray-400">Months left</div>
                  <div className="font-semibold mt-1">{openDetails.monthsLeft} mo</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Repayment schedule (mock)</div>
                  <div className="text-xs text-gray-400">Next payment • ₹{openDetails.monthly.toLocaleString()}</div>
                </div>

                <div className="mt-3 space-y-2">
                  {Array.from({ length: openDetails.monthsLeft }).map((_, i) => {
                    const due = new Date();
                    due.setMonth(due.getMonth() + i + 1);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-md bg-gray-800/20 border border-gray-700">
                        <div className="text-sm">Installment #{i + 1}</div>
                        <div className="text-xs text-gray-400">{due.toLocaleString("default", { month: "short", year: "numeric" })}</div>
                        <div className="font-semibold">₹{openDetails.monthly.toLocaleString()}</div>
                      </div>
                    );
                  })}
                  {openDetails.monthsLeft === 0 && <div className="text-xs text-gray-400">No future installments — cleared or closed.</div>}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setOpenDetails(null)} className="px-4 py-2 rounded-md border border-gray-700">Close</button>
                <button
                  onClick={() => {
                    // quick prepay modal for this emi
                    setPrepayOpenFor(openDetails.id);
                    setOpenDetails(null);
                    setPrepayAmount(Math.min(openDetails.monthly * 1, openDetails.remaining));
                  }}
                  className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium"
                >
                  Prepay now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
