
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = 'Delete', cancelButtonText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
                <h2 id="confirmation-title" className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition">
                        {cancelButtonText}
                    </button>
                    <button onClick={onConfirm} className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition">
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
