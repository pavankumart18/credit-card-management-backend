import React, { useState } from 'react';
import { Background } from '../components/layout/Background';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ManagerLoginForm } from '../components/auth/ManagerLoginForm';

export default function AuthPage() {
    const [view, setView] = useState('login'); // 'signup', 'login', or 'managerLogin'

    const renderView = () => {
        switch (view) {
            case 'login':
                return <LoginForm setView={setView} />;
            case 'managerLogin':
                return <ManagerLoginForm setView={setView} />;
            case 'signup':
            default:
                return <SignUpForm setView={setView} />;
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans text-white overflow-hidden">
            <Background />
            <main className="relative z-10 w-full transition-all duration-500">
                {renderView()}
            </main>
        </div>
    );
}