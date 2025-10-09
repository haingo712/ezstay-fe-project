"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Users, DollarSign, FileText, MapPin, User, ArrowRight, ArrowLeft, Upload, Zap, Droplet } from "lucide-react";
import contractService from "@/services/contractService";
import roomService from "@/services/roomService";
import AddressSelector from "./AddressSelector";

export default function CreateContractModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Contract Info, 2-N: Profiles, Final: Utilities
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  // Contract basic info
  const [contractData, setContractData] = useState({
    roomId: '',
    checkinDate: '',
    checkoutDate: '',
    depositAmount: 0,
    numberOfOccupants: 1,
    notes: '',
    electricityReading: {
      price: null,
      note: '',
      currentIndex: 0
    },
    waterReading: {
      price: null,
      note: '',
      currentIndex: 0
    }
  });

  // Profiles array (người phụ thuộc)
  const [profiles, setProfiles] = useState([{
    userId: null,
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    provinceId: '',
    wardId: '',
    address: '',
    temporaryResidence: '',
    citizenIdNumber: '',
    citizenIdIssuedDate: '',
    citizenIdIssuedPlace: '',
    notes: '',
    avatarUrl: '',
    frontImageUrl: '',
    backImageUrl: ''
  }]);

  const [errors, setErrors] = useState({});

  // Load rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRooms();
      resetForm();
    }
  }, [isOpen]);

  // Update profiles array when numberOfOccupants changes
  useEffect(() => {
    const count = parseInt(contractData.numberOfOccupants) || 1;
    if (profiles.length < count) {
      // Add more profiles
      const newProfiles = [...profiles];
      for (let i = profiles.length; i < count; i++) {
        newProfiles.push({
          userId: null,
          fullName: '',
          dateOfBirth: '',
          phoneNumber: '',
          email: '',
          provinceId: '',
          wardId: '',
          address: '',
          temporaryResidence: '',
          citizenIdNumber: '',
          citizenIdIssuedDate: '',
          citizenIdIssuedPlace: '',
          notes: '',
          avatarUrl: '',
          frontImageUrl: '',
          backImageUrl: ''
        });
      }
      setProfiles(newProfiles);
    } else if (profiles.length > count) {
      // Remove excess profiles
      setProfiles(profiles.slice(0, count));
    }
  }, [contractData.numberOfOccupants]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const roomsData = await roomService.getRoomsByOwner();
      setRooms(roomsData || []);
    } catch (error) {
      console.error("❌ Error loading rooms:", error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const resetForm = () => {
    setContractData({
      roomId: '',
      checkinDate: '',
      checkoutDate: '',
      depositAmount: 0,
      numberOfOccupants: 1,
      notes: '',
      electricityReading: { price: null, note: '', currentIndex: 0 },
      waterReading: { price: null, note: '', currentIndex: 0 }
    });
    setProfiles([{
      userId: null,
      fullName: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      provinceId: '',
      wardId: '',
      address: '',
      temporaryResidence: '',
      citizenIdNumber: '',
      citizenIdIssuedDate: '',
      citizenIdIssuedPlace: '',
      notes: '',
      avatarUrl: '',
      frontImageUrl: '',
      backImageUrl: ''
    }]);
    setCurrentStep(1);
    setCurrentProfileIndex(0);
    setErrors({});
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!contractData.roomId) newErrors.roomId = 'Please select a room';
    if (!contractData.checkinDate) newErrors.checkinDate = 'Check-in date is required';
    if (!contractData.checkoutDate) newErrors.checkoutDate = 'Check-out date is required';
    if (contractData.depositAmount < 0) newErrors.depositAmount = 'Deposit must be >= 0';
    if (contractData.numberOfOccupants < 1 || contractData.numberOfOccupants > 9) {
      newErrors.numberOfOccupants = 'Must be between 1-9';
    }
    
    if (contractData.checkinDate && contractData.checkoutDate) {
      const checkin = new Date(contractData.checkinDate);
      const checkout = new Date(contractData.checkoutDate);
      if (checkout <= checkin) {
        newErrors.checkoutDate = 'Check-out must be after check-in';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfile = (profile) => {
    const newErrors = {};
    if (!profile.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!profile.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!profile.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!profile.provinceId) newErrors.provinceId = 'Province is required';
    if (!profile.wardId) newErrors.wardId = 'Ward is required';
    if (!profile.address.trim()) newErrors.address = 'Address is required';
    if (!profile.temporaryResidence.trim()) newErrors.temporaryResidence = 'Temporary residence is required';
    if (!profile.citizenIdNumber.trim()) newErrors.citizenIdNumber = 'Citizen ID is required';
    if (!profile.citizenIdIssuedDate) newErrors.citizenIdIssuedDate = 'Issue date is required';
    if (!profile.citizenIdIssuedPlace.trim()) newErrors.citizenIdIssuedPlace = 'Issue place is required';
    if (!profile.frontImageUrl.trim()) newErrors.frontImageUrl = 'Front image URL is required';
    if (!profile.backImageUrl.trim()) newErrors.backImageUrl = 'Back image URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUtilities = () => {
    const newErrors = {};
    if (contractData.electricityReading.currentIndex < 0) {
      newErrors.electricityIndex = 'Must be >= 0';
    }
    if (contractData.waterReading.currentIndex < 0) {
      newErrors.waterIndex = 'Must be >= 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      setCurrentProfileIndex(0);
    } else if (currentStep === 2) {
      // Validate current profile
      if (!validateProfile(profiles[currentProfileIndex])) return;
      
      if (currentProfileIndex < profiles.length - 1) {
        // Move to next profile
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        // All profiles done, move to utilities
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      // Back to last profile
      setCurrentStep(2);
      setCurrentProfileIndex(profiles.length - 1);
    } else if (currentStep === 2) {
      if (currentProfileIndex > 0) {
        setCurrentProfileIndex(currentProfileIndex - 1);
      } else {
        setCurrentStep(1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUtilities()) return;

    try {
      setLoading(true);
      
      const payload = {
        profilesInContract: profiles.map(p => ({
          userId: p.userId || null,
          fullName: p.fullName,
          dateOfBirth: new Date(p.dateOfBirth).toISOString(),
          phoneNumber: p.phoneNumber,
          email: p.email || null,
          provinceId: p.provinceId,
          wardId: p.wardId,
          address: p.address,
          temporaryResidence: p.temporaryResidence,
          citizenIdNumber: p.citizenIdNumber,
          citizenIdIssuedDate: new Date(p.citizenIdIssuedDate).toISOString(),
          citizenIdIssuedPlace: p.citizenIdIssuedPlace,
          notes: p.notes || null,
          avatarUrl: p.avatarUrl || null,
          frontImageUrl: p.frontImageUrl,
          backImageUrl: p.backImageUrl
        })),
        roomId: contractData.roomId,
        checkinDate: new Date(contractData.checkinDate).toISOString(),
        checkoutDate: new Date(contractData.checkoutDate).toISOString(),
        depositAmount: parseFloat(contractData.depositAmount),
        numberOfOccupants: parseInt(contractData.numberOfOccupants),
        notes: contractData.notes || null,
        electricityReading: {
          price: contractData.electricityReading.price ? parseFloat(contractData.electricityReading.price) : null,
          note: contractData.electricityReading.note || null,
          currentIndex: parseFloat(contractData.electricityReading.currentIndex)
        },
        waterReading: {
          price: contractData.waterReading.price ? parseFloat(contractData.waterReading.price) : null,
          note: contractData.waterReading.note || null,
          currentIndex: parseFloat(contractData.waterReading.currentIndex)
        }
      };

      console.log("📤 Creating contract:", payload);
      await contractService.create(payload);
      alert("Contract created successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("❌ Error creating contract:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field, value) => {
    const newProfiles = [...profiles];
    newProfiles[currentProfileIndex] = {
      ...newProfiles[currentProfileIndex],
      [field]: value
    };
    setProfiles(newProfiles);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (addressData) => {
    const newProfiles = [...profiles];
    newProfiles[currentProfileIndex] = {
      ...newProfiles[currentProfileIndex],
      provinceId: addressData.provinceCode?.toString() || '',
      wardId: addressData.wardCode?.toString() || '',
      address: addressData.address || ''
    };
    setProfiles(newProfiles);
  };

  if (!isOpen) return null;

  const currentProfile = profiles[currentProfileIndex];
  const totalSteps = 1 + profiles.length + 1; // Contract info + Profiles + Utilities
  const progressPercent = ((currentStep === 1 ? 1 : (currentStep === 2 ? 1 + currentProfileIndex + 1 : totalSteps)) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Contract
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Step Indicator */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {currentStep === 1 && "Step 1: Contract Information"}
            {currentStep === 2 && `Step 2: Profile ${currentProfileIndex + 1}/${profiles.length} ${currentProfileIndex === 0 ? '(Representative)' : ''}`}
            {currentStep === 3 && "Step 3: Utility Readings"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* STEP 1: Contract Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Information</h3>
              
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" /> Room *
                </label>
                <select
                  value={contractData.roomId}
                  onChange={(e) => setContractData({...contractData, roomId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loadingRooms}
                >
                  <option value="">Select a room</option>
                  {rooms.map(room => (
                    <option key={room.id || room.Id} value={room.id || room.Id}>
                      {room.roomName || room.RoomName} - {room.price || room.Price} VND
                    </option>
                  ))}
                </select>
                {errors.roomId && <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" /> Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={contractData.checkinDate}
                    onChange={(e) => setContractData({...contractData, checkinDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  {errors.checkinDate && <p className="text-red-500 text-sm mt-1">{errors.checkinDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" /> Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={contractData.checkoutDate}
                    onChange={(e) => setContractData({...contractData, checkoutDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  {errors.checkoutDate && <p className="text-red-500 text-sm mt-1">{errors.checkoutDate}</p>}
                </div>
              </div>

              {/* Deposit & Occupants */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" /> Deposit Amount (VND) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={contractData.depositAmount}
                    onChange={(e) => setContractData({...contractData, depositAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  {errors.depositAmount && <p className="text-red-500 text-sm mt-1">{errors.depositAmount}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="inline w-4 h-4 mr-1" /> Number of Occupants (1-9) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={contractData.numberOfOccupants}
                    onChange={(e) => setContractData({...contractData, numberOfOccupants: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  {errors.numberOfOccupants && <p className="text-red-500 text-sm mt-1">{errors.numberOfOccupants}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" /> Notes
                </label>
                <textarea
                  value={contractData.notes}
                  onChange={(e) => setContractData({...contractData, notes: e.target.value})}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Additional notes..."
                />
                <p className="text-sm text-gray-500 mt-1">{contractData.notes.length}/500</p>
              </div>
            </div>
          )}

          {/* STEP 2: Profile Forms */}
          {currentStep === 2 && currentProfile && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Profile {currentProfileIndex + 1} of {profiles.length}
                  {currentProfileIndex === 0 && <span className="ml-2 text-blue-600 dark:text-blue-400">(Representative)</span>}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentProfileIndex === 0 
                    ? "This person will be the main representative for the contract."
                    : "Additional occupant information."}
                </p>
              </div>

              {/* Profile Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={currentProfile.fullName}
                    onChange={(e) => updateProfile('fullName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={currentProfile.dateOfBirth}
                    onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={currentProfile.phoneNumber}
                    onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={currentProfile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Address Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <AddressSelector
                  value={{
                    provinceCode: currentProfile.provinceId,
                    wardCode: currentProfile.wardId,
                    address: currentProfile.address
                  }}
                  onChange={handleAddressChange}
                />
                {errors.provinceId && <p className="text-red-500 text-xs mt-1">{errors.provinceId}</p>}
                {errors.wardId && <p className="text-red-500 text-xs mt-1">{errors.wardId}</p>}
              </div>

              {/* Temporary Residence */}
              <div>
                <label className="block text-sm font-medium mb-1">Temporary Residence *</label>
                <input
                  type="text"
                  value={currentProfile.temporaryResidence}
                  onChange={(e) => updateProfile('temporaryResidence', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
                {errors.temporaryResidence && <p className="text-red-500 text-xs mt-1">{errors.temporaryResidence}</p>}
              </div>

              {/* Citizen ID */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Citizen ID Number *</label>
                  <input
                    type="text"
                    value={currentProfile.citizenIdNumber}
                    onChange={(e) => updateProfile('citizenIdNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.citizenIdNumber && <p className="text-red-500 text-xs mt-1">{errors.citizenIdNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={currentProfile.citizenIdIssuedDate}
                    onChange={(e) => updateProfile('citizenIdIssuedDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.citizenIdIssuedDate && <p className="text-red-500 text-xs mt-1">{errors.citizenIdIssuedDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Issue Place *</label>
                  <input
                    type="text"
                    value={currentProfile.citizenIdIssuedPlace}
                    onChange={(e) => updateProfile('citizenIdIssuedPlace', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  {errors.citizenIdIssuedPlace && <p className="text-red-500 text-xs mt-1">{errors.citizenIdIssuedPlace}</p>}
                </div>
              </div>

              {/* Image URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Upload className="inline w-4 h-4 mr-1" /> Front ID Image URL *
                  </label>
                  <input
                    type="url"
                    value={currentProfile.frontImageUrl}
                    onChange={(e) => updateProfile('frontImageUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="https://..."
                  />
                  {errors.frontImageUrl && <p className="text-red-500 text-xs mt-1">{errors.frontImageUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Upload className="inline w-4 h-4 mr-1" /> Back ID Image URL *
                  </label>
                  <input
                    type="url"
                    value={currentProfile.backImageUrl}
                    onChange={(e) => updateProfile('backImageUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="https://..."
                  />
                  {errors.backImageUrl && <p className="text-red-500 text-xs mt-1">{errors.backImageUrl}</p>}
                </div>
              </div>

              {/* Profile Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={currentProfile.notes}
                  onChange={(e) => updateProfile('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Utilities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Initial Utility Readings</h3>
              
              {/* Electricity */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" /> Electricity
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Index (kWh) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={contractData.electricityReading.currentIndex}
                      onChange={(e) => setContractData({
                        ...contractData,
                        electricityReading: {...contractData.electricityReading, currentIndex: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                    {errors.electricityIndex && <p className="text-red-500 text-xs mt-1">{errors.electricityIndex}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price (VND/kWh)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={contractData.electricityReading.price || ''}
                      onChange={(e) => setContractData({
                        ...contractData,
                        electricityReading: {...contractData.electricityReading, price: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Note</label>
                    <input
                      type="text"
                      value={contractData.electricityReading.note}
                      onChange={(e) => setContractData({
                        ...contractData,
                        electricityReading: {...contractData.electricityReading, note: e.target.value}
                      })}
                      maxLength={100}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Droplet className="w-5 h-5 mr-2 text-blue-500" /> Water
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Index (m³) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={contractData.waterReading.currentIndex}
                      onChange={(e) => setContractData({
                        ...contractData,
                        waterReading: {...contractData.waterReading, currentIndex: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                    {errors.waterIndex && <p className="text-red-500 text-xs mt-1">{errors.waterIndex}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price (VND/m³)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={contractData.waterReading.price || ''}
                      onChange={(e) => setContractData({
                        ...contractData,
                        waterReading: {...contractData.waterReading, price: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Note</label>
                    <input
                      type="text"
                      value={contractData.waterReading.note}
                      onChange={(e) => setContractData({
                        ...contractData,
                        waterReading: {...contractData.waterReading, note: e.target.value}
                      })}
                      maxLength={100}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 && currentProfileIndex === 0}
              className="flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Contract"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
