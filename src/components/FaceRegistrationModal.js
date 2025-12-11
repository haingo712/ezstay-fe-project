"use client";
import { useState, useRef, useEffect } from 'react';
import faceLoginService from '@/services/faceLoginService';
import notification from '@/utils/notification';

export default function FaceRegistrationModal({ isOpen, onClose, onSuccess, isUpdate = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stream, setStream] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hasFaceRegistered, setHasFaceRegistered] = useState(false);
  const [checkingFace, setCheckingFace] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionInterval = useRef(null);

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
    setCapturedImage(null);
    setError('');
    setSuccess(false);
    setFaceDetected(false);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 640, facingMode: 'user' }
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
      setError('Unable to access camera. Please check camera permissions.');
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
      if (videoRef.current && videoRef.current.readyState === 4 && !capturedImage) {
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
      // Flip horizontally to match preview
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      setError('');
    }
  };

  const handleRegister = async () => {
    if (!capturedImage) {
      setError('Please capture a photo first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await faceLoginService.registerFace(capturedImage, 'front');
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setError(result.message || 'Face registration failed. Please try again.');
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
    const confirmed = await notification.confirm('Are you sure you want to delete your registered face? You will need to register again to use face login.', 'Confirm Deletion');
    if (!confirmed) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await faceLoginService.deleteFace();
      if (result.success) {
        setHasFaceRegistered(false);
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to delete face. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete face. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setError('');
    setSuccess(false);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  {hasFaceRegistered || isUpdate ? 'Update Face ID' : 'Register Face ID'}
                </h2>
                <p className="text-xs text-white/80">
                  {checkingFace ? 'Checking...' : 
                   loading ? 'Processing...' : 
                   success ? 'Complete!' : 
                   'Capture a front-facing photo'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              disabled={loading}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Alert messages */}
          {error && (
            <div className="mb-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded-r-lg">
              <p className="text-green-700 dark:text-green-300 text-sm">
                🎉 {hasFaceRegistered ? 'Face updated' : 'Face registered'} successfully!
              </p>
            </div>
          )}

          {hasFaceRegistered && !capturedImage && !loading && !success && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r-lg">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                ℹ️ You have already registered a face. Take a new photo to update.
              </p>
            </div>
          )}

          {/* Camera View */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mx-auto" style={{ maxWidth: '280px' }}>
            <div className="aspect-[3/4] relative">
              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Face oval guide */}
                  {stream && (
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                        <defs>
                          <mask id="faceMaskReg">
                            <rect width="100%" height="100%" fill="white"/>
                            <ellipse cx="50%" cy="45%" rx="35%" ry="42%" fill="black"/>
                          </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#faceMaskReg)"/>
                        <ellipse 
                          cx="50%" cy="45%" rx="35%" ry="42%" 
                          fill="none" 
                          stroke={faceDetected ? "#22c55e" : "#8b5cf6"} 
                          strokeWidth="3"
                          strokeDasharray={faceDetected ? "0" : "8 4"}
                          className={faceDetected ? "" : "animate-pulse"}
                        />
                      </svg>
                    </div>
                  )}

                  {/* Face detection badge */}
                  <div className="absolute top-2 right-2">
                    {faceDetected ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Ready
                      </div>
                    ) : (
                      <div className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        Scanning
                      </div>
                    )}
                  </div>

                  {/* Guide text */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1.5 rounded-full">
                    <p className="text-white text-xs text-center whitespace-nowrap">
                      {faceDetected ? '✅ Press capture' : '👤 Position face in frame'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img 
                    src={capturedImage} 
                    alt="Captured face" 
                    className="w-full h-full object-cover"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-white text-sm">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {!capturedImage ? (
              <>
                <button 
                  onClick={capturePhoto} 
                  disabled={!stream || loading}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    faceDetected 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capture
                </button>
                {hasFaceRegistered && (
                  <button 
                    onClick={handleDelete} 
                    disabled={loading}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={handleRegister} 
                  disabled={loading || success}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : success ? (
                    <>✅ Complete!</>
                  ) : (
                    <>{hasFaceRegistered ? '🔄 Update' : '✅ Register'}</>
                  )}
                </button>
                <button 
                  onClick={retake} 
                  disabled={loading || success}
                  className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  Retake
                </button>
              </>
            )}
          </div>

          {/* Tips */}
          {!capturedImage && !success && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Ensure adequate lighting and look directly at the camera
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
