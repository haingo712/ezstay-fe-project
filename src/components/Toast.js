import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div 
      className={`transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg max-w-sm w-full min-w-[300px]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {config.icon}
            <p className={`${config.textColor} text-sm font-medium`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
