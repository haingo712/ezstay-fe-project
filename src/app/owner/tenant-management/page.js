'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import contractService from '@/services/contractService';
import profileService from '@/services/profileService';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, Search, Home, Calendar, Phone, Mail, MapPin, User, Building2, IdCard } from 'lucide-react';

export default function TenantManagementPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching all tenants from API...');
      
      // Call new backend API: GET /api/Contract/tenants
      const token = localStorage.getItem('authToken') || localStorage.getItem('ezstay_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Contract/tenants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tenants data:', data);

      // Backend returns List<TenantInfoResponse> - already includes all info
      const tenantList = Array.isArray(data) ? data : (data.data || []);
      
      // Map to component format
      const mappedTenants = tenantList.map(t => ({
        id: t.userId || t.UserId,
        isPrimary: t.isPrimary || t.IsPrimary,
        contractId: t.contractId || t.ContractId,
        roomName: t.roomName || t.RoomName || 'N/A',
        houseName: t.houseName || t.HouseName || 'N/A',
        startDate: t.checkinDate || t.CheckinDate,
        endDate: t.checkoutDate || t.CheckoutDate,
        fullName: t.fullName || t.FullName || 'N/A',
        email: t.email || t.Email || 'N/A',
        phone: t.phone || t.Phone || 'N/A',
        gender: t.gender || t.Gender || 'N/A',
        dateOfBirth: t.dateOfBirth || t.DateOfBirth,
        citizenIdNumber: t.citizenIdNumber || t.CitizenIdNumber || 'N/A',
        detailAddress: t.address || t.Address || 'N/A',
        wardName: t.wardName || t.WardName || '',
        provinceName: t.provinceName || t.ProvinceName || ''
      }));

      console.log('👥 Total tenants loaded:', mappedTenants.length);
      setTenants(mappedTenants);
    } catch (error) {
      console.error('❌ Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tenant.fullName.toLowerCase().includes(searchLower) ||
      tenant.email.toLowerCase().includes(searchLower) ||
      tenant.phone.includes(searchTerm) ||
      tenant.roomName.toLowerCase().includes(searchLower) ||
      tenant.houseName.toLowerCase().includes(searchLower) ||
      tenant.citizenIdNumber.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('tenantManagement.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            {t('tenantManagement.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('tenantManagement.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('tenantManagement.stats.totalPeople')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tenants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('tenantManagement.stats.primaryTenants')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tenants.filter(t => t.isPrimary).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('tenantManagement.stats.coOccupants')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tenants.filter(t => !t.isPrimary).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('tenantManagement.search.placeholder')}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tenant List */}
        {filteredTenants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? t('tenantManagement.empty.noResults') : t('tenantManagement.empty.noTenants')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('tenantManagement.empty.noResultsDesc') : t('tenantManagement.empty.noTenantsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTenants.map((tenant, index) => (
              <div
                key={`${tenant.id}-${tenant.contractId}-${index}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                      tenant.isPrimary ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                      {tenant.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {tenant.fullName}
                        {tenant.isPrimary && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {t('tenantManagement.tenant.primaryTenant')}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{tenant.houseName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          <span>{tenant.roomName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.citizenIdNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{t('tenantManagement.tenant.dob')}: {formatDate(tenant.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tenant.detailAddress}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('tenantManagement.tenant.contract')}:</span> {formatDate(tenant.startDate)} - {formatDate(tenant.endDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
