import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id: string
    label: string
    error?: string
    children: React.ReactNode
}

export const Select = ({ id, label, error, children, ...props }: SelectProps) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <select id={id} className={`w-full bg-gray-900/50 border text-white rounded-lg p-3 focus:ring-2 appearance-none ${error ? 'border-red-500/50 focus:ring-red-400/50' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/50'}`} {...props}>{children}</select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);