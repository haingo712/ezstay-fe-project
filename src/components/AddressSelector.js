'use client';

import React, { useState, useEffect, useCallback } from 'react';
import vietnamAddressService from '@/services/vietnamAddressService';
import { useTranslation } from '@/hooks/useTranslation';

const AddressSelector = ({
  value = {},
  onChange,
  disabled = false,
  required = false,
  errors = {},
  className = ''
}) => {
  const { t } = useTranslation();
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (value.provinceCode) {
      loadWards(value.provinceCode);
    } else {
      setWards([]);
    }
  }, [value.provinceCode]);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await vietnamAddressService.getAllProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('❌ Error loading provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const loadWards = async (provinceCode) => {
    console.log('🔄 Loading wards for province:', provinceCode);
    setIsLoadingWards(true);
    try {
      const data = await vietnamAddressService.getWardsByProvince(provinceCode);
      console.log('✅ Loaded wards:', data.length, 'wards');
      console.log('📋 First few wards:', data.slice(0, 3));
      setWards(data);
    } catch (error) {
      console.error('❌ Error loading wards:', error);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const handleProvinceChange = useCallback((e) => {
    const provinceCode = parseInt(e.target.value);
    const selectedProvince = provinces.find(p => p.code === provinceCode);

    console.log('🏙️ Province changed:', { provinceCode, provinceName: selectedProvince?.name });

    onChange({
      ...value,
      provinceCode: provinceCode || null,
      provinceName: selectedProvince ? selectedProvince.name : '',
      wardCode: null,
      wardName: ''
    });
  }, [provinces, value, onChange]);

  const handleWardChange = useCallback((e) => {
    const wardCode = parseInt(e.target.value);
    const selectedWard = wards.find(w => w.code === wardCode);

    onChange({
      ...value,
      wardCode: wardCode || null,
      wardName: selectedWard ? selectedWard.name : ''
    });
  }, [wards, value, onChange]);

  const handleAddressChange = useCallback((e) => {
    onChange({
      ...value,
      address: e.target.value
    });
  }, [value, onChange]);

  // Consistent styling với login page và rooms page
  const baseInputClass = `w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium ${disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400' : 'hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
    }`;

  const getInputClass = (fieldName) => {
    const hasError = errors[fieldName];
    return `${baseInputClass} ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800' : 'border-gray-300 dark:border-gray-600'}`;
  };

  const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2";
  const errorClass = "mt-2 text-sm text-red-600 dark:text-red-400 font-medium";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Province Selection */}
      <div className="relative">
        <label className={labelClass}>
          <span className="flex items-center">
            🏙️ {t('profile.province')} {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        <div className="relative">
          <select
            value={value.provinceCode || ''}
            onChange={handleProvinceChange}
            disabled={disabled || isLoadingProvinces}
            className={getInputClass('province')}
          >
            <option value="" className="text-gray-500 dark:text-gray-400">
              {isLoadingProvinces ? `🔄 ${t('common.loading')}` : `📍 ${t('profile.selectProvince')}`}
            </option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code} className="text-gray-900 dark:text-white">
                {province.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.province && (
          <p className={errorClass}>{errors.province}</p>
        )}
      </div>

      {/* Ward Selection */}
      <div className="relative">
        <label className={labelClass}>
          <span className="flex items-center">
            🏘️ {t('profile.ward')} {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        <div className="relative">
          <select
            value={value.wardCode || ''}
            onChange={handleWardChange}
            disabled={disabled || isLoadingWards || !value.provinceCode}
            className={getInputClass('ward')}
          >
            <option value="" className="text-gray-500 dark:text-gray-400">
              {isLoadingWards
                ? `🔄 ${t('common.loading')}`
                : value.provinceCode
                  ? `📍 ${t('profile.selectWard')}`
                  : `👆 ${t('profile.selectProvince')}`
              }
            </option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code} className="text-gray-900 dark:text-white">
                {ward.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.ward && (
          <p className={errorClass}>{errors.ward}</p>
        )}
      </div>

      {/* Detailed Address */}
      <div className="relative">
        <label className={labelClass}>
          <span className="flex items-center">
            🏠 {t('profile.detailAddress')} {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        <div className="relative">
          <textarea
            value={value.address || ''}
            onChange={handleAddressChange}
            disabled={disabled}
            placeholder={t('profile.detailAddress')}
            rows={3}
            className={`${getInputClass('address')} resize-none`}
          />
          <div className="absolute top-3 right-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        {errors.address && (
          <p className={errorClass}>{errors.address}</p>
        )}
      </div>

      {/* Full Address Preview */}
      {(value.address || value.wardName || value.provinceName) && (
        <div className="relative">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📍 {t('profile.address')}
            </h4>
            <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-600">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {vietnamAddressService.getFullAddress(value)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
