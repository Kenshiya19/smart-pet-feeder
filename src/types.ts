export interface PetInfo {
  name: string;
  type: 'Dog' | 'Cat' | 'Rabbit' | 'Other';
  breed: string;
  weightKg: number;
  dailyTargetGrams: number;
  avatarUrl?: string;
}

export interface ScheduleItem {
  id: string;
  name: string; // 'Morning', 'Evening', 'Night', 'Lunch', etc.
  time: string; // '8:00 AM'
  time24: string; // '08:00'
  amountGrams: number;
  frequency: string; // 'Daily', 'Weekdays', 'Weekends'
  enabled: boolean;
  notificationsEnabled: boolean;
}

export interface FeedingRecord {
  id: string;
  timestamp: number;
  timeStr: string; // '8:09 PM'
  dateCategory: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  dateFormatted: string;
  type: 'Manual' | 'Scheduled';
  amountGrams: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface DailyConsumption {
  dayLabel: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  fullDay: string; // 'Monday', etc.
  date: string;
  amountGrams: number;
  targetGrams: number;
  mealsCount: number;
}

export interface DeviceConnection {
  hardwareModel: string;
  networkName: string;
  isConnected: boolean;
  ipAddress: string;
  signalDbm: number;
  firmwareVersion: string;
  lastPing: string;
}

export interface FeederConfig {
  notificationsEnabled: boolean;
  chimeOnDispense: boolean;
  ledIndicatorBrightness: number;
  radarDetectionSensitivity: 'Low' | 'Medium' | 'High';
  hopperCapacityGrams: number;
  lowFoodThresholdGrams: number;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'feed' | 'alert' | 'pet' | 'device';
  read: boolean;
}
