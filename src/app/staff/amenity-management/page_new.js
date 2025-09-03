'use client';
import React, { useState, useEffect } from 'react';
import amenityService from '@/services/amenityService';
import { PlusCircle, Edit, Trash2, X, Sparkles } from 'lucide-react';
import Toast from '@/components/Toast';

const AmenityManagement = () => {
    const [amenities, setAmenities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAmenity, setCurrentAmenity] = useState(null);
    const [amenityName, setAmenityName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAmenities();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    const fetchAmenities = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("🏢 Fetching all amenities...");
            
            const response = await amenityService.getAllAmenities();
            console.log("📋 Fetch response:", response);
            
            let amenitiesData = [];
            
            if (Array.isArray(response)) {
                amenitiesData = response;
            } else if (response?.isSuccess === true && Array.isArray(response.data)) {
                amenitiesData = response.data;
            } else if (response?.isSuccess === false) {
                amenitiesData = [];
            } else {
                amenitiesData = [];
            }
            
            setAmenities(amenitiesData);
        } catch (error) {
            console.error('❌ Error fetching amenities:', error);
            setError('Failed to fetch amenities');
            setAmenities([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAmenity = async () => {
        if (!amenityName.trim()) {
            showToast('Please enter an amenity name', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("🆕 Creating amenity:", amenityName);
            
            const amenityData = {
                amenityName: amenityName.trim()
            };
            
            const response = await amenityService.createAmenity(amenityData);
            console.log("✅ Create successful:", response);
            
            const newAmenity = response.data || response || {
                id: Date.now().toString(),
                amenityName: amenityName.trim()
            };
            
            setAmenities(prev => [...prev, newAmenity]);
            setIsModalOpen(false);
            setAmenityName('');
            setCurrentAmenity(null);
            
            showToast('Amenity created successfully!', 'success');
        } catch (error) {
            console.error('❌ Error creating amenity:', error);
            showToast('Failed to create amenity', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAmenity = async () => {
        if (!amenityName.trim()) {
            showToast('Please enter an amenity name', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("🔄 Updating amenity:", currentAmenity.id);
            
            const amenityData = {
                amenityName: amenityName.trim()
            };
            
            await amenityService.updateAmenity(currentAmenity.id, amenityData);
            console.log("✅ Update successful");
            
            setAmenities(prev => prev.map(amenity => 
                amenity.id === currentAmenity.id 
                    ? { ...amenity, amenityName: amenityName.trim() }
                    : amenity
            ));
            
            setIsModalOpen(false);
            setAmenityName('');
            setCurrentAmenity(null);
            
            showToast('Amenity updated successfully!', 'success');
        } catch (error) {
            console.error('❌ Error updating amenity:', error);
            showToast('Failed to update amenity', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAmenity = async (amenityId, amenityName) => {
        if (!confirm(`Are you sure you want to delete "${amenityName}"?`)) {
            return;
        }

        try {
            console.log("🗑️ Deleting amenity:", amenityId);
            
            setAmenities(prev => prev.filter(amenity => amenity.id !== amenityId));
            
            await amenityService.deleteAmenity(amenityId);
            console.log("✅ Delete successful");
            
            showToast('Amenity deleted successfully!', 'success');
        } catch (error) {
            console.error('❌ Error deleting amenity:', error);
            showToast('Failed to delete amenity', 'error');
            fetchAmenities();
        }
    };

    const openCreateModal = () => {
        setCurrentAmenity(null);
        setAmenityName('');
        setIsModalOpen(true);
    };

    const openEditModal = (amenity) => {
        setCurrentAmenity(amenity);
        setAmenityName(amenity.amenityName || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAmenity(null);
        setAmenityName('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentAmenity) {
            handleUpdateAmenity();
        } else {
            handleCreateAmenity();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400"></div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading amenities...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-w-6xl mx-auto">
                {/* Header - Owner style */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Amenity Management
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all amenities in the system</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>Add New Amenity</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="p-1 bg-red-100 dark:bg-red-800 rounded-full">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-red-800 dark:text-red-200 font-semibold mb-1">Error</h4>
                                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Amenities Table - Owner style */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {amenities.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                    <Sparkles className="h-16 w-16 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">No Amenities Found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first amenity to the system.</p>
                                <button
                                    onClick={openCreateModal}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium inline-flex items-center space-x-2"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                    <span>Add First Amenity</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {amenities.map((amenity, index) => (
                                        <tr key={amenity.id || `amenity-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700 dark:text-gray-300">
                                                {amenity.id || `temp-${index}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 flex items-center justify-center">
                                                            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-full">
                                                            Amenity
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {amenity.amenityName || 'Unnamed Amenity'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        onClick={() => openEditModal(amenity)}
                                                        className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                        title="Edit amenity"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAmenity(amenity.id, amenity.amenityName)}
                                                        className="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                        title="Delete amenity"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Enhanced Modal - Owner style */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
                            {/* Modal Header */}
                            <div className="relative overflow-hidden rounded-t-3xl">
                                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
                                    <div className="absolute -top-1 -right-1 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                                    <div className="absolute -bottom-1 -left-1 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
                                    
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                                <Sparkles className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                                                    {currentAmenity ? 'Edit Amenity' : 'Add New Amenity'}
                                                </h2>
                                                <p className="text-white/80 text-sm">
                                                    {currentAmenity ? 'Update amenity information' : 'Create a new amenity for the system'}
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
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="space-y-6">
                                    {/* Amenity Name */}
                                    <div>
                                        <label htmlFor="amenityName" className="block text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                                            <span className="text-2xl">✨</span>
                                            <span>Amenity Name</span>
                                            <span className="text-red-500 text-lg">*</span>
                                        </label>
                                        <input
                                            id="amenityName"
                                            type="text"
                                            value={amenityName}
                                            onChange={(e) => setAmenityName(e.target.value)}
                                            className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 font-medium text-gray-800 dark:text-white shadow-sm hover:shadow-md focus:shadow-lg"
                                            placeholder="e.g., Swimming Pool, Gym, WiFi, Parking..."
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex space-x-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 font-semibold transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-sm hover:shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !amenityName.trim()}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <span>{currentAmenity ? 'Update Amenity' : 'Create Amenity'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast */}
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

export default AmenityManagement;
