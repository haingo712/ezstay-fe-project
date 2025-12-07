'use client';

import { useState, useEffect } from 'react';
import userManagementService from '@/services/userManagementService';
import AuthService from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-toastify';

export default function StaffManagementPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [editStaff, setEditStaff] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    setMounted(true);
    loadStaff();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Status', 'Created Date'];
    const rows = filteredStaff.map(staff => [
      staff.id,
      staff.fullName || 'N/A',
      staff.email,
      staff.phone || 'N/A',
      staff.isActive ? 'Active' : 'Inactive',
      formatDate(staff.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `staff_accounts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      // Use Accounts API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 All accounts from API:', data);

      // Filter for staff only (role = 3)
      const staffAccounts = Array.isArray(data) ? data.filter(acc => acc.role === 3) : [];

      // Transform API response to match frontend format
      const transformedData = staffAccounts.map(staff => ({
        ...staff,
        roleId: staff.role, // Map role enum to roleId
        isActive: !staff.isBanned, // Map isBanned to isActive (inverse)
        createdAt: staff.createAt, // Map createAt to createdAt
      }));

      console.log('✅ Transformed staff data:', transformedData);
      setStaffList(transformedData);
    } catch (error) {
      console.error('❌ Error loading staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!newStaff.fullName || newStaff.fullName.length < 2) {
      toast.warning(t('staffManagement.validation.fullNameMin') || 'Full name must be at least 2 characters');
      return;
    }
    if (!newStaff.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) {
      toast.warning(t('staffManagement.validation.invalidEmail') || 'Please enter a valid email address');
      return;
    }
    if (!newStaff.phone || newStaff.phone.length < 10) {
      toast.warning(t('staffManagement.validation.phoneMin') || 'Phone number must be at least 10 digits');
      return;
    }
    if (!newStaff.password || newStaff.password.length < 6) {
      toast.warning(t('staffManagement.validation.passwordMin') || 'Password must be at least 6 characters');
      return;
    }

    try {
      console.log('🔍 Creating staff account:', newStaff);

      // Use Accounts API to create staff
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          FullName: newStaff.fullName,
          Email: newStaff.email,
          Phone: newStaff.phone,
          Password: newStaff.password,
          Role: 3 // Staff role
        })
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Staff created:', result);
        toast.success(t('staffManagement.toast.createSuccess') || 'Staff account created successfully!');
        setShowCreateModal(false);
        setNewStaff({ fullName: '', email: '', phone: '', password: '' });
        await loadStaff();
      } else {
        let errorMessage = 'Failed to create staff account';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (parseError) {
          errorMessage = await response.text() || errorMessage;
        }
        console.error('❌ Error response:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      toast.error(t('staffManagement.toast.createFailed') || 'Failed to create staff account');
    }
  };

  const handleStatusToggle = async (staffId, currentStatus) => {
    const action = currentStatus ? 'ban' : 'unban';
    const actionText = currentStatus ? 'Ban' : 'Unban';

    // TODO: Nếu muốn xác nhận, dùng modal custom (showDeleteConfirm) thay vì window.confirm
    // Hiện tại sẽ thực hiện luôn

    try {
      console.log(`🔄 ${actionText}ning staff ID:`, staffId);

      // Use Accounts API for ban/unban
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${staffId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await loadStaff();
      toast.success(t('staffManagement.toast.statusSuccess') || `Staff account ${currentStatus ? 'banned' : 'unbanned'} successfully!`);
    } catch (error) {
      console.error(`❌ Error ${action}ning staff:`, error);
      toast.error(t('staffManagement.toast.statusFailed') || `Failed to ${action} staff account`);
    }
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setEditStaff({
      fullName: staff.fullName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (editStaff.fullName && editStaff.fullName.length < 2) {
      toast.warning(t('staffManagement.validation.fullNameMin') || 'Full name must be at least 2 characters');
      return;
    }
    if (editStaff.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editStaff.email)) {
      toast.warning(t('staffManagement.validation.invalidEmail') || 'Please enter a valid email address');
      return;
    }
    if (editStaff.phone && editStaff.phone.length < 10) {
      toast.warning(t('staffManagement.validation.phoneMin') || 'Phone number must be at least 10 digits');
      return;
    }
    if (editStaff.password && editStaff.password.length < 6) {
      toast.warning(t('staffManagement.validation.passwordMin') || 'Password must be at least 6 characters');
      return;
    }

    try {
      console.log('🔍 Updating staff ID:', selectedStaff.id);
      console.log('🔍 Update data:', editStaff);

      // Build AccountRequest payload for AuthApi
      const payload = {
        FullName: editStaff.fullName || selectedStaff.fullName,
        Email: editStaff.email || selectedStaff.email,
        Phone: editStaff.phone || selectedStaff.phone,
        Role: 3 // Keep Staff role
      };

      // Only add password if user entered a new one
      if (editStaff.password && editStaff.password.trim() !== '') {
        payload.Password = editStaff.password;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }

      toast.success(t('staffManagement.toast.updateSuccess') || 'Staff account updated successfully!');
      setShowEditModal(false);
      setSelectedStaff(null);
      await loadStaff();
    } catch (error) {
      console.error('❌ Error updating staff:', error);
      toast.error(t('staffManagement.toast.updateFailed') || 'Failed to update staff account');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date format error:', error);
      return 'N/A';
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      console.log(' Deleting staff ID:', selectedStaff.id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Accounts/${selectedStaff.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(t('staffManagement.toast.deleteSuccess') || 'Staff account deleted successfully!');
      setShowDeleteConfirm(false);
      setShowViewModal(false);
      setSelectedStaff(null);
      await loadStaff();
    } catch (error) {
      console.error('❌ Error deleting staff:', error);
      toast.error(t('staffManagement.toast.deleteFailed') || 'Failed to delete staff account');
    }
  };

  const filteredAndSortedStaff = staffList
    .filter(staff => {
      // Filter by active tab
      if (activeTab === 'active' && !staff.isActive) return false;
      if (activeTab === 'inactive' && staff.isActive) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          staff.fullName?.toLowerCase().includes(query) ||
          staff.email?.toLowerCase().includes(query) ||
          staff.phone?.toLowerCase().includes(query) ||
          staff.id?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortConfig.key === 'createdAt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 {t('staffManagement.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('staffManagement.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('staffManagement.createStaff')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">{t('staffManagement.stats.totalStaff')}</p>
          <p className="text-3xl font-bold mt-2">{staffList.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-emerald-100 text-sm">{t('staffManagement.stats.active')}</p>
          <p className="text-3xl font-bold mt-2">{staffList.filter(s => s.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">{t('staffManagement.stats.inactive')}</p>
          <p className="text-3xl font-bold mt-2">{staffList.filter(s => !s.isActive).length}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t('staffManagement.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${activeTab === tab
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('staffManagement.loading')}</p>
          </div>
        ) : filteredAndSortedStaff.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {searchQuery ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium">{t('staffManagement.noStaffMatching')} "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  {t('staffManagement.clearSearch')}
                </button>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg font-medium">No {activeTab !== 'all' ? activeTab : ''} staff accounts found</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredAndSortedStaff.length}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{staffList.length}</span> staff account(s)
                {searchQuery && <> matching "<span className="font-semibold text-purple-600 dark:text-purple-400">{searchQuery}</span>"</>}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      onClick={() => handleSort('fullName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {t('staffManagement.table.staffInfo')}
                        {sortConfig.key === 'fullName' && (
                          <svg className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {t('staffManagement.table.contact')}
                        {sortConfig.key === 'email' && (
                          <svg className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('isActive')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {t('staffManagement.table.status')}
                        {sortConfig.key === 'isActive' && (
                          <svg className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('createdAt')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {t('staffManagement.table.createdDate')}
                        {sortConfig.key === 'createdAt' && (
                          <svg className={`w-4 h-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {t('staffManagement.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                            {(staff.fullName || staff.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {staff.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {staff.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {staff.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {staff.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${staff.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {staff.isActive ? t('staffManagement.status.active') : t('staffManagement.status.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(staff.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t('common.view')}
                        </button>
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleStatusToggle(staff.id, staff.isActive)}
                          className={`${staff.isActive
                            ? 'text-red-600 hover:text-red-900 dark:text-red-400'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400'
                            }`}
                        >
                          {staff.isActive ? t('staffManagement.actions.ban') : t('staffManagement.actions.unban')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('staffManagement.modal.createTitle')}
              </h2>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.fullName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('staffManagement.actions.createStaff')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('staffManagement.modal.editTitle')}
              </h2>
              <form onSubmit={handleUpdateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.fullName')}
                  </label>
                  <input
                    type="text"
                    value={editStaff.fullName}
                    onChange={(e) => setEditStaff({ ...editStaff, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.email')}
                  </label>
                  <input
                    type="email"
                    value={editStaff.email}
                    onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={editStaff.phone}
                    onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffManagement.form.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={editStaff.password}
                    onChange={(e) => setEditStaff({ ...editStaff, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('staffManagement.form.passwordPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('staffManagement.form.passwordHint')}
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {t('staffManagement.actions.updateStaff')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedStaff && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
              <svg className="w-8 h-8 text-red-600 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {t('staffManagement.modal.deleteTitle')}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {t('staffManagement.modal.deleteMessage')} <span className="font-semibold text-gray-900 dark:text-white">{selectedStaff.fullName || selectedStaff.email}</span>?
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">{t('staffManagement.modal.deleteWarning')}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteStaff}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {t('staffManagement.actions.confirmDelete')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowViewModal(true);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('staffManagement.modal.viewTitle')}
                  </h2>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    STAFF
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.form.fullName')}</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.form.email')}</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.form.phone')}</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.form.accountId')}</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.table.status')}</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedStaff.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {selectedStaff.isActive ? t('staffManagement.status.active') : t('staffManagement.status.inactive')}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('staffManagement.table.createdDate')}</label>
                  <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedStaff.createdAt)}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditStaff(selectedStaff);
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg font-medium"
                >
                  {t('staffManagement.actions.editAccount')}
                </button>
                <button
                  onClick={() => {
                    handleStatusToggle(selectedStaff.id, selectedStaff.isActive);
                    // Đóng modal sau khi loadStaff thành công trong handleStatusToggle
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${selectedStaff.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                    }`}
                >
                  {selectedStaff.isActive ? t('staffManagement.actions.banAccount') : t('staffManagement.actions.unbanAccount')}
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
