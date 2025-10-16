"""
React Components for Credit Card Management Platform
Example React components for integrating with the backend API
"""

# This is a Python file containing React/JSX code as strings for demonstration
# In a real project, these would be separate .jsx/.tsx files

# Card Management Components
CARD_LIST_COMPONENT = '''
import React from 'react';
import { useCards } from './hooks';

const CardList = () => {
    const { cards, loading, error, blockCard, unblockCard } = useCards();

    if (loading) return <div className="loading">Loading cards...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="card-list">
            <h2>Your Credit Cards</h2>
            {cards.map(card => (
                <div key={card.id} className={`card-item ${card.is_blocked ? 'blocked' : ''}`}>
                    <div className="card-info">
                        <h3>{card.card_name}</h3>
                        <p className="card-number">{card.card_number}</p>
                        <p className="card-brand">{card.card_brand}</p>
                        <div className="card-balance">
                            <span>Credit Limit: ${card.credit_limit.toLocaleString()}</span>
                            <span>Available: ${card.available_credit.toLocaleString()}</span>
                            <span>Outstanding: ${card.outstanding_balance.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="card-actions">
                        {card.is_blocked ? (
                            <button 
                                onClick={() => unblockCard(card.id)}
                                className="btn btn-success"
                            >
                                Unblock Card
                            </button>
                        ) : (
                            <button 
                                onClick={() => blockCard(card.id)}
                                className="btn btn-danger"
                            >
                                Block Card
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardList;
'''

ADD_CARD_COMPONENT = '''
import React, { useState } from 'react';
import { useCards } from './hooks';

const AddCard = ({ onClose }) => {
    const { createCard } = useCards();
    const [formData, setFormData] = useState({
        card_number: '',
        card_holder_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        card_type: 'visa',
        card_brand: '',
        card_name: '',
        credit_limit: '',
        due_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createCard({
                ...formData,
                credit_limit: parseFloat(formData.credit_limit),
                due_date: parseInt(formData.due_date)
            });

            if (result.success) {
                onClose();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Credit Card</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            name="card_number"
                            value={formData.card_number}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Card Holder Name</label>
                        <input
                            type="text"
                            name="card_holder_name"
                            value={formData.card_holder_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Expiry Month</label>
                            <select
                                name="expiry_month"
                                value={formData.expiry_month}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Month</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Expiry Year</label>
                            <select
                                name="expiry_year"
                                value={formData.expiry_year}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i} value={new Date().getFullYear() + i}>
                                        {new Date().getFullYear() + i}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength="4"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Card Type</label>
                        <select
                            name="card_type"
                            value={formData.card_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="visa">Visa</option>
                            <option value="mastercard">Mastercard</option>
                            <option value="amex">American Express</option>
                            <option value="rupay">RuPay</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Card Brand</label>
                        <input
                            type="text"
                            name="card_brand"
                            value={formData.card_brand}
                            onChange={handleChange}
                            placeholder="Visa Platinum"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Card Name</label>
                        <input
                            type="text"
                            name="card_name"
                            value={formData.card_name}
                            onChange={handleChange}
                            placeholder="My Credit Card"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Credit Limit</label>
                        <input
                            type="number"
                            name="credit_limit"
                            value={formData.credit_limit}
                            onChange={handleChange}
                            placeholder="10000"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Due Date (Day of Month)</label>
                        <input
                            type="number"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            placeholder="15"
                            min="1"
                            max="31"
                        />
                    </div>
                    
                    {error && <div className="error">{error}</div>}
                    
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Adding...' : 'Add Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCard;
'''

