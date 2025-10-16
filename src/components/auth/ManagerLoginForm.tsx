import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ShieldCheckIcon } from '../../assets/icons';
import { Input } from './common/Input';

export const ManagerLoginForm = ({ setView }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Add manager-specific login logic here
        alert("Manager login functionality not implemented yet.");
    };

    return (
        <div className="w-full max-w-md mx-auto p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl shadow-black/40">
                <h1 className="text-4xl font-bold text-center mb-2 text-white">Manager Portal</h1>
                <p className="text-center text-gray-400 mb-10">Secure sign-in for authorized personnel.</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input id="manager-email" type="email" placeholder="manager@example.com" label="Work Email" required icon={<MailIcon />} />
                    <Input id="manager-password" type={passwordVisible ? 'text' : 'password'} placeholder="••••••••" label="Password" required icon={<LockIcon />} rightContent={
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="text-gray-400 hover:text-white">{passwordVisible ? <EyeOffIcon /> : <EyeIcon />}</button>
                    } />
                    <Input id="bank-secret-key" type="text" placeholder="e.g., HDFC-MUM-831" label="Bank Secret Key" required icon={<ShieldCheckIcon />} />

                    <button type="submit" className="w-full text-lg px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 hover:scale-105 transition-transform shadow-lg shadow-green-600/30">Sign In Securely</button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-8">
                    Not a manager?{' '}
                    <button onClick={() => setView('login')} className="font-medium text-blue-400 hover:underline">Go to User Login</button>
                </p>
            </div>
        </div>
    );
};