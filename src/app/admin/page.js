'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import userManagementService from '@/services/userManagementService';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalStaff: 0,
    totalPosts: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const accounts = await userManagementService.getAllAccounts();
      
      if (Array.isArray(accounts)) {
        const users = accounts.filter(a => a.roleId === 1);
        const owners = accounts.filter(a => a.roleId === 2);
        const staff = accounts.filter(a => a.roleId === 3);
        const activeUsers = accounts.filter(a => a.isActive && (a.roleId === 1 || a.roleId === 2));
        const inactiveUsers = accounts.filter(a => !a.isActive && (a.roleId === 1 || a.roleId === 2));
        
        setStats({
          totalUsers: users.length,
          totalOwners: owners.length,
          totalStaff: staff.length,
          totalPosts: 0, // TODO: Add posts API
          activeUsers: activeUsers.length,
          inactiveUsers: inactiveUsers.length
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: t('adminDashboard.quickActions.manageUsers'),
      description: t('adminDashboard.quickActions.manageUsersDesc'),
      href: '/admin/users',
      icon: '👥',
      color: 'blue'
    },
    {
      name: t('adminDashboard.quickActions.manageStaff'),
      description: t('adminDashboard.quickActions.manageStaffDesc'),
      href: '/admin/staff-management',
      icon: '👔',
      color: 'purple'
    },
    {
      name: t('adminDashboard.quickActions.systemOverview'),
      description: t('adminDashboard.quickActions.systemOverviewDesc'),
      href: '/admin/overview',
      icon: '📊',
      color: 'green'
    },
    {
      name: t('adminDashboard.quickActions.financialReports'),
      description: t('adminDashboard.quickActions.financialReportsDesc'),
      href: '/admin/financial-reports',
      icon: '💰',
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🎛️ {t('adminDashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('adminDashboard.subtitle')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('adminDashboard.stats.totalUsers')}</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.totalUsers}
              </p>
            </div>
            <div className="text-4xl opacity-50">👤</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('adminDashboard.stats.totalOwners')}</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.totalOwners}
              </p>
            </div>
            <div className="text-4xl opacity-50">🏠</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t('adminDashboard.stats.totalStaff')}</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.totalStaff}
              </p>
            </div>
            <div className="text-4xl opacity-50">👔</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">{t('adminDashboard.stats.totalPosts')}</p>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : stats.totalPosts}
              </p>
            </div>
            <div className="text-4xl opacity-50">📝</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('adminDashboard.accountStatus.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('adminDashboard.accountStatus.active')}</span>
              <span className="text-2xl font-bold text-emerald-600">
                {loading ? '...' : stats.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('adminDashboard.accountStatus.inactive')}</span>
              <span className="text-2xl font-bold text-red-600">
                {loading ? '...' : stats.inactiveUsers}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('adminDashboard.systemHealth.title')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('adminDashboard.systemHealth.apiStatus')}</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                ✓ {t('adminDashboard.systemHealth.online')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('adminDashboard.systemHealth.database')}</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                ✓ {t('adminDashboard.systemHealth.connected')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('adminDashboard.quickActions.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {action.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {t('adminDashboard.welcomeTitle') || 'Welcome to EZStay Admin Panel! 👋'}
        </h2>
        <p className="text-blue-100">
          {t('adminDashboard.welcomeMessage') || 'You have full access to manage users, staff, system settings, and view detailed analytics. Use the sidebar menu to navigate through different sections.'}
        </p>
      </div>
    </div>
  );
}