# Transaction Components
TRANSACTION_LIST_COMPONENT = '''
import React, { useState } from 'react';
import { useTransactions } from './hooks';

const TransactionList = () => {
    const { transactions, loading, error, loadTransactions } = useTransactions();
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        merchant: ''
    });

    const handleFilterChange = (e) => {
        const newFilters = {
            ...filters,
            [e.target.name]: e.target.value
        };
        setFilters(newFilters);
        loadTransactions(newFilters);
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading transactions...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="transaction-list">
            <div className="transaction-header">
                <h2>Transactions</h2>
                <div className="filters">
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    
                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                        <option value="refund">Refund</option>
                    </select>
                    
                    <input
                        type="text"
                        name="merchant"
                        value={filters.merchant}
                        onChange={handleFilterChange}
                        placeholder="Search merchant..."
                    />
                </div>
            </div>
            
            <div className="transaction-items">
                {transactions.map(transaction => (
                    <div key={transaction.id} className={`transaction-item ${transaction.status}`}>
                        <div className="transaction-info">
                            <div className="merchant">
                                <h3>{transaction.merchant_name}</h3>
                                <p className="category">{transaction.merchant_category}</p>
                            </div>
                            <div className="amount">
                                <span className={`amount-value ${transaction.transaction_type}`}>
                                    {transaction.transaction_type === 'debit' ? '-' : '+'}
                                    {formatAmount(transaction.amount)}
                                </span>
                                <span className="status">{transaction.status}</span>
                            </div>
                        </div>
                        <div className="transaction-details">
                            <p className="date">{formatDate(transaction.transaction_date)}</p>
                            {transaction.description && (
                                <p className="description">{transaction.description}</p>
                            )}
                            {transaction.location && (
                                <p className="location">📍 {transaction.location}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
'''

# Dashboard Component
DASHBOARD_COMPONENT = '''
import React, { useState } from 'react';
import { useDashboard } from './hooks';
import CardList from './CardList';
import TransactionList from './TransactionList';

const Dashboard = () => {
    const { cards, transactions, bills, notifications, summary } = useDashboard();
    const [activeTab, setActiveTab] = useState('overview');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Credit Card Dashboard</h1>
                <div className="dashboard-tabs">
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'cards' ? 'active' : ''}
                        onClick={() => setActiveTab('cards')}
                    >
                        Cards
                    </button>
                    <button 
                        className={activeTab === 'transactions' ? 'active' : ''}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions
                    </button>
                    <button 
                        className={activeTab === 'bills' ? 'active' : ''}
                        onClick={() => setActiveTab('bills')}
                    >
                        Bills
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="dashboard-overview">
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Cards</h3>
                            <div className="summary-value">
                                {summary.totalCards}
                                <span className="summary-label">Active: {summary.activeCards}</span>
                            </div>
                        </div>
                        
                        <div className="summary-card">
                            <h3>Credit Limit</h3>
                            <div className="summary-value">
                                {formatCurrency(summary.totalCreditLimit)}
                            </div>
                        </div>
                        
                        <div className="summary-card">
                            <h3>Outstanding Balance</h3>
                            <div className="summary-value">
                                {formatCurrency(summary.totalOutstanding)}
                            </div>
                        </div>
                        
                        <div className="summary-card">
                            <h3>Credit Utilization</h3>
                            <div className="summary-value">
                                {formatPercentage(summary.creditUtilization)}
                            </div>
                        </div>
                        
                        <div className="summary-card">
                            <h3>Pending Bills</h3>
                            <div className="summary-value">
                                {summary.pendingBills}
                                {summary.overdueBills > 0 && (
                                    <span className="overdue">({summary.overdueBills} overdue)</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="summary-card">
                            <h3>Notifications</h3>
                            <div className="summary-value">
                                {summary.unreadNotifications}
                                <span className="summary-label">unread</span>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity">
                        <div className="recent-transactions">
                            <h3>Recent Transactions</h3>
                            {transactions.slice(0, 5).map(transaction => (
                                <div key={transaction.id} className="recent-item">
                                    <div className="merchant">{transaction.merchant_name}</div>
                                    <div className="amount">
                                        {transaction.transaction_type === 'debit' ? '-' : '+'}
                                        {formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="recent-bills">
                            <h3>Upcoming Bills</h3>
                            {bills.filter(bill => bill.payment_status === 'pending').slice(0, 5).map(bill => (
                                <div key={bill.id} className="recent-item">
                                    <div className="biller">{bill.biller_name}</div>
                                    <div className="amount">{formatCurrency(bill.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'cards' && <CardList />}
            {activeTab === 'transactions' && <TransactionList />}
            {activeTab === 'bills' && <div>Bills component would go here</div>}
        </div>
    );
};

export default Dashboard;
'''

