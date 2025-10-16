// src/pages/statements.tsx
import React, { useMemo, useState } from "react";
import Navbar2 from "@/components/Navbar2";
import DownloadModal from "@/components/modals/DownloadModal";
import { ChevronDown, Download, FileText, RefreshCcw } from "lucide-react";

type Transaction = {
    id: number;
    date: string; // ISO or friendly
    merchant: string;
    amount: number;
    type?: "purchase" | "return";
    note?: string;
};

type Statement = {
    id: number;
    month: string;
    periodStart: string;
    periodEnd: string;
    totalDue: string;
    dueDate: string;
    transactions: Transaction[];
};

type CardType = {
    id: string;
    title: string;
    brand?: string;
    mask: string;
    limit?: string;
    outstanding?: string;
    statements: Statement[];
};

const mockCards: CardType[] = [
    {
        id: "card-1",
        title: "HDFC Millennia",
        brand: "VISA",
        mask: "5241 •••• •••• 5623",
        limit: "₹1,50,000",
        outstanding: "₹48,500",
        statements: [
            {
                id: 101,
                month: "September 2025",
                periodStart: "2025-09-01",
                periodEnd: "2025-09-30",
                totalDue: "₹12,300",
                dueDate: "2025-10-10",
                transactions: [
                    { id: 1, date: "2025-09-02", merchant: "Amazon", amount: 3499, type: "purchase" },
                    { id: 2, date: "2025-09-05", merchant: "Zomato", amount: 899, type: "purchase" },
                    { id: 3, date: "2025-09-12", merchant: "Amazon (return)", amount: -3499, type: "return", note: "Item returned" },
                ],
            },
            {
                id: 102,
                month: "August 2025",
                periodStart: "2025-08-01",
                periodEnd: "2025-08-31",
                totalDue: "₹9,200",
                dueDate: "2025-09-10",
                transactions: [
                    { id: 4, date: "2025-08-02", merchant: "Flipkart", amount: 2599, type: "purchase" },
                    { id: 5, date: "2025-08-15", merchant: "BigBasket", amount: 2599, type: "purchase" },
                ],
            },
        ],
    },
    {
        id: "card-2",
        title: "SBI Elite",
        brand: "MASTERCARD",
        mask: "4024 •••• •••• 1234",
        limit: "₹2,25,000",
        outstanding: "₹12,800",
        statements: [
            {
                id: 201,
                month: "September 2025",
                periodStart: "2025-09-01",
                periodEnd: "2025-09-30",
                totalDue: "₹5,800",
                dueDate: "2025-10-12",
                transactions: [
                    { id: 6, date: "2025-09-04", merchant: "Netflix", amount: 499, type: "purchase" },
                    { id: 7, date: "2025-09-08", merchant: "Bookstore (return)", amount: -1200, type: "return", note: "Damaged item" },
                ],
            },
            {
                id: 202,
                month: "August 2025",
                periodStart: "2025-08-01",
                periodEnd: "2025-08-31",
                totalDue: "₹7,000",
                dueDate: "2025-09-11",
                transactions: [
                    { id: 8, date: "2025-08-03", merchant: "Swiggy", amount: 899, type: "purchase" },
                    { id: 9, date: "2025-08-19", merchant: "Pharmacy", amount: 199, type: "purchase" },
                    { id: 10, date: "2025-08-21", merchant: "Pharmacy (return)", amount: -199, type: "return" },
                ],
            },
            {
                id: 203,
                month: "July 2025",
                periodStart: "2025-07-01",
                periodEnd: "2025-07-31",
                totalDue: "₹2,200",
                dueDate: "2025-08-10",
                transactions: [
                    { id: 11, date: "2025-07-05", merchant: "Gym", amount: 1200, type: "purchase" },
                ],
            },
        ],
    },
];

