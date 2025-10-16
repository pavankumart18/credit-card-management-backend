import React from 'react'
import Navbar2 from '@/components/Navbar2'

const OffersPage: React.FC = () => {
    const offers = [
        { id: 1, title: '10% Cashback on Groceries', desc: 'Valid this weekend at partner stores.' },
        { id: 2, title: '5% on Online Shopping', desc: 'Amazon/Flipkart with eligible cards.' },
    ]
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-4">Offers</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map(o => (
                        <div key={o.id} className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
                            <div className="font-semibold">{o.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{o.desc}</div>
                            <div className="mt-3"><button className="px-3 py-2 rounded-lg bg-yellow-400 text-black">Activate</button></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default OffersPage

