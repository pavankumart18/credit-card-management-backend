import { useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize = 10) {
    const [page, setPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const data = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize])
    const next = () => setPage(p => Math.min(totalPages, p + 1))
    const prev = () => setPage(p => Math.max(1, p - 1))
    const set = (n: number) => setPage(Math.min(totalPages, Math.max(1, n)))
    return { page, totalPages, data, next, prev, set }
}

