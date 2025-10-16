import React from 'react'
import { NotificationItem } from '@/types'

interface NotificationModalProps {
    notifications: NotificationItem[]
    onClose: () => void
    onMarkRead: (id: number) => void
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notifications, onClose, onMarkRead }) => {
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Notifications">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-50 w-[520px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">Notifications</div>
                    <button onClick={onClose} className="text-sm text-gray-400">Close</button>
                </div>
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-auto">
                    {notifications.length === 0 && <div className="text-sm text-gray-400">You're all caught up.</div>}
                    {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'border-gray-800 bg-gray-800/40' : 'border-yellow-400/40 bg-yellow-400/5'}`}>
                            <div className="font-semibold">{n.title}</div>
                            {n.body && <div className="text-xs text-gray-400 mt-1">{n.body}</div>}
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <div>{n.date}</div>
                                {!n.read && <button onClick={() => onMarkRead(n.id)} className="px-2 py-1 rounded border border-gray-700 text-xs">Mark read</button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NotificationModal

