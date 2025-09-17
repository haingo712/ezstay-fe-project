"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import roomService from "@/services/roomService";
import Link from "next/link";

function RoomManagementContent() {
  const searchParams = useSearchParams();
  const houseId = searchParams.get("houseId");
  const houseName = searchParams.get("houseName");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomData, setRoomData] = useState({ roomName: "", area: "", price: "", roomStatus: 0 });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!houseId) {
      setError("Boarding house ID is missing.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching rooms for house:", houseId);
      const data = await roomService.getByBoardingHouseId(houseId);
      console.log("📋 Fetched rooms data:", data);
      
      const roomsArray = Array.isArray(data) ? data : [];
      console.log("📋 Setting rooms array:", roomsArray);
      setRooms(roomsArray);
      
      // Log room statuses for debugging
      roomsArray.forEach(room => {
        console.log(`🏷️ Room ${room.roomName}: status = ${room.roomStatus} (${typeof room.roomStatus})`);
      });
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setRooms([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const validateRoomForm = () => {
    const errors = {};
    
    // Validate room name (required only for new rooms, not edits)
    if (!editingRoom && !roomData.roomName.trim()) {
      errors.roomName = 'Room name is required';
    }
    
    // Validate area (required, must be > 0)
    if (!roomData.area || roomData.area === '') {
      errors.area = 'Area is required';
    } else if (parseFloat(roomData.area) <= 0) {
      errors.area = 'Area must be greater than 0';
    }
    
    // Validate price (required, must be > 0)
    if (!roomData.price || roomData.price === '') {
      errors.price = 'Price is required';
    } else if (parseFloat(roomData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateRoomForm()) return;
    
    try {
      setSubmitting(true);
      setLoading(true);
      await roomService.create(houseId, roomData);
      setShowModal(false);
      setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 });
      setFormErrors({});
      await fetchRooms();
    } catch (error) {
      console.error("Create room error:", error);
      alert("Error creating room: " + (error.message || error));
    } finally { setLoading(false); setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!validateRoomForm()) return;
    
    console.log("🔧 Updating room with data:", roomData);
    console.log("🏷️ Room status value:", roomData.roomStatus, "Type:", typeof roomData.roomStatus);
    console.log("🏷️ Room status stringified:", JSON.stringify(roomData.roomStatus));
    
    try { 
      setSubmitting(true); 
      setLoading(true); 
      const updateResult = await roomService.update(editingRoom.id, roomData);
      console.log("✅ Update completed successfully:", updateResult);
      
      setShowModal(false); 
      setEditingRoom(null); 
      setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); 
      setFormErrors({});
      
      // Force refresh the rooms list
      console.log("🔄 Refreshing rooms list...");
      setLoading(true); // Show loading state during refresh
      await fetchRooms(); 
      console.log("✅ Rooms list refreshed");
      
      // Add a small delay to ensure UI updates
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
    catch (e) { 
      console.error("❌ Error updating room:", e); 
      alert("Error updating room: " + (e.message || e)); 
    }
    finally { 
      setLoading(false); 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (roomId) => { if (!confirm("Are you sure you want to delete this room?")) return; try { setLoading(true); await roomService.delete(roomId); await fetchRooms(); } catch (e) { console.error(e); alert("Error deleting room: " + (e.message || e)); } finally { setLoading(false); } };

  const convertStatusToNumber = (status) => {
    if (typeof status === 'number') return status;
    if (typeof status === 'string') {
      switch(status.toLowerCase()) {
        case 'available': return 0;
        case 'maintenance': return 1;
        case 'occupied': return 2;
        default: return 0;
      }
    }
    return 0;
  };

  const handleEdit = (room) => { 
    console.log("📝 Editing room:", room);
    console.log("🏷️ Original room status:", room.roomStatus, "Type:", typeof room.roomStatus);
    
    const numericStatus = convertStatusToNumber(room.roomStatus);
    console.log("🔢 Converted room status to number:", numericStatus);
    
    setEditingRoom(room); 
    setRoomData({ 
      roomName: room.roomName, 
      area: room.area?.toString?.() || '', 
      price: room.price?.toString?.() || '', 
      roomStatus: numericStatus 
    }); 
    setFormErrors({});
    setShowModal(true); 
  };

  const handleSubmit = () => { 
    if (editingRoom) handleUpdate(); 
    else handleCreate(); 
  };

  const getRoomStatusLabel = (status) => {
    // Handle both string and number values from API
    if (typeof status === 'string') {
      switch(status.toLowerCase()) {
        case 'available': return 'Available';
        case 'maintenance': return 'Maintenance';
        case 'occupied': return 'Occupied';
        default: return 'Available';
      }
    }
    
    // Handle numeric values
    switch(status) {
      case 0: return 'Available';
      case 1: return 'Maintenance';
      case 2: return 'Occupied';
      default: return 'Available';
    }
  };

  const getRoomStatusColor = (status) => {
    // Handle both string and number values from API
    if (typeof status === 'string') {
      switch(status.toLowerCase()) {
        case 'available': return 'text-green-500';
        case 'maintenance': return 'text-yellow-500';
        case 'occupied': return 'text-red-500';
        default: return 'text-green-500';
      }
    }
    
    // Handle numeric values
    switch(status) {
      case 0: return 'text-green-500';
      case 1: return 'text-yellow-500';
      case 2: return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {loading && (<div className="flex justify-center items-center h-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>)}
        {error && (<div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-center">{error}</div>)}
        <div className="mb-8">
          <Link href="/owner/boarding-houses" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Boarding Houses</Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Rooms for: {houseName || "Boarding House"}</h1>
          <p className="text-gray-600 dark:text-gray-400">View, add, edit, or delete rooms for this property.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Room List ({rooms.length})</h2>
          <button onClick={() => { setEditingRoom(null); setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); setFormErrors({}); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Add New Room</button>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found for this property.</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding the first room.</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Create First Room</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{rooms.map((room) => (
            <div key={`${room.id}-${room.roomStatus}-${room.price}-${room.area}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{room.roomName}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Status: <span className={`font-semibold ${getRoomStatusColor(room.roomStatus)}`}>{getRoomStatusLabel(room.roomStatus)}</span></p>
                <p className="text-gray-800 dark:text-gray-200 font-bold text-xl mb-3">{room.price?.toLocaleString?.() || room.price} VND / month</p>
                <div className="text-sm text-gray-500 dark:text-gray-400"><p>Area: {room.area} m²</p></div>
                <div className="flex justify-end space-x-3 mt-4"><button onClick={() => handleEdit(room)} className="text-yellow-500 hover:underline text-sm font-medium">Edit</button><button onClick={() => handleDelete(room.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button></div>
              </div>
            </div>
          ))}</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingRoom ? "Edit Room" : "Create New Room"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Room Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={roomData.roomName} 
                  onChange={(e) => {
                    setRoomData({ ...roomData, roomName: e.target.value });
                    if (formErrors.roomName) {
                      setFormErrors({ ...formErrors, roomName: '' });
                    }
                  }}
                  disabled={editingRoom} // Disable when editing existing room
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    editingRoom 
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  } ${
                    formErrors.roomName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="VD: Room 101, Room A1..."
                />
                {formErrors.roomName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.roomName}</p>
                )}
                {editingRoom && (
                  <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    ⚠️ Room name cannot be changed when editing
                  </p>
                )}
              </div>

              {/* Area and Price in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Area Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Area (m²) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    value={roomData.area} 
                    onChange={(e) => {
                      setRoomData({ ...roomData, area: e.target.value });
                      if (formErrors.area) {
                        setFormErrors({ ...formErrors, area: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                      formErrors.area ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: 25.5"
                  />
                  {formErrors.area && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.area}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Area must be greater than 0
                  </p>
                </div>

                {/* Price Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (VND) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    value={roomData.price} 
                    onChange={(e) => {
                      setRoomData({ ...roomData, price: e.target.value });
                      if (formErrors.price) {
                        setFormErrors({ ...formErrors, price: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="VD: 2000000"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.price}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Price must be greater than 0
                  </p>
                </div>
              </div>

              {/* Room Status Field - Only show when editing existing room */}
              {editingRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Status
                  </label>
                  <select 
                    value={roomData.roomStatus} 
                    onChange={(e) => {
                      const newStatus = parseInt(e.target.value);
                      console.log("🔄 Room status changed to:", newStatus, "Type:", typeof newStatus);
                      setRoomData({ ...roomData, roomStatus: newStatus });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value={0}>Available</option>
                    <option value={1}>Maintenance</option>
                    <option value={2}>Occupied</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select the current status of the room
                  </p>
                </div>
              )}

              {/* Info message for new rooms */}
              {!editingRoom && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>New rooms</strong> will be created with "Available" status by default. You can change the status after creation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingRoom(null); 
                    setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); 
                    setFormErrors({});
                  }} 
                  className="px-6 py-3 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center ${
                    submitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingRoom ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    editingRoom ? "Save Changes" : "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomManagementPage() { return (<Suspense fallback={<div>Loading...</div>}><RoomManagementContent /></Suspense>); }
