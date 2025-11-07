"use client";
import { useRef, useEffect, useState } from 'react';

export default function SignatureCanvas({ 
  width = 400, 
  height = 200, 
  onSignatureChange,
  initialSignature = null,
  disabled = false,
  label = "Digital Signature"
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      // Touch event
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setLastPosition(coords);

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    
    e.preventDefault();
    const coords = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastPosition(coords);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Export signature as base64
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    
    if (onSignatureChange) {
      onSignatureChange(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className="signature-canvas-container">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {!disabled && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`border-2 rounded-lg bg-white touch-none ${
            disabled 
              ? 'border-gray-300 cursor-not-allowed opacity-60' 
              : 'border-gray-400 dark:border-gray-500 hover:border-blue-500 cursor-crosshair'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
        
        {!disabled && (
          <button
            type="button"
            onClick={clearSignature}
            className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded shadow-lg transition-colors"
            disabled={!hasSignature}
          >
            Clear
          </button>
        )}
      </div>

      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ✍️ Draw your signature using mouse or touch
        </p>
      )}

      {disabled && initialSignature && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ✅ Signature verified
        </p>
      )}
    </div>
  );
}
