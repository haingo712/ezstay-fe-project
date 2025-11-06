"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

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

// Hàm tạo notification mới
async function createNotification(data) {
    try {
        const res = await apiFetch("/api/Notification", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

// Hàm cập nhật notification
async function updateNotification(id, data) {
    try {
        const res = await apiFetch(`/api/Notification/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
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

// Hàm tạo notification theo role
async function createNotificationByRole(data) {
    try {
        const res = await apiFetch("/api/Notification/by-role", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

// Hàm tạo notification hẹn giờ
async function createScheduledNotification(data) {
    try {
        const res = await apiFetch("/api/Notification/schedule", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return res;
    } catch (err) {
        throw err;
    }
}

export default function StaffNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all, unread, read

    // State cho form tạo notification
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createType, setCreateType] = useState("single"); // single or by-role
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        notificationType: 0
    });
    const [roleFormData, setRoleFormData] = useState({
        title: "",
        message: "",
        notificationType: 0,
        targetRoles: []
    });

    // State cho form hẹn giờ
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState("");
    const [scheduleFormData, setScheduleFormData] = useState({
        title: "",
        message: "",
        notificationType: 0,
        targetRoles: [],
        scheduledTime: ""
    });

    // State cho form edit notification
    const [editingNotification, setEditingNotification] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editFormData, setEditFormData] = useState({
        title: "",
        message: "",
        notificationType: 0
    })

    // Fetch notifications sử dụng API GetByRoleOrUser
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiFetch("/api/Notification/by-role");
            setNotifications(data || []);
        } catch (err) {
            console.error("Lỗi khi tải thông báo:", err);
            setError("Không thể tải danh sách thông báo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Đánh dấu đã đọc
    const handleMarkAsRead = async (id) => {
        try {
            await markAsReadNotification(id);
            // Cập nhật UI
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            console.error("Lỗi khi đánh dấu đã đọc:", err);
            alert("Không thể đánh dấu đã đọc.");
        }
    };

    // Xử lý tạo notification mới (single)
    const handleCreateNotification = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError("");

        try {
            await createNotification(formData);
            // Reset form
            setFormData({
                title: "",
                message: "",
                notificationType: 0
            });
            setShowCreateForm(false);
            // Tải lại danh sách
            await fetchNotifications();
            alert("Tạo thông báo thành công!");
        } catch (err) {
            console.error("Lỗi khi tạo thông báo:", err);
            setCreateError(err.message || "Không thể tạo thông báo.");
        } finally {
            setCreateLoading(false);
        }
    };

    // Xử lý tạo notification theo role
    const handleCreateByRole = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError("");

        if (roleFormData.targetRoles.length === 0) {
            setCreateError("Vui lòng chọn ít nhất một role.");
            setCreateLoading(false);
            return;
        }

        try {
            await createNotificationByRole(roleFormData);
            // Reset form
            setRoleFormData({
                title: "",
                message: "",
                notificationType: 0,
                targetRoles: []
            });
            setShowCreateForm(false);
            // Tải lại danh sách
            await fetchNotifications();
            alert("Tạo thông báo theo role thành công!");
        } catch (err) {
            console.error("Lỗi khi tạo thông báo theo role:", err);
            setCreateError(err.message || "Không thể tạo thông báo.");
        } finally {
            setCreateLoading(false);
        }
    };

    // Toggle role selection (for by-role form)
    const toggleRole = (role) => {
        setRoleFormData(prev => {
            const newRoles = prev.targetRoles.includes(role)
                ? prev.targetRoles.filter(r => r !== role)
                : [...prev.targetRoles, role];
            return { ...prev, targetRoles: newRoles };
        });
    };

    // Toggle role selection (for schedule form)
    const toggleScheduleRole = (role) => {
        setScheduleFormData(prev => {
            const newRoles = prev.targetRoles.includes(role)
                ? prev.targetRoles.filter(r => r !== role)
                : [...prev.targetRoles, role];
            return { ...prev, targetRoles: newRoles };
        });
    };

    // Xử lý tạo notification hẹn giờ
    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        setScheduleLoading(true);
        setScheduleError("");

        if (scheduleFormData.targetRoles.length === 0) {
            setScheduleError("Vui lòng chọn ít nhất một role.");
            setScheduleLoading(false);
            return;
        }

        if (!scheduleFormData.scheduledTime) {
            setScheduleError("Vui lòng chọn thời gian hẹn.");
            setScheduleLoading(false);
            return;
        }

        try {
            // Chuyển đổi thời gian sang ISO format
            const scheduledTimeISO = new Date(scheduleFormData.scheduledTime).toISOString();

            await createScheduledNotification({
                ...scheduleFormData,
                scheduledTime: scheduledTimeISO
            });

            // Reset form
            setScheduleFormData({
                title: "",
                message: "",
                notificationType: 0,
                targetRoles: [],
                scheduledTime: ""
            });
            setShowScheduleForm(false);
            alert("Tạo thông báo hẹn giờ thành công!");
        } catch (err) {
            console.error("Lỗi khi tạo thông báo hẹn giờ:", err);
            setScheduleError(err.message || "Không thể tạo thông báo hẹn giờ.");
        } finally {
            setScheduleLoading(false);
        }
    };

    // Xử lý mở form edit
    const handleOpenEdit = (notification) => {
        setEditingNotification(notification);
        setEditFormData({
            title: notification.title,
            message: notification.message,
            notificationType: notification.notificationType
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    // Xử lý cập nhật notification
    const handleUpdateNotification = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError("");

        try {
            await updateNotification(editingNotification.id, editFormData);
            // Reset form
            setEditFormData({
                title: "",
                message: "",
                notificationType: 0
            });
            setShowEditForm(false);
            setEditingNotification(null);
            // Tải lại danh sách
            await fetchNotifications();
            alert("Cập nhật thông báo thành công!");
        } catch (err) {
            console.error("Lỗi khi cập nhật thông báo:", err);
            setEditError(err.message || "Không thể cập nhật thông báo.");
        } finally {
            setEditLoading(false);
        }
    };

    // Xử lý xóa notification
    const handleDeleteNotification = async (id, title) => {
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa thông báo:\n"${title}"?`
        );

        if (!confirmDelete) return;

        try {
            await deleteNotification(id);
            // Tải lại danh sách
            await fetchNotifications();
            alert("Xóa thông báo thành công!");
        } catch (err) {
            console.error("Lỗi khi xóa thông báo:", err);
            alert(err.message || "Không thể xóa thông báo.");
        }
    };

    // Lọc thông báo
    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        if (filter === "read") return n.isRead;
        return true;
    });

    // Format thời gian
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Map notification type
    const getNotificationType = (type) => {
        const types = {
            0: "Chung",
            1: "Hệ thống",
            2: "Cảnh báo",
            3: "Khuyến mãi"
        };
        return types[type] || "Không xác định";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        📬 Thông báo của Staff
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quản lý và xem các thông báo dành cho nhân viên
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            Tất cả ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "unread"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            Chưa đọc ({notifications.filter((n) => !n.isRead).length})
                        </button>
                        <button
                            onClick={() => setFilter("read")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "read"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            Đã đọc ({notifications.filter((n) => n.isRead).length})
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateForm(!showCreateForm);
                                setShowScheduleForm(false);
                            }}
                            className="ml-auto px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                            ➕ Tạo thông báo
                        </button>
                        <button
                            onClick={() => {
                                setShowScheduleForm(!showScheduleForm);
                                setShowCreateForm(false);
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                        >
                            ⏰ Hẹn giờ
                        </button>
                        <button
                            onClick={fetchNotifications}
                            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            🔄 Tải lại
                        </button>
                    </div>
                </div>

                {/* Form tạo notification */}
                {showCreateForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Tạo thông báo mới
                        </h2>

                        {/* Toggle giữa Single và By Role */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setCreateType("single")}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${createType === "single"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                Thông báo cá nhân
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateType("by-role")}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${createType === "by-role"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                Thông báo theo Role
                            </button>
                        </div>

                        {/* Form Single Notification */}
                        {createType === "single" && (
                            <form onSubmit={handleCreateNotification} className="space-y-4">
                                {createError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Nhập tiêu đề thông báo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nội dung <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Nhập nội dung thông báo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Loại thông báo
                                    </label>
                                    <select
                                        value={formData.notificationType}
                                        onChange={(e) => setFormData({ ...formData, notificationType: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={0}>Chung</option>
                                        <option value={1}>Hệ thống</option>
                                        <option value={2}>Cảnh báo</option>
                                        <option value={3}>Khuyến mãi</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createLoading ? "Đang tạo..." : "Tạo thông báo"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setCreateError("");
                                            setFormData({ title: "", message: "", notificationType: 0 });
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Form By Role Notification */}
                        {createType === "by-role" && (
                            <form onSubmit={handleCreateByRole} className="space-y-4">
                                {createError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Chọn Role nhận thông báo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: 1, label: "User" },
                                            { value: 2, label: "Owner" },
                                            { value: 3, label: "Staff" },
                                            { value: 4, label: "Admin" }
                                        ].map((role) => (
                                            <label
                                                key={role.value}
                                                className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${roleFormData.targetRoles.includes(role.value)
                                                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500"
                                                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={roleFormData.targetRoles.includes(role.value)}
                                                    onChange={() => toggleRole(role.value)}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {role.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={roleFormData.title}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Nhập tiêu đề thông báo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nội dung <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={roleFormData.message}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, message: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Nhập nội dung thông báo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Loại thông báo
                                    </label>
                                    <select
                                        value={roleFormData.notificationType}
                                        onChange={(e) => setRoleFormData({ ...roleFormData, notificationType: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={0}>Chung</option>
                                        <option value={1}>Hệ thống</option>
                                        <option value={2}>Cảnh báo</option>
                                        <option value={3}>Khuyến mãi</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createLoading ? "Đang tạo..." : "Gửi thông báo"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setCreateError("");
                                            setRoleFormData({ title: "", message: "", notificationType: 0, targetRoles: [] });
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Form hẹn giờ notification */}
                {showScheduleForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            ⏰ Hẹn giờ gửi thông báo
                        </h2>

                        <form onSubmit={handleCreateSchedule} className="space-y-4">
                            {scheduleError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{scheduleError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Chọn Role nhận thông báo <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 1, label: "User" },
                                        { value: 2, label: "Owner" },
                                        { value: 3, label: "Staff" },
                                        { value: 4, label: "Admin" }
                                    ].map((role) => (
                                        <label
                                            key={role.value}
                                            className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${scheduleFormData.targetRoles.includes(role.value)
                                                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                                                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={scheduleFormData.targetRoles.includes(role.value)}
                                                onChange={() => toggleScheduleRole(role.value)}
                                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {role.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={scheduleFormData.title}
                                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập tiêu đề thông báo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={scheduleFormData.message}
                                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, message: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập nội dung thông báo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Loại thông báo
                                </label>
                                <select
                                    value={scheduleFormData.notificationType}
                                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, notificationType: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value={0}>Chung</option>
                                    <option value={1}>Hệ thống</option>
                                    <option value={2}>Cảnh báo</option>
                                    <option value={3}>Khuyến mãi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Thời gian hẹn <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduleFormData.scheduledTime}
                                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Thông báo sẽ được gửi tự động vào thời gian đã chọn
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={scheduleLoading}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {scheduleLoading ? "Đang lưu..." : "⏰ Đặt lịch gửi"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowScheduleForm(false);
                                        setScheduleError("");
                                        setScheduleFormData({ title: "", message: "", notificationType: 0, targetRoles: [], scheduledTime: "" });
                                    }}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Form edit notification */}
                {showEditForm && editingNotification && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Chỉnh sửa thông báo
                        </h2>
                        <form onSubmit={handleUpdateNotification} className="space-y-4">
                            {editError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập tiêu đề thông báo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung
                                </label>
                                <textarea
                                    value={editFormData.message}
                                    onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập nội dung thông báo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Loại thông báo
                                </label>
                                <select
                                    value={editFormData.notificationType}
                                    onChange={(e) => setEditFormData({ ...editFormData, notificationType: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value={0}>Chung</option>
                                    <option value={1}>Hệ thống</option>
                                    <option value={2}>Cảnh báo</option>
                                    <option value={3}>Khuyến mãi</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editLoading ? "Đang cập nhật..." : "Cập nhật thông báo"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingNotification(null);
                                        setEditError("");
                                        setEditFormData({ title: "", message: "", notificationType: 0 });
                                    }}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Notifications List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông báo...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                            <button
                                onClick={fetchNotifications}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-xl">📭</p>
                            <p className="mt-2">Không có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                                                        Mới
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                                                    {getNotificationType(notification.notificationType)}
                                                </span>
                                            </div>

                                            {/* Message */}
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                {notification.message}
                                            </p>

                                            {/* Footer info */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                                                <span>🕒 {formatDate(notification.createdAt)}</span>
                                                {notification.scheduledTime && (
                                                    <span>
                                                        ⏰ Hẹn giờ: {formatDate(notification.scheduledTime)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(notification)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                title="Chỉnh sửa thông báo"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNotification(notification.id, notification.title)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                                                title="Xóa thông báo"
                                            >
                                                🗑️ Xóa
                                            </button>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    ✓ Đã đọc
                                                </button>
                                            )}
                                            {notification.isRead && (
                                                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg whitespace-nowrap text-center">
                                                    ✓ Đã đọc
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer stats */}
                {!loading && !error && notifications.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>
                                Tổng số thông báo: <strong className="text-gray-900 dark:text-white">{notifications.length}</strong>
                            </span>
                            <span>
                                Chưa đọc:{" "}
                                <strong className="text-blue-600 dark:text-blue-400">
                                    {notifications.filter((n) => !n.isRead).length}
                                </strong>
                            </span>
                            <span>
                                Đã đọc:{" "}
                                <strong className="text-green-600 dark:text-green-400">
                                    {notifications.filter((n) => n.isRead).length}
                                </strong>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
