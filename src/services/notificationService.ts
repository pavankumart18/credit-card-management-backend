import api from './mockApi'
import { NotificationItem } from '@/types'

export async function fetchNotifications(): Promise<NotificationItem[]> {
    return api.getNotifications()
}

export async function markRead(id: number): Promise<{ ok: boolean }> {
    return api.markNotificationRead(id)
}

export async function clearAll(): Promise<{ ok: boolean }> {
    return api.clearNotifications()
}

