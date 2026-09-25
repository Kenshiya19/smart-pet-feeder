import React, { useState, useEffect, useRef } from 'react';
import {
  PetInfo,
  ScheduleItem,
  FeedingRecord,
  DailyConsumption,
  DeviceConnection,
  FeederConfig,
  AppNotification
} from './types';
import {
  INITIAL_PET,
  INITIAL_SCHEDULES,
  INITIAL_HISTORY,
  INITIAL_CONSUMPTION,
  INITIAL_DEVICE,
  INITIAL_CONFIG,
  INITIAL_NOTIFICATIONS,
  getStoredData,
  setStoredData
} from './utils/storage';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ScheduleView } from './components/ScheduleView';
import { ManualFeedingView } from './components/ManualFeedingView';
import { HistoryView } from './components/HistoryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { ConsumptionAnalytics } from './components/ConsumptionAnalytics';
import { PetDetectionView } from './components/PetDetectionView';
import { DispenseAnimationModal } from './components/DispenseAnimationModal';
import {
  FoodStatusModal,
  PetDetectionModal,
  AddScheduleModal,
  EditPetModal,
  NotificationsModal,
  DeviceSettingsModal
} from './components/Modals';
import { WifiModal } from './components/WifiModal';
import { sound } from './utils/audio';
import { feedEsp32, pingEsp32, setLedBrightness } from './utils/esp32';

export default function App() {
  // Navigation
  const showBrowserNotification = async (
  title: string,
  message: string
) => {
  if (!('Notification' in window)) {
    console.log('Notifications are not supported.');
    return;
  }

  // Ask permission
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission denied.');
    return;
  }

  // Use Service Worker notification for mobile
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'smart-pet-feeder',
        renotify: true
      });

      console.log('Mobile notification sent.');
      return;

    } catch (error) {
      console.error(
        'Service Worker notification failed:',
        error
      );
    }
  }
};
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showAnalyticsView, setShowAnalyticsView] = useState<boolean>(false);
  const [showPetDetectionView, setShowPetDetectionView] = useState<boolean>(false);

  // Persistent States
  const [pet, setPet] = useState<PetInfo>(() => getStoredData('pet', INITIAL_PET));
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() =>
    getStoredData('schedules', INITIAL_SCHEDULES)
  );
  const [history, setHistory] = useState<FeedingRecord[]>(() =>
    getStoredData('history', INITIAL_HISTORY)
  );
  const [consumption, setConsumption] = useState<DailyConsumption[]>(() =>
    getStoredData('consumption', INITIAL_CONSUMPTION)
  );
  const [device, setDevice] = useState<DeviceConnection>(() =>
    getStoredData('device', INITIAL_DEVICE)
  );
  const [config, setConfig] = useState<FeederConfig>(() =>
    getStoredData('config', INITIAL_CONFIG)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredData('notifications', INITIAL_NOTIFICATIONS)
  );

  // Dynamic Feeder State
const [foodAvailableGrams, setFoodAvailableGrams] = useState<number>(() =>
  getStoredData('food_available', 100)
);useEffect(() => {
  if (foodAvailableGrams <= 80) {
    setFoodStatusModalOpen(true);
  }
}, [foodAvailableGrams]);


const [bowlWeightGrams, setBowlWeightGrams] = useState<number>(0);

const previousBowlHasFood = useRef(false);

