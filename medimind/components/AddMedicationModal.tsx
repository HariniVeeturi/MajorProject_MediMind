
import React, { useState, useRef, useEffect } from 'react';
import { identifyMedicationFromImage } from '../services/geminiService';
import { Medication, FrequencySlot } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { PillIcon } from './icons/PillIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface AddMedicationModalProps {
    onClose: () => void;
    onSave: (med: Omit<Medication, 'id' | 'takenSlots'> | Medication) => void;
    initialAction: 'scan' | 'manual';
    medicationToEdit?: Medication | null;
}

const DEFAULT_TIMES: Record<FrequencySlot, string> = {
    Morning: '08:00',
    Afternoon: '13:00',
    Night: '20:00'
};

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ onClose, onSave, initialAction, medicationToEdit }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequencySlots, setFrequencySlots] = useState<Partial<Record<FrequencySlot, string>>>({});
    const [mfgDate, setMfgDate] = useState('');
    const [expDate, setExpDate] = useState('');
    const [pillsInStrip, setPillsInStrip] = useState<string>('');
    const [scheduleDurationDays, setScheduleDurationDays] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [highlight, setHighlight] = useState(false);
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

    useEffect(() => {
        if (initialAction === 'scan' && !medicationToEdit && !scannedImage) {
            handleScanClick();
        }
    }, [initialAction, medicationToEdit]);

    useEffect(() => {
        if (medicationToEdit) {
            setName(medicationToEdit.name);
            setDosage(medicationToEdit.dosage);
            setFrequencySlots(medicationToEdit.frequencySlots || {});
            setMfgDate(medicationToEdit.manufacturedDate || '');
            setExpDate(medicationToEdit.expiryDate || '');
            setPillsInStrip(medicationToEdit.pillsInStrip !== undefined ? String(medicationToEdit.pillsInStrip) : '');
            setScheduleDurationDays(medicationToEdit.scheduleDurationDays !== undefined ? String(medicationToEdit.scheduleDurationDays) : '');
        }
    }, [medicationToEdit]);

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
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            setScannedImage(base64);
            
            try {
                const dataOnly = base64.split(',')[1];
                const identifiedMed = await identifyMedicationFromImage(dataOnly);
                
                if (identifiedMed && !identifiedMed.error) {
                    if (identifiedMed.name) setName(identifiedMed.name);
                    if (identifiedMed.dosage) setDosage(identifiedMed.dosage);
                    if (identifiedMed.manufacturedDate) setMfgDate(identifiedMed.manufacturedDate);
                    if (identifiedMed.expiryDate) setExpDate(identifiedMed.expiryDate);
                    setHighlight(true);
                    setTimeout(() => setHighlight(false), 2000);
                } else {
                    setError(identifiedMed.error || 'I could not find medicine details. Please enter them manually.');
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

    const toggleSlot = (slot: FrequencySlot) => {
        setFrequencySlots(prev => {
            const next = { ...prev };
            if (next[slot]) {
                delete next[slot];
            } else {
                next[slot] = DEFAULT_TIMES[slot];
            }
            return next;
        });
    };

    const updateSlotTime = (slot: FrequencySlot, time: string) => {
        setFrequencySlots(prev => ({ ...prev, [slot]: time }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const activeSlots = Object.keys(frequencySlots).length;
        if (name && dosage && activeSlots > 0) {
            const medData = { 
                name, dosage, frequencySlots,
                manufacturedDate: mfgDate || undefined, 
                expiryDate: expDate || undefined,
                pillsInStrip: pillsInStrip ? parseInt(pillsInStrip, 10) : undefined,
                scheduleStartDate: medicationToEdit?.scheduleStartDate || new Date().toISOString().split('T')[0],
                scheduleDurationDays: scheduleDurationDays ? parseInt(scheduleDurationDays, 10) : undefined
            };
            onSave(medicationToEdit ? { ...medicationToEdit, ...medData } : medData);
            onClose();
        } else {
            setError(activeSlots === 0 ? 'Please choose at least one dose time.' : 'Please enter the medicine name and dosage.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{medicationToEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                
                {isLoading && (
                    <div className="text-center my-8 p-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-bold text-blue-800 dark:text-blue-100">App is reading the label...</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">Looking for brand, dosage, mfg date, and expiry...</p>
                    </div>
                )}
                
                {!isLoading && scannedImage && (
                    <div className="my-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <img src={scannedImage} alt="Captured label" className="rounded-lg shadow-sm border border-gray-200 w-full max-h-40 object-contain bg-black mx-auto" />
                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => handleScanClick()} className="flex-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                <CameraIcon className="w-5 h-5" /> Retake
                            </button>
                            <button type="button" onClick={() => setScannedImage(null)} className="flex-1 bg-white dark:bg-gray-700 text-red-600 border border-red-100 dark:border-red-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                <TrashIcon className="w-5 h-5" /> Clear
                            </button>
                        </div>
                    </div>
                )}
                
                {!scannedImage && !isLoading && !medicationToEdit && (
                    <div className="mb-6">
                        <button onClick={() => handleScanClick()} className="w-full font-bold py-6 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                            <CameraIcon className="w-8 h-8" /> 
                            <span className="text-lg">Scan Bottle/Strip</span>
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-100 text-sm font-bold my-4 text-center leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">Medicine Name</label>
                            <input type="text" placeholder="e.g., Metformin" value={name} onChange={e => setName(e.target.value)} className={`w-full p-4 border-2 rounded-2xl dark:bg-gray-700 dark:text-white transition-all font-bold text-xl outline-none ${highlight ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-600 focus:border-blue-500'}`} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">Dosage / Strength</label>
                                <input type="text" placeholder="e.g., 500mg or 1 tablet" value={dosage} onChange={e => setDosage(e.target.value)} className={`w-full p-4 border-2 rounded-2xl dark:bg-gray-700 dark:text-white transition-all font-bold outline-none ${highlight ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-600 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">Total Pills</label>
                                <input type="number" placeholder="Pills left" value={pillsInStrip} onChange={e => setPillsInStrip(e.target.value)} className="w-full p-4 border-2 border-gray-100 dark:border-gray-600 rounded-2xl dark:bg-gray-700 dark:text-white font-bold outline-none focus:border-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">Schedule Duration (Days)</label>
                            <input type="number" placeholder="e.g., 30" value={scheduleDurationDays} onChange={e => setScheduleDurationDays(e.target.value)} className="w-full p-4 border-2 border-gray-100 dark:border-gray-600 rounded-2xl dark:bg-gray-700 dark:text-white font-bold outline-none focus:border-blue-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">MFG Date</label>
                                <input type="date" value={mfgDate} onChange={e => setMfgDate(e.target.value)} className={`w-full p-4 border-2 rounded-2xl dark:bg-gray-700 dark:text-white transition-all font-bold text-xs outline-none ${highlight ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-600 focus:border-blue-500'}`} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block tracking-wider">EXP Date</label>
                                <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={`w-full p-4 border-2 rounded-2xl dark:bg-gray-700 dark:text-white transition-all font-bold text-xs outline-none ${highlight ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-600 focus:border-blue-500'}`} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-3 block tracking-wider">Schedule Doses</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Morning', 'Afternoon', 'Night'] as FrequencySlot[]).map((slot) => (
                                <div key={slot} className="space-y-2">
                                    <button type="button" onClick={() => toggleSlot(slot)} className={`w-full p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${frequencySlots[slot] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100' : 'border-gray-100 dark:border-gray-700 text-gray-300'}`}>
                                        {slot === 'Morning' ? <SunIcon className="w-6 h-6"/> : slot === 'Afternoon' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                                        <span className="text-[10px] font-black uppercase">{slot}</span>
                                    </button>
                                    {frequencySlots[slot] && <input type="time" value={frequencySlots[slot]} onChange={(e) => updateSlotTime(slot, e.target.value)} className="w-full p-2 text-xs border border-blue-200 rounded-lg dark:bg-gray-700 text-center font-bold dark:text-white outline-none"/>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 py-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl active:scale-95 transition-transform">Cancel</button>
                        <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-transform">Save Medicine</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicationModal;
