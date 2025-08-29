import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  userId: string;
  data?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: string;
  priority?: string;
  userId?: string;
  data?: Record<string, any>;
  expiresAt?: string;
}

export interface NotificationStatistics {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Array<{
    type: string;
    count: number;
  }>;
  notificationsByPriority: Array<{
    priority: string;
    count: number;
  }>;
  recentActivity: number;
}

export const notificationService = {
  // Get notifications
  async getNotifications(page = 1, limit = 20) {
    const response = await apiClient.get<{
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
    }>(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUnreadNotifications() {
    const response = await apiClient.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  async getNotificationById(id: string) {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  // Create notifications
  async createNotification(data: CreateNotificationDto) {
    const response = await apiClient.post<Notification>('/notifications', data);
    return response.data;
  },

  async broadcastNotification(data: Omit<CreateNotificationDto, 'userId'>) {
    const response = await apiClient.post<{ count: number }>('/notifications/broadcast', data);
    return response.data;
  },

  async sendToRoles(roles: string[], data: Omit<CreateNotificationDto, 'userId'>) {
    const response = await apiClient.post<{ count: number }>('/notifications/send-to-roles', {
      roles,
      ...data
    });
    return response.data;
  },

  // Update notifications
  async markAsRead(id: string) {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAsUnread(id: string) {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/unread`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch<{ count: number }>('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notifications
  async deleteNotification(id: string) {
    await apiClient.delete(`/notifications/${id}`);
  },

  async clearOldNotifications(days = 30) {
    const response = await apiClient.delete<{ count: number }>(`/notifications/clear-old?days=${days}`);
    return response.data;
  },

  // Statistics
  async getNotificationStatistics() {
    const response = await apiClient.get<NotificationStatistics>('/notifications/statistics');
    return response.data;
  },

  // Real-time notifications (for WebSocket integration)
  async getNotificationSettings() {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  async updateNotificationSettings(settings: Record<string, any>) {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  },

  // Filters
  async getNotificationsByType(type: string) {
    const response = await apiClient.get<Notification[]>(`/notifications/by-type/${type}`);
    return response.data;
  },

  async getNotificationsByPriority(priority: string) {
    const response = await apiClient.get<Notification[]>(`/notifications/by-priority/${priority}`);
    return response.data;
  }
};
