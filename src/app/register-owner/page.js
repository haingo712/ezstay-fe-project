"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from 'react-toastify';

export default function RegisterOwnerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [reason, setReason] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Vui lòng chọn file hình ảnh (jpg, png, gif...)");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Kích thước file không được vượt quá 5MB");
                return;
            }
            setImageFile(file);
            setError("");
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!reason.trim()) {
            setError("Vui lòng nhập lý do đăng ký.");
            setLoading(false);
            return;
        }

        if (!imageFile) {
            setError("Vui lòng tải lên hình ảnh tài sản (CMND/CCCD hoặc giấy tờ liên quan).");
            setLoading(false);
            return;
        }

        try {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append("Reason", reason);
            formData.append("Imageasset", imageFile);

            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/OwnerRequest/request-owner`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Gửi đơn đăng ký thất bại");
            }

            setSuccess(true);
            toast.success("Đơn đăng ký Owner đã được gửi thành công! Vui lòng chờ Staff phê duyệt.");

            // Chuyển về trang home sau 2 giây
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            console.error("Lỗi khi gửi đơn đăng ký:", err);
            setError(err.message || "Không thể gửi đơn đăng ký. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <ProtectedRoute roles={["User"]}>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Đăng ký thành công!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Đơn đăng ký Owner của bạn đã được gửi. Vui lòng chờ Staff xét duyệt.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Đang chuyển hướng...
                        </p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute roles={["User"]}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                🏠 Đăng ký trở thành Owner
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Vui lòng điền đầy đủ thông tin để gửi đơn đăng ký. Staff sẽ xét duyệt đơn của bạn trong thời gian sớm nhất.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Lý do đăng ký */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Vui lòng cho biết lý do bạn muốn trở thành Owner <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows="6"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Tôi muốn đăng ký làm Owner để cho thuê phòng trọ/nhà trọ..."
                                    required
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Vui lòng mô tả chi tiết lý do và mục đích đăng ký trở thành Owner
                                </p>
                            </div>

                            {/* Upload hình ảnh */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hình ảnh xác minh (CMND/CCCD hoặc giấy tờ liên quan) <span className="text-red-500">*</span>
                                </label>
                                
                                {!imagePreview ? (
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label htmlFor="image-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Tải lên hình ảnh</span>
                                                    <input
                                                        id="image-upload"
                                                        name="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">hoặc kéo thả vào đây</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                PNG, JPG, GIF tối đa 5MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative mt-1">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full max-h-64 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {imageFile?.name}
                                        </p>
                                    </div>
                                )}
                                
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Vui lòng tải lên hình ảnh CMND/CCCD hoặc giấy tờ chứng minh quyền sở hữu tài sản
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
