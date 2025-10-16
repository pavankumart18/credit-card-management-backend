const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const toINR = (n: number) => inr.format(n)
export const parseINR = (s: string) => {
    const cleaned = s.replace(/[^0-9.]/g, '')
    const v = parseFloat(cleaned)
    return Number.isFinite(v) ? v : 0
}

