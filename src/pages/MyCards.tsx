import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    EyeOff,
    Plus,
    Trash2,
    Edit3,
    CreditCard,
    Key,
    Ban,
    Check,
    MoreVertical,
    Bell,
    Settings,
    User,
    ChevronDown,
    LogOut,
    Menu,
    X,
    SunMoon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Types
type Card = {
    id: string;
    title: string;
    subtitle?: string;
    number: string;
    masked?: boolean;
    limit?: string;
    outstanding?: string;
    expiry?: string;
    cvv?: string;
    brand?: string;
    blocked?: boolean;
};

type Notification = {
    id: string;
    title: string;
    body?: string;
    date?: string;
    read?: boolean;
    link?: string;
};

const sampleCards: Card[] = [
    {
        id: "1",
        title: "HDFC Millennia",
        subtitle: "Personal",
        number: "5241 7823 9401 5623",
        masked: true,
        limit: "₹1,50,000",
        outstanding: "₹48,500",
        expiry: "08/27",
        cvv: "123",
        brand: "VISA",
        blocked: false,
    },
    {
        id: "2",
        title: "SBI Elite",
        subtitle: "Travel",
        number: "4024 0071 7864 1234",
        masked: true,
        limit: "₹2,25,000",
        outstanding: "₹12,800",
        expiry: "11/26",
        cvv: "456",
        brand: "MASTERCARD",
        blocked: false,
    },
];

const gradients = [
    "linear-gradient(135deg, #0f172a 0%, #071018 60%), linear-gradient(135deg, #f59e0b 0%, rgba(255,255,255,0.04) 100%)",
    "linear-gradient(135deg, #071018 0%, #0b1220 60%), linear-gradient(135deg, #facc15 0%, rgba(255,255,255,0.03) 100%)",
];

const generateId = () => String(Date.now() + Math.floor(Math.random() * 1000));

export default function MyCardsPage(): JSX.Element {
    const [cards, setCards] = useState<Card[]>(sampleCards);
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState<"recent" | "limit" | "outstanding">("recent");
    const [showAdd, setShowAdd] = useState(false);
    const [showPinFor, setShowPinFor] = useState<Card | null>(null);
    const [detailsFor, setDetailsFor] = useState<Card | null>(null);
    const [editing, setEditing] = useState<Card | null>(null);

    function handleAddCard(payload: Omit<Card, "id" | "masked" | "blocked">) {
        const newCard: Card = {
            id: generateId(),
            ...payload,
            masked: true,
            blocked: false,
        };
        setCards((c) => [newCard, ...c]);
        setShowAdd(false);
    }

    function handleUpdateCard(id: string, patch: Partial<Card>) {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
        setEditing(null);
    }

    function toggleBlockCard(id: string) {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
    }

    function handleDeleteCard(id: string) {
        const proceed = typeof window !== "undefined" ? window.confirm("Delete this card? This action cannot be undone.") : true;
        if (!proceed) return;
        setCards((prev) => prev.filter((c) => c.id !== id));
    }

    function toggleMask(id: string) {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, masked: !c.masked } : c)));
    }

    function handleSetPin(cardId: string, pin: string) {
        setShowPinFor(null);
        alert(`PIN set for card ${cardId} (demo)`);
    }

    const visible = useMemo(() => {
        let arr = [...cards];
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            arr = arr.filter((c) => `${c.title} ${c.subtitle} ${c.number} ${c.brand}`.toLowerCase().includes(q));
        }
        if (sortBy === "limit") {
            arr.sort((a, b) => {
                const pa = parseInt((a.limit || "0").replace(/[^0-9]/g, "")) || 0;
                const pb = parseInt((b.limit || "0").replace(/[^0-9]/g, "")) || 0;
                return pb - pa;
            });
        } else if (sortBy === "outstanding") {
            arr.sort((a, b) => {
                const pa = parseInt((a.outstanding || "0").replace(/[^0-9]/g, "")) || 0;
                const pb = parseInt((b.outstanding || "0").replace(/[^0-9]/g, "")) || 0;
                return pb - pa;
            });
        }
        return arr;
    }, [cards, query, sortBy]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white font-sans">
            <Navbar2 />
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                <HeaderBar
                    query={query}
                    setQuery={setQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onAdd={() => setShowAdd(true)}
                />

                <div className="rounded-3xl bg-white/5 p-8 border border-gray-800 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {visible.map((c, i) => (
                                <CardTile
                                    key={c.id}
                                    card={c}
                                    gradient={gradients[i % gradients.length]}
                                    onToggleMask={() => toggleMask(c.id)}
                                    onPin={() => setShowPinFor(c)}
                                    onDetails={() => setDetailsFor(c)}
                                    onEdit={() => setEditing(c)}
                                    onToggleBlock={() => toggleBlockCard(c.id)}
                                    onDelete={() => handleDeleteCard(c.id)}
                                />
                            ))}
                            {visible.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-gray-400 col-span-full text-center">
                                    <p>No cards found — add a new card to get started. 💳</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="text-xs text-gray-400 text-center mt-8">
                    Tip: Click <span className="text-yellow-300">Manage PIN</span> to set or change your card's PIN. Block a card immediately if it's lost.
                </div>
            </div>

            <AnimatePresence>{showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={(payload) => handleAddCard(payload)} />}</AnimatePresence>
            <AnimatePresence>{showPinFor && <PinModal card={showPinFor} onClose={() => setShowPinFor(null)} onSave={(pin) => { if (showPinFor) handleSetPin(showPinFor.id, pin); }} />}</AnimatePresence>
            <AnimatePresence>{detailsFor && <DetailsPanel card={detailsFor} onClose={() => setDetailsFor(null)} onEdit={(patch) => handleUpdateCard(detailsFor.id, patch)} />}</AnimatePresence>
            <AnimatePresence>{editing && <AddCardModal initial={editing} onClose={() => setEditing(null)} onAdd={(payload) => handleUpdateCard(editing.id, payload)} editMode />}</AnimatePresence>
        </div>
    );
}

