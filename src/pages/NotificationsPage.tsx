import React from 'react'
import Navbar2 from '@/components/Navbar2'
import { useNotifications } from '@/hooks/useNotifications'

const NotificationsPage: React.FC = () => {
    const { data = [], unread, mark } = useNotifications()
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Navbar2 />
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <div className="text-sm text-gray-400">Unread: <span className="text-yellow-300 font-semibold">{unread}</span></div>
                </div>
                <div className="space-y-3">
                    {data.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'border-gray-800 bg-gray-800/30' : 'border-yellow-400/40 bg-yellow-400/5'}`}>
                            <div className="font-semibold">{n.title}</div>
                            {n.body && <div className="text-xs text-gray-400 mt-1">{n.body}</div>}
                            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                                <div>{n.date}</div>
                                {!n.read && <button onClick={() => mark.mutate(n.id)} className="px-2 py-1 border border-gray-700 rounded">Mark read</button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NotificationsPage

