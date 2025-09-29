"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Users, DollarSign, FileText, MapPin, User } from "lucide-react";
import contractService from "@/services/contractService";
import roomService from "@/services/roomService";

export default function CreateContractModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    tenantId: '',
    roomId: '',
    checkinDate: '',
    checkoutDate: '',
    depositAmount: '',
    numberOfOccupants: 1,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Load rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      console.log("🔄 CreateContractModal: Loading rooms...");
      const roomsData = await roomService.getRoomsByOwner();
      console.log("✅ CreateContractModal: Rooms loaded:", roomsData);
      setRooms(roomsData || []);
    } catch (error) {
      console.error("❌ Error loading rooms:", error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenantId.trim()) {
      newErrors.tenantId = 'Tenant ID is required';
    }
    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }
    if (!formData.checkinDate) {
      newErrors.checkinDate = 'Check-in date is required';
    }
    if (!formData.checkoutDate) {
      newErrors.checkoutDate = 'Check-out date is required';
    }
    if (!formData.depositAmount || formData.depositAmount < 0) {
      newErrors.depositAmount = 'Deposit amount must be >= 0';
    }
    if (!formData.numberOfOccupants || formData.numberOfOccupants < 1 || formData.numberOfOccupants > 9) {
      newErrors.numberOfOccupants = 'Number of occupants must be between 1 and 9';
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    // Date validation
    if (formData.checkinDate && formData.checkoutDate) {
      const checkin = new Date(formData.checkinDate);
      const checkout = new Date(formData.checkoutDate);
      if (checkout <= checkin) {
        newErrors.checkoutDate = 'Check-out date must be after check-in date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare data for API
      const contractData = {
        tenantId: formData.tenantId.trim(),
        roomId: formData.roomId,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        depositAmount: parseFloat(formData.depositAmount),
        numberOfOccupants: parseInt(formData.numberOfOccupants),
        notes: formData.notes?.trim() || null
      };
      
      await contractService.create(contractData);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Error creating contract:", error);
      alert("Error creating contract: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tenantId: '',
      roomId: '',
      checkinDate: '',
      checkoutDate: '',
      depositAmount: '',
      numberOfOccupants: 1,
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const getSelectedRoom = () => {
    return rooms.find(room => {
      const roomId = room.Id || room.id;
      return roomId === formData.roomId;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Contract
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fill in the contract details below
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tenant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Tenant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              placeholder="Enter tenant ID or email"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                errors.tenantId 
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              } text-gray-900 dark:text-white`}
            />
            {errors.tenantId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.tenantId}
              </p>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Room <span className="text-red-500">*</span>
            </label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleInputChange}
              disabled={loadingRooms}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                errors.roomId 
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              } text-gray-900 dark:text-white`}
            >
              <option value="">
                {loadingRooms ? "Loading rooms..." : "Select a room"}
              </option>
              {rooms.map(room => {
                console.log("🚪 Rendering room option:", room);
                const roomId = room.Id || room.id;
                const roomName = room.RoomName || room.roomName || room.name || `Room ${roomId}`;
                const roomPrice = room.Price || room.price || 0;
                const houseName = room.houseName || room.HouseName || 'Unknown House';
                
                return (
                  <option key={roomId} value={roomId}>
                    {roomName}
                  </option>
                );
              })}
            </select>
            {errors.roomId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.roomId}
              </p>
            )}
            {/* {formData.roomId && getSelectedRoom() && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{getSelectedRoom().RoomName || getSelectedRoom().roomName || getSelectedRoom().name || 'Room'}</strong> - {getSelectedRoom().houseName || getSelectedRoom().HouseName || 'House'}
                  <br />
                  Price: <strong>${getSelectedRoom().Price || getSelectedRoom().price || 0}/month</strong>
                  <br />
                  Address: <strong>{getSelectedRoom().houseAddress || 'N/A'}</strong>
                </p>
              </div>
            )} */}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="checkinDate"
                value={formData.checkinDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.checkinDate 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
              />
              {errors.checkinDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.checkinDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Check-out Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="checkoutDate"
                value={formData.checkoutDate}
                onChange={handleInputChange}
                min={formData.checkinDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.checkoutDate 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
              />
              {errors.checkoutDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.checkoutDate}
                </p>
              )}
            </div>
          </div>

          {/* Deposit Amount & Number of Occupants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Deposit Amount (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.depositAmount 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
              />
              {errors.depositAmount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.depositAmount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Number of Occupants <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfOccupants"
                value={formData.numberOfOccupants}
                onChange={handleInputChange}
                min="1"
                max="9"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                  errors.numberOfOccupants 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
              />
              {errors.numberOfOccupants && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.numberOfOccupants}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              placeholder="Additional notes or terms..."
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-none ${
                errors.notes 
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              } text-gray-900 dark:text-white`}
            />
            <div className="mt-1 flex justify-between">
              {errors.notes ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.notes}
                </p>
              ) : (
                <div />
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.notes.length}/500 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
            >
              {loading ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}