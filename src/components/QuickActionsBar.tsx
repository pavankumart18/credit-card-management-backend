import React from 'react'
import { CreditCard, Gift, Shield, Sparkles } from 'lucide-react'

interface QuickActionsBarProps {
    onViewCibil?: () => void
    onAddCard?: () => void
    onRedeem?: () => void
    onBlockCard?: () => void
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onViewCibil, onAddCard, onRedeem, onBlockCard }) => {
    const actions = [
        { id: 'cibil', label: 'View CIBIL', icon: <Sparkles size={16} />, onClick: onViewCibil },
        { id: 'add', label: 'Add Card', icon: <CreditCard size={16} />, onClick: onAddCard },
        { id: 'redeem', label: 'Redeem', icon: <Gift size={16} />, onClick: onRedeem },
        { id: 'block', label: 'Freeze Card', icon: <Shield size={16} />, onClick: onBlockCard },
    ]
    return (
        <div className="flex gap-2 overflow-x-auto">
            {actions.map(a => (
                <button key={a.id} onClick={a.onClick} aria-label={a.label} className="px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-800 text-sm flex items-center gap-2 hover:bg-gray-900">
                    {a.icon}<span>{a.label}</span>
                </button>
            ))}
        </div>
    )
}

export default QuickActionsBar

