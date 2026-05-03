
import React, { useState, useMemo, useEffect } from 'react';
import { Medication, Screen, FrequencySlot } from '../../types';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { PillIcon } from '../icons/PillIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import ConfirmationModal from '../ConfirmationModal';

interface DoseInstance {
    id: string; 
    name: string;
    dosage: string;
    slot: FrequencySlot;
    time: string;
    isTaken: boolean;
    expiryDate?: string;
    manufacturedDate?: string;
    pillsInStrip?: number;
    medication: Medication;
}

const MedicationCard: React.FC<{
    dose: DoseInstance;
    onToggleTaken: (id: string, slot: FrequencySlot) => void;
    onEdit: (med: Medication) => void;
    onInitiateDelete: (med: Medication) => void;
}> = ({ dose, onToggleTaken, onEdit, onInitiateDelete }) => {
    const isExpired = dose.expiryDate && new Date(dose.expiryDate) < new Date();
    const formattedExp = dose.expiryDate ? new Date(dose.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const formattedMfg = dose.manufacturedDate ? new Date(dose.manufacturedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const isLowSupply = dose.pillsInStrip !== undefined && dose.pillsInStrip <= 5;
    
    // Calculate schedule end date
    const scheduleEndDate = dose.medication.scheduleStartDate && dose.medication.scheduleDurationDays 
        ? new Date(new Date(dose.medication.scheduleStartDate).getTime() + (dose.medication.scheduleDurationDays * 24 * 60 * 60 * 1000))
        : null;
    const formattedScheduleEnd = scheduleEndDate ? scheduleEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const isScheduleEnded = scheduleEndDate && scheduleEndDate < new Date();

    const slotIcons: Record<FrequencySlot, React.ReactNode> = {
        Morning: <SunIcon className="w-3 h-3 text-yellow-500" />,
        Afternoon: <SunIcon className="w-3 h-3 text-orange-500" />,
        Night: <MoonIcon className="w-3 h-3 text-indigo-400" />
    };

    return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border transition-all ${dose.isTaken ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/30' : isExpired ? 'border-red-200 bg-red-50 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-700'} flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${dose.isTaken ? 'bg-green-100 dark:bg-green-900/50' : isExpired ? 'bg-red-100 dark:bg-red-900/50' : 'bg-blue-100 dark:bg-gray-700'}`}>
                    {dose.isTaken ? <CheckIcon className="w-6 h-6 text-green-600" /> : <PillIcon className={`w-6 h-6 ${isExpired ? 'text-red-600' : 'text-blue-600'}`} />}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{dose.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{dose.dosage}</span>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                            {slotIcons[dose.slot]} {dose.slot}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-3 h-3 text-blue-500"/>
                    <span>{dose.time}</span>
                </div>
                <button 
                    onClick={() => onToggleTaken(dose.id, dose.slot)}
                    className={`font-black py-2 px-5 text-xs rounded-xl shadow-sm transition-all active:scale-95 ${dose.isTaken ? 'bg-green-100 text-green-700 border border-green-200' : isExpired ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
                >
                    {dose.isTaken ? 'TAKEN' : 'TAKE'}
                </button>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
            {dose.pillsInStrip !== undefined && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isLowSupply ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}`}>
                    <PillIcon className="w-3 h-3" />
                    <span>Inventory: {dose.pillsInStrip} left</span>
                </div>
            )}
            
            <div className="flex gap-2 w-full">
                {dose.manufacturedDate && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-100 dark:border-gray-600">
                        <span className="opacity-60 uppercase">MFG:</span>
                        <span>{formattedMfg}</span>
                    </div>
                )}
                
                {dose.expiryDate && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${isExpired ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600'}`}>
                        <span className="opacity-60 uppercase">EXP:</span>
                        <span>{formattedExp}</span>
                    </div>
                )}

                {formattedScheduleEnd && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${isScheduleEnded ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600'}`}>
                        <span className="opacity-60 uppercase">ENDS:</span>
                        <span>{formattedScheduleEnd}</span>
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex justify-between mt-1">
            <button onClick={() => onInitiateDelete(dose.medication)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
                <TrashIcon className="w-4 h-4" /> Remove
            </button>
             <button onClick={() => onEdit(dose.medication)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
                <EditIcon className="w-4 h-4" /> Edit Details
            </button>
        </div>
    </div>
)};

const QuickActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick?: () => void;
    color: string;
    disabled?: boolean;
}> = ({ icon, title, subtitle, onClick, color, disabled }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 text-left transition-all w-full h-full ${disabled ? 'opacity-50 grayscale' : 'hover:scale-105 active:scale-95'}`}
        >
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap">{title}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
        </button>
    );
};

interface HomeScreenProps {
    username: string;
    medications: Medication[];
    toggleMedicationTaken: (id: string, slot: FrequencySlot) => void;
    resetMedications: () => void;
    onActionClick: (action: 'scan' | 'scan-prescription' | 'manual') => void;
    onEditMedication: (med: Medication) => void;
    deleteMedication: (id: string) => void;
    setActiveScreen: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ username, medications, toggleMedicationTaken, resetMedications, onActionClick, onEditMedication, deleteMedication, setActiveScreen }) => {
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const doseInstances = useMemo(() => {
      const instances: DoseInstance[] = [];
      medications.forEach(med => {
          Object.entries(med.frequencySlots).forEach(([slotStr, time]) => {
              const slot = slotStr as FrequencySlot;
              instances.push({
                  id: med.id,
                  name: med.name,
                  dosage: med.dosage,
                  slot: slot,
                  time: time as string,
                  isTaken: med.takenSlots.includes(slot),
                  expiryDate: med.expiryDate,
                  manufacturedDate: med.manufacturedDate,
                  pillsInStrip: med.pillsInStrip,
                  medication: med
              });
          });
      });
      return instances.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications]);

  const takenCount = doseInstances.filter(d => d.isTaken).length;
  const totalCount = doseInstances.length;
  const allTaken = totalCount > 0 && takenCount === totalCount;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {isOnline ? 'Online' : 'Local Only Mode'}
                </span>
            </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-medium opacity-90">Hello,</p>
                    <h2 className="text-3xl font-bold mt-1 capitalize">{username}</h2>
                    <p className="opacity-80 text-sm mt-1">{today}</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-xs uppercase tracking-tighter">Day's Progress</p>
                    <p className="text-4xl font-bold">{totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0}%</p>
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                <QuickActionCard icon={<PillIcon className="w-5 h-5 text-blue-600" />} title="Add Medicine" subtitle="Manual Entry" color="bg-blue-100" onClick={() => onActionClick('manual')} />
                <QuickActionCard 
                    icon={<CameraIcon className="w-5 h-5 text-cyan-600" />} 
                    title="Scan Bottle/Strip" 
                    subtitle={isOnline ? "Extract label" : "Needs Wi-Fi"} 
                    color="bg-cyan-100" 
                    onClick={() => onActionClick('scan')} 
                    disabled={!isOnline}
                />
                <QuickActionCard 
                    icon={<CalendarIcon className="w-5 h-5 text-indigo-600" />} 
                    title="Scan RX" 
                    subtitle={isOnline ? "Extract schedule" : "Needs Wi-Fi"} 
                    color="bg-indigo-100" 
                    onClick={() => onActionClick('scan-prescription')} 
                    disabled={!isOnline}
                />
                <QuickActionCard icon={<PhoneIcon className="w-5 h-5 text-red-600" />} title="Help List" subtitle="Emergency contacts" color="bg-red-100" onClick={() => setActiveScreen('emergency-contacts')} />
            </div>
        </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Today's Doses</h2>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400 font-bold uppercase">{takenCount}/{totalCount} Done</span>
        </div>

        {allTaken ? (
            <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-200 dark:border-green-800">
                <span className="text-5xl" role="img" aria-label="Party">🌟</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4">Perfect Adherence!</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">You have taken all your doses today.</p>
                <button onClick={resetMedications} className="mt-6 bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-md active:scale-95 transition-transform">Start Next Day</button>
            </div>
        ) : (
            <div className="space-y-3">
                {doseInstances.length > 0 ? (
                    doseInstances.map((dose, idx) => (
                        <MedicationCard 
                            key={`${dose.id}-${dose.slot}-${idx}`} 
                            dose={dose} 
                            onToggleTaken={toggleMedicationTaken} 
                            onEdit={onEditMedication} 
                            onInitiateDelete={(med) => setMedicationToDelete(med)} 
                        />
                    ))
                ) : (
                    <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">Tap "Add Medicine" to begin your schedule.</p>
                    </div>
                )}
            </div>
        )}
      </div>
      
      <ConfirmationModal
          isOpen={!!medicationToDelete}
          onClose={() => setMedicationToDelete(null)}
          onConfirm={() => {
              if (medicationToDelete) {
                  deleteMedication(medicationToDelete.id);
                  setMedicationToDelete(null);
              }
          }}
          title="Delete Medication"
          message={`Remove all doses for ${medicationToDelete?.name}?`}
      />
    </div>
  );
};

export default HomeScreen;
