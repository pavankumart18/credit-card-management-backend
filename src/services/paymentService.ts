import { PayToken } from '@/types'

export async function initiatePayment(cardId: number, amount: number): Promise<PayToken> {
    await new Promise(r => setTimeout(r, 250))
    return { token: `tok_${Math.random().toString(36).slice(2)}`, amount, cardId }
}

export async function processPayment(token: PayToken): Promise<{ success: boolean; id: string }> {
    await new Promise(r => setTimeout(r, 500))
    const success = true
    return { success, id: `pay_${Date.now()}` }
}

