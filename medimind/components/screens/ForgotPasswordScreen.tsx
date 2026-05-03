
import React, { useState } from 'react';
import { MailIcon } from '../icons/MailIcon';
import { PhoneIcon } from '../icons/PhoneIcon';

interface ForgotPasswordScreenProps {
    onBackToLogin: () => void;
    onInitiatePhoneRecovery: (phoneNumber: string) => boolean;
    onInitiateEmailRecovery: (email: string) => boolean;
}

type RecoveryMethod = 'email' | 'phone';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin, onInitiatePhoneRecovery, onInitiateEmailRecovery }) => {
    const [method, setMethod] = useState<RecoveryMethod>('phone');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (method === 'email') {
            if (!email) {
                setError('Please enter your email address.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a correct email address.');
                return;
            }
            const success = onInitiateEmailRecovery(email);
            if (!success) {
                setError('No account found with that email address.');
            }
        } else {
            if (!phoneNumber) {
                setError('Please enter your phone number.');
                return;
            }
            const success = onInitiatePhoneRecovery(phoneNumber);
            if (!success) {
                setError('No account found with that phone number.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Forgot Password?</h1>
                     <p className="text-gray-600 dark:text-gray-300 mt-2">No worries, we'll help you get back in.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex border-b dark:border-gray-600 mb-6">
                        <button onClick={() => setMethod('phone')} className={`flex-1 pb-3 text-center font-semibold transition-colors ${method === 'phone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                            Phone Number
                        </button>
                        <button onClick={() => setMethod('email')} className={`flex-1 pb-3 text-center font-semibold transition-colors ${method === 'email' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                            Email
                        </button>
                    </div>

                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}
                    {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">{message}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {method === 'phone' ? (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="phoneNumber">Phone Number</label>
                                <div className="relative mt-1">
                                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                    <input
                                        id="phoneNumber" type="tel" value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter your registered phone #"
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="email">Email Address</label>
                                <div className="relative mt-1">
                                    <MailIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                                    <input
                                        id="email" type="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Send OTP
                        </button>
                    </form>
                </div>
                 <button onClick={onBackToLogin} className="w-full text-center text-gray-600 dark:text-gray-300 font-semibold mt-6 py-2 hover:text-blue-600">
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;