"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import roomService from "@/services/roomService";
import utilityService from "@/services/utilityService";
import roomAmenityService from "@/services/roomAmenityService";
import amenityService from "@/services/amenityService";
import { useAuth } from "@/hooks/useAuth";

function RoomDashboardContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const roomName = searchParams.get("roomName");
  const houseId = searchParams.get("houseId");
  const houseName = searchParams.get("houseName");

  const [activeTab, setActiveTab] = useState("room");
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Amenity states
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);

  // Utility states
  const [utilityRates, setUtilityRates] = useState([]);
  const [utilityReadings, setUtilityReadings] = useState([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [utilityLoading, setUtilityLoading] = useState(false);
  
  // Rate form states
  const [rateFormData, setRateFormData] = useState({
    utilityType: 0, // Use UtilityReadingAPI enum (Water=0, Electric=1) for consistency in UI
    unitPrice: '',
    description: ''
  });
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormLoading, setRateFormLoading] = useState(false);
  
  // Reading form states
  const [readingFormData, setReadingFormData] = useState({
    type: 0, // 0 = Water, 1 = Electric (UtilityReadingAPI enum)
    price: '', // Unit price (VND per kWh or m³)
    currentIndex: '',
    note: ''
  });
  const [lastReadings, setLastReadings] = useState({ electric: null, water: null });
  const [readingFormLoading, setReadingFormLoading] = useState(false);
  const [editingReading, setEditingReading] = useState(null);

  // Room update states
  const [showRoomUpdateModal, setShowRoomUpdateModal] = useState(false);
  const [roomUpdateLoading, setRoomUpdateLoading] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    price: '',
    area: '',
    roomStatus: 0
  });

  // Amenity management states
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [amenityUpdateLoading, setAmenityUpdateLoading] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    if (activeTab === "utilities" && user?.id) {
      console.log('🔄 User loaded, fetching utility data for user:', user.id);
      fetchUtilityData();
    }
    if (activeTab === "room") {
      console.log('🔄 Loading amenities for Room Information tab, activeTab:', activeTab);
      fetchRoomAmenities();
    } else {
      console.log('ℹ️ Not loading amenities, activeTab is:', activeTab);
    }
  }, [roomId, activeTab, user?.id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const data = await roomService.getById(roomId);
      setRoomDetails(data);
    } catch (err) {
      console.error("Failed to fetch room details:", err);
      setError("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAmenities = async () => {
    try {
      setAmenitiesLoading(true);
      console.log("🔄 Fetching amenities for room:", roomId);
      console.log("🔄 RoomId type:", typeof roomId, "Value:", roomId);
      
      // Fetch room amenities first
      console.log("📡 Calling roomAmenityService.getAllRoomAmenities...");
      console.log("📡 Will call: /api/RoomAmenity/ByRoomId/" + roomId);
      const roomAmenitiesData = await roomAmenityService.getAllRoomAmenities(roomId);
      console.log("📡 Room amenities API response:", roomAmenitiesData);
      
      // Fetch all amenities 
      console.log("📡 Calling amenityService.getAllAmenities...");
      console.log("📡 Will call: /api/Amenity");
      const allAmenitiesData = await amenityService.getAllAmenities();
      console.log("📡 All amenities API response:", allAmenitiesData);
      
      console.log("📋 Room amenities fetched:", roomAmenitiesData);
      console.log("📋 All amenities fetched:", allAmenitiesData);
      console.log("📋 Room amenities type:", typeof roomAmenitiesData, "Array:", Array.isArray(roomAmenitiesData));
      console.log("📋 All amenities type:", typeof allAmenitiesData, "Array:", Array.isArray(allAmenitiesData));
      
      const roomAmenitiesArray = Array.isArray(roomAmenitiesData) ? roomAmenitiesData : [];
      const allAmenitiesArray = Array.isArray(allAmenitiesData) ? allAmenitiesData : [];
      
      console.log("📋 Final roomAmenitiesArray:", roomAmenitiesArray);
      console.log("📋 Final allAmenitiesArray:", allAmenitiesArray);
      
      setRoomAmenities(roomAmenitiesArray);
      setAllAmenities(allAmenitiesArray);
    } catch (err) {
      console.error("❌ Failed to fetch room amenities:", err);
      setRoomAmenities([]);
      setAllAmenities([]);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  const fetchUtilityData = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available for fetching utility data');
      return;
    }
    
    try {
      setUtilityLoading(true);
      console.log('🔄 Starting fetchUtilityData for roomId:', roomId, 'userId:', user.id);
      
      // Fetch utility rates for owner
      console.log('🔄 Fetching utility rates...');
      const rates = await utilityService.getUtilityRatesByOwnerId(user.id);
      console.log('✅ Utility rates received:', rates);
      console.log('✅ Utility rates type:', typeof rates, 'Array:', Array.isArray(rates));
      setUtilityRates(rates || []);
      
      // Fetch utility readings for this room
      console.log('🔄 Fetching utility readings...');
      const readings = await utilityService.getUtilityReadingsByRoomId(roomId);
      console.log('📊 Raw readings response:', readings);
      
      // Handle response format - should be an array now
      let processedReadings = [];
      if (Array.isArray(readings)) {
        processedReadings = readings;
      } else if (readings?.value && Array.isArray(readings.value)) {
        processedReadings = readings.value;
      } else if (readings?.data && Array.isArray(readings.data)) {
        processedReadings = readings.data;
      }
      
      setUtilityReadings(processedReadings);
      console.log('📊 Processed readings set to state:', processedReadings);
      
      // Get last readings for each utility type to show in form
      if (Array.isArray(processedReadings)) {
        // Sort by reading date descending and get latest for each type
        // UtilityReadingAPI enum: Water = 0, Electric = 1
        const electricReadings = processedReadings.filter(r => utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 1).sort((a, b) => new Date(b.readingDate || b.ReadingDate) - new Date(a.readingDate || a.ReadingDate));
        const waterReadings = processedReadings.filter(r => utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 0).sort((a, b) => new Date(b.readingDate || b.ReadingDate) - new Date(a.readingDate || a.ReadingDate));
        
        setLastReadings({
          electric: electricReadings.length > 0 ? electricReadings[0] : null,
          water: waterReadings.length > 0 ? waterReadings[0] : null
        });
        
        console.log('📊 Last readings set:', {
          electric: electricReadings.length > 0 ? electricReadings[0] : null,
          water: waterReadings.length > 0 ? waterReadings[0] : null
        });
      }
      
      console.log('✅ fetchUtilityData completed successfully');
      
    } catch (err) {
      console.error("❌ Failed to fetch utility data:", err);
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Set empty arrays as fallback
      setUtilityReadings([]);
      setLastReadings({ electric: null, water: null });
      
      // Only show error to user for non-404 errors
      if (err.response?.status !== 404) {
        console.error("🚨 Non-404 error occurred, might need attention");
      }
    } finally {
      setUtilityLoading(false);
    }
  };

  // Rate management functions
  const validateRateForm = () => {
    if (!rateFormData.unitPrice) {
      alert("Please enter unit price");
      return false;
    }
    
    if (parseFloat(rateFormData.unitPrice) <= 0) {
      alert("Unit price must be greater than 0");
      return false;
    }
    
    if (typeof rateFormData.utilityType !== 'number') {
      alert("Please select utility type");
      return false;
    }
    
    return true;
  };

  const handleCreateRate = async () => {
    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    if (!validateRateForm()) {
      return;
    }

    try {
      setRateFormLoading(true);
      
      const rateData = {
        ownerId: user.id,
        utilityType: parseInt(rateFormData.utilityType),
        unitPrice: parseFloat(rateFormData.unitPrice),
        description: rateFormData.description || `${utilityService.getUtilityTypeLabel(rateFormData.utilityType)} rate`
      };

      console.log("🔄 Creating rate with data:", rateData);
      console.log("🔍 Raw form data:", rateFormData);
      console.log("🔍 User ID:", user.id);
      console.log("🔍 Form validation passed:", validateRateForm());
      
      await utilityService.createUtilityRate(rateData);
      
      // Reset form and close modal
      setRateFormData({ utilityType: 0, unitPrice: '', description: '' }); // Reset to Water (0)
      setShowRateModal(false);
      
      // Refresh data
      await fetchUtilityData();
      
      alert("Utility rate created successfully!");
    } catch (error) {
      console.error("❌ Error creating rate:", error);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      // Show detailed error message
      let errorMessage = "Failed to create utility rate: ";
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage += validationErrors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message || "Unknown error";
      }
      
      alert(errorMessage);
    } finally {
      setRateFormLoading(false);
    }
  };

  const handleUpdateRate = async () => {
    if (!editingRate) return;

    try {
      setRateFormLoading(true);
      
      const rateData = {
        utilityType: parseInt(rateFormData.utilityType),
        unitPrice: parseFloat(rateFormData.unitPrice),
        description: rateFormData.description
      };

      await utilityService.updateUtilityRate(editingRate.id, rateData);
      
      // Reset form and close modal
      setRateFormData({ utilityType: 1, unitPrice: '', description: '' });
      setEditingRate(null);
      setShowRateModal(false);
      
      // Refresh data
      await fetchUtilityData();
      
      alert("Utility rate updated successfully!");
    } catch (error) {
      console.error("Error updating rate:", error);
      alert("Failed to update utility rate: " + (error.message || error));
    } finally {
      setRateFormLoading(false);
    }
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      utilityType: utilityService.convertUtilityTypeFromRateAPI(rate.type || rate.Type || rate.utilityType),
      unitPrice: (rate.price || rate.Price || rate.unitPrice).toString(),
      description: rate.description || ''
    });
    setShowRateModal(true);
  };

  const handleCloseRateModal = () => {
    setShowRateModal(false);
    setEditingRate(null);
    setRateFormData({ utilityType: 0, unitPrice: '', description: '' }); // Reset to Water (0)
  };

  // Reading management functions
  const handleCreateReading = async () => {
    try {
      setReadingFormLoading(true);
      
      const readingData = {
        type: parseInt(readingFormData.type),
        price: parseFloat(readingFormData.price),
        currentIndex: parseFloat(readingFormData.currentIndex),
        note: readingFormData.note || ''
      };

      console.log("Creating reading for room:", roomId, readingData);
      await utilityService.createUtilityReading(roomId, readingData);
      
      // Reset form and close modal
      setReadingFormData({
        type: 0,
        price: '',
        currentIndex: '',
        note: ''
      });
      setShowReadingModal(false);
      
      // Refresh data
      await fetchUtilityData();
      
      alert("Utility reading added successfully!");
    } catch (error) {
      console.error("Error creating reading:", error);
      alert("Failed to add utility reading: " + (error.message || error));
    } finally {
      setReadingFormLoading(false);
    }
  };

  const handleUpdateReading = async () => {
    if (!editingReading) return;

    try {
      setReadingFormLoading(true);
      
      const readingData = {
        type: parseInt(readingFormData.type),
        price: parseFloat(readingFormData.price),
        currentIndex: parseFloat(readingFormData.currentIndex),
        note: readingFormData.note || ''
      };

      console.log("Updating reading:", editingReading.id, readingData);
      await utilityService.updateUtilityReading(editingReading.id, readingData);
      
      // Reset form and close modal
      setReadingFormData({
        type: 0,
        price: '',
        currentIndex: '',
        note: ''
      });
      setEditingReading(null);
      setShowReadingModal(false);
      
      // Refresh data
      await fetchUtilityData();
      
      alert("Utility reading updated successfully!");
    } catch (error) {
      console.error("Error updating reading:", error);
      alert("Failed to update utility reading: " + (error.message || error));
    } finally {
      setReadingFormLoading(false);
    }
  };

  const handleEditReading = (reading) => {
    setEditingReading(reading);
    setReadingFormData({
      type: utilityService.getUtilityTypeFromResponse(reading.type || reading.Type),
      price: (reading.price || reading.Price || 0).toString(),
      currentIndex: (reading.currentIndex || reading.CurrentIndex || 0).toString(),
      note: reading.note || reading.Note || ''
    });
    setShowReadingModal(true);
  };

  const handleDeleteReading = async (readingId) => {
    if (!confirm("Are you sure you want to delete this utility reading? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("Deleting reading:", readingId);
      await utilityService.deleteUtilityReading(readingId);
      
      // Refresh data
      await fetchUtilityData();
      
      alert("Utility reading deleted successfully!");
    } catch (error) {
      console.error("Error deleting reading:", error);
      alert("Failed to delete utility reading: " + (error.message || error));
    }
  };

  const handleCloseReadingModal = () => {
    setShowReadingModal(false);
    setEditingReading(null);
    setReadingFormData({
      type: 0,
      price: '',
      currentIndex: '',
      note: ''
    });
  };

  // Room management functions
  const handleEditRoom = async () => {
    if (roomDetails) {
      setRoomFormData({
        price: (roomDetails.price || 0).toString(),
        area: (roomDetails.area || 0).toString(),
        roomStatus: roomDetails.roomStatus || 0
      });

      // Also load current amenities for the room
      try {
        const currentRoomAmenities = roomAmenities.map(ra => ra.amenityId);
        setSelectedAmenities(currentRoomAmenities);
      } catch (error) {
        console.error("❌ Error loading amenities for room update:", error);
        setSelectedAmenities([]);
      }

      setShowRoomUpdateModal(true);
    }
  };

  const handleUpdateRoom = async () => {
    try {
      setRoomUpdateLoading(true);
      
      // Step 1: Update room details (only fields supported by backend)
      const updateData = {
        price: parseFloat(roomFormData.price),
        area: parseFloat(roomFormData.area),
        roomStatus: parseInt(roomFormData.roomStatus)
      };

      console.log('🔄 Updating room:', roomId, updateData);
      await roomService.update(roomId, updateData);
      
      // Step 2: Update amenities
      console.log('🔄 Updating amenities...');
      const currentAmenityIds = roomAmenities.map(ra => ra.amenityId);
      
      // Find amenities to add (in selected but not in current)
      const amenitiesToAdd = selectedAmenities.filter(id => 
        !currentAmenityIds.includes(id)
      );
      
      // Find amenities to remove (in current but not in selected)  
      const roomAmenitiesToRemove = roomAmenities.filter(ra => 
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
      
      // Refresh data
      await fetchRoomDetails();
      await fetchRoomAmenities();
      
      // Close modal
      setShowRoomUpdateModal(false);
      
      alert(`Room updated successfully! Amenities: Added ${amenitiesToAdd.length}, Removed ${roomAmenitiesToRemove.length}`);
      
    } catch (error) {
      console.error("❌ Error updating room:", error);
      alert("Failed to update room: " + (error.message || error));
    } finally {
      setRoomUpdateLoading(false);
    }
  };

  const handleCloseRoomUpdateModal = () => {
    setShowRoomUpdateModal(false);
    setRoomFormData({
      price: '',
      area: '',
      roomStatus: 0
    });
    setSelectedAmenities([]);
  };

  // Amenity management functions
  const handleManageAmenities = async () => {
    try {
      console.log("🎯 Opening amenity management modal");
      
      // Get current room amenities
      const currentRoomAmenities = roomAmenities.map(ra => ra.amenityId);
      setSelectedAmenities(currentRoomAmenities);
      
      // Calculate available amenities (all amenities not currently assigned)
      const available = allAmenities.filter(amenity => 
        !currentRoomAmenities.includes(amenity.id)
      );
      setAvailableAmenities(available);
      
      setShowAmenityModal(true);
    } catch (error) {
      console.error("❌ Error opening amenity management:", error);
      alert("Failed to load amenities: " + (error.message || error));
    }
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

  const handleSaveAmenities = async () => {
    try {
      setAmenityUpdateLoading(true);
      console.log("🔄 Saving amenities for room:", roomId);
      
      // Get current room amenity IDs
      const currentAmenityIds = roomAmenities.map(ra => ra.amenityId);
      console.log("📋 Current amenities:", currentAmenityIds);
      console.log("📋 Selected amenities:", selectedAmenities);
      
      // Find amenities to add (in selected but not in current)
      const amenitiesToAdd = selectedAmenities.filter(id => 
        !currentAmenityIds.includes(id)
      );
      
      // Find amenities to remove (in current but not in selected)  
      const roomAmenitiesToRemove = roomAmenities.filter(ra => 
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
      
      // Refresh amenities
      await fetchRoomAmenities();
      
      setShowAmenityModal(false);
      alert(`Amenities updated successfully! Added: ${amenitiesToAdd.length}, Removed: ${roomAmenitiesToRemove.length}`);
      
    } catch (error) {
      console.error("❌ Error updating amenities:", error);
      alert("Failed to update amenities: " + (error.message || error));
    } finally {
      setAmenityUpdateLoading(false);
    }
  };

  const handleCloseAmenityModal = () => {
    setShowAmenityModal(false);
    setSelectedAmenities([]);
    setAvailableAmenities([]);
  };

  const tabs = [
    { 
      id: "room", 
      label: "Room Info", 
      icon: "🏠",
      description: "Manage room details"
    },
    { 
      id: "utilities", 
      label: "Utilities", 
      icon: "⚡",
      description: "Manage electricity and water"
    },
    { 
      id: "tenants", 
      label: "Tenants", 
      icon: "👥",
      description: "Manage room tenants"
    },
    { 
      id: "maintenance", 
      label: "Maintenance", 
      icon: "🔧",
      description: "Track repairs and maintenance"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading room dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/owner/rooms?houseId=${houseId}&houseName=${encodeURIComponent(houseName || '')}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-flex items-center"
              >
                ← Back to Rooms
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🏠 {roomName || 'Room'} Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {houseName && `${houseName} • `}Manage all aspects of this room
              </p>
            </div>
            
            {/* Room Status Badge */}
            {roomDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">Room Status</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {roomDetails.roomStatus === 0 ? "🟢 Available" : 
                   roomDetails.roomStatus === 1 ? "🔴 Occupied" : 
                   roomDetails.roomStatus === 2 ? "🟡 Maintenance" : "Unknown"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {roomDetails.price?.toLocaleString()} VND/month • {roomDetails.area}m²
                </div>
              </div>
            )
            }
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {activeTab === "room" && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🏠 Room Information
                  </h2>
                  <Link
                    href={`/owner/rooms/${roomId}/edit?houseId=${searchParams.get('houseId')}&houseName=${encodeURIComponent(searchParams.get('houseName') || '')}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    ✏️ Edit Room
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Details Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                    📋 Room Details
                  </h3>
                  {roomDetails ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Name:</span>
                        <span className="text-blue-900 dark:text-blue-100 font-semibold">{roomDetails.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Price:</span>
                        <span className="text-blue-900 dark:text-blue-100 font-bold">{roomDetails.price?.toLocaleString()} VNĐ/month</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Area:</span>
                        <span className="text-blue-900 dark:text-blue-100">{roomDetails.area} m²</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Max Occupants:</span>
                        <span className="text-blue-900 dark:text-blue-100">{roomDetails.maxOccupants || 1} people</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          roomDetails.roomStatus === 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          roomDetails.roomStatus === 1 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {roomDetails.roomStatus === 0 ? "🟢 Available" : 
                           roomDetails.roomStatus === 1 ? "🔴 Occupied" : 
                           "🟡 Maintenance"}
                        </span>
                      </div>
                      {roomDetails.description && (
                        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                          <span className="text-blue-700 dark:text-blue-300 font-medium block mb-2">Description:</span>
                          <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{roomDetails.description}</p>
                        </div>
                      )}
                      
                      {/* Amenities Section */}
                      <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
                        <span className="text-blue-700 dark:text-blue-300 font-medium block mb-3">🏷️ Amenities:</span>
                        

                        
                        {amenitiesLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600 dark:text-blue-400 text-sm">Loading amenities...</span>
                          </div>
                        ) : roomAmenities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {roomAmenities.slice(0, 6).map((roomAmenity) => {
                              const amenity = allAmenities.find(a => a.id === roomAmenity.amenityId);
                              return amenity ? (
                                <span
                                  key={roomAmenity.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {amenity.amenityName || amenity.name}
                                </span>
                              ) : null;
                            })}
                            {roomAmenities.length > 6 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                +{roomAmenities.length - 6} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm italic">No amenities selected</span>
                        )}
                      </div>
                      
                      
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
                      <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
                      <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-2/3"></div>
                    </div>
                  )}
                </div>


              </div>
            </div>
          )}

          {activeTab === "utilities" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ⚡ Utility Management
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage electricity and water consumption, set rates, and track billing for this room.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowReadingModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    📊 Add Reading
                  </button>
                </div>
              </div>

              {utilityLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading utility data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Billing Summary - Full Width */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                      📋 Monthly Billing Summary
                    </h3>
                    
                    {/* Current Month Bills */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-3">
                        {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })} Bills
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Electric Bill */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">⚡ Electricity</span>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const currentMonth = new Date().getMonth();
                                const currentYear = new Date().getFullYear();
                                const monthlyElectric = utilityReadings.filter(r => {
                                  const readingDate = new Date(r.readingDate || r.ReadingDate);
                                  return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 1 &&
                                         readingDate.getMonth() === currentMonth &&
                                         readingDate.getFullYear() === currentYear;
                                });
                                return monthlyElectric.length;
                              })()} readings
                            </span>
                          </div>
                          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyElectric = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 1 &&
                                       readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              const totalElectric = monthlyElectric.reduce((sum, r) => {
                                const total = r.total || r.Total || 0;
                                const consumption = r.consumption || r.Consumption || 0;
                                const price = r.price || r.Price || 0;
                                // If total is 0 but we have consumption and price, calculate it
                                const calculatedTotal = total > 0 ? total : (consumption * price);
                                return sum + calculatedTotal;
                              }, 0);
                              return totalElectric.toLocaleString('vi-VN');
                            })()} VNĐ
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyElectric = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 1 &&
                                       readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              const totalConsumption = monthlyElectric.reduce((sum, r) => sum + (r.consumption || r.Consumption || 0), 0);
                              return totalConsumption.toFixed(2);
                            })()} kWh total
                          </div>
                        </div>

                        {/* Water Bill */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">💧 Water</span>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const currentMonth = new Date().getMonth();
                                const currentYear = new Date().getFullYear();
                                const monthlyWater = utilityReadings.filter(r => {
                                  const readingDate = new Date(r.readingDate || r.ReadingDate);
                                  return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 0 &&
                                         readingDate.getMonth() === currentMonth &&
                                         readingDate.getFullYear() === currentYear;
                                });
                                return monthlyWater.length;
                              })()} readings
                            </span>
                          </div>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyWater = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 0 &&
                                       readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              const totalWater = monthlyWater.reduce((sum, r) => {
                                const total = r.total || r.Total || 0;
                                const consumption = r.consumption || r.Consumption || 0;
                                const price = r.price || r.Price || 0;
                                // If total is 0 but we have consumption and price, calculate it
                                const calculatedTotal = total > 0 ? total : (consumption * price);
                                return sum + calculatedTotal;
                              }, 0);
                              return totalWater.toLocaleString('vi-VN');
                            })()} VNĐ
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyWater = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return utilityService.getUtilityTypeFromResponse(r.type || r.Type) === 0 &&
                                       readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              const totalConsumption = monthlyWater.reduce((sum, r) => sum + (r.consumption || r.Consumption || 0), 0);
                              return totalConsumption.toFixed(2);
                            })()} m³ total
                          </div>
                        </div>

                        {/* Total Monthly Bill */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">💰 Monthly Total</span>
                            <span className="text-xs text-gray-500">This month</span>
                          </div>
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyReadings = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              const grandTotal = monthlyReadings.reduce((sum, r) => {
                                const total = r.total || r.Total || 0;
                                const consumption = r.consumption || r.Consumption || 0;
                                const price = r.price || r.Price || 0;
                                // If total is 0 but we have consumption and price, calculate it
                                const calculatedTotal = total > 0 ? total : (consumption * price);
                                return sum + calculatedTotal;
                              }, 0);
                              return grandTotal.toLocaleString('vi-VN');
                            })()} VNĐ
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const currentMonth = new Date().getMonth();
                              const currentYear = new Date().getFullYear();
                              const monthlyReadings = utilityReadings.filter(r => {
                                const readingDate = new Date(r.readingDate || r.ReadingDate);
                                return readingDate.getMonth() === currentMonth &&
                                       readingDate.getFullYear() === currentYear;
                              });
                              return monthlyReadings.length;
                            })()} total readings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Reading History */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📜 Complete Reading History
                </h3>
                {utilityReadings.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Previous
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Current
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Consumption
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Note
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {utilityReadings
                            .sort((a, b) => new Date(b.readingDate || b.ReadingDate) - new Date(a.readingDate || a.ReadingDate))
                            .map((reading) => (
                            <tr key={reading.id || reading.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(reading.readingDate || reading.ReadingDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  utilityService.getUtilityTypeFromResponse(reading.type || reading.Type) === 1 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {utilityService.getUtilityTypeFromResponse(reading.type || reading.Type) === 1 ? '⚡ Electric' : '💧 Water'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {(reading.previousIndex || reading.PreviousIndex || 0).toFixed(2)} {utilityService.getUtilityTypeUnit(utilityService.getUtilityTypeFromResponse(reading.type || reading.Type))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                {(reading.currentIndex || reading.CurrentIndex || 0).toFixed(2)} {utilityService.getUtilityTypeUnit(utilityService.getUtilityTypeFromResponse(reading.type || reading.Type))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                {(reading.consumption || reading.Consumption || 0).toFixed(2)} {utilityService.getUtilityTypeUnit(utilityService.getUtilityTypeFromResponse(reading.type || reading.Type))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {(reading.price || reading.Price || 0).toLocaleString('vi-VN')} VNĐ/{utilityService.getUtilityTypeUnit(utilityService.getUtilityTypeFromResponse(reading.type || reading.Type))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                                {(() => {
                                  const total = reading.total || reading.Total || 0;
                                  const consumption = reading.consumption || reading.Consumption || 0;
                                  const price = reading.price || reading.Price || 0;
                                  // If total is 0 but we have consumption and price, calculate it
                                  const calculatedTotal = total > 0 ? total : (consumption * price);
                                  return calculatedTotal.toLocaleString('vi-VN');
                                })()} VNĐ
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {(reading.note || reading.Note || '').slice(0, 30)}{(reading.note || reading.Note || '').length > 30 ? '...' : ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditReading(reading)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="Edit reading"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReading(reading.id || reading.Id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete reading"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reading History</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start tracking utility consumption by adding your first meter reading.
                    </p>
                    <button 
                      onClick={() => setShowReadingModal(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📊 Add First Reading
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tenants" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                👥 Tenant Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage tenants currently residing in this room.
              </p>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-gray-500">Tenant management feature coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🔧 Maintenance Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Track repairs, maintenance requests, and room condition.
              </p>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-gray-500">Maintenance tracking feature coming soon...</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Utility Rate Setting Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingRate ? 'Edit Utility Rate' : 'Set Utility Rate'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingRate ? 'Update pricing for utilities' : 'Configure pricing for room utilities'}
                </p>
              </div>
              <button
                onClick={handleCloseRateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                disabled={rateFormLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Utility Type *
                </label>
                <select
                  value={rateFormData.utilityType}
                  onChange={(e) => setRateFormData({
                    ...rateFormData,
                    utilityType: parseInt(e.target.value)
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                  disabled={rateFormLoading}
                >
                  <option value={0}>💧 Water (m³)</option>
                  <option value={1}>⚡ Electric (kWh)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (VND) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rateFormData.unitPrice}
                  onChange={(e) => setRateFormData({
                    ...rateFormData,
                    unitPrice: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                  placeholder="Enter price per unit (e.g., 3500)"
                  disabled={rateFormLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Price per {rateFormData.utilityType == 1 ? 'kWh for electricity' : 'm³ for water'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={rateFormData.description}
                  onChange={(e) => setRateFormData({
                    ...rateFormData,
                    description: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                  rows="3"
                  placeholder="Optional description about this rate..."
                  disabled={rateFormLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseRateModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={rateFormLoading}
              >
                Cancel
              </button>
              <button
                onClick={editingRate ? handleUpdateRate : handleCreateRate}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={rateFormLoading || !rateFormData.unitPrice || parseFloat(rateFormData.unitPrice) <= 0}
              >
                {rateFormLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  editingRate ? 'Update Rate' : 'Create Rate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Utility Reading Modal */}
      {showReadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingReading ? 'Edit Utility Reading' : 'Add Utility Reading'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingReading ? 'Update meter reading information' : 'Record monthly meter readings for billing calculation'}
                </p>
              </div>
              <button
                onClick={handleCloseReadingModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                disabled={readingFormLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Utility Type *
                </label>
                <select
                  value={readingFormData.type}
                  onChange={(e) => setReadingFormData({
                    ...readingFormData,
                    type: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                  disabled={readingFormLoading}
                >
                  <option value={0}>💧 Water Meter</option>
                  <option value={1}>⚡ Electric Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price * <span className="text-gray-500">(VND per {readingFormData.type == 1 ? 'kWh' : 'm³'})</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={readingFormData.price}
                  onChange={(e) => setReadingFormData({
                    ...readingFormData,
                    price: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                  placeholder={`Enter price per ${readingFormData.type == 1 ? 'kWh' : 'm³'}`}
                  disabled={readingFormLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current market price for {readingFormData.type == 1 ? 'electricity' : 'water'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Previous Index <span className="text-gray-500">(Auto-calculated)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(() => {
                      const currentType = parseInt(readingFormData.type);
                      // UtilityReadingAPI enum: Water = 0, Electric = 1
                      const lastReading = currentType === 1 ? lastReadings.electric : lastReadings.water;
                      return lastReading ? (lastReading.currentIndex || lastReading.CurrentIndex || 0).toString() : "0";
                    })()}
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-calculated from last reading"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Based on the last recorded reading for this utility type
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Index *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={readingFormData.currentIndex}
                    onChange={(e) => setReadingFormData({
                      ...readingFormData,
                      currentIndex: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                    placeholder="Enter current meter reading"
                    disabled={readingFormLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the current reading from your {readingFormData.type == 1 ? 'electric' : 'water'} meter
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price * <span className="text-gray-500">({readingFormData.type == 1 ? 'VNĐ/kWh' : 'VNĐ/m³'})</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={readingFormData.price}
                  onChange={(e) => setReadingFormData({
                    ...readingFormData,
                    price: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                  placeholder={`Enter price per ${readingFormData.type == 1 ? 'kWh' : 'm³'}`}
                  disabled={readingFormLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Price per unit for {readingFormData.type == 1 ? 'electricity' : 'water'} consumption
                </p>
              </div>

              {readingFormData.currentIndex && readingFormData.price && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Bill Calculation Preview</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Consumption:</span>
                      <span className="font-medium text-blue-800">
                        {(() => {
                          const currentType = parseInt(readingFormData.type);
                          // UtilityReadingAPI enum: Water = 0, Electric = 1
                          const lastReading = currentType === 1 ? lastReadings.electric : lastReadings.water;
                          const previousIndex = lastReading ? (lastReading.currentIndex || lastReading.CurrentIndex || 0) : 0;
                          const consumption = parseFloat(readingFormData.currentIndex) - previousIndex;
                          return consumption >= 0 ? consumption.toFixed(2) : "0.00";
                        })()} {readingFormData.type == 1 ? 'kWh' : 'm³'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Unit Price:</span>
                      <span className="font-medium text-blue-800">
                        {parseFloat(readingFormData.price || 0).toLocaleString('vi-VN')} VNĐ/{readingFormData.type == 1 ? 'kWh' : 'm³'}
                      </span>
                    </div>
                    
                    <div className="border-t border-blue-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Total Amount:</span>
                        <span className="text-lg font-bold text-blue-900">
                          {(() => {
                            const currentType = parseInt(readingFormData.type);
                            const lastReading = currentType === 1 ? lastReadings.electric : lastReadings.water;
                            const previousIndex = lastReading ? (lastReading.currentIndex || lastReading.CurrentIndex || 0) : 0;
                            const consumption = parseFloat(readingFormData.currentIndex) - previousIndex;
                            const price = parseFloat(readingFormData.price || 0);
                            const total = consumption >= 0 ? consumption * price : 0;
                            return total.toLocaleString('vi-VN');
                          })()} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-600 mt-3 bg-blue-100 rounded p-2">
                    <strong>Formula:</strong> Total = Consumption × Unit Price<br/>
                    Final calculation will be verified by the system when saved
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={readingFormData.note}
                  onChange={(e) => setReadingFormData({
                    ...readingFormData,
                    note: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-800"
                  rows="3"
                  placeholder="Optional note about this reading..."
                  disabled={readingFormLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseReadingModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={readingFormLoading}
              >
                Cancel
              </button>
              <button
                onClick={editingReading ? handleUpdateReading : handleCreateReading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={readingFormLoading || !readingFormData.currentIndex || !readingFormData.price}
              >
                {readingFormLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingReading ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingReading ? 'Update Reading' : 'Add Reading'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

          {activeTab === "tenants" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">👥 Tenant Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tenant management features will be implemented here.
              </p>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔧 Maintenance</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Maintenance tracking features will be implemented here.
              </p>
            </div>
          )}
      
      {/* Room Update Modal */}
      {showRoomUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ✏️ Update Room Information
                </h3>
                <button
                  onClick={handleCloseRoomUpdateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Update room price, area, status and manage amenities for this room.
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Room Status *
                  </label>
                  <select
                    value={roomFormData.roomStatus}
                    onChange={(e) => setRoomFormData({
                      ...roomFormData,
                      roomStatus: parseInt(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                    disabled={roomUpdateLoading}
                  >
                    <option value={0}>🟢 Available</option>
                    <option value={1}>🔴 Occupied</option>
                    <option value={2}>🟡 Maintenance</option>
                  </select>
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
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                    placeholder="Enter monthly rental price"
                    disabled={roomUpdateLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Area (m²) *
                  </label>
                  <input
                    type="number"
                    value={roomFormData.area}
                    onChange={(e) => setRoomFormData({
                      ...roomFormData,
                      area: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                    placeholder="Enter room area"
                    disabled={roomUpdateLoading}
                  />
                </div>
              </div>

              {/* Amenities Section */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  🏷️ Amenities
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Selected: {selectedAmenities.length} / {allAmenities.length} amenities
                </div>
                
                {allAmenities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {allAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-all ${
                          selectedAmenities.includes(amenity.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                        }`}
                        onClick={() => handleAmenityToggle(amenity.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedAmenities.includes(amenity.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {selectedAmenities.includes(amenity.id) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {amenity.amenityName || amenity.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No amenities available
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleCloseRoomUpdateModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                disabled={roomUpdateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoom}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={roomUpdateLoading || !roomFormData.price || !roomFormData.area}
              >
                {roomUpdateLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Room'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amenity Management Modal */}
      {showAmenityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🏷️ Manage Room Amenities
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select amenities for this room
                </p>
              </div>
              <button
                onClick={handleCloseAmenityModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {allAmenities.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Selected: {selectedAmenities.length} / {allAmenities.length} amenities
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedAmenities.includes(amenity.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                        }`}
                        onClick={() => handleAmenityToggle(amenity.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedAmenities.includes(amenity.id)
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
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No amenities available</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleCloseAmenityModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                disabled={amenityUpdateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAmenities}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={amenityUpdateLoading}
              >
                {amenityUpdateLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Amenities'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default function RoomDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RoomDashboardContent />
    </Suspense>
  );
}