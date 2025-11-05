'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import paymentService from '@/services/paymentService';
import { paymentAPI } from '@/utils/api';

export default function BankAccountPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        description: '',
        isActive: true
    });

    const [availableBanks, setAvailableBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(true);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
    const [searchQuery, setSearchQuery] = useState('');

    // Load bank accounts
    useEffect(() => {
        loadBankAccounts();
    }, []);

    const loadBankAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await paymentAPI.getAllBankAccounts({
                $orderby: 'createdAt desc'
            });

            // Handle OData response
            const accounts = response.value || response || [];
            setBankAccounts(accounts);

            // Set first account as selected if available
            if (accounts.length > 0 && !selectedAccount) {
                setSelectedAccount(accounts[0]);
            }
        } catch (err) {
            console.error('Error loading bank accounts:', err);
            setError('Không thể tải danh sách tài khoản. Vui lòng thử lại.');
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
                const response = await paymentService.getAllBankGateways({
                    $filter: 'isActive eq true',
                    $orderby: 'bankName asc'
                });
                const banks = response.value || response;
                setAvailableBanks(banks);
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
            if (isEditing && selectedAccount) {
                // Update existing bank account
                await paymentAPI.updateBankAccount(selectedAccount.id, formData);
                // setSuccess('Cập nhật tài khoản ngân hàng thành công!');
            } else {
                // Create new bank account
                const response = await paymentAPI.createBankAccount(formData);
                // setSuccess('Tạo tài khoản ngân hàng thành công!');
            }

            // Reload accounts
            await loadBankAccounts();

            setShowForm(false);
            setIsEditing(false);

            // Reset form
            setFormData({
                bankName: '',
                accountNumber: '',
                description: '',
                isActive: true
            });
        } catch (err) {
            console.error('Error saving bank account:', err);
            setError(err.message || 'Không thể lưu tài khoản ngân hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (selectedAccount) {
            setFormData({
                bankName: selectedAccount.bankName,
                accountNumber: selectedAccount.accountNumber,
                description: selectedAccount.description || '',
                isActive: selectedAccount.isActive !== undefined ? selectedAccount.isActive : true
            });
            setIsEditing(true);
            setShowForm(true);
        }
    };

    const handleToggleActive = async (account) => {
        try {
            setError(null);
            const updatedData = {
                bankName: account.bankName,
                accountNumber: account.accountNumber,
                description: account.description || '',
                isActive: !account.isActive
            };

            await paymentAPI.updateBankAccount(account.id, updatedData);

            // Reload accounts
            await loadBankAccounts();
        } catch (err) {
            console.error('Error toggling bank account status:', err);
            setError(err.message || 'Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (account) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${account.bankName} - ${account.accountNumber}?`)) {
            return;
        }

        try {
            setError(null);
            await paymentAPI.deleteBankAccount(account.id);
            // setSuccess('Xóa tài khoản ngân hàng thành công!');

            // Reload accounts
            await loadBankAccounts();

            // Clear selected account if it was deleted
            if (selectedAccount?.id === account.id) {
                setSelectedAccount(null);
            }
        } catch (err) {
            console.error('Error deleting bank account:', err);
            setError(err.message || 'Không thể xóa tài khoản ngân hàng. Vui lòng thử lại.');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setError(null);
        setFormData({
            bankName: '',
            accountNumber: '',
            description: '',
            isActive: true
        });
    };

    // Filter accounts based on status and search query
    const filteredAccounts = bankAccounts.filter(account => {
        // Filter by status
        if (filterStatus === 'active' && !account.isActive) return false;
        if (filterStatus === 'inactive' && account.isActive) return false;

        // Filter by search query
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

    if (loading) {
        return (
            <ProtectedRoute roles={['Owner', 'Admin']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        💳 {t('bankAccount.title')}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {t('bankAccount.subtitle')}
                                    </p>
                                </div>
                            </div>

                            {!showForm && bankAccounts.length === 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('bankAccount.addAccount')}
                                </button>
                            )}

                            {!showForm && bankAccounts.length > 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('bankAccount.addNewAccount')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-800 dark:text-green-200">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                {isEditing ? t('bankAccount.editAccount') : t('bankAccount.addNewAccount')}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Bank Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.bank')} <span className="text-red-500">*</span>
                                    </label>
                                    {loadingBanks ? (
                                        <div className="flex items-center justify-center py-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('bankAccount.loadingBanks')}</span>
                                        </div>
                                    ) : (
                                        <select
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">{t('bankAccount.selectBank')}</option>
                                            {availableBanks.map((bank) => (
                                                <option key={bank.id} value={bank.bankName}>
                                                    {bank.fullName} ({bank.bankName})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.accountNumber')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t('bankAccount.accountNumberPlaceholder')}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('bankAccount.description')}
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder={t('bankAccount.descriptionPlaceholder')}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-3">

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('bankAccount.setAsActive')}
                                        </span>
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                    >
                                        {t('bankAccount.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                {t('bankAccount.saving')}
                                            </>
                                        ) : (
                                            isEditing ? t('common.update') : t('bankAccount.save')
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Filter Section */}
                    {!showForm && bankAccounts.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        🔍 {t('bankAccount.searchFilter')}
                                    </label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('bankAccount.searchPlaceholder')}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div>
                                    {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Lọc theo trạng thái
                                    </label> */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFilterStatus('all')}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {t('bankAccount.all')} ({bankAccounts.length})
                                        </button>
                                        <button
                                            onClick={() => setFilterStatus('active')}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'active'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {t('bankAccount.active')} ({bankAccounts.filter(a => a.isActive).length})
                                        </button>
                                        <button
                                            onClick={() => setFilterStatus('inactive')}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'inactive'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {t('bankAccount.inactive')} ({bankAccounts.filter(a => !a.isActive).length})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                {t('bankAccount.showingAccounts')} <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredAccounts.length}</span> {t('bankAccount.of')} {bankAccounts.length} {t('bankAccount.accounts')}
                            </div>
                        </div>
                    )}

                    {/* Bank Account Display */}
                    {!showForm && bankAccounts.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredAccounts.map((account) => (
                                <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {account.bankName}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    handleEdit();
                                                }}
                                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                {t('bankAccount.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account)}
                                                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                {t('bankAccount.delete')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column - Info */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                    {t('bankAccount.accountNumber')}
                                                </label>
                                                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                                                    {account.accountNumber}
                                                </p>
                                            </div>

                                            {account.description && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                        {t('bankAccount.description')}
                                                    </label>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {account.description}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                    {t('bankAccount.status')}
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${account.isActive
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${account.isActive ? 'bg-green-500' : 'bg-red-500'
                                                            }`}></span>
                                                        {account.isActive ? t('bankAccount.active') : t('bankAccount.inactive')}
                                                    </span>

                                                    {/* Toggle Switch */}
                                                    <button
                                                        onClick={() => handleToggleActive(account)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${account.isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                                            }`}
                                                        title={account.isActive ? 'Click để tắt' : 'Click để bật'}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${account.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t dark:border-gray-700">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                                    <p>{t('bankAccount.createdAt')}: {new Date(account.createdAt).toLocaleString('vi-VN')}</p>
                                                    {account.updatedAt && (
                                                        <p>{t('bankAccount.updatedAt')}: {new Date(account.updatedAt).toLocaleString('vi-VN')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - QR Code */}
                                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                                            <div className="text-center mb-4">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {t('bankAccount.qrCode')}
                                                </p>
                                            </div>
                                            {account.imageQR ? (
                                                <div className="bg-white p-4 rounded-lg shadow-md">
                                                    <img
                                                        src={account.imageQR}
                                                        alt="QR Code"
                                                        className="w-48 h-48 object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192"><text y="96" font-size="20" text-anchor="middle" x="96">QR Code</text></svg>';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                                    <p className="text-gray-500 dark:text-gray-400">{t('bankAccount.noQrCode')}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                                                {t('bankAccount.scanToTransfer')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results from Filter */}
                    {!showForm && bankAccounts.length > 0 && filteredAccounts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t('common.clearFilter')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!showForm && bankAccounts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {t('bankAccount.noAccountsFound')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {t('bankAccount.noAccountsFoundDesc')}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('bankAccount.addAccount')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
