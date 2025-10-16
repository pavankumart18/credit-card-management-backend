import React, { createContext, useContext, useState } from 'react'

type DashboardState = {
    selectedCardId: number | null
    openPayment: boolean
    openEMI: boolean
    setSelectedCardId: (id: number | null) => void
    setOpenPayment: (v: boolean) => void
    setOpenEMI: (v: boolean) => void
}

const DashboardContext = createContext<DashboardState | null>(null)

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
    const [openPayment, setOpenPayment] = useState(false)
    const [openEMI, setOpenEMI] = useState(false)
    return (
        <DashboardContext.Provider value={{ selectedCardId, openPayment, openEMI, setSelectedCardId, setOpenPayment, setOpenEMI }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const ctx = useContext(DashboardContext)
    if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
    return ctx
}

