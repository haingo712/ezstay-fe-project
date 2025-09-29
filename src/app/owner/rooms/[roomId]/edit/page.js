"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import roomService from "@/services/roomService";
import roomAmenityService from "@/services/roomAmenityService";
import amenityService from "@/services/amenityService";
import { useAuth } from "@/hooks/useAuth";

export default function EditRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const houseId = searchParams.get("houseId");
  const houseName = searchParams.get("houseName");

  // Form states
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    area: '',
    price: '',
    roomStatus: 0
  });

  // Amenity states
  const [allAmenities, setAllAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [currentAmenities, setCurrentAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!roomId) {
      alert("Room ID is required");
      router.back();
      return;
    }

    fetchRoomDetails();
    fetchAmenities();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      console.log("🔄 Fetching room details for edit...");
      const roomData = await roomService.getById(roomId);
      console.log("📋 Room data fetched:", roomData);

      setRoomFormData({
        roomName: roomData.name || roomData.roomName || '',
        area: (roomData.area || 0).toString(),
        price: (roomData.price || 0).toString(),
        roomStatus: roomData.roomStatus || 0
      });
    } catch (err) {
      console.error("❌ Failed to fetch room details:", err);
      alert("Failed to load room details");
    }
  };

  const fetchAmenities = async () => {
    try {
      setAmenitiesLoading(true);
      console.log("📡 Fetching amenities and room amenities...");

      // Fetch all amenities
      const amenitiesData = await amenityService.getAllAmenities();
      console.log("📋 All amenities:", amenitiesData);
      const amenitiesArray = Array.isArray(amenitiesData) ? amenitiesData : [];
      setAllAmenities(amenitiesArray);

      // Fetch current room amenities
      const roomAmenitiesData = await roomAmenityService.getAllRoomAmenities(roomId);
      console.log("📋 Room amenities:", roomAmenitiesData);
      const roomAmenitiesArray = Array.isArray(roomAmenitiesData) ? roomAmenitiesData : [];
      setCurrentAmenities(roomAmenitiesArray);

      // Set selected amenities
      const selectedIds = roomAmenitiesArray.map(ra => ra.amenityId);
      setSelectedAmenities(selectedIds);

    } catch (err) {
      console.error("❌ Failed to fetch amenities:", err);
      setAllAmenities([]);
      setCurrentAmenities([]);
    } finally {
      setAmenitiesLoading(false);
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!roomFormData.area || parseFloat(roomFormData.area) <= 0) {
      errors.area = 'Area must be greater than 0';
    }

    if (!roomFormData.price || parseFloat(roomFormData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Step 1: Update room details
      console.log("🔄 Updating room details...");
      const updateData = {
        area: parseFloat(roomFormData.area),
        price: parseFloat(roomFormData.price),
        roomStatus: parseInt(roomFormData.roomStatus)
      };

      await roomService.update(roomId, updateData);
      console.log("✅ Room details updated");

      // Step 2: Update amenities
      console.log("🔄 Updating amenities...");
      const currentAmenityIds = currentAmenities.map(ra => ra.amenityId);

      // Find amenities to add (in selected but not in current)
      const amenitiesToAdd = selectedAmenities.filter(id =>
        !currentAmenityIds.includes(id)
      );

      // Find amenities to remove (in current but not in selected)  
      const roomAmenitiesToRemove = currentAmenities.filter(ra =>
        !selectedAmenities.includes(ra.amenityId)
      );

      console.log("➕ Amenities to add:", amenitiesToAdd);
      console.log("🗑️ Room amenities to remove:", roomAmenitiesToRemove.map(ra => ra.id));

      // Add new amenities
      if (amenitiesToAdd.length > 0) {
        console.log("➕ Adding amenities...");
        await roomAmenityService.addMultipleAmenitiesToRoom(roomId, amenitiesToAdd);
      }

      // Remove amenities
      if (roomAmenitiesToRemove.length > 0) {
        console.log("🗑️ Removing amenities...");
        const removePromises = roomAmenitiesToRemove.map(ra =>
          roomAmenityService.removeAmenityFromRoom(ra.id)
        );
        await Promise.allSettled(removePromises);
      }

      alert(`Room updated successfully! Amenities: Added ${amenitiesToAdd.length}, Removed ${roomAmenitiesToRemove.length}`);

      // Navigate back to room dashboard or rooms list
      router.push(`/owner/rooms/${roomId}/dashboard?roomName=${encodeURIComponent(roomFormData.roomName)}&houseId=${houseId}&houseName=${encodeURIComponent(houseName || '')}`);

    } catch (error) {
      console.error("Update room error:", error);
      alert("Error updating room: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ✏️ Edit Room
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Edit room details for {roomFormData.roomName}
              </p>
            </div>
            <Link
              href={`/owner/rooms/${roomId}/dashboard?roomName=${encodeURIComponent(roomFormData.roomName)}&houseId=${houseId}&houseName=${encodeURIComponent(houseName || '')}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📋 Room Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                value={roomFormData.roomName}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="Room name"
                disabled={true}
              />
              <p className="text-orange-500 text-xs mt-1">⚠️ Room name cannot be changed when editing</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Area (m²) *
              </label>
              <input
                type="number"
                step="0.1"
                value={roomFormData.area}
                onChange={(e) => setRoomFormData({
                  ...roomFormData,
                  area: e.target.value
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${formErrors.area ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter room area"
                disabled={loading}
              />
              {formErrors.area && (
                <p className="text-red-500 text-xs mt-1">{formErrors.area}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Area must be greater than 0</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monthly Price (VNĐ) *
              </label>
              <input
                type="number"
                value={roomFormData.price}
                onChange={(e) => setRoomFormData({
                  ...roomFormData,
                  price: e.target.value
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${formErrors.price ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter monthly rental price"
                disabled={loading}
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Price must be greater than 0</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Room Status
              </label>
              <select
                value={roomFormData.roomStatus}
                onChange={(e) => setRoomFormData({
                  ...roomFormData,
                  roomStatus: parseInt(e.target.value)
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                disabled={loading}
              >
                <option value={0}>🟢 Available</option>
                <option value={1}>🟡 Maintenance</option>
                {/* <option value={2}>🔴 Occupied</option> */}
              </select>
              <p className="text-gray-500 text-xs mt-1">Select the current status of the room</p>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🏷️ Select Amenities
            </h3>

            {amenitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading amenities...</span>
              </div>
            ) : allAmenities.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selected: {selectedAmenities.length} / {allAmenities.length} amenities
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  {allAmenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedAmenities.includes(amenity.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                        }`}
                      onClick={() => handleAmenityToggle(amenity.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedAmenities.includes(amenity.id)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-600"
                          }`}>
                          {selectedAmenities.includes(amenity.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {amenity.amenityName || amenity.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No amenities available
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Link
              href={`/owner/rooms/${roomId}/dashboard?roomName=${encodeURIComponent(roomFormData.roomName)}&houseId=${houseId}&houseName=${encodeURIComponent(houseName || '')}`}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpdate}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              disabled={loading || !roomFormData.area || !roomFormData.price}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Room...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}