
import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/screens/MedicationScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import RecommendationsScreen from './components/screens/RecommendationsScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import AppointmentScreen from './components/screens/AppointmentScreen';
import MedicationAlertModal from './components/MedicationAlertModal';
import NotificationBanner from './components/NotificationBanner';
import AddMedicationModal from './components/AddMedicationModal';
import PrescriptionScanModal from './components/PrescriptionScanModal';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import ForgotPasswordScreen from './components/screens/ForgotPasswordScreen';
import OTPScreen from './components/screens/OTPScreen';
import ResetPasswordScreen from './components/screens/ResetPasswordScreen';
import { Medication, HealthCondition, Recommendation, Screen, User, UserData, Notification as AppNotification, EmergencyContact, Appointment, FrequencySlot } from './types';
import { BellIcon } from './components/icons/BellIcon';
import EmergencyContactsScreen from './components/screens/profile/EmergencyContactsScreen';
import VerificationMethodScreen from './components/screens/VerificationMethodScreen';

type AuthFlowState = 'login' | 'register' | 'forgotPassword' | 'otp' | 'resetPassword';
type InternalAuthFlowState = null | 'selectVerificationMethod' | 'otp' | 'resetPassword';

const Header: React.FC<{ activeScreen: Screen, setActiveScreen: (screen: Screen) => void, unreadCount: number }> = ({ activeScreen, setActiveScreen, unreadCount }) => {
    
    if (['profile', 'recommendations', 'notifications', 'emergency-contacts', 'appointments'].includes(activeScreen)) {
        return null;
    }

    return (
    <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 max-w-md mx-auto w-full border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-500 text-white w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl">
          M
        </div>
        <span className="font-bold text-2xl text-gray-800 dark:text-gray-100">MediMind</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveScreen('notifications')} className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Notifications">
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
             <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [modalState, setModalState] = useState<{isOpen: boolean, action: 'scan' | 'scan-prescription' | 'manual'}>({isOpen: false, action: 'manual'});
  const [loggedInToast, setLoggedInToast] = useState<{ title: string; message: string } | null>(null);
  const [loggedOutToast, setLoggedOutToast] = useState<{ title: string; message: string } | null>(null);
  const [medicationToAlert, setMedicationToAlert] = useState<{ med: Medication, slot?: FrequencySlot } | null>(null);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  
  // --- Auth State ---
  const [users, setUsers] = useState<Record<string, { password: string; username: string }>>(() => {
    const savedUsers = localStorage.getItem('medimindUsers');
    return savedUsers ? JSON.parse(savedUsers) : { '1234567890': { password: 'password123', username: 'Sarah Johnson' } };
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('login');
  const [recoveryPhoneNumber, setRecoveryPhoneNumber] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [internalAuthFlowState, setInternalAuthFlowState] = useState<InternalAuthFlowState>(null);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const savedSettings = localStorage.getItem('medimindNotificationSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
        medReminders: true,
        push: true
    };
  });
  
  // --- User Data State ---
  const [userData, setUserData] = useState<Record<string, UserData>>(() => {
    const savedUserData = localStorage.getItem('medimindUserData');
    return savedUserData ? JSON.parse(savedUserData) : {
      '1234567890': {
        medications: [
          { id: '1', name: 'Metformin', dosage: '500mg', frequencySlots: { Morning: '08:00' }, takenSlots: ['Morning'], pillsInStrip: 28, manufacturedDate: '2025-04-01', expiryDate: '2026-04-30', scheduleStartDate: '2025-01-01', scheduleDurationDays: 90 },
          { id: '2', name: 'Lisinopril', dosage: '10mg', frequencySlots: { Morning: '08:00', Night: '20:00' }, takenSlots: [], pillsInStrip: 14, manufacturedDate: '2025-11-01', expiryDate: '2027-02-15', scheduleStartDate: '2025-01-01', scheduleDurationDays: 60 },
          { id: '3', name: 'Aspirin', dosage: '81mg', frequencySlots: { Afternoon: '13:00' }, takenSlots: ['Afternoon'], pillsInStrip: 90, manufacturedDate: '2024-12-01', expiryDate: '2026-12-31', scheduleStartDate: '2025-01-01', scheduleDurationDays: 30 },
          { id: '4', name: 'Vitamin D', dosage: '1000 IU', frequencySlots: { Night: '21:00' }, takenSlots: [], pillsInStrip: 4, manufacturedDate: '2025-03-15', expiryDate: '2026-06-30', scheduleStartDate: '2025-01-01', scheduleDurationDays: 180 },
        ],
        appointments: [
            { id: '1', title: 'Cardiologist Check-up', doctor: 'Dr. Emily Carter', location: 'Heartbeat Clinic, 123 Health St.', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '10:30', notes: 'Discuss recent blood pressure readings.' }
        ],
        healthConditions: [
          { id: '1', name: 'Hypertension' },
          { id: '2', name: 'Type 2 Diabetes' }
        ],
        recommendations: [],
        notifications: [],
        emergencyContacts: [
            { id: '1', name: 'Dr. Emily Carter', relationship: 'Cardiologist', phoneNumber: '123-456-7890' },
            { id: '2', name: 'Jane Doe', relationship: 'Caregiver', phoneNumber: '098-765-4321' },
            { id: '3', name: 'John Smith', relationship: 'Son', phoneNumber: '555-555-5555' },
        ],
        age: 72,
        gender: 'Female',
        email: 'sarah.j@example.com',
        dayStreak: 12,
      }
    };
  });

  const currentUserData = currentUser ? userData[currentUser.phoneNumber] : null;

  // --- Local Notifications Logic ---
  const scheduleAllMedNotifications = useCallback(async (meds: Medication[]) => {
      if (!notificationSettings.push) {
          await LocalNotifications.cancel({ notifications: (await LocalNotifications.getPending()).notifications });
          return;
      }

      try {
          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
              const req = await LocalNotifications.requestPermissions();
              if (req.display !== 'granted') return;
          }

          // Cancel all existing to avoid duplicates
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
              await LocalNotifications.cancel({ notifications: pending.notifications });
          }

          const notificationsToSchedule = meds.flatMap(med => {
              return Object.entries(med.frequencySlots).map(([slot, time]) => {
                  const [hour, minute] = (time as string).split(':').map(Number);
                  
                  // Create a unique numeric ID for Capacitor
                  const baseId = parseInt(med.id.slice(-6), 10) || Math.floor(Math.random() * 100000);
                  const slotOffset = slot === 'Morning' ? 1 : slot === 'Afternoon' ? 2 : 3;
                  const finalId = baseId + slotOffset;

                  return {
                      title: 'Medication Reminder',
                      body: `Time for your ${slot} dose: ${med.name} (${med.dosage})`,
                      id: finalId,
                      schedule: {
                          on: { hour, minute },
                          repeats: true,
                          allowWhileIdle: true
                      },
                      sound: 'res://raw/notification_sound',
                      attachments: [],
                      actionTypeId: '',
                      extra: { medId: med.id, slot }
                  };
              });
          });

          if (notificationsToSchedule.length > 0) {
              await LocalNotifications.schedule({ notifications: notificationsToSchedule });
              console.log(`Scheduled ${notificationsToSchedule.length} native local notifications.`);
          }
      } catch (e) {
          console.error("Failed to schedule local notifications:", e);
      }
  }, [notificationSettings.push]);

  useEffect(() => {
    if (currentUserData) {
        scheduleAllMedNotifications(currentUserData.medications);
    }
  }, [currentUserData?.medications, notificationSettings.push, scheduleAllMedNotifications]);

  useEffect(() => {
      const initNotifications = async () => {
          await LocalNotifications.requestPermissions();
          LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
              setActiveScreen('home');
          });
      };
      initNotifications();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    if (theme === 'dark') {
        root.classList.add('dark');
    } else if (theme === 'light') {
        root.classList.remove('dark');
    } else {
        if (mediaQuery.matches) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    localStorage.setItem('theme', theme);

    return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
}, [theme]);


  useEffect(() => {
    localStorage.setItem('medimindUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('medimindUserData', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('medimindNotificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const unreadNotificationCount = currentUserData?.notifications.filter(n => !n.read).length || 0;

  const updateCurrentUserDate = (data: Partial<UserData>) => {
    if (!currentUser) return;
    setUserData(prev => {
      const updated = {
        ...prev,
        [currentUser.phoneNumber]: {
          ...prev[currentUser.phoneNumber],
          ...data,
        }
      };
      localStorage.setItem('medimindUserData', JSON.stringify(updated));
      return updated;
    });
  };

  const addNotification = useCallback((message: string, medId: string, slot?: FrequencySlot) => {
    if (!currentUser) return;
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toISOString(),
      read: false,
      medId,
      slot,
    };
    setUserData(prev => {
        const prevUserData = prev[currentUser.phoneNumber];
        return {
            ...prev,
            [currentUser.phoneNumber]: {
                ...prevUserData,
                notifications: [newNotification, ...(prevUserData.notifications || [])],
            }
        };
      });
  }, [currentUser]);

  const triggerMedicationAlert = useCallback((med: Medication, slot?: FrequencySlot | 'schedule-end') => {
    if (!currentUserData) return;
    
    const isExpired = med.expiryDate ? new Date(`${med.expiryDate}T23:59:59`) < new Date() : false;
    const message = slot === 'schedule-end'
      ? `Your ${med.name} (${med.dosage}) medication schedule has ended. Please consult your doctor for next steps.`
      : slot
        ? `It's time for your ${slot} dose of ${med.name} (${med.dosage}).`
        : isExpired
          ? `${med.name} has expired. Please review your medication immediately.`
          : `Medication reminder for ${med.name} (${med.dosage}).`;

    addNotification(message, med.id, slot === 'schedule-end' ? undefined : slot);
    setMedicationToAlert({ med, slot: slot === 'schedule-end' ? undefined : slot });

    if ('Notification' in window && Notification.permission === 'granted' && !window.hasOwnProperty('Capacitor')) {
        new Notification('MediMind Reminder', {
            body: message,
            tag: `med-${med.id}-${slot ?? 'expiry'}`,
        });
    }

    const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
    audio.play().catch(() => {});
  }, [addNotification, currentUserData]);

  const checkReminders = useRef<(() => void) | null>(null);
  useEffect(() => {
    checkReminders.current = () => {
      if (!currentUserData || !currentUser) return;
      const now = new Date();
      const todayStr = now.toDateString();
      const currentTime = now.toTimeString().substring(0, 5);

      if (notificationSettings.medReminders) {
        currentUserData.medications.forEach(med => {
          const expiryDate = med.expiryDate ? new Date(`${med.expiryDate}T23:59:59`) : null;
          const medIsExpired = expiryDate ? expiryDate < now : false;

          if (medIsExpired) {
            const alreadyNotifiedExpiry = currentUserData.notifications.some(
              n => n.medId === med.id && n.slot === undefined && new Date(n.timestamp).toDateString() === todayStr
            );
            if (!alreadyNotifiedExpiry) {
              triggerMedicationAlert(med);
            }
            return;
          }

          // Check for schedule end date
          const scheduleEndDate = med.scheduleStartDate && med.scheduleDurationDays 
            ? new Date(new Date(med.scheduleStartDate).getTime() + (med.scheduleDurationDays * 24 * 60 * 60 * 1000))
            : null;
          const scheduleIsEnded = scheduleEndDate ? scheduleEndDate < now : false;

          if (scheduleIsEnded) {
            const alreadyNotifiedScheduleEnd = currentUserData.notifications.some(
              n => n.medId === med.id && n.slot === 'schedule-end' && new Date(n.timestamp).toDateString() === todayStr
            );
            if (!alreadyNotifiedScheduleEnd) {
              triggerMedicationAlert(med, 'schedule-end');
            }
            return;
          }

          Object.entries(med.frequencySlots).forEach(([slotStr, medTime]) => {
            const slot = slotStr as FrequencySlot;
            if (medTime === currentTime && !med.takenSlots.includes(slot)) {
              const alreadyNotified = currentUserData.notifications.some(
                n => n.medId === med.id && n.slot === slot && new Date(n.timestamp).toDateString() === todayStr
              );
              if (!alreadyNotified) {
                triggerMedicationAlert(med, slot);
              }
            }
          });
        });
      }
    };
  }, [currentUserData, currentUser, triggerMedicationAlert, notificationSettings]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      if (checkReminders.current) {
        checkReminders.current();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  
  const updateUser = (updatedUser: User, updatedData: Partial<UserData>) => {
    if (!currentUser) return;
    setUsers(prev => ({
      ...prev,
      [currentUser.phoneNumber]: { ...prev[currentUser.phoneNumber], username: updatedUser.username }
    }));
    setCurrentUser(updatedUser);
    updateCurrentUserDate(updatedData);
  };

const updateHealthConditions = (conditions: HealthCondition[]) => {
    if (!currentUser) return;
    setUserData(prev => {
      const updated = {
        ...prev,
        [currentUser.phoneNumber]: {
          ...prev[currentUser.phoneNumber],
          healthConditions: conditions,
        }
      };
      localStorage.setItem('medimindUserData', JSON.stringify(updated));
      return updated;
    });
};

  const addMedication = (med: Omit<Medication, 'id' | 'takenSlots'>) => {
    if (!currentUser) return;
    const newMed = { ...med, id: Date.now().toString(), takenSlots: [] };
     setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      return {
        ...prev,
        [currentUser.phoneNumber]: { ...prevUserData, medications: [...prevUserData.medications, newMed] }
      };
    });
  };

  const addMultipleMedications = (meds: Omit<Medication, 'id' | 'takenSlots'>[]) => {
    if (!currentUser) return;
    const newMeds = meds.map((med, index) => ({ 
      ...med, 
      id: (Date.now() + index).toString(), 
      takenSlots: [] 
    }));
    setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      return {
        ...prev,
        [currentUser.phoneNumber]: { ...prevUserData, medications: [...prevUserData.medications, ...newMeds] }
      };
    });
    setLoggedInToast({ title: "Success", message: `${meds.length} medications added to your schedule.` });
  };

  const updateMedication = (updatedMed: Medication) => {
    if (!currentUser) return;
    setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      const updatedMeds = prevUserData.medications.map(med => med.id === updatedMed.id ? updatedMed : med);
      return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, medications: updatedMeds } };
    });
    setLoggedInToast({ title: "Success", message: "Medication updated successfully." });
  };

  const deleteMedication = (id: string) => {
    if (!currentUser) return;
    setUserData(prev => {
        const prevUserData = prev[currentUser.phoneNumber];
        const updatedMeds = prevUserData.medications.filter(med => med.id !== id);
        return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, medications: updatedMeds } };
    });
    setLoggedInToast({ title: "Success", message: "Medication removed." });
  };

  const handleSaveMedication = (medData: Omit<Medication, 'id' | 'takenSlots'> | Medication) => {
    if ('id' in medData) {
        updateMedication(medData as Medication);
    } else {
        addMedication(medData);
    }
    
    // Check if newly added/updated medication is expired
    const med = 'id' in medData ? medData as Medication : { ...medData, id: Date.now().toString(), takenSlots: [] };
    if (med.expiryDate && new Date(`${med.expiryDate}T23:59:59`) < new Date()) {
      setTimeout(() => triggerMedicationAlert(med), 1000); // Delay to ensure UI updates first
    }
  };
  
  const toggleMedicationTaken = (id: string, slot: FrequencySlot) => {
    if (!currentUser) return;
    setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      let medToRemoveId: string | null = null;

      const updatedMeds = prevUserData.medications.map(med => {
        if (med.id === id) {
          const isTaken = med.takenSlots.includes(slot);
          const newTakenSlots = isTaken 
            ? med.takenSlots.filter(s => s !== slot)
            : [...med.takenSlots, slot];
          
          let newPillsCount = med.pillsInStrip;
          if (newPillsCount !== undefined) {
              if (!isTaken) {
                  newPillsCount = Math.max(0, newPillsCount - 1);
                  if (newPillsCount === 0) {
                      medToRemoveId = id;
                  }
              } else {
                  newPillsCount = newPillsCount + 1;
              }
          }

          return { ...med, takenSlots: newTakenSlots, pillsInStrip: newPillsCount };
        }
        return med;
      });

      // Filter out medication if pills reached zero
      const finalMeds = medToRemoveId 
        ? updatedMeds.filter(m => m.id !== medToRemoveId)
        : updatedMeds;

      if (medToRemoveId) {
          setLoggedInToast({ title: "Medication Finished", message: "Pill count reached zero. Medication removed from your list." });
      }

      return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, medications: finalMeds } };
    });
  };

  const resetMedications = () => {
    if (!currentUser) return;
    setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      const updatedMeds = prevUserData.medications.map(med => ({ ...med, takenSlots: [] }));
      return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, medications: updatedMeds, notifications: [] } };
    });
  };

    const addAppointment = (appt: Omit<Appointment, 'id'>) => {
        if (!currentUserData) return;
        const newAppt = { ...appt, id: Date.now().toString() };
        updateCurrentUserDate({ appointments: [...currentUserData.appointments, newAppt] });
        setLoggedInToast({ title: "Success", message: "Appointment added successfully." });
    };

    const updateAppointment = (updatedAppt: Appointment) => {
        if (!currentUserData) return;
        const updatedAppointments = currentUserData.appointments.map(a => a.id === updatedAppt.id ? updatedAppt : a);
        updateCurrentUserDate({ appointments: updatedAppointments });
        setLoggedInToast({ title: "Success", message: "Appointment updated successfully." });
    };

    const deleteAppointment = (id: string) => {
        if (!currentUserData) return;
        const updatedAppointments = currentUserData.appointments.filter(a => a.id !== id);
        updateCurrentUserDate({ appointments: updatedAppointments });
        setLoggedInToast({ title: "Success", message: "Appointment removed." });
    };


  const setRecommendations = (recommendations: Recommendation[]) => {
    updateCurrentUserDate({ recommendations });
  };

  const updateProfilePicture = (pic: string) => {
    updateCurrentUserDate({ profilePicture: pic });
    setLoggedInToast({ title: "Success", message: "Profile picture updated successfully." });
  };

  const deleteProfilePicture = () => {
    if (!currentUser) return;
    setUserData(prev => {
      const newState = { ...prev };
      const currentUserDataCopy = { ...newState[currentUser.phoneNumber] };
      delete currentUserDataCopy.profilePicture;
      newState[currentUser.phoneNumber] = currentUserDataCopy;
      return newState;
    });
    setLoggedInToast({ title: "Success", message: "Profile picture removed." });
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      const readNotifications = prevUserData.notifications.map(n => ({...n, read: true}));
      return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, notifications: readNotifications } };
    });
    setLoggedInToast({ title: "Info", message: "All notifications marked as read." });
  }

  const deleteAllNotifications = () => {
    if (!currentUser) return;
     setUserData(prev => {
      const prevUserData = prev[currentUser.phoneNumber];
      return { ...prev, [currentUser.phoneNumber]: { ...prevUserData, notifications: [] } };
    });
    setLoggedInToast({ title: "Info", message: "All notifications have been cleared." });
  };

  const handleTakeFromAlert = (medId: string, slot?: FrequencySlot) => {
    if (slot) {
        toggleMedicationTaken(medId, slot);
    }
    setMedicationToAlert(null);
    setLoggedInToast({ title: "Great Job!", message: "Medication marked as taken." });
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    if (!currentUserData) return;
    const newContact = { ...contact, id: Date.now().toString() };
    const updatedContacts = [...(currentUserData.emergencyContacts || []), newContact];
    updateCurrentUserDate({ emergencyContacts: updatedContacts });
    setLoggedInToast({ title: "Success", message: "Emergency contact added." });
  };

  const updateEmergencyContact = (updatedContact: EmergencyContact) => {
      if (!currentUserData || !currentUserData.emergencyContacts) return;
      const updatedContacts = currentUserData.emergencyContacts.map(c => c.id === updatedContact.id ? updatedContact : c);
      updateCurrentUserDate({ emergencyContacts: updatedContacts });
      setLoggedInToast({ title: "Success", message: "Emergency contact updated." });
  };

  const deleteEmergencyContact = (contactId: string) => {
      if (!currentUserData || !currentUserData.emergencyContacts) return;
      const updatedContacts = currentUserData.emergencyContacts.filter(c => c.id !== contactId);
      updateCurrentUserDate({ emergencyContacts: updatedContacts });
      setLoggedInToast({ title: "Success", message: "Emergency contact removed." });
  };
  
  const handleHomeScreenAction = (action: 'scan' | 'scan-prescription' | 'manual') => {
    setModalState({isOpen: true, action});
  };

  const handleStartEditing = (med: Medication) => {
    setMedicationToEdit(med);
    setModalState({ isOpen: true, action: 'manual' });
  };
  
  // --- Auth Handlers ---
  const handleLogin = (phoneNumber: string, pass: string): boolean => {
    const user = users[phoneNumber];
    if (user && user.password === pass) {
      setCurrentUser({ username: user.username, phoneNumber });
      setLoggedInToast({ title: "Login Successful", message: `Welcome back, ${user.username}!` });
      return true;
    }
    return false;
  };

  const handleRegister = (username: string, email: string, phoneNumber: string, pass: string): boolean => {
    if (users[phoneNumber]) {
      return false;
    }
    setUsers(prev => ({...prev, [phoneNumber]: { username, password: pass }}));
    setUserData(prev => ({
      ...prev, 
      [phoneNumber]: { 
        medications: [], 
        appointments: [],
        healthConditions: [], 
        recommendations: [],
        notifications: [],
        emergencyContacts: [],
        email: email,
        dayStreak: 0,
       }
    }));
    setCurrentUser({ username, phoneNumber });
    setIsOnboarding(true);
    return true;
  };

  const handleInitiatePhoneRecovery = (phone: string): boolean => {
    if (users[phone]) {
      setRecoveryPhoneNumber(phone);
      setRecoveryEmail(null);
      setAuthFlowState('otp');
      return true;
    }
    return false;
  };

  const handleInitiateEmailRecovery = (email: string): boolean => {
      const userPhone = Object.keys(userData).find(phone => userData[phone].email?.toLowerCase() === email.toLowerCase());
      if (userPhone && users[userPhone]) {
          setRecoveryPhoneNumber(userPhone);
          setRecoveryEmail(email);
          setAuthFlowState('otp');
          return true;
      }
      return false;
  };

  const handlePasswordReset = (newPassword: string): boolean => {
    if (!recoveryPhoneNumber) return false;
    
    setUsers(prev => ({ ...prev, [recoveryPhoneNumber]: { ...prev[recoveryPhoneNumber], password: newPassword, } }));
    
    setRecoveryPhoneNumber(null);
    setRecoveryEmail(null);
    setAuthFlowState('login');
    setLoggedInToast({ title: "Success", message: "Password updated successfully! Please log in." });
    return true;
  };
  
  const handleInitiatePasswordChange = () => {
      if (currentUser && currentUserData) {
          setRecoveryPhoneNumber(currentUser.phoneNumber);
          setRecoveryEmail(currentUserData.email || null);
          setInternalAuthFlowState('selectVerificationMethod');
      }
  };

  const handleSelectPhoneForChange = () => {
    if (!recoveryPhoneNumber) return;
    setRecoveryEmail(null);
    setInternalAuthFlowState('otp');
  };

  const handleSelectEmailForChange = () => {
    if (!recoveryEmail) return;
    setInternalAuthFlowState('otp');
  };

  const handlePasswordChange = (newPassword: string): boolean => {
    if (!currentUser) return false;
    setUsers(prev => ({ ...prev, [currentUser.phoneNumber]: { ...prev[currentUser.phoneNumber], password: newPassword } }));
    setInternalAuthFlowState(null);
    setLoggedInToast({ title: "Success", message: "Password changed successfully!" });
    return true;
  };

  const handleCompleteOnboarding = (data: { age?: number; gender?: string; conditions: HealthCondition[] }) => {
    if (!currentUser) return;
    const newConditions = data.conditions.map(c => ({ id: c.name, name: c.name }));
    updateCurrentUserDate({ age: data.age, gender: data.gender, healthConditions: newConditions });
    setIsOnboarding(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthFlowState('login');
    setActiveScreen('home');
    setLoggedOutToast({ title: "Signed Out", message: "You have been signed out successfully." });
  };

  if (internalAuthFlowState) {
    if (internalAuthFlowState === 'selectVerificationMethod') {
        return <VerificationMethodScreen
            onSelectPhone={handleSelectPhoneForChange}
            onSelectEmail={handleSelectEmailForChange}
            onBack={() => {
                setInternalAuthFlowState(null);
                setRecoveryEmail(null);
                setRecoveryPhoneNumber(null);
            }}
            phoneNumber={recoveryPhoneNumber || ''}
            email={recoveryEmail || ''}
        />;
    }
    if (internalAuthFlowState === 'otp') {
        return <OTPScreen
            onVerifySuccess={() => setInternalAuthFlowState('resetPassword')}
            onBack={() => {
              setInternalAuthFlowState('selectVerificationMethod');
            }}
            phoneNumber={recoveryPhoneNumber}
            email={recoveryEmail}
        />;
    }
    if (internalAuthFlowState === 'resetPassword') {
        return <ResetPasswordScreen
            onReset={handlePasswordChange}
            onBack={() => setInternalAuthFlowState('otp')}
            buttonText="Change Password"
            buttonColor="green"
        />;
    }
  }

  if (!currentUser) {
    return (
        <>
            <NotificationBanner toast={loggedOutToast} onClose={() => setLoggedOutToast(null)} />
            {(() => {
                switch (authFlowState) {
                    case 'login': return <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setAuthFlowState('register')} onForgotPassword={() => setAuthFlowState('forgotPassword')} />;
                    case 'register': return <RegisterScreen onRegister={handleRegister} onSwitchToLogin={() => setAuthFlowState('login')} onForgotPassword={() => setAuthFlowState('forgotPassword')} />;
                    case 'forgotPassword': return <ForgotPasswordScreen onBackToLogin={() => setAuthFlowState('login')} onInitiatePhoneRecovery={handleInitiatePhoneRecovery} onInitiateEmailRecovery={handleInitiateEmailRecovery} />;
                    case 'otp': return <OTPScreen onVerifySuccess={() => setAuthFlowState('resetPassword')} onBack={() => setAuthFlowState('forgotPassword')} phoneNumber={recoveryPhoneNumber} email={recoveryEmail} />;
                    case 'resetPassword': return <ResetPasswordScreen onReset={handlePasswordReset} onBack={() => setAuthFlowState('login')} buttonText="Reset Password" buttonColor="blue" />;
                    default: return <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setAuthFlowState('register')} onForgotPassword={() => setAuthFlowState('forgotPassword')} />;
                }
            })()}
        </>
    );
  }

  if (isOnboarding) {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  if (!currentUserData) {
    return <div>Loading user data...</div>;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen 
          username={currentUser.username}
          medications={currentUserData.medications} 
          toggleMedicationTaken={toggleMedicationTaken} 
          resetMedications={resetMedications} 
          onActionClick={handleHomeScreenAction}
          onEditMedication={handleStartEditing}
          deleteMedication={deleteMedication}
          setActiveScreen={setActiveScreen}
        />;
      case 'profile':
        return <ProfileScreen 
          user={currentUser}
          userData={currentUserData}
          onLogout={handleLogout}
          onNavigateBack={() => setActiveScreen('home')}
          setActiveScreen={setActiveScreen}
          updateUser={updateUser}
          updateHealthConditions={updateHealthConditions}
          updateProfilePicture={updateProfilePicture}
          deleteProfilePicture={deleteProfilePicture}
          theme={theme}
          setTheme={setTheme}
          onInitiatePasswordChange={handleInitiatePasswordChange}
          notificationSettings={notificationSettings}
          setNotificationSettings={setNotificationSettings}
        />;
      case 'recommendations':
        return <RecommendationsScreen 
          medications={currentUserData.medications} 
          healthConditions={currentUserData.healthConditions} 
          recommendations={currentUserData.recommendations} 
          setRecommendations={setRecommendations}
          setActiveScreen={setActiveScreen}
        />;
      case 'notifications':
        return <NotificationsScreen
          notifications={currentUserData.notifications}
          onBack={() => setActiveScreen('home')}
          onMarkAllRead={markAllNotificationsAsRead}
          deleteAllNotifications={deleteAllNotifications}
        />;
      case 'emergency-contacts':
        return <EmergencyContactsScreen
          onBack={() => setActiveScreen('home')}
          contacts={currentUserData.emergencyContacts || []}
          addContact={addEmergencyContact}
          updateContact={updateEmergencyContact}
          deleteContact={deleteEmergencyContact}
        />;
      case 'appointments':
        return <AppointmentScreen
            appointments={currentUserData.appointments || []}
            onBack={() => setActiveScreen('home')}
            addAppointment={addAppointment}
            updateAppointment={updateAppointment}
            deleteAppointment={deleteAppointment}
        />;
      default:
        return <HomeScreen 
          username={currentUser.username}
          medications={currentUserData.medications} 
          toggleMedicationTaken={toggleMedicationTaken} 
          resetMedications={resetMedications} 
          onActionClick={handleHomeScreenAction} 
          onEditMedication={handleStartEditing}
          deleteMedication={deleteMedication}
          setActiveScreen={setActiveScreen}
        />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      {currentUser && <NotificationBanner toast={loggedInToast} onClose={() => setLoggedInToast(null)} />}
      <Header activeScreen={activeScreen} setActiveScreen={setActiveScreen} unreadCount={unreadNotificationCount} />
      <main className="flex-grow pb-24">
        {renderScreen()}
      </main>
      <BottomNav 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        onScanClick={() => handleHomeScreenAction('scan')} 
      />
      {modalState.isOpen && modalState.action !== 'scan-prescription' && <AddMedicationModal 
        onClose={() => {
            setModalState({isOpen: false, action: 'manual'});
            setMedicationToEdit(null);
        }} 
        onSave={handleSaveMedication}
        initialAction={modalState.action as 'scan' | 'manual'}
        medicationToEdit={medicationToEdit}
      />}
      {modalState.isOpen && modalState.action === 'scan-prescription' && <PrescriptionScanModal
        onClose={() => setModalState({isOpen: false, action: 'manual'})}
        onSaveAll={addMultipleMedications}
      />}
      {medicationToAlert && <MedicationAlertModal 
        medication={medicationToAlert.med}
        slot={medicationToAlert.slot}
        onClose={() => setMedicationToAlert(null)}
        onTake={handleTakeFromAlert}
      />}
    </div>
  );
};

export default App;
