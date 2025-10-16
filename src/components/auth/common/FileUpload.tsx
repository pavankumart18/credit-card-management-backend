import React from 'react';
import { UploadCloudIcon } from '../../../assets/icons';

export interface FileUploadProps {
    id: string
    label: string
    file?: File | null
    onChange: (file: File | null) => void
    error?: string
}

export const FileUpload = ({ id, label, file, onChange, error }: FileUploadProps) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <div onClick={() => (document.getElementById(id) as HTMLInputElement | null)?.click()} className={`w-full bg-gray-900/50 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${error ? 'border-red-500/50' : 'border-gray-700 hover:border-blue-500'}`}>
            <input id={id} type="file" className="hidden" onChange={(e) => onChange(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
            <UploadCloudIcon className="mx-auto h-10 w-10 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">{file ? file.name : 'Click to upload a file'}</p>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);