"""
React Hooks for Credit Card Management Platform
Custom hooks for integrating with the backend API in React applications
"""

import { useState, useEffect, useCallback } from 'react';

// API Client (you would import your actual API client)
// import { CreditCardAPIClient } from './api_client';

// Mock API client for demonstration
class MockAPIClient {
    constructor(baseUrl = 'http://localhost:5000/api') {
        this.baseUrl = baseUrl;
        this.token = null;
    }
    
    setToken(token) {
        this.token = token;
    }
    
    async makeRequest(method, endpoint, data = null, params = null) {
        // Mock implementation - replace with actual API calls
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        return await response.json();
    }
    
    async login(username, password) {
        return this.makeRequest('POST', '/users/login', { username, password });
    }
    
    async getCards() {
        return this.makeRequest('GET', '/cards');
    }
    
    async createCard(cardData) {
        return this.makeRequest('POST', '/cards', cardData);
    }
    
    async getTransactions(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.makeRequest('GET', `/transactions?${params}`);
    }
    
    async createTransaction(transactionData) {
        return this.makeRequest('POST', '/transactions', transactionData);
    }
    
    async getBills(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.makeRequest('GET', `/bills?${params}`);
    }
    
    async payBill(billId, amount) {
        return this.makeRequest('POST', `/bills/${billId}/pay`, { amount });
    }
    
    async getNotifications(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.makeRequest('GET', `/notifications?${params}`);
    }
    
    async markNotificationRead(notificationId) {
        return this.makeRequest('PUT', `/notifications/${notificationId}/read`);
    }
}

// Create API client instance
const apiClient = new MockAPIClient();

