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

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("� Fetching amenities...");
            
            const response = await amenityService.getAmenitiesForStaff();
            console.log("� Fetch response:", response);
            console.log("� Response type:", typeof response);
            console.log("� Is array:", Array.isArray(response));
            
            // Handle both response formats:
            // 1. {isSuccess: true, data: [...]} 
            // 2. [...] (direct array)
            let amenitiesData = [];
            
            if (Array.isArray(response)) {
                // Direct array response
                amenitiesData = response;
                console.log("✅ Using direct array response");
            } else if (response && response.isSuccess && response.data) {
                // Wrapped response
                amenitiesData = response.data;
                console.log("✅ Using wrapped response.data");
            } else if (response && response.data && Array.isArray(response.data)) {
                // Response has data but no isSuccess
                amenitiesData = response.data;
                console.log("✅ Using response.data without isSuccess check");
            } else {
                console.log("❌ Unknown response format:", response);
                setError("Unable to load amenities");
                return;
            }
            
            console.log("🎯 Final amenitiesData:", amenitiesData);
            console.log("🎯 Number of amenities:", amenitiesData.length);
            setAmenities(amenitiesData);
        } catch (err) {
            console.error("💥 Fetch error:", err);
            setError(err.message || 'Failed to fetch amenities.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (amenity = null) => {
        setCurrentAmenity(amenity);
        setAmenityName(amenity ? amenity.amenityName : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAmenity(null);
        setAmenityName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amenityName.trim()) {
            showToast('Amenity name cannot be empty', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (currentAmenity) {
                // Update
                console.log("🔄 Updating amenity...");
                const response = await amenityService.updateAmenity(currentAmenity.id, { amenityName });
                console.log("📥 Update response:", response);
                
                // Check if update was successful
                if (response && (response.isSuccess === true || response.success === true || !response.hasOwnProperty('isSuccess'))) {
                    // Update the local state immediately for better UX
                    setAmenities(prev => prev.map(amenity => 
                        amenity.id === currentAmenity.id 
                            ? { ...amenity, amenityName, updatedAt: new Date().toISOString() }
                            : amenity
                    ));
                    showToast('✅ Amenity updated successfully!', 'success');
                    handleCloseModal();
                    // Then refresh from server
                    await fetchAmenities();
                } else {
                    showToast(`❌ Update failed: ${response?.message || 'Unknown error'}`, 'error');
                }
            } else {
                // Create
                console.log("➕ Creating amenity...");
                const response = await amenityService.createAmenity({ amenityName });
                console.log("📥 Create response:", response);
                
                // Check if creation was successful - be more flexible with response format
                if (response && (response.isSuccess === true || response.success === true || !response.hasOwnProperty('isSuccess'))) {
                    showToast('🎉 New amenity created successfully!', 'success');
                    handleCloseModal();
                    // Refresh the list immediately
                    await fetchAmenities();
                } else {
                    showToast(`❌ Creation failed: ${response?.message || 'Unknown error'}`, 'error');
                }
            }
        } catch (err) {
            console.error("💥 Submit error:", err);
            showToast(`💥 An error occurred: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const amenityToDelete = amenities.find(a => a.id === id);
        const amenityName = amenityToDelete?.amenityName || 'this amenity';
        
        if (window.confirm(`Are you sure you want to delete "${amenityName}"?`)) {
            try {
                await amenityService.deleteAmenity(id);
                showToast('🗑️ Amenity deleted successfully!', 'success');
                await fetchAmenities(); // Refresh list
            } catch (err) {
                showToast(`❌ Deletion failed: ${err.message}`, 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                🏠 Amenity Management
                            </h1>
                            <p className="text-lg text-gray-600">
                                Manage property amenities and facilities
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                                <span className="text-sm text-gray-500">Total Amenities</span>
                                <div className="text-2xl font-bold text-indigo-600">
                                    {Array.isArray(amenities) ? amenities.length : 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Amenities List
                                </h2>
                                {isLoading && (
                                    <div className="flex items-center text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        Loading...
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-all duration-200 transform hover:scale-105"
                            >
                                <PlusCircle size={20} />
                                <span className="font-medium">Add New Amenity</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {!isLoading && !error && (
                        <>
                            {Array.isArray(amenities) && amenities.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <div className="flex items-center space-x-1">
                                                        <span>🏷️</span>
                                                        <span>Amenity Name</span>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <div className="flex items-center space-x-1">
                                                        <span>📅</span>
                                                        <span>Created At</span>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <div className="flex items-center space-x-1">
                                                        <span>🔄</span>
                                                        <span>Updated At</span>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {amenities.map((amenity, index) => {
                                                console.log("🔧 Rendering amenity:", amenity);
                                                return (
                                                    <tr key={amenity.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                                                                        <span className="text-white font-semibold text-sm">
                                                                            {amenity.amenityName?.charAt(0) || 'A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-semibold text-gray-900">{amenity.amenityName}</div>
                                                                    <div className="text-sm text-gray-500">ID: {amenity.id?.substring(0, 8)}...</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(amenity.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(amenity.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(amenity.updatedAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(amenity.updatedAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button
                                                                    onClick={() => handleOpenModal(amenity)}
                                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors duration-200 tooltip"
                                                                    title="Edit amenity"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(amenity.id)}
                                                                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors duration-200 tooltip"
                                                                    title="Delete amenity"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <span className="text-4xl">🏠</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No amenities found</h3>
                                        <p className="text-gray-500 mb-6">Get started by creating your first amenity</p>
                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-all duration-200"
                                        >
                                            <PlusCircle size={20} />
                                            <span>Create First Amenity</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Enhanced Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 relative overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg">
                                            {currentAmenity ? (
                                                <Edit className="w-6 h-6 text-white" />
                                            ) : (
                                                <Sparkles className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {currentAmenity ? 'Edit Amenity' : 'Add New Amenity'}
                                            </h2>
                                            <p className="text-blue-100 text-sm">
                                                {currentAmenity ? 'Update amenity details' : 'Create a new property amenity'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-8 bg-white">
                                <div className="mb-8">
                                    <label htmlFor="amenityName" className="block text-sm font-semibold text-gray-800 mb-3">
                                        Amenity Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="amenityName"
                                            value={amenityName}
                                            onChange={(e) => setAmenityName(e.target.value)}
                                            className="w-full px-5 py-4 text-lg text-gray-800 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                                            placeholder="e.g., Swimming Pool, Gym, WiFi, Parking..."
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <div className="text-2xl">
                                                {amenityName.toLowerCase().includes('pool') && '🏊‍♂️'}
                                                {amenityName.toLowerCase().includes('gym') && '💪'}
                                                {amenityName.toLowerCase().includes('wifi') && '📶'}
                                                {amenityName.toLowerCase().includes('parking') && '🚗'}
                                                {amenityName.toLowerCase().includes('air') && '❄️'}
                                                {amenityName.toLowerCase().includes('elevator') && '🛗'}
                                                {!amenityName.toLowerCase().match(/(pool|gym|wifi|parking|air|elevator)/) && amenityName && '🏠'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Enter a descriptive name for this amenity
                                    </p>
                                </div>
                                
                                {/* Modal Footer */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !amenityName.trim()}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                {currentAmenity ? <Edit className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                <span>{currentAmenity ? 'Update Amenity' : 'Create Amenity'}</span>
                                            </>
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

export default AmenityManagement;
