'use client';
import React, { useState } from 'react';
import CreateStaffModal from '@/components/admin/CreateStaffModal';
import authService from '@/services/authService'; // Import authService

const UsersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setFeedback({ type: '', message: '' }); // Clear feedback when opening modal
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleCreateStaff = async (staffData) => {
        setIsLoading(true);
        setFeedback({ type: '', message: '' });

        const result = await authService.createStaff(staffData);

        setIsLoading(false);

        if (result.success) {
            setFeedback({ type: 'success', message: result.message });
            setTimeout(() => {
                handleCloseModal();
            }, 2000); // Close modal after 2 seconds on success
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                    Create Staff Account
                </button>
            </div>

            {feedback.message && (
                <div className={`p-4 mb-4 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
            
            {/* User list will go here */}
            <div className="bg-white p-4 rounded-lg shadow">
                <p>User list and management features will be displayed here.</p>
            </div>

            <CreateStaffModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCreate={handleCreateStaff}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UsersPage;
