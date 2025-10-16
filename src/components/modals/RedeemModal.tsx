import React from 'react'

interface RedeemModalProps {
    option: { id: string; title: string; cost: number }
    onClose: () => void
    onConfirm: (id: string) => void
}

const RedeemModal: React.FC<RedeemModalProps> = ({ option, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Redeem reward">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-50 w-[420px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
                <div className="text-lg font-bold">Redeem Reward</div>
                <div className="mt-2 text-sm text-gray-300">{option.title}</div>
                <div className="mt-1 text-xs text-gray-400">Cost: {option.cost.toLocaleString()} pts</div>
                <div className="mt-5 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-700">Cancel</button>
                    <button onClick={() => onConfirm(option.id)} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">Redeem</button>
                </div>
            </div>
        </div>
    )
}

export default RedeemModal

