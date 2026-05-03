import React from 'react';
import { ProfileSubScreen } from '../../../types';
import { ProfileIcon } from '../../icons/ProfileIcon';
import { BellIcon } from '../../icons/BellIcon';
import { SecurityIcon } from '../../icons/SecurityIcon';
import { HelpIcon } from '../../icons/HelpIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { EyeIcon } from '../../icons/EyeIcon';

interface SettingsScreenProps {
    onBack: () => void;
    onNavigateTo: (screen: ProfileSubScreen) => void;
}

const SettingsMenuItem: React.FC<{ icon: React.ReactNode; label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform transform hover:scale-105">
        <div className="bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
            {icon}
        </div>
        <span className="ml-4 font-semibold text-gray-800 dark:text-gray-100 flex-grow text-left">{label}</span>
        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
    </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigateTo }) => {
    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <div className="w-8"></div>
            </header>
            <div className="p-4 space-y-3 flex-grow">
                <SettingsMenuItem icon={<ProfileIcon className="w-6 h-6" />} label="Personal Information" onClick={() => onNavigateTo('personal-info')} />
                <SettingsMenuItem icon={<BellIcon className="w-6 h-6" />} label="Notification Settings" onClick={() => onNavigateTo('notifications')} />
                <SettingsMenuItem icon={<SecurityIcon className="w-6 h-6" />} label="Privacy & Security" onClick={() => onNavigateTo('privacy')} />
                <SettingsMenuItem icon={<EyeIcon className="w-6 h-6" />} label="Appearance" onClick={() => onNavigateTo('appearance')} />
                <SettingsMenuItem icon={<HelpIcon className="w-6 h-6" />} label="Help & Support" onClick={() => onNavigateTo('help')} />
            </div>
            <footer className="text-center text-gray-500 dark:text-gray-400 p-4">
                <p>MediMind v1.0.0 • Made with care for seniors</p>
            </footer>
        </div>
    );
};

export default SettingsScreen;