import { toast } from 'sonner'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: Date
  actionUrl?: string
}

export const notificationService = {
  success: (message: string, title: string = 'Success') => {
    toast.success(message, { description: title })
  },

  error: (message: string, title: string = 'Error') => {
    toast.error(message, { description: title })
  },

  info: (message: string, title: string = 'Info') => {
    toast.info(message, { description: title })
  },

  warning: (message: string, title: string = 'Warning') => {
    toast.warning(message, { description: title })
  },

  loading: (message: string) => {
    toast.loading(message)
  },
}

export async function sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  try {
    // In production, send to Firestore
    notificationService.info(notification.message, notification.title)
    return true
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    // In production, update in Firestore
    return true
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return false
  }
}
