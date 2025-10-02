"use client";
import { useState, useRef, useEffect } from 'react';
import faceLoginService from '@/services/faceLoginService';

export default function FaceRegistrationModal({ isOpen, onClose, onSuccess, isUpdate = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stream, setStream] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hasFaceRegistered, setHasFaceRegistered] = useState(false);
  const [checkingFace, setCheckingFace] = useState(false);
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
      ctx.drawImage(video, 0, 0);
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
      let result;
      if (hasFaceRegistered || isUpdate) {
        result = await faceLoginService.updateFace(capturedImage);
      } else {
        result = await faceLoginService.registerFace(capturedImage);
      }
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.message || 'Face registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Face registration failed. Please try again.');
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
    setCapturedImage(null);
    setError('');
    setSuccess(false);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-indigo-900/20 to-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform transition-all duration-300 scale-100 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {hasFaceRegistered || isUpdate ? 'Update Face ID' : 'Register Face ID'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {checkingFace ? 'Checking...' : !capturedImage ? 'Capture a clear photo of your face' : loading ? (hasFaceRegistered || isUpdate ? 'Updating...' : 'Registering...') : success ? 'Complete!' : 'Review and confirm'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg animate-slideDown">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg animate-slideDown">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 dark:text-green-300 font-medium">
                {hasFaceRegistered || isUpdate ? '🎉 Face updated successfully!' : '🎉 Face registered successfully!'}
              </p>
            </div>
          </div>
        )}
        
        {hasFaceRegistered && !capturedImage && !loading && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">ℹ️ You already have a registered face.</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Capture new photo to update or delete existing one.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-500/20">
          <div className="aspect-video relative">
            {!capturedImage ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{transform:'scaleX(-1)'}} />
                {stream && !faceDetected && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-dashed border-indigo-400/30 animate-pulse rounded-2xl m-8" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {faceDetected ? (
                    <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 animate-bounce">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Face Detected
                    </div>
                  ) : (
                    <div className="bg-gray-700/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      Scanning...
                    </div>
                  )}
                </div>
                {stream && (
                  <>
                    <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-indigo-500 rounded-tl-2xl animate-pulse" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-indigo-500 rounded-tr-2xl animate-pulse" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-indigo-500 rounded-bl-2xl animate-pulse" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-indigo-500 rounded-br-2xl animate-pulse" />
                  </>
                )}
              </>
            ) : (
              <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 flex-wrap">
          {!capturedImage ? (
            <>
              <button onClick={capturePhoto} disabled={!stream || loading} className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg ${faceDetected ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 animate-pulse' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}>
                📸 {faceDetected ? 'Capture Now' : 'Capture Photo'}
              </button>
              {hasFaceRegistered && (
                <button onClick={handleDelete} disabled={loading} className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02]">
                  🗑️ Delete Face
                </button>
              )}
              <button onClick={onClose} className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRegister} disabled={loading || success} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2">
                {loading ? '⏳ ' + (hasFaceRegistered || isUpdate ? 'Updating...' : 'Registering...') : success ? '✅ Success!' : (hasFaceRegistered || isUpdate ? '🔄 Update Face' : '✅ Register Face')}
              </button>
              <button onClick={retake} disabled={loading || success} className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                🔄 Retake
              </button>
            </>
          )}
        </div>
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
