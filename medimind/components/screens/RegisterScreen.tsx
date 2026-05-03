
import React, { useState } from 'react';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface RegisterScreenProps {
  onRegister: (username: string, email: string, phoneNumber: string, pass: string) => boolean;
  onSwitchToLogin: () => void;
  onForgotPassword: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToLogin, onForgotPassword }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !phoneNumber || !password) {
      setError('Please fill out all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a correct email address.');
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        setError('Password needs 8+ chars, 1 uppercase, 1 lowercase, 1 number, & 1 special character.');
        return;
    }

    const success = onRegister(username, email, phoneNumber, password);
    if (!success) {
      setError('An account with this phone number already exists.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="bg-cyan-500 text-white w-12 h-12 flex items-center justify-center rounded-xl font-bold text-2xl">
            M
          </div>
          <span className="font-bold text-4xl text-gray-800 dark:text-gray-100">MediMind</span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Create Your Account</h2>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</p>}
          
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoCapitalize="none"
              />
            </div>
             <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="password">Password</label>
               <div className="relative mt-1">
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                 >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Create Account
            </button>
          </form>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-300 mt-6 space-y-2">
          <p>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">
              Log In
            </button>
          </p>
          <button onClick={onForgotPassword} className="text-sm font-semibold text-blue-600 hover:underline">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
