import React, { useState } from 'react'

interface DownloadModalProps {
    onClose: () => void
    onDownload: (format: 'csv' | 'pdf') => void
}

const DownloadModal: React.FC<DownloadModalProps> = ({ onClose, onDownload }) => {
    const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Download statement">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-50 w-[420px] p-6 rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl">
                <div className="text-lg font-bold">Export Statement</div>
                <div className="mt-3 text-sm text-gray-300">Choose format</div>
                <div className="mt-2 flex gap-2">
                    <button className={`px-3 py-2 rounded-lg border ${format === 'csv' ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700'}`} onClick={() => setFormat('csv')}>CSV</button>
                    <button className={`px-3 py-2 rounded-lg border ${format === 'pdf' ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700'}`} onClick={() => setFormat('pdf')}>PDF</button>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-700">Cancel</button>
                    <button onClick={() => onDownload(format)} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">Download</button>
                </div>
            </div>
        </div>
    )
}

export default DownloadModal

