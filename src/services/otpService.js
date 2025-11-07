// src/services/otpService.js
import api from "@/utils/api";

class OtpService {
  constructor() {
    this.mailApiUrl = "/api/Mail";
  }

  // Gửi OTP verification email cho contract signature
  // actor: "Tenant" hoặc "Owner"
  async sendVerificationOtp(email, contractId, actor) {
    try {
      console.log("📧 Sending verification OTP to:", email);
      console.log("📝 Contract ID:", contractId);
      console.log("👤 Actor:", actor);

      // Endpoint mới: /send-otp/{contractId}/{actor}
      // Chỉ cần gửi Email trong body, backend tự generate OTP
      const response = await api.post(`${this.mailApiUrl}/send-otp/${contractId}/${actor}`, {
        Email: email
      });
      console.log("✅ OTP sent successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      console.error("❌ Error details:", error.response?.data);
      throw error;
    }
  }

  // Verify OTP cho contract signature
  // actor: "Tenant" hoặc "Owner"
  async verifyContractOtp(contractId, otp, actor) {
    try {
      console.log("🔍 Verifying OTP for Contract:", contractId);
      console.log("👤 Actor:", actor);

      // Endpoint mới: /verify-otp/{contractId}/{actor}
      const response = await api.post(`${this.mailApiUrl}/verify-otp/${contractId}/${actor}`, {
        Otp: otp
      });
      console.log("✅ OTP verified successfully:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
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
      alert(`Phone OTP sent: ${otp} (This is for testing only)`);

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