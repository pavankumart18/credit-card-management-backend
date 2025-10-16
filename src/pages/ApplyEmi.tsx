// src/pages/apply-emi.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, ArrowRightCircle, X, Info, DollarSign } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout"; // optional - remove if you don't have it

// ---------- Types ----------
type CardItem = {
    id: string;
    title: string;
    mask: string;
    brand?: string;
    limit?: string;
    outstanding?: string;
};

type EmiPlan = {
    id: string;
    bank: string;
    tenureMonths: number;
    annualRatePct: number; // annual interest rate percent, e.g. 14.5
    processingFeePct?: number; // percentage of principal
    description?: string;
};

// ---------- Helpers ----------
/**
 * EMI formula (annuity):
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where r = monthlyRate (decimal), n = months
 */
function calcEMI(principal: number, annualRatePct: number, months: number) {
    // compute monthly rate as decimal
    // step-by-step to avoid arithmetic mistakes:
    // monthlyRate = annualRatePct / 12 / 100
    const monthlyRate = annualRatePct / 12 / 100;

    if (months <= 0) return { emi: 0, totalPayable: 0, totalInterest: 0 };

    // compute (1 + r)^n
    const pow = Math.pow(1 + monthlyRate, months);

    // if rate is zero (0% interest)
    if (monthlyRate === 0) {
        const emi = principal / months;
        const totalPayable = emi * months;
        const totalInterest = totalPayable - principal;
        return { emi, totalPayable, totalInterest };
    }

    // EMI formula
    const emi = (principal * monthlyRate * pow) / (pow - 1);

    // keep numeric precision reasonable
    const emiRounded = Math.round(emi);
    const totalPayable = emiRounded * months;
    const totalInterest = totalPayable - principal;

    return { emi: emiRounded, totalPayable, totalInterest };
}

/** Format currency */
const formatINR = (v: number) => `₹${v.toLocaleString()}`;

// ---------- Mock data (replace with your API) ----------
const MOCK_CARDS: CardItem[] = [
    { id: "card-1", title: "HDFC Bank • Millennia", mask: "5241 •••• •••• 5623", brand: "VISA", outstanding: "₹48,500", limit: "₹150,000" },
    { id: "card-2", title: "SBI Card • Elite", mask: "4024 •••• •••• 1234", brand: "MASTERCARD", outstanding: "₹12,800", limit: "₹225,000" },
];

const DEFAULT_PLANS: EmiPlan[] = [
    { id: "plan-1", bank: "FastBank", tenureMonths: 6, annualRatePct: 12.5, processingFeePct: 1.0, description: "Low-rate short tenure" },
    { id: "plan-2", bank: "FlexiFinance", tenureMonths: 12, annualRatePct: 14.0, processingFeePct: 0.75, description: "Balanced tenure" },
    { id: "plan-3", bank: "NoHassle", tenureMonths: 24, annualRatePct: 16.5, processingFeePct: 0.5, description: "Longer tenure, lower fee" },
];

