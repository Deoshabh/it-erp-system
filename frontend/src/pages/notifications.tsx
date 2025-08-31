import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { notificationService, NotificationStatistics } from '../services/notificationService';
import NotificationCenter from '../components/notifications/NotificationCenter';
import NotificationSettings from '../components/notifications/NotificationSettings';
import { Bell, Settings, Plus, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Local interface to match NotificationCenter component expectations
interface LocalNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  category: 'system' | 'project' | 'task' | 'user' | 'finance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
}

type TabType = 'notifications' | 'settings';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    urgent: 0
  });

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getNotificationStatistics()
      ]);

      // Transform API data to match local interface
      const transformedNotifications: LocalNotification[] = (notificationsData.notifications || []).map((notification: any) => ({
        id: notification.id,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead || false,
        timestamp: notification.createdAt || new Date().toISOString(),
        category: notification.category || 'system',
        priority: notification.priority || 'medium',
        actionUrl: notification.actionUrl
      }));

      setNotifications(transformedNotifications);
      setStats({
        total: statsData.totalNotifications || 0,
        unread: statsData.unreadNotifications || 0,
        today: statsData.recentActivity || 0,
        urgent: 0 // Calculate from priority data if available
      });
    } catch (error) {
      console.error('Error loading notification data:', error);
      // Fallback to empty arrays if API fails
      setNotifications([]);
      setStats({
        total: 0,
        unread: 0,
        today: 0,
        urgent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setStats(prev => ({ ...prev, unread: prev.unread - 1, total: prev.total - 1 }));
    } else {
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    }
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    setStats({ total: 0, unread: 0, today: 0, urgent: 0 });
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Saving notification settings:', settings);
    // Here you would call the API to save settings
  };

  const handleResetSettings = () => {
    console.log('Resetting notification settings');
    // Here you would reset to default settings
  };

  const tabs = [
    {
      id: 'notifications' as TabType,
      name: 'Notifications',
      icon: Bell,
      count: stats.unread
    },
    {
      id: 'settings' as TabType,
      name: 'Settings',
      icon: Settings,
      count: 0
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            stats={stats}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            onDeleteAll={handleDeleteAll}
            onRefresh={loadData}
          />
        );
      case 'settings':
        return (
          <NotificationSettings
            settings={{
              channels: [
                {
                  id: 'email',
                  name: 'Email',
                  icon: Bell,
                  enabled: true,
                  description: 'Receive notifications via email'
                },
                {
                  id: 'push',
                  name: 'Push',
                  icon: Bell,
                  enabled: false,
                  description: 'Receive push notifications'
                }
              ],
              categories: [
                {
                  id: 'system',
                  name: 'System',
                  description: 'System notifications',
                  channels: { email: true, sms: false, push: true, inApp: true },
                  priority: 'medium' as const
                },
                {
                  id: 'project',
                  name: 'Project',
                  description: 'Project notifications',
                  channels: { email: true, sms: false, push: true, inApp: true },
                  priority: 'medium' as const
                }
              ],
              globalSettings: {
                quietHours: {
                  enabled: false,
                  startTime: '22:00',
                  endTime: '08:00'
                },
                soundEnabled: true,
                emailDigest: {
                  enabled: true,
                  frequency: 'daily' as const
                }
              }
            }}
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">
              Stay updated with the latest activities and manage your notification preferences
            </p>
          </div>
          {user?.role && ['admin', 'manager'].includes(user.role) && (
            <button
              onClick={() => {
                // Quick action for creating broadcast notification
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Broadcast
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Notifications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Unread
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.unread}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.today}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Urgent
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.urgent}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-red-100 text-red-800 ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
