'use client';
import React, { useState, useEffect } from 'react';
import utilityRateService from '@/services/utilityRateService';
import { PlusCircle, Edit, Trash2, X, Zap, Droplets, Calculator } from 'lucide-react';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';

const UtilityRateManagement = () => {
    const { user } = useAuth();
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

    const normalizeRate = (rate) => {
        // Get the Type field directly from API response
        const rawType = rate.Type || rate.type;
        
        // Backend returns strings: "Water" or "Electric"
        // Backend enum: Water = 1, Electric = 2
        let normalizedType;
        if (typeof rawType === 'string') {
            if (rawType.toLowerCase() === 'water') {
                normalizedType = 1; // Water = 1 in backend enum
            } else if (rawType.toLowerCase() === 'electric') {
                normalizedType = 2; // Electric = 2 in backend enum
            } else {
                normalizedType = 1; // Default to Water
            }
        } else {
            normalizedType = parseInt(rawType, 10) || 1;
        }
        
        console.log(`[DEBUG] rawType: ${rawType} (${typeof rawType}) -> normalizedType: ${normalizedType}`);
        
        return {
            ...rate,
            id: rate.Id || rate.id || rate._id || (Date.now().toString() + Math.random()),
            type: normalizedType, // 1=Water, 2=Electric (matching backend enum)
            tier: parseInt(rate.Tier || rate.tier, 10) || 1,
            from: parseInt(rate.From || rate.from, 10) || 0,
            to: parseInt(rate.To || rate.to, 10) || 0,
            price: parseInt(rate.Price || rate.price, 10) || 0,
            ownerId: rate.OwnerId || rate.ownerId
        };
    };

    useEffect(() => {
        const userId = user?.id || user?.sub || user?.userId || user?.nameid;
        if (userId) {
            fetchUtilityRates();
        }
    }, [user?.id, user?.sub, user?.userId, user?.nameid]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    const fetchUtilityRates = async () => {
        // Get user ID from various possible field names
        const userId = user?.id || user?.sub || user?.userId || user?.nameid;
        
        if (!userId) {
            setIsLoading(false);
            setError("User not authenticated or ID not available");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            
            const apiPromise = utilityRateService.getAllUtilityRatesByOwner(userId);
            
            const response = await Promise.race([apiPromise, timeoutPromise]);
            
            // Debug: Log raw API response
            console.log('🌐 Raw API Response:', response);
            
            let ratesData = [];
            
            if (Array.isArray(response)) {
                console.log('📋 Response is array, using directly');
                ratesData = response;
            } else if (response && response.isSuccess === true && response.data) {
                console.log('✅ Response.isSuccess=true, using response.data');
                ratesData = Array.isArray(response.data) ? response.data : [];
            } else if (response && response.isSuccess === false) {
                console.log('❌ Response.isSuccess=false, using empty array');
                ratesData = [];
            } else if (response && response.data && Array.isArray(response.data)) {
                console.log('📊 Using response.data as array');
                ratesData = response.data;
            } else {
                console.log('🤷 Unknown response format, using empty array');
                ratesData = [];
            }
            
            console.log('📈 Final ratesData before processing:', ratesData);
            
            // Debug: Log each raw rate before normalization
            ratesData.forEach((rate, index) => {
                console.log(`[RAW RATE ${index}]:`, {
                    Type: rate.Type,
                    type: rate.type,
                    typeOfType: typeof rate.Type,
                    typeOftype: typeof rate.type,
                    fullRate: rate
                });
            });
            
            // Ensure each rate is normalized
            const normalizedRates = ratesData.map(normalizeRate);
            
            // Sort by type, then by tier
            normalizedRates.sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            });
            
            setUtilityRates(normalizedRates);
        } catch (error) {
            console.error('❌ Error fetching utility rates:', error);
            
            let errorMessage = 'Failed to fetch utility rates. ';
            if (error.response?.status === 500) {
                if (error.response?.data?.includes?.('GuidSerializer cannot deserialize') || 
                    error.message?.includes?.('GuidSerializer') ||
                    error.response?.data?.includes?.('GuidRepresentation is Unspecified')) {
                    errorMessage += 'Backend MongoDB GUID configuration issue detected. The database contains binary UUID data that requires backend configuration updates.';
                    setUtilityRates([]);
                    showToast('⚠️ Backend Database Configuration Issue: MongoDB GUID serialization needs to be configured. Please contact the developer.', 'warning');
                    setError('Backend MongoDB GUID Configuration Issue: The database contains UUID data in binary format but the backend MongoDB driver is not configured to handle GUID serialization properly. This requires adding GuidRepresentation configuration in Program.cs.');
                    return;
                } else {
                    setUtilityRates([]);
                    showToast('Backend error - using empty data. Please check server logs.', 'warning');
                    return;
                }
            } else if (error.response?.status === 404) {
                // Don't show error for 404 - just use empty data
                setUtilityRates([]);
                showToast('No utility rate endpoints found - starting with empty data', 'info');
                return;
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

    const getUtilityTypeInfo = (type) => {
        // Handle NaN, null, undefined first
        if (type === null || type === undefined || isNaN(type)) {
            type = 1;
        }
        
        // Convert string to number if needed
        const numericType = typeof type === 'string' ? parseInt(type) : type;
        
        // Double check for NaN after conversion
        const finalType = isNaN(numericType) ? 1 : numericType;
        
        // Backend enum: Water = 1, Electric = 2
        switch (finalType) {
            case 1:
                return { 
                    name: 'Water', 
                    icon: <Droplets className="h-5 w-5" />, 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-100',
                    unit: 'm³',
                    currency: 'đ'
                };
            case 2:
                return { 
                    name: 'Electric', 
                    icon: <Zap className="h-5 w-5" />, 
                    color: 'text-yellow-600', 
                    bg: 'bg-yellow-100',
                    unit: 'kWh',
                    currency: 'đ'
                };
            default:
                return { 
                    name: 'Water', 
                    icon: <Droplets className="h-5 w-5" />, 
                    color: 'text-blue-600', 
                    bg: 'bg-blue-100',
                    unit: 'm³',
                    currency: 'đ'
                };
        }
    };

    const handleCreateRate = async () => {
        if (!validateForm()) return;
        
        const userId = user?.id || user?.sub || user?.userId || user?.nameid;
        if (!userId) {
            showToast('User not authenticated', 'error');
            return;
        }

        // Define rateData at function scope so it's accessible in catch block
        // Ensure all values are valid numbers with fallbacks
        const validType = parseInt(formData.type) || 1;
        const validTier = parseInt(formData.tier) || 1;
        const validFrom = parseInt(formData.from) || 0;
        const validTo = parseInt(formData.to) || 0;
        const validPrice = parseInt(formData.price) || 0;
        
        const rateData = {
            type: validType,
            tier: validTier, 
            from: validFrom,
            to: validTo,
            price: validPrice,
            ownerId: userId
        };

        // Debug: Log the data being sent to API
        console.log('🔄 Creating utility rate with data:', rateData);
        console.log('📝 FormData before processing:', formData);
        console.log('🔢 Processed values:', {
            validType,
            validTier, 
            validFrom,
            validTo,
            validPrice
        });

        // Additional validation
        if (validType < 1 || validType > 2) {
            showToast('Invalid utility type selected', 'error');
            return;
        }
        
        if (validTier < 1) {
            showToast('Tier must be at least 1', 'error');
            return;
        }
        
        if (validFrom < 0) {
            showToast('From value cannot be negative', 'error');
            return;
        }
        
        if (validTo <= validFrom) {
            showToast('To value must be greater than From value', 'error');
            return;
        }
        
        if (validPrice <= 0) {
            showToast('Price must be greater than 0', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Debug: Log the data being sent to API
            console.log('🚀 Creating utility rate with data:', rateData);
            console.log('📝 FormData before processing:', formData);
            console.log('🔢 Processed values:', {
                validType,
                validTier, 
                validFrom,
                validTo,
                validPrice
            });
            
            // Try to create via API
            const response = await utilityRateService.createUtilityRate(rateData);
            
            console.log('✅ API Response:', response);
            
            const newRate = response.data || response || { 
                id: Date.now().toString(), 
                ...rateData 
            };
            
            console.log('📊 New rate to be added:', newRate);
            
            setUtilityRates(prev => [...prev, newRate].sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            }));
            
            closeModal();
            showToast('Utility rate created successfully!', 'success');
            
            // Re-fetch data to ensure consistency with backend
            setTimeout(() => {
                fetchUtilityRates();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error creating utility rate:', error);
            
            // Enhanced error logging
            console.error('❌ Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                stack: error.stack,
                name: error.name,
                fullError: error
            });
            
            // Also log the raw response if available
            if (error.response) {
                console.error('❌ Raw response:', error.response);
                console.error('❌ Response headers:', error.response.headers);
            }
            
            let errorMessage = 'Failed to create utility rate';
            if (error.response?.status === 500) {
                errorMessage += ' - Internal server error. Backend may have an issue with the request format.';
            } else if (error.response?.status === 400) {
                errorMessage += ' - Invalid data format. Check required fields.';
            } else if (error.response?.status === 401) {
                errorMessage += ' - Authentication required.';
            } else if (error.response?.status === 403) {
                errorMessage += ' - Permission denied.';
            } else if (error.message?.includes('Network Error')) {
                errorMessage += ' - Network connection issue.';
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRate = async () => {
        if (!validateForm()) return;
        
        const userId = user?.id || user?.sub || user?.userId || user?.nameid;
        if (!userId) {
            showToast('User not authenticated', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Ensure all values are valid numbers with fallbacks
            const validType = parseInt(formData.type) || 1;
            const validTier = parseInt(formData.tier) || 1;
            const validFrom = parseInt(formData.from) || 0;
            const validTo = parseInt(formData.to) || 0;
            const validPrice = parseInt(formData.price) || 0;
            
            // Additional validation
            if (validType < 1 || validType > 2) {
                showToast('Invalid utility type selected', 'error');
                return;
            }
            
            if (validTier < 1) {
                showToast('Tier must be at least 1', 'error');
                return;
            }
            
            if (validFrom < 0) {
                showToast('From value cannot be negative', 'error');
                return;
            }
            
            if (validTo <= validFrom) {
                showToast('To value must be greater than From value', 'error');
                return;
            }
            
            if (validPrice <= 0) {
                showToast('Price must be greater than 0', 'error');
                return;
            }
            
            // Include ownerId in the update request
            const rateData = {
                type: validType,
                tier: validTier,
                from: validFrom,
                to: validTo,
                price: validPrice,
                ownerId: userId
            };
            
            // Debug: Log the data being sent to API
            console.log('🔄 Updating utility rate with data:', rateData);
            console.log('📝 FormData before processing:', formData);
            console.log('🔢 Processed values:', {
                validType,
                validTier, 
                validFrom,
                validTo,
                validPrice
            });
            console.log('🎯 Current rate being updated:', currentRate);
            
            const response = await utilityRateService.updateUtilityRate(currentRate.id, rateData);
            
            console.log('✅ Update API Response:', response);
            
            setUtilityRates(prev => prev.map(rate => 
                rate.id === currentRate.id 
                    ? { ...rate, ...rateData }
                    : rate
            ).sort((a, b) => {
                if (a.type !== b.type) return a.type - b.type;
                return a.tier - b.tier;
            }));
            
            closeModal();
            showToast('Utility rate updated successfully!', 'success');
            
            // Re-fetch data to ensure consistency with backend
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
        // Check for NaN values
        if (isNaN(formData.type) || isNaN(formData.tier) || isNaN(formData.from) || isNaN(formData.to) || isNaN(formData.price)) {
            showToast('Invalid input: All fields must be valid numbers', 'error');
            return false;
        }
        
        // Check type validity
        const type = parseInt(formData.type);
        if (type < 1 || type > 2) {
            showToast('Invalid utility type selected', 'error');
            return false;
        }
        
        // Check tier validity
        const tier = parseInt(formData.tier);
        if (tier < 1) {
            showToast('Tier must be at least 1', 'error');
            return false;
        }
        
        // Check range validity
        const from = parseInt(formData.from);
        const to = parseInt(formData.to);
        if (from < 0) {
            showToast('From value cannot be negative', 'error');
            return false;
        }
        if (to <= from) {
            showToast('Invalid range: "To" must be greater than "From"', 'error');
            return false;
        }
        
        // Check price validity
        const price = parseInt(formData.price);
        if (price <= 0) {
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
        console.log("📝 Opening edit modal for rate:", rate);
        setCurrentRate(rate);
        
        // Ensure all values are valid numbers, especially `type`
        const validType = parseInt(rate.type, 10);
        const validTier = parseInt(rate.tier, 10) || 1;
        const validFrom = parseInt(rate.from, 10) || 0;
        const validTo = parseInt(rate.to, 10) || 0;
        const validPrice = parseInt(rate.price, 10) || 0;

        const formDataToSet = {
            type: (validType === 1 || validType === 2) ? validType : 1,
            tier: validTier,
            from: validFrom,
            to: validTo,
            price: validPrice
        };

        console.log("📊 Setting form data:", formDataToSet);
        setFormData(formDataToSet);
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
        
        // Debug: Log form data before submitting
        console.log('🚀 Form submitted with data:', formData);
        console.log('📝 Current rate:', currentRate);
        console.log('🔍 Form type value:', formData.type, typeof formData.type);
        
        if (currentRate) {
            handleUpdateRate();
        } else {
            handleCreateRate();
        }
    };

    const handleInputChange = (field, value) => {
        console.log(`🔄 handleInputChange called: field='${field}', value='${value}', typeof=${typeof value}`);
        
        let parsedValue;
        
        if (field === 'type') {
            // Special handling for type field
            if (value === '' || value === null || value === undefined) {
                parsedValue = 1; // Default to Electric
            } else {
                const parsed = parseInt(value);
                if (isNaN(parsed) || parsed < 1 || parsed > 2) {
                    console.log(`⚠️ Invalid type value: ${value}, keeping current or defaulting to 1`);
                    parsedValue = 1; // Default to Electric if invalid
                } else {
                    parsedValue = parsed;
                }
            }
        } else if (field === 'tier' || field === 'from' || field === 'to' || field === 'price') {
            // Handle other numeric fields
            if (value === '' || value === null || value === undefined) {
                parsedValue = 0;
            } else {
                const parsed = parseInt(value);
                parsedValue = isNaN(parsed) ? 0 : parsed;
            }
        } else {
            // For other fields, use parseFloat with fallback
            if (value === '' || value === null || value === undefined) {
                parsedValue = 0;
            } else {
                const parsed = parseFloat(value);
                parsedValue = isNaN(parsed) ? 0 : parsed;
            }
        }
        
        console.log(`✅ Setting ${field} = ${parsedValue}`);
        
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [field]: parsedValue
            };
            console.log(`📊 New formData:`, newFormData);
            return newFormData;
        });
    };

    // Helper function to get user ID from various possible field names
    const getUserId = () => {
        const id = user?.id || 
                   user?.sub || 
                   user?.userId || 
                   user?.nameid || 
                   user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        return id;
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-600 font-medium">Loading utility rates...</p>
                            {getUserId() && <p className="text-sm text-gray-500">Owner ID: {getUserId()}</p>}
                            <button 
                                onClick={() => {
                                    setIsLoading(false);
                                    setUtilityRates([]);
                                    setIsModalOpen(true);
                                    setCurrentRate(null);
                                    setFormData({
                                        type: 1,
                                        tier: 1,
                                        from: 0,
                                        to: 0,
                                        price: 0
                                    });
                                }}
                                className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span>Add New Rate</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!getUserId()) {
        console.log("🔍 Debug user object:", user);
        console.log("🔍 User ID check failed. User:", user);
        return (
            <div className="space-y-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-yellow-100 rounded-xl">
                                <Calculator className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Authentication Required</h3>
                            <p className="text-gray-600">Please ensure you are logged in as an owner.</p>
                            {user && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
                                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                        <strong>Debug Info:</strong><br/>
                                        User ID: {getUserId() || 'N/A'}<br/>
                                        User Role: {user.role || 'N/A'}<br/>
                                        Expected Role: 2 (Owner)<br/>
                                        <strong>Full User Object:</strong><br/>
                                        {JSON.stringify(user, null, 2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
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
                        {!isLoading && (
                            <button
                                onClick={openCreateModal}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span>Add New Rate</span>
                            </button>
                        )}
                        {isLoading && (
                            <div className="flex items-center space-x-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-xl cursor-not-allowed font-medium">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                                <span>Loading...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="p-1 bg-red-100 rounded-full">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-red-800 font-semibold mb-1">Backend Database Configuration Error</h4>
                                <p className="text-red-700 text-sm">{error}</p>
                                {(error.includes('GUID') || error.includes('MongoDB')) && (
                                    <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h5 className="text-yellow-800 font-semibold mb-2">🔧 Developer Fix Required:</h5>
                                        <div className="text-yellow-800 text-sm space-y-2">
                                            <p><strong>Issue:</strong> MongoDB GUID serialization configuration missing</p>
                                            <p><strong>Location:</strong> UtilityRateAPI/Program.cs</p>
                                            <p><strong>Solution:</strong> Add MongoDB GUID configuration before creating MongoClient:</p>
                                            <div className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs font-mono overflow-x-auto">
                                                <pre>{`// Add this before MongoClient creation:
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;

// Configure GUID representation
BsonDefaults.GuidRepresentation = GuidRepresentation.Standard;
// OR
BsonDefaults.GuidRepresentation = GuidRepresentation.CSharpLegacy;

var mongoClient = new MongoClient(...);`}</pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {error && error.includes('MongoDB') && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="p-1 bg-orange-100 rounded-full">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.034 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-orange-800 font-semibold mb-1">⚠️ Temporary Database Issue</h4>
                                <p className="text-orange-700 text-sm">
                                    You can still create utility rates manually using the "Add New Rate" button. The backend database configuration will be fixed by the developer.
                                    All rates you create will be properly saved once the MongoDB configuration is updated.
                                </p>
                            </div>
                        </div>
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
                                        console.log("🔍 Rendering rate:", rate, "type:", rate.type, "typeof:", typeof rate.type);
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
                                                        {rate.price.toFixed(0)}{typeInfo.currency}
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
                                                        {/* Delete button temporarily disabled - backend endpoint not available */}
                                                        <button
                                                            disabled
                                                            className="p-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
                                                            title="Delete functionality temporarily unavailable - backend endpoint disabled"
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
                                            value={formData.type || 1}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                            required
                                        >
                                            <option value={1}>💧 Water</option>
                                            <option value={2}>⚡ Electric</option>
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
                                                value={formData.tier || 1}
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
                                                value={formData.from || 0}
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
                                                value={formData.to || 0}
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
                                            value={formData.price || 0}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white text-gray-800 font-medium"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Modal Footer */}
                                <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                        className="px-4 py-3 border-2 border-gray-300 text-gray-800 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold disabled:opacity-50"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>✖️</span>
                                            <span>Cancel</span>
                                        </span>
                                    </button>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
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