// ---------- Page Component ----------
const ApplyEmiPage: React.FC = () => {
    // form state
    const [selectedCardId, setSelectedCardId] = useState<string | null>(MOCK_CARDS[0].id);
    const [amount, setAmount] = useState<number | "">("");
    const [tenure, setTenure] = useState<number>(12); // months (UI slider)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(DEFAULT_PLANS[1].id);
    const [agreeTerms, setAgreeTerms] = useState(false);

    // UI state
    const [loadingApply, setLoadingApply] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ applicationId: string; approved?: boolean } | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // dynamic filtered plans: show plans with matching tenure or show all if custom months selected
    const plansForTenure = useMemo(() => {
        // include plans whose tenure equals selected tenure; also include default options near the tenure
        const exact = DEFAULT_PLANS.filter((p) => p.tenureMonths === tenure);
        if (exact.length > 0) return exact;
        // otherwise show all plans but mark closest
        return DEFAULT_PLANS;
    }, [tenure]);

    const selectedCard = MOCK_CARDS.find((c) => c.id === selectedCardId) ?? null;
    const selectedPlan = DEFAULT_PLANS.find((p) => p.id === selectedPlanId) ?? DEFAULT_PLANS[1];

    // EMI preview for current amount + selected plan
    const emiPreview = useMemo(() => {
        const principal = typeof amount === "number" ? Math.max(0, Math.round(amount)) : 0;
        const { emi, totalPayable, totalInterest } = calcEMI(principal, selectedPlan.annualRatePct, tenure);
        const processingFee = selectedPlan.processingFeePct ? Math.round((selectedPlan.processingFeePct / 100) * principal) : 0;
        return { principal, emi, totalPayable: totalPayable + processingFee, totalInterest: totalInterest + processingFee, processingFee };
    }, [amount, selectedPlan, tenure]);

    // validation
    const validationErrors = useMemo(() => {
        const errs: string[] = [];
        if (!selectedCardId) errs.push("Select a card to convert to EMI.");
        if (typeof amount !== "number" || isNaN(amount) || amount <= 0) errs.push("Enter a valid loan amount.");
        if (amount && typeof amount === "number") {
            // optional: check against card limit/outstanding — demo uses strings so we skip strict parse
            // For real app, fetch card.availableCredit and validate: amount <= availableCredit
        }
        if (!agreeTerms) errs.push("You must agree to the terms and conditions to apply.");
        return errs;
    }, [selectedCardId, amount, agreeTerms]);

    // handle apply — calls backend endpoint (/api/emi/apply) — replace with real endpoint
    async function handleApply() {
        setErrorMsg(null);

        if (validationErrors.length > 0) {
            setErrorMsg(validationErrors[0]);
            return;
        }

        // show confirmation modal first
        setShowConfirmModal(true);
    }

    async function confirmApply() {
        setShowConfirmModal(false);
        setLoadingApply(true);
        setErrorMsg(null);

        try {
            // Build payload
            const payload = {
                cardId: selectedCardId,
                principal: typeof amount === "number" ? amount : 0,
                tenureMonths: tenure,
                planId: selectedPlan.id,
                estimatedEMI: emiPreview.emi,
            };

            // Demo: fake API delay + random success/failure
            await new Promise((res) => setTimeout(res, 1200));

            // Replace this block with a real fetch:
            // const resp = await fetch('/api/emi/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            // if (!resp.ok) throw new Error(await resp.text());
            // const result = await resp.json();

            // demo success:
            const result = { applicationId: `EMI-${Date.now()}`, approved: Math.random() > 0.1 };

            setSuccessData(result);
            setLoadingApply(false);

            // optionally: send analytics event here
        } catch (err: any) {
            console.error(err);
            setErrorMsg("Failed to apply — please try again.");
            setLoadingApply(false);
        }
    }

    // small UI helpers
    function setAmountFromInput(v: string) {
        const num = Number(v.replace(/[^\d]/g, ""));
        if (v === "") return setAmount("");
        if (isNaN(num)) return setAmount("");
        setAmount(Math.round(num));
    }

    function resetForm() {
        setSelectedCardId(MOCK_CARDS[0].id);
        setAmount("");
        setTenure(12);
        setSelectedPlanId(DEFAULT_PLANS[1].id);
        setAgreeTerms(false);
        setSuccessData(null);
        setErrorMsg(null);
    }

    // success screen (after apply)
    if (successData) {
        return (
            <MainLayout>
                <div className="max-w-3xl mx-auto p-6">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl bg-gradient-to-br from-gray-900/60 to-black/40 border border-gray-800 shadow-2xl text-center">
                        <CheckCircle size={56} className="mx-auto text-yellow-300" />
                        <h2 className="mt-4 text-2xl font-semibold text-gray-100">{successData.approved ? "Application submitted" : "Application received"}</h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Application ID: <span className="font-mono">{successData.applicationId}</span>
                        </p>

                        <div className="mt-6 text-left space-y-3">
                            <div>
                                <div className="text-xs text-gray-400">Plan</div>
                                <div className="font-medium">{selectedPlan.bank} · {tenure} months · {selectedPlan.annualRatePct}% APR</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-400">EMI</div>
                                <div className="font-semibold">{formatINR(emiPreview.emi)} / month</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-400">Total payable</div>
                                <div className="font-semibold text-yellow-300">{formatINR(emiPreview.totalPayable)}</div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button onClick={() => { resetForm(); }} className="px-4 py-2 rounded-lg border border-gray-700">Apply another</button>
                            <button onClick={() => { /* navigate to statements/payments page — replace with router push */ window.location.href = "/statements"; }} className="px-4 py-2 rounded-lg bg-yellow-400 text-black">Go to Statements</button>
                        </div>
                    </motion.div>
                </div>
            </MainLayout>
        );
    }

    // ---------- Render: main form ----------
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-6">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-gradient-to-br from-gray-900/60 to-black/40 border border-gray-800 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Apply for EMI</h1>
                            <p className="text-sm text-gray-400 mt-1">Convert your card spends or transactions into easy monthly EMIs. Preview options and apply in a few steps.</p>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-gray-400">Quick tip</div>
                            <div className="text-sm font-semibold text-yellow-300">Choose a plan → Preview → Confirm</div>
                        </div>
                    </div>

                    {/* form */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column: inputs */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* select card */}
                            <div>
                                <label className="text-xs text-gray-300">Select card</label>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {MOCK_CARDS.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCardId(c.id)}
                                            className={`text-left p-3 rounded-lg border ${selectedCardId === c.id ? "border-yellow-400 bg-yellow-400/6 ring-1 ring-yellow-400/20" : "border-gray-700 bg-gray-800/40"} focus:outline-none`}
                                            aria-pressed={selectedCardId === c.id}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold">{c.title}</div>
                                                    <div className="text-xs text-gray-400 mt-1">{c.mask}</div>
                                                </div>
                                                <div className="text-xs text-gray-400">{c.brand}</div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400">Outstanding: {c.outstanding}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* amount */}
                            <div>
                                <label className="text-xs text-gray-300">Loan amount</label>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center bg-gray-800/30 px-3 py-2 rounded-md">
                                        <DollarSign size={18} className="text-yellow-300" />
                                    </div>
                                    <input
                                        inputMode="numeric"
                                        value={amount === "" ? "" : String(amount)}
                                        onChange={(e) => setAmountFromInput(e.target.value)}
                                        placeholder="Enter amount (e.g. 12000)"
                                        className="flex-1 bg-transparent border border-gray-700 rounded-md px-3 py-2 focus:outline-none"
                                        aria-label="Loan amount"
                                    />
                                    <div className="text-xs text-gray-400">Available: {selectedCard?.limit ?? "—"}</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">Tip: enter amount you want to convert to EMI. Min ₹1,000 (or per your bank).</div>
                            </div>

                            {/* tenor slider */}
                            <div>
                                <label className="text-xs text-gray-300">Tenure (months): <span className="font-medium text-gray-100">{tenure}</span></label>
                                <div className="mt-3">
                                    <input
                                        type="range"
                                        min={3}
                                        max={36}
                                        step={1}
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                        className="w-full"
                                        aria-label="Tenure in months"
                                    />
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                        <div className="flex gap-2">
                                            <button onClick={() => setTenure(3)} className="px-2 py-1 rounded border border-gray-700">3</button>
                                            <button onClick={() => setTenure(6)} className="px-2 py-1 rounded border border-gray-700">6</button>
                                            <button onClick={() => setTenure(12)} className="px-2 py-1 rounded border border-gray-700">12</button>
                                            <button onClick={() => setTenure(24)} className="px-2 py-1 rounded border border-gray-700">24</button>
                                            <button onClick={() => setTenure(36)} className="px-2 py-1 rounded border border-gray-700">36</button>
                                        </div>
                                        <div className="ml-auto">Choose tenure for EMI estimate</div>
                                    </div>
                                </div>
                            </div>

                            {/* plan chooser */}
                            <div>
                                <label className="text-xs text-gray-300">Choose plan</label>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {plansForTenure.map((p) => {
                                        const preview = calcEMI(typeof amount === "number" ? amount : 0, p.annualRatePct, tenure);
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelectedPlanId(p.id); }}
                                                className={`p-3 rounded-lg text-left border ${selectedPlanId === p.id ? "bg-yellow-400/6 border-yellow-400 ring-1 ring-yellow-400/20" : "bg-gray-800/30 border-gray-700"} focus:outline-none`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-semibold">{p.bank}</div>
                                                        <div className="text-xs text-gray-400 mt-1">{p.tenureMonths} months · {p.annualRatePct}% APR</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold">{formatINR(preview.emi)}</div>
                                                        <div className="text-xs text-gray-400">est. EMI</div>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-gray-400">{p.description}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">Tip: APR and fees vary by partner — preview total cost before applying.</div>
                            </div>
                        </div>

                        {/* Right column: summary */}
                        <aside className="lg:col-span-1">
                            <div className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700 sticky top-24">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-400">Selected EMI estimate</div>
                                        <div className="text-lg font-semibold mt-1">{formatINR(emiPreview.emi)} / month</div>
                                    </div>
                                    <div className="text-xs text-gray-400">Tenure {tenure} mo</div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="text-gray-400">Principal</div>
                                        <div className="font-medium">{formatINR(emiPreview.principal)}</div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-gray-400">Processing fee</div>
                                        <div className="font-medium">{formatINR(emiPreview.processingFee)}</div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-gray-400">Total interest + fees</div>
                                        <div className="font-medium text-red-400">{formatINR(Math.max(0, emiPreview.totalInterest - (emiPreview.totalPayable - emiPreview.processingFee - emiPreview.principal)))}</div>
                                    </div>

                                    <hr className="my-2 border-gray-800" />

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">Total payable</div>
                                        <div className="text-lg font-semibold text-yellow-300">{formatINR(emiPreview.totalPayable)}</div>
                                    </div>

                                    <div className="text-xs text-gray-400 mt-2">Payments will be charged to your selected card monthly.</div>
                                </div>

                                {/* terms */}
                                <div className="mt-4">
                                    <label className="flex items-start gap-2">
                                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1" />
                                        <div className="text-xs text-gray-300">I agree to <button className="text-yellow-300 underline">terms & conditions</button> and consent to a soft credit check.</div>
                                    </label>
                                </div>

                                {/* errors */}
                                {errorMsg && <div className="mt-3 text-sm text-red-400">{errorMsg}</div>}

                                <div className="mt-4 flex items-center gap-3">
                                    <button onClick={handleApply} disabled={loadingApply} className="flex-1 px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium">
                                        {loadingApply ? "Applying..." : "Apply now"}
                                    </button>
                                    <button onClick={() => { /* show help */ alert("Contact support (demo)"); }} className="px-3 py-2 rounded-lg border border-gray-700">Help</button>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* small legal / info */}
                    <div className="mt-6 text-xs text-gray-500">Note: This is a demo EMI application UI. Replace API endpoints with your lender/integration. Interest & fees shown are illustrative.</div>
                </motion.div>
            </div>

            {/* Confirmation modal */}
            <AnimateConfirmModal
                open={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmApply}
                payload={{
                    card: selectedCard,
                    principal: typeof amount === "number" ? amount : 0,
                    tenure,
                    plan: selectedPlan,
                    emi: emiPreview.emi,
                    total: emiPreview.totalPayable,
                }}
            />
        </MainLayout>
    );
};

// ---------- Confirm Modal component ----------
const AnimateConfirmModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    payload: {
        card: CardItem | null;
        principal: number;
        tenure: number;
        plan: EmiPlan | null;
        emi: number;
        total: number;
    };
}> = ({ open, onClose, onConfirm, payload }) => {
    if (!open) return null;
    const p = payload;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="relative z-10 max-w-xl w-full bg-gray-900/90 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-sm text-gray-400">Confirm EMI application</div>
                        <div className="text-lg font-semibold mt-1">You're about to apply</div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md bg-gray-800/30">
                        <X size={16} />
                    </button>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <div>Card</div>
                        <div className="font-medium">{p.card?.title ?? "-"}</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>Principal</div>
                        <div className="font-medium">{formatINR(p.principal)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>Tenure</div>
                        <div className="font-medium">{p.tenure} months</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>Estimated EMI</div>
                        <div className="font-medium">{formatINR(p.emi)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>Total payable</div>
                        <div className="font-semibold text-yellow-300">{formatINR(p.total)}</div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-700">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium">Confirm & apply</button>
                </div>
            </motion.div>
        </div>
    );
};

export default ApplyEmiPage;
