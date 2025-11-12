"use client";
import PDFSignatureDemo from '@/components/PDFSignatureDemo';

export default function PDFDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PDF Contract Signing Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test tính năng tạo PDF hợp đồng với chữ ký
          </p>
        </div>

        <PDFSignatureDemo />

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📖 Hướng dẫn sử dụng
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold mb-2">1️⃣ Xem trước PDF</h3>
              <p className="text-sm">
                Click nút <strong>"Xem trước PDF"</strong> để mở PDF trong tab mới.
                Bạn sẽ thấy hợp đồng hoàn chỉnh với chữ ký đã được in sẵn.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2️⃣ Tải xuống PDF</h3>
              <p className="text-sm">
                Click nút <strong>"Tải xuống PDF"</strong> để download file PDF về máy.
                File sẽ có tên dạng: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Contract-demo-con-signed-2025-01-11.pdf</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3️⃣ Upload lên Server</h3>
              <p className="text-sm">
                Click nút <strong>"Tạo & Upload"</strong> để upload PDF lên IPFS server.
                Sau khi hoàn tất, bạn sẽ nhận được URL của file PDF (có thể share).
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Lưu ý:</strong> Đây là trang demo với dữ liệu mẫu.
              Trong thực tế, PDF sẽ được tạo tự động sau khi người dùng ký hợp đồng bằng OTP.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Nội dung PDF bao gồm
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Header (CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Thông tin hợp đồng (số HĐ, ngày, trạng thái)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Bên A - Chủ trọ (EZStay)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Bên B - Người thuê (đầy đủ thông tin)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Thông tin phòng (tên, địa chỉ, diện tích)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Giá thuê và tiền cọc</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Ngày nhận/trả phòng</span>
              </li>
            </ul>

            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>13 điều khoản hợp đồng chi tiết</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Quyền và nghĩa vụ các bên</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Chính sách thanh toán</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Danh sách người ở</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Phụ lục hợp đồng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>Chữ ký số của các bên</strong> 🖊️</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Thông tin xác thực và ngày ký</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            📄 File được tạo: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">contractPdfService.js</code>
          </p>
          <p className="mt-1">
            🎨 Component: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">PreviewSignedPDF.js</code>
          </p>
          <p className="mt-1">
            📖 Tài liệu: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">PDF_SIGNING_INTEGRATION.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
