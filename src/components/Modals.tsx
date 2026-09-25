import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  Bell,
  Scale,
  Wifi,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Radio
} from 'lucide-react';
import {
  PetInfo,
  ScheduleItem,
  DeviceConnection,
  FeederConfig,
  AppNotification
} from '../types';
import { sound } from '../utils/audio';
import { setChimeOnDispense } from '../utils/esp32';

// -------------------------------------------------------------
// 1. FOOD STATUS & HOPPER REFILL MODAL
// -------------------------------------------------------------
interface FoodStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodAvailableGrams: number;
  maxCapacityGrams: number;
  onRefill: (addedGrams: number) => void;
  onResetHopper: (newTotal: number) => void;
}

export const FoodStatusModal: React.FC<FoodStatusModalProps> = ({
  isOpen,
  onClose,
  foodAvailableGrams,
  maxCapacityGrams,
  onRefill,
  onResetHopper,
}) => {
  const [customAdd, setCustomAdd] = useState(50);
  if (!isOpen) return null;

  const percentage = Math.min(100, Math.round((foodAvailableGrams / maxCapacityGrams) * 100));
  const isLow = foodAvailableGrams <= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Food Hopper Status</h3>
            <span className="text-xs text-slate-500">Weight sensor calibration</span>
          </div>
        </div>

        {/* Current Food Level Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Food Available</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{foodAvailableGrams}</span>
              <span className="text-sm font-semibold text-slate-600">/ {maxCapacityGrams} g</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              style={{ width: `${percentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isLow ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className={isLow ? 'text-amber-600 font-semibold flex items-center gap-1' : 'text-slate-500'}>
              {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
              {isLow ? 'Low food warning' : 'Optimal food level'}
            </span>
            <span className="text-slate-500 font-medium">{percentage}% full</span>
          </div>
        </div>

        {/* Quick Refill Buttons */}
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Add Food to Feeder
        </h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[50, 100, 200].map(amt => (
            <button
              key={amt}
              onClick={() => {
                sound.playClick();
                onRefill(amt);
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 font-semibold text-xs transition-all active:scale-95"
            >
              +{amt} g
            </button>
          ))}
        </div>

        {/* Fill to Maximum */}
        <button
          onClick={() => {
            sound.playSuccess();
            onResetHopper(maxCapacityGrams);
          }}
          className="w-full py-2.5 px-4 mb-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100/70 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fill Hopper to Max (500 g)</span>
        </button>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. PET DETECTION RADAR & PROXIMITY MODAL
// -------------------------------------------------------------
interface PetDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetInfo;
  isDetected: boolean;
  onToggleDetection: () => void;
  sensitivity: 'Low' | 'Medium' | 'High';
  onChangeSensitivity: (val: 'Low' | 'Medium' | 'High') => void;
}

export const PetDetectionModal: React.FC<PetDetectionModalProps> = ({
  isOpen,
  onClose,
  pet,
  isDetected,
  onToggleDetection,
  sensitivity,
  onChangeSensitivity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pet Proximity Radar</h3>
            <span className="text-xs text-slate-500">Ultrasonic & PIR sensor</span>
          </div>
        </div>

        {/* Radar Visualization */}
        <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
          {/* Radar Circles */}
          <div className="absolute inset-0 rounded-full border border-slate-200" />
          <div className="absolute inset-4 rounded-full border border-slate-200" />
          <div className="absolute inset-10 rounded-full border border-slate-200" />

          {/* Radar sweep / pulse when detected */}
          {isDetected && (
            <div className="absolute inset-2 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 animate-ping" />
          )}

          {/* Center Feeder dot */}
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold z-10">
            F
          </div>

          {/* Pet Indicator */}
          {isDetected ? (
            <div className="absolute top-6 right-8 flex flex-col items-center animate-bounce z-20">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-md font-bold">
                🐾
              </div>
              <span className="text-[10px] font-bold text-emerald-700 mt-0.5 bg-white px-1.5 py-0.2 rounded shadow-xs">
                {pet.name}
              </span>
            </div>
          ) : (
            <div className="absolute bottom-4 text-xs text-slate-400 font-medium">
              No pet in range
            </div>
          )}
        </div>

        {/* Status Box */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDetected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className={isDetected ? 'text-emerald-700' : 'text-slate-600'}>
              {isDetected ? `${pet.name} is near the feeder` : 'Feeder area is clear'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isDetected
              ? 'Distance: 0.4 meters • Approached 2 mins ago'
              : 'Last detected: 18 minutes ago (Duration: 3 mins)'}
          </p>
        </div>

        {/* Radar Sensitivity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detection Sensitivity
            </span>
            <span className="text-xs font-semibold text-emerald-600">{sensitivity}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['Low', 'Medium', 'High'] as const).map(level => (
              <button
                key={level}
                onClick={() => {
                  sound.playClick();
                  onChangeSensitivity(level);
                }}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  sensitivity === level
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Test Simulator Button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleDetection();
          }}
          className="w-full py-2.5 px-4 mb-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>{isDetected ? `Simulate ${pet.name} Walking Away` : `Simulate ${pet.name} Approaching`}</span>
        </button>

        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl text-sm transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. ADD SCHEDULE MODAL
// -------------------------------------------------------------
interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (schedule: Omit<ScheduleItem, 'id'>) => void;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('Breakfast');
  const [timeStr, setTimeStr] = useState('08:00');
  const [amountGrams, setAmountGrams] = useState(50);
  const [frequency, setFrequency] = useState('Daily');
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();

    // Format 24h to 12h AM/PM
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const m = minutes || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const formatted12h = `${h}:${m} ${ampm}`;

    onAdd({
      name: name.trim() || 'Custom Meal',
      time: formatted12h,
      time24: timeStr,
      amountGrams,
      frequency,
      enabled: true,
      notificationsEnabled: notifications,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Add Feeding Schedule</h3>
        <p className="text-xs text-slate-500 mb-4">Set an automatic dispensing timer</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Meal Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meal Name
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Morning', 'Lunch', 'Evening', 'Night'].map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setName(n)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    name === n
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Snack Time"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
              required
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Feeding Time
            </label>
            <input
              type="time"
              value={timeStr}
              onChange={e => setTimeStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-emerald-500"
              required
            />
          </div>

          {/* Portion Stepper */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Portion Size
              </label>
              <span className="text-sm font-bold text-emerald-600">{amountGrams} g</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAmountGrams(Math.max(10, amountGrams - 10))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95"
              >
                -
              </button>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={amountGrams}
                onChange={e => setAmountGrams(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setAmountGrams(Math.min(150, amountGrams + 10))}
                className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 text-slate-700"
            >
              <option value="Daily">Daily</option>
              <option value="Weekdays">Weekdays (Mon-Fri)</option>
              <option value="Weekends">Weekends (Sat-Sun)</option>
            </select>
          </div>

          {/* Notification checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
            />
            <span className="text-xs text-slate-600 font-medium">
              Send alert when dispensed
            </span>
          </label>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-98"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. EDIT PET PROFILE MODAL
// -------------------------------------------------------------
interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetInfo;
  onSave: (updated: PetInfo) => void;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSave,
}) => {
  const [formData, setFormData] = useState<PetInfo>({ ...pet });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Pet Information</h3>
        <p className="text-xs text-slate-500 mb-4">Manage your pet profile and dietary goals</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pet Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pet Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500 text-slate-800"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Breed
            </label>
            <input
              type="text"
              value={formData.breed}
              onChange={e => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Daily Target Food (grams)
            </label>
            <input
              type="number"
              step="10"
              value={formData.dailyTargetGrams}
              onChange={e => setFormData({ ...formData, dailyTargetGrams: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-500"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Recommended for {formData.weightKg}kg {formData.type.toLowerCase()}: ~{Math.round(formData.weightKg * 8.5)}g
            </span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-98"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. NOTIFICATIONS MODAL
// -------------------------------------------------------------
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClear: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pr-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
            <span className="text-xs text-slate-500">Feeder alerts and events</span>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No new notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{n.title}</span>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600">{n.description}</p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. DEVICE & HARDWARE SETTINGS MODAL
// -------------------------------------------------------------
interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceConnection;
  config: FeederConfig;
  onUpdateConfig: (cfg: Partial<FeederConfig>) => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  device,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Feeder Hardware Settings</h3>
        <p className="text-xs text-slate-500 mb-4">{device.hardwareModel} • Firmware {device.firmwareVersion}</p>

        <div className="space-y-4">
          {/* Audio Chime toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                {config.chimeOnDispense ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Dispense Audio Chime</span>
                <span className="text-[11px] text-slate-500">Call pet to bowl with chime</span>
              </div>
            </div>
          <input
  type="checkbox"
  checked={config.chimeOnDispense}
onChange={e =>
  onUpdateConfig({
    chimeOnDispense: e.target.checked,
  })
}
  className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
/>
          </div>

          {/* Low Food Alert Threshold */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">Low Food Alert Threshold</span>
              <span className="text-xs font-semibold text-slate-700">{config.lowFoodThresholdGrams} g</span>
            </div>
            <span className="text-[11px] text-slate-500 block mb-2">
              Send phone notification when hopper is below this weight.
            </span>
            <div className="flex gap-2">
              {[80, 120, 150].map(val => (
                <button
                  key={val}
                  onClick={() => onUpdateConfig({ lowFoodThresholdGrams: val })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                    config.lowFoodThresholdGrams === val
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {val} g
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl text-sm transition-all"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
