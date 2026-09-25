import {
  PetInfo,
  ScheduleItem,
  FeedingRecord,
  DailyConsumption,
  DeviceConnection,
  FeederConfig,
  AppNotification
} from '../types';

export const INITIAL_PET: PetInfo = {
  name: 'Buddy',
  type: 'Dog',
  breed: 'Golden Retriever',
  weightKg: 16.5,
  dailyTargetGrams: 140,
};

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    name: 'Morning',
    time: '8:00 AM',
    time24: '08:00',
    amountGrams: 50,
    frequency: 'Daily',
    enabled: true,
    notificationsEnabled: true,
  },
  {
    id: 'sch-2',
    name: 'Evening',
    time: '7:00 PM',
    time24: '19:00',
    amountGrams: 50,
    frequency: 'Daily',
    enabled: true,
    notificationsEnabled: true,
  },
  {
    id: 'sch-3',
    name: 'Night',
    time: '10:00 PM',
    time24: '22:00',
    amountGrams: 30,
    frequency: 'Daily',
    enabled: false,
    notificationsEnabled: false,
  },
];

export const INITIAL_HISTORY: FeedingRecord[] = [
  {
    id: 'h-1',
    timestamp: Date.now() - 1000 * 60 * 25,
    timeStr: '8:09 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Manual',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 1,
    timeStr: '8:00 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Manual',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    timeStr: '8:00 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Manual',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-4',
    timestamp: Date.now() - 1000 * 60 * 60 * 6,
    timeStr: '2:20 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Manual',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-5',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    timeStr: '1:00 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Manual',
    amountGrams: 40,
    status: 'Completed',
  },
  {
    id: 'h-6',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    timeStr: '7:00 AM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Scheduled',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-7',
    timestamp: Date.now() - 1000 * 60 * 60 * 14,
    timeStr: '7:00 PM',
    dateCategory: 'TODAY',
    dateFormatted: 'Today',
    type: 'Scheduled',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-8',
    timestamp: Date.now() - 1000 * 60 * 60 * 25,
    timeStr: '7:00 AM',
    dateCategory: 'YESTERDAY',
    dateFormatted: 'Yesterday',
    type: 'Scheduled',
    amountGrams: 50,
    status: 'Completed',
  },
  {
    id: 'h-9',
    timestamp: Date.now() - 1000 * 60 * 60 * 37,
    timeStr: '7:00 PM',
    dateCategory: 'YESTERDAY',
    dateFormatted: 'Yesterday',
    type: 'Scheduled',
    amountGrams: 50,
    status: 'Completed',
  },
];

export const INITIAL_CONSUMPTION: DailyConsumption[] = [
  { dayLabel: 'M', fullDay: 'Monday', date: 'Sep 05', amountGrams: 110, targetGrams: 140, mealsCount: 3 },
  { dayLabel: 'T', fullDay: 'Tuesday', date: 'Sep 06', amountGrams: 150, targetGrams: 140, mealsCount: 3 },
  { dayLabel: 'W', fullDay: 'Wednesday', date: 'Sep 07', amountGrams: 90, targetGrams: 140, mealsCount: 2 },
  { dayLabel: 'T', fullDay: 'Thursday', date: 'Sep 08', amountGrams: 130, targetGrams: 140, mealsCount: 3 },
  { dayLabel: 'F', fullDay: 'Friday', date: 'Sep 09', amountGrams: 105, targetGrams: 140, mealsCount: 3 },
  { dayLabel: 'S', fullDay: 'Saturday', date: 'Sep 10', amountGrams: 160, targetGrams: 140, mealsCount: 4 },
  { dayLabel: 'S', fullDay: 'Sunday', date: 'Sep 11', amountGrams: 95, targetGrams: 140, mealsCount: 3 },
];

export const INITIAL_DEVICE: DeviceConnection = {
  hardwareModel: 'ESP32',
  networkName: 'PetFeeder_Net',
  isConnected: true,
  ipAddress: '192.168.1.2',
  signalDbm: -56,
  firmwareVersion: 'v2.4.1',
  lastPing: 'Just now',
};

export const INITIAL_CONFIG: FeederConfig = {
  notificationsEnabled: true,
  chimeOnDispense: true,
  ledIndicatorBrightness: 80,
  radarDetectionSensitivity: 'Medium',
  hopperCapacityGrams: 500,
  lowFoodThresholdGrams: 120,
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Food Dispensed Successfully',
    description: '50 g dispensed for Buddy (Evening Schedule)',
    time: '7:00 PM',
    type: 'feed',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Pet Detected Near Feeder',
    description: 'Buddy was detected at the feeder dish.',
    time: '6:58 PM',
    type: 'pet',
    read: false,
  },
  {
    id: 'n-3',
    title: 'Food Level Notice',
    description: 'Food hopper is at 100 g. Please plan to refill soon.',
    time: '2:20 PM',
    type: 'alert',
    read: true,
  },
];

export function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`pet_feeder_${key}`);
    if (item) {
      return JSON.parse(item);
    }
  } catch {
    // fallback
  }
  return defaultValue;
}

export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`pet_feeder_${key}`, JSON.stringify(value));
  } catch {
    // ignore
  }
}
