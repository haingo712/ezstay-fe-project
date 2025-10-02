"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import FaceLoginModal from "@/components/FaceLoginModal";

// Import face-api.js
let faceapi;
if (typeof window !== 'undefined') {
  faceapi = require('face-api.js');
}

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const { signInWithGoogle, signInWithFacebook, loading: socialLoading } = useSocialAuth();
  
  const darkMode = theme === 'dark';

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [showFaceLoginModal, setShowFaceLoginModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectingFace, setDetectingFace] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionBox, setDetectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [detectionStatus, setDetectionStatus] = useState('Preparing...');
  const [isClient, setIsClient] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Client-side only effect
  useEffect(() => {
    setIsClient(true);
    // Load face-api.js models
    loadModels();
  }, []);

  // Load face-api.js models
  const loadModels = async () => {
    if (!faceapi) {
      console.log('❌ face-api.js not available');
      return;
    }
    
    try {
      setLoadingModels(true);
      setDetectionStatus('Loading face detection models...');
      console.log('📦 Loading face-api.js models...');
      
      // Load only the essential models for face detection
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      ]);
      
      setModelsLoaded(true);
      setLoadingModels(false);
      setDetectionStatus('Face detection ready');
      console.log('✅ Face-api.js models loaded successfully');
      
      // Test if models are working
      console.log('🧪 Testing model functionality...');
      try {
        console.log('TinyFaceDetector loaded:', !!faceapi.nets.tinyFaceDetector.params);
        console.log('FaceLandmark68Net loaded:', !!faceapi.nets.faceLandmark68Net.params);
      } catch (testError) {
        console.error('❌ Model test error:', testError);
      }
    } catch (error) {
      console.error('❌ Error loading face-api.js models:', error);
      setLoadingModels(false);
      setDetectionStatus('Failed to load face detection models');
      // Fallback to basic detection if models fail to load
      setModelsLoaded(false);
    }
  };

  // Face detection using face-api.js
  const detectFace = useCallback(async () => {
    console.log('🔍 detectFace called - videoRef:', !!videoRef.current, 'canvasRef:', !!canvasRef.current, 'faceapi:', !!faceapi, 'modelsLoaded:', modelsLoaded);
    
    if (!videoRef.current || !canvasRef.current || !faceapi) {
      console.log('❌ Missing requirements for detection');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready for detection
    if (video.readyState !== 4) {
      console.log('⏳ Video not ready yet, readyState:', video.readyState);
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('📐 Video dimensions not ready:', video.videoWidth, 'x', video.videoHeight);
      return;
    }

    try {
      let detections;
      
      if (modelsLoaded) {
        console.log('🤖 Using AI face detection...');
        // Use face-api.js for accurate detection with lower threshold
        detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320, // Smaller input for better performance
            scoreThreshold: 0.3 // Lower threshold to detect faces easier
          }));
        console.log('🤖 AI detections:', detections?.length || 0, detections);
      } else {
        console.log('💻 Using fallback detection...');
        // Fallback to basic computer vision if models not loaded
        return detectFaceBasic();
      }

      if (detections && detections.length > 0) {
        console.log('✅ Face detected!', detections[0]);
        const detection = detections[0];
        const box = detection.box;
        
        // Calculate position relative to video element
        const videoRect = video.getBoundingClientRect();
        const scaleX = videoRect.width / video.videoWidth;
        const scaleY = videoRect.height / video.videoHeight;
        
        const detectionBoxData = {
          x: box.x * scaleX,
          y: box.y * scaleY,
          width: box.width * scaleX,
          height: box.height * scaleY
        };
        
        console.log('📦 Detection box:', detectionBoxData);
        setDetectionBox(detectionBoxData);
        
        if (!faceDetected) {
          console.log('🎯 Setting face detected to true');
          setFaceDetected(true);
        }
        setDetectionStatus(`✅ Face detected! (Confidence: ${Math.round(detection.score * 100)}%)`);
      } else {
        console.log('❌ No face detected');
        if (faceDetected) {
          console.log('🎯 Setting face detected to false');
          setFaceDetected(false);
        }
        setDetectionStatus('🔍 Looking for face...');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      // Fallback to basic detection on error
      detectFaceBasic();
    }
  }, [modelsLoaded, faceDetected]);

  // Fallback basic face detection using computer vision
  const detectFaceBasic = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Simple skin tone detection for face regions
    const skinPixels = [];
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Basic skin tone detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        skinPixels.push({ x, y });
      }
    }

    // Check if we have enough skin pixels for a face
    if (skinPixels.length > 1000) {
      // Find bounding box of skin pixels
      let minX = canvas.width, minY = canvas.height;
      let maxX = 0, maxY = 0;
      
      for (const pixel of skinPixels) {
        minX = Math.min(minX, pixel.x);
        minY = Math.min(minY, pixel.y);
        maxX = Math.max(maxX, pixel.x);
        maxY = Math.max(maxY, pixel.y);
      }
      
      const faceWidth = maxX - minX;
      const faceHeight = maxY - minY;
      
      // Check if proportions are face-like
      const aspectRatio = faceWidth / faceHeight;
      if (aspectRatio > 0.6 && aspectRatio < 1.4 && faceWidth > 50 && faceHeight > 50) {
        // Calculate position relative to video element
        const videoRect = video.getBoundingClientRect();
        const scaleX = videoRect.width / canvas.width;
        const scaleY = videoRect.height / canvas.height;
        
        setDetectionBox({
          x: minX * scaleX,
          y: minY * scaleY,
          width: faceWidth * scaleX,
          height: faceHeight * scaleY
        });
        
        setFaceDetected(true);
        setDetectionStatus('Face detected! (Basic detection)');
        return;
      }
    }

    // No face detected
    setFaceDetected(false);
    setDetectionStatus('Looking for face...');
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  }, [validationErrors, error]);

  // Improved camera functions with better face detection
  const startCamera = async () => {
    try {
      setDetectionStatus('Starting camera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      setCameraActive(true);
      // Don't set showFaceLogin here - it's handled by handleToggleFaceLogin
      
      console.log('🎥 Camera stream set');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          videoRef.current.play();
          console.log('Video can play');

          // Start face detection after video is playing
          setDetectingFace(true);
          detectionIntervalRef.current = setInterval(detectFace, 500); // Detect every 500ms
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = "Unable to access camera. ";
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera permissions and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera device found.";
      } else if (error.name === 'SecurityError') {
        errorMessage += "Camera access blocked due to security restrictions. Please use HTTPS.";
      } else {
        errorMessage += "Please check your camera permissions and try again.";
      }
      
      setError(errorMessage);
      setDetectionStatus('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setCameraActive(false);
    setDetectingFace(false);
    setFaceDetected(false);
    setShowFaceLogin(false);
    setDetectionStatus('Camera stopped');
  };

  const startFaceDetection = () => {
    console.log('🎯 Starting face detection...');
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    detectionIntervalRef.current = setInterval(() => {
      console.log('🔍 Running face detection cycle...');
      detectFace();
    }, 200); // Check every 200ms for better performance
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
  };

  const handleFaceLogin = async () => {
    if (!faceDetected) {
      setError('No face detected. Please position your face in the detection area.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const photoData = capturePhoto();
      if (!photoData) {
        throw new Error('Failed to capture photo');
      }

      // Here you would typically send the photo to your backend for face recognition
      console.log('Face login photo captured:', photoData.substring(0, 50) + '...');
      
      // Simulate face recognition API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful login
      setSuccess('Face recognition successful! Logging in...');
      
      // Simulate login result
      const result = {
        success: true,
        message: 'Face login successful',
        user: { id: 1, email: 'user@example.com', name: 'Face User' }
      };
      
      if (result.success) {
        // Don't redirect here - let the RedirectIfAuthenticated component and role-based redirect handle it
        // The authentication context will be updated automatically
      }
      
    } catch (error) {
      console.error('Face login error:', error);
      setError('Face recognition failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFaceLogin = async () => {
    console.log('handleToggleFaceLogin called, current showFaceLogin:', showFaceLogin);
    if (showFaceLogin) {
      stopCamera();
      setShowFaceLogin(false);
    } else {
      console.log('Starting camera and showing modal...');
      setShowFaceLogin(true);
      // Ensure models are loaded before starting camera
      if (!modelsLoaded && !loadingModels) {
        await loadModels();
      }
      startCamera();
    }
  };

  // Stop camera and cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } 
    // else if (form.password.length < 6) {
    //   errors.password = "Password must be at least 6 characters";
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔑 Starting login process...");
      const result = await login({
        email: form.email,
        password: form.password,
        remember: form.remember
      });
      
      console.log("🔄 Login result:", result);
      
      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        console.log("✅ Login successful, preparing redirect...");
        
        // Force redirect immediately with user info from result
        const userInfo = result.user;
        if (userInfo && userInfo.role) {
          console.log("🚀 Redirecting with user role:", userInfo.role);
          const userRole = userInfo.role;
          
          setTimeout(() => {
            if (userRole === 2) { // Owner
              console.log("➡️ Redirecting to owner dashboard");
              router.push("/owner");
            } else if (userRole === 3) { // Staff
              console.log("➡️ Redirecting to staff page");
              router.push("/staff");
            } else if (userRole === 4) { // Admin
              console.log("➡️ Redirecting to admin page");
              router.push("/admin");
            } else {
              console.log("➡️ Redirecting to homepage");
              router.push("/");
            }
          }, 200); // Small delay to show success message
        } else {
          console.log("⚠️ No user info in result, falling back to localStorage");
          setTimeout(() => {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userRole = storedUser.role;
            console.log("📦 User from localStorage:", storedUser);
            
            if (userRole === 2) {
              router.push("/owner");
            } else if (userRole === 3) {
              router.push("/staff");
            } else if (userRole === 4) {
              router.push("/admin");
            } else {
              router.push("/");
            }
          }, 200);
        }
        
      } else {
        setError(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleLogin = async () => {
    if (socialLoading || loading) return;
    
    try {
      setError("");
      setSuccess("");
      
      const result = await signInWithGoogle();
      
      if (result.success) {
        setSuccess("Google login successful! Redirecting...");
        setTimeout(() => {
          // Use same redirect logic as regular login
          const userRole = result.user?.role;
          if (userRole === 2) {
            router.push("/owner");
          } else if (userRole === 3) {
            router.push("/staff");
          } else if (userRole === 4) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        setError(result.message || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleFacebookLogin = async () => {
    if (socialLoading || loading) return;
    
    try {
      setError("");
      setSuccess("");
      
      const result = await signInWithFacebook();
      
      if (result.success) {
        setSuccess("Facebook login successful! Redirecting...");
        setTimeout(() => {
          // Use same redirect logic as regular login
          const userRole = result.user?.role;
          if (userRole === 2) {
            router.push("/owner");
          } else if (userRole === 3) {
            router.push("/staff");
          } else if (userRole === 4) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        setError(result.message || "Facebook login failed. Please try again.");
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      setError("Facebook login failed. Please try again.");
    }
  };

  return (
    <RedirectIfAuthenticated>
      {console.log('🎥 RENDER DEBUG - showFaceLogin:', showFaceLogin, 'cameraActive:', cameraActive, 'loadingModels:', loadingModels)}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6m8-6v6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your EZStay account
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8">
          {/* Theme Toggle Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.email ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone number"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="h-5 mt-1">
                {validationErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12 ${
                    validationErrors.password ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.172-3.172a4 4 0 015.656 0M12 12l2.829 2.829-4.242-4.242 2.829-2.829L9.172 9.172M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="h-5 mt-1">
                {validationErrors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || socialLoading}
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {socialLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={loading || socialLoading}
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {socialLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Face Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
              </div>
            </div>

            {/* Face Login Button with AI */}
            <button
              type="button"
              onClick={() => setShowFaceLoginModal(true)}
              disabled={loading}
              className="w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>🤖 Sign In with AI Face Recognition</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Enhanced Face Login Modal */}
        {showFaceLoginModal && (
          <FaceLoginModal
            isOpen={showFaceLoginModal}
            onClose={() => setShowFaceLoginModal(false)}
            onSuccess={(result) => {
              console.log('Face login successful:', result);
              // Handle successful face login
              if (result.user) {
                // Store auth token
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                // Redirect based on role
                router.push(result.user.role === 'Owner' ? '/owner' : '/dashboard');
              }
            }}
          />
        )}
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}