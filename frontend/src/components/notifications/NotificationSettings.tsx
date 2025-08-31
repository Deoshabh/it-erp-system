import React, { useState } from 'react';
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  Bell, 
  Smartphone, 
  Save,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  description: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationSettingsProps {
  settings: {
    channels: NotificationChannel[];
    categories: NotificationCategory[];
    globalSettings: {
      quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
      soundEnabled: boolean;
      emailDigest: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
      };
    };
  };
  onSaveSettings: (settings: any) => void;
  onResetSettings: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetSettings
}) => {
  const [channels, setChannels] = useState<NotificationChannel[]>(settings.channels);
  const [categories, setCategories] = useState<NotificationCategory[]>(settings.categories);
  const [globalSettings, setGlobalSettings] = useState(settings.globalSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChannelToggle = (channelId: string) => {
    const updatedChannels = channels.map(channel =>
      channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
    );
    setChannels(updatedChannels);
    setHasChanges(true);
  };

  const handleCategoryChannelToggle = (categoryId: string, channelType: keyof NotificationCategory['channels']) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            channels: {
              ...category.channels,
              [channelType]: !category.channels[channelType]
            }
          }
        : category
    );
    setCategories(updatedCategories);
    setHasChanges(true);
  };

  const handleGlobalSettingChange = (path: string, value: any) => {
    const pathArray = path.split('.');
    const updatedSettings = { ...globalSettings };
    
    let current = updatedSettings;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i] as keyof typeof current] as any;
    }
    current[pathArray[pathArray.length - 1] as keyof typeof current] = value;
    
    setGlobalSettings(updatedSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedSettings = {
      channels,
      categories,
      globalSettings
    };
    onSaveSettings(updatedSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    onResetSettings();
    setHasChanges(false);
  };

  const getChannelIcon = (channelId: string) => {
    const iconClass = "h-5 w-5";
    switch (channelId) {
      case 'email':
        return <Mail className={iconClass} />;
      case 'sms':
        return <MessageSquare className={iconClass} />;
      case 'push':
        return <Smartphone className={iconClass} />;
      case 'inApp':
        return <Bell className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-green-600 bg-green-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'high': 'text-orange-600 bg-orange-100',
      'urgent': 'text-red-600 bg-red-100'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Notification Settings
          </h2>
          <p className="text-gray-600">Customize how and when you receive notifications</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Global Settings</h3>
        
        <div className="space-y-4">
          {/* Sound Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {globalSettings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-gray-400 mr-3" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Sound Notifications</p>
                <p className="text-sm text-gray-500">Play sounds for new notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.soundEnabled}
                onChange={(e) => handleGlobalSettingChange('soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Quiet Hours</p>
                <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalSettings.quietHours.enabled}
                  onChange={(e) => handleGlobalSettingChange('quietHours.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {globalSettings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={globalSettings.quietHours.startTime}
                    onChange={(e) => handleGlobalSettingChange('quietHours.startTime', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={globalSettings.quietHours.endTime}
                    onChange={(e) => handleGlobalSettingChange('quietHours.endTime', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Email Digest */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Digest</p>
                <p className="text-sm text-gray-500">Receive periodic email summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalSettings.emailDigest.enabled}
                  onChange={(e) => handleGlobalSettingChange('emailDigest.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {globalSettings.emailDigest.enabled && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={globalSettings.emailDigest.frequency}
                  onChange={(e) => handleGlobalSettingChange('emailDigest.frequency', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                {getChannelIcon(channel.id)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                  <p className="text-sm text-gray-500">{channel.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={() => handleChannelToggle(channel.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Categories</h3>
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(category.priority)}`}>
                    {category.priority}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${category.id}-email`}
                    checked={category.channels.email}
                    onChange={() => handleCategoryChannelToggle(category.id, 'email')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${category.id}-email`} className="ml-2 flex items-center text-sm text-gray-700">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${category.id}-sms`}
                    checked={category.channels.sms}
                    onChange={() => handleCategoryChannelToggle(category.id, 'sms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${category.id}-sms`} className="ml-2 flex items-center text-sm text-gray-700">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    SMS
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${category.id}-push`}
                    checked={category.channels.push}
                    onChange={() => handleCategoryChannelToggle(category.id, 'push')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${category.id}-push`} className="ml-2 flex items-center text-sm text-gray-700">
                    <Smartphone className="h-4 w-4 mr-1" />
                    Push
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${category.id}-inApp`}
                    checked={category.channels.inApp}
                    onChange={() => handleCategoryChannelToggle(category.id, 'inApp')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${category.id}-inApp`} className="ml-2 flex items-center text-sm text-gray-700">
                    <Bell className="h-4 w-4 mr-1" />
                    In-App
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            You have unsaved changes. Don't forget to save your notification preferences.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
