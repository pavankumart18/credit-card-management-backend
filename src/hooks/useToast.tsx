import { createContext, useContext, useMemo, useState } from 'react'

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' }

const ToastContext = createContext<{ toasts: Toast[]; show: (m: string, t?: Toast['type']) => void; remove: (id: string) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const api = useMemo(() => ({
        show(message: string, type: Toast['type'] = 'info') {
            const id = Math.random().toString(36).slice(2)
            setToasts((t) => [...t, { id, message, type }])
            setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 3000)
        },
        remove(id: string) { setToasts((t) => t.filter(x => x.id !== id)) },
    }), [])
    return (
        <ToastContext.Provider value={{ toasts, show: api.show, remove: api.remove }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map(t => (
                    <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-sm ${t.type === 'success' ? 'bg-green-500/90 text-black' : t.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-gray-800/90 text-white'}`}>{t.message}</div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

