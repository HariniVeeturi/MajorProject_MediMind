import React, { useState, useEffect } from 'react';
import { HealthCondition } from '../../../types';
import { HeartIcon } from '../../icons/HeartIcon';
import { PlusIcon } from '../../icons/PlusIcon';

interface HealthConditionsScreenProps {
    initialConditions: HealthCondition[];
    onSave: (conditions: HealthCondition[]) => void;
    onBack: () => void;
}

const commonConditions = [
    "Diabetes", "Hypertension", "Heart Disease", "Arthritis", "Asthma", "COPD",
    "Thyroid Disorder", "Kidney Disease", "Allergies", "Depression", "Anxiety", "Osteoporosis"
];

const HealthConditionsScreen: React.FC<HealthConditionsScreenProps> = ({ initialConditions, onSave, onBack }) => {
    const [conditions, setConditions] = useState<HealthCondition[]>([]);
    const [customCondition, setCustomCondition] = useState('');
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (initialConditions) {
            setConditions(initialConditions);
        }
    }, [initialConditions]);

    const toggleCondition = (name: string) => {
        setSaveStatus('idle');
        setConditions(prev => {
            const exists = prev.find(c => c.name === name);
            if (exists) return prev.filter(c => c.name !== name);
            return [...prev, { id: name, name }];
        });
    };

    const handleAddCustom = () => {
        const trimmed = customCondition.trim();
        if (!trimmed) { setError('Please enter a condition name.'); return; }
        if (conditions.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            setError('Already added.'); return;
        }
        setError('');
        setSaveStatus('idle');
        setConditions(prev => [...prev, { id: trimmed, name: trimmed }]);
        setCustomCondition('');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        onSave(conditions);
        setSaveStatus('saved');
        setTimeout(() => onBack(), 500);
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Health Conditions</h1>
                {/* Save button in header so it's always visible */}
                <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        saveStatus === 'saved'
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    }`}
                >
                    {saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
                </button>
            </header>

            <div className="flex-1 p-4 space-y-5 pb-10">
                {/* Your conditions */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <HeartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Your Conditions</h2>
                        <span className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                            {conditions.length} added
                        </span>
                    </div>

                    {conditions.length === 0 ? (
                        <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                            No conditions added yet. Select from below or type a custom one.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {conditions.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => toggleCondition(c.name)}
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40 dark:hover:text-red-300 transition-colors text-sm"
                                >
                                    {c.name}
                                    <span className="text-base leading-none">×</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Custom input */}
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={customCondition}
                            onChange={(e) => { setCustomCondition(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                            placeholder="Add custom condition..."
                            className="flex-grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddCustom}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition-colors font-bold text-sm"
                        >
                            Add
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                </div>

                {/* Common conditions */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Common Conditions</h2>
                    <div className="flex flex-wrap gap-2">
                        {commonConditions.map(name => {
                            const isSelected = conditions.some(c => c.name === name);
                            return (
                                <button
                                    key={name}
                                    onClick={() => toggleCondition(name)}
                                    className={`font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors text-sm ${
                                        isSelected
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected ? '✓' : <PlusIcon className="w-3.5 h-3.5" />}
                                    <span>{name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom save button (extra, always visible) */}
                <button
                    onClick={handleSave}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-white ${
                        saveStatus === 'saved' ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }`}
                >
                    {saveStatus === 'saved' ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default HealthConditionsScreen;