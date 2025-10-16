import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '../../assets/icons';
import { Input } from './common/Input';
import { useNavigate } from 'react-router-dom';

export const LoginForm = ({ setView }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Login functionality not implemented yet.");
    };

    return (
        <div className="w-full max-w-md mx-auto p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl shadow-black/40">
                <h1 className="text-4xl font-bold text-center mb-2 text-white">Welcome Back</h1>
                <p className="text-center text-gray-400 mb-10">Sign in to access your account.</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input id="login-email" type="email" placeholder="you@example.com" label="Email" required icon={<MailIcon />} />
                    <Input id="login-password" type={passwordVisible ? 'text' : 'password'} placeholder="••••••••" label="Password" required icon={<LockIcon />} rightContent={
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="text-gray-400 hover:text-white">{passwordVisible ? <EyeOffIcon /> : <EyeIcon />}</button>
                    } />
                    <div className="flex items-center justify-between">
                        <a href="#" className="text-sm text-blue-400 hover:underline">Forgot Password?</a>
                        <button type="button" onClick={() => setView('managerLogin')} className="text-sm text-gray-400 hover:text-white hover:underline">Manager Login</button>
                        <button type="button" onClick={() => navigate("/manager-login")} className="text-sm text-gray-400 hover:text-white hover:underline">Manager Login</button>
                    </div>
                    <button type="submit"
                        onClick={() => navigate("/dashboard")}
                        className="w-full text-lg px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform shadow-lg shadow-blue-600/30">Sign In</button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-8">
                    Don't have an account?{' '}
                    <button onClick={() => navigate("/signup")} className="font-medium text-blue-400 hover:underline">Sign Up</button>
                </p>
            </div>
        </div>
    );
};