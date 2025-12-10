'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import utilityBillService from '@/services/utilityBillService';
import paymentService from '@/services/paymentService';
import { useBillNotifications } from '@/hooks/useSignalR';
import { toast } from 'react-toastify';
import { apiFetch } from '@/utils/api';

// Helper function to get bill amount (handles different API field names)
const getBillAmount = (bill) => {
    return bill?.totalAmount || bill?.TotalAmount || bill?.amount || bill?.Amount || 0;
};

// Helper function to get bill status
const getBillStatus = (bill) => {
    return bill?.status || bill?.Status || 'Unknown';
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function BillPaymentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const billId = params.billId;

    const [loading, setLoading] = useState(true);
    const [bill, setBill] = useState(null);
    const [error, setError] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [userId, setUserId] = useState(null);

    // Get user ID for SignalR connection
    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUserId(parsed.id || parsed.userId);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    // Handle real-time payment notifications via SignalR
    const handlePaymentNotification = useCallback((type, data) => {
        console.log(`📢 Payment notification: ${type}`, data);
        
        // Check if this notification is for our current bill
        const notificationBillId = data?.billId || data?.BillId || data?.data?.billId;
        const currentBillIdClean = billId?.replace(/-/g, '').toLowerCase();
        const notificationBillIdClean = notificationBillId?.replace(/-/g, '').toLowerCase();
        
        const isThisBill = notificationBillIdClean === currentBillIdClean || 
                          notificationBillId === billId;
        
        if (type === 'payment_confirmed' && isThisBill) {
            console.log('✅ Payment confirmed via SignalR for this bill!');
            
            // Show success toast immediately
            toast.success(
                <div>
                    <strong>🎉 Thanh toán thành công!</strong>
                    <p>Hóa đơn {formatCurrency(data?.amount || getBillAmount(bill))} đã được thanh toán</p>
                </div>,
                { 
                    autoClose: 5000,
                    position: 'top-center',
                    style: { fontSize: '16px' }
                }
            );
            
            setPaymentSuccess(true);
            
            // Auto redirect after showing success
            setTimeout(() => {
                router.push('/bills');
            }, 3000);
        } else if (type === 'status_updated' && isThisBill) {
            console.log('📊 Bill status updated via SignalR');
            // Reload bill to get new status
            loadBillDetails();
        }
    }, [billId, bill, router]);

    // Connect to SignalR for real-time updates
    const { isConnected } = useBillNotifications(userId, handlePaymentNotification);

    useEffect(() => {
        if (billId) {
            loadBillDetails();
        }
    }, [billId]);

    // Load bank accounts when bill is loaded
    useEffect(() => {
        if (bill) {
            console.log('📋 Bill loaded:', bill);
            const ownerId = bill.ownerId || bill.OwnerId;
            console.log('👤 Owner ID:', ownerId);

            if (ownerId) {
                loadOwnerBankAccounts();
            } else {
                console.error('❌ No ownerId found in bill');
            }
        }
    }, [bill]);

    const loadBillDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await utilityBillService.getBillById(billId);
            console.log('📄 Bill details:', response);
            setBill(response);
        } catch (err) {
            console.error('Error loading bill:', err);
            setError('Unable to load bill information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadOwnerBankAccounts = async () => {
        try {
            setLoadingBankAccounts(true);

            const ownerId = bill.ownerId || bill.OwnerId;

            console.log('🏦 Loading bank accounts for owner:', ownerId);

            // Use external payment API: GET /api/Bank/bank-account/owner/{ownerId}/active
            const externalApiUrl = `https://payment-api-r4zy.onrender.com/api/Bank/bank-account/owner/${ownerId}/active`;
            console.log('🏦 API endpoint:', externalApiUrl);

            // Get auth token
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(externalApiUrl, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🏦 Bank accounts data:', data);

            const accounts = data.value || data.data || data || [];
            console.log('🏦 Parsed accounts:', accounts);

            setBankAccounts(accounts);

            // Auto select first account if available
            if (accounts.length > 0) {
                setSelectedBankAccount(accounts[0]);
                console.log('🏦 Auto-selected account:', accounts[0]);
            }
        } catch (err) {
            console.error('❌ Error loading bank accounts:', err);
        } finally {
            setLoadingBankAccounts(false);
        }
    };

    const handlePayment = async () => {
        try {
            setProcessing(true);
            setError(null);

            if (!selectedBankAccount) {
                setError('Please select a bank account');
                setProcessing(false);
                return;
            }

            const bankAccountId = selectedBankAccount.id || selectedBankAccount.Id;
            const amount = getBillAmount(bill);
            // Remove dashes from billId for description (bank webhook strips dashes from content)
            const description = billId.replace(/-/g, '');

            // Call API to get QR code with amount and description
            const qrApiUrl = `https://payment-api-r4zy.onrender.com/api/Bank/bank-account/${bankAccountId}/qr?amount=${amount}&description=${encodeURIComponent(description)}`;
            console.log('🔗 Fetching QR from:', qrApiUrl);

            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const qrResponse = await fetch(qrApiUrl, {
                method: 'GET',
                headers
            });

            if (!qrResponse.ok) {
                throw new Error(`Failed to get QR code: ${qrResponse.status}`);
            }

            const qrResult = await qrResponse.json();
            console.log('📱 QR API Response:', qrResult);

            // Create QR data from API response - imageQR is the field returned by backend
            const qrCodeUrl = qrResult.imageQR || qrResult.qrDataURL || qrResult.qrCodeUrl || 
                              qrResult.data?.imageQR || qrResult.data?.qrDataURL || 
                              qrResult.value?.imageQR || selectedBankAccount.imageQR;
            
            console.log('📱 QR Code URL:', qrCodeUrl);

            const qrInfo = {
                billId: billId,
                amount: amount,
                bankName: selectedBankAccount.bankName,
                accountNumber: selectedBankAccount.accountNumber,
                accountName: selectedBankAccount.accountHolderName || selectedBankAccount.accountName || 'Owner',
                transactionContent: description,
                qrCodeUrl: qrCodeUrl
            };

            setQrData(qrInfo);
            setShowQR(true);

            // Start polling for payment status
            startPaymentPolling();
        } catch (err) {
            console.error('Error processing payment:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Polling for payment status - check bill status directly (faster polling + toast notification)
    const startPaymentPolling = () => {
        console.log('🔄 Starting payment status polling...');
        
        const pollInterval = setInterval(async () => {
            try {
                console.log('🔍 Checking bill payment status...');
                
                // Reload bill details to check if status changed to "Paid"
                const updatedBill = await utilityBillService.getBillById(billId);
                console.log('💳 Bill status check:', updatedBill);
                
                const status = getBillStatus(updatedBill);
                
                if (status === 'Paid') {
                    console.log('✅ Payment confirmed via polling!');
                    clearInterval(pollInterval);
                    
                    // Show success toast immediately
                    toast.success(
                        <div>
                            <strong>🎉 Thanh toán thành công!</strong>
                            <p>Hóa đơn {formatCurrency(getBillAmount(updatedBill))} đã được xác nhận</p>
                        </div>,
                        { 
                            autoClose: 5000,
                            position: 'top-center',
                            style: { fontSize: '16px' }
                        }
                    );
                    
                    setPaymentSuccess(true);
                    
                    // Auto redirect to bills page after 3 seconds
                    setTimeout(() => {
                        router.push('/bills');
                    }, 3000);
                }
            } catch (err) {
                console.error('Error checking payment status:', err);
            }
        }, 3000); // Check every 3 seconds for faster response

        // Stop polling after 10 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
            console.log('⏱️ Polling timeout - stopped after 10 minutes');
        }, 600000);

        return () => clearInterval(pollInterval);
    };

    // FLOW 2: Manual check payment - COMMENTED OUT
    // Uncomment khi cần backup cho webhook
    /*
    const handleCheckPayment = async () => {
        try {
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`https://payment-api-r4zy.onrender.com/api/Payment/check-payment-manual/${billId}`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.isSuccess || data?.isPaid || data?.data?.isPaid) {
                    setPaymentSuccess(true);
                } else {
                    setError(data?.message || 'Payment not yet confirmed.');
                }
            }
        } catch (err) {
            console.error('Error checking payment:', err);
        }
    };
    */

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            'Unpaid': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Unpaid' },
            'Paid': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid' },
            'Overdue': { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
            'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' }
        };
        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-medium">Loading payment details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!bill) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                    <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Bill Not Found</h2>
                        <p className="text-gray-600 mb-6">The bill you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => router.push('/bills')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Back to Bills
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/bills')}
                            className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Bills
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bill Payment</h1>
                                <p className="text-gray-500">Complete your payment securely</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {!showQR ? (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Left Column - Bill Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Bill Header Card */}
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-sm">Bill ID</p>
                                                    <p className="text-white text-xl font-bold font-mono">
                                                        #{(bill.id || bill.Id || '').toString().substring(0, 8).toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={getBillStatus(bill)} />
                                        </div>

                                        <div className="mt-6 grid grid-cols-3 gap-4">
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                <p className="text-white/70 text-xs">Room</p>
                                                <p className="text-white font-semibold">{bill.roomName || bill.RoomName || '-'}</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                <p className="text-white/70 text-xs">House</p>
                                                <p className="text-white font-semibold truncate">{bill.houseName || bill.HouseName || '-'}</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                                <p className="text-white/70 text-xs">Created</p>
                                                <p className="text-white font-semibold text-sm">{formatDate(bill.createdAt || bill.CreatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charge Details Card */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        Charge Details
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Room Price */}
                                        {(bill.roomPrice || bill.RoomPrice) > 0 && (
                                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl group hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Room Rent</p>
                                                        <p className="text-sm text-gray-500">Monthly rental fee</p>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-indigo-600">{formatCurrency(bill.roomPrice || bill.RoomPrice)}</p>
                                            </div>
                                        )}

                                        {/* Details from API */}
                                        {(bill.details || bill.Details || []).map((detail, index) => {
                                            const type = detail.type || detail.Type;

                                            if (type === 'Electric') {
                                                return (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Electricity</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {detail.previousIndex || detail.PreviousIndex} → {detail.currentIndex || detail.CurrentIndex} kWh
                                                                    <span className="text-amber-600 ml-1">
                                                                        ({detail.consumption || detail.Consumption} × {formatCurrency(detail.unitPrice || detail.UnitPrice)})
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-bold text-amber-600">{formatCurrency(detail.total || detail.Total)}</p>
                                                    </div>
                                                );
                                            }

                                            if (type === 'Water') {
                                                return (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Water</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {detail.previousIndex || detail.PreviousIndex} → {detail.currentIndex || detail.CurrentIndex} m³
                                                                    <span className="text-cyan-600 ml-1">
                                                                        ({detail.consumption || detail.Consumption} × {formatCurrency(detail.unitPrice || detail.UnitPrice)})
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-bold text-cyan-600">{formatCurrency(detail.total || detail.Total)}</p>
                                                    </div>
                                                );
                                            }

                                            if (type === 'Service') {
                                                return (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{detail.serviceName || detail.ServiceName || 'Service'}</p>
                                                                <p className="text-sm text-gray-500">Additional service</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-bold text-violet-600">{formatCurrency(detail.servicePrice || detail.ServicePrice || detail.total || detail.Total)}</p>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}

                                        {/* No details message */}
                                        {(!bill.details && !bill.Details) || (bill.details || bill.Details || []).length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p>No detailed breakdown available</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Payment */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
                                    {/* Total Amount Header */}
                                    <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-center">
                                        <p className="text-emerald-100 text-sm font-medium mb-1">Total Amount</p>
                                        <p className="text-4xl font-extrabold text-white mb-1">{formatCurrency(getBillAmount(bill))}</p>
                                        <p className="text-emerald-100/80 text-xs">Due for payment</p>
                                    </div>

                                    {/* Bank Selection */}
                                    <div className="p-5">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Select Bank Account
                                        </h3>

                                        {loadingBankAccounts ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                                                <p className="mt-3 text-sm text-gray-500">Loading...</p>
                                            </div>
                                        ) : bankAccounts.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm">No Bank Available</p>
                                                <p className="text-xs text-gray-500 mt-1">Contact owner directly</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {bankAccounts.map((account) => (
                                                    <div
                                                        key={account.id}
                                                        onClick={() => setSelectedBankAccount(account)}
                                                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedBankAccount?.id === account.id
                                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20'
                                                            : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {selectedBankAccount?.id === account.id && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedBankAccount?.id === account.id
                                                                ? 'bg-emerald-500'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200'
                                                                }`}>
                                                                <svg className={`w-5 h-5 ${selectedBankAccount?.id === account.id ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-900 text-sm">{account.bankName || 'Bank'}</p>
                                                                <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                                                            </div>
                                                        </div>
                                                        {account.accountHolderName || account.accountName ? (
                                                            <p className="text-xs text-gray-600 mt-2 pl-13 truncate">{account.accountHolderName || account.accountName}</p>
                                                        ) : null}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Payment Button */}
                                        {bankAccounts.length > 0 && (
                                            <button
                                                onClick={handlePayment}
                                                disabled={processing || !selectedBankAccount}
                                                className={`w-full mt-5 px-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 ${processing || !selectedBankAccount
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                                    }`}
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                        </svg>
                                                        Pay Now
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Secure Payment Notice */}
                                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Secure payment via QR code
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : paymentSuccess ? (
                        /* Payment Success */
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto text-center">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                                <p className="text-emerald-100">Your payment has been confirmed</p>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(getBillAmount(bill))}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                    <p className="text-blue-600 text-sm">Redirecting to bills in 3 seconds...</p>
                                </div>
                                <button
                                    onClick={() => router.push('/bills')}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
                                >
                                    Back to Bills Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* QR Code Display */
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center">
                                <h2 className="text-xl font-bold text-white">Scan QR Code to Pay</h2>
                                <p className="text-blue-100 text-sm mt-1">Use your banking app to scan this QR code</p>
                            </div>

                            <div className="p-8">
                                <div className="flex flex-col items-center">
                                    {/* QR Code */}
                                    <div className="bg-white p-4 rounded-2xl border-4 border-gray-100 shadow-inner mb-6">
                                        {qrData?.qrCodeUrl ? (
                                            <img
                                                src={qrData.qrCodeUrl}
                                                alt="Payment QR Code"
                                                className="w-64 h-64 object-contain"
                                            />
                                        ) : (
                                            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                                                <p className="text-gray-500">QR Code not available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount Display */}
                                    <div className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-center mb-6">
                                        <p className="text-emerald-100 text-sm">Amount to Pay</p>
                                        <p className="text-3xl font-bold text-white">{formatCurrency(qrData?.amount)}</p>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="w-full max-w-sm space-y-3 mb-6">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-500 text-sm">Bank</span>
                                            <span className="font-semibold text-gray-900">{qrData?.bankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-500 text-sm">Account Number</span>
                                            <span className="font-mono font-medium text-gray-900">{qrData?.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-500 text-sm">Account Name</span>
                                            <span className="font-medium text-gray-900">{qrData?.accountName}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                            <span className="text-amber-700 text-sm">Reference</span>
                                            <span className="font-mono font-bold text-amber-800">{qrData?.transactionContent}</span>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="w-full max-w-sm bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-blue-800 font-semibold mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Payment Instructions
                                        </p>
                                        <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
                                            <li>Open your mobile banking app</li>
                                            <li>Select QR code scanning feature</li>
                                            <li>Scan the QR code above</li>
                                            <li>Verify the amount and confirm payment</li>
                                            <li>Payment will be confirmed automatically</li>
                                        </ol>
                                    </div>

                                    {/* Auto-checking Status with SignalR indicator */}
                                    <div className="w-full max-w-sm bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
                                                <div>
                                                    <p className="text-emerald-800 font-medium text-sm">Đang chờ thanh toán...</p>
                                                    <p className="text-emerald-600 text-xs">Tự động kiểm tra mỗi 3 giây</p>
                                                </div>
                                            </div>
                                            {/* SignalR Connection Status */}
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                isConnected 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${
                                                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                                }`}></span>
                                                {isConnected ? 'Live' : 'Offline'}
                                            </div>
                                        </div>
                                        {isConnected && (
                                            <p className="text-emerald-600 text-xs mt-2 pl-8">
                                                ✓ Thông báo real-time đã bật - Bạn sẽ nhận thông báo ngay khi thanh toán thành công
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 w-full max-w-sm">
                                        <button
                                            onClick={() => {
                                                setShowQR(false);
                                                setQrData(null);
                                            }}
                                            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => router.push('/bills')}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
