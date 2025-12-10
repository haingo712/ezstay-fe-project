'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import paymentService from '@/services/paymentService';
import { paymentAPI } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import notification from '@/utils/notification';

export default function BankAccountPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountDetail, setAccountDetail] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        bankGatewayId: '',
        bankName: '', // For display only
        accountNumber: '',
        description: '',
        isActive: true
    });

    const [availableBanks, setAvailableBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(true);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch account detail by ID
    const fetchAccountDetail = async (accountId) => {
        try {
            setLoadingDetail(true);
            console.log('📥 Fetching account detail for:', accountId);
            const detail = await paymentAPI.getBankAccountById(accountId);
            console.log('✅ Account detail loaded:', detail);
            setAccountDetail(detail);
            setShowDetail(true);
            return detail;
        } catch (err) {
            console.error('Error fetching account detail:', err);
            setError('Failed to load account details');
            return null;
        } finally {
            setLoadingDetail(false);
        }
    };

    // Load bank accounts
    useEffect(() => {
        loadBankAccounts();
    }, []);

    const loadBankAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📥 Loading bank accounts...');
            const response = await paymentAPI.getAllBankAccounts({
                $orderby: 'createdAt desc'
            });

            console.log('📦 Bank accounts response:', response);

            // Handle different response formats
            let accounts = [];
            if (Array.isArray(response)) {
                accounts = response;
            } else if (response?.value) {
                accounts = response.value;
            } else if (response?.data) {
                accounts = Array.isArray(response.data) ? response.data : [];
            }

            console.log('✅ Parsed accounts:', accounts);
            setBankAccounts(accounts);

            if (accounts.length > 0 && !selectedAccount) {
                setSelectedAccount(accounts[0]);
            }
        } catch (err) {
            console.error('Error loading bank accounts:', err);
            setError(t('bankAccount.errorLoading'));
            setBankAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load available banks from backend
    useEffect(() => {
        const loadBanks = async () => {
            try {
                setLoadingBanks(true);
                const banks = await paymentService.getActiveBankGateways();
                console.log('🏦 Loaded active banks:', banks);

                if (Array.isArray(banks)) {
                    setAvailableBanks(banks);
                } else {
                    console.warn('⚠️ Banks response is not an array:', banks);
                    setAvailableBanks([]);
                }
            } catch (err) {
                console.error('Error loading banks:', err);
                setAvailableBanks([]);
            } finally {
                setLoadingBanks(false);
            }
        };

        loadBanks();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            // Backend requires: BankGatewayId, AccountNumber, Description, IsActive (PascalCase)
            const dataToSend = {
                BankGatewayId: formData.bankGatewayId,
                AccountNumber: formData.accountNumber,
                Description: formData.description || '',
                IsActive: formData.isActive
            };

            console.log('📤 Sending bank account data:', dataToSend);

            if (isEditing && selectedAccount) {
                await paymentService.updateBankAccount(selectedAccount.id, dataToSend);
            } else {
                await paymentService.createBankAccount(dataToSend);
            }

            await loadBankAccounts();
            setShowForm(false);
            setIsEditing(false);
            setFormData({
                bankGatewayId: '',
                bankName: '',
                accountNumber: '',
                description: '',
                isActive: true
            });
        } catch (err) {
            console.error('Error saving bank account:', err);
            setError(err.message || t('bankAccount.errorSaving'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (account = null) => {
        console.log('🖱️ handleEdit called with:', account);
        const accountToEdit = account || selectedAccount;
        console.log('📝 accountToEdit:', accountToEdit);
        if (accountToEdit) {
            // Fetch full account detail to get bankGateway info
            setLoading(true);
            try {
                console.log('📥 Fetching detail for account id:', accountToEdit.id);
                const detail = await paymentAPI.getBankAccountById(accountToEdit.id);
                console.log('🔧 Editing account (full detail):', detail);
                console.log('🔧 bankGateway:', detail.bankGateway);
                console.log('🏦 Available banks for matching:', availableBanks.map(b => ({ id: b.id, type: typeof b.id, bankName: b.bankName })));

                // Get bankGatewayId from the detail response
                const gatewayId = detail.bankGateway?.id ?? detail.bankGatewayId ?? '';

                console.log('🔧 Resolved gatewayId:', gatewayId, 'type:', typeof gatewayId);

                setSelectedAccount(detail);
                setFormData({
                    bankGatewayId: String(gatewayId),
                    bankName: detail.bankName || detail.bankGateway?.bankName || '',
                    accountNumber: detail.accountNumber,
                    description: detail.description || '',
                    isActive: detail.isActive !== undefined ? detail.isActive : true
                });
                setIsEditing(true);
                setShowForm(true);
                console.log('✅ Form should be visible now');
            } catch (err) {
                console.error('❌ Error fetching account detail for edit:', err);
                setError('Failed to load account details for editing');
            } finally {
                setLoading(false);
            }
        } else {
            console.warn('⚠️ No account to edit');
        }
    };

    const handleToggleActive = async (account) => {
        try {
            setError(null);

            // Optimistic UI update - update state immediately
            const newIsActive = !account.isActive;
            setBankAccounts(prev => prev.map(acc =>
                acc.id === account.id ? { ...acc, isActive: newIsActive } : acc
            ));

            // Fetch detail to get bankGatewayId (required by API)
            const detail = await paymentAPI.getBankAccountById(account.id);
            const updatedData = {
                BankGatewayId: detail.bankGateway?.id || detail.bankGatewayId,
                AccountNumber: detail.accountNumber || account.accountNumber,
                Description: detail.description || account.description || '',
                IsActive: newIsActive
            };

            console.log('📤 Toggling status:', updatedData);
            await paymentAPI.updateBankAccount(account.id, updatedData);

            // Reload to get fresh data from server
            await loadBankAccounts();
        } catch (err) {
            console.error('Error toggling bank account status:', err);
            setError(err.message || t('bankAccount.errorToggle'));
        }
    };

    const handleDelete = async (account) => {
        const confirmed = await notification.confirm(t('bankAccount.deleteConfirm'), t('common.confirm') || 'Xác nhận');
        if (!confirmed) {
            return;
        }

        try {
            setError(null);
            await paymentAPI.deleteBankAccount(account.id);
            await loadBankAccounts();

            if (selectedAccount?.id === account.id) {
                setSelectedAccount(null);
            }
        } catch (err) {
            console.error('Error deleting bank account:', err);
            setError(err.message || t('bankAccount.errorDeleting'));
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setError(null);
        setFormData({
            bankGatewayId: '',
            bankName: '',
            accountNumber: '',
            description: '',
            isActive: true
        });
    };

    // Filter accounts based on status and search query
    const filteredAccounts = bankAccounts.filter(account => {
        if (filterStatus === 'active' && !account.isActive) return false;
        if (filterStatus === 'inactive' && account.isActive) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                account.bankName?.toLowerCase().includes(query) ||
                account.accountNumber?.toLowerCase().includes(query) ||
                account.description?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    if (loading && bankAccounts.length === 0) {
        return (
            <ProtectedRoute roles={['Owner', 'Admin']}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('bankAccount.loading')}</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute roles={['Owner', 'Admin']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/owner')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </span>
                                        {t('bankAccount.title')}
                                    </h1>

                                </div>
                            </div>

                            {!showForm && bankAccounts.length > 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('bankAccount.addAccount')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    {bankAccounts.length > 0 && !showForm && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bankAccount.totalAccounts') || 'Tổng tài khoản'}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{bankAccounts.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bankAccount.active')}</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{bankAccounts.filter(a => a.isActive).length}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bankAccount.inactive')}</p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{bankAccounts.filter(a => !a.isActive).length}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message - only show when there are bank accounts */}
                    {error && bankAccounts.length > 0 && !showForm && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isEditing ? t('bankAccount.editAccount') : t('bankAccount.addNewAccount')}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Bank Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.bank')} <span className="text-red-500">*</span>
                                    </label>
                                    {loadingBanks ? (
                                        <div className="flex items-center justify-center py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600 dark:text-gray-400">{t('bankAccount.loadingBanks')}</span>
                                        </div>
                                    ) : availableBanks.length === 0 ? (
                                        <div className="w-full px-4 py-4 border border-amber-300 dark:border-amber-600 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                            <p className="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {t('bankAccount.noBanksFound')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <select
                                                name="bankGatewayId"
                                                value={formData.bankGatewayId}
                                                onChange={(e) => {
                                                    const selectedBank = availableBanks.find(b => String(b.id) === e.target.value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        bankGatewayId: e.target.value,
                                                        bankName: selectedBank?.bankName || ''
                                                    }));
                                                }}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                            >
                                                <option value="">{t('bankAccount.selectBank')}</option>
                                                {availableBanks.map((bank) => (
                                                    <option key={bank.id} value={String(bank.id)}>
                                                        {bank.fullName} ({bank.bankName})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {t('bankAccount.foundBanks').replace('{{count}}', availableBanks.length)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.accountNumber')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t('bankAccount.accountNumberPlaceholder')}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.description')}
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder={t('bankAccount.descriptionPlaceholder')}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">{t('bankAccount.status')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bankAccount.enableToReceive') || 'Bật để nhận thanh toán'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
                                    >
                                        {t('bankAccount.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || availableBanks.length === 0}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                {t('bankAccount.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {isEditing ? (t('bankAccount.updateAccount') || 'Cập nhật') : t('bankAccount.save')}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Error Message inside form */}
                                {error && (
                                    <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Search & Filter Section */}
                    {!showForm && bankAccounts.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={t('bankAccount.searchPlaceholder')}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${filterStatus === 'all'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('bankAccount.all')}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('active')}
                                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${filterStatus === 'active'
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('bankAccount.active')}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('inactive')}
                                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${filterStatus === 'inactive'
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('bankAccount.inactive')}
                                    </button>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                {t('bankAccount.showingAccounts')} <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAccounts.length}</span> {t('bankAccount.of')} {bankAccounts.length} {t('bankAccount.accounts')}
                            </div>
                        </div>
                    )}

                    {/* Bank Account Cards */}
                    {!showForm && bankAccounts.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => {
                                        setSelectedAccount(account);
                                        fetchAccountDetail(account.id);
                                    }}
                                >
                                    {/* Card Header */}
                                    <div className="p-5 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {account.bankName}
                                                    </h2>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${account.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {account.isActive ? t('bankAccount.active') : t('bankAccount.inactive')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(account);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(account);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Left Column - Info */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        {t('bankAccount.accountNumber')}
                                                    </label>
                                                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                                                        {account.accountNumber}
                                                    </p>
                                                </div>

                                                {account.description && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                            {t('bankAccount.description')}
                                                        </label>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                            {account.description}
                                                        </p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                        {t('bankAccount.status')}
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleActive(account);
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${account.isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                            title={account.isActive ? t('bankAccount.clickToDisable') : t('bankAccount.clickToEnable')}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${account.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </button>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {account.isActive}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t dark:border-gray-700">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                        <p className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {t('bankAccount.createdAt')}: {new Date(account.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        {account.updatedAt && (
                                                            <p className="flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                                {t('bankAccount.updatedAt')}: {new Date(account.updatedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - QR Code */}
                                            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-700/50 rounded-xl p-4">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                                    {t('bankAccount.qrCode')}
                                                </p>
                                                {account.imageQR ? (
                                                    <div className="bg-white p-3 rounded-xl shadow-md">
                                                        <img
                                                            src={account.imageQR}
                                                            alt="QR Code"
                                                            className="w-36 h-36 object-contain"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><rect fill="%23f3f4f6" width="144" height="144"/><text y="72" font-size="14" text-anchor="middle" x="72" fill="%239ca3af">QR Code</text></svg>';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-36 h-36 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                                                        <div className="text-center">
                                                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('bankAccount.noQrCode')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                                    {t('bankAccount.scanToTransfer')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Detail Modal */}
                    {showDetail && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowDetail(false); setAccountDetail(null); }}>
                            <div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Loading State */}
                                {loadingDetail ? (
                                    <div className="p-12 flex flex-col items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-400">{t('bankAccount.loadingDetails') || 'Đang tải chi tiết...'}</p>
                                    </div>
                                ) : accountDetail ? (
                                    <>
                                        {/* Modal Header */}
                                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {accountDetail.bankGateway?.logo ? (
                                                        <img
                                                            src={accountDetail.bankGateway.logo}
                                                            alt={accountDetail.bankGateway.bankName}
                                                            className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                                                        />
                                                    ) : (
                                                        <div className="p-2 bg-white/20 rounded-lg">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h2 className="text-xl font-bold">{t('bankAccount.accountDetails') || 'Chi tiết tài khoản'}</h2>
                                                        <p className="text-blue-100 text-sm">{accountDetail.bankGateway?.fullName || accountDetail.bankGateway?.bankName || t('bankAccount.unknownBank') || 'Không xác định'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setShowDetail(false); setAccountDetail(null); }}
                                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Modal Body */}
                                        <div className="p-6 space-y-6">
                                            {/* Status Badge */}
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${accountDetail.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${accountDetail.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {accountDetail.isActive ? (t('bankAccount.activeReceiving') || 'Hoạt động - Đang nhận thanh toán') : t('bankAccount.inactive')}
                                                </span>
                                            </div>

                                            {/* Bank Gateway Info */}
                                            {accountDetail.bankGateway && (
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                                    <div className="flex items-center gap-4">
                                                        {accountDetail.bankGateway.logo ? (
                                                            <img
                                                                src={accountDetail.bankGateway.logo}
                                                                alt={accountDetail.bankGateway.bankName}
                                                                className="w-16 h-16 object-contain bg-white rounded-lg p-2 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                                                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{t('bankAccount.bankGateway') || 'Cổng ngân hàng'}</p>
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{accountDetail.bankGateway.fullName || accountDetail.bankGateway.bankName}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{accountDetail.bankGateway.bankName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${accountDetail.bankGateway.isActive
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                                    {accountDetail.bankGateway.isActive}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* QR Code Section */}
                                            <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-700/50 rounded-xl p-6">
                                                {accountDetail.imageQR ? (
                                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                                        <img
                                                            src={accountDetail.imageQR}
                                                            alt="QR Code"
                                                            className="w-48 h-48 object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-48 h-48 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                                                        <div className="text-center">
                                                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">{t('bankAccount.noQrCode')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{t('bankAccount.scanToTransfer')}</p>
                                            </div>

                                            {/* Account Info */}
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bankAccount.accountNumber')}</label>
                                                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{accountDetail.accountNumber}</p>
                                                </div>

                                                {/* Amount */}
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                                    <label className="block text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">{t('bankAccount.balance') || 'Số dư'}</label>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(accountDetail.amount || 0)}
                                                    </p>
                                                </div>

                                                {accountDetail.description && (
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bankAccount.description')}</label>
                                                        <p className="text-gray-700 dark:text-gray-300">{accountDetail.description}</p>
                                                    </div>
                                                )}



                                                {/* Timestamps */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bankAccount.createdAt')}</label>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {accountDetail.createdAt ? new Date(accountDetail.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {accountDetail.createdAt ? new Date(accountDetail.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('bankAccount.updatedAt')}</label>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {accountDetail.updatedAt ? new Date(accountDetail.updatedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {accountDetail.updatedAt ? new Date(accountDetail.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </p>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>

                                        {/* Modal Footer */}
                                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700/50 p-4 border-t dark:border-gray-700 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowDetail(false);
                                                    setAccountDetail(null);
                                                    handleEdit();
                                                }}
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                {t('bankAccount.editAccount')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDetail(false);
                                                    setAccountDetail(null);
                                                    handleDelete(selectedAccount);
                                                }}
                                                className="px-4 py-3 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                {t('bankAccount.delete')}
                                            </button>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* No Results from Filter */}
                    {!showForm && bankAccounts.length > 0 && filteredAccounts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('bankAccount.noFilterResults')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {t('bankAccount.noFilterResultsDesc')}
                                </p>
                                <button
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t('bankAccount.clearFilters') || 'Xóa bộ lọc'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!showForm && bankAccounts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('bankAccount.noAccountsFound')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                    {t('bankAccount.noAccountsFoundDesc')}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-500/25"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('bankAccount.addFirstAccount') || 'Thêm tài khoản đầu tiên'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