const [petDetected, setPetDetected] = useState<boolean>(true);
const [lastDetectedTime, setLastDetectedTime] = useState<string>('Today, 6:42 PM');
const [deviceBusy, setDeviceBusy] = useState(false);

  const handleTogglePetDetection = () => {
    setPetDetected(prev => {
      const next = !prev;
      if (next) {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setLastDetectedTime(`Today, ${hours}:${minutes} ${ampm}`);
      }
      return next;
    });
  };

  // Modal Controls
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [dispenseAmount, setDispenseAmount] = useState(30);
  const [foodStatusModalOpen, setFoodStatusModalOpen] = useState(false);
  const [petDetectionModalOpen, setPetDetectionModalOpen] = useState(false);
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);
  const [editPetModalOpen, setEditPetModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [deviceSettingsModalOpen, setDeviceSettingsModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    setStoredData('pet', pet);
  }, [pet]);

  useEffect(() => {
    setStoredData('schedules', schedules);
  }, [schedules]);

  useEffect(() => {
    setStoredData('history', history);
  }, [history]);

  useEffect(() => {
    setStoredData('food_available', foodAvailableGrams);
  }, [foodAvailableGrams]);

  useEffect(() => {
    setStoredData('config', config);
  }, [config]);

  useEffect(() => {
    setStoredData('notifications', notifications);
  }, [notifications]);

  // Run enabled schedules once per calendar day.
  // The browser sends the same /feed command used by Feed Now, so the real ESP32 controls the hardware.
  useEffect(() => {
    const checkSchedules = () => {
      if (deviceBusy) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      schedules.forEach(schedule => {
        if (!schedule.enabled || schedule.time !== currentTime) return;

        const lastFedKey = `schedule-${schedule.id}-${today}`;
        if (localStorage.getItem(lastFedKey)) return;

        // Mark before starting so the 1-second interval cannot send a second command.
        localStorage.setItem(lastFedKey, 'true');
        console.log('SCHEDULE MATCH:', schedule.name, schedule.amountGrams, 'g');

       handleTriggerDispense(schedule.amountGrams)
  .then(() => {
    sendScheduledNotification(schedule);
  })
  .catch(error => {
    console.error('Scheduled feeding failed:', error);
    localStorage.removeItem(lastFedKey);
  });
      });
    };

    checkSchedules();
    const interval = window.setInterval(checkSchedules, 1000);
    return () => window.clearInterval(interval);
  }, [schedules, deviceBusy]);

  // Keep the app's device card synchronized with the real ESP32 when the firmware exposes /status.
  useEffect(() => {
    let cancelled = false;

    const refreshDevice = async () => {
      try {
        const status = await pingEsp32(device.ipAddress);
        if (cancelled) return;

        setDevice(prev => ({
          ...prev,
          isConnected: true,
          ipAddress: status.ip || prev.ipAddress,
          networkName: status.wifiName,
          lastPing: 'Just now',
        }));

        if (typeof status.bowlWeight === 'number') {
  const bowlWeight = Math.max(0, status.bowlWeight);

  setBowlWeightGrams(bowlWeight);
}
        if (typeof status.hopperLevelPercent === 'number') {
          console.log('ESP32 hopper level:', status.hopperLevelPercent);
        }
        if (typeof status.petPresent === 'boolean') {
          setPetDetected(status.petPresent);
          if (status.petPresent) {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            setLastDetectedTime(`Today, ${hours}:${minutes} ${ampm}`);
          }
        }
      } catch {
        if (!cancelled) {
          setDevice(prev => ({ ...prev, isConnected: false, lastPing: 'Offline' }));
        }
      }
    };

    refreshDevice();
    const interval = window.setInterval(refreshDevice, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [device.ipAddress]);

  // Compute Next Feeding from active schedules
 // Compute the actual next feeding
const getNextFeeding = () => {
  const active = schedules.filter(s => s.enabled);

  if (active.length === 0) return null;

  const now = new Date();
  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const getScheduleMinutes = (time: string) => {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!match) return 0;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  };

  // Find today's upcoming feeding
  const upcoming = active
    .map(schedule => ({
      ...schedule,
      scheduleMinutes: getScheduleMinutes(schedule.time),
    }))
    .filter(schedule => schedule.scheduleMinutes > currentMinutes)
    .sort((a, b) => a.scheduleMinutes - b.scheduleMinutes);

  // If there is a feeding later today
  if (upcoming.length > 0) {
    const next = upcoming[0];

    return {
      name: next.name,
      time: next.time,
      amountGrams: next.amountGrams,
    };
  }

  // If today's feedings are finished,
  // show the earliest feeding for tomorrow
  const tomorrow = [...active]
    .map(schedule => ({
      ...schedule,
      scheduleMinutes: getScheduleMinutes(schedule.time),
    }))
    .sort((a, b) => a.scheduleMinutes - b.scheduleMinutes);

  const next = tomorrow[0];

  return {
    name: next.name,
    time: next.time,
    amountGrams: next.amountGrams,
  };
};
const sendScheduledNotification = (schedule: ScheduleItem) => {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  const timeStr = `${hours}:${minutes} ${ampm}`;

  // Add notification inside the app
  if (config.notificationsEnabled) {
    const newNotif: AppNotification = {
      id: 'schedule-' + Date.now(),
      title: 'Scheduled Feeding Completed',
      description: `${schedule.amountGrams} g food dispensed for ${pet.name}`,
      time: timeStr,
      type: 'feed',
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
  }

  // Phone/browser notification
  if (
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    new Notification('Scheduled Feeding Completed', {
      body: `${schedule.amountGrams} g food dispensed for ${pet.name}`,
      icon: '/icon-192.png',
    });
  }
};
  // Trigger Dispensing workflow
  // The existing UI is preserved; this function now sends the command to the real ESP32.
 const handleTriggerDispense = async (amount: number = 30) => {
  if (deviceBusy) return;

  try {
    // 1. Get the latest ESP32 status FIRST
    const status = await pingEsp32(device.ipAddress);

    const bowlWeight = Math.max(0, status.bowlWeight ?? 0);
    const petPresent = status.petPresent ?? false;

    // Update live values
    setBowlWeightGrams(bowlWeight);
    setPetDetected(petPresent);

    // Keep device connected
    setDevice(prev => ({
      ...prev,
      isConnected: true,
      ipAddress: status.ip || prev.ipAddress,
      lastPing: 'Just now',
    }));

    // 2. CHECK BOWL BEFORE SHOWING DISPENSING SCREEN
    if (bowlWeight >= 5) {

      const petStatus = petPresent
        ? 'Pet detected'
        : 'Pet not detected';

      const now = new Date();

      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const message =
        `Food remains in bowl: ${bowlWeight.toFixed(1)} g. ` +
        `${petStatus}. Feeding cancelled.`;

      // Add notification
      if (config.notificationsEnabled) {

        const newNotification: AppNotification = {
          id: 'n-' + Date.now(),
          title: 'Feeding Cancelled',
          description: message,
          time: timeStr,
          type: 'alert',
          read: false,
        };

        setNotifications(prev => [
          newNotification,
          ...prev,
        ]);
      }
      showBrowserNotification(
  'Feeding Cancelled',
  message
);

      // Show message
      alert(message);

      // IMPORTANT:
      // Do NOT open the dispensing modal.
      return;
    }

    // 3. Check hopper food
    if (foodAvailableGrams < amount) {
      setFoodStatusModalOpen(true);
      return;
    }

    // 4. Only NOW start the dispensing UI
    setDeviceBusy(true);
    setDispenseAmount(amount);
    setDispenseModalOpen(true);

    // 5. Send feed command to ESP32
    const result = await feedEsp32(
      amount,
      device.ipAddress
    );

    console.log('ESP32:', result);

    setDevice(prev => ({
      ...prev,
      isConnected: true,
      lastPing: 'Just now',
    }));

  } catch (error) {

    console.error(
      'ESP32 connection error:',
      error
    );

    setDispenseModalOpen(false);

    if (
      error instanceof Error &&
      error.message.includes('Food remains in bowl')
    ) {

      const now = new Date();

      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const newNotification: AppNotification = {
        id: 'n-' + Date.now(),
        title: 'Feeding Cancelled',
        description: error.message,
        time: timeStr,
        type: 'alert',
        read: false,
      };

      if (config.notificationsEnabled) {
        setNotifications(prev => [
          newNotification,
          ...prev,
        ]);
      }

      alert(error.message);

      return;
    }

    setDevice(prev => ({
      ...prev,
      isConnected: false,
      lastPing: 'Connection failed',
    }));

    alert(
      'Unable to connect to the Smart Pet Feeder. ' +
      'Check that the ESP32 and this laptop are on the same Wi-Fi.'
    );

  } finally {

    setDeviceBusy(false);
  }
};
  // Callback when dispense animation finishes
  const handleDispenseComplete = () => {
    console.log('HISTORY CALLBACK FIRED');
    // 1. Deduct food
    setFoodAvailableGrams(prev => Math.max(0, prev - dispenseAmount));

    // 2. Format current time in 12-hour format
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    // 3. Add to Feeding History
    const newRecord: FeedingRecord = {
      id: 'h-' + Date.now(),
      timestamp: Date.now(),
      timeStr,
      dateCategory: 'TODAY',
      dateFormatted: 'Today',
      type: 'Manual',
      amountGrams: dispenseAmount,
      status: 'Completed',
    };
    setHistory(prev => [newRecord, ...prev]);

    // 4. Add Notification
    if (config.notificationsEnabled) {
      const newNotif: AppNotification = {
        id: 'n-' + Date.now(),
        title: 'Food Dispensed Successfully',
        description: `${dispenseAmount} g dispensed for ${pet.name}`,
        time: timeStr,
        type: 'feed',
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    // 5. Update today's consumption
    setConsumption(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last) {
        updated[updated.length - 1] = {
          ...last,
          amountGrams: last.amountGrams + dispenseAmount,
          mealsCount: last.mealsCount + 1,
        };
      }
      return updated;
    });
  };

  // Schedule management handlers
  const handleToggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSchedule = (newSch: Omit<ScheduleItem, 'id'>) => {
    const item: ScheduleItem = {
      ...newSch,
      id: 'sch-' + Date.now(),
    };
    setSchedules(prev => [...prev, item]);
  };

  // Hopper Refill
  const handleRefillFood = (addedGrams: number) => {
    setFoodAvailableGrams(prev => Math.min(config.hopperCapacityGrams, prev + addedGrams));
  };

  const handleResetHopper = (newTotal: number) => {
    setFoodAvailableGrams(newTotal);
  };

  // Unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F0F3F2] flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile-first Phone Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-[#F8FAF9] shadow-2xl relative flex flex-col border-x border-slate-200/60 overflow-x-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {showPetDetectionView ? (
            <PetDetectionView
              petDetected={petDetected}
              onToggleDetection={handleTogglePetDetection}
              lastDetectedTime={lastDetectedTime}
              onBack={() => setShowPetDetectionView(false)}
            />
          ) : showAnalyticsView ? (
            <ConsumptionAnalytics
              data={consumption}
              pet={pet}
              onBack={() => setShowAnalyticsView(false)}
            />
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeView
                  pet={pet}
                  foodAvailableGrams={foodAvailableGrams}
                  maxCapacityGrams={config.hopperCapacityGrams}
                  nextFeeding={getNextFeeding()}
                  petDetected={petDetected}
                  unreadNotificationsCount={unreadCount}
                  onOpenNotifications={() => setNotificationsModalOpen(true)}
                  onOpenFoodStatus={() => setFoodStatusModalOpen(true)}
                  onOpenPetDetection={() => setShowPetDetectionView(true)}
                  onOpenConsumptionAnalytics={() => setShowAnalyticsView(true)}
                  onNavigateToTab={tab => {
                    setShowAnalyticsView(false);
                    setShowPetDetectionView(false);
                    setCurrentTab(tab);
                  }}
                  onTriggerQuickFeed={() => handleTriggerDispense(30)}
                />
              )}

              {currentTab === 'schedule' && (
                <ScheduleView
                  schedules={schedules}
                  onToggleSchedule={handleToggleSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                  onOpenAddModal={() => setAddScheduleModalOpen(true)}
                />
              )}

              {currentTab === 'feeding' && (
                <ManualFeedingView
                  foodAvailableGrams={foodAvailableGrams}
                  isDeviceConnected={device.isConnected}
                  onFeedNow={handleTriggerDispense}
                />
              )}

              {currentTab === 'history' && (
                <HistoryView
                  history={history}
                  onClearHistory={() => setHistory([])}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileSettingsView
                  pet={pet}
                  device={device}
                  config={config}
                  onOpenEditPet={() => setEditPetModalOpen(true)}
                  onToggleNotifications={() =>
                    setConfig(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))
                  }
                  onOpenDeviceSettings={() => setDeviceSettingsModalOpen(true)}
                  onOpenWifiModal={() => setWifiModalOpen(true)}
                  onSimulateReconnect={() => {
                    sound.playClick();
                    setDevice(prev => ({ ...prev, isConnected: !prev.isConnected }));
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={showPetDetectionView ? null : (showAnalyticsView ? 'home' : currentTab)}
          onSelectTab={tab => {
            setShowPetDetectionView(false);
            setShowAnalyticsView(false);
            setCurrentTab(tab);
          }}
        />

        {/* --- ALL INTERACTIVE MODALS --- */}

        {/* 1. Dispense Motor Animation Modal */}
        <DispenseAnimationModal
          isOpen={dispenseModalOpen}
          amountGrams={dispenseAmount}
          petName={pet.name}
          onClose={() => setDispenseModalOpen(false)}
          onComplete={handleDispenseComplete}
        />

        {/* 2. Food Hopper Refill & Status Modal */}
        <FoodStatusModal
          isOpen={foodStatusModalOpen}
          onClose={() => setFoodStatusModalOpen(false)}
          foodAvailableGrams={foodAvailableGrams}
          maxCapacityGrams={config.hopperCapacityGrams}
          onRefill={handleRefillFood}
          onResetHopper={handleResetHopper}
        />

        {/* 3. Pet Detection Radar Modal */}
        <PetDetectionModal
          isOpen={petDetectionModalOpen}
          onClose={() => setPetDetectionModalOpen(false)}
          pet={pet}
          isDetected={petDetected}
          onToggleDetection={() => setPetDetected(!petDetected)}
          sensitivity={config.radarDetectionSensitivity}
          onChangeSensitivity={val =>
            setConfig(prev => ({ ...prev, radarDetectionSensitivity: val }))
          }
        />

        {/* 4. Add Schedule Modal */}
        <AddScheduleModal
          isOpen={addScheduleModalOpen}
          onClose={() => setAddScheduleModalOpen(false)}
          onAdd={handleAddSchedule}
        />

        {/* 5. Edit Pet Profile Modal */}
        <EditPetModal
          isOpen={editPetModalOpen}
          onClose={() => setEditPetModalOpen(false)}
          pet={pet}
          onSave={updated => setPet(updated)}
        />

        {/* 6. Notifications Feed Modal */}
        <NotificationsModal
          isOpen={notificationsModalOpen}
          onClose={() => setNotificationsModalOpen(false)}
          notifications={notifications}
          onClear={() => setNotifications([])}
        />

        {/* 7. Feeder Hardware & Device Config Modal */}
        <DeviceSettingsModal
          isOpen={deviceSettingsModalOpen}
          onClose={() => setDeviceSettingsModalOpen(false)}
          device={device}
          config={config}
          onUpdateConfig={patch => setConfig(prev => ({ ...prev, ...patch }))}
        />

        {/* 8. Wi-Fi Settings Modal */}
        <WifiModal
          isOpen={wifiModalOpen}
          onClose={() => setWifiModalOpen(false)}
          device={device}
          onUpdateWifi={ssid => setDevice(prev => ({ ...prev, networkName: ssid, isConnected: true }))}
        />
      </div>
    </div>
  );
}