// Authentication Hook
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            apiClient.setToken(token);
            loadUser();
        }
    }, [token]);

    const loadUser = async () => {
        try {
            setLoading(true);
            const userData = await apiClient.makeRequest('GET', '/users/me');
            setUser(userData);
            setError(null);
        } catch (err) {
            setError(err.message);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.login(username, password);
            
            if (result.token) {
                setToken(result.token);
                localStorage.setItem('token', result.token);
                setUser(result.user);
                return { success: true };
            } else {
                setError(result.error || 'Login failed');
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('token');
        apiClient.setToken(null);
    };

    return {
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!token && !!user
    };
};

// Cards Hook
export const useCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadCards = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.getCards();
            setCards(result.cards || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCard = async (cardData) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.createCard(cardData);
            if (result.id) {
                setCards(prev => [...prev, result]);
                return { success: true, card: result };
            } else {
                setError(result.error || 'Failed to create card');
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const blockCard = async (cardId) => {
        try {
            const result = await apiClient.makeRequest('PUT', `/cards/${cardId}/block`);
            if (result.id) {
                setCards(prev => prev.map(card => 
                    card.id === cardId ? { ...card, is_blocked: true, is_active: false } : card
                ));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const unblockCard = async (cardId) => {
        try {
            const result = await apiClient.makeRequest('PUT', `/cards/${cardId}/unblock`);
            if (result.id) {
                setCards(prev => prev.map(card => 
                    card.id === cardId ? { ...card, is_blocked: false, is_active: true } : card
                ));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    return {
        cards,
        loading,
        error,
        loadCards,
        createCard,
        blockCard,
        unblockCard
    };
};

// Transactions Hook
export const useTransactions = (filters = {}) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    const loadTransactions = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.getTransactions({ ...filters, ...newFilters });
            setTransactions(result.transactions || []);
            setPagination({
                total: result.total || 0,
                pages: result.pages || 0,
                currentPage: result.current_page || 1,
                perPage: result.per_page || 10
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const createTransaction = async (transactionData) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.createTransaction(transactionData);
            if (result.id) {
                setTransactions(prev => [result, ...prev]);
                return { success: true, transaction: result };
            } else {
                setError(result.error || 'Failed to create transaction');
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const refundTransaction = async (transactionId, amount) => {
        try {
            const result = await apiClient.makeRequest('POST', `/transactions/${transactionId}/refund`, { amount });
            if (result.id) {
                setTransactions(prev => [result, ...prev]);
                return { success: true, refund: result };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return {
        transactions,
        loading,
        error,
        pagination,
        loadTransactions,
        createTransaction,
        refundTransaction
    };
};

// Bills Hook
export const useBills = (filters = {}) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({});

    const loadBills = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.getBills({ ...filters, ...newFilters });
            setBills(result.bills || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadSummary = useCallback(async () => {
        try {
            const result = await apiClient.makeRequest('GET', '/bills/summary');
            setSummary(result);
        } catch (err) {
            console.error('Failed to load bills summary:', err);
        }
    }, []);

    const payBill = async (billId, amount) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.payBill(billId, amount);
            if (result.id) {
                setBills(prev => prev.map(bill => 
                    bill.id === billId ? { ...bill, payment_status: 'paid', paid_amount: amount } : bill
                ));
                return { success: true, bill: result };
            } else {
                setError(result.error || 'Failed to pay bill');
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const createBill = async (billData) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.makeRequest('POST', '/bills', billData);
            if (result.id) {
                setBills(prev => [...prev, result]);
                return { success: true, bill: result };
            } else {
                setError(result.error || 'Failed to create bill');
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBills();
        loadSummary();
    }, [loadBills, loadSummary]);

    return {
        bills,
        loading,
        error,
        summary,
        loadBills,
        payBill,
        createBill
    };
};

// Notifications Hook
export const useNotifications = (filters = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async (newFilters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiClient.getNotifications({ ...filters, ...newFilters });
            setNotifications(result.notifications || []);
            setUnreadCount(result.notifications?.filter(n => !n.is_read).length || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const markAsRead = async (notificationId) => {
        try {
            const result = await apiClient.markNotificationRead(notificationId);
            if (result.id) {
                setNotifications(prev => prev.map(notification => 
                    notification.id === notificationId ? { ...notification, is_read: true } : notification
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const markAllAsRead = async () => {
        try {
            const result = await apiClient.makeRequest('PUT', '/notifications/mark-all-read');
            setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
            setUnreadCount(0);
            return { success: true, markedCount: result.marked_count };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return {
        notifications,
        loading,
        error,
        unreadCount,
        loadNotifications,
        markAsRead,
        markAllAsRead
    };
};

// Dashboard Hook (combines multiple hooks)
export const useDashboard = () => {
    const { cards } = useCards();
    const { transactions } = useTransactions({ page: 1, per_page: 5 });
    const { bills } = useBills({ page: 1, per_page: 5 });
    const { notifications, unreadCount } = useNotifications({ page: 1, per_page: 5 });

    const [summary, setSummary] = useState({});

    useEffect(() => {
        // Calculate dashboard summary
        const totalCards = cards.length;
        const activeCards = cards.filter(card => card.is_active && !card.is_blocked).length;
        const totalCreditLimit = cards.reduce((sum, card) => sum + (card.credit_limit || 0), 0);
        const totalOutstanding = cards.reduce((sum, card) => sum + (card.outstanding_balance || 0), 0);
        const creditUtilization = totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0;

        const pendingBills = bills.filter(bill => bill.payment_status === 'pending').length;
        const overdueBills = bills.filter(bill => bill.is_overdue).length;

        setSummary({
            totalCards,
            activeCards,
            totalCreditLimit,
            totalOutstanding,
            creditUtilization,
            pendingBills,
            overdueBills,
            unreadNotifications: unreadCount
        });
    }, [cards, bills, unreadCount]);

    return {
        cards,
        transactions,
        bills,
        notifications,
        summary
    };
};

export default {
    useAuth,
    useCards,
    useTransactions,
    useBills,
    useNotifications,
    useDashboard
};
