import { useEffect } from 'react'
import { useApiQuery, useApiMutation } from './useApi'
import { fetchNotifications, markRead, clearAll } from '@/services/notificationService'
import { NotificationItem } from '@/types'

export function useNotifications() {
    const list = useApiQuery<NotificationItem[], Error>(['notifications'], fetchNotifications)
    const mark = useApiMutation(markRead, { onSuccess: () => list.refetch() })
    const clear = useApiMutation(clearAll, { onSuccess: () => list.refetch() })
    const unread = (list.data || []).filter(n => !n.read).length

    // background refresh demo
    useEffect(() => {
        const id = setInterval(() => list.refetch(), 15000)
        return () => clearInterval(id)
    }, [list])

    return { ...list, unread, mark, clear }
}

