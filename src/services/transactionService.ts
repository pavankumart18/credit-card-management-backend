import api from './mockApi'
import { Transaction } from '@/types'

export async function fetchTransactions(): Promise<Transaction[]> {
    return api.getTransactions()
}

export async function disputeTransaction(id: number): Promise<{ ok: boolean }> {
    await new Promise(r => setTimeout(r, 300))
    return { ok: true }
}

