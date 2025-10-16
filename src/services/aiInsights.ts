import { Card, Bill, Transaction } from '@/types'

export type Insight = { id: string; title: string; confidence: number; why: string; action: string }

export async function generateInsights(cards: Card[], bills: Bill[], transactions: Transaction[]): Promise<Insight[]> {
    await new Promise(r => setTimeout(r, 220))
    const totalOutstanding = cards.reduce((acc, c) => acc + (parseInt((c.outstanding || '0').replace(/[^0-9]/g, '')) || 0), 0)
    const categories: Record<string, number> = {}
    for (const t of transactions) categories[t.category] = (categories[t.category] || 0) + t.amount
    const top = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

    const items: Insight[] = []
    if (totalOutstanding > 20000) items.push({ id: 'emi-1', title: 'Convert high outstanding to EMI (3-mo)', confidence: 0.82, why: 'Reduces short-term interest cost', action: 'Convert to EMI' })
    if (top && top[1] > 2000) items.push({ id: 'budget-1', title: `Set budget for ${top[0]}`, confidence: 0.74, why: `Spent ₹${top[1].toLocaleString()} on ${top[0]}`, action: 'Set Budget' })
    if (bills.length > 0) items.push({ id: 'auto-pay-1', title: 'Enable auto-pay for upcoming bills', confidence: 0.68, why: 'Avoid late fees and protect CIBIL', action: 'Enable Auto-pay' })
    if (items.length === 0) items.push({ id: 'none', title: 'All clear — healthy patterns', confidence: 0.9, why: 'No immediate actions', action: 'Ok' })
    return items
}

