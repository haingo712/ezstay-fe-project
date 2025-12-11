/**
 * SafeImage Component - Wrapper for Next.js Image with error handling
 * Handles null, undefined, empty strings, and broken image URLs
 */

import { useState } from 'react';
import Image from 'next/image';

export default function SafeImage({ 
  src, 
  alt = 'Image', 
  fallbackIcon = '',
  className = '',
  fill = false,
  width,
  height,
  unoptimized = false,
  priority = false,
  objectFit = 'cover'
}) {
  const [imageError, setImageError] = useState(false);
  
  // Check if src is valid
  const isValidSrc = src && typeof src === 'string' && src.trim() !== '';
  const shouldShowImage = isValidSrc && !imageError;
  
  // Auto-detect if image needs unoptimized (IPFS, external sources)
  const needsUnoptimized = unoptimized || (
    isValidSrc && (
      src.includes('ipfs.filebase.io') ||
      src.includes('ipfs.io') ||
      src.startsWith('ipfs://') ||
      src.startsWith('data:')
    )
  );

  if (!shouldShowImage) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 ${className}`}>
        <span className="text-6xl">{fallbackIcon}</span>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${objectFit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`,
    unoptimized: needsUnoptimized,
    priority,
    onError: () => setImageError(true),
  };

  if (fill) {
    imageProps.fill = true;
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  return <Image {...imageProps} />;
}
