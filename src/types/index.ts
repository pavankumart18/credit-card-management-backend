export interface Card { id: number; title: string; subtitle: string; number: string; gradient: string; limit: string; outstanding: string; secret?: boolean }
export interface Bill { id: number; title: string; amount: string; dueDate: string }
export interface Transaction { id: number; cardId: number; merchant: string; category: string; amount: number; date: string }
export interface EMIPlan { months: number; monthly: number; interest: number }
export interface Notification { id: number; title: string; body: string; date: string; read: boolean }
export interface RedeemItem { id: number; name: string; points: number; value: number }
export interface User { id: number; name: string; email: string; cibilScore: number }

export interface PayToken { token: string; amount: number; cardId: number }

// Additional types used by existing services
export interface RedeemOption { id: string; title: string; description?: string; cost: number }
export interface EMI { id: string; cardId: number; originalAmount: number; remaining: number; monthsLeft: number; monthly: number }
export interface NotificationItem { id: number; title: string; body?: string; date: string; read?: boolean }

