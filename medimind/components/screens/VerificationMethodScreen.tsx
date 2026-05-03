
import React from 'react';
import { MailIcon } from '../icons/MailIcon';
import { PhoneIcon } from '../icons/PhoneIcon';

interface VerificationMethodScreenProps {
    onSelectPhone: () => void;
    onSelectEmail: () => void;
    onBack: () => void;
    phoneNumber: string;
    email: string;
}

const maskEmail = (email: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
    return `${maskedUser}@${domain}`;
};

const maskPhone = (phone: string) => {
    if (!phone) return '';
    return `*******${phone.slice(-4)}`;
};

const VerificationMethodScreen: React.FC<VerificationMethodScreenProps> = ({
    onSelectPhone,
    onSelectEmail,
    onBack,
    phoneNumber,
    email
}) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Verify Your Identity</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">How would you like to receive your verification code?</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
                    <button
                        onClick={onSelectPhone}
                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all"
                    >
                        <PhoneIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="font-semibold text-left dark:text-gray-100">Text Message (SMS)</p>
                            <p className="text-gray-500 dark:text-gray-400 text-left">{maskPhone(phoneNumber)}</p>
                        </div>
                    </button>
                    {email && (
                        <button
                            onClick={onSelectEmail}
                            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all"
                        >
                            <MailIcon className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="font-semibold text-left dark:text-gray-100">Email</p>
                                <p className="text-gray-500 dark:text-gray-400 text-left">{maskEmail(email)}</p>
                            </div>
                        </button>
                    )}
                </div>
                <button onClick={onBack} className="w-full text-center text-gray-600 dark:text-gray-300 font-semibold mt-6 py-2 hover:text-blue-600">
                    ← Back
                </button>
            </div>
        </div>
    );
};

export default VerificationMethodScreen;