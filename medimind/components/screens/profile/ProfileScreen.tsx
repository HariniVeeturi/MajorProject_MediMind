import React, { useState, useRef } from 'react';
import { User, UserData, ProfileSubScreen, HealthCondition, Screen } from '../../../types';
import { BellIcon } from '../../icons/BellIcon';
import { SettingsIcon } from '../../icons/SettingsIcon';
import { ProfileIcon } from '../../icons/ProfileIcon';
import { HeartIcon } from '../../icons/HeartIcon';
import { EmergencyIcon } from '../../icons/EmergencyIcon';
import { SignOutIcon } from '../../icons/SignOutIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { CameraIcon } from '../../icons/CameraIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import PersonalInfoScreen from './PersonalInfoScreen';
import HealthConditionsScreen from './HealthConditionsScreen';
import NotificationsScreen from './NotificationsScreen';
import PrivacySecurityScreen from './PrivacySecurityScreen';
import HelpSupportScreen from './HelpSupportScreen';
import SettingsScreen from './SettingsScreen';
import AppearanceScreen from './AppearanceScreen';
import ConfirmationModal from '../../ConfirmationModal';

interface ProfileScreenProps {
  user: User;
  userData: UserData;
  onLogout: () => void;
  onNavigateBack: () => void;
  setActiveScreen: (screen: Screen) => void;
  updateUser: (user: User, data: Partial<UserData>) => void;
  updateHealthConditions: (conditions: HealthCondition[]) => void;
  updateProfilePicture: (base64: string) => void;
  deleteProfilePicture: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  onInitiatePasswordChange: () => void;
  notificationSettings: any;
  setNotificationSettings: (settings: any) => void;
}

const ProfileMenuItem: React.FC<{ icon: React.ReactNode; label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform transform active:scale-95">
        <div className="bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 p-3 rounded-lg">
            {icon}
        </div>
        <span className="ml-4 font-semibold text-gray-800 dark:text-gray-100 flex-grow text-left">{label}</span>
        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
    </button>
);

const StatCard: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
    const { 
        user, userData, onLogout, onNavigateBack, setActiveScreen, 
        updateUser, updateHealthConditions, updateProfilePicture, deleteProfilePicture,
        theme, setTheme, onInitiatePasswordChange, notificationSettings, setNotificationSettings
    } = props;

    const [subScreen, setSubScreen] = useState<ProfileSubScreen>('main');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { username } = user;
    const { email, medications, profilePicture, notifications } = userData;
    const unreadCount = notifications.filter(n => !n.read).length;

    // Calculate progress based on takenSlots
    const totalDosesToday = medications.reduce((acc, med) => acc + Object.keys(med.frequencySlots).length, 0);
    const takenDosesToday = medications.reduce((acc, med) => acc + med.takenSlots.length, 0);
    const progress = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 0;

    const handlePictureUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDeletePicture = () => {
        deleteProfilePicture();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (subScreen === 'settings') {
        return <SettingsScreen onBack={() => setSubScreen('main')} onNavigateTo={(screen) => setSubScreen(screen)} />;
    }
    if (subScreen === 'personal-info') {
        return <PersonalInfoScreen user={user} userData={userData} onSave={updateUser} onBack={() => setSubScreen('main')} updateProfilePicture={updateProfilePicture} deleteProfilePicture={deleteProfilePicture} />;
    }
    if (subScreen === 'health-conditions') {
        return <HealthConditionsScreen initialConditions={userData.healthConditions} onSave={updateHealthConditions} onBack={() => setSubScreen('main')} />;
    }
    if (subScreen === 'notifications') {
        return <NotificationsScreen onBack={() => setSubScreen('main')} settings={notificationSettings} setSettings={setNotificationSettings} />;
    }
    if (subScreen === 'privacy') {
        return <PrivacySecurityScreen onBack={() => setSubScreen('main')} onInitiatePasswordChange={onInitiatePasswordChange} />;
    }
    if (subScreen === 'help') {
        return <HelpSupportScreen onBack={() => setSubScreen('main')} />;
    }
    if (subScreen === 'appearance') {
        return <AppearanceScreen onBack={() => setSubScreen('main')} theme={theme} setTheme={setTheme} />;
    }

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full relative">
                <button onClick={onNavigateBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">Profile</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveScreen('notifications')} className="relative text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2" aria-label="Notifications">
                        <BellIcon className="w-6 h-6" />
                         {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4">
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                            </span>
                        )}
                    </button>
                    <button onClick={() => setSubScreen('settings')} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2" aria-label="Settings">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="p-4">
                <div className="bg-gradient-to-b from-blue-500 to-cyan-400 rounded-2xl p-4 text-center text-white shadow-lg relative h-40 mb-16">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center relative group">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold">{username.charAt(0).toUpperCase()}</span>
                            )}
                             <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-3">
                                <button
                                    onClick={handlePictureUpload}
                                    className="bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                    aria-label="Upload new profile picture"
                                >
                                    <CameraIcon className="w-5 h-5" />
                                </button>
                                {profilePicture && (
                                    <button
                                        onClick={handleDeletePicture}
                                        className="bg-white text-red-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                        aria-label="Delete profile picture"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{username}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{email}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 my-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-around">
                    <StatCard value={medications.length} label="Medications" />
                    <div className="border-r border-gray-200 dark:border-gray-600 h-10 self-center"></div>
                    <StatCard value={`${progress}%`} label="Adherence" />
                </div>

                <div className="space-y-3">
                    <ProfileMenuItem icon={<HeartIcon className="w-6 h-6" />} label="Health Conditions" onClick={() => setSubScreen('health-conditions')} />
                    <ProfileMenuItem icon={<EmergencyIcon className="w-6 h-6" />} label="Emergency Contacts" onClick={() => setActiveScreen('emergency-contacts')} />
                </div>
                
                <div className="mt-8">
                    <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center justify-center w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 font-bold transition-all transform active:scale-95 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-800/50">
                        <SignOutIcon className="w-6 h-6 mr-3" />
                        Sign Out
                    </button>
                </div>

                <footer className="text-center text-gray-500 dark:text-gray-400 mt-8 pb-10">
                    <p>MediMind v1.0.1 • Local Health Companion</p>
                </footer>
            </div>
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={onLogout}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmButtonText="Sign Out"
            />
        </div>
    );
};

export default ProfileScreen;