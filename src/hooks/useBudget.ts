import { useMemo, useState } from 'react'

export type BudgetRule = { id: string; category: string; limit: number }

export function useBudget() {
    const [rules, setRules] = useState<BudgetRule[]>([])
    const add = (category: string, limit: number) => setRules(r => [...r, { id: Math.random().toString(36).slice(2), category, limit }])
    const remove = (id: string) => setRules(r => r.filter(x => x.id !== id))
    const byCategory = useMemo(() => {
        const map: Record<string, number> = {}
        for (const r of rules) map[r.category] = r.limit
        return map
    }, [rules])
    return { rules, add, remove, byCategory }
}

