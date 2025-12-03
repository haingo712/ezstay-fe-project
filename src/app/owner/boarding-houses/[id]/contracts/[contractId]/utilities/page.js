"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import utilityReadingService from "@/services/utilityReadingService";
import api from "@/utils/api";

export default function UtilityReadingsPage() {
    const params = useParams();
    const router = useRouter();
    const { id: boardingHouseId, contractId } = params;

    // Contract info
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    // Utility readings
    const [electricReadings, setElectricReadings] = useState([]);
    const [waterReadings, setWaterReadings] = useState([]);
    const [loadingReadings, setLoadingReadings] = useState(false);
    const [activeTab, setActiveTab] = useState('electric');

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingReading, setEditingReading] = useState(null);
    const [editingType, setEditingType] = useState(null);

    const [electricFormData, setElectricFormData] = useState({
        price: '',
        note: '',
        currentIndex: ''
    });
    const [waterFormData, setWaterFormData] = useState({
        price: '',
        note: '',
        currentIndex: ''
    });

    const [savingElectric, setSavingElectric] = useState(false);
    const [savingWater, setSavingWater] = useState(false);
    const [generatingBill, setGeneratingBill] = useState(false);

    // Generate Monthly Bill
    const handleGenerateMonthlyBill = async () => {
        if (!confirm('Are you sure you want to generate a monthly utility bill for this contract?')) {
            return;
        }

        try {
            setGeneratingBill(true);
            console.log('📄 Generating monthly bill for contract:', contractId);

            const response = await api.post(`/api/UtilityBills/monthly/${contractId}`, {});
            console.log('✅ Monthly bill generated:', response);

            toast.success('Monthly bill generated successfully! Redirecting to Bills page...');

            // Navigate to Bills page after successful generation
            setTimeout(() => {
                router.push('/owner/bills');
            }, 1500);
        } catch (error) {
            console.error('❌ Error generating monthly bill:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to generate monthly bill';
            toast.error(errorMessage);
        } finally {
            setGeneratingBill(false);
        }
    };

    // Fetch contract info
    useEffect(() => {
        const fetchContract = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/Contracts/${contractId}`);
                setContract(response);
            } catch (error) {
                console.error('Error fetching contract:', error);
                // Don't show error toast - contract info is optional, we still have contractId
            } finally {
                setLoading(false);
            }
        };

        if (contractId) {
            fetchContract();
            fetchUtilityReadings();
        }
    }, [contractId]);

    // Fetch utility readings
    const fetchUtilityReadings = async () => {
        try {
            setLoadingReadings(true);

            // Fetch Electric readings (type = 1)
            const electricData = await utilityReadingService.getByContractAndType(contractId, 1);
            const sortedElectric = (electricData || []).sort((a, b) =>
                new Date(b.readingDate) - new Date(a.readingDate)
            );
            setElectricReadings(sortedElectric);

            // Fetch Water readings (type = 0)
            const waterData = await utilityReadingService.getByContractAndType(contractId, 0);
            const sortedWater = (waterData || []).sort((a, b) =>
                new Date(b.readingDate) - new Date(a.readingDate)
            );
            setWaterReadings(sortedWater);
        } catch (error) {
            console.error('Error fetching utility readings:', error);
            setElectricReadings([]);
            setWaterReadings([]);
        } finally {
            setLoadingReadings(false);
        }
    };

    // Handlers
    const handleAddReading = () => {
        setEditingReading(null);
        setEditingType(null);
        setElectricFormData({ price: '', note: '', currentIndex: '' });
        setWaterFormData({ price: '', note: '', currentIndex: '' });
        setShowForm(true);
    };

    const handleEditReading = (reading) => {
        const isElectric = reading.type === 'Electric' || reading.type === 1;
        setEditingReading(reading);
        setEditingType(isElectric ? 'electric' : 'water');

        if (isElectric) {
            setElectricFormData({
                price: reading.price?.toString() || '',
                note: reading.note || '',
                currentIndex: reading.currentIndex?.toString() || ''
            });
            setWaterFormData({ price: '', note: '', currentIndex: '' });
        } else {
            setWaterFormData({
                price: reading.price?.toString() || '',
                note: reading.note || '',
                currentIndex: reading.currentIndex?.toString() || ''
            });
            setElectricFormData({ price: '', note: '', currentIndex: '' });
        }
        setShowForm(true);
    };

    const handleDeleteReading = async (readingId) => {
        if (!confirm('Are you sure you want to delete this reading?')) return;

        try {
            await utilityReadingService.delete(readingId);
            toast.success('Reading deleted successfully');
            await fetchUtilityReadings();
        } catch (error) {
            console.error('Error deleting reading:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to delete reading';
            toast.error(errorMessage);
        }
    };

    const handleSaveElectric = async () => {
        if (!electricFormData.currentIndex || parseFloat(electricFormData.currentIndex) < 0) {
            toast.error('Electric: Current index is required and must be >= 0');
            return;
        }
        if (!electricFormData.price || parseFloat(electricFormData.price) < 0) {
            toast.error('Electric: Price is required and must be >= 0');
            return;
        }

        try {
            setSavingElectric(true);

            if (editingReading && editingType === 'electric') {
                await utilityReadingService.update(editingReading.id, {
                    price: electricFormData.price,
                    note: electricFormData.note,
                    currentIndex: electricFormData.currentIndex
                });
                toast.success('Electric reading updated successfully');
                setShowForm(false);
                setEditingReading(null);
                setEditingType(null);
            } else {
                await utilityReadingService.create(contractId, 1, {
                    price: electricFormData.price,
                    note: electricFormData.note,
                    currentIndex: electricFormData.currentIndex
                });
                toast.success('Electric reading created successfully');
                setElectricFormData({ price: '', note: '', currentIndex: '' });
            }

            await fetchUtilityReadings();
            setActiveTab('electric');
        } catch (error) {
            console.error('Error saving electric reading:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to save electric reading';
            toast.error(errorMessage);
        } finally {
            setSavingElectric(false);
        }
    };

    const handleSaveWater = async () => {
        if (!waterFormData.currentIndex || parseFloat(waterFormData.currentIndex) < 0) {
            toast.error('Water: Current index is required and must be >= 0');
            return;
        }
        if (!waterFormData.price || parseFloat(waterFormData.price) < 0) {
            toast.error('Water: Price is required and must be >= 0');
            return;
        }

        try {
            setSavingWater(true);

            if (editingReading && editingType === 'water') {
                await utilityReadingService.update(editingReading.id, {
                    price: waterFormData.price,
                    note: waterFormData.note,
                    currentIndex: waterFormData.currentIndex
                });
                toast.success('Water reading updated successfully');
                setShowForm(false);
                setEditingReading(null);
                setEditingType(null);
            } else {
                await utilityReadingService.create(contractId, 0, {
                    price: waterFormData.price,
                    note: waterFormData.note,
                    currentIndex: waterFormData.currentIndex
                });
                toast.success('Water reading created successfully');
                setWaterFormData({ price: '', note: '', currentIndex: '' });
            }

            await fetchUtilityReadings();
            setActiveTab('water');
        } catch (error) {
            console.error('Error saving water reading:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to save water reading';
            toast.error(errorMessage);
        } finally {
            setSavingWater(false);
        }
    };

    const handleBack = () => {
        router.push(`/owner/boarding-houses/${boardingHouseId}/contracts`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>⚡💧</span> Utility Readings Management
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Contract #{contractId?.slice(0, 8)} - {contract?.roomName || 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Buttons */}
                {!showForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Add Utility Reading Button */}
                        <button
                            onClick={handleAddReading}
                            className="inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-yellow-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all shadow-lg text-lg"
                        >
                            <span className="text-2xl mr-3">⚡💧</span>
                            Add Utility Reading
                        </button>

                        {/* Generate Monthly Bill Button */}
                        <button
                            onClick={handleGenerateMonthlyBill}
                            disabled={generatingBill}
                            className="inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generatingBill ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl mr-3">📄</span>
                                    Generate Monthly Bill
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingReading ? '✏️ Edit Reading' : '➕ Add New Readings'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReading(null);
                                    setEditingType(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Electric Form */}
                            {(!editingReading || editingType === 'electric') && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
                                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center">
                                        <span className="text-2xl mr-2">⚡</span> Electric Reading
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                                                Current Index (kWh) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={electricFormData.currentIndex}
                                                onChange={(e) => setElectricFormData({ ...electricFormData, currentIndex: e.target.value })}
                                                className="w-full p-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter meter reading"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                                                Price per kWh (VND) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={electricFormData.price}
                                                onChange={(e) => setElectricFormData({ ...electricFormData, price: e.target.value })}
                                                className="w-full p-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter price per kWh"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                                                Note
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={electricFormData.note}
                                                onChange={(e) => setElectricFormData({ ...electricFormData, note: e.target.value })}
                                                className="w-full p-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter notes..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveElectric}
                                            disabled={savingElectric}
                                            className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-lg"
                                        >
                                            {savingElectric ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>⚡ {editingReading ? 'Update Electric' : 'Save Electric'}</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Water Form */}
                            {(!editingReading || editingType === 'water') && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                        <span className="text-2xl mr-2">💧</span> Water Reading
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                                Current Index (m³) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={waterFormData.currentIndex}
                                                onChange={(e) => setWaterFormData({ ...waterFormData, currentIndex: e.target.value })}
                                                className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter meter reading"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                                Price per m³ (VND) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={waterFormData.price}
                                                onChange={(e) => setWaterFormData({ ...waterFormData, price: e.target.value })}
                                                className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter price per m³"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                                Note
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={waterFormData.note}
                                                onChange={(e) => setWaterFormData({ ...waterFormData, note: e.target.value })}
                                                className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter notes..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveWater}
                                            disabled={savingWater}
                                            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-lg"
                                        >
                                            {savingWater ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>💧 {editingReading ? 'Update Water' : 'Save Water'}</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reading History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="text-2xl mr-2">📋</span> Reading History
                    </h2>

                    {loadingReadings ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
                                <button
                                    onClick={() => setActiveTab('electric')}
                                    className={`flex-1 px-6 py-4 text-base font-medium transition-colors ${activeTab === 'electric'
                                        ? 'text-yellow-600 border-b-3 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <span className="mr-2">⚡</span>
                                    Electric ({electricReadings.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('water')}
                                    className={`flex-1 px-6 py-4 text-base font-medium transition-colors ${activeTab === 'water'
                                        ? 'text-blue-600 border-b-3 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <span className="mr-2">💧</span>
                                    Water ({waterReadings.length})
                                </button>
                            </div>

                            {/* Table */}
                            {(activeTab === 'electric' ? electricReadings : waterReadings).length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <div className="text-5xl mb-3">{activeTab === 'electric' ? '⚡' : '💧'}</div>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                                        No {activeTab === 'electric' ? 'electric' : 'water'} readings recorded yet
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        Click the button above to add readings
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className={activeTab === 'electric' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}>
                                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reading Date</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Previous</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Current</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Price/Unit</th>
                                                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Note</th>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {(activeTab === 'electric' ? electricReadings : waterReadings).map((reading) => {
                                                const unit = activeTab === 'electric' ? 'kWh' : 'm³';
                                                return (
                                                    <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                            {utilityReadingService.formatDate(reading.readingDate)}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                                                            {reading.previousIndex?.toLocaleString() || '0'}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                                                            {reading.currentIndex?.toLocaleString() || '0'}
                                                        </td>
                                                        <td className={`px-4 py-4 text-sm font-semibold text-right ${activeTab === 'electric' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                            {reading.consumption?.toLocaleString() || '0'} {unit}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 text-right">
                                                            {utilityReadingService.formatCurrency(reading.price || 0)}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                                                            {utilityReadingService.formatCurrency(reading.total || 0)}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={reading.note}>
                                                            {reading.note || '-'}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button
                                                                    onClick={() => handleEditReading(reading)}
                                                                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReading(reading.id)}
                                                                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Summary */}
                            {(electricReadings.length > 0 || waterReadings.length > 0) && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`border-2 rounded-xl p-6 ${activeTab === 'electric' ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'}`}>
                                        <div className="flex items-center">
                                            <span className="text-4xl mr-4">⚡</span>
                                            <div>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Total Electric</p>
                                                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                                                    {utilityReadingService.formatCurrency(
                                                        electricReadings.reduce((sum, r) => sum + (r.total || 0), 0)
                                                    )}
                                                </p>
                                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                    {electricReadings.reduce((sum, r) => sum + (r.consumption || 0), 0).toLocaleString()} kWh
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`border-2 rounded-xl p-6 ${activeTab === 'water' ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'}`}>
                                        <div className="flex items-center">
                                            <span className="text-4xl mr-4">💧</span>
                                            <div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Water</p>
                                                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                                    {utilityReadingService.formatCurrency(
                                                        waterReadings.reduce((sum, r) => sum + (r.total || 0), 0)
                                                    )}
                                                </p>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                                    {waterReadings.reduce((sum, r) => sum + (r.consumption || 0), 0).toLocaleString()} m³
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
