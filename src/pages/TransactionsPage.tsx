import React, { useMemo } from 'react'
import Navbar2 from '@/components/Navbar2'
import { useTransactions, useCards } from '@/hooks/useApi'
import { usePagination } from '@/hooks/usePagination'
import { toShortDate } from '@/utils/dateUtils'
import { toINR } from '@/utils/currencyUtils'
import DownloadModal from '@/components/modals/DownloadModal'
import { useState } from 'react'

const TransactionsPage: React.FC = () => {
    const { data: txs = [], isLoading } = useTransactions()
    const { data: cards = [] } = useCards()
    const [openDownload, setOpenDownload] = useState(false)
    const page = usePagination(txs, 10)

    const rows = useMemo(() => page.data.map(t => ({
        ...t,
        cardTitle: cards.find(c => c.id === t.cardId)?.title || '—',
    })), [page.data, cards])

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setOpenDownload(true)} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">Export</button>
                    </div>
                </div>

                <div className="rounded-2xl bg-gray-900/60 border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/60 text-gray-400">
                            <tr>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Merchant</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3">Card</th>
                                <th className="text-right p-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-3"><div className="h-3 w-24 bg-gray-700/60 rounded" /></td>
                                    <td className="p-3"><div className="h-3 w-36 bg-gray-700/60 rounded" /></td>
                                    <td className="p-3"><div className="h-3 w-24 bg-gray-700/60 rounded" /></td>
                                    <td className="p-3"><div className="h-3 w-20 bg-gray-700/60 rounded" /></td>
                                    <td className="p-3 text-right"><div className="h-3 w-16 bg-gray-700/60 rounded ml-auto" /></td>
                                </tr>
                            ))}
                            {!isLoading && rows.map(r => (
                                <tr key={r.id} className="border-t border-gray-800 hover:bg-gray-800/40">
                                    <td className="p-3">{toShortDate(r.date)}</td>
                                    <td className="p-3">{r.merchant}</td>
                                    <td className="p-3 text-gray-300">{r.category}</td>
                                    <td className="p-3 text-gray-300">{r.cardTitle}</td>
                                    <td className="p-3 text-right font-semibold">{toINR(r.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                    <button onClick={page.prev} className="px-3 py-2 border border-gray-800 rounded-lg">Prev</button>
                    <div>Page {page.page} / {page.totalPages}</div>
                    <button onClick={page.next} className="px-3 py-2 border border-gray-800 rounded-lg">Next</button>
                </div>

                {openDownload && (
                    <DownloadModal onClose={() => setOpenDownload(false)} onDownload={() => setOpenDownload(false)} />
                )}
            </div>
        </div>
    )
}

export default TransactionsPage

