import React from 'react';

// Card component for reuse
const Card = ({ children, className, gradient }) => (
    <div className={`absolute w-72 h-44 rounded-2xl p-5 flex flex-col justify-between shadow-2xl shadow-black/50 border border-white/10 transform-gpu transition-transform duration-500 hover:scale-105 ${className}`}>
        <div className={`absolute inset-0 rounded-2xl ${gradient} opacity-50`}></div>
        <div className="absolute inset-0 bg-black/40 rounded-2xl backdrop-blur-lg"></div>
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

const CardContent = ({ number, name, logo }) => (
    <>
        <div className="flex justify-between items-start">
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-md"></div>
            {logo}
        </div>
        <div>
            <p className="font-mono text-xl tracking-wider text-gray-200 mb-1">
                {number}
            </p>
            <p className="text-sm uppercase font-light tracking-widest text-gray-400">
                {name}
            </p>
        </div>
    </>
);

const CredaLogo = () => (
     <svg width="60" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text fill="white" xmlSpace="preserve" style={{whiteSpace: "pre"}} fontFamily="monospace" fontSize="38" letterSpacing="0em"><tspan x="0" y="32.3828">CREDA</tspan></text>
    </svg>
);

export const Background = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(var(--tw-rotate)); }
                    50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
                    100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
                }
                .animate-float-1 { animation: float 8s ease-in-out infinite; }
                .animate-float-2 { animation: float 10s ease-in-out infinite; }
                .animate-float-3 { animation: float 12s ease-in-out infinite; }
            `}</style>

            <Card className="top-[10%] left-[5%] rotate-[-15deg] animate-float-1" gradient="bg-gradient-to-br from-blue-500 to-purple-600">
                <CardContent number="5123 **** **** 8910" name="ARJUN KAPOOR" logo={<CredaLogo />} />
            </Card>

            <Card className="bottom-[10%] right-[5%] rotate-[12deg] animate-float-2" gradient="bg-gradient-to-br from-green-400 to-teal-500">
                <CardContent number="4567 **** **** 1121" name="PRIYA SHARMA" logo={<CredaLogo />} />
            </Card>

            <Card className="top-[35%] right-[20%] rotate-[5deg] animate-float-3" gradient="bg-gradient-to-br from-pink-500 to-orange-500">
                <CardContent number="9876 **** **** 5432" name="ROHAN MEHTA" logo={<CredaLogo />} />
            </Card>
        </div>
    );
};