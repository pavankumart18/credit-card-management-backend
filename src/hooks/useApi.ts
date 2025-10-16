import { useQuery, UseQueryOptions, QueryKey, UseQueryResult, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import api from '@/services/mockApi'
import { Card, Transaction, Bill, NotificationItem, RedeemOption, EMIPlan } from '@/types'

export function useApiQuery<TData, TError = unknown>(key: QueryKey, fn: () => Promise<TData>, options?: UseQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
    return useQuery<TData, TError>({ queryKey: key, queryFn: fn, ...(options || {}) })
}

export function useApiMutation<TData, TVariables = void, TError = unknown>(fn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, TError, TVariables>) {
    return useMutation<TData, TError, TVariables>({ mutationFn: fn, ...(options || {}) })
}

export function useCards() {
    return useQuery<Card[], Error>({ queryKey: ['cards'], queryFn: api.getCards })
}

export function useTransactions() {
    return useQuery<Transaction[], Error>({ queryKey: ['transactions'], queryFn: api.getTransactions })
}

export function useBills() {
    return useQuery<Bill[], Error>({ queryKey: ['bills'], queryFn: api.getBills })
}

export function useNotifications() {
    return useQuery<NotificationItem[], Error>({ queryKey: ['notifications'], queryFn: api.getNotifications })
}

export function useRedeems() {
    return useQuery<RedeemOption[], Error>({ queryKey: ['redeems'], queryFn: api.getRedeemOptions })
}

export function usePayCard() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ cardId, amount }: { cardId: number; amount: number }) => {
            // Demo: using payBill to simulate card payment; replace with real payCard if available
            await api.payBill(cardId)
            return { success: true }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cards'] })
            qc.invalidateQueries({ queryKey: ['bills'] })
        }
    })
}

export function useApplyEMI() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ cardId, plan }: { cardId: number; plan: EMIPlan }) => api.applyEMI(cardId, plan.months),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] })
    })
}

