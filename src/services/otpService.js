// src/services/otpService.js
import api from "@/utils/api";

class OtpService {
  constructor() {
    this.mailApiUrl = "/api/Mail";
  }

  // Gửi OTP verification email cho contract signature
  async sendContractOtp(contractId, email) {
    try {
      console.log("📧 Sending contract OTP to:", email);
      console.log("📝 Contract ID:", contractId);

      // Backend endpoint: POST /api/Mail/send-otp/{contractId}?email={email}
      const response = await api.post(`${this.mailApiUrl}/send-otp/${contractId}?email=${encodeURIComponent(email)}`);
      console.log("✅ OTP sent successfully:", response);
      
      // Response contains otpId that we need for verification
      return response.data || response;
    } catch (error) {
      console.error("❌ Error sending contract OTP:", error);
      console.error("❌ Error details:", error.response?.data);
      throw error;
    }
  }

  // Verify OTP cho contract signature - using contractId
  async verifyContractOtpByContract(contractId, otpCode) {
    try {
      console.log("🔍 Verifying OTP for Contract:", contractId);
      console.log("🔢 OTP Code:", otpCode);

      // Backend endpoint: POST /api/Mail/verify-otp/{contractId}
      // Body: { "Otp": "123456" } - Note: Capital O for Otp
      const response = await api.post(`${this.mailApiUrl}/verify-otp/${contractId}`, {
        Otp: otpCode // Backend expects capital O
      });
      
      console.log("✅ OTP verified successfully:", response);
      return response.data || response;
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  }

  // Verify OTP cho contract signature - using otpId (old method)
  async verifyContractOtp(otpId, otpCode) {
    try {
      console.log("🔍 Verifying OTP ID:", otpId);
      console.log("🔢 OTP Code:", otpCode);

      // Backend endpoint: PUT /api/Mail/verify-otp/{otpId}
      // Body: { "Otp": "123456" } - Note: Capital O for Otp
      const response = await api.put(`${this.mailApiUrl}/verify-otp/${otpId}`, {
        Otp: otpCode // Backend expects capital O
      });
      
      console.log("✅ OTP verified successfully:", response);
      return response.data || response;
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  }

  // Generate a random 6-digit OTP
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP temporarily in localStorage with expiration
  storeOtp(identifier, otp, type = 'email') {
    const expiration = Date.now() + 5 * 60 * 1000; // 5 minutes
    const otpData = {
      otp,
      type,
      identifier,
      expiration
    };
    localStorage.setItem(`otp_${identifier}`, JSON.stringify(otpData));
  }

  // Verify OTP from localStorage
  verifyOtp(identifier, inputOtp) {
    const storedData = localStorage.getItem(`otp_${identifier}`);
    if (!storedData) return false;

    try {
      const { otp, expiration } = JSON.parse(storedData);
      if (Date.now() > expiration) {
        localStorage.removeItem(`otp_${identifier}`);
        return false;
      }

      return otp === inputOtp;
    } catch {
      return false;
    }
  }

  // Clear OTP from storage
  clearOtp(identifier) {
    localStorage.removeItem(`otp_${identifier}`);
  }

  // Request OTP for phone update
  async requestPhoneOtp(phone) {
    try {
      const otp = this.generateOtp();

      // For now, we'll simulate phone OTP by logging it
      // In production, this would integrate with SMS service
      console.log(`📱 Phone OTP for ${phone}: ${otp}`);

      // Store OTP locally for verification
      this.storeOtp(phone, otp, 'phone');

      // Show the OTP to user temporarily (remove in production)
      console.log(`📱 Phone OTP sent: ${otp} (This is for testing only)`);

      return { success: true, message: "OTP sent to phone" };
    } catch (error) {
      console.error("❌ Error requesting phone OTP:", error);
      throw error;
    }
  }

  // Request OTP for email update
  async requestEmailOtp(email) {
    try {
      const otp = this.generateOtp();

      // Send OTP via email
      await this.sendVerificationOtp(email, otp);

      // Store OTP locally for verification
      this.storeOtp(email, otp, 'email');

      return { success: true, message: "OTP sent to email" };
    } catch (error) {
      console.error("❌ Error requesting email OTP:", error);
      throw error;
    }
  }
}

const otpService = new OtpService();
export default otpService;