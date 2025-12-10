'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import serviceService from '@/services/serviceService';
import { toast } from 'react-toastify';
import notification from '@/utils/notification';

export default function OwnerServicesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({ serviceName: '', price: 0 });
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadServices();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll();
      console.log('✅ Services loaded:', data);
      setServices(data || []);
    } catch (error) {
      console.error('❌ Error loading services:', error);
      toast.error(t('ownerServices.errors.loadFailed'));
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ serviceName: '', price: 0 });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (service) => {
    setModalMode('edit');
    setSelectedServiceId(service.id);
    setFormData({
      serviceName: service.serviceName || '',
      price: service.price || 0
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.serviceName || !formData.serviceName.trim()) {
      newErrors.serviceName = t('ownerServices.modal.serviceNameRequired');
    }
    
    if (formData.price === '' || formData.price === null || formData.price < 0) {
      newErrors.price = t('ownerServices.modal.priceRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ServiceName: formData.serviceName.trim(),
        Price: parseFloat(formData.price) || 0
      };

      console.log('📤 Submitting service:', payload);

      if (modalMode === 'create') {
        await serviceService.create(payload);
        toast.success(t('ownerServices.messages.createSuccess'));
      } else {
        await serviceService.update(selectedServiceId, payload);
        toast.success(t('ownerServices.messages.updateSuccess'));
      }

      setShowModal(false);
      await loadServices();
    } catch (error) {
      console.error('❌ Error submitting service:', error);
      toast.error(error.response?.data?.message || t(`ownerServices.errors.${modalMode}Failed`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId) => {
    const confirmed = await notification.confirm(t('ownerServices.messages.deleteConfirm'), t('common.confirm') || 'Xác nhận');
    if (!confirmed) return;

    try {
      await serviceService.remove(serviceId);
      toast.success(t('ownerServices.messages.deleteSuccess'));
      await loadServices();
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      toast.error(error.response?.data?.message || t('ownerServices.errors.deleteFailed'));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('ownerServices.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('ownerServices.subtitle')}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('ownerServices.addService')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{t('ownerServices.stats.totalServices')}</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{services.length}</p>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-700 rounded-xl">
              <svg className="w-7 h-7 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛎️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('ownerServices.emptyState.title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('ownerServices.emptyState.description')}
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('ownerServices.emptyState.createFirst')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {services.map((service) => (
              <div key={service.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🛎️ {service.serviceName}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                        {service.price?.toLocaleString()} VND
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('ownerServices.list.serviceId')}: {service.id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors"
                    >
                       {t('ownerServices.list.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                    >
                       {t('ownerServices.list.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modalMode === 'create' ? `➕ ${t('ownerServices.modal.createTitle')}` : ` ${t('ownerServices.modal.editTitle')}`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ownerServices.modal.serviceName')} *
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => {
                    setFormData({ ...formData, serviceName: e.target.value });
                    if (errors.serviceName) setErrors({ ...errors, serviceName: null });
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                    errors.serviceName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('ownerServices.modal.serviceNamePlaceholder')}
                />
                {errors.serviceName && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ownerServices.modal.price')} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    if (errors.price) setErrors({ ...errors, price: null });
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
                    errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t('ownerServices.modal.pricePlaceholder')}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('ownerServices.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('ownerServices.modal.saving')}
                  </>
                ) : (
                  modalMode === 'create' ? t('ownerServices.modal.create') : t('ownerServices.modal.update')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
