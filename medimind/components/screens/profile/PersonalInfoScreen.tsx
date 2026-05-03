
import React, { useState, useRef } from 'react';
import { User, UserData } from '../../../types';
import { ProfileIcon } from '../../icons/ProfileIcon';
import { MailIcon } from '../../icons/MailIcon';
import { PhoneIcon } from '../../icons/PhoneIcon';
import { CalendarIcon } from '../../icons/CalendarIcon';
import { SaveIcon } from '../../icons/SaveIcon';
import { CameraIcon } from '../../icons/CameraIcon';
import { TrashIcon } from '../../icons/TrashIcon';

interface PersonalInfoScreenProps {
    user: User;
    userData: UserData;
    onSave: (user: User, data: Partial<UserData>) => void;
    onBack: () => void;
    updateProfilePicture: (base64: string) => void;
    deleteProfilePicture: () => void;
}

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ user, userData, onSave, onBack, updateProfilePicture, deleteProfilePicture }) => {
    const [fullName, setFullName] = useState(user.username);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [age, setAge] = useState(userData.age ? String(userData.age) : '');
    const [gender, setGender] = useState(userData.gender || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveChanges = () => {
        onSave(
            { ...user, username: fullName, phoneNumber },
            { age: age ? parseInt(age, 10) : undefined, gender }
        );
        onBack();
    };

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

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Your Details</h1>
                <div className="w-8"></div>
            </header>

            <div className="p-4 space-y-6">
                <div className="flex justify-center items-center">
                    <div className="w-24 h-24 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center relative group shadow-md">
                        {userData.profilePicture ? (
                            <img src={userData.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
                        )}
                         <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-3">
                            <button
                                onClick={handlePictureUpload}
                                className="bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                aria-label="Upload new profile picture"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            {userData.profilePicture && (
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


                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                            <div className="relative mt-1">
                                <ProfileIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Enter your full name" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                            <div className="relative mt-1">
                                <MailIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input type="email" value={userData.email} disabled className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-500 cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone Number</label>
                            <div className="relative mt-1">
                                <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Enter your phone number" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Age</label>
                                <div className="relative mt-1">
                                     <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Age" />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleSaveChanges} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                    <SaveIcon className="w-5 h-5"/>
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default PersonalInfoScreen;