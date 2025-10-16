import React, { createContext, useContext, useState } from 'react'
import { User } from '@/types'

type AuthContextValue = { user: User | null; login: (u: User) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>({ id: 1, name: 'Pavan', email: 'pavan@example.com', cibilScore: 745 })
    const login = (u: User) => setUser(u)
    const logout = () => setUser(null)
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

