
import React, { useState } from 'react';
import { HealthCondition } from '../../types';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ProfileIcon } from '../icons/ProfileIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface OnboardingScreenProps {
    onComplete: (data: {
        age?: number;
        gender?: string;
        conditions: HealthCondition[];
    }) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex gap-2 w-full max-w-md mx-auto px-4">
        {[1, 2, 3].map(step => (
            <div key={step} className={`h-1.5 rounded-full flex-1 transition-colors ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        ))}
    </div>
);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [age, setAge] = useState('65');
    const [gender, setGender] = useState('Male');
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    
    const healthConditionsOptions = [
        "Diabetes", "Hypertension", "Heart Disease", "Arthritis", 
        "Asthma/COPD", "Thyroid Disorder", "High Cholesterol", "None of the above"
    ];

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleConditionToggle = (condition: string) => {
        setSelectedConditions(prev => {
            if (condition === "None of the above") {
                return prev.includes(condition) ? [] : [condition];
            }
            const newSelection = prev.filter(c => c !== "None of the above");
            return newSelection.includes(condition) 
                ? newSelection.filter(c => c !== condition) 
                : [...newSelection, condition];
        });
    };

    const handleComplete = () => {
        onComplete({
            age: age ? parseInt(age, 10) : undefined,
            gender: gender,
            conditions: selectedConditions.map(name => ({ id: name, name }))
        });
    };

    const handleSkip = () => {
        onComplete({ conditions: [] });
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: return (
                <div className="text-center">
                    <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mt-4 dark:text-gray-100">What's your age?</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">This helps us personalize your health recommendations</p>
                    <div className="mt-8 text-left">
                        <label htmlFor="age" className="font-medium text-gray-700 dark:text-gray-200">Age (years)</label>
                        <input
                            type="number"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full mt-2 p-4 text-lg border-2 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
            );
            case 2: return (
                <div className="text-center">
                    <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                        <ProfileIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mt-4 dark:text-gray-100">How do you identify?</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">This helps with health-specific guidance</p>
                    <div className="mt-8 space-y-3">
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
                            <button key={option} onClick={() => setGender(option)} className={`w-full text-left p-4 border-2 rounded-lg transition-colors flex justify-between items-center ${gender === option ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'}`}>
                                <span className="font-medium dark:text-gray-200">{option}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${gender === option ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {gender === option && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
            case 3: return (
                <div className="text-center">
                     <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                        <HeartIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mt-4 dark:text-gray-100">Health Conditions</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Select all that apply</p>
                    <div className="mt-8 space-y-3">
                        {healthConditionsOptions.map(option => (
                             <button key={option} onClick={() => handleConditionToggle(option)} className={`w-full text-left p-4 border-2 rounded-lg transition-colors flex justify-between items-center ${selectedConditions.includes(option) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700'}`}>
                                <span className="font-medium dark:text-gray-200">{option}</span>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${selectedConditions.includes(option) ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-500'}`}>
                                    {selectedConditions.includes(option) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
            default: return null;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between p-4">
            <div className="w-full">
                <ProgressBar currentStep={step} />
            </div>
            
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {renderStepContent()}
                </div>
            </div>

            <div className="w-full max-w-md mx-auto mt-8">
                <div className="flex justify-center items-center gap-4">
                    {step > 1 && (
                        <button 
                            onClick={handleBack} 
                            className="group flex-1 flex items-center justify-center bg-white text-gray-800 font-semibold text-base py-2 px-2 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 active:bg-red-100 active:text-red-800 active:border-red-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:active:bg-red-900/50 dark:active:text-red-200 dark:active:border-red-700"
                        >
                           <span>Back</span>
                        </button>
                    )}
                    <button 
                        onClick={step === 3 ? handleComplete : handleNext} 
                        className="group flex-1 flex items-center justify-center bg-white text-gray-800 font-semibold text-base py-2 px-2 rounded-xl border border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 active:bg-green-100 active:text-green-800 active:border-green-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:active:bg-green-900/50 dark:active:text-green-200 dark:active:border-green-700"
                    >
                       <span>{step === 3 ? 'Complete Setup' : 'Continue'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