# Notification Component
NOTIFICATION_COMPONENT = '''
import React from 'react';
import { useNotifications } from './hooks';

const NotificationList = () => {
    const { notifications, loading, error, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'urgent': return 'urgent';
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return '';
        }
    };

    if (loading) return <div className="loading">Loading notifications...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="notification-list">
            <div className="notification-header">
                <h2>Notifications</h2>
                <div className="notification-actions">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="btn btn-primary">
                            Mark All as Read ({unreadCount})
                        </button>
                    )}
                </div>
            </div>
            
            <div className="notification-items">
                {notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.is_read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                        <div className="notification-content">
                            <h3>{notification.title}</h3>
                            <p>{notification.message}</p>
                            <div className="notification-meta">
                                <span className="type">{notification.notification_type}</span>
                                <span className="date">{formatDate(notification.created_at)}</span>
                                {notification.priority === 'urgent' && (
                                    <span className="urgent-badge">URGENT</span>
                                )}
                            </div>
                        </div>
                        {notification.action_url && (
                            <div className="notification-action">
                                <a href={notification.action_url} className="btn btn-sm">
                                    {notification.action_text || 'View'}
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationList;
'''

# CSS Styles
STYLES = '''
/* Dashboard Styles */
.dashboard {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 20px;
}

.dashboard-tabs {
    display: flex;
    gap: 10px;
}

.dashboard-tabs button {
    padding: 10px 20px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s;
}

.dashboard-tabs button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.summary-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-left: 4px solid #007bff;
}

.summary-card h3 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
    text-transform: uppercase;
}

.summary-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.summary-label {
    display: block;
    font-size: 12px;
    color: #666;
    font-weight: normal;
}

.recent-activity {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.recent-transactions, .recent-bills {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.recent-transactions h3, .recent-bills h3 {
    margin: 0 0 20px 0;
    color: #333;
}

.recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.recent-item:last-child {
    border-bottom: none;
}

/* Card Styles */
.card-list {
    display: grid;
    gap: 20px;
}

.card-item {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 4px solid #28a745;
}

.card-item.blocked {
    border-left-color: #dc3545;
    opacity: 0.7;
}

.card-info h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.card-number {
    font-family: monospace;
    font-size: 18px;
    color: #666;
    margin: 5px 0;
}

.card-balance {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

.card-balance span {
    display: block;
}

/* Transaction Styles */
.transaction-list {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.transaction-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filters {
    display: flex;
    gap: 10px;
}

.filters select, .filters input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.transaction-items {
    max-height: 600px;
    overflow-y: auto;
}

.transaction-item {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.transaction-item:last-child {
    border-bottom: none;
}

.transaction-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
}

.merchant h3 {
    margin: 0 0 5px 0;
    color: #333;
}

.category {
    color: #666;
    font-size: 14px;
    margin: 0;
}

.amount {
    text-align: right;
}

.amount-value {
    font-size: 18px;
    font-weight: bold;
    display: block;
}

.amount-value.debit {
    color: #dc3545;
}

.amount-value.credit {
    color: #28a745;
}

.status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    background: #e9ecef;
    color: #495057;
}

.transaction-details {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

/* Notification Styles */
.notification-list {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.notification-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-items {
    max-height: 600px;
    overflow-y: auto;
}

.notification-item {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
}

.notification-item:hover {
    background-color: #f8f9fa;
}

.notification-item.unread {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
}

.notification-item.urgent {
    background-color: #ffebee;
    border-left: 4px solid #f44336;
}

.notification-content h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.notification-content p {
    margin: 0 0 10px 0;
    color: #666;
}

.notification-meta {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: #999;
}

.urgent-badge {
    background: #f44336;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
}

/* Button Styles */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover {
    background: #1e7e34;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
}

/* Utility Classes */
.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.error {
    background: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 20px;
    }
    
    .dashboard-tabs {
        flex-wrap: wrap;
    }
    
    .summary-cards {
        grid-template-columns: 1fr;
    }
    
    .recent-activity {
        grid-template-columns: 1fr;
    }
    
    .transaction-info {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .amount {
        text-align: left;
        margin-top: 10px;
    }
}
'''

# Export all components
COMPONENTS = {
    'CardList': CARD_LIST_COMPONENT,
    'AddCard': ADD_CARD_COMPONENT,
    'TransactionList': TRANSACTION_LIST_COMPONENT,
    'Dashboard': DASHBOARD_COMPONENT,
    'NotificationList': NOTIFICATION_COMPONENT,
    'styles': STYLES
}

if __name__ == "__main__":
    print("React Components for Credit Card Management Platform")
    print("=" * 50)
    print("Available Components:")
    for name in COMPONENTS.keys():
        if name != 'styles':
            print(f"- {name}")
    print("\nTo use these components:")
    print("1. Copy the component code to separate .jsx files")
    print("2. Install required dependencies: react, react-hooks")
    print("3. Import and use the hooks from './hooks'")
    print("4. Apply the CSS styles to your application")
