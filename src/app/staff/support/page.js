'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import supportService from '@/services/supportService';
import { toast } from 'react-toastify';

// Status enum matching backend
const StatusEnums = {
  Pending: 0,
  Accept: 1,
  Reject: 2,
};

export default function StaffSupportPage() {
  const { t } = useTranslation();
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Status labels with translation
  const getStatusLabel = (status) => {
    const labels = {
      0: { label: t('staffSupport.statusPending'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      1: { label: t('staffSupport.statusAccept'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      2: { label: t('staffSupport.statusReject'), color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    };
    return labels[status] || labels[0];
  };

  // Fetch all support requests
  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      const result = await supportService.getAllSupportRequests();
      if (result.success) {
        setSupportRequests(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
      toast.error(t('staffSupport.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  // Update status
  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const result = await supportService.updateSupportStatus(id, newStatus);
      if (result.success) {
        toast.success(t('staffSupport.updateSuccess'));
        // Update local state
        setSupportRequests(prev =>
          prev.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
          )
        );
        if (selectedRequest?.id === id) {
          setSelectedRequest(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(result.message || t('staffSupport.updateError'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('staffSupport.updateError'));
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and search
  const filteredRequests = supportRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === parseInt(filterStatus);
    const matchesSearch = searchTerm === '' ||
      req.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: supportRequests.length,
    pending: supportRequests.filter(r => r.status === 0).length,
    accept: supportRequests.filter(r => r.status === 1).length,
    reject: supportRequests.filter(r => r.status === 2).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('staffSupport.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('staffSupport.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('staffSupport.total')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('staffSupport.statusPending')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accept}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('staffSupport.statusAccept')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reject}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('staffSupport.statusReject')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('staffSupport.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('staffSupport.allStatus')}</option>
              <option value="0">{t('staffSupport.statusPending')}</option>
              <option value="1">{t('staffSupport.statusAccept')}</option>
              <option value="2">{t('staffSupport.statusReject')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('staffSupport.requestList')} ({filteredRequests.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">{t('staffSupport.noRequests')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      selectedRequest?.id === request.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {request.subject}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {request.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      
                      {/* Right: Status Badge */}
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusLabel(request.status).color}`}>
                          {getStatusLabel(request.status).label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Request Detail */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('staffSupport.requestDetail')}
              </h2>
            </div>

            {selectedRequest ? (
              <div className="p-5 space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('staffSupport.subject')}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white font-semibold">
                    {selectedRequest.subject}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('staffSupport.email')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedRequest.email}
                  </p>
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('staffSupport.createdAt')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>

                {/* Current Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {t('staffSupport.status')}
                  </label>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusLabel(selectedRequest.status).color}`}>
                    {getStatusLabel(selectedRequest.status).label}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('staffSupport.description')}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>

                {/* Update Status Buttons */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {t('staffSupport.updateStatus')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {selectedRequest.status !== 1 && (
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id, 1)}
                        disabled={updatingId === selectedRequest.id}
                        className="flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-colors disabled:opacity-50 border border-green-200 dark:border-green-800"
                      >
                        {updatingId === selectedRequest.id ? '...' : t('staffSupport.statusAccept')}
                      </button>
                    )}
                    {selectedRequest.status !== 2 && (
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id, 2)}
                        disabled={updatingId === selectedRequest.id}
                        className="flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50 border border-red-200 dark:border-red-800"
                      >
                        {updatingId === selectedRequest.id ? '...' : t('staffSupport.statusReject')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('staffSupport.selectRequest')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
