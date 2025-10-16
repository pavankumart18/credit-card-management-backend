export interface CibilInfo { score: number; band: 'Poor' | 'Fair' | 'Good' | 'Excellent'; tips: string[] }

export async function getCibil(): Promise<CibilInfo> {
    await new Promise(r => setTimeout(r, 180))
    return { score: 745, band: 'Good', tips: ['Pay dues on time', 'Keep utilization <30%', 'Avoid frequent hard pulls'] }
}

