"use client";
import { useEffect, useState } from "react";
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

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [deleteErrorId, setDeleteErrorId] = useState(null);
  // State cho modal thêm notification
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
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
      // Lấy notificationType từ notification gốc và đảm bảo nó là số
      const currentNotification = notifications.find(n => n.id === showUpdateModalId);
      const notificationType = currentNotification ? Number(currentNotification.notificationType) : 0;

      await updateNotification(showUpdateModalId, {
        title: updateTitle,
        message: updateMessage,
        notificationType: isNaN(notificationType) ? 0 : notificationType // Fallback nếu conversion thất bại
      });
      setShowUpdateModalId(null);
      await fetchNotifications();
    } catch (err) {
      console.log('Update notification error:', err);
      setUpdateError("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setUpdateLoading(false);
    }
  };
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

  // Xử lý submit thêm notification by role
  const handleAddByRoleNotification = async (e) => {
    e.preventDefault();
    setAddByRoleLoading(true);
    setAddByRoleError(null);
    try {
      const notificationTypeNum = Number(byRoleType) || 0;
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
      await fetchNotifications();
    } catch (err) {
      console.error("Error scheduling notification:", err);
      setAddScheduleError("Không thể hẹn giờ thông báo. Vui lòng thử lại.");
    } finally {
      setAddScheduleLoading(false);
    }
  };

  // fetchNotifications tách riêng để gọi lại sau khi thêm/xóa/đánh dấu đã đọc
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Lấy danh sách loại thông báo và vai trò
  useEffect(() => {
    async function fetchTypesAndRoles() {
      try {
        const [typesRes, rolesRes] = await Promise.all([
          apiFetch("/api/Notification/types"),
          apiFetch("/api/Notification/roles")
        ]);
        setNotificationTypes(Array.isArray(typesRes) ? typesRes : []);
        setAllRoles(Array.isArray(rolesRes) ? rolesRes : []);
      } catch (err) {
        console.error("Failed to fetch types or roles", err);
        // Fallback data
        setNotificationTypes([
          { id: 1, name: "Thông báo chung" },
          { id: 2, name: "Thông báo hệ thống" }
        ]);
        setAllRoles([
          { id: 1, name: "Chủ nhà" },
          { id: 2, name: "Người thuê" },
          { id: 3, name: "Quản trị viên" }
        ]);
      }
    }
    fetchTypesAndRoles();
  }, []);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    await markAsReadNotification(id);
    await fetchNotifications();
  };

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  const fetchRoles = async () => {
    try {
      const rolesData = await notificationService.getAllRoles();
      console.log("👥 Roles data:", rolesData);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      console.error("❌ Failed to fetch roles:", err);
      setRoles([]);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      alert("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      if (selectedNotification?.id === id) {
        setShowDetailModal(false);
        setSelectedNotification(null);
      }
    } catch (err) {
      alert("Failed to delete notification");
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      if (formData.targetRole !== null) {
        // Create by role (broadcast)
        const payload = {
          notificationType: parseInt(formData.notificationType),
          title: formData.title,
          message: formData.message,
          targetRole: parseInt(formData.targetRole),
          scheduledTime: formData.scheduledTime || null,
        };
        
        if (formData.scheduledTime) {
          await notificationService.scheduleNotification(payload);
          alert("Notification scheduled successfully!");
        } else {
          await notificationService.createNotificationByRole(payload);
          alert("Notification sent to all users with the selected role!");
        }
      } else {
        // Create individual notification
        const payload = {
          notificationType: parseInt(formData.notificationType),
          title: formData.title,
          message: formData.message,
        };
        await notificationService.createNotification(payload);
        alert("Notification created successfully!");
      }

      setShowCreateModal(false);
      setFormData({
        notificationType: 0,
        title: "",
        message: "",
        targetRole: null,
        scheduledTime: "",
      });
      fetchNotifications();
    } catch (err) {
      alert("Failed to create notification. " + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.isRead;
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationTypeLabel = (type) => {
    const types = {
      0: "System",
      1: "Promotion",
      2: "Warning",
      3: "Owner Register",
      System: "System",
      Promotion: "Promotion",
      Warning: "Warning",
      OwnerRegister: "Owner Register",
    };
    return types[type] || type;
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      0: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      2: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      3: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      System: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Promotion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Warning: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      OwnerRegister: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getRoleLabel = (roleNum) => {
    const roleMap = {
      1: "User",
      2: "Owner",
      3: "Staff",
      4: "Admin",
    };
    return roleMap[roleNum] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Thông báo của admin</h1>
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
                {addByRoleLoading ? "Đang thêm..." : "Thêm thông báo"}
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

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {unreadCount} thông báo chưa đọc
      </p>
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
            onClick={() => handleMarkAsRead(n.id, n.isRead)}
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
              {/* Modal cập nhật notification */}
              {showUpdateModalId === n.id && (
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
            </div>
          </li>
        ))}
      </ul>

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
  );
}
