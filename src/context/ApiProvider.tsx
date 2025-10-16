import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient()

interface ApiProviderProps {
    children: React.ReactNode
}

const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    )
}

export default ApiProvider

