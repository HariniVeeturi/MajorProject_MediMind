
import React, { useState, useRef, useEffect } from 'react';
import { scanPrescriptionFromImage } from '../services/geminiService';
import { Medication, FrequencySlot } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PillIcon } from './icons/PillIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { CheckIcon } from './icons/CheckIcon';

interface PrescriptionScanModalProps {
    onClose: () => void;
    onSaveAll: (meds: Omit<Medication, 'id' | 'takenSlots'>[]) => void;
}

const DEFAULT_TIMES: Record<FrequencySlot, string> = {
    Morning: '08:00',
    Afternoon: '13:00',
    Night: '20:00'
};

const PrescriptionScanModal: React.FC<PrescriptionScanModalProps> = ({ onClose, onSaveAll }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [detectedMeds, setDetectedMeds] = useState<Array<{name: string; dosage: string; slots: FrequencySlot[]}>>([]);
    const [confirmedMeds, setConfirmedMeds] = useState<number[]>([]); // Indices of confirmed meds
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleScanClick = () => {
        if (isOffline) {
            setError("Scanning requires an internet connection.");
            return;
        }
        setError('');
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError('');
        setDetectedMeds([]);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            setScannedImage(base64);
            
            try {
                const dataOnly = base64.split(',')[1];
                const result = await scanPrescriptionFromImage(dataOnly);
                
                if (result.medications && result.medications.length > 0) {
                    const formattedMeds = result.medications.map(m => ({
                        ...m,
                        slots: m.slots.filter(s => ['Morning', 'Afternoon', 'Night'].includes(s)) as FrequencySlot[]
                    }));
                    setDetectedMeds(formattedMeds);
                    // Auto-confirm all by default
                    setConfirmedMeds(formattedMeds.map((_, i) => i));
                } else {
                    setError(result.error || 'No medications found in the prescription. Please try a clearer photo.');
                }
            } catch (err) {
                setError('Connection lost. Please check your signal and try again.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to process image.');
            setIsLoading(false);
        };
    };

    const toggleMedConfirmation = (index: number) => {
        setConfirmedMeds(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleConfirmAll = () => {
        const medsToSave = detectedMeds
            .filter((_, i) => confirmedMeds.includes(i))
            .map(m => {
                const frequencySlots: Partial<Record<FrequencySlot, string>> = {};
                m.slots.forEach(slot => {
                    frequencySlots[slot] = DEFAULT_TIMES[slot];
                });
                return {
                    name: m.name,
                    dosage: m.dosage,
                    frequencySlots,
                    scheduleStartDate: new Date().toISOString().split('T')[0],
                    scheduleDurationDays: 30
                };
            });
        
        if (medsToSave.length > 0) {
            onSaveAll(medsToSave);
            onClose();
        } else {
            setError('Please confirm at least one medication to add.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Prescription Scan</h2>
                        <p className="text-sm text-gray-500">Scan and preview multiple medications</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-100 text-sm font-bold mb-4 flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-800 p-1 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        {error}
                    </div>
                )}

                {!scannedImage && !isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                            <CalendarIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Ready to Scan?</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                            Upload a photo of your prescription. Our app will automatically detect all medicines and their timings for you.
                        </p>
                        <button onClick={handleScanClick} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                            <CameraIcon className="w-6 h-6" />
                            Take Prescription Photo
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center py-10">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200">Analyzing Prescription...</h3>
                        <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-2 font-medium">Finding medications and schedules</p>
                        
                        <div className="mt-8 space-y-3 w-full max-w-[280px]">
                            <div className="h-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 animate-pulse w-3/4"></div>
                            </div>
                            <div className="h-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 animate-pulse w-1/2 ml-auto"></div>
                            </div>
                        </div>
                    </div>
                )}

                {scannedImage && detectedMeds.length > 0 && !isLoading && (
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Review Detected Medications</h3>
                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold">
                                {confirmedMeds.length} Selected
                            </span>
                        </div>
                        
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {detectedMeds.map((med, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => toggleMedConfirmation(idx)}
                                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative group ${
                                        confirmedMeds.includes(idx) 
                                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30' 
                                            : 'border-gray-100 dark:border-gray-700 grayscale opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl ${confirmedMeds.includes(idx) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <PillIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{med.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{med.dosage}</p>
                                            <div className="flex gap-2 mt-2">
                                                {med.slots.map(slot => (
                                                    <span key={slot} className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                                                        {slot === 'Morning' ? <SunIcon className="w-3 h-3"/> : slot === 'Afternoon' ? <SunIcon className="w-3 h-3"/> : <MoonIcon className="w-3 h-3"/>}
                                                        {slot}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            confirmedMeds.includes(idx) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                                        }`}>
                                            {confirmedMeds.includes(idx) && <CheckIcon className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2">
                             <button onClick={handleConfirmAll} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-3xl transition-all shadow-xl active:scale-95">
                                Add to Daily Schedule
                            </button>
                            <button onClick={handleScanClick} className="w-full mt-3 text-indigo-600 dark:text-indigo-400 font-bold py-3 text-sm">
                                Retake Prescription Photo
                            </button>
                        </div>
                    </div>
                )}

                {scannedImage && detectedMeds.length === 0 && !isLoading && !error && (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No medicines were detected.</p>
                        <button onClick={handleScanClick} className="mt-4 text-indigo-600 font-bold underline">Try again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionScanModal;
