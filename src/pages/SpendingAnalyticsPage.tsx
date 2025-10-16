import React from 'react'
import Navbar2 from '@/components/Navbar2'
import SpendingTracker from '@/components/SpendingTracker'
import { useTransactions } from '@/hooks/useApi'

const SpendingAnalyticsPage: React.FC = () => {
    const { data: txs = [], isLoading } = useTransactions()
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-4">Spending Analytics</h1>
                <SpendingTracker transactions={txs} />
            </div>
        </div>
    )
}

export default SpendingAnalyticsPage

