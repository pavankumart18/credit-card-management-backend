// src/pages/redeems.tsx
import React, { useMemo, useState } from "react";
import Navbar2 from "@/components/Navbar2";
import { useRedeems } from "@/hooks/useApi";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Filter, RefreshCw, Gift, Check, X } from "lucide-react";

/**
 * Rich Redeems / Rewards page
 * - Uses your existing `useRedeems()` hook for options
 * - Self-contained RedeemModal included
 *
 * Replace or adapt visual assets / images / API wiring as needed.
 */

// Types (shape may vary depending on your API)
type RedeemOption = {
    id: string;
    title: string;
    description?: string;
    category?: string;
    cost?: number; // points
    imageUrl?: string | null;
    vendor?: string;
    availableQty?: number;
};

export default function RedeemsPageRich() {
    const { data: options = [], isLoading } = useRedeems();
    const [points, setPoints] = useState<number>(12500);
    const [selected, setSelected] = useState<RedeemOption | null>(null);

    // UI state
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [sort, setSort] = useState<"popular" | "cost-asc" | "cost-desc">("popular");
    const [refreshKey, setRefreshKey] = useState(0);

    const reduce = useReducedMotion();

    // derive categories from options
    const categories = useMemo(() => {
        const set = new Set<string>();
        (options || []).forEach((o: any) => {
            if (o.category) set.add(o.category);
        });
        return ["all", ...Array.from(set)];
    }, [options]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let arr = (options || []) as RedeemOption[];
        if (category !== "all") arr = arr.filter((o) => (o.category || "").toLowerCase() === category.toLowerCase());
        if (q) arr = arr.filter((o) => (o.title + " " + (o.description || "") + " " + (o.vendor || "")).toLowerCase().includes(q));
        if (sort === "cost-asc") arr = arr.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        if (sort === "cost-desc") arr = arr.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        // popular = keep API order
        return arr;
    }, [options, query, category, sort]);

    const affordableCount = filtered.filter((o) => (o.cost || 0) <= points).length;

    // optimistic redeem handler (demo): in real app call your redemption API, handle failures
    const confirmRedeem = async (opt: RedeemOption, qty = 1) => {
        const totalCost = (opt.cost || 0) * qty;
        // optimistic
        setPoints((p) => p - totalCost);
        // decrease availability in UI
        setSelected(null);

        // TODO: call backend to actually redeem
        // await fetch('/api/redeem', { method: 'POST', body: JSON.stringify({ id: opt.id, qty }) })
        // handle errors, rollbacks, show server message

        // demo: small delay + success toast in console
        await new Promise((r) => setTimeout(r, 700));
        console.log(`Redeemed ${qty} x ${opt.title} for ${totalCost} pts (demo)`);
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Rewards</h1>
                        <p className="text-sm text-gray-400 mt-1">Use points for gift cards, vouchers and offers.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl p-3 bg-black/40 border border-gray-800 text-left min-w-[220px]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-400">Points balance</div>
                                    <div className="text-xl font-bold text-yellow-300">{points.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Tier</div>
                                    <div className="text-sm font-semibold">Gold</div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                    {/* progress toward next tier (just demo) */}
                                    <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-400" style={{ width: `${Math.min(100, (points / 20000) * 100)}%` }} />
                                </div>
                                <div className="mt-2 text-xs text-gray-400">Earn 20,000 pts for Platinum</div>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button onClick={() => setPoints((p) => p + 1000)} className="px-3 py-1 rounded bg-yellow-400 text-black text-sm">Earn 1k (demo)</button>
                                <button onClick={() => setRefreshKey((k) => k + 1)} className="px-3 py-1 rounded border border-gray-700 text-sm flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
                            </div>
                        </div>

                        {/* controls */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search rewards"
                                    className="bg-gray-800/40 rounded-2xl px-3 py-2 pl-10 border border-gray-700 w-72 focus:outline-none"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <Search size={16} />
                                </div>
                            </div>

                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-800/40 px-3 py-2 rounded-2xl border border-gray-700 text-sm">
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
                                ))}
                            </select>

                            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-gray-800/40 px-3 py-2 rounded-2xl border border-gray-700 text-sm">
                                <option value="popular">Popular</option>
                                <option value="cost-asc">Cost (low → high)</option>
                                <option value="cost-desc">Cost (high → low)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-400">{filtered.length} offers · {affordableCount} affordable</div>
                    <div className="text-xs text-gray-400">Tip: Use search or filters to find the best rewards.</div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-2xl p-4 bg-gray-900/60 border border-gray-800 animate-pulse h-36" />
                        ))}

                    {!isLoading && filtered.length === 0 && (
                        <div className="col-span-full p-6 rounded-2xl bg-gray-900/60 border border-gray-800 text-center text-gray-400">
                            No rewards found for your search.
                        </div>
                    )}

                    {!isLoading &&
                        filtered.map((o: RedeemOption) => {
                            const cost = o.cost ?? 0;
                            const affordable = cost <= points;
                            return (
                                <motion.div
                                    key={o.id}
                                    layout
                                    whileHover={reduce ? {} : { y: -6 }}
                                    className={`p-4 rounded-2xl bg-gradient-to-br ${affordable ? "from-black/40" : "from-black/30"} border ${affordable ? "border-yellow-400/20" : "border-gray-800"} shadow-md`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 rounded-lg bg-gray-800/60 flex items-center justify-center overflow-hidden">
                                            {/* placeholder image */}
                                            {o.imageUrl ? (
                                                <img src={o.imageUrl} alt={o.title} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="text-yellow-300"><Gift size={28} /></div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold truncate">{o.title}</div>
                                                <div className="text-xs text-gray-400">{o.vendor ?? ""}</div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{o.description ?? "No description available."}</div>

                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold">{(o.cost ?? 0).toLocaleString()} pts</div>
                                                    <div className="text-xs text-gray-400">Cost</div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelected(o)}
                                                        disabled={!affordable}
                                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${affordable ? "bg-yellow-400 text-black" : "bg-gray-800/40 text-gray-400 cursor-not-allowed"}`}
                                                        aria-disabled={!affordable}
                                                    >
                                                        {affordable ? "Redeem" : "Not enough points"}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            // quick preview: open modal with qty 1
                                                            setSelected(o);
                                                        }}
                                                        className="px-2 py-1 rounded-md border border-gray-700 text-xs"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                </div>

                {/* Redeem modal (self-contained) */}
                <RedeemModalInline
                    option={selected}
                    onClose={() => setSelected(null)}
                    onConfirm={async (opt, qty) => {
                        await confirmRedeem(opt, qty);
                    }}
                />
            </div>
        </div>
    );
}

/* -------------------------
   Inline Redeem modal (self-contained)
   ------------------------- */
const RedeemModalInline: React.FC<{
    option: RedeemOption | null;
    onClose: () => void;
    onConfirm: (option: RedeemOption, qty: number) => Promise<void>;
}> = ({ option, onClose, onConfirm }) => {
    const [qty, setQty] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        setQty(1);
        setLoading(false);
        setSuccess(false);
    }, [option]);

    if (!option) return null;

    const maxQty = Math.max(1, option.availableQty ?? 10);
    const totalCost = (option.cost ?? 0) * qty;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60" onClick={() => { if (!loading) onClose(); }} />
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 max-w-lg w-full rounded-2xl bg-gray-900/95 border border-gray-800 p-6"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-sm text-gray-400">Confirm redeem</div>
                        <div className="text-lg font-semibold mt-1">{option.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{option.vendor ?? ""}</div>
                    </div>
                    <button onClick={() => { if (!loading) onClose(); }} className="p-2 rounded-md bg-gray-800/40" aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gray-800/60 flex items-center justify-center">
                            {option.imageUrl ? <img src={option.imageUrl} alt={option.title} className="object-cover w-full h-full" /> : <Gift size={28} className="text-yellow-300" />}
                        </div>
                        <div>
                            <div className="text-sm">{option.description ?? "No description available."}</div>
                            <div className="text-xs text-gray-400 mt-1">Available: {option.availableQty ?? "Unlimited"}</div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">Quantity</label>
                        <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1 rounded bg-gray-800/40">-</button>
                            <input value={qty} onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value || 1))))} type="number" min={1} max={maxQty} className="w-20 bg-gray-800/30 px-3 py-2 rounded" />
                            <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="px-3 py-1 rounded bg-gray-800/40">+</button>
                            <div className="ml-auto text-sm text-gray-400">Cost: <span className="font-semibold">{totalCost.toLocaleString()} pts</span></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">You will be charged the points immediately on confirmation.</div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => { if (!loading) onClose(); }} disabled={loading} className="px-4 py-2 rounded border border-gray-700">Cancel</button>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await onConfirm(option, qty);
                                    setSuccess(true);
                                } catch (err) {
                                    console.error(err);
                                    // show friendly message (could display toast)
                                    alert("Failed to redeem — try again.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-yellow-400 text-black font-medium"
                        >
                            {loading ? "Processing..." : success ? "Done" : "Confirm redeem"}
                        </button>
                    </div>
                </div>

                {success && (
                    <div className="mt-4 rounded-md bg-green-900/30 p-3 border border-green-700 text-sm text-green-200 flex items-center gap-2">
                        <Check /> Redemption successful — your reward will be delivered shortly (demo).
                    </div>
                )}
            </motion.div>
        </div>
    );
};
