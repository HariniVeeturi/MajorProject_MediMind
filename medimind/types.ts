
export type Screen = 'home' | 'profile' | 'recommendations' | 'notifications' | 'emergency-contacts' | 'appointments';
export type ProfileSubScreen = 'main' | 'settings' | 'personal-info' | 'health-conditions' | 'notifications' | 'privacy' | 'help' | 'appearance';

export type FrequencySlot = 'Morning' | 'Afternoon' | 'Night';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequencySlots: Partial<Record<FrequencySlot, string>>; // Maps slot to time "HH:MM"
  takenSlots: FrequencySlot[]; // List of slots taken today
  manufacturedDate?: string;
  expiryDate?: string;
  pillsInStrip?: number; // Tracking inventory
  scheduleStartDate?: string; // When the medication schedule started
  scheduleDurationDays?: number; // How many days the schedule should run
  frequency?: string; 
  time?: string;
  taken?: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
  notes?: string;
}

export interface HealthCondition {
  id:string;
  name: string;
}

export interface Recommendation {
  type: 'diet' | 'exercise';
  title: string;
  description: string;
  explanation: string;
  // RL feedback
  feedback?: 'helpful' | 'not_helpful' | null;
  // XAI: feature contributions that drove this recommendation
  xaiFeatures?: XAIFeature[];
}

export interface XAIFeature {
  factor: string;       // e.g. "Hypertension", "Lisinopril 10mg"
  contribution: number; // 0.0 – 1.0, how much this factor drove the tip
  direction: 'positive' | 'negative'; // helped or constrained this tip
}

// RL bandit state — one per tip category
export interface TipBanditState {
  tipKey: string;   // unique key per tip (type + title)
  helpfulCount: number;
  notHelpfulCount: number;
  // UCB score is computed at runtime
}

export interface RLState {
  bandits: TipBanditState[];
  totalFeedbackCount: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  medId: string; // To link notification to a medication or appointment
  slot?: FrequencySlot | 'schedule-end'; // Which slot triggered the notification
}

export interface User {
  username: string;
  phoneNumber: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface UserData {
  medications: Medication[];
  appointments: Appointment[];
  healthConditions: HealthCondition[];
  recommendations: Recommendation[];
  notifications: Notification[];
  age?: number;
  gender?: string;
  email?: string;
  dayStreak?: number;
  profilePicture?: string;
  emergencyContacts?: EmergencyContact[];
  rlState?: RLState;
}
