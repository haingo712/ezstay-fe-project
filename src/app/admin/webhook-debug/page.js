'use client';
import { useState } from 'react';

export default function WebhookDebugPage() {
    const [webhookUrl, setWebhookUrl] = useState('https://payment-api-r4zy.onrender.com/api/Payment/webhook/sepay');
    const [testData, setTestData] = useState({
        Gateway: 'MBBank',
        TransactionDate: new Date().toISOString(),
        AccountNumber: '',
        SubAccount: null,
        Code: 'TEST',
        Content: '',
        TransferType: 'in',
        Description: '',
        TransferAmount: 0,
        ReferenceCode: null,
        Accumulated: 0,
        Id: `TEST_${Date.now()}`
    });
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    const addLog = (type, message, data = null) => {
        const log = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type,
            message,
            data
        };
        setLogs(prev => [log, ...prev].slice(0, 50));
    };

    const handleTestWebhook = async () => {
        setLoading(true);
        setResponse(null);

        addLog('info', '🚀 Sending test webhook...', testData);

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            const data = await res.json();
            setResponse({
                status: res.status,
                ok: res.ok,
                data
            });

            if (res.ok) {
                addLog('success', '✅ Webhook processed successfully', data);
            } else {
                addLog('error', '❌ Webhook failed', data);
            }
        } catch (err) {
            setResponse({
                status: 'Error',
                ok: false,
                data: { error: err.message }
            });
            addLog('error', '❌ Request failed', { error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPayment = async () => {
        if (!testData.Content) {
            alert('Please enter Bill ID in Content field');
            return;
        }

        setLoading(true);
        addLog('info', '🔍 Manual payment check...');

        // Extract bill ID from content
        const billIdMatch = testData.Content.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        const billId = billIdMatch ? billIdMatch[1] : testData.Content;

        try {
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const res = await fetch(`https://payment-api-r4zy.onrender.com/api/Payment/check-payment-manual/${billId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            const data = await res.json();
            setResponse({
                status: res.status,
                ok: res.ok,
                data
            });

            if (res.ok) {
                addLog('success', '✅ Payment found!', data);
            } else {
                addLog('warning', '⚠️ Payment not found', data);
            }
        } catch (err) {
            setResponse({
                status: 'Error',
                ok: false,
                data: { error: err.message }
            });
            addLog('error', '❌ Check failed', { error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPaymentStatus = async () => {
        if (!testData.Content) {
            alert('Please enter Bill ID in Content field');
            return;
        }

        setLoading(true);
        addLog('info', '📊 Checking payment status (DB only)...');

        const billIdMatch = testData.Content.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        const billId = billIdMatch ? billIdMatch[1] : testData.Content;

        try {
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const res = await fetch(`https://payment-api-r4zy.onrender.com/api/Payment/check-payment/${billId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            const data = await res.json();
            setResponse({
                status: res.status,
                ok: res.ok,
                data
            });

            addLog(data.isPaid ? 'success' : 'info',
                data.isPaid ? '✅ Bill is PAID' : '⏳ Bill is NOT PAID',
                data);
        } catch (err) {
            setResponse({
                status: 'Error',
                ok: false,
                data: { error: err.message }
            });
            addLog('error', '❌ Status check failed', { error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const generateSampleData = () => {
        const sampleBillId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        setTestData({
            Gateway: 'MBBank',
            TransactionDate: new Date().toISOString(),
            AccountNumber: '0123456789',
            SubAccount: null,
            Code: 'MB001',
            Content: `Thanh toan hoa don ${sampleBillId}`,
            TransferType: 'in',
            Description: `MBVCB.xxxx.Thanh toan hoa don ${sampleBillId}.CT tu xxx`,
            TransferAmount: 1500000,
            ReferenceCode: null,
            Accumulated: 1500000,
            Id: `MB_${Date.now()}`
        });

        addLog('info', '📝 Generated sample webhook data');
    };

    const getLogTypeStyle = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span className="text-4xl">🔧</span>
                        Webhook Debug Tool
                    </h1>
                    <p className="text-gray-400 mt-2">Test and debug SePay webhook integration</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Test Form */}
                    <div className="space-y-6">
                        {/* Webhook URL */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>🌐</span> Webhook URL
                            </h2>
                            <input
                                type="text"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm"
                            />
                        </div>

                        {/* Test Data */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span>📦</span> Webhook Payload
                                </h2>
                                <button
                                    onClick={generateSampleData}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Generate Sample
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Gateway (Bank)</label>
                                    <input
                                        type="text"
                                        value={testData.Gateway}
                                        onChange={(e) => setTestData({ ...testData, Gateway: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Account Number *</label>
                                    <input
                                        type="text"
                                        value={testData.AccountNumber}
                                        onChange={(e) => setTestData({ ...testData, AccountNumber: e.target.value })}
                                        placeholder="Owner's bank account"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-gray-400 text-sm mb-1">Content (must contain Bill ID) *</label>
                                    <input
                                        type="text"
                                        value={testData.Content}
                                        onChange={(e) => setTestData({ ...testData, Content: e.target.value })}
                                        placeholder="Thanh toan hoa don xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">
                                        Format: Full GUID or "BILL XXXXXXXX" or "Thanh toan hoa don [GUID]"
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Transfer Amount *</label>
                                    <input
                                        type="number"
                                        value={testData.TransferAmount}
                                        onChange={(e) => setTestData({ ...testData, TransferAmount: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={testData.Id}
                                        onChange={(e) => setTestData({ ...testData, Id: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            {/* Raw JSON */}
                            <div className="mt-4">
                                <label className="block text-gray-400 text-sm mb-1">Raw JSON Payload</label>
                                <pre className="bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto text-green-400 font-mono">
                                    {JSON.stringify(testData, null, 2)}
                                </pre>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleTestWebhook}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <span>🚀</span>
                                )}
                                Send Webhook
                            </button>
                            <button
                                onClick={handleCheckPayment}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <span>🔍</span>
                                )}
                                Manual Check
                            </button>
                            <button
                                onClick={handleCheckPaymentStatus}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <span>📊</span>
                                )}
                                Check Status
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Response & Logs */}
                    <div className="space-y-6">
                        {/* Response */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>📨</span> Response
                            </h2>
                            {response ? (
                                <div className={`rounded-lg p-4 ${response.ok ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-red-900/30 border border-red-700'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${response.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                                            {response.status}
                                        </span>
                                        <span className={response.ok ? 'text-emerald-400' : 'text-red-400'}>
                                            {response.ok ? 'Success' : 'Failed'}
                                        </span>
                                    </div>
                                    <pre className="text-sm overflow-x-auto text-gray-300 font-mono">
                                        {JSON.stringify(response.data, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl mb-2 block">📭</span>
                                    No response yet. Send a webhook to see results.
                                </div>
                            )}
                        </div>

                        {/* Logs */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span>📋</span> Logs
                                </h2>
                                <button
                                    onClick={() => setLogs([])}
                                    className="text-gray-400 hover:text-white text-sm"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {logs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No logs yet
                                    </div>
                                ) : (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`rounded-lg p-3 border text-sm ${getLogTypeStyle(log.type)}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs opacity-60">{log.time}</span>
                                                <span className="font-medium">{log.message}</span>
                                            </div>
                                            {log.data && (
                                                <pre className="text-xs mt-2 overflow-x-auto opacity-80 font-mono">
                                                    {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span>💡</span> How it works
                            </h2>
                            <div className="space-y-3 text-sm text-gray-400">
                                <div className="flex gap-3">
                                    <span className="text-xl">1️⃣</span>
                                    <div>
                                        <p className="text-white font-medium">User scans QR & transfers money</p>
                                        <p>Content must include Bill ID (GUID format)</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-xl">2️⃣</span>
                                    <div>
                                        <p className="text-white font-medium">SePay sends webhook</p>
                                        <p>POST to /api/Payment/webhook/sepay with transaction data</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-xl">3️⃣</span>
                                    <div>
                                        <p className="text-white font-medium">Backend processes webhook</p>
                                        <p>Parse Bill ID → Create Payment → Update Bill status</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <span className="text-xl">4️⃣</span>
                                    <div>
                                        <p className="text-white font-medium">Frontend polls for status</p>
                                        <p>GET /api/Payment/check-payment/{'{billId}'} every 5 seconds</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                                <p className="text-amber-400 font-medium text-sm">⚠️ Supported Content Formats:</p>
                                <ul className="text-xs text-amber-300 mt-2 space-y-1 font-mono">
                                    <li>• 148a4d2e-8ed5-4d16-abea-10d3974e288f</li>
                                    <li>• 148a4d2e8ed54d16abea10d3974e288f (no dashes)</li>
                                    <li>• BILL 148A4D2E</li>
                                    <li>• Thanh toan hoa don [GUID]</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
