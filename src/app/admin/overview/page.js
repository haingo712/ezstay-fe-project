'use client';

import { useState, useEffect } from 'react';
import userManagementService from '@/services/userManagementService';

export default function SystemOverviewPage() {
  const [stats, setStats] = useState({
    users: [],
    owners: [],
    staff: [],
    loading: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const accounts = await userManagementService.getAllAccounts();

      if (Array.isArray(accounts)) {
        setStats({
          users: accounts.filter(a => a.roleId === 1),
          owners: accounts.filter(a => a.roleId === 2),
          staff: accounts.filter(a => a.roleId === 3),
          loading: false
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
      <p className="text-sm opacity-75 mt-2">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📊 System Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed statistics and analytics
        </p>
      </div>

      {stats.loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading data...</p>
        </div>
      ) : (
        <>
          {/* User Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={stats.users.length}
                subtitle={`${stats.users.filter(u => u.isActive).length} active`}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Active Users"
                value={stats.users.filter(u => u.isActive).length}
                subtitle={`${((stats.users.filter(u => u.isActive).length / stats.users.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Inactive Users"
                value={stats.users.filter(u => !u.isActive).length}
                subtitle={`${((stats.users.filter(u => !u.isActive).length / stats.users.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-red-500 to-red-600"
              />
            </div>
          </div>

          {/* Owner Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Owner Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Owners"
                value={stats.owners.length}
                subtitle={`${stats.owners.filter(o => o.isActive).length} active`}
                color="from-emerald-500 to-emerald-600"
              />
              <StatCard
                title="Active Owners"
                value={stats.owners.filter(o => o.isActive).length}
                subtitle={`${((stats.owners.filter(o => o.isActive).length / stats.owners.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-teal-500 to-teal-600"
              />
              <StatCard
                title="Inactive Owners"
                value={stats.owners.filter(o => !o.isActive).length}
                subtitle={`${((stats.owners.filter(o => !o.isActive).length / stats.owners.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-orange-500 to-orange-600"
              />
            </div>
          </div>

          {/* Staff Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Staff Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Staff"
                value={stats.staff.length}
                subtitle={`${stats.staff.filter(s => s.isActive).length} active`}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Active Staff"
                value={stats.staff.filter(s => s.isActive).length}
                subtitle={`${((stats.staff.filter(s => s.isActive).length / stats.staff.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-indigo-500 to-indigo-600"
              />
              <StatCard
                title="Inactive Staff"
                value={stats.staff.filter(s => !s.isActive).length}
                subtitle={`${((stats.staff.filter(s => !s.isActive).length / stats.staff.length) * 100 || 0).toFixed(1)}% of total`}
                color="from-pink-500 to-pink-600"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.users.length + stats.owners.length + stats.staff.length}
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {[...stats.users, ...stats.owners, ...stats.staff].filter(a => a.isActive).length}
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {[...stats.users, ...stats.owners, ...stats.staff].filter(a => !a.isActive).length}
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Activity Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(([...stats.users, ...stats.owners, ...stats.staff].filter(a => a.isActive).length /
                    ([...stats.users, ...stats.owners, ...stats.staff].length)) * 100 || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
