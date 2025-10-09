'use client';

import { useState, useEffect } from 'react';
import userManagementService from '@/services/userManagementService';
import AuthService from '@/services/authService';

export default function StaffManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAccountsByRole(3); // Role 3 = Staff
      console.log('📊 Staff data from API:', data);
      
      // Transform API response to match frontend format
      const transformedData = Array.isArray(data) ? data.map(staff => ({
        ...staff,
        roleId: staff.role, // Map role enum to roleId
        isActive: !staff.isBanned, // Map isBanned to isActive (inverse)
        createdAt: staff.createAt, // Map createAt to createdAt
      })) : [];
      
      setStaffList(transformedData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      console.log('🔍 Creating staff account:', newStaff);
      
      const response = await fetch('https://localhost:7000/api/Auth/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          FullName: newStaff.fullName,
          Email: newStaff.email,
          Phone: newStaff.phone,
          Password: newStaff.password
        })
      });
      
      console.log('🔍 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Staff created:', result);
        alert('Staff account created successfully!');
        setShowCreateModal(false);
        setNewStaff({ fullName: '', email: '', phone: '', password: '' });
        await loadStaff();
      } else {
        const error = await response.json();
        console.error('❌ Error response:', error);
        alert(error.message || 'Failed to create staff account');
      }
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      alert('Failed to create staff account: ' + error.message);
    }
  };

  const handleStatusToggle = async (staffId, currentStatus) => {
    if (!confirm(`${currentStatus ? 'Ban' : 'Unban'} this staff account?`)) return;
    try {
      if (currentStatus) {
        await userManagementService.banAccount(staffId);
      } else {
        await userManagementService.unbanAccount(staffId);
      }
      await loadStaff();
      alert(`Staff account ${currentStatus ? 'banned' : 'unbanned'} successfully!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update staff status');
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
    try {
      console.log('🔍 Updating staff ID:', selectedStaff.id);
      console.log('🔍 Update data:', editStaff);
      
      await userManagementService.updateAccount(selectedStaff.id, {
        ...editStaff,
        roleId: 3 // Keep Staff role
      });
      alert('Staff account updated successfully!');
      setShowEditModal(false);
      setSelectedStaff(null);
      await loadStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert(`Failed to update staff account: ${error.message || 'Unknown error'}`);
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

  const filteredStaff = staffList.filter(staff => {
    if (activeTab === 'active' && !staff.isActive) return false;
    if (activeTab === 'inactive' && staff.isActive) return false;
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 Staff Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage staff accounts (Admin only)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Staff Account
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">Total Staff</p>
          <p className="text-3xl font-bold mt-2">{staffList.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-emerald-100 text-sm">Active</p>
          <p className="text-3xl font-bold mt-2">{staffList.filter(s => s.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">Inactive</p>
          <p className="text-3xl font-bold mt-2">{staffList.filter(s => !s.isActive).length}</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
        {['all', 'active', 'inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Loading staff...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            No staff accounts found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Staff Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((staff) => (
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
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        staff.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
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
                        View
                      </button>
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusToggle(staff.id, staff.isActive)}
                        className={`${
                          staff.isActive
                            ? 'text-red-600 hover:text-red-900 dark:text-red-400'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400'
                        }`}
                      >
                        {staff.isActive ? 'Ban' : 'Unban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create Staff Account
              </h2>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Edit Staff Account
              </h2>
              <form onSubmit={handleUpdateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editStaff.fullName}
                    onChange={(e) => setEditStaff({...editStaff, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editStaff.email}
                    onChange={(e) => setEditStaff({...editStaff, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editStaff.phone}
                    onChange={(e) => setEditStaff({...editStaff, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={editStaff.password}
                    onChange={(e) => setEditStaff({...editStaff, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Leave empty to keep current password"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to keep current password
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Update Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Staff Account Details
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
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account ID</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedStaff.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      selectedStaff.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedStaff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
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
                  Edit Account
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleStatusToggle(selectedStaff.id, selectedStaff.isActive);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedStaff.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {selectedStaff.isActive ? 'Ban Account' : 'Unban Account'}
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
