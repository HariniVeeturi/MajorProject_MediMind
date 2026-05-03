
import React, { useState, useEffect } from 'react';
import { BellIcon } from './icons/BellIcon';

interface NotificationBannerProps {
  toast: { title: string; message: string } | null;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for fade-out animation before clearing message
        setTimeout(onClose, 300);
      }, 5000); // Banner stays for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[100] transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-4">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <BellIcon className="w-6 h-6" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{toast.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{toast.message}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
    </div>
  );
};

export default NotificationBanner;
