"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { boardingHouseAPI, roomAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import AddressSelector from "@/components/AddressSelector";
import vietnamAddressService from "@/services/vietnamAddressService";

export default function BoardingHousesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [houseData, setHouseData] = useState({ 
    houseName: '', 
    description: '',
    addressData: {
      provinceCode: null,
      provinceName: '',
      wardCode: null,
      wardName: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    if (!authLoading && isAuthenticated && user) {
      fetchBoardingHouses(); 
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchBoardingHouses = async () => {
    if (!user || !user.id) {
      console.log("❌ No user ID available for fetching boarding houses");
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🏠 Fetching boarding houses for user:", user.id, "Role:", user.role);
      console.log("📄 Full user object:", user);
      
      // Debug token info
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log("🔐 JWT Payload:", payload);
        } catch (e) {
          console.log("❌ Error parsing JWT:", e);
        }
      }
      
      const houses = await boardingHouseAPI.getByOwnerId(user.id);
      console.log("✅ Fetched boarding houses:", houses);
      
      const housesWithDetails = await Promise.all(houses.map(async (house) => {
        try { 
          const rooms = await roomAPI.getByHouseId(house.id); 
          const occupiedRooms = rooms.filter(r => r.roomStatus !== "Available").length; 
          return { ...house, totalRooms: rooms.length, occupiedRooms, vacantRooms: rooms.length - occupiedRooms }; 
        }
        catch (e) { 
          console.warn("Error fetching rooms for house:", house.id, e);
          return { ...house, totalRooms: 0, occupiedRooms: 0, vacantRooms: 0 }; 
        }
      }));
      setBoardingHouses(housesWithDetails);
    } catch (e) { 
      console.error("Error fetching boarding houses:", e); 
      setError("Unable to load boarding houses: " + (e.message || e)); 
    }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate house name (required, max 100 characters)
    if (!houseData.houseName.trim()) {
      errors.houseName = 'Boarding house name is required';
    } else if (houseData.houseName.length > 100) {
      errors.houseName = 'Boarding house name cannot exceed 100 characters';
    }
    
    // Validate address using the Vietnam address service
    const addressValidation = vietnamAddressService.validateAddress(houseData.addressData);
    if (!addressValidation.isValid) {
      Object.assign(errors, addressValidation.errors);
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      // Send data in format that backend expects
      const payload = { 
        ownerId: user.id, 
        houseName: houseData.houseName, 
        description: houseData.description,
        location: {
          provinceId: houseData.addressData.provinceCode?.toString() || '',
          provinceName: houseData.addressData.provinceName || '',
          communeId: houseData.addressData.wardCode?.toString() || '',
          communeName: houseData.addressData.wardName || '',
          addressDetail: houseData.addressData.address || ''
        }
      };
      console.log("📤 Creating boarding house with payload:", payload);
      const res = await boardingHouseAPI.create(payload);
      if (res && res.isSuccess !== false) { 
        alert('Boarding house created'); 
        setShowModal(false); 
        setHouseData({ 
          houseName: '', 
          description: '',
          addressData: {
            provinceCode: null,
            provinceName: '',
            wardCode: null,
            wardName: '',
            address: ''
          }
        }); 
        setFormErrors({});
        fetchBoardingHouses(); 
      }
      else alert('Create failed: ' + (res?.message || JSON.stringify(res)));
    } catch (e) { console.error(e); alert('API error creating boarding house: ' + (e.message || e)); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!editingHouse) return;
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      // Send data in format that backend expects
      const payload = { 
        houseName: houseData.houseName, 
        description: houseData.description,
        location: {
          provinceId: houseData.addressData.provinceCode?.toString() || '',
          provinceName: houseData.addressData.provinceName || '',
          communeId: houseData.addressData.wardCode?.toString() || '',
          communeName: houseData.addressData.wardName || '',
          addressDetail: houseData.addressData.address || ''
        }
      };
      const res = await boardingHouseAPI.update(editingHouse.id, payload);
      if (res && res.isSuccess !== false) { 
        alert('Boarding house updated'); 
        setShowModal(false); 
        setEditingHouse(null); 
        setHouseData({ 
          houseName: '', 
          description: '',
          addressData: {
            provinceCode: null,
            provinceName: '',
            wardCode: null,
            wardName: '',
            address: ''
          }
        }); 
        setFormErrors({});
        fetchBoardingHouses(); 
      }
      else alert('Update failed: ' + (res?.message || JSON.stringify(res)));
    } catch (e) { console.error(e); alert('API error updating boarding house: ' + (e.message || e)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (houseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà trọ này? Tất cả các phòng sẽ bị xóa nếu được phép.')) return;
    try {
      // Try to delete all rooms first (best effort)
      try {
        const rooms = await roomAPI.getByHouseId(houseId);
        if (Array.isArray(rooms) && rooms.length > 0) {
          for (const r of rooms) { try { await roomAPI.delete(r.id); } catch(e) { console.warn('room delete failed', e); } }
        }
      } catch (e) { console.warn('Could not list/delete rooms before house delete', e); }

      const res = await boardingHouseAPI.delete(houseId);
      if (res && res.isSuccess !== false) {
        alert('Xóa nhà trọ thành công!');
        fetchBoardingHouses();
        return;
      }
      // Check for specific backend error message
      const msg = res?.message || '';
      if (msg.includes('Không thể kiểm tra phòng') || msg.includes('phòng trong nhà trọ')) {
        if (window.confirm('Bạn cần xóa hết các phòng trong nhà trọ này trước khi xóa nhà trọ. Chuyển đến trang Quản lý phòng?')) {
          window.location.href = `/owner/rooms?houseId=${houseId}`;
        }
        return;
      }
      alert('Xóa nhà trọ thất bại: ' + msg);
    } catch (e) {
      console.error('Error deleting boarding house', e);
      const msg = e?.data?.message || e?.message || String(e);
      if (msg.includes('Không thể kiểm tra phòng') || msg.includes('phòng trong nhà trọ')) {
        if (window.confirm('Bạn cần xóa hết các phòng trong nhà trọ này trước khi xóa nhà trọ. Chuyển đến trang Quản lý phòng?')) {
          window.location.href = `/owner/rooms?houseId=${houseId}`;
        }
        return;
      }
      alert('Lỗi xóa nhà trọ: ' + msg);
    }
  };

  const handleEdit = (house) => { 
    setEditingHouse(house); 
    setHouseData({ 
      houseName: house.houseName || '', 
      description: house.description || '',
      addressData: {
        // Load existing data from backend location if available
        provinceCode: house.location?.provinceCode || house.location?.provinceId ? parseInt(house.location.provinceCode || house.location.provinceId) : null,
        provinceName: house.location?.provinceName || '',
        wardCode: house.location?.wardCode || house.location?.communeId ? parseInt(house.location.wardCode || house.location.communeId) : null,
        wardName: house.location?.wardName || house.location?.communeName || '',
        address: house.location?.addressDetail || ''
      }
    }); 
    setFormErrors({});
    setShowModal(true); 
  };
  const handleSubmit = () => { 
    if (editingHouse) handleUpdate(); 
    else handleCreate(); 
  };

  if (!mounted) return null;
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need to login to access this page.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'Owner' && user.role !== 2 && user.role !== '2') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need Owner role to access this page.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current role: {user.role} (Type: {typeof user.role})</p>
        </div>
      </div>
    );
  }
  
  if (loading) return <div className="min-h-screen bg-gray-50 p-6">Loading boarding houses...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Boarding House Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your boarding houses</p>
          {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Boarding House List</h2>
          <button onClick={() => { setEditingHouse(null); setHouseData({ houseName: '', description: '', addressData: { provinceCode: null, provinceName: '', wardCode: null, wardName: '', address: '' } }); setFormErrors({}); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Add New Boarding House</button>
        </div>

        {boardingHouses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No boarding houses yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start by creating your first boarding house</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Create First Boarding House</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardingHouses.map((house) => (
              <div key={house.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative"><img src="/image.png" alt={house.houseName} className="w-full h-48 object-cover"/></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{house.houseName}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{house.description}</p>
                  {house.location && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span className="truncate">
                        {/* Display full address from backend-processed location */}
                        {house.location.fullAddress || 
                         `${house.location.addressDetail}, ${house.location.wardName}, ${house.location.provinceName}` ||
                         `${house.location.addressDetail}, Ward ${house.location.communeId}, Province ${house.location.provinceId}`}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center"><div className="text-lg font-bold text-gray-900 dark:text-white">{house.totalRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Rooms</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-green-600">{house.occupiedRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Occupied</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-blue-600">{house.vacantRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Vacant</div></div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <Link href={`/owner/rooms?houseId=${house.id}&houseName=${encodeURIComponent(house.houseName)}`} className="text-blue-500 hover:underline text-sm font-medium">Manage Rooms</Link>
                    <Link href={`/owner/boarding-houses/${house.id}/contracts`} className="text-purple-500 hover:underline text-sm font-medium">Manage Contracts</Link>
                    <button onClick={() => handleEdit(house)} className="text-yellow-500 hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(house.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingHouse ? "Edit Boarding House" : "Create New Boarding House"}
                </h2>
              </div>
              <button
                onClick={() => { 
                  setShowModal(false); 
                  setEditingHouse(null); 
                  setHouseData({ 
                    houseName: '', 
                    description: '', 
                    addressData: {
                      provinceCode: null,
                      provinceName: '',
                      wardCode: null,
                      wardName: '',
                      address: ''
                    }
                  }); 
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* House Name Field */}
              <div className="relative">
                <label htmlFor="houseName" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                    🏠 Boarding House Name <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="houseName" 
                    value={houseData.houseName} 
                    onChange={(e) => {
                      setHouseData({ ...houseData, houseName: e.target.value });
                      if (formErrors.houseName) {
                        setFormErrors({ ...formErrors, houseName: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm ${
                      formErrors.houseName ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter boarding house name (max 100 characters)"
                    maxLength="100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                {formErrors.houseName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{formErrors.houseName}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    📝 {houseData.houseName.length}/100 characters
                  </p>
                </div>
              </div>

              {/* Description Field */}
              <div className="relative">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <span className="flex items-center">
                    📝 Boarding House Description
                  </span>
                </label>
                <div className="relative">
                  <textarea 
                    id="description" 
                    rows="4" 
                    value={houseData.description} 
                    onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium resize-none hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                    placeholder="Detailed description of the boarding house (optional)... E.g.: Clean boarding house, good security, near schools..."
                  />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Location Section - Using AddressSelector */}
              {/* Frontend collects address data, Backend processes and creates/updates location */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  <span className="flex items-center">
                    📍 Address Information <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                
                <AddressSelector
                    value={houseData.addressData}
                    onChange={(addressData) => {
                      setHouseData({ ...houseData, addressData });
                      // Clear related errors when address changes
                      const newErrors = { ...formErrors };
                      delete newErrors.province;
                      delete newErrors.ward;
                      delete newErrors.address;
                      setFormErrors(newErrors);
                    }}
                    required={true}
                    errors={formErrors}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600"
                  />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button 
                  type="button" 
                  onClick={() => { 
                    setShowModal(false); 
                    setEditingHouse(null); 
                    setHouseData({ 
                      houseName: '', 
                      description: '', 
                      addressData: {
                        provinceCode: null,
                        provinceName: '',
                        wardCode: null,
                        wardName: '',
                        address: ''
                      }
                    }); 
                    setFormErrors({});
                  }} 
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-semibold flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center shadow-lg ${
                    submitting 
                      ? 'bg-blue-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
                  } text-white`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingHouse ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingHouse ? 'Save Changes' : 'Create Boarding House'}
                    </>
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

