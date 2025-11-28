'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import roomService from '@/services/roomService';
import amenityService from '@/services/amenityService';
import SafeImage from '@/components/SafeImage';
import notification from '@/utils/notification';
import { useTranslation } from '@/hooks/useTranslation';

function RoomsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const houseId = searchParams.get('houseId');
  const houseName = searchParams.get('houseName');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const [newRoom, setNewRoom] = useState({
    roomName: '',
    area: '',
    price: '',
    imageFiles: [],
    selectedAmenities: []
  });

  const [editRoom, setEditRoom] = useState({
    area: '',
    price: '',
    roomStatus: 0,
    imageFiles: [],
    selectedAmenities: []
  });
  const [editImagePreviews, setEditImagePreviews] = useState([]);

  useEffect(() => {
    if (houseId) {
      loadRooms();
    }
  }, [houseId]);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoadingAmenities(true);
      const data = await amenityService.getAllAmenities();
      console.log('🎯 Loaded amenities:', data);
      setAmenities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading amenities:', error);
      setAmenities([]);
    } finally {
      setLoadingAmenities(false);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getByBoardingHouseId(houseId);
      console.log('📦 Loaded rooms:', data);
      console.log('📦 Rooms count:', data?.length);
      if (data && data.length > 0) {
        console.log('🚪 First room data:', data[0]);
        console.log('🖼️ First room images:', data[0].images);
        console.log('🖼️ First room imageUrl:', data[0].imageUrl);
        console.log('🏷️ First room roomStatus:', data[0].roomStatus, 'Type:', typeof data[0].roomStatus);
        console.log('🏷️ First room RoomStatus:', data[0].RoomStatus, 'Type:', typeof data[0].RoomStatus);
        
        // Check all rooms status
        data.forEach((room, idx) => {
          console.log(`Room ${idx}: roomStatus=${room.roomStatus}, RoomStatus=${room.RoomStatus}`);
        });
      }
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        notification.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files to existing ones
    const updatedFiles = [...newRoom.imageFiles, ...validFiles];
    setNewRoom({ ...newRoom, imageFiles: updatedFiles });

    // Create previews for new files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeEditImage = (index) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(editImagePreviews[index]);

    setEditRoom(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId) => {
    setNewRoom(prev => {
      const selected = prev.selectedAmenities || [];
      if (selected.includes(amenityId)) {
        return { ...prev, selectedAmenities: selected.filter(id => id !== amenityId) };
      } else {
        return { ...prev, selectedAmenities: [...selected, amenityId] };
      }
    });
  };

  const toggleEditAmenity = (amenityId) => {
    setEditRoom(prev => {
      const selected = prev.selectedAmenities || [];
      if (selected.includes(amenityId)) {
        return { ...prev, selectedAmenities: selected.filter(id => id !== amenityId) };
      } else {
        return { ...prev, selectedAmenities: [...selected, amenityId] };
      }
    });
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        notification.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files
    const updatedFiles = [...editRoom.imageFiles, ...validFiles];
    setEditRoom({ ...editRoom, imageFiles: updatedFiles });

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setEditImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!newRoom.roomName || !newRoom.area || !newRoom.price) {
      notification.warning('Please fill in all fields!');
      return;
    }

    if (newRoom.imageFiles.length === 0) {
      notification.warning('Please select at least one image!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      const formData = new FormData();
      formData.append('RoomName', newRoom.roomName);
      formData.append('Area', newRoom.area);
      formData.append('Price', newRoom.price);

      // Append all images
      newRoom.imageFiles.forEach((file) => {
        formData.append('ImageUrl', file);
      });

      // Note: Backend needs to uncomment Amenities field in CreateRoom.cs for this to work
      // Prepare amenities data (currently backend has this commented out)
      if (newRoom.selectedAmenities && newRoom.selectedAmenities.length > 0) {
        newRoom.selectedAmenities.forEach((amenityId) => {
          formData.append('Amenities', JSON.stringify({ AmenityId: amenityId }));
        });
      }

      console.log('📤 Sending create room request:', {
        roomName: newRoom.roomName,
        area: newRoom.area,
        price: newRoom.price,
        imageCount: newRoom.imageFiles.length,
        amenitiesCount: newRoom.selectedAmenities?.length || 0
      });

      const result = await roomService.create(houseId, formData);

      console.log('✅ Create response:', result);

      notification.success('Room created successfully!');

      setShowCreateModal(false);
      setNewRoom({ roomName: '', area: '', price: '', imageFiles: [], selectedAmenities: [] });

      // Cleanup preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);

      // Reload rooms to show the new one
      await loadRooms();
    } catch (error) {
      console.error('❌ Error creating room:', error);
      notification.error(error.message || 'Failed to create room!');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    if (!editRoom.area || !editRoom.price) {
      notification.warning('Please fill in all required fields!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      const formData = new FormData();
      formData.append('RoomName', selectedRoom.roomName); // ✅ Backend requires RoomName
      formData.append('Area', editRoom.area);
      formData.append('Price', editRoom.price);
      formData.append('RoomStatus', editRoom.roomStatus);

      // Append new images if user selected any
      if (editRoom.imageFiles.length > 0) {
        editRoom.imageFiles.forEach((file) => {
          formData.append('ImageUrl', file);
        });
        console.log('📤 Updating with', editRoom.imageFiles.length, 'new images');
      }

      // Note: Backend needs to uncomment Amenities field in UpdateRoom.cs for this to work
      if (editRoom.selectedAmenities && editRoom.selectedAmenities.length > 0) {
        editRoom.selectedAmenities.forEach((amenityId) => {
          formData.append('Amenities', JSON.stringify({ AmenityId: amenityId }));
        });
        console.log('📤 Updating with', editRoom.selectedAmenities.length, 'amenities');
      } else {
        console.log('📤 Updating without new images - keeping existing images');
      }

      console.log('📤 Sending update request for room:', selectedRoom.id);
      console.log('📤 Update data:', {
        roomName: selectedRoom.roomName,
        area: editRoom.area,
        price: editRoom.price,
        roomStatus: editRoom.roomStatus,
        newImagesCount: editRoom.imageFiles.length
      });

      const result = await roomService.update(selectedRoom.id, formData);

      console.log('✅ Update response:', result);

      notification.success('Room updated successfully!');

      setShowEditModal(false);
      setSelectedRoom(null);
      setEditRoom({ area: '', price: '', roomStatus: 0, imageFiles: [] });

      // Cleanup preview URLs
      editImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setEditImagePreviews([]);

      // Reload rooms to show updated data
      await loadRooms();
    } catch (error) {
      console.error('❌ Error updating room:', error);
      notification.error(error.message || 'Failed to update room!');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmed = await notification.confirm('Are you sure you want to delete this room?');
    if (!confirmed) return;

    try {
      await roomService.delete(roomId);
      notification.success('Room deleted successfully!');
      await loadRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      notification.error('Failed to delete room!');
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setEditRoom({
      area: room.area,
      price: room.price,
      roomStatus: room.roomStatus || 0,
      imageFiles: []
    });
    setEditImagePreviews([]);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedRoom(null);
    setNewRoom({ roomName: '', area: '', price: '', imageFiles: [] });

    // Cleanup all preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);

    setEditRoom({ area: '', price: '', roomStatus: 0, imageFiles: [] });
    editImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setEditImagePreviews([]);
  };

  const getRoomStatusText = (status, t) => {
    switch (status) {
      case 0: return t ? t('ownerRooms.status.available') : 'Available';
      case 1: return t ? t('ownerRooms.status.occupied') : 'Occupied';
      case 2: return t ? t('ownerRooms.status.maintenance') : 'Maintenance';
      default: return 'Unknown';
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!houseId) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>Missing houseId parameter. Please navigate from the boarding house page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚪 {t('ownerRooms.title')} - {houseName || 'Boarding House'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('ownerRooms.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('ownerRooms.addRoom')}
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">{t('ownerRooms.stats.totalRooms')}</p>
          <p className="text-4xl font-bold mt-2">{rooms.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">{t('ownerRooms.stats.available')}</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 0).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">{t('ownerRooms.stats.occupied')}</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 1).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-yellow-100 text-sm">{t('ownerRooms.stats.maintenance')}</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 2).length}</p>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t('common.loading')}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🚪</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('ownerRooms.emptyState.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('ownerRooms.emptyState.description')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {room.images && room.images.length > 0 ? (
                  <>
                    <SafeImage
                      src={room.images[0]}
                      alt={room.roomName || 'Room'}
                      fill
                      fallbackIcon="🚪"
                      objectFit="cover"
                    />
                    {/* Image count badge */}
                    {room.images.length > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        📷 {room.images.length} {t('ownerRooms.room.photos')}
                      </div>
                    )}
                  </>
                ) : room.imageUrl ? (
                  <SafeImage
                    src={room.imageUrl}
                    alt={room.roomName || 'Room'}
                    fill
                    fallbackIcon="🚪"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🚪
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoomStatusColor(room.roomStatus)}`}>
                    {getRoomStatusText(room.roomStatus, t)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {room.roomName || `Room ${room.id?.substring(0, 8)}`}
                </h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📐 {t('ownerRooms.room.area')}: {room.area} m²
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💰 {t('ownerRooms.room.price')}: {room.price?.toLocaleString()} VND
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(room)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 font-medium text-sm"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ➕ {t('ownerRooms.modal.addTitle')}
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.roomName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.roomName}
                    onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('ownerRooms.modal.roomNamePlaceholder')}
                    maxLength={50}
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.areaLabel')} *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={newRoom.area}
                    onChange={(e) => setNewRoom({ ...newRoom, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('ownerRooms.modal.areaPlaceholder')}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.priceLabel')} *
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('ownerRooms.modal.pricePlaceholder')}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.images')} *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('ownerRooms.modal.imagesHint')}
                  </p>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('ownerRooms.modal.amenities')}
                  </label>
                  {loadingAmenities ? (
                    <div className="text-sm text-gray-500">{t('ownerRooms.modal.loadingAmenities')}</div>
                  ) : amenities.length === 0 ? (
                    <div className="text-sm text-gray-500">{t('ownerRooms.modal.noAmenities')}</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                      {amenities.map((amenity) => (
                        <label
                          key={amenity.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={(editRoom.selectedAmenities || []).includes(amenity.id)}
                            onChange={() => toggleEditAmenity(amenity.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          {amenity.imageUrl && (
                            <div className="w-6 h-6 relative flex-shrink-0">
                              <SafeImage
                                src={amenity.imageUrl}
                                alt={amenity.amenityName}
                                fill
                                objectFit="contain"
                                fallbackIcon="🏠"
                              />
                            </div>
                          )}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {amenity.amenityName}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {t('ownerRooms.modal.create')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    {t('ownerRooms.modal.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ✏️ {t('ownerRooms.modal.editTitle')} - {selectedRoom.roomName}
              </h2>

              <form onSubmit={handleUpdateRoom} className="space-y-4">
                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.areaLabel')} *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={editRoom.area}
                    onChange={(e) => setEditRoom({ ...editRoom, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.priceLabel')} *
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={editRoom.price}
                    onChange={(e) => setEditRoom({ ...editRoom, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Room Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.statusLabel')} *
                  </label>
                  <select
                    value={editRoom.roomStatus}
                    onChange={(e) => setEditRoom({ ...editRoom, roomStatus: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={0}>{t('ownerRooms.status.available')}</option>
                    <option value={1}>{t('ownerRooms.status.occupied')}</option>
                    <option value={2}>{t('ownerRooms.status.maintenance')}</option>
                  </select>
                </div>

                {/* Current Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.images')}
                  </label>
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRoom.images.map((imageUrl, index) => (
                        <div key={index} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                          <SafeImage
                            src={imageUrl}
                            alt={`${selectedRoom.roomName} - Image ${index + 1}`}
                            fill
                            fallbackIcon="🚪"
                            objectFit="cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : selectedRoom.imageUrl ? (
                    <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <SafeImage
                        src={selectedRoom.imageUrl}
                        alt={selectedRoom.roomName}
                        fill
                        fallbackIcon="🚪"
                        objectFit="contain"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl">
                      🚪
                    </div>
                  )}
                </div>

                {/* Upload New Images (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('ownerRooms.modal.images')} ({t('common.optional') || 'Optional'})
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('ownerRooms.modal.imagesHint')}
                  </p>

                  {/* New Image Previews */}
                  {editImagePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {editImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-500">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`New Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                            {t('common.new') || 'New'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {t('ownerRooms.modal.update')}
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    {t('ownerRooms.modal.cancel')}
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

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RoomsPageContent />
    </Suspense>
  );
}
