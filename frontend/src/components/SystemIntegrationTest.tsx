import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';
import { projectService } from '../services/projectService';
import { notificationService } from '../services/notificationService';
import { adminService } from '../services/adminService';

interface ModuleStatus {
  name: string;
  status: 'loading' | 'connected' | 'error';
  error?: string;
  data?: any;
}

const SystemIntegrationTest: React.FC = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([
    { name: 'Sales', status: 'loading' },
    { name: 'Projects', status: 'loading' },
    { name: 'Notifications', status: 'loading' },
    { name: 'Admin', status: 'loading' },
  ]);

  const testModule = async (moduleName: string, testFunction: () => Promise<any>) => {
    try {
      const data = await testFunction();
      setModules(prev => prev.map(m => 
        m.name === moduleName 
          ? { ...m, status: 'connected', data: data?.slice?.(0, 3) || data }
          : m
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setModules(prev => prev.map(m => 
        m.name === moduleName 
          ? { ...m, status: 'error', error: errorMessage }
          : m
      ));
    }
  };

  useEffect(() => {
    const runTests = async () => {
      // Test Sales Module
      await testModule('Sales', async () => {
        const stats = await salesService.getSalesStatistics();
        const leads = await salesService.getLeads();
        return { stats, leads };
      });

      // Test Projects Module
      await testModule('Projects', async () => {
        const stats = await projectService.getProjectStatistics();
        const projects = await projectService.getProjects();
        return { stats, projects };
      });

      // Test Notifications Module
      await testModule('Notifications', async () => {
        const stats = await notificationService.getNotificationStatistics();
        const notifications = await notificationService.getNotifications();
        return { stats, notifications: notifications.notifications };
      });

      // Test Admin Module
      await testModule('Admin', async () => {
        const stats = await adminService.getAdminStatistics();
        const auditLogs = await adminService.getAuditLogs();
        const settings = await adminService.getSystemSettings();
        return { stats, auditLogs: auditLogs.logs, settings };
      });
    };

    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        ERP System Integration Status
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <div 
            key={module.name} 
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{module.name} Module</h3>
              <span className="text-2xl">{getStatusIcon(module.status)}</span>
            </div>
            
            <div className={`text-sm font-medium ${getStatusColor(module.status)}`}>
              {module.status === 'loading' && 'Testing connection...'}
              {module.status === 'connected' && 'Connected successfully'}
              {module.status === 'error' && 'Connection failed'}
            </div>
            
            {module.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {module.error}
              </div>
            )}
            
            {module.data && module.status === 'connected' && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Sample Data:</div>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(module.data, null, 2).substring(0, 200)}
                    {JSON.stringify(module.data, null, 2).length > 200 ? '...' : ''}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Integration Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {modules.filter(m => m.status === 'connected').length}
            </div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {modules.filter(m => m.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {modules.filter(m => m.status === 'loading').length}
            </div>
            <div className="text-sm text-gray-600">Testing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {modules.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Tests
        </button>
      </div>
    </div>
  );
};

export default SystemIntegrationTest;
