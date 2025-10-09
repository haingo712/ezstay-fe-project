'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import roomService from '@/services/roomService';
import SafeImage from '@/components/SafeImage';

function RoomsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const houseId = searchParams.get('houseId');
  const houseName = searchParams.get('houseName');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [newRoom, setNewRoom] = useState({
    roomName: '',
    area: '',
    price: '',
    imageFile: null
  });

  const [editRoom, setEditRoom] = useState({
    area: '',
    price: '',
    roomStatus: 0,
    imageFile: null
  });
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    if (houseId) {
      loadRooms();
    }
  }, [houseId]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getByBoardingHouseId(houseId);
      console.log('📦 Loaded rooms:', data);
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRoom({ ...newRoom, imageFile: file });
      
      // Create temporary preview using base64 Data URL (only for UI preview)
      // Actual file will be uploaded to Filebase IPFS storage via backend
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 preview only - not sent to server
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditRoom({ ...editRoom, imageFile: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!newRoom.roomName || !newRoom.area || !newRoom.price || !newRoom.imageFile) {
      alert('Please fill in all fields and select an image!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      // Backend will upload the file to Filebase IPFS and return IPFS URL
      const formData = new FormData();
      formData.append('RoomName', newRoom.roomName);
      formData.append('Area', newRoom.area);
      formData.append('Price', newRoom.price);
      formData.append('ImageUrl', newRoom.imageFile); // Actual file object (not base64)

      console.log('📤 Sending create room request:', {
        roomName: newRoom.roomName,
        area: newRoom.area,
        price: newRoom.price,
        imageFile: newRoom.imageFile.name
      });

      const result = await roomService.create(houseId, formData);

      console.log('✅ Create response:', result);

      alert('Room created successfully! ✅');

      setShowCreateModal(false);
      setNewRoom({ roomName: '', area: '', price: '', imageFile: null });
      setImagePreview(null);

      // Reload rooms to show the new one
      await loadRooms();
    } catch (error) {
      console.error('❌ Error creating room:', error);
      alert(error.message || 'Failed to create room!');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    if (!editRoom.area || !editRoom.price) {
      alert('Please fill in all required fields!');
      return;
    }

    try {
      // Create FormData for file upload to backend
      const formData = new FormData();
      formData.append('Area', editRoom.area);
      formData.append('Price', editRoom.price);
      formData.append('RoomStatus', editRoom.roomStatus);

      // Only append image if user selected a new one
      if (editRoom.imageFile) {
        formData.append('ImageUrl', editRoom.imageFile);
        console.log('📤 Updating with new image:', editRoom.imageFile.name);
      } else {
        console.log('📤 Updating without changing image');
      }

      console.log('📤 Sending update request for room:', selectedRoom.id);

      const result = await roomService.update(selectedRoom.id, formData);

      console.log('✅ Update response:', result);

      alert('Room updated successfully! ✅');

      setShowEditModal(false);
      setSelectedRoom(null);
      setEditRoom({ area: '', price: '', roomStatus: 0, imageFile: null });
      setEditImagePreview(null);

      // Reload rooms to show updated data
      await loadRooms();
    } catch (error) {
      console.error('❌ Error updating room:', error);
      alert(error.message || 'Failed to update room!');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await roomService.delete(roomId);
      alert('Room deleted successfully!');
      await loadRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room!');
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setEditRoom({
      area: room.area,
      price: room.price,
      roomStatus: room.roomStatus || 0,
      imageFile: null
    });
    setEditImagePreview(null);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedRoom(null);
    setNewRoom({ roomName: '', area: '', price: '', imageFile: null });
    setImagePreview(null);
    setEditRoom({ area: '', price: '', roomStatus: 0, imageFile: null });
    setEditImagePreview(null);
  };

  const getRoomStatusText = (status) => {
    switch (status) {
      case 0: return 'Available';
      case 1: return 'Occupied';
      case 2: return 'Maintenance';
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
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🚪 Rooms - {houseName || 'Boarding House'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage rooms in this boarding house
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Room
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">Total Rooms</p>
          <p className="text-4xl font-bold mt-2">{rooms.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Available</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 0).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">Occupied</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 1).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-yellow-100 text-sm">Maintenance</p>
          <p className="text-4xl font-bold mt-2">{rooms.filter(r => r.roomStatus === 2).length}</p>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🚪</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Rooms Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add your first room to get started!
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
                <SafeImage
                  src={room.imageUrl}
                  alt={room.roomName || 'Room'}
                  fill
                  fallbackIcon="🚪"
                  objectFit="cover"
                />
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoomStatusColor(room.roomStatus)}`}>
                    {getRoomStatusText(room.roomStatus)}
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
                    📐 Area: {room.area} m²
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💰 Price: {room.price?.toLocaleString()} VND
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(room)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 font-medium text-sm"
                  >
                    Delete
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
                ➕ Add New Room
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom.roomName}
                    onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Room 101, Room A1..."
                    maxLength={50}
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Area (m²) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={newRoom.area}
                    onChange={(e) => setNewRoom({ ...newRoom, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. 25.5"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. 2000000"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Image *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />

                  {/* Image Preview */}
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
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
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
                ✏️ Edit Room - {selectedRoom.roomName}
              </h2>

              <form onSubmit={handleUpdateRoom} className="space-y-4">
                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Area (m²) *
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
                    Price (VND) *
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
                    Status *
                  </label>
                  <select
                    value={editRoom.roomStatus}
                    onChange={(e) => setEditRoom({ ...editRoom, roomStatus: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={0}>Available</option>
                    <option value={1}>Occupied</option>
                    <option value={2}>Maintenance</option>
                  </select>
                </div>

                {/* Current Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Image
                  </label>
                  <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <SafeImage
                      src={selectedRoom.imageUrl}
                      alt={selectedRoom.roomName}
                      fill
                      fallbackIcon="🚪"
                      objectFit="contain"
                    />
                  </div>
                </div>

                {/* Upload New Image (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload New Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to keep current image
                  </p>

                  {/* New Image Preview */}
                  {editImagePreview && (
                    <div className="mt-3 relative h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border-2 border-blue-500">
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
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
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
