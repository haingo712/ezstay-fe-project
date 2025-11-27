"use client";
import { useState } from 'react';
import contractPdfService from '@/services/contractPdfService';

/**
 * Component to preview and download signed contract PDF
 * @param {Object} props
 * @param {Object} props.contract - Contract data
 * @param {string} props.ownerSignature - Owner's signature (base64 data URL)
 * @param {string} props.tenantSignature - Tenant's signature (base64 data URL)
 * @param {string} props.className - Additional CSS classes
 */
export default function PreviewSignedPDF({ 
  contract, 
  ownerSignature = null, 
  tenantSignature = null,
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const handlePreview = () => {
    try {
      setLoading(true);
      contractPdfService.previewSignedPdf(contract, ownerSignature, tenantSignature);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      notification.error('Unable to preview PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      setLoading(true);
      contractPdfService.downloadSignedPdf(contract, ownerSignature, tenantSignature);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      notification.error('Unable to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!contract) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <button
        onClick={handlePreview}
        disabled={loading}
        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
          />
        </svg>
        {loading ? 'Đang tạo...' : 'Xem PDF'}
      </button>

      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
          />
        </svg>
        {loading ? 'Đang tạo...' : 'Tải PDF'}
      </button>
    </div>
  );
}
