"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RegisterOwnerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [reason, setReason] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!reason.trim()) {
            setError("Vui lòng nhập lý do đăng ký.");
            setLoading(false);
            return;
        }

        try {
            const response = await apiFetch("/api/TestAccount/request-owner", {
                method: "POST",
                body: JSON.stringify({ reason: reason }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            setSuccess(true);
            alert("Đơn đăng ký Owner đã được gửi thành công! Vui lòng chờ Staff phê duyệt.");

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