// --- Navbar2 Component (from prompt) ---
const STORAGE_KEY = "credx.notifications.demo";
const defaultNav = ["Dashboard", "Cards", "Transactions", "Redeems", "Statements", "Support"];

const Navbar2: React.FC = () => {
    const navItems = defaultNav;
    const navigate = useNavigate();

    const [active, setActive] = useState<string>("Cards");
    const [showProfile, setShowProfile] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const searchRef = useRef<HTMLInputElement | null>(null);
    const [localNotifs, setLocalNotifs] = useState<Notification[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved) as Notification[];
        } catch (e) { }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotifs));
    }, [localNotifs]);

    const unreadCount = localNotifs.filter((n) => !n.read).length;

    const go = (p: string) => {
        setActive(p);
        const path = p === "Dashboard" ? "/dashboard" : `/${p.toLowerCase()}`;
        try {
            navigate(path);
        } catch (e) {
            window.location.href = path;
        }
        setMobileOpen(false);
    };

    function openNotification(n: Notification) {
        setLocalNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        if (n.link) {
            try {
                navigate(n.link);
            } catch {
                window.location.href = n.link;
            }
        }
        setShowNotif(false);
    }

    function markAllRead() {
        setLocalNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
    }

    useEffect(() => {
        let gMode = false;
        function onKey(e: KeyboardEvent) {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable)) return;
            if (e.key === "n") { e.preventDefault(); setShowNotif((s) => !s); setShowProfile(false); setMobileOpen(false); return; }
            if (e.key === "p") { e.preventDefault(); setShowProfile((s) => !s); setShowNotif(false); return; }
            if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return; }
            if (gMode) {
                const map: Record<string, string> = { d: "Dashboard", c: "Cards", t: "Transactions", r: "Redeems", s: "Statements", u: "Support", e: "Apply-EMI", };
                const key = e.key.toLowerCase();
                if (map[key]) { e.preventDefault(); go(map[key]); }
                gMode = false;
                return;
            }
            if (e.key === "g") { gMode = true; setTimeout(() => { gMode = false; }, 1600); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [navigate]);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.classList.remove("dark");
        } else {
            root.classList.add("dark");
        }
    }, [theme]);

    const menuMotion = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

    return (
        <nav className="w-full bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/40 shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="md:hidden">
                        <button onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle menu" className="p-2 rounded-md">
                            {mobileOpen ? <X size={20} className="text-gray-300" /> : <Menu size={20} className="text-gray-300" />}
                        </button>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent cursor-pointer"
                        onClick={() => go("Dashboard")}
                        role="button"
                        aria-label="Go to Dashboard"
                    >
                        CredX
                    </motion.div>
                </div>
                <ul className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
                    {navItems.map((item) => (
                        <li key={item} className="relative">
                            <button
                                onClick={() => go(item)}
                                className={`relative px-1 py-1 ${active === item ? "text-yellow-400" : "hover:text-white"} focus:outline-none`}
                                aria-current={active === item ? "page" : undefined}
                            >
                                {item}
                                {active === item && (
                                    <motion.span layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center bg-gray-800/40 rounded-full px-3 py-1 border border-gray-700">
                        <input ref={searchRef} placeholder="Search (/)..." className="bg-transparent outline-none text-sm text-gray-200 w-48" aria-label="Global search" />
                    </div>
                    <div className="relative">
                        <button onClick={() => { setShowNotif((s) => !s); setShowProfile(false); setShowSettingsPanel(false); }} aria-haspopup="true" aria-expanded={showNotif} className="relative p-2 rounded-md" title="Notifications (n)">
                            <Bell size={20} className="text-gray-300 hover:text-yellow-400 transition" />
                            {unreadCount > 0 && (<span className="absolute -top-1 -right-1 bg-yellow-400 w-2.5 h-2.5 rounded-full border border-gray-900 animate-pulse" aria-hidden />)}
                            <span className="sr-only">{unreadCount} unread notifications</span>
                        </button>
                        {showNotif && (
                            <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-80">
                                <div className="px-2 py-1 border-b border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-yellow-400 font-semibold">Notifications</p><p className="text-sm text-gray-400">Recent activity & alerts</p></div>
                                        <div><button onClick={markAllRead} className="text-xs text-gray-400 hover:text-white">Mark all read</button></div>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
                                    {localNotifs.length === 0 && <div className="text-sm text-gray-400 p-2">No notifications</div>}
                                    {localNotifs.map((n) => (
                                        <button key={n.id} onClick={() => openNotification(n)} className={`p-2 rounded-lg w-full text-left ${n.read ? "bg-gray-900/0" : "bg-gray-800/40"} hover:bg-gray-800/60 flex flex-col`} >
                                            <div className="flex items-center justify-between"><div className="text-sm font-medium text-gray-100">{n.title}</div><div className="text-xs text-gray-400">{n.date}</div></div>
                                            {n.body && <div className="text-xs text-gray-400 mt-1">{n.body}</div>}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 text-right">
                                    <button onClick={() => { go("Dashboard"); setShowNotif(false); }} className="text-xs text-gray-400 hover:text-white">View all</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => { setShowSettingsPanel((s) => !s); setShowProfile(false); setShowNotif(false); }} title="Settings" className="p-2 rounded-md">
                            <Settings size={20} className="text-gray-300 hover:text-yellow-400 transition" />
                        </button>
                        {showSettingsPanel && (
                            <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-52">
                                <div className="flex items-center justify-between mb-2"><div className="text-sm text-gray-300">Settings</div></div>
                                <div className="space-y-2">
                                    <button onClick={() => { setTheme((t) => (t === "dark" ? "light" : "dark")); }} className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-800/40"><div className="flex items-center gap-2"><SunMoon size={16} /><div className="text-sm">Theme</div></div><div className="text-xs text-gray-400">{theme}</div></button>
                                    <button onClick={() => go("Support")} className="w-full text-left p-2 rounded-md hover:bg-gray-800/40">Account & support</button>
                                    <button onClick={() => { go("Support"); setShowSettingsPanel(false); }} className="w-full text-left p-2 rounded-md hover:bg-gray-800/40 text-xs text-gray-400">Open advanced settings</button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => { setShowProfile((s) => !s); setShowNotif(false); setShowSettingsPanel(false); }} aria-haspopup="true" aria-expanded={showProfile} className="flex items-center gap-2 p-1 rounded-full focus:outline-none" title="Profile (p)">
                            <div className="p-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"><User size={18} className="text-black" /></div>
                            <ChevronDown size={16} className={`text-gray-300 transition-transform ${showProfile ? "rotate-180" : ""}`} />
                        </button>
                        {showProfile && (
                            <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-48">
                                <div className="px-3 py-2 border-b border-gray-700"><p className="text-yellow-400 font-semibold">John Doe</p><p className="text-sm text-gray-400">john.doe@credx.com</p></div>
                                <ul className="mt-2 text-gray-300 text-sm">
                                    <li><button onClick={() => { navigate("/profile") }} className="w-full text-left p-2 hover:bg-gray-800/40 rounded-md">My Profile</button></li>
                                    <li><button onClick={() => { go("Support"); setShowProfile(false); }} className="w-full text-left p-2 hover:bg-gray-800/40 rounded-md">Account Settings</button></li>
                                    <li><button onClick={() => { navigate("/") }} className="w-full text-left p-2 hover:bg-red-800/30 rounded-md flex items-center gap-2 text-red-400"><LogOut size={14} /> Logout</button></li>
                                </ul>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            {mobileOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden px-4 pb-4">
                    <div className="space-y-2">
                        {navItems.map((n) => (<button key={n} onClick={() => go(n)} className={`w-full text-left p-3 rounded-md ${active === n ? "bg-yellow-400/6 ring-1 ring-yellow-400/20" : "hover:bg-gray-800/20"}`}>{n}</button>))}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};
// --- End Navbar2 Component ---

/* ---------------- HeaderBar ---------------- */
function HeaderBar({ query, setQuery, sortBy, setSortBy, onAdd }: { query: string; setQuery: (s: string) => void; sortBy: string; setSortBy: (s: any) => void; onAdd: () => void }) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl font-extrabold tracking-tight">My Cards</h1>
                <p className="text-lg text-gray-400 mt-2">Manage cards, PINs and security settings in one place.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center bg-white/5 rounded-2xl px-4 py-2 border border-gray-700 w-full">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cards, brand or number..." className="bg-transparent outline-none text-base text-gray-200 w-full" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-sm text-gray-200 outline-none ml-4 appearance-none pr-6 cursor-pointer">
                        <option value="recent">Recent</option>
                        <option value="limit">By limit</option>
                        <option value="outstanding">By outstanding</option>
                    </select>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-yellow-400 text-black font-semibold shadow-lg hover:bg-yellow-300 transition-colors">
                    <Plus size={18} /> Add card
                </button>
            </motion.div>
        </div>
    );
}

/* ---------------- CardTile ---------------- */
function CardTile({ card, gradient, onToggleMask, onPin, onDetails, onEdit, onToggleBlock, onDelete }: { card: Card; gradient: string; onToggleMask: () => void; onPin: () => void; onDetails: () => void; onEdit: () => void; onToggleBlock: () => void; onDelete: () => void; }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative rounded-3xl p-6 shadow-2xl text-white overflow-hidden aspect-[1.586/1] w-full"
            style={{ background: gradient, backgroundBlendMode: "overlay" }}
        >
            <div className="absolute inset-0 w-full h-full" style={{ background: "radial-gradient(ellipse at center, rgba(250,204,21,0.12), transparent 50%)" }} />
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs tracking-widest text-gray-300/90 font-mono">CREDIT</div>
                        <div className="text-xl font-bold mt-1">{card.title}</div>
                        <div className="text-sm text-gray-300/90 mt-1">{card.subtitle}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="rounded-full bg-black/25 px-3 py-1 text-xs font-medium">{card.brand}</div>
                        <div className="text-xs text-gray-200/80">{card.blocked ? <span className="text-red-400">Blocked</span> : <span className="text-green-400">Active</span>}</div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="font-mono text-xl tracking-widest select-all">{card.masked ? "**** **** **** ****" : card.number}</div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <div className="text-xs text-gray-400">Outstanding</div>
                        <div className={`text-lg font-bold ${card.blocked ? "text-red-400" : "text-yellow-300"}`}>{card.outstanding}</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-400">EXP / CVV</div>
                        <div className="font-semibold text-sm mt-1">{card.expiry ?? "--/--"} <span className="ml-2 text-gray-400">{card.masked ? "***" : card.cvv ?? ""}</span></div>
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button onClick={onPin} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors" title="Manage PIN"><Key size={14} /></button>
                    <button onClick={onToggleMask} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors" title={card.masked ? "Show number" : "Hide number"}>
                        {card.masked ? <Eye size={14} className="text-yellow-300" /> : <EyeOff size={14} className="text-yellow-300" />}
                    </button>
                    <MenuActions onEdit={onEdit} onDetails={onDetails} onToggleBlock={onToggleBlock} onDelete={onDelete} />
                </div>
            </div>
        </motion.div>
    );
}

/* ---------------- MenuActions (compact action menu) ---------------- */
function MenuActions({ onEdit, onDetails, onToggleBlock, onDelete }: { onEdit: () => void; onDetails: () => void; onToggleBlock: () => void; onDelete: () => void; }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setOpen((s) => !s)} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"><MoreVertical size={14} /></button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg shadow-xl z-20 origin-top-right">
                        <button onClick={() => { setOpen(false); onDetails(); }} className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-800/60 rounded-t-lg"><CreditCard size={16} /> Details</button>
                        <button onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-800/60"><Edit3 size={16} /> Edit</button>
                        <button onClick={() => { setOpen(false); onToggleBlock(); }} className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-800/60"><Ban size={16} /> Toggle block</button>
                        <button onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-4 py-3 text-sm text-red-400 flex items-center gap-3 hover:bg-gray-800/60 rounded-b-lg"><Trash2 size={16} /> Delete</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ---------------- AddCardModal ---------------- */
function AddCardModal({ onClose, onAdd, initial, editMode = false }: { onClose: () => void; onAdd: (data: Omit<Card, "id" | "masked" | "blocked">) => void; initial?: Card | null; editMode?: boolean }) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
    const [number, setNumber] = useState(initial?.number ?? "");
    const [expiry, setExpiry] = useState(initial?.expiry ?? "");
    const [cvv, setCvv] = useState(initial?.cvv ?? "");
    const [brand, setBrand] = useState(initial?.brand ?? "");
    const [limit, setLimit] = useState(initial?.limit ?? "");
    const [outstanding, setOutstanding] = useState(initial?.outstanding ?? "");
    const [saving, setSaving] = useState(false);
    function submit() {
        if (!title || !number) {
            alert("Enter card title and number.");
            return;
        }
        setSaving(true);
        onAdd({
            title,
            subtitle,
            number: number.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim(),
            expiry,
            cvv,
            brand,
            limit,
            outstanding,
        });
        setSaving(false);
        onClose();
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="relative z-10 max-w-lg w-full rounded-3xl bg-gray-900/95 border border-gray-800 p-8 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div><h3 className="text-2xl font-bold">{editMode ? "Edit card" : "Add new card"}</h3><p className="text-sm text-gray-400 mt-2">Add a new card to manage statements and payments.</p></div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors">✕</button>
                </div>
                <div className="mt-6 space-y-4">
                    <div><label className="text-xs text-gray-400 font-medium">Card title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /></div>
                    <div className="flex gap-4"><input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="xxxx xxxx xxxx xxxx" className="flex-1 mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="w-36 mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /></div>
                    <div className="flex gap-4"><input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="w-28 mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /><input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" className="w-24 mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /><input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Limit" className="flex-1 mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" /></div>
                    <div className="flex items-center justify-end gap-3 pt-4"><button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-700 text-sm font-semibold hover:bg-gray-800 transition-colors">Cancel</button><button onClick={submit} className="px-6 py-3 rounded-xl bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition-colors">{saving ? "Saving..." : editMode ? "Save changes" : "Add card"}</button></div>
                </div>
            </motion.div>
        </div>
    );
}

/* ---------------- PinModal ---------------- */
function PinModal({ card, onClose, onSave }: { card: Card | null; onClose: () => void; onSave: (pin: string) => void }) {
    const [pin, setPin] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    if (!card) return null;
    function submit() {
        if (!/^\d{4}$/.test(pin)) {
            alert("Enter a 4-digit PIN.");
            return;
        }
        if (pin !== confirm) {
            alert("PINs do not match.");
            return;
        }
        setSaving(true);
        onSave(pin);
        setSaving(false);
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="relative z-10 max-w-md w-full rounded-3xl bg-gray-900/95 border border-gray-800 p-8 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div><h3 className="text-2xl font-bold">Manage PIN</h3><p className="text-sm text-gray-400 mt-2">Set or change the 4-digit PIN for <span className="font-semibold text-white">{card.title}</span></p></div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors">✕</button>
                </div>
                <div className="mt-6 space-y-4">
                    <div><label className="text-xs text-gray-400 font-medium">Enter PIN (4 digits)</label><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-full mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" inputMode="numeric" /></div>
                    <div><label className="text-xs text-gray-400 font-medium">Confirm PIN</label><input value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-full mt-1 bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-sm" inputMode="numeric" /></div>
                    <div className="flex items-center justify-end gap-3 pt-4"><button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-700 text-sm font-semibold hover:bg-gray-800 transition-colors">Cancel</button><button onClick={submit} className="px-6 py-3 rounded-xl bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition-colors">{saving ? "Saving..." : "Save PIN"}</button></div>
                </div>
            </motion.div>
        </div>
    );
}

/* ---------------- DetailsPanel ---------------- */
function DetailsPanel({ card, onClose, onEdit }: { card: Card; onClose: () => void; onEdit?: (patch: Partial<Card>) => void }) {
    const tx = [
        { id: 1, merchant: "Amazon", amount: 2499, date: "2025-10-01" },
        { id: 2, merchant: "Zomato", amount: 899, date: "2025-10-03" },
        { id: 3, merchant: "BigBasket", amount: 2599, date: "2025-09-27" },
    ];
    return (
        <div className="fixed inset-0 z-50 flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="w-[480px] bg-gray-900/95 border-l border-gray-800 p-8 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div><div className="text-xs text-gray-400 font-medium">Card details</div><div className="text-3xl font-bold mt-2">{card.title}</div><div className="text-sm text-gray-400 mt-1">{card.subtitle}</div></div>
                    <div className="flex items-center gap-3"><button onClick={() => onEdit && onEdit({ title: card.title })} className="px-4 py-2 rounded-xl border border-gray-700 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors"><Edit3 size={14} /> Edit</button><button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-700 text-sm font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors">Close</button></div>
                </div>
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div><div className="text-xs text-gray-400 font-medium">Number</div><div className="font-mono mt-2 text-lg">{card.masked ? "**** **** **** ****" : card.number}</div></div>
                        <div><div className="text-xs text-gray-400 font-medium">Limit</div><div className="font-semibold mt-2 text-lg">{card.limit}</div></div>
                        <div><div className="text-xs text-gray-400 font-medium">Expiry</div><div className="font-semibold mt-2 text-lg">{card.expiry}</div></div>
                        <div><div className="text-xs text-gray-400 font-medium">CVV</div><div className="font-semibold mt-2 text-lg">{card.masked ? "***" : card.cvv}</div></div>
                    </div>
                    <div className="mt-3"><div className="text-xs text-gray-400 font-medium">Outstanding</div><div className="font-bold text-3xl text-yellow-300 mt-2">{card.outstanding}</div></div>
                    <div><div className="text-xs text-gray-400 font-medium">Recent transactions</div>
                        <div className="mt-4 space-y-3">
                            {tx.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                                    <div><div className="text-sm font-semibold">{t.merchant}</div><div className="text-xs text-gray-400 mt-1">{t.date}</div></div>
                                    <div className="font-bold text-lg">₹{t.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3"><button onClick={() => alert("Block/unblock (demo)")} className="px-6 py-3 rounded-xl border border-gray-700 w-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"><Ban size={16} /> Block</button><button onClick={() => alert("Request replacement (demo)")} className="px-6 py-3 rounded-xl bg-yellow-400 text-black w-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors"><Check size={16} /> Request replacement</button></div>
                </div>
            </motion.div>
        </div>
    );
}