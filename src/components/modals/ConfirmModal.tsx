import React from 'react'

interface ConfirmModalProps {
    title: string
    body?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
            <div className="relative z-50 w-[420px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
                <div className="text-lg font-bold">{title}</div>
                {body && <div className="mt-2 text-sm text-gray-300">{body}</div>}
                <div className="mt-5 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-2 rounded-lg border border-gray-700">{cancelText}</button>
                    <button onClick={onConfirm} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">{confirmText}</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal

