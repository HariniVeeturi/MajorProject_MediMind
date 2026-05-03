
import React, { useState } from 'react';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface ResetPasswordScreenProps {
    onReset: (newPassword: string) => void;
    onBack: () => void;
    buttonText?: string;
    buttonColor?: 'blue' | 'green';
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onReset, onBack, buttonText = 'Reset Password', buttonColor = 'blue' }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Please fill out both fields.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password needs 8+ chars, 1 uppercase, 1 lowercase, 1 number, & 1 special character.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        onReset(newPassword);
    };

    const buttonClasses = buttonColor === 'green'
        ? "w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
        : "w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Set New Password</h1>
                     <p className="text-gray-600 dark:text-gray-300 mt-2">Create a new, strong password for your account.</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="new-password">New Password</label>
                            <div className="relative mt-1">
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="confirm-password">Confirm New Password</label>
                            <div className="relative mt-1">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className={buttonClasses}>
                            {buttonText}
                        </button>
                    </form>
                 </div>
                 <button onClick={onBack} className="w-full text-center text-gray-600 dark:text-gray-300 font-semibold mt-6 py-2 hover:text-blue-600">
                    ← Back
                </button>
            </div>
        </div>
    );
};

export default ResetPasswordScreen;