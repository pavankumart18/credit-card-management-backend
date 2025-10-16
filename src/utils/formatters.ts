const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount);
}

export function formatCompactCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

export function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function maskCardNumber(cardNumber: string): string {
    if (!cardNumber) return '**** **** **** ****';
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
}

