// Support Service for EZStay
class SupportService {
  constructor() {
    this.apiUrl = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Support`;
  }

  // Create new support request
  async createSupportRequest(supportData) {
    try {
      console.log("🚀 Creating support request:", supportData);
      
      const response = await fetch(`${this.apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Subject: supportData.subject,
          Description: supportData.description,
          Email: supportData.email,
        }),
      });

      const data = await response.json();
      console.log("📥 Support request response:", data);
      
      if (response.ok) {
        return {
          success: true,
          data: data,
          message: "Yêu cầu hỗ trợ đã được gửi thành công!",
        };
      } else {
        return {
          success: false,
          message: data.message || "Gửi yêu cầu hỗ trợ thất bại. Vui lòng thử lại.",
        };
      }
    } catch (error) {
      console.error("💥 Support request error:", error);
      return {
        success: false,
        message: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
      };
    }
  }

  // Get all support requests (Staff only)
  async getAllSupportRequests() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log("🔑 Token for Support API:", token ? "Present" : "Missing");
      
      if (!token) {
        return {
          success: false,
          message: "Vui lòng đăng nhập để xem danh sách yêu cầu hỗ trợ.",
        };
      }
      
      const response = await fetch(`${this.apiUrl}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("📥 Support API Response Status:", response.status);

      if (response.status === 401) {
        return {
          success: false,
          message: "Phiên đăng nhập hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản Staff.",
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: "Bạn không có quyền truy cập. Chỉ Staff mới có thể xem danh sách yêu cầu hỗ trợ.",
        };
      }

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || "Không thể lấy danh sách yêu cầu hỗ trợ.",
        };
      }
    } catch (error) {
      console.error("💥 Get support requests error:", error);
      return {
        success: false,
        message: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
      };
    }
  }

  // Update support request status (Staff only)
  async updateSupportStatus(id, status) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await fetch(`${this.apiUrl}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          Status: status,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data,
          message: "Cập nhật trạng thái thành công!",
        };
      } else {
        return {
          success: false,
          message: data.message || "Cập nhật trạng thái thất bại.",
        };
      }
    } catch (error) {
      console.error("💥 Update support status error:", error);
      return {
        success: false,
        message: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
      };
    }
  }
}

// Export singleton instance
const supportService = new SupportService();
export default supportService;
