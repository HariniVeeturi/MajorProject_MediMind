import React, { useState } from 'react';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';

interface LoginScreenProps {
  onLogin: (phoneNumber: string, pass: string) => boolean;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password.');
      return;
    }

    if (phoneNumber.includes('@')) {
        setError('Please use your phone number to log in, not your email.');
        return;
    }

    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(phoneNumber)) {
        setError('Please enter a valid phone number.');
        return;
    }

    const success = onLogin(phoneNumber, password);
    if (!success) {
      setError('Invalid phone number or password.');
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
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Welcome Back!</h2>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoCapitalize="none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300" htmlFor="password">Password</label>
                <button type="button" onClick={onForgotPassword} className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="font-semibold text-blue-600 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;