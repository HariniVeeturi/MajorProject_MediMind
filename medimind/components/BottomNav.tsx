
import React from 'react';
import { Screen } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { BulbIcon } from './icons/BulbIcon';
import { CameraIcon } from './icons/CameraIcon';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  onScanClick: () => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-blue-600 dark:text-blue-400';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses} hover:text-blue-600 dark:hover:text-blue-400`}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, onScanClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto">
        <NavItem 
          label="Home" 
          icon={<HomeIcon className="w-7 h-7" />} 
          isActive={activeScreen === 'home'} 
          onClick={() => setActiveScreen('home')}
        />
        <NavItem 
          label="Scan" 
          icon={<CameraIcon className="w-7 h-7" />} 
          isActive={false} 
          onClick={onScanClick}
        />
        <NavItem 
          label="Tips" 
          icon={<BulbIcon className="w-7 h-7" />} 
          isActive={activeScreen === 'recommendations'} 
          onClick={() => setActiveScreen('recommendations')}
        />
        <NavItem 
          label="Profile" 
          icon={<ProfileIcon className="w-7 h-7" />} 
          isActive={activeScreen === 'profile'} 
          onClick={() => setActiveScreen('profile')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
