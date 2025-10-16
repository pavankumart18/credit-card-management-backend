import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#061018_0%,#071018_60%)] text-white">
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-6">
                <Sidebar />
                <main className="">{children}</main>
            </div>
        </div>
    )
}

export default MainLayout

