
import React, { useState } from 'react';
import { Notification } from '../../types';
import { BellIcon } from '../icons/BellIcon';
import { PillIcon } from '../icons/PillIcon';

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    return (
        <div className={`flex items-start gap-4 p-4 border-l-4 ${notification.read ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'}`}>
            <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                <PillIcon className={`w-6 h-6 ${notification.read ? 'text-gray-500' : 'text-blue-600'}`} />
            </div>
            <div>
                <p className="text-gray-800 dark:text-gray-100">{notification.message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{timeSince(new Date(notification.timestamp))}</p>
            </div>
        </div>
    );
};

interface NotificationsScreenProps {
    notifications: Notification[];
    onBack: () => void;
    onMarkAllRead: () => void;
    deleteAllNotifications: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ notifications, onBack, onMarkAllRead }) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
             <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onMarkAllRead} 
                        disabled={unreadCount === 0}
                        className="font-semibold text-sm text-blue-600 disabled:text-gray-400 px-2 py-1"
                    >
                        Mark Read
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 m-4 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map(n => (
                            <NotificationItem key={n.id} notification={n} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                        <BellIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">All caught up!</h3>
                        <p>You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsScreen;
