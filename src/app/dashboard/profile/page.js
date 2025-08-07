'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 123-4567',
    username: 'johndoe',
    dateOfBirth: '1995-06-15',
    gender: 'male',
    occupation: 'Software Engineer',
    emergencyContact: '+1 (555) 987-6543',
    address: '123 Main Street, New York, NY 10001',
    bio: 'Looking for a comfortable and affordable place to stay. I am a clean, responsible tenant who values a peaceful living environment.',
    preferences: {
      maxBudget: 800,
      preferredLocation: 'Downtown',
      roomType: 'private',
      amenities: ['wifi', 'parking', 'laundry', 'gym']
    }
  });

  const [tempData, setTempData] = useState(profileData);
  const [activeTab, setActiveTab] = useState('personal');

  const amenityOptions = [
    { id: 'wifi', name: 'WiFi' },
    { id: 'parking', name: 'Parking' },
    { id: 'laundry', name: 'Laundry' },
    { id: 'gym', name: 'Gym' },
    { id: 'pool', name: 'Swimming Pool' },
    { id: 'kitchen', name: 'Kitchen Access' },
    { id: 'ac', name: 'Air Conditioning' },
    { id: 'heating', name: 'Heating' },
    { id: 'security', name: '24/7 Security' },
    { id: 'elevator', name: 'Elevator' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
    // Here you would typically send the data to your backend
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setTempData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        amenities: prev.preferences.amenities.includes(amenityId)
          ? prev.preferences.amenities.filter(id => id !== amenityId)
          : [...prev.preferences.amenities, amenityId]
      }
    }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentData = isEditing ? tempData : profileData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {currentData.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentData.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{currentData.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentData.email}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Room Preferences
            </button>
          </nav>
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentData.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={currentData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentData.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={currentData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {new Date(currentData.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={currentData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white capitalize">{currentData.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentData.occupation}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emergency Contact
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={currentData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{currentData.emergencyContact}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={currentData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{currentData.address}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={currentData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{currentData.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Room Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Budget (USD/month)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={currentData.preferences.maxBudget}
                    onChange={(e) => handlePreferenceChange('maxBudget', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">${currentData.preferences.maxBudget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.preferences.preferredLocation}
                    onChange={(e) => handlePreferenceChange('preferredLocation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{currentData.preferences.preferredLocation}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Type
                </label>
                {isEditing ? (
                  <select
                    value={currentData.preferences.roomType}
                    onChange={(e) => handlePreferenceChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="studio">Studio Apartment</option>
                    <option value="apartment">Full Apartment</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white capitalize">
                    {currentData.preferences.roomType.replace('-', ' ')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Preferred Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity.id} className="flex items-center">
                    {isEditing ? (
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentData.preferences.amenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {amenity.name}
                        </span>
                      </label>
                    ) : (
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          currentData.preferences.amenities.includes(amenity.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {currentData.preferences.amenities.includes(amenity.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {amenity.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}