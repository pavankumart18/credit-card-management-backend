// src/components/Navbar2.tsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Settings, User, ChevronDown, LogOut, Menu, X, SunMoon } from "lucide-react";
import { Notification } from "@/types";
import { useNavigate } from "react-router-dom";

interface Navbar2Props {
  notifications?: Notification[]; // notifications can contain { id, title, body, date, read?, link? }
  onNavigate?: (path: string) => void;
  initialTheme?: "dark" | "light";
}

const STORAGE_KEY = "credx.notifications.demo";

const defaultNav = ["Dashboard", "Cards", "Transactions", "Redeems", "Statements", "Support"];

const Navbar2: React.FC<Navbar2Props> = ({ notifications = [], onNavigate, initialTheme = "dark" }) => {
  const navItems = defaultNav;
  const navigate = useNavigate();

  // UI state
  const [active, setActive] = useState<string>("Dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(initialTheme);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Notifications: merge provided notifications with persisted ones (demo)
  const [localNotifs, setLocalNotifs] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Notification[];
        // merge - keep user-provided ones (by id) or use saved
        const map = new Map(parsed.map((n) => [n.id, n]));
        notifications.forEach((n) => map.set(n.id, { ...map.get(n.id), ...n }));
        return Array.from(map.values()).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      }
    } catch (e) { }
    return [...notifications].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  });

  // persist notifications demo
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotifs));
  }, [localNotifs]);

  // unread count
  const unreadCount = localNotifs.filter((n) => !n.read).length;

  // expose navigation helper
  const go = (p: string) => {
    setActive(p);
    const path = p === "Dashboard" ? "/dashboard" : `/${p.toLowerCase()}`;
    onNavigate?.(path);
    // prefer react-router navigate
    try {
      navigate(path);
    } catch (e) {
      // ignore if router is not present
      window.location.href = path;
    }
    // close mobile menu if open
    setMobileOpen(false);
  };

  // mark one notification read and optionally navigate
  function openNotification(n: Notification) {
    setLocalNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.link) {
      try {
        navigate(n.link);
      } catch {
        window.location.href = n.link;
      }
    }
    // close panel on open
    setShowNotif(false);
  }

  function markAllRead() {
    setLocalNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
  }

  // Keyboard shortcuts
  useEffect(() => {
    let gMode = false;
    function onKey(e: KeyboardEvent) {
      // ignore when input focused
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || (activeEl as HTMLElement).isContentEditable)) return;

      if (e.key === "n") {
        // toggle notifications
        e.preventDefault();
        setShowNotif((s) => !s);
        setShowProfile(false);
        setMobileOpen(false);
        return;
      }

      if (e.key === "p") {
        e.preventDefault();
        setShowProfile((s) => !s);
        setShowNotif(false);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (gMode) {
        // go mode: g + <key>
        const map: Record<string, string> = {
          d: "Dashboard",
          c: "Cards",
          t: "Transactions",
          r: "Redeems",
          s: "Statements",
          u: "Support",
          e: "Apply-EMI",
        };
        const key = e.key.toLowerCase();
        if (map[key]) {
          e.preventDefault();
          go(map[key]);
        }
        gMode = false;
        return;
      }

      if (e.key === "g") {
        // enter go-mode
        gMode = true;
        // revert after 1.6s
        setTimeout(() => {
          gMode = false;
        }, 1600);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, onNavigate]);

  // theme toggle (demo): apply class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

  // small framer variants
  const menuMotion = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

  return (
    <nav className="w-full bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/40 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* left: brand + mobile toggle */}
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

        {/* center: nav (hidden on mobile) */}
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

        {/* right area */}
        <div className="flex items-center gap-4">
          {/* search */}
          <div className="hidden sm:flex items-center bg-gray-800/40 rounded-full px-3 py-1 border border-gray-700">
            <input
              ref={searchRef}
              placeholder="Search (/)..."
              className="bg-transparent outline-none text-sm text-gray-200 w-48"
              aria-label="Global search"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif((s) => !s);
                setShowProfile(false);
                setShowSettingsPanel(false);
              }}
              aria-haspopup="true"
              aria-expanded={showNotif}
              className="relative p-2 rounded-md"
              title="Notifications (n)"
            >
              <Bell size={20} className="text-gray-300 hover:text-yellow-400 transition" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 w-2.5 h-2.5 rounded-full border border-gray-900 animate-pulse" aria-hidden />
              )}
              <span className="sr-only">{unreadCount} unread notifications</span>
            </button>

            {showNotif && (
              <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-80">
                <div className="px-2 py-1 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 font-semibold">Notifications</p>
                      <p className="text-sm text-gray-400">Recent activity & alerts</p>
                    </div>
                    <div>
                      <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-white">Mark all read</button>
                    </div>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
                  {localNotifs.length === 0 && <div className="text-sm text-gray-400 p-2">No notifications</div>}
                  {localNotifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`p-2 rounded-lg w-full text-left ${n.read ? "bg-gray-900/0" : "bg-gray-800/40"} hover:bg-gray-800/60 flex flex-col`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-100">{n.title}</div>
                        <div className="text-xs text-gray-400">{n.date}</div>
                      </div>
                      {n.body && <div className="text-xs text-gray-400 mt-1">{n.body}</div>}
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-right">
                  <button
                    onClick={() => {
                      // navigate to all notifications page (demo)
                      go("Dashboard");
                      setShowNotif(false);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    View all
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSettingsPanel((s) => !s);
                setShowProfile(false);
                setShowNotif(false);
              }}
              title="Settings"
              className="p-2 rounded-md"
            >
              <Settings size={20} className="text-gray-300 hover:text-yellow-400 transition" />
            </button>

            {showSettingsPanel && (
              <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-52">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">Settings</div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setTheme((t) => (t === "dark" ? "light" : "dark"));
                    }}
                    className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-gray-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <SunMoon size={16} />
                      <div className="text-sm">Theme</div>
                    </div>
                    <div className="text-xs text-gray-400">{theme}</div>
                  </button>

                  <button
                    onClick={() => go("Support")}
                    className="w-full text-left p-2 rounded-md hover:bg-gray-800/40"
                  >
                    Account & support
                  </button>

                  <button
                    onClick={() => { go("Support"); setShowSettingsPanel(false); }}
                    className="w-full text-left p-2 rounded-md hover:bg-gray-800/40 text-xs text-gray-400"
                  >
                    Open advanced settings
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile((s) => !s);
                setShowNotif(false);
                setShowSettingsPanel(false);
              }}
              aria-haspopup="true"
              aria-expanded={showProfile}
              className="flex items-center gap-2 p-1 rounded-full focus:outline-none"
              title="Profile (p)"
            >
              <div className="p-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"><User size={18} className="text-black" /></div>
              <ChevronDown size={16} className={`text-gray-300 transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {showProfile && (
              <motion.div initial="initial" animate="animate" exit="exit" variants={menuMotion} className="absolute right-0 mt-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl p-3 w-48">
                <div className="px-3 py-2 border-b border-gray-700">
                  <p className="text-yellow-400 font-semibold">John Doe</p>
                  <p className="text-sm text-gray-400">john.doe@credx.com</p>
                </div>
                <ul className="mt-2 text-gray-300 text-sm">
                  <li>
                    <button onClick={() => { navigate("/profile") }} className="w-full text-left p-2 hover:bg-gray-800/40 rounded-md">My Profile</button>
                  </li>
                  <li>
                    <button onClick={() => { go("Support"); setShowProfile(false); }} className="w-full text-left p-2 hover:bg-gray-800/40 rounded-md">Account Settings</button>
                  </li>
                  <li>
                    <button onClick={() => { /* demo logout */navigate("/") }} className="w-full text-left p-2 hover:bg-red-800/30 rounded-md flex items-center gap-2 text-red-400"><LogOut size={14} /> Logout</button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav (slide down) */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden px-4 pb-4">
          <div className="space-y-2">
            {navItems.map((n) => (
              <button key={n} onClick={() => go(n)} className={`w-full text-left p-3 rounded-md ${active === n ? "bg-yellow-400/6 ring-1 ring-yellow-400/20" : "hover:bg-gray-800/20"}`}>
                {n}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar2;