const StatementsPage: React.FC = () => {
    const [openExport, setOpenExport] = useState(false);

    // Card expand / collapse state
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

    // Selected statement for viewing
    const [selectedStatement, setSelectedStatement] = useState<{
        statement: Statement;
        card: CardType;
    } | null>(null);

    // Where to store current cards — in real app you'll fetch these
    const [cards] = useState<CardType[]>(mockCards);

    // Derived totals: number of returns per statement and per card
    const cardSummaries = useMemo(
        () =>
            cards.map((c) => {
                const totalStatements = c.statements.length;
                const totalReturns = c.statements.reduce(
                    (acc, s) => acc + s.transactions.filter((t) => t.type === "return").length,
                    0
                );
                return { id: c.id, totalStatements, totalReturns };
            }),
        [cards]
    );

    const toggleCard = (id: string) =>
        setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

    const openStatement = (card: CardType, statement: Statement) =>
        setSelectedStatement({ card, statement });

    const closeStatement = () => setSelectedStatement(null);

    const downloadStatement = (stmt: Statement) => {
        // Placeholder - integrate with your DownloadModal or download endpoint
        alert(`Downloading ${stmt.month} statement (demo)`);
    };

    const refreshStatements = () => {
        // placeholder: you'd re-fetch from server
        alert("Refreshing statements (demo)");
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Statements</h1>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refreshStatements()}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-sm text-gray-200 hover:bg-gray-800"
                            aria-label="Refresh statements"
                        >
                            <RefreshCcw size={16} /> Refresh
                        </button>

                        <button
                            onClick={() => setOpenExport(true)}
                            className="px-3 py-2 rounded-lg bg-yellow-400 text-black text-sm flex items-center gap-2"
                            aria-label="Export statements"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {cards.map((c) => {
                        const summary = cardSummaries.find((s) => s.id === c.id);
                        const expanded = !!expandedCards[c.id];
                        return (
                            <div key={c.id} className="rounded-2xl bg-gray-900/60 border border-gray-800 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-xs text-gray-400">CARD</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-semibold">{c.title}</div>
                                            <div className="text-xs text-gray-400 px-2 py-1 rounded bg-gray-800/50">{c.brand}</div>
                                        </div>
                                        <div className="text-sm text-gray-300 mt-1">{c.mask}</div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-xs text-gray-400">Limit</div>
                                        <div className="font-semibold">{c.limit}</div>
                                        <div className="text-xs text-gray-400 mt-2">Outstanding</div>
                                        <div className="font-semibold text-yellow-300">{c.outstanding}</div>
                                    </div>
                                </div>

                                {/* card footer summary */}
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-300">
                                        <div>{summary?.totalStatements} statements</div>
                                        <div className="text-xs text-gray-400">Returns: {summary?.totalReturns}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleCard(c.id)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-700 text-sm"
                                        >
                                            {expanded ? "Collapse" : "View statements"} <ChevronDown size={14} className={`${expanded ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded statements list */}
                                {expanded && (
                                    <div className="mt-4 space-y-3">
                                        {c.statements.map((s) => {
                                            const returnsCount = s.transactions.filter((t) => t.type === "return").length;
                                            return (
                                                <div key={s.id} className="p-3 rounded-lg bg-gray-800/40 border border-gray-700 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{s.month}</div>
                                                        <div className="text-xs text-gray-400">Period: {s.periodStart} — {s.periodEnd}</div>
                                                        <div className="text-xs text-gray-300 mt-1">Due: {s.totalDue} · Due on {s.dueDate}</div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="text-xs text-gray-400 mr-2">Returns: <span className="font-medium text-yellow-300">{returnsCount}</span></div>
                                                        <button
                                                            onClick={() => openStatement(c, s)}
                                                            className="px-3 py-1 rounded-lg bg-transparent border border-gray-700 text-sm flex items-center gap-2"
                                                            aria-label={`View ${s.month} statement`}
                                                        >
                                                            <FileText size={14} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => downloadStatement(s)}
                                                            className="px-3 py-1 rounded-lg border border-gray-700 text-sm flex items-center gap-2"
                                                            aria-label={`Download ${s.month} statement`}
                                                        >
                                                            <Download size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* If no cards */}
                {cards.length === 0 && (
                    <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 text-center">
                        <div className="text-gray-300">No cards found. Add a card to view statements.</div>
                    </div>
                )}

                {/* Statement View Modal */}
                {selectedStatement && (
                    <StatementViewModal
                        card={selectedStatement.card}
                        statement={selectedStatement.statement}
                        onClose={closeStatement}
                    />
                )}

                {/* Export / Download modal */}
                {openExport && (
                    <DownloadModal
                        onClose={() => setOpenExport(false)}
                        onDownload={() => {
                            setOpenExport(false);
                            alert("Export started (demo)");
                        }}
                    />
                )}
            </div>
        </div>
    );
};

/* ---------------------------
   Statement View Modal
   --------------------------- */
const StatementViewModal: React.FC<{
    card: CardType;
    statement: Statement;
    onClose: () => void;
}> = ({ card, statement, onClose }) => {
    const returns = statement.transactions.filter((t) => t.type === "return");
    const purchases = statement.transactions.filter((t) => t.type !== "return");

    const total = statement.transactions.reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative max-w-3xl w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-6 z-10">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs text-gray-400">Statement</div>
                        <div className="text-lg font-semibold">{card.title} · {statement.month}</div>
                        <div className="text-xs text-gray-400">Period: {statement.periodStart} — {statement.periodEnd}</div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-gray-400">Due</div>
                        <div className="font-bold text-yellow-300">{statement.totalDue}</div>
                        <div className="text-xs text-gray-400 mt-1">Due on {statement.dueDate}</div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
                        <div className="text-xs text-gray-400">Transactions</div>
                        <div className="text-lg font-semibold">{statement.transactions.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
                        <div className="text-xs text-gray-400">Returns</div>
                        <div className="text-lg font-semibold text-yellow-300">{returns.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
                        <div className="text-xs text-gray-400">Net total</div>
                        <div className="text-lg font-semibold">{total >= 0 ? `₹${total}` : `- ₹${Math.abs(total)}`}</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="text-sm text-gray-300 font-medium mb-2">Purchases</div>
                    <div className="space-y-2">
                        {purchases.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                                <div>
                                    <div className="font-medium">{t.merchant}</div>
                                    <div className="text-xs text-gray-400">{t.date}</div>
                                </div>
                                <div className="font-medium">₹{t.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="text-sm text-gray-300 font-medium mb-2">Returns / Refunds</div>
                    {returns.length === 0 ? (
                        <div className="text-xs text-gray-400">No returns in this statement.</div>
                    ) : (
                        <div className="space-y-2">
                            {returns.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                                    <div>
                                        <div className="font-medium">{t.merchant}</div>
                                        <div className="text-xs text-gray-400">{t.date} · {t.note ?? ""}</div>
                                    </div>
                                    <div className="font-medium text-yellow-300">₹{t.amount}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-700">Close</button>
                    <button onClick={() => alert("Download statement (demo)")} className="px-4 py-2 rounded-lg bg-yellow-400 text-black">Download</button>
                </div>
            </div>
        </div>
    );
};

export default StatementsPage;
