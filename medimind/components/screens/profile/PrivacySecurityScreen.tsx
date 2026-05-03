
import React, { useState } from 'react';
import { SecurityIcon } from '../../icons/SecurityIcon';

const Toggle: React.FC<{ checked: boolean, onChange: () => void }> = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

interface PrivacySecurityScreenProps {
    onBack: () => void;
    onInitiatePasswordChange: () => void;
}

const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onBack, onInitiatePasswordChange }) => {
    const [settings, setSettings] = useState({
        dataSharing: false,
        analytics: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacy & Security</h1>
                <div className="w-8"></div>
            </header>

            <div className="p-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Account Security</h2>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 border dark:border-gray-600">
                           <div>
                                <p className="font-semibold dark:text-gray-100">Password</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
                           </div>
                           <button onClick={onInitiatePasswordChange} className="font-semibold text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Change</button>
                        </div>
                         <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 border dark:border-gray-600">
                           <div>
                                <p className="font-semibold dark:text-gray-100">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                           </div>
                           <span className="font-semibold text-sm bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed dark:bg-gray-600 dark:text-gray-400">Coming Soon</span>
                        </div>
                     </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Privacy Settings</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold dark:text-gray-100">Health Data Sharing</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Share health data with caregivers</p>
                            </div>
                            <Toggle checked={settings.dataSharing} onChange={() => toggleSetting('dataSharing')} />
                        </div>
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold dark:text-gray-100">Analytics</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Help improve the app with usage data</p>
                            </div>
                            <Toggle checked={settings.analytics} onChange={() => toggleSetting('analytics')} />
                        </div>
                     </div>
                </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Your Data</h2>
                     <div className="space-y-3">
                        <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50 dark:text-gray-100">Export My Data</button>
                        <button className="w-full text-left p-3 border rounded-lg text-red-600 hover:bg-red-50 dark:border-gray-600 dark:hover:bg-red-900/20 dark:text-red-400">Delete My Account</button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySecurityScreen;