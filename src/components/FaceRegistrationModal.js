"use client";
import { useState, useRef, useEffect } from 'react';
import faceLoginService from '@/services/faceLoginService';

// 3 poses for registration: front, left, right
const POSES = [
  { id: 'front', label: 'Front', icon: '👤', instruction: 'Look straight at the camera' },
  { id: 'left', label: 'Left', icon: '👈', instruction: 'Turn your head slightly to the LEFT' },
  { id: 'right', label: 'Right', icon: '👉', instruction: 'Turn your head slightly to the RIGHT' },
];

export default function FaceRegistrationModal({ isOpen, onClose, onSuccess, isUpdate = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stream, setStream] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasFaceRegistered, setHasFaceRegistered] = useState(false);
  const [checkingFace, setCheckingFace] = useState(false);
  
  // Multi-pose capture state
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState({}); // { front: base64, left: base64, right: base64 }
  const [registrationProgress, setRegistrationProgress] = useState(0); // 0-100%
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionInterval = useRef(null);

  const currentPose = POSES[currentPoseIndex];
  const allPosesCaptured = POSES.every(pose => capturedImages[pose.id]);

  useEffect(() => {
    if (isOpen) {
      checkUserFaces();
      startCamera();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const checkUserFaces = async () => {
    setCheckingFace(true);
    try {
      const result = await faceLoginService.getMyFaces();
      setHasFaceRegistered(result.success && result.count > 0);
    } catch (err) {
      console.error('Failed to check faces:', err);
      setHasFaceRegistered(false);
    } finally {
      setCheckingFace(false);
    }
  };

  const cleanup = () => {
    stopCamera();
    setCapturedImages({});
    setCurrentPoseIndex(0);
    setRegistrationProgress(0);
    setError('');
    setSuccess(false);
    setFaceDetected(false);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
  };

  const startFaceDetection = () => {
    detectionInterval.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4 && !allPosesCaptured) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(canvas.width/4, canvas.height/4, canvas.width/2, canvas.height/2);
          let brightness = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            brightness += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2])/3;
          }
          brightness = brightness/(imageData.data.length/4);
          setFaceDetected(brightness > 40 && brightness < 240);
        }
      }
    }, 500);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Save current pose image
      setCapturedImages(prev => ({
        ...prev,
        [currentPose.id]: imageData
      }));
      
      // Move to next pose or finish
      if (currentPoseIndex < POSES.length - 1) {
        setCurrentPoseIndex(prev => prev + 1);
        setFaceDetected(false);
      }
      
      setError('');
    }
  };

  const retakePose = (poseId) => {
    const poseIndex = POSES.findIndex(p => p.id === poseId);
    setCapturedImages(prev => {
      const newImages = { ...prev };
      delete newImages[poseId];
      return newImages;
    });
    setCurrentPoseIndex(poseIndex);
    if (!stream) {
      startCamera();
    }
  };

  const handleRegister = async () => {
    if (!allPosesCaptured) {
      setError('Please capture all 3 poses first');
      return;
    }
    
    setLoading(true);
    setError('');
    setRegistrationProgress(0);
    
    try {
      // Register each pose one by one using registerFace
      // Backend supports multiple faces per user (MAX_FACES_PER_USER = 5)
      const poseImages = Object.entries(capturedImages);
      let successCount = 0;
      
      for (let i = 0; i < poseImages.length; i++) {
        const [poseId, imageData] = poseImages[i];
        setRegistrationProgress(Math.round(((i + 1) / poseImages.length) * 100));
        
        // Use registerFace for all poses - backend will add to user's face collection
        // Pass label to identify the pose
        const result = await faceLoginService.registerFace(imageData, poseId);
        
        if (result.success) {
          successCount++;
          console.log(`✅ Pose ${poseId} registered successfully`);
        } else {
          console.warn(`⚠️ Pose ${poseId} registration warning:`, result.message);
        }
      }
      
      setRegistrationProgress(100);
      
      if (successCount >= 2) { // At least 2 poses registered successfully
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setError('Face registration failed. Please try again with clearer photos.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.data?.message || err.message || 'Face registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your registered face? You will need to register again to use face login.')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await faceLoginService.deleteFace();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.message || 'Face deletion failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Face deletion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImages({});
    setCurrentPoseIndex(0);
    setRegistrationProgress(0);
    setError('');
    setSuccess(false);
    startCamera();
  };

  if (!isOpen) return null;

  const capturedCount = Object.keys(capturedImages).length;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-indigo-900/20 to-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xl w-full my-2 transform transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {hasFaceRegistered || isUpdate ? 'Update Face ID' : 'Register Face ID'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {checkingFace ? 'Checking...' : 
                 loading ? `Registering... ${registrationProgress}%` : 
                 success ? 'Complete!' : 
                 allPosesCaptured ? 'Review and confirm' :
                 `${capturedCount}/3 - ${currentPose?.instruction}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-1 mb-3">
          {POSES.map((pose, index) => (
            <div key={pose.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                capturedImages[pose.id] 
                  ? 'bg-green-500 text-white' 
                  : index === currentPoseIndex && !allPosesCaptured
                    ? 'bg-indigo-600 text-white animate-pulse ring-2 ring-indigo-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {capturedImages[pose.id] ? '✓' : pose.icon}
              </div>
              {index < POSES.length - 1 && (
                <div className={`w-6 h-0.5 mx-0.5 rounded ${
                  capturedImages[pose.id] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 rounded-lg animate-slideDown">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-2 rounded-lg animate-slideDown">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 dark:text-green-300 text-sm">
                🎉 Face registered successfully!
              </p>
            </div>
          </div>
        )}
        
        {hasFaceRegistered && capturedCount === 0 && !loading && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">ℹ️ You already have a registered face.</p>
              </div>
            </div>
          </div>
        )}

        {/* Captured Images Preview */}
        {capturedCount > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {POSES.map((pose) => (
              <div key={pose.id} className="relative">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  capturedImages[pose.id] ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {capturedImages[pose.id] ? (
                    <>
                      <img src={capturedImages[pose.id]} alt={pose.label} className="w-full h-full object-cover" />
                      <button
                        onClick={() => retakePose(pose.id)}
                        disabled={loading}
                        className="absolute top-0.5 right-0.5 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full text-xs disabled:opacity-50 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl opacity-50">{pose.icon}</span>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs mt-0.5 text-gray-600 dark:text-gray-400">
                  {pose.label} {capturedImages[pose.id] && '✓'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Camera View - only show if not all poses captured */}
        {!allPosesCaptured && (
          <div className="mb-3 relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-indigo-500/20">
            {/* Current pose instruction */}
            <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
              <span className="mr-1">{currentPose?.icon}</span>
              {currentPose?.instruction}
            </div>

            <div className="aspect-[4/3] relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{transform:'scaleX(-1)'}} />
              {stream && !faceDetected && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-dashed border-indigo-400/30 animate-pulse rounded-xl m-4" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                {faceDetected ? (
                  <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ready
                  </div>
                ) : (
                  <div className="bg-gray-700/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                    Scanning
                  </div>
                )}
              </div>
              {stream && (
                <>
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-indigo-500 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-indigo-500 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-indigo-500 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-indigo-500 rounded-br-xl" />
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Progress bar during registration */}
        {loading && (
          <div className="mb-3">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${registrationProgress}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">Registering... {registrationProgress}%</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {!allPosesCaptured ? (
            <>
              <button onClick={capturePhoto} disabled={!stream || loading} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow ${faceDetected ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                📸 {faceDetected ? `Capture ${currentPose?.label}` : 'Position face'}
              </button>
              {hasFaceRegistered && capturedCount === 0 && (
                <button onClick={handleDelete} disabled={loading} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1 shadow">
                  🗑️ Delete
                </button>
              )}
              <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRegister} disabled={loading || success} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center justify-center gap-1.5">
                {loading ? `⏳ ${registrationProgress}%` : success ? '✅ Done!' : '✅ Register 3 Poses'}
              </button>
              <button onClick={retake} disabled={loading || success} className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow">
                🔄 Retake
              </button>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}
