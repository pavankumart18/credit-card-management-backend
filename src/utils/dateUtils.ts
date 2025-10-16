export function toShortDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
}

export function formatMonthYear(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
}

