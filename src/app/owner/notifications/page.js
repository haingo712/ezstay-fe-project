"use client";

// Hàm đánh dấu đã đọc notification
async function markAsReadNotification(id) {
    try {
        await apiFetch(`/api/Notification/mark-read/${id}`, {
            method: "PUT"
        });
    } catch (err) {
        throw err;
    }
}
https://github.com/haingo712/ezstay-fe-project/pull/25/conflict?name=src%252Fcomponents%252FNavbar.js&ancestor_oid=64014958ba85a39a7f2edd03aba6acf0e6b27faa&base_oid=5dee877f0ec80827b8c2f0284d77563a279d025b&head_oid=4fa1367af2ccdbcc303efd2a8c7f080476a8a5f2
// Hàm cập nhật notification
async function updateNotification(id, { title, message, notificationType = 0 }) {
    try {
        await apiFetch(`/api/Notification/${id}`, {
            method: "PUT",
            body: JSON.stringify({ title, message, notificationType }),
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        throw err;
    }
}

import { useEffect, useState, useRef } from "react";
// Icon Bell SVG
function BellIcon({ className = "w-7 h-7" }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.243a2 2 0 0 1-3.714 0M21 19H3m16-2V9a7 7 0 1 0-14 0v8a2 2 0 0 1-2 2h16a2 2 0 0 1-2-2Z" />
        </svg>
    );
}
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/utils/api";

// Hàm thêm notification mới
async function addNotification({ title, message, notificationType = 0 }) {
    try {
        const res = await apiFetch("/api/Notification", {
            method: "POST",
            body: JSON.stringify({
                title,
                message,
                notificationType
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

// Hàm thêm notification theo role (CreateByRole)
async function addNotificationByRole({ title, message, notificationType = 0, targetRoles }) {
    try {
        const res = await apiFetch("/api/Notification/by-role", {
            method: "POST",
            body: JSON.stringify({
                title,
                message,
                notificationType,
                targetRoles
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

// Hàm thêm notification hẹn giờ (Schedule)
async function addScheduledNotification({ title, message, notificationType = 0, targetRoles, scheduledTime }) {
    try {
        const res = await apiFetch("/api/Notification/schedule", {
            method: "POST",
            body: JSON.stringify({
                title,
                message,
                notificationType,
                targetRoles,
                scheduledTime
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

// Hàm xóa notification
async function deleteNotification(id) {
    try {
        await apiFetch(`/api/Notification/${id}`, {
            method: "DELETE"
        });
    } catch (err) {
        throw err;
    }
}


export default function OwnerNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);
    const [deleteErrorId, setDeleteErrorId] = useState(null);
    // State cho update modal
    const [showUpdateModalId, setShowUpdateModalId] = useState(null);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    // State cho form tạo notification by role
    const [showAddByRoleModal, setShowAddByRoleModal] = useState(false);
    const [byRoleTitle, setByRoleTitle] = useState("");
    const [byRoleMessage, setByRoleMessage] = useState("");
    const [byRoleType, setByRoleType] = useState("");
    const [byRoleTargetRoles, setByRoleTargetRoles] = useState([]);
    const [addByRoleLoading, setAddByRoleLoading] = useState(false);
    const [addByRoleError, setAddByRoleError] = useState(null);
    const [notificationTypes, setNotificationTypes] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    // State cho form tạo notification hẹn giờ
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleTitle, setScheduleTitle] = useState("");
    const [scheduleMessage, setScheduleMessage] = useState("");
    const [scheduleType, setScheduleType] = useState("");
    const [scheduleTargetRoles, setScheduleTargetRoles] = useState([]);
    const [scheduleTime, setScheduleTime] = useState("");
    const [addScheduleLoading, setAddScheduleLoading] = useState(false);
    const [addScheduleError, setAddScheduleError] = useState(null);
    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;


    // Mở modal update với dữ liệu notification hiện tại
    const openUpdateModal = (n) => {
        setShowUpdateModalId(n.id);
        setUpdateTitle(n.title);
        setUpdateMessage(n.message);
        setUpdateError(null);
    };

    // Xử lý submit update notification
    const handleUpdateNotification = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            await updateNotification(showUpdateModalId, { title: updateTitle, message: updateMessage });
            setShowUpdateModalId(null);
            await fetchNotifications();
        } catch (err) {
            setUpdateError("Không thể cập nhật. Vui lòng thử lại.");
        } finally {
            setUpdateLoading(false);
        }
    };
    // Xử lý xóa notification
    const handleDelete = async (id) => {
        setDeleteLoadingId(id);
        setDeleteErrorId(null);
        try {
            await deleteNotification(id);
            await fetchNotifications();
        } catch (err) {
            setDeleteErrorId(id);
        } finally {
            setDeleteLoadingId(null);
        }
    };

    // Xử lý submit thêm notification by role
    const handleAddByRoleNotification = async (e) => {
        e.preventDefault();
        setAddByRoleLoading(true);
        setAddByRoleError(null);
        try {
            // Đảm bảo notificationType là số
            const notificationTypeNum = Number(byRoleType) || 0;
            // Đảm bảo targetRoles là mảng số
            const targetRolesArr = byRoleTargetRoles.filter(Boolean).map(Number);
            await addNotificationByRole({ title: byRoleTitle, message: byRoleMessage, notificationType: notificationTypeNum, targetRoles: targetRolesArr });
            setByRoleTitle("");
            setByRoleMessage("");
            setByRoleType("");
            setByRoleTargetRoles([]);
            setShowAddByRoleModal(false);
            await fetchNotifications();
        } catch (err) {
            setAddByRoleError("Không thể tạo thông báo theo vai trò. Vui lòng thử lại.");
        } finally {
            setAddByRoleLoading(false);
        }
    };

    // Xử lý submit thêm notification hẹn giờ
    const handleScheduleNotification = async (e) => {
        e.preventDefault();
        setAddScheduleLoading(true);
        setAddScheduleError(null);
        try {
            const notificationTypeNum = Number(scheduleType) || 0;
            const targetRolesArr = scheduleTargetRoles.filter(Boolean).map(Number);

            // Chuyển đổi thời gian sang định dạng ISO 8601 UTC
            const scheduledTimeISO = new Date(scheduleTime).toISOString();

            await addScheduledNotification({
                title: scheduleTitle,
                message: scheduleMessage,
                notificationType: notificationTypeNum,
                targetRoles: targetRolesArr,
                scheduledTime: scheduledTimeISO
            });
            setScheduleTitle("");
            setScheduleMessage("");
            setScheduleType("");
            setScheduleTargetRoles([]);
            setScheduleTime("");
            setShowScheduleModal(false);
            await fetchNotifications(); // Cập nhật lại danh sách
        } catch (err) {
            console.error("Error scheduling notification:", err);
            setAddScheduleError("Không thể hẹn giờ thông báo. Vui lòng thử lại.");
        } finally {
            setAddScheduleLoading(false);
        }
    };

    // fetchNotifications tách riêng để gọi lại sau khi thêm
    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch("/api/Notification/all-by-user");
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Không thể tải thông báo. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách loại thông báo từ API hoặc fallback
    useEffect(() => {
        async function fetchTypes() {
            try {
                // Gọi API lấy loại thông báo
                const res = await apiFetch("/api/Notification/types");
                if (Array.isArray(res)) {
                    setNotificationTypes(res);
                } else {
                    setNotificationTypes([
                        { id: 1, name: "Thông báo chung" },
                        { id: 2, name: "Thông báo hệ thống" }
                    ]);
                }
            } catch {
                setNotificationTypes([
                    { id: 1, name: "Thông báo chung" },
                    { id: 2, name: "Thông báo hệ thống" }
                ]);
            }
        }
        fetchTypes();
    }, []);

    // Lấy danh sách vai trò từ API hoặc fallback
    useEffect(() => {
        async function fetchRoles() {
            try {
                const res = await apiFetch("/api/Notification/roles");
                if (Array.isArray(res)) {
                    setAllRoles(res);
                } else {
                    setAllRoles([
                        { id: 1, name: "Chủ nhà" },
                        { id: 2, name: "Người thuê" },
                        { id: 3, name: "Quản trị viên" }
                    ]);
                }
            } catch {
                setAllRoles([
                    { id: 1, name: "Chủ nhà" },
                    { id: 2, name: "Người thuê" },
                    { id: 3, name: "Quản trị viên" }
                ]);
            }
        }
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Đóng dropdown khi click ngoài
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Xử lý submit thêm notification
    const handleAddNotification = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        try {
            await addNotification({ title, message });
            setTitle("");
            setMessage("");
            setShowAddModal(false);
            await fetchNotifications();
        } catch (err) {
            setAddError("Không thể thêm thông báo. Vui lòng thử lại.");
        } finally {
            setAddLoading(false);
        }
    };

    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNotifications = notifications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <ProtectedRoute roles={["Owner"]}>
            {/* Đã xoá Bell icon gần About */}
            <div className="max-w-2xl mx-auto py-10 px-4">
                <h1 className="text-2xl font-bold mb-6">Thông báo của bạn</h1>

                {/* Nút mở modal thêm notification */}
                <button
                    className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => { setShowAddModal(true); setAddError(null); }}
                >
                    Thêm thông báo
                </button>

                {/* Nút mở modal thêm notification theo vai trò */}
                <button
                    className="mb-6 ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => { setShowAddByRoleModal(true); setAddByRoleError(null); }}
                >
                    Thêm thông báo theo vai trò
                </button>

                {/* Nút mở modal thêm notification hẹn giờ */}
                <button
                    className="mb-6 ml-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={() => { setShowScheduleModal(true); setAddScheduleError(null); }}
                >
                    Thêm thông báo hẹn giờ
                </button>

                {/* Modal thêm notification */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowAddModal(false)}
                                type="button"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4">Thêm thông báo mới</h2>
                            <form onSubmit={handleAddNotification}>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Tiêu đề</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Nội dung</label>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                {addError && <div className="text-red-500 mb-2">{addError}</div>}
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={addLoading}>
                                    {addLoading ? "Đang thêm..." : "Thêm thông báo"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal thêm notification theo vai trò */}
                {showAddByRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowAddByRoleModal(false)}
                                type="button"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4">Thêm thông báo theo vai trò</h2>
                            <form onSubmit={handleAddByRoleNotification}>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Tiêu đề</label>
                                    <input type="text" value={byRoleTitle} onChange={e => setByRoleTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Nội dung</label>
                                    <textarea value={byRoleMessage} onChange={e => setByRoleMessage(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Loại thông báo</label>
                                    <select value={byRoleType} onChange={e => setByRoleType(e.target.value)} className="w-full border rounded px-3 py-2" required>
                                        <option value="">Chọn loại</option>
                                        {notificationTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Vai trò đích</label>
                                    <select value={byRoleTargetRoles[0] || ""} onChange={e => setByRoleTargetRoles([e.target.value])} className="w-full border rounded px-3 py-2" required>
                                        <option value="">Chọn vai trò</option>
                                        {allRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {addByRoleError && <div className="text-red-500 mb-2">{addByRoleError}</div>}
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={addByRoleLoading}>
                                    {addByRoleLoading ? "Đang thêm..." : "Thêm thông báo theo vai trò"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal thêm notification hẹn giờ */}
                {showScheduleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowScheduleModal(false)}
                                type="button"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4">Thêm thông báo hẹn giờ</h2>
                            <form onSubmit={handleScheduleNotification}>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Tiêu đề</label>
                                    <input type="text" value={scheduleTitle} onChange={e => setScheduleTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Nội dung</label>
                                    <textarea value={scheduleMessage} onChange={e => setScheduleMessage(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Loại thông báo</label>
                                    <select value={scheduleType} onChange={e => setScheduleType(e.target.value)} className="w-full border rounded px-3 py-2" required>
                                        <option value="">Chọn loại</option>
                                        {notificationTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Vai trò đích</label>
                                    <select value={scheduleTargetRoles[0] || ""} onChange={e => setScheduleTargetRoles([e.target.value])} className="w-full border rounded px-3 py-2" required>
                                        <option value="">Chọn vai trò</option>
                                        {allRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Thời gian hẹn</label>
                                    <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                {addScheduleError && <div className="text-red-500 mb-2">{addScheduleError}</div>}
                                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" disabled={addScheduleLoading}>
                                    {addScheduleLoading ? "Đang hẹn giờ..." : "Hẹn giờ thông báo"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {loading && <div>Đang tải thông báo...</div>}
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {!loading && notifications.length === 0 && (
                    <div className="text-gray-500">Không có thông báo nào.</div>
                )}
                <ul className="space-y-4">
                    {currentNotifications.map((n) => (
                        <li
                            key={n.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer ${!n.isRead ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
                            onClick={async () => {
                                if (!n.isRead) {
                                    await markAsReadNotification(n.id);
                                    await fetchNotifications();
                                }
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-blue-700 dark:text-blue-300">{n.title}</div>
                                    <div className="text-gray-700 dark:text-gray-200">{n.message}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`mb-2 px-2 py-1 rounded text-xs ${n.isRead ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
                                        {n.isRead ? "Đã đọc" : "Chưa đọc"}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            className="text-blue-600 hover:underline text-xs disabled:opacity-50"
                                            onClick={e => { e.stopPropagation(); openUpdateModal(n); }}
                                            type="button"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline text-xs disabled:opacity-50"
                                            onClick={e => { e.stopPropagation(); handleDelete(n.id); }}
                                            disabled={deleteLoadingId === n.id}
                                            type="button"
                                        >
                                            {deleteLoadingId === n.id ? "Đang xóa..." : "Xóa"}
                                        </button>
                                    </div>
                                    {deleteErrorId === n.id && (
                                        <div className="text-xs text-red-500 mt-1">Lỗi xóa!</div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Modal cập nhật notification - Đặt ngoài vòng lặp */}
                {showUpdateModalId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowUpdateModalId(null)}
                                type="button"
                            >
                                &times;
                            </button>
                            <h2 className="text-lg font-bold mb-4">Cập nhật thông báo</h2>
                            <form onSubmit={handleUpdateNotification}>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Tiêu đề</label>
                                    <input type="text" value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div className="mb-2">
                                    <label className="block font-medium mb-1">Nội dung</label>
                                    <textarea value={updateMessage} onChange={e => setUpdateMessage(e.target.value)} className="w-full border rounded px-3 py-2" required />
                                </div>
                                {updateError && <div className="text-red-500 mb-2">{updateError}</div>}
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={updateLoading}>
                                    {updateLoading ? "Đang cập nhật..." : "Cập nhật"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 mx-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`px-4 py-2 mx-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 mx-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
