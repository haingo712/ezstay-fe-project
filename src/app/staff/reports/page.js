"use client";

import { useEffect, useState } from "react";
import { reviewAPI } from "@/utils/api";
import { useTranslation } from "@/hooks/useTranslation";

function StatusBadge({ status, t }) {
    // Backend có thể trả về số (0,1,2) hoặc string
    const statusValue = typeof status === 'string' ? status.toLowerCase() : status;

    if (statusValue === 0 || statusValue === 'pending') {
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>;
    }
    if (statusValue === 1 || statusValue === 'approved') {
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</span>;
}

export default function StaffReportsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await reviewAPI.getAllReviewReports({ $orderby: 'createdAt desc', $top: 100 });
            console.log('API Response:', res);
            const data = res.value || res || [];
            console.log('Reports loaded:', data.length, 'items');
            // Log status của mỗi report để debug
            data.forEach(r => console.log('Report:', r.id, 'Status:', r.Status, 'status:', r.status));
            setReports(data);
        } catch (err) {
            console.error('Load error:', err);
            setError('Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    }; const handleApprove = async (reportId) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt báo cáo này?')) return;
        setProcessing(reportId);
        try {
            const response = await reviewAPI.updateReviewReportStatus(reportId, { Status: 1 });
            console.log('Approve response:', response);

            // Cập nhật state local ngay lập tức
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, Status: 1, status: 1 } : r
            ));

            // Reload lại danh sách để đảm bảo sync với server
            setTimeout(() => loadReports(), 500);
            alert('Duyệt báo cáo thành công!');
        } catch (err) {
            console.error('Approve error:', err);
            alert('Xử lý thất bại: ' + (err.message || 'Vui lòng thử lại'));
        } finally {
            setProcessing(null);
        }
    };

    const openReject = (id) => setRejectModal({ open: true, id, reason: '' });

    const handleReject = async () => {
        if (!rejectModal.reason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        setProcessing(rejectModal.id);
        try {
            await reviewAPI.updateReviewReportStatus(rejectModal.id, { Status: 2, RejectReason: rejectModal.reason });

            // Cập nhật state local ngay lập tức
            setReports(prev => prev.map(r =>
                r.id === rejectModal.id ? { ...r, Status: 2, status: 2, RejectReason: rejectModal.reason } : r
            ));

            setRejectModal({ open: false, id: null, reason: '' });

            // Reload lại danh sách để đảm bảo sync với server
            setTimeout(() => loadReports(), 500);
            alert('Từ chối báo cáo thành công!');
        } catch (err) {
            console.error(err);
            alert('Xử lý thất bại, thử lại');
        } finally {
            setProcessing(null);
        }
    };

    const filtered = reports.filter(r => {
        // Backend trả về status dạng string: "Approved", "Rejected", "Pending"
        const status = (r.Status ?? r.status ?? '').toString().toLowerCase();

        if (filter === 'pending') return status === 'pending' || status === '0';
        if (filter === 'approved') return status === 'approved' || status === '1';
        if (filter === 'rejected') return status === 'rejected' || status === '2';
        return true;
    }).filter(r => {
        if (!query) return true;
        const reviewId = r.reviewId || r.ReviewId || '';
        const reason = r.reason || r.Reason || '';
        return reviewId.toString().includes(query) || reason.toLowerCase().includes(query.toLowerCase());
    });

    if (loading) return <div className="p-6">{t('staffReports.loading')}</div>;
    if (error) return <div className="p-6 text-red-600">{t('staffReports.error')}</div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">{t('staffReports.title')}</h1>
                    <p className="text-sm text-gray-500">{t('staffReports.subtitle') || 'Quản lý các báo cáo đánh giá từ chủ nhà'}</p>
                </div>

                <div className="flex items-center gap-3">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('staffReports.searchPlaceholder') || 'Tìm kiếm reviewId hoặc lý do...'} className="px-3 py-2 border rounded-md w-64 bg-white dark:bg-gray-700" />
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t('staffReports.filters.all')}</button>
                        <button onClick={() => setFilter('pending')} className={`px-3 py-2 rounded-md ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t('staffReports.filters.pending')}</button>
                        <button onClick={() => setFilter('approved')} className={`px-3 py-2 rounded-md ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t('staffReports.filters.approved')}</button>
                        <button onClick={() => setFilter('rejected')} className={`px-3 py-2 rounded-md ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t('staffReports.filters.rejected')}</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.length === 0 && (
                    <div className="col-span-full p-6 bg-white dark:bg-gray-800 rounded">{t('staffReports.empty')}</div>
                )}

                {filtered.map(r => {
                    // Backend trả về status dạng string
                    const status = r.Status ?? r.status ?? '';
                    const statusValue = typeof status === 'string' ? status.toLowerCase() : status;
                    const isApproved = statusValue === 'approved' || statusValue === 1;
                    const isRejected = statusValue === 'rejected' || statusValue === 2;

                    return (
                        <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">Review ID</p>
                                    <p className="font-medium break-all">{r.reviewId}</p>
                                </div>
                                <div className="space-x-2">
                                    <StatusBadge status={status} />
                                </div>
                            </div>

                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{r.reason}</p>

                            {r.images && r.images.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {r.images.map((img, idx) => (
                                        <img key={idx} src={img} alt={`img-${idx}`} className="w-full h-20 object-cover rounded" />
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                                <div className="flex items-center gap-2">
                                    <button disabled={processing === r.id || isApproved} onClick={() => handleApprove(r.id)} className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">{processing === r.id ? t('common.processing') || 'Đang...' : t('staffReports.actions.approve')}</button>
                                    <button disabled={processing === r.id || isRejected} onClick={() => openReject(r.id)} className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">{t('staffReports.actions.reject')}</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-2">{t('staffReports.modal.rejectTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('staffReports.modal.rejectMessage') || 'Bạn đang từ chối báo cáo này. Vui lòng nhập lý do:'}</p>
                        <textarea value={rejectModal.reason} onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))} rows={4} className="w-full p-2 border rounded mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRejectModal({ open: false, id: null, reason: '' })} className="px-3 py-2 rounded border">{t('common.cancel')}</button>
                            <button onClick={handleReject} className="px-3 py-2 rounded bg-red-600 text-white">{t('staffReports.modal.confirmReject') || 'Xác nhận từ chối'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
