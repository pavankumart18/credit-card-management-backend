import React from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from '../../../assets/icons';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string
    label: string
    error?: string
    icon?: React.ReactNode
    rightContent?: React.ReactNode
}

export const Input = ({ id, label, error, icon, rightContent, ...props }: InputProps) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        <div className="relative">
            {icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">{icon}</span>}
            <input id={id} className={`w-full bg-gray-900/50 border text-white rounded-lg p-3 focus:ring-2 transition ${icon ? 'pl-10' : ''} ${rightContent ? 'pr-10' : ''} ${error ? 'border-red-500/50 focus:ring-red-400/50' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/50'}`} {...props} />
            {rightContent && <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">{rightContent}</div>}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export interface PasswordFieldProps {
    id: string
    label: string
    value: string
    visible: boolean
    strength: number // 0..5
    onChange: React.ChangeEventHandler<HTMLInputElement>
    onVisibilityChange: () => void
    error?: string
}

export const PasswordField = ({ id, label, value, visible, strength, onChange, onVisibilityChange, error }: PasswordFieldProps) => {
    const strengthColors = ['bg-gray-600', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return (
        <div className="w-full">
            {/* icon/rightContent are provided by parent to avoid tight coupling to icon set */}
            <Input id={id} label={label} type={visible ? 'text' : 'password'} value={value} onChange={onChange} error={error} rightContent={
                <button type="button" onClick={onVisibilityChange} className="text-gray-400 hover:text-white">{visible ? 'Hide' : 'Show'}</button>
            } />
            {value && <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full"><div className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength]}`} style={{ width: `${strength * 20}%` }}></div></div>}
        </div>
    );
};