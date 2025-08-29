import { apiClient } from './apiClient';

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS';
  entityType: string;
  entityId?: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  category: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'table' | 'custom';
  config: Record<string, any>;
  position: Record<string, any>;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemSettingDto {
  key: string;
  value: string;
  type: string;
  description?: string;
  isPublic?: boolean;
  category: string;
}

export interface CreateDashboardWidgetDto {
  title: string;
  type: string;
  config: Record<string, any>;
  position: Record<string, any>;
}

export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  totalAuditLogs: number;
  systemSettings: number;
  dashboardWidgets: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  recentActivity: AuditLog[];
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
}

export const adminService = {
  // Audit Logs
  async getAuditLogs(page = 1, limit = 50) {
    const response = await apiClient.get<{
      logs: AuditLog[];
      total: number;
      page: number;
      limit: number;
    }>(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getAuditLogById(id: string) {
    const response = await apiClient.get<AuditLog>(`/admin/audit-logs/${id}`);
    return response.data;
  },

  async getAuditLogsByEntity(entityType: string, entityId?: string) {
    const url = entityId 
      ? `/admin/audit-logs/entity/${entityType}/${entityId}`
      : `/admin/audit-logs/entity/${entityType}`;
    const response = await apiClient.get<AuditLog[]>(url);
    return response.data;
  },

  async getAuditLogsByUser(userId: string) {
    const response = await apiClient.get<AuditLog[]>(`/admin/audit-logs/user/${userId}`);
    return response.data;
  },

  async getAuditLogsByAction(action: string) {
    const response = await apiClient.get<AuditLog[]>(`/admin/audit-logs/action/${action}`);
    return response.data;
  },

  async getAuditLogsByDateRange(startDate: string, endDate: string) {
    const response = await apiClient.get<AuditLog[]>(
      `/admin/audit-logs/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  async exportAuditLogs(format: 'csv' | 'xlsx' = 'csv') {
    const response = await apiClient.get(`/admin/audit-logs/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // System Settings
  async getSystemSettings() {
    const response = await apiClient.get<SystemSetting[]>('/admin/settings');
    return response.data;
  },

  async getSystemSettingByKey(key: string) {
    const response = await apiClient.get<SystemSetting>(`/admin/settings/${key}`);
    return response.data;
  },

  async getSystemSettingsByCategory(category: string) {
    const response = await apiClient.get<SystemSetting[]>(`/admin/settings/category/${category}`);
    return response.data;
  },

  async getPublicSettings() {
    const response = await apiClient.get<SystemSetting[]>('/admin/settings/public');
    return response.data;
  },

  async createSystemSetting(data: CreateSystemSettingDto) {
    const response = await apiClient.post<SystemSetting>('/admin/settings', data);
    return response.data;
  },

  async updateSystemSetting(key: string, data: Partial<CreateSystemSettingDto>) {
    const response = await apiClient.put<SystemSetting>(`/admin/settings/${key}`, data);
    return response.data;
  },

  async deleteSystemSetting(key: string) {
    await apiClient.delete(`/admin/settings/${key}`);
  },

  async bulkUpdateSettings(settings: Array<{ key: string; value: string }>) {
    const response = await apiClient.put<SystemSetting[]>('/admin/settings/bulk', { settings });
    return response.data;
  },

  // Dashboard Widgets
  async getDashboardWidgets() {
    const response = await apiClient.get<DashboardWidget[]>('/admin/dashboard-widgets');
    return response.data;
  },

  async getDashboardWidgetById(id: string) {
    const response = await apiClient.get<DashboardWidget>(`/admin/dashboard-widgets/${id}`);
    return response.data;
  },

  async createDashboardWidget(data: CreateDashboardWidgetDto) {
    const response = await apiClient.post<DashboardWidget>('/admin/dashboard-widgets', data);
    return response.data;
  },

  async updateDashboardWidget(id: string, data: Partial<CreateDashboardWidgetDto>) {
    const response = await apiClient.put<DashboardWidget>(`/admin/dashboard-widgets/${id}`, data);
    return response.data;
  },

  async deleteDashboardWidget(id: string) {
    await apiClient.delete(`/admin/dashboard-widgets/${id}`);
  },

  async toggleWidgetStatus(id: string) {
    const response = await apiClient.patch<DashboardWidget>(`/admin/dashboard-widgets/${id}/toggle`);
    return response.data;
  },

  async updateWidgetPosition(id: string, position: Record<string, any>) {
    const response = await apiClient.patch<DashboardWidget>(
      `/admin/dashboard-widgets/${id}/position`, 
      { position }
    );
    return response.data;
  },

  async getWidgetData(id: string) {
    const response = await apiClient.get(`/admin/dashboard-widgets/${id}/data`);
    return response.data;
  },

  // Admin Statistics and System Info
  async getAdminStatistics() {
    const response = await apiClient.get<AdminStatistics>('/admin/statistics');
    return response.data;
  },

  async getSystemHealth() {
    const response = await apiClient.get('/admin/system-health');
    return response.data;
  },

  async getSystemInfo() {
    const response = await apiClient.get('/admin/system-info');
    return response.data;
  },

  // Maintenance
  async clearCache() {
    const response = await apiClient.post('/admin/clear-cache');
    return response.data;
  },

  async backupDatabase() {
    const response = await apiClient.post('/admin/backup-database');
    return response.data;
  },

  async runMaintenance() {
    const response = await apiClient.post('/admin/maintenance');
    return response.data;
  }
};
