'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import utilityBillService from '@/services/utilityBillService';
import paymentService from '@/services/paymentService';
import { apiFetch } from '@/utils/api';

export default function BillPaymentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const billId = params.billId;

    const [loading, setLoading] = useState(true);
    const [bill, setBill] = useState(null);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Online'); // Online or Offline
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

    useEffect(() => {
        if (billId) {
            loadBillDetails();
        }
    }, [billId]);

    // Load bank accounts when bill is loaded
    useEffect(() => {
        if (bill) {
            console.log('📋 Bill loaded:', bill);
            // Support both lowercase and uppercase field names
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
            setBill(response);
        } catch (err) {
            console.error('Error loading bill:', err);
            setError('Không thể tải thông tin hóa đơn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const loadOwnerBankAccounts = async () => {
        try {
            setLoadingBankAccounts(true);

            // Support both lowercase and uppercase field names
            const ownerId = bill.ownerId || bill.OwnerId;
            console.log('🏦 Loading bank accounts for owner:', ownerId);
            console.log('🏦 Full bill data:', bill);

            // Gọi endpoint mới với amount để backend generate QR có số tiền
            const amount = bill.amount;
            const description = `Thanh toán hóa đơn ${billId.substring(0, 8).toUpperCase()}`;
            const endpoint = `/api/BankAccount/owner/${ownerId}/bankAccountActive?amount=${amount}&description=${encodeURIComponent(description)}`;
            console.log('🏦 API endpoint:', endpoint);

            const data = await apiFetch(endpoint, {
                method: 'GET'
            });

            console.log('🏦 Bank accounts data:', data);

            // Handle different response formats (OData returns data in 'value' property)
            const accounts = data.value || data.data || data || [];
            console.log('🏦 Parsed accounts:', accounts);

            setBankAccounts(accounts);

            // Auto select first account if available
            if (accounts.length > 0) {
                setSelectedBankAccount(accounts[0]);
                console.log('🏦 Auto-selected account:', accounts[0]);
            } else {
                console.warn('⚠️ No bank accounts found for owner');
            }
        } catch (err) {
            console.error('❌ Error loading bank accounts:', err);
            console.error('❌ Error details:', err.message);
        } finally {
            setLoadingBankAccounts(false);
        }
    };

    const handleOnlinePayment = async () => {
        try {
            setProcessing(true);
            setError(null);

            if (!selectedBankAccount) {
                setError('Vui lòng chọn tài khoản ngân hàng');
                setProcessing(false);
                return;
            }

            // Tạo QR data từ bank account đã chọn
            const qrInfo = {
                billId: billId,
                amount: bill.amount,
                bankName: selectedBankAccount.bankName,
                accountNumber: selectedBankAccount.accountNumber,
                accountName: selectedBankAccount.accountHolderName || 'Chủ trọ',
                transactionContent: `THANHTOAN BILL ${billId.substring(0, 8).toUpperCase()}`,
                qrCodeUrl: selectedBankAccount.imageQR
            };

            setQrData(qrInfo);
            setShowQR(true);
        } catch (err) {
            console.error('Error getting QR:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    const handleOfflinePayment = async () => {
        try {
            setProcessing(true);
            setError(null);

            // Gọi API để tạo payment offline
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Payment/create-offline/${billId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: 'Thanh toán tiền mặt'
                })
            });

            if (!response.ok) {
                throw new Error('Không thể tạo thanh toán offline');
            }

            const data = await response.json();

            if (data.isSuccess) {
                alert('Đã tạo yêu cầu thanh toán tiền mặt. Vui lòng liên hệ chủ trọ để xác nhận.');
                router.push('/bills');
            } else {
                setError(data.message || 'Không thể tạo thanh toán offline');
            }
        } catch (err) {
            console.error('Error creating offline payment:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePayment = () => {
        if (paymentMethod === 'Online') {
            handleOnlinePayment();
        } else {
            handleOfflinePayment();
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!bill) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600">Không tìm thấy hóa đơn</p>
                        <button
                            onClick={() => router.push('/bills')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/bills')}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">💳 Thanh toán hóa đơn</h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Bill Information */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin hóa đơn</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Mã hóa đơn</p>
                                <p className="font-medium">{bill.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Trạng thái</p>
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${utilityBillService.getStatusLabel(bill.status).bgColor} ${utilityBillService.getStatusLabel(bill.status).textColor}`}>
                                    {utilityBillService.getStatusLabel(bill.status).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Ngày tạo</p>
                                <p className="font-medium">{utilityBillService.formatDate(bill.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Số tiền</p>
                                <p className="text-2xl font-bold text-blue-600">{utilityBillService.formatCurrency(bill.amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Accounts List */}
                    {!showQR && paymentMethod === 'Online' && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    🏦 Chọn tài khoản ngân hàng
                                </h2>
                                {bankAccounts.length > 0 && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                        {bankAccounts.length} tài khoản
                                    </span>
                                )}
                            </div>

                            {loadingBankAccounts ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Đang tải danh sách tài khoản...</p>
                                </div>
                            ) : bankAccounts.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-gray-600 font-medium">Chủ trọ chưa thiết lập tài khoản ngân hàng</p>
                                    <p className="text-sm text-gray-500 mt-1">Vui lòng chọn phương thức thanh toán khác</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        💡 Chọn một tài khoản để xem mã QR thanh toán
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bankAccounts.map((account) => (
                                            <div
                                                key={account.id}
                                                onClick={() => setSelectedBankAccount(account)}
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedBankAccount?.id === account.id
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-300 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <input
                                                        type="radio"
                                                        checked={selectedBankAccount?.id === account.id}
                                                        onChange={() => setSelectedBankAccount(account)}
                                                        className="w-4 h-4 text-blue-600 mt-1"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {account.bankName || 'Ngân hàng'}
                                                            </span>
                                                            {account.isDefault && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                    Mặc định
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            STK: {account.accountNumber}
                                                        </p>
                                                        {account.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {account.description}
                                                            </p>
                                                        )}
                                                        {account.imageQR && (
                                                            <div className="mt-3 p-2 bg-white border-2 border-gray-200 rounded-lg inline-block">
                                                                <img
                                                                    src={account.imageQR}
                                                                    alt="QR Code Preview"
                                                                    className="w-24 h-24 object-contain"
                                                                />
                                                                <p className="text-xs text-center text-gray-500 mt-1">
                                                                    Click để chọn
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Method Selection */}
                    {!showQR && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn phương thức thanh toán</h2>

                            <div className="space-y-4">
                                {/* Online Payment */}
                                <div
                                    onClick={() => setPaymentMethod('Online')}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'Online'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'Online'}
                                            onChange={() => setPaymentMethod('Online')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center">
                                                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                </svg>
                                                <span className="font-semibold text-gray-900">Chuyển khoản (QR Code)</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Thanh toán nhanh bằng QR Code qua ứng dụng ngân hàng</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Offline Payment */}
                                <div
                                    onClick={() => setPaymentMethod('Offline')}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'Offline'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'Offline'}
                                            onChange={() => setPaymentMethod('Offline')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center">
                                                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="font-semibold text-gray-900">Tiền mặt</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Thanh toán trực tiếp cho chủ trọ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={processing || (paymentMethod === 'Online' && !selectedBankAccount)}
                                className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-all ${processing || (paymentMethod === 'Online' && !selectedBankAccount)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : paymentMethod === 'Online' && !selectedBankAccount ? (
                                    'Vui lòng chọn tài khoản ngân hàng'
                                ) : (
                                    `Thanh toán ${utilityBillService.formatCurrency(bill.amount)}`
                                )}
                            </button>
                        </div>
                    )}

                    {/* QR Code Display */}
                    {showQR && qrData && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Quét mã QR để thanh toán</h2>

                            <div className="flex flex-col items-center">
                                {/* QR Code Image */}
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                                    <img
                                        src={qrData.qrCodeUrl}
                                        alt="QR Code"
                                        className="w-64 h-64"
                                    />
                                </div>

                                {/* Bank Information */}
                                <div className="w-full max-w-md space-y-3 mb-6">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Ngân hàng:</span>
                                        <span className="font-semibold">{qrData.bankName}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Số tài khoản:</span>
                                        <span className="font-semibold">{qrData.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Chủ tài khoản:</span>
                                        <span className="font-semibold">{qrData.accountName}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-bold text-blue-600 text-lg">{utilityBillService.formatCurrency(qrData.amount)}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <span className="text-gray-600">Nội dung:</span>
                                        <span className="font-semibold text-yellow-800">{qrData.transactionContent}</span>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800 font-semibold mb-2">📱 Hướng dẫn thanh toán:</p>
                                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                        <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                        <li>Chọn chức năng quét mã QR</li>
                                        <li>Quét mã QR ở trên</li>
                                        <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                        <li>Hệ thống sẽ tự động xác nhận sau khi nhận được tiền</li>
                                    </ol>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowQR(false);
                                            setQrData(null);
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Chọn phương thức khác
                                    </button>
                                    <button
                                        onClick={() => router.push('/bills')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Quay lại danh sách
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
