
import React from 'react';
import { Medication, FrequencySlot } from '../types';
import { PillIcon } from './icons/PillIcon';
import { ClockIcon } from './icons/ClockIcon';

interface MedicationAlertModalProps {
    medication: Medication;
    slot?: FrequencySlot;
    onClose: () => void;
    onTake: (medId: string, slot?: FrequencySlot) => void;
}

const MedicationAlertModal: React.FC<MedicationAlertModalProps> = ({ medication, slot, onClose, onTake }) => {
    
    const handleTake = () => {
        onTake(medication.id, slot);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center transform transition-all animate-slide-up">
                <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <PillIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {slot ? `Time for your ${slot} dose!` : 'Medication Reminder'}
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 my-6 text-left">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{medication.name}</p>
                    <p className="text-gray-600 dark:text-gray-300">{medication.dosage}</p>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-2 font-bold">
                        <ClockIcon className="w-5 h-5" />
                        <span>Scheduled: {slot ? medication.frequencySlots[slot] : 'Now'}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleTake} 
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Mark as Taken
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-100"
                    >
                        Remind me later
                    </button>
                </div>
            </div>
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
.animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
`;
document.head.appendChild(style);

export default MedicationAlertModal;
