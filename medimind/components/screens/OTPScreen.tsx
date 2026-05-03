
import React, { useState, useRef } from 'react';

interface OTPScreenProps {
    onVerifySuccess: () => void;
    onBack: () => void;
    phoneNumber?: string | null;
    email?: string | null;
}

const CORRECT_OTP = '123456'; // Simulated OTP for demonstration

const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
    return `${maskedUser}@${domain}`;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ onVerifySuccess, onBack, phoneNumber, email }) => {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        
        // Focus next input
        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) {
            setError('Please enter the full 6-digit OTP.');
            return;
        }
        if (enteredOtp === CORRECT_OTP) {
            setError('');
            onVerifySuccess();
        } else {
            setError('Invalid OTP. Please try again.');
        }
    };

    const contactInfo = email
        ? `your email address ${maskEmail(email)}`
        : `your number ending in ...${phoneNumber?.slice(-4)}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-sm w-full">
                <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Enter Verification Code</h1>
                     <p className="text-gray-600 dark:text-gray-300 mt-2">
                        We've sent a 6-digit OTP to {contactInfo}.
                        <br/>
                        (Hint: it's 123456)
                     </p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-6">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    // FIX: Changed concise arrow function to block body to ensure void return for ref callback.
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            ))}
                        </div>

                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Verify OTP
                        </button>
                    </form>
                 </div>
                 <button onClick={onBack} className="w-full text-center text-gray-600 dark:text-gray-300 font-semibold mt-6 py-2 hover:text-blue-600">
                    ← Go Back
                </button>
            </div>
        </div>
    );
};

export default OTPScreen;