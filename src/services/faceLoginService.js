import api from "@/utils/api";

const faceLoginService = {
  // Login with face
  faceLogin: async (imageBase64) => {
    try {
      console.log("🔍 Attempting face login...");
      const response = await api.post('/api/FaceLogin/login', {
        faceImage: imageBase64
      });
      console.log("✅ Face login successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Face login failed:", error);
      throw error;
    }
  },

  // Alias for backward compatibility
  loginWithFace: async (imageBase64) => {
    return faceLoginService.faceLogin(imageBase64);
  },

  // Register face for current user
  registerFace: async (imageBase64, label = null) => {
    try {
      console.log("📸 Registering face for user...");
      const payload = { faceImage: imageBase64 };
      if (label) {
        payload.label = label;
      }
      
      const response = await api.post('/api/FaceLogin/register-face', payload);
      console.log("✅ Face registered successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Face registration failed:", error);
      throw error;
    }
  },

  // Verify face for current user
  verifyFace: async (imageBase64) => {
    try {
      console.log("🔍 Verifying face...");
      const response = await api.post('/api/FaceLogin/verify-face', {
        faceImage: imageBase64
      });
      console.log("✅ Face verification result:", response);
      return response;
    } catch (error) {
      console.error("❌ Face verification failed:", error);
      throw error;
    }
  },

  // Utility: Convert canvas to base64
  canvasToBase64: (canvas) => {
    return canvas.toDataURL('image/jpeg', 0.8);
  },

  // Utility: Convert video frame to base64
  captureVideoFrame: (video, canvas = null) => {
    const canvasElement = canvas || document.createElement('canvas');
    const ctx = canvasElement.getContext('2d');
    
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    return canvasElement.toDataURL('image/jpeg', 0.8);
  },

  // Get all registered faces for current user
  getMyFaces: async () => {
    try {
      console.log("📋 Getting user's registered faces...");
      const response = await api.get('/api/FaceLogin/my-faces');
      console.log("✅ Faces retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to get faces:", error);
      throw error;
    }
  },

  // Update a registered face
  updateFace: async (faceId, imageBase64 = null, label = null) => {
    try {
      console.log("🔄 Updating face...");
      const payload = { faceId: faceId };
      if (imageBase64) {
        payload.faceImage = imageBase64;
      }
      if (label) {
        payload.label = label;
      }
      const response = await api.put('/api/FaceLogin/update-face', payload);
      console.log("✅ Face updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Face update failed:", error);
      throw error;
    }
  },

  // Delete a registered face
  deleteFace: async (faceId) => {
    try {
      console.log(" Deleting face...");
      const response = await api.delete(`/api/FaceLogin/delete-face/${faceId}`);
      console.log("✅ Face deleted successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Face deletion failed:", error);
      throw error;
    }
  },

  // Utility: Validate image quality for face recognition
  validateImageQuality: (imageBase64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const quality = {
          isValid: true,
          width: img.width,
          height: img.height,
          warnings: []
        };

        // Check minimum dimensions
        if (img.width < 200 || img.height < 200) {
          quality.warnings.push("Image resolution is low (recommended: 400x400+)");
        }

        // Check aspect ratio
        const aspectRatio = img.width / img.height;
        if (aspectRatio < 0.5 || aspectRatio > 2.0) {
          quality.warnings.push("Unusual aspect ratio detected");
        }

        resolve(quality);
      };
      img.src = imageBase64;
    });
  }
};

export default faceLoginService;