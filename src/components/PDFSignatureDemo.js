"use client";
import { useState } from 'react';
import contractPdfService from '@/services/contractPdfService';

/**
 * Demo component to test PDF generation with signature
 * Usage: Add to any page to quickly test PDF functionality
 */
export default function PDFSignatureDemo() {
  const [loading, setLoading] = useState(false);

  // Sample contract data for testing
  const sampleContract = {
    id: "demo-contract-12345678",
    roomName: "Room 101 - Deluxe",
    roomPrice: 5000000,
    depositAmount: 10000000,
    numberOfOccupants: 2,
    checkinDate: "2025-01-01T00:00:00Z",
    checkoutDate: "2025-12-31T23:59:59Z",
    contractStatus: "Active",
    createdAt: new Date().toISOString(),
    ownerId: "owner-abc123",
    
    identityProfiles: [
      {
        fullName: "Nguyễn Văn A",
        phoneNumber: "0123456789",
        email: "tenant@example.com",
        citizenIdNumber: "001234567890",
        citizenIdIssuedDate: "2020-01-01T00:00:00Z",
        citizenIdIssuedPlace: "Công an TP. Hồ Chí Minh",
        dateOfBirth: "1995-05-15T00:00:00Z",
        address: "123 Đường ABC, Quận 1",
        provinceName: "TP. Hồ Chí Minh",
        wardName: "Phường Bến Nghé",
        isSigner: true
      }
    ],
    
    roomDetails: {
      name: "Room 101 - Deluxe",
      address: "123 Đường Lê Văn Việt, Quận 9, TP. Hồ Chí Minh",
      area: 25,
      maxOccupants: 2,
      description: "Phòng rộng rãi, đầy đủ tiện nghi, gần trường đại học"
    },
    
    electricityReading: {
      currentIndex: 1234,
      previousIndex: 1200,
      price: 3500,
      consumption: 34,
      total: 119000,
      readingDate: new Date().toISOString(),
      note: "Chỉ số điện đầu kỳ"
    },
    
    waterReading: {
      currentIndex: 567,
      previousIndex: 550,
      price: 15000,
      consumption: 17,
      total: 255000,
      readingDate: new Date().toISOString(),
      note: "Chỉ số nước đầu kỳ"
    },
    
    notes: "Hợp đồng thử nghiệm - Demo purposes only"
  };

  // Generate a sample signature (red scribble for demo)
  const generateSampleSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw signature-like scribble
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.quadraticCurveTo(80, 50, 120, 80);
    ctx.quadraticCurveTo(140, 100, 160, 70);
    ctx.quadraticCurveTo(180, 50, 200, 90);
    ctx.quadraticCurveTo(220, 120, 250, 100);
    ctx.stroke();
    
    // Add some decorative loops
    ctx.beginPath();
    ctx.arc(150, 75, 20, 0, Math.PI * 1.5, false);
    ctx.stroke();
    
    return canvas.toDataURL('image/png');
  };

  const handlePreview = () => {
    try {
      setLoading(true);
      const tenantSig = generateSampleSignature();
      const ownerSig = generateSampleSignature(); // Same for demo
      
      contractPdfService.previewSignedPdf(
        sampleContract,
        ownerSig,
        tenantSig
      );
    } catch (error) {
      console.error('Error previewing PDF:', error);
      notification.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      setLoading(true);
      const tenantSig = generateSampleSignature();
      const ownerSig = generateSampleSignature();
      
      contractPdfService.downloadSignedPdf(
        sampleContract,
        ownerSig,
        tenantSig
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      notification.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndUpload = async () => {
    try {
      setLoading(true);
      const tenantSig = generateSampleSignature();
      const ownerSig = generateSampleSignature();
      
      notification.info('Creating and uploading PDF...\nThis process may take 3-10 seconds.');
      
      const result = await contractPdfService.generateAndUploadSignedPdf(
        sampleContract,
        ownerSig,
        tenantSig
      );
      
      notification.success(`Upload successful!\n\nPDF URL:\n${result}`);
      console.log('PDF URL:', result);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      notification.error('Upload error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🧪 PDF Signature Demo
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
          <strong>Demo này sử dụng:</strong>
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
          <li>Hợp đồng mẫu với dữ liệu đầy đủ</li>
          <li>Chữ ký tự động generate (scribble đen)</li>
          <li>Tất cả 13 điều khoản hợp đồng</li>
          <li>Thông tin người thuê và chủ trọ</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {loading ? 'Đang tạo PDF...' : '👁️ Xem trước PDF (Preview)'}
        </button>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? 'Đang tạo PDF...' : '⬇️ Tải xuống PDF (Download)'}
        </button>

        <button
          onClick={handleGenerateAndUpload}
          disabled={loading}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {loading ? 'Đang upload...' : '☁️ Tạo & Upload lên Server'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <strong>Chức năng các nút:</strong>
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <li>• <strong>Xem trước:</strong> Mở PDF trong tab mới (không lưu)</li>
          <li>• <strong>Tải xuống:</strong> Download PDF về máy (không lưu server)</li>
          <li>• <strong>Upload:</strong> Tạo PDF và upload lên IPFS server (có URL)</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>💡 Mở DevTools Console để xem chi tiết quá trình tạo PDF</p>
      </div>
    </div>
  );
}
