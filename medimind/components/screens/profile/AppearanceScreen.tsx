
import React from 'react';
import { MoonIcon } from '../../icons/MoonIcon';
import { SunIcon } from '../../icons/SunIcon';
import { SystemIcon } from '../../icons/SystemIcon';

interface AppearanceScreenProps {
    onBack: () => void;
    theme: string;
    setTheme: (theme: string) => void;
}

const ThemeOptionCard: React.FC<{
    label: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}> = ({ label, icon, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-2 rounded-lg transition-colors flex items-center gap-4 ${
                isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-blue-400'
            }`}
        >
            {icon}
            <span className="font-semibold text-gray-800 dark:text-gray-100">{label}</span>
            <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300 dark:border-gray-500'}`}>
                {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
            </div>
        </button>
    );
};


const AppearanceScreen: React.FC<AppearanceScreenProps> = ({ onBack, theme, setTheme }) => {
    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h1>
                <div className="w-8"></div>
            </header>

            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-3">
                        <ThemeOptionCard
                            label="Light"
                            icon={<SunIcon className="w-6 h-6 text-yellow-500" />}
                            isSelected={theme === 'light'}
                            onClick={() => setTheme('light')}
                        />
                        <ThemeOptionCard
                            label="Dark"
                            icon={<MoonIcon className="w-6 h-6 text-indigo-400" />}
                            isSelected={theme === 'dark'}
                            onClick={() => setTheme('dark')}
                        />
                        <ThemeOptionCard
                            label="System"
                            icon={<SystemIcon className="w-6 h-6 text-gray-500" />}
                            isSelected={theme === 'system'}
                            onClick={() => setTheme('system')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceScreen;
