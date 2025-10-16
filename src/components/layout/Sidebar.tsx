import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/redeems', label: 'Rewards' },
    { to: '/emi', label: 'EMIs' },
    { to: '/statements', label: 'Statements' },
    { to: '/settings', label: 'Settings' },
    { to: '/support', label: 'Support' },
]

const Sidebar: React.FC = () => {
    return (
        <aside className="w-56 hidden md:block border-r border-gray-800 p-4">
            <nav className="space-y-1">
                {links.map(l => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => `block px-3 py-2 rounded-lg ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900'}`}>
                        {l.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar

