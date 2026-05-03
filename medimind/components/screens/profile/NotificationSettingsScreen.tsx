
import React, { useState } from 'react';
import { BellIcon } from '../../icons/BellIcon';
import { PillIcon } from '../../icons/PillIcon';
import { HeartIcon } from '../../icons/HeartIcon';
import { PhoneIcon } from '../../icons/PhoneIcon';
import { MailIcon } from '../../icons/MailIcon';

const Toggle: React.FC<{ checked: boolean, onChange: () => void }> = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const NotificationItem: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, checked: boolean, onToggle: () => void }> = ({ icon, title, subtitle, checked, onToggle }) => (
    <div className="flex items-center">
        <div className="flex items-center gap-4 flex-grow">
            {icon}
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
        </div>
        <div className="flex-shrink-0">
          <Toggle checked={checked} onChange={onToggle} />
        </div>
    </div>
);

const NotificationSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [settings, setSettings] = useState({
        medReminders: true,
        healthTips: true,
        push: true,
        email: false
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notification Settings</h1>
                <div className="w-8"></div>
            </header>
            
            <div className="p-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-4">
                        <BellIcon className="w-6 h-6" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Notification Types</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Choose which notifications you'd like to receive.</p>
                    <div className="space-y-6">
                        <NotificationItem 
                            icon={<PillIcon className="w-6 h-6 text-blue-500"/>} 
                            title="Medication Reminders" 
                            subtitle="Get reminded when it's time to take your medications" 
                            checked={settings.medReminders} 
                            onToggle={() => toggleSetting('medReminders')}
                        />
                         <NotificationItem 
                            icon={<HeartIcon className="w-6 h-6 text-red-500"/>} 
                            title="Health Tips" 
                            subtitle="Receive daily health tips and wellness advice" 
                            checked={settings.healthTips} 
                            onToggle={() => toggleSetting('healthTips')}
                        />
                    </div>
                </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Delivery Methods</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">How would you like to receive notifications?</p>
                    <div className="space-y-6">
                         <NotificationItem 
                            icon={<PhoneIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>} 
                            title="Push Notifications" 
                            subtitle="Receive notifications on your device" 
                            checked={settings.push} 
                            onToggle={() => toggleSetting('push')}
                        />
                         <NotificationItem 
                            icon={<MailIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>} 
                            title="Email Notifications" 
                            subtitle="Receive notifications via email" 
                            checked={settings.email} 
                            onToggle={() => toggleSetting('email')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsScreen;
