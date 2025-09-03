'use client';
import React, { useState, useEffect } from 'react';
import utilityRateService from '@/services/utilityRateService';
import { PlusCircle, Edit, Trash2, X, Zap, Droplets, Calculator } from 'lucide-react';
import Toast from '@/components/Toast';

const UtilityRateManagement = () => {
    const [utilityRates, setUtilityRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRate, setCurrentRate] = useState(null);
    const [formData, setFormData] = useState({
        type: 1, // 1: Electric, 2: Water
        tier: 1,
        from: 0,
        to: 0,
        price: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchUtilityRates();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    const fetchUtilityRates = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("⚡ Fetching all utility rates...");
            
            const response = await utilityRateService.getAllUtilityRates();
            console.log("📋 Fetch response:", response);
            
            let ratesData = [];
            
            if (Array.isArray(response)) {
                ratesData = response;
            } else if (response && response.isSuccess === true && response.data) {
                ratesData = Array.isArray(response.data) ? response.data : [];
            } else if (response && response.isSuccess === false) {
                console.log("ℹ️ Backend returned fail status (likely empty data):", response.message);
                ratesData = [];
            } else if (response && response.data && Array.isArray(response.data)) {
                ratesData = response.data;
            } else {
                console.log("⚠️ Unexpected response format, using empty array");
                ratesData = [];
            }
            
            const normalizedRates = ratesData.map(normalizeRate);

            // Sort by type, then by tier
            normalizedRates.sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            });
            
            // Ensure each rate has a proper id field for React keys
            const finalRates = normalizedRates.map(rate => ({
                ...rate,
                id: rate.id || rate._id || Date.now().toString() + Math.random()
            }));
            
            console.log("📦 Final utility rates data:", finalRates);
            setUtilityRates(finalRates);
        } catch (error) {
            console.error('❌ Error fetching utility rates:', error);
            
            let errorMessage = 'Failed to fetch utility rates. ';
            if (error.response?.status === 500) {
                errorMessage += 'Backend server error detected. Using fallback data for now.';
                setUtilityRates([]);
                showToast('Backend error - using empty data. Please check server logs.', 'warning');
                return;
            } else if (error.response?.status === 404) {
                errorMessage += 'Utility rate endpoint not found.';
            } else if (error.response?.status === 401) {
                errorMessage += 'Authentication required.';
            } else {
                errorMessage += error.message || 'Please try again.';
            }
            
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeRate = (rate) => {
        const id = rate.Id || rate.id || rate._id;
        const rawType = rate.Type !== undefined ? rate.Type : rate.type;
        const tier = rate.Tier !== undefined ? rate.Tier : rate.tier;
        const from = rate.From !== undefined ? rate.From : rate.from;
        const to = rate.To !== undefined ? rate.To : rate.to;
        const price = rate.Price !== undefined ? rate.Price : rate.price;
        const ownerId = rate.OwnerId || rate.ownerId;

        let parsedType;
        const typeString = String(rawType).toLowerCase();
        if (typeString === '2' || typeString === 'water') {
            parsedType = 2;
        } else {
            parsedType = 1;
        }

        return {
            ...rate,
            id: id || (Date.now().toString() + Math.random()),
            type: parsedType,
            tier: parseInt(tier, 10) || 1,
            from: parseInt(from, 10) || 0,
            to: parseInt(to, 10) || 0,
            price: parseFloat(price) || 0,
            ownerId: ownerId
        };
    };

    const getUtilityTypeInfo = (type) => {
        const numericType = parseInt(type, 10);
        switch (numericType) {
            case 1:
                return { 
                    name: 'Electric', 
                    icon: <Zap className="h-5 w-5" />, 
                    color: 'text-yellow-600', 
                    bg: 'bg-yellow-100',
                    unit: 'kWh',
                    currency: 'đ'
                };
            case 2:
                return { 
                    name: 'Water', 
                    icon: <Droplets className="h-5 w-5" />, 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-100',
                    unit: 'm³',
                    currency: 'đ'
                };
            default:
                return { 
                    name: 'Unknown', 
                    icon: <Calculator className="h-5 w-5" />, 
                    color: 'text-gray-600', 
                    bg: 'bg-gray-100',
                    unit: 'units',
                    currency: 'đ'
                };
        }
    };

    const handleCreateRate = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            console.log("🏗️ Creating utility rate:", formData);
            
            const response = await utilityRateService.createUtilityRate(formData);
            console.log("✅ Create response:", response);
            
            const newRate = response.data || response || { 
                id: Date.now().toString(), 
                ...formData 
            };
            
            setUtilityRates(prev => [...prev, newRate].sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            }));
            
            closeModal();
            showToast('Utility rate created successfully!', 'success');
            
            setTimeout(() => {
                fetchUtilityRates();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error creating utility rate:', error);
            showToast('Failed to create utility rate', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRate = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            console.log("🔄 Updating utility rate:", currentRate.id, formData);
            
            const response = await utilityRateService.updateUtilityRate(currentRate.id, formData);
            console.log("✅ Update response:", response);
            
            setUtilityRates(prev => prev.map(rate => 
                rate.id === currentRate.id 
                    ? { ...rate, ...formData }
                    : rate
            ).sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            }));
            
            closeModal();
            showToast('Utility rate updated successfully!', 'success');
            
            setTimeout(() => {
                fetchUtilityRates();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error updating utility rate:', error);
            showToast('Failed to update utility rate', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRate = async (rateId, rateName) => {
        if (!confirm(`Are you sure you want to delete this utility rate?`)) {
            return;
        }

        try {
            console.log("🗑️ Deleting utility rate:", rateId);
            
            // Optimistic update: Remove the rate from list immediately
            setUtilityRates(prev => prev.filter(rate => rate.id !== rateId));
            
            await utilityRateService.deleteUtilityRate(rateId);
            console.log("✅ Delete successful");
            
            showToast('Utility rate deleted successfully!', 'success');
            
            // Refresh data to ensure consistency
            setTimeout(() => {
                fetchUtilityRates();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error deleting utility rate:', error);
            showToast('Failed to delete utility rate', 'error');
            // Revert optimistic update on error
            fetchUtilityRates();
        }
    };

    const validateForm = () => {
        if (formData.from < 0 || formData.to <= formData.from) {
            showToast('Invalid range: "To" must be greater than "From"', 'error');
            return false;
        }
        if (formData.price <= 0) {
            showToast('Price must be greater than 0', 'error');
            return false;
        }
        return true;
    };

    const openCreateModal = () => {
        setCurrentRate(null);
        setFormData({
            type: 1,
            tier: 1,
            from: 0,
            to: 0,
            price: 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (rate) => {
        setCurrentRate(rate);
        setFormData({
            type: rate.type,
            tier: rate.tier,
            from: rate.from,
            to: rate.to,
            price: rate.price
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRate(null);
        setFormData({
            type: 1,
            tier: 1,
            from: 0,
            to: 0,
            price: 0
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentRate) {
            handleUpdateRate();
        } else {
            handleCreateRate();
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'type' || field === 'tier' || field === 'from' || field === 'to' ? parseInt(value) : parseFloat(value)
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 font-medium">Loading utility rates...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-w-6xl mx-auto">{/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                <Calculator className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Utility Rate Management
                                </h1>
                                <p className="text-gray-600 mt-1">Manage electricity and water pricing tiers</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Add New Rate</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Utility Rates Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {utilityRates.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="p-4 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                    <Calculator className="h-12 w-12 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Utility Rates Found</h3>
                                <p className="text-gray-600 mb-6">Start by adding your first utility pricing tier.</p>
                                <button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-yellow-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-blue-600 transition-all duration-200 font-medium inline-flex items-center space-x-2"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Add First Rate</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Tier
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Range
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {utilityRates.map((rate, index) => {
                                        const typeInfo = getUtilityTypeInfo(rate.type);
                                        return (
                                            <tr key={rate.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 ${typeInfo.bg} rounded-lg`}>
                                                            <span className={typeInfo.color}>
                                                                {typeInfo.icon}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {typeInfo.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                                        Tier {rate.tier}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {rate.from} - {rate.to} {typeInfo.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-green-600">
                                                        {rate.price.toLocaleString('vi-VN')}{typeInfo.currency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => openEditModal(rate)}
                                                            className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                            title="Edit rate"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRate(rate.id, `${typeInfo.name} Tier ${rate.tier}`)}
                                                            className="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                            title="Delete rate"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Enhanced Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
                            {/* Modal Header */}
                            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 px-8 py-6 rounded-t-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
                                <div className="absolute -top-1 -right-1 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                                
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                            {currentRate ? (
                                                <Edit className="w-8 h-8 text-white" />
                                            ) : (
                                                <Calculator className="w-8 h-8 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                                {currentRate ? 'Edit Utility Rate' : 'Add New Utility Rate'}
                                            </h2>
                                            <p className="text-white drop-shadow-md text-sm font-medium">
                                                {currentRate ? 'Update pricing tier details' : 'Create a new utility pricing tier'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                    >
                                        <X className="w-6 h-6 text-white drop-shadow-lg" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="space-y-6">
                                    {/* Utility Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                                            <span className="text-2xl">⚡</span>
                                            <span>Utility Type</span>
                                            <span className="text-red-500 text-lg">*</span>
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                            required
                                        >
                                            <option value={1}>⚡ Electric</option>
                                            <option value={2}>💧 Water</option>
                                        </select>
                                    </div>

                                    {/* Tier and Range */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                                Tier <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.tier}
                                                onChange={(e) => handleInputChange('tier', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                                From <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.from}
                                                onChange={(e) => handleInputChange('from', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                                To <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.to}
                                                onChange={(e) => handleInputChange('to', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2">
                                            <span className="text-2xl">💰</span>
                                            <span>Price per Unit (đ)</span>
                                            <span className="text-red-500 text-lg">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Modal Footer */}
                                <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-800 bg-white rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold transform hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span className="text-lg">✖️</span>
                                            <span>Cancel</span>
                                        </span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                <span className="text-white font-medium">Processing...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center space-x-2">
                                                {currentRate ? (
                                                    <>
                                                        <span className="text-lg">✏️</span>
                                                        <span className="text-white font-medium">Update Rate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-lg">✨</span>
                                                        <span className="text-white font-medium">Create Rate</span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </div>
        </div>
    );
};

export default UtilityRateManagement;
