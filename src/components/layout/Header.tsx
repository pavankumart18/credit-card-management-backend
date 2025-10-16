import React from 'react'
import Navbar2 from '@/components/Navbar2'

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(6,16,24,.9),rgba(7,16,24,.6))] backdrop-blur border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4">
                <Navbar2 />
            </div>
        </header>
    )
}

export default Header

