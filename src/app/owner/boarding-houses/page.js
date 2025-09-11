"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { boardingHouseAPI, roomAPI } from "@/utils/api";

export default function BoardingHousesPage() {
  const [mounted, setMounted] = useState(false);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [houseData, setHouseData] = useState({ houseName: "", description: "" });

  // Mock owner ID - will be replaced by real auth
  const ownerId = "123e4567-e89b-12d3-a456-426614174000";

  useEffect(() => { setMounted(true); fetchBoardingHouses(); }, []);

  const fetchBoardingHouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const houses = await boardingHouseAPI.getByOwnerId(ownerId);
      const housesWithDetails = await Promise.all(houses.map(async (house) => {
        try { const rooms = await roomAPI.getByHouseId(house.id); const occupiedRooms = rooms.filter(r => r.roomStatus !== "Available").length; return { ...house, totalRooms: rooms.length, occupiedRooms, vacantRooms: rooms.length - occupiedRooms }; }
        catch (e) { return { ...house, totalRooms: 0, occupiedRooms: 0, vacantRooms: 0 }; }
      }));
      setBoardingHouses(housesWithDetails);
    } catch (e) { console.error(e); setError("Unable to load boarding houses"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!houseData.houseName.trim()) { alert('Please enter a name'); return; }
    try {
      const payload = { ownerId, houseName: houseData.houseName, description: houseData.description };
      const res = await boardingHouseAPI.create(payload);
      if (res && res.isSuccess !== false) { alert('Boarding house created'); setShowModal(false); setHouseData({ houseName: '', description: '' }); fetchBoardingHouses(); }
      else alert('Create failed: ' + (res?.message || JSON.stringify(res)));
    } catch (e) { console.error(e); alert('API error creating boarding house: ' + (e.message || e)); }
  };

  const handleUpdate = async () => {
    if (!editingHouse) return;
    try {
      const payload = { houseName: houseData.houseName, description: houseData.description };
      const res = await boardingHouseAPI.update(editingHouse.id, payload);
      if (res && res.isSuccess !== false) { alert('Boarding house updated'); setShowModal(false); setEditingHouse(null); setHouseData({ houseName: '', description: '' }); fetchBoardingHouses(); }
      else alert('Update failed: ' + (res?.message || JSON.stringify(res)));
    } catch (e) { console.error(e); alert('API error updating boarding house: ' + (e.message || e)); }
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

  const handleEdit = (house) => { setEditingHouse(house); setHouseData({ houseName: house.houseName || '', description: house.description || '' }); setShowModal(true); };
  const handleSubmit = () => { if (!houseData.houseName.trim()) return alert('Please enter a name'); if (editingHouse) handleUpdate(); else handleCreate(); };

  if (!mounted) return null;
  if (loading) return <div className="min-h-screen bg-gray-50 p-6">Loading...</div>;

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
          <button onClick={() => { setEditingHouse(null); setHouseData({ houseName: '', description: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Add New Boarding House</button>
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{house.description}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center"><div className="text-lg font-bold text-gray-900 dark:text-white">{house.totalRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Rooms</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-green-600">{house.occupiedRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Occupied</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-blue-600">{house.vacantRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">Vacant</div></div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <Link href={`/owner/rooms?houseId=${house.id}&houseName=${encodeURIComponent(house.houseName)}`} className="text-blue-500 hover:underline text-sm font-medium">Manage Rooms</Link>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingHouse ? "Edit Boarding House" : "Create New Boarding House"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="mb-4">
                <label htmlFor="houseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Boarding House Name</label>
                <input type="text" id="houseName" value={houseData.houseName} onChange={(e) => setHouseData({ ...houseData, houseName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea id="description" rows="3" value={houseData.description} onChange={(e) => setHouseData({ ...houseData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingHouse(null); setHouseData({ houseName: '', description: '' }); }} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingHouse ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

