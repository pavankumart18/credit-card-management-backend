

import { Card, Bill, Transaction, RedeemOption, EMI, NotificationItem } from "@/types";

// small helper to simulate latency
const wait = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// in-memory fixtures (can be swapped with persisted state easily)
let _cards: Card[] = [
  { id: 1, title: "Platinum", subtitle: "Rewards 5%", number: "**** **** **** 2451", secret: true, gradient: "from-indigo-500 to-blue-500", limit: "₹2,00,000", outstanding: "₹24,500" },
  { id: 2, title: "Gold", subtitle: "Cashback 3%", number: "**** **** **** 8741", secret: true, gradient: "from-pink-500 to-purple-500", limit: "₹1,00,000", outstanding: "₹5,999" },
  { id: 3, title: "Titanium", subtitle: "Miles 4%", number: "**** **** **** 1290", secret: true, gradient: "from-green-400 to-teal-400", limit: "₹3,00,000", outstanding: "₹0" },
];

let _bills: Bill[] = [
  { id: 1, title: "Electricity", amount: "₹4,500", dueDate: "2025-10-20" },
  { id: 2, title: "Internet", amount: "₹999", dueDate: "2025-10-18" },
  { id: 3, title: "Mobile", amount: "₹399", dueDate: "2025-10-25" },
];

let _transactions: Transaction[] = [
  { id: 1, cardId: 1, merchant: "Amazon", category: "Shopping", amount: 3499, date: "2025-10-01" },
  { id: 2, cardId: 1, merchant: "Zomato", category: "Food", amount: 899, date: "2025-10-03" },
  { id: 3, cardId: 2, merchant: "BigBasket", category: "Groceries", amount: 2599, date: "2025-10-05" },
  { id: 4, cardId: 2, merchant: "Netflix", category: "Subscriptions", amount: 499, date: "2025-10-02" },
  { id: 5, cardId: 1, merchant: "Flipkart", category: "Shopping", amount: 1299, date: "2025-09-28" },
];

let _redeemOptions: RedeemOption[] = [
  { id: "amazon-500", title: "Amazon Voucher ₹500", description: "Use on Amazon purchases.", cost: 10000 },
  { id: "statement-250", title: "Statement credit ₹250", description: "Apply as statement credit.", cost: 5000 },
  { id: "cashback-100", title: "Cashback ₹100", description: "Instant wallet cashback.", cost: 2000 },
];

let _emis: EMI[] = [
  { id: "emi-1", cardId: 1, originalAmount: 24000, remaining: 12000, monthsLeft: 6, monthly: 2000 },
];

let _notifications: NotificationItem[] = [
  { id: 1, title: "Electricity bill due in 5 days", body: "Pay ₹4,500 by Oct 20", date: "2025-10-15", read: false },
  { id: 2, title: "New offer: 10% cashback on groceries", body: "Valid this weekend", date: "2025-10-12", read: false },
];

export const api = {
  // CARDS
  async getCards() {
    await wait(300);
    return JSON.parse(JSON.stringify(_cards)) as Card[];
  },
  async getCard(id: number) {
    await wait(200);
    return JSON.parse(JSON.stringify(_cards.find((c) => c.id === id))) as Card | undefined;
  },
  async addCard(card: Partial<Card>) {
    await wait(300);
    const id = Math.max(0, ..._cards.map((c) => c.id)) + 1;
    const newCard: Card = { id, title: card.title || `Card ${id}`, secret: true, gradient: card.gradient || "from-indigo-500 to-blue-500", number: card.number || "**** **** **** ****", limit: card.limit || "₹0", outstanding: card.outstanding || "₹0" };
    _cards.push(newCard);
    return JSON.parse(JSON.stringify(newCard)) as Card;
  },
  async toggleCardSecret(id: number) {
    await wait(120);
    _cards = _cards.map((c) => (c.id === id ? { ...c, secret: !c.secret } : c));
    return _cards.find((c) => c.id === id);
  },

  // BILLS
  async getBills() {
    await wait(220);
    return JSON.parse(JSON.stringify(_bills)) as Bill[];
  },
  async payBill(billId: number) {
    await wait(600);
    // demo: mark as paid by removing
    _bills = _bills.filter((b) => b.id !== billId);
    return { ok: true };
  },

  // TRANSACTIONS
  async getTransactions() {
    await wait(300);
    return JSON.parse(JSON.stringify(_transactions)) as Transaction[];
  },
  async addTransaction(tx: Partial<Transaction>) {
    await wait(200);
    const id = Math.max(0, ..._transactions.map((t) => t.id)) + 1;
    const newTx: Transaction = { id, cardId: tx.cardId || 1, merchant: tx.merchant || "Unknown", category: tx.category || "Misc", amount: tx.amount || 0, date: tx.date || new Date().toISOString().split("T")[0] };
    _transactions.unshift(newTx);
    return JSON.parse(JSON.stringify(newTx)) as Transaction;
  },

  // REDEEMS
  async getRedeemOptions() {
    await wait(180);
    return JSON.parse(JSON.stringify(_redeemOptions)) as RedeemOption[];
  },
  async redeem(optionId: string) {
    await wait(600);
    const option = _redeemOptions.find((o) => o.id === optionId);
    if (!option) throw new Error("Option not found");
    // demo: return success
    return { ok: true, redeemed: option };
  },

  // EMIs
  async getEMIs() {
    await wait(240);
    return JSON.parse(JSON.stringify(_emis)) as EMI[];
  },
  async applyEMI(cardId: number, months: number) {
    await wait(600);
    const card = _cards.find((c) => c.id === cardId);
    const outstanding = parseInt((card?.outstanding || "0").replace(/[^0-9]/g, "")) || 0;
    const monthly = Math.ceil(outstanding / Math.max(1, months));
    const newE: EMI = { id: `emi-${Date.now()}`, cardId, originalAmount: outstanding, remaining: outstanding, monthsLeft: months, monthly };
    _emis.push(newE);
    return JSON.parse(JSON.stringify(newE)) as EMI;
  },

  // NOTIFICATIONS
  async getNotifications() {
    await wait(200);
    return JSON.parse(JSON.stringify(_notifications)) as NotificationItem[];
  },
  async markNotificationRead(id: number) {
    await wait(100);
    _notifications = _notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return { ok: true };
  },
  async clearNotifications() {
    await wait(150);
    _notifications = [];
    return { ok: true };
  },
};

// Export default for convenience
export default api;
