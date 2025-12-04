'use client';

import { useState, useEffect, useCallback } from 'react';
import amenityService from '@/services/amenityService';
import SafeImage from '@/components/SafeImage';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-toastify';

export default function AmenityManagementPage() {
  const { t } = useTranslation();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('amenityName asc');
  const [totalCount, setTotalCount] = useState(0);

  const [newAmenity, setNewAmenity] = useState({
    amenityName: '',
    imageFile: null
  });

  const [editAmenity, setEditAmenity] = useState({
    amenityName: '',
    imageFile: null
  });
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Load amenities with OData parameters
  const loadAmenities = useCallback(async () => {
    try {
      setLoading(true);

      console.log('🔍 Loading amenities...');

      // Load all amenities without OData filter (backend may not support it)
      const result = await amenityService.getAllAmenities({});
      console.log('📦 Loaded amenities:', result);

      let amenitiesData = result.value || [];

      // Filter by search query on client side
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        amenitiesData = amenitiesData.filter(amenity =>
          (amenity.amenityName || '').toLowerCase().includes(query)
        );
      }

      // Sort on client side
      if (sortOrder === 'amenityName asc') {
        amenitiesData = [...amenitiesData].sort((a, b) =>
          (a.amenityName || '').localeCompare(b.amenityName || '')
        );
      } else if (sortOrder === 'amenityName desc') {
        amenitiesData = [...amenitiesData].sort((a, b) =>
          (b.amenityName || '').localeCompare(a.amenityName || '')
        );
      } else if (sortOrder === 'createdAt desc') {
        amenitiesData = [...amenitiesData].sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      } else if (sortOrder === 'createdAt asc') {
        amenitiesData = [...amenitiesData].sort((a, b) =>
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      }

      setAmenities(amenitiesData);
      setTotalCount(amenitiesData.length);
    } catch (error) {
      console.error('Error loading amenities:', error);
      setAmenities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    loadAmenities();
  }, [loadAmenities]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAmenity({ ...newAmenity, imageFile: file });

      // Create temporary preview using base64 Data URL (only for UI preview)
      // Actual file will be uploaded to Filebase IPFS storage via backend
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 preview only - not sent to server
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAmenity = async (e) => {
    e.preventDefault();

    if (!newAmenity.amenityName || !newAmenity.imageFile) {
      toast.warning(t('staffAmenity.toast.enterNameAndImage') || 'Please enter amenity name and select an image!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      // Backend will upload the file to Filebase IPFS and return IPFS URL
      const formData = new FormData();
      formData.append('AmenityName', newAmenity.amenityName);
      formData.append('ImageUrl', newAmenity.imageFile); // Actual file object (not base64)

      console.log('📤 Sending create request:', {
        amenityName: newAmenity.amenityName,
        imageFile: newAmenity.imageFile.name
      });

      const result = await amenityService.createAmenity(formData);

      console.log('✅ Create response:', result);

      setShowCreateModal(false);
      setNewAmenity({ amenityName: '', imageFile: null });
      setImagePreview(null);

      // Reload amenities to show the new one
      await loadAmenities();
    } catch (error) {
      console.error('❌ Error creating amenity:', error);
      toast.error(error.message || t('staffAmenity.toast.createFailed') || 'Failed to create amenity');
    }
  };

  const handleDeleteAmenity = async (id) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;

    try {
      await amenityService.deleteAmenity(id);
      await loadAmenities();
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error(error.message || t('staffAmenity.toast.deleteFailed') || 'Failed to delete amenity!');
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditAmenity({ ...editAmenity, imageFile: file });

      // Create temporary preview using base64 Data URL (only for UI preview)
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result); // Base64 preview only
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAmenity = async (e) => {
    e.preventDefault();

    if (!editAmenity.amenityName) {
      toast.warning(t('staffAmenity.toast.enterName') || 'Please enter amenity name!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      const formData = new FormData();
      formData.append('AmenityName', editAmenity.amenityName);

      // Only append image if user selected a new one
      if (editAmenity.imageFile) {
        formData.append('ImageUrl', editAmenity.imageFile);
        console.log('📤 Updating with new image:', editAmenity.imageFile.name);
      } else {
        console.log('📤 Updating without changing image');
      }

      console.log('📤 Sending update request for:', selectedAmenity.id);

      const result = await amenityService.updateAmenity(selectedAmenity.id, formData);

      console.log('✅ Update response:', result);

      setShowEditModal(false);
      setSelectedAmenity(null);
      setEditAmenity({ amenityName: '', imageFile: null });
      setEditImagePreview(null);

      // Reload amenities to show updated data
      await loadAmenities();
    } catch (error) {
      console.error('❌ Error updating amenity:', error);
      toast.error(error.message || t('staffAmenity.toast.updateFailed') || 'Failed to update amenity');
    }
  };

  const openEditModal = (amenity) => {
    setSelectedAmenity(amenity);
    setEditAmenity({
      amenityName: amenity.amenityName,
      imageFile: null // No file selected initially
    });
    setEditImagePreview(null); // Will show current image from amenity.imageUrl
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedAmenity(null);
    setNewAmenity({ amenityName: '', imageFile: null });
    setImagePreview(null);
    setEditAmenity({ amenityName: '', imageFile: null });
    setEditImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🛠️ {t('staffAmenities.title')}
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('staffAmenities.addAmenity')}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search amenities by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="md:w-48">
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="amenityName asc">Name (A-Z)</option>
              <option value="amenityName desc">Name (Z-A)</option>
              <option value="createdAt desc">Newest First</option>
              <option value="createdAt asc">Oldest First</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAmenities}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Found <span className="font-semibold text-blue-600 dark:text-blue-400">{totalCount}</span> amenity(ies)
            {searchQuery && <span> matching "<span className="font-medium">{searchQuery}</span>"</span>}
          </div>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-purple-100 text-sm">Total Amenities</p>
            <p className="text-4xl font-bold mt-2">{totalCount}</p>
          </div>
          {searchQuery && (
            <div className="text-right">
              <p className="text-purple-100 text-sm">Showing</p>
              <p className="text-2xl font-bold mt-1">{amenities.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Amenities Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t('common.loading')}</p>
        </div>
      ) : amenities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('staffAmenities.noAmenitiesFound') || 'No Amenities Found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('staffAmenities.addFirstAmenity') || 'Add your first amenity to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <SafeImage
                  src={amenity.imageUrl}
                  alt={amenity.amenityName || 'Amenity'}
                  fill
                  fallbackIcon="🛠️"
                  objectFit="cover"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {amenity.amenityName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ID: {amenity.id}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(amenity)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 font-medium text-sm"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteAmenity(amenity.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 font-medium text-sm"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ➕ {t('staffAmenities.modal.createTitle')}
              </h2>

              <form onSubmit={handleCreateAmenity} className="space-y-4">
                {/* Amenity Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amenity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAmenity.amenityName}
                    onChange={(e) => setNewAmenity({ ...newAmenity, amenityName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Wifi, Air Conditioner, Refrigerator..."
                    maxLength={100}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffAmenities.modal.image')} *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />

                  {/* Image Preview - Use regular img tag for Data URL */}
                  {imagePreview && (
                    <div className="mt-3 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {t('common.add')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAmenity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                 {t('staffAmenities.modal.editTitle')}
              </h2>

              <form onSubmit={handleUpdateAmenity} className="space-y-4">
                {/* Amenity Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffAmenities.modal.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAmenity.amenityName}
                    onChange={(e) => setEditAmenity({ ...editAmenity, amenityName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Wifi, Air Conditioner, Refrigerator..."
                    maxLength={100}
                  />
                </div>

                {/* Current Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffAmenities.modal.currentImage')}
                  </label>
                  <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <SafeImage
                      src={selectedAmenity.imageUrl}
                      alt={selectedAmenity.amenityName}
                      fill
                      fallbackIcon="🛠️"
                      objectFit="contain"
                    />
                  </div>
                </div>

                {/* Upload New Image (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('staffAmenities.modal.uploadNewImage') || 'Upload New Image (Optional)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('staffAmenities.modal.leaveEmpty') || 'Leave empty to keep current image'}
                  </p>

                  {/* New Image Preview */}
                  {editImagePreview && (
                    <div className="mt-3 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border-2 border-blue-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editImagePreview}
                        alt="New Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        New Image
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {t('common.update')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
