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
  const [houseLocations, setHouseLocations] = useState([]);
  const [selectedHouseLocation, setSelectedHouseLocation] = useState(null);

  const fetchRooms = useCallback(async () => {
    if (!houseId) {
      setError("Boarding house ID is missing.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getByBoardingHouseId(houseId);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setRooms([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [houseId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (!showModal) return;
    let mounted = true;
    const loadHouseLocations = async () => {
      try {
        const locs = roomService.getHouseLocations ? await roomService.getHouseLocations(houseId) : null;
        if (!mounted) return;
        const normalize = (item) => {
          let id = item?.id || item?._id || (item?.value && (item.value.id || item.value._id)) || null;
          if (id && typeof id === 'object') {
            if (id.$oid) id = id.$oid;
            else if (id.toString) id = id.toString();
            else id = JSON.stringify(id);
          }
          const label = item?.name || item?.address || item?.addressDetail || (item?.value && (item.value.name || item.value.address || item.value.addressDetail)) || `${item?.provinceId || ''} ${item?.communeId || ''} ${item?.addressDetail || ''}`;
          return { id: id || '', label: label || '' , raw: item };
        };
        let arr = [];
        if (Array.isArray(locs)) arr = locs.map(normalize);
        else if (locs && Array.isArray(locs.value)) arr = locs.value.map(normalize);
        else if (locs && Array.isArray(locs.data)) arr = locs.data.map(normalize);
        setHouseLocations(arr);
        if (arr.length > 0) setSelectedHouseLocation(arr[0].id);
      } catch (e) {
        console.warn("Could not load house locations:", e);
        setHouseLocations([]);
      }
    };
    loadHouseLocations();
    return () => { mounted = false; };
  }, [showModal, houseId]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await roomService.create(houseId, roomData, selectedHouseLocation || null);
      setShowModal(false);
      setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 });
      await fetchRooms();
    } catch (error) {
      console.error("Create room error:", error);
      alert("Error creating room: " + (error.message || error));
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    try { setLoading(true); await roomService.update(editingRoom.id, roomData); setShowModal(false); setEditingRoom(null); setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); await fetchRooms(); }
    catch (e) { console.error(e); alert("Error updating room: " + (e.message || e)); }
    finally { setLoading(false); }
  };

  const handleDelete = async (roomId) => { if (!confirm("Are you sure you want to delete this room?")) return; try { setLoading(true); await roomService.delete(roomId); await fetchRooms(); } catch (e) { console.error(e); alert("Error deleting room: " + (e.message || e)); } finally { setLoading(false); } };

  const handleEdit = (room) => { setEditingRoom(room); setRoomData({ roomName: room.roomName, area: room.area?.toString?.() || '', price: room.price?.toString?.() || '', roomStatus: room.roomStatus || 0 }); setShowModal(true); };

  const handleSubmit = () => { if (!roomData.roomName.trim() || !roomData.area || !roomData.price) { alert("Please fill in all fields"); return; } if (editingRoom) handleUpdate(); else handleCreate(); };

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
          <button onClick={() => { setEditingRoom(null); setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Add New Room</button>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found for this property.</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by adding the first room.</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Create First Room</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{rooms.map((room) => (
            <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{room.roomName}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Status: <span className={`font-semibold text-green-500`}>{room.roomStatus ? room.roomStatus : 'Available'}</span></p>
                <p className="text-gray-800 dark:text-gray-200 font-bold text-xl mb-3">${room.price?.toLocaleString?.() || room.price} / month</p>
                <div className="text-sm text-gray-500 dark:text-gray-400"><p>Area: {room.area} m²</p></div>
                <div className="flex justify-end space-x-3 mt-4"><button onClick={() => handleEdit(room)} className="text-yellow-500 hover:underline text-sm font-medium">Edit</button><button onClick={() => handleDelete(room.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button></div>
              </div>
            </div>
          ))}</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingRoom ? "Edit Room" : "Create New Room"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Name</label>
                <input type="text" value={roomData.roomName} onChange={(e) => setRoomData({ ...roomData, roomName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">House Location (optional)</label>
                {houseLocations && houseLocations.length > 0 ? (
                  <select value={selectedHouseLocation || ""} onChange={(e) => setSelectedHouseLocation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {houseLocations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.label}</option>))}
                  </select>
                ) : (
                  <div className="flex flex-col gap-2"><div className="text-sm text-gray-500 mb-2">No house location found. You can still create a room without a specific address.</div></div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area (m²)</label>
                <input type="number" step="0.01" value={roomData.area} onChange={(e) => setRoomData({ ...roomData, area: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                <input type="number" step="0.01" value={roomData.price} onChange={(e) => setRoomData({ ...roomData, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingRoom(null); setRoomData({ roomName: "", area: "", price: "", roomStatus: 0 }); }} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingRoom ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomManagementPage() { return (<Suspense fallback={<div>Loading...</div>}><RoomManagementContent /></Suspense>); }
