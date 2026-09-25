import React from 'react';
import {
  Footprints,
  Bell,
  ChevronRight,
  Play,
  Scale,
  Dog,
  BarChart2,
  Clock,
  Utensils,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PetInfo, ScheduleItem } from '../types';
import { sound } from '../utils/audio';

interface HomeViewProps {
  pet: PetInfo;
  foodAvailableGrams: number;
  maxCapacityGrams: number;
  nextFeeding: { time: string; name: string; amountGrams: number } | null;
  petDetected: boolean;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenFoodStatus: () => void;
  onOpenPetDetection: () => void;
  onOpenConsumptionAnalytics: () => void;
  onNavigateToTab: (tab: 'home' | 'schedule' | 'feeding' | 'history' | 'profile') => void;
  onTriggerQuickFeed: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  pet,
  foodAvailableGrams,
  maxCapacityGrams,
  nextFeeding,
  petDetected,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenFoodStatus,
  onOpenPetDetection,
  onOpenConsumptionAnalytics,
  onNavigateToTab,
  onTriggerQuickFeed,
}) => {
  // Determine dynamic greeting based on actual time
  const hour = new Date().getHours();
  let greeting = 'Good Evening!';
  if (hour < 12) greeting = 'Good Morning!';
  else if (hour < 17) greeting = 'Good Afternoon!';

  // Food percentage for the progress bar
  const foodPercentage = Math.min(100, Math.max(5, Math.round((foodAvailableGrams / maxCapacityGrams) * 100)));

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-4 pb-28 text-slate-800 font-sans">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* Logo brand */}
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <Footprints className="w-4 h-4" />
            <span className="text-xs font-bold tracking-tight">Smart Pet Feeder</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{greeting}</span>
            <span className="text-xl">👋</span>
          </h1>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenNotifications();
          }}
          className="relative w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>

      {/* Pet Status Hero Card */}
      <div
        onClick={onOpenPetDetection}
        className="cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 text-white shadow-md shadow-emerald-500/20 mb-4 transition-transform active:scale-[0.99] relative overflow-hidden"
      >
        {/* Subtle background glow circle */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-emerald-100/90 tracking-wide">
              Pet Status
            </span>

            {/* Pulsing indicator & Pet Detected */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                {petDetected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${petDetected ? 'bg-white' : 'bg-emerald-200/60'}`} />
              </span>
              <span className="text-lg font-bold tracking-tight">
                {petDetected ? 'Pet Detected' : 'No Pet Detected'}
              </span>
            </div>

            <p className="text-xs text-emerald-50 font-medium">
              {pet.name} • {pet.type}
            </p>
          </div>

          {/* Dog/Cat Icon Button */}
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-inner">
            <Dog className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Food Available Card */}
      <div
        onClick={onOpenFoodStatus}
        className="cursor-pointer bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4 hover:border-emerald-200 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">Food Available</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-3xl font-extrabold text-slate-900">{foodAvailableGrams}</span>
          <span className="text-sm font-semibold text-slate-400">g</span>
        </div>

        {/* Progress Bar matching screenshot */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${foodPercentage}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              foodAvailableGrams <= 120 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Next Feeding Card */}
      <div
        onClick={() => onNavigateToTab('schedule')}
        className="cursor-pointer bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5 hover:border-emerald-200 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">Next Feeding</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {nextFeeding ? nextFeeding.time : '7:00 PM'}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {nextFeeding
                ? `${nextFeeding.name} • ${nextFeeding.amountGrams} g`
                : 'Evening • 50 g'}
            </div>
          </div>
        </div>
      </div>

      {/* Large Primary "▶ Feed Now" Button */}
      <button
        onClick={() => {
          sound.playClick();
          onTriggerQuickFeed();
        }}
        className="w-full bg-[#10B981] hover:bg-[#0EA271] active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-base transition-all mb-6"
      >
        <Play className="w-4 h-4 fill-white text-white" />
        <span>Feed Now</span>
      </button>

      {/* Quick Actions (Pet Detection by IR Sensor & Feeding Pattern) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* 1. Pet Detection (Powered by IR Sensor) */}
        <button
          onClick={onOpenPetDetection}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-emerald-200 transition-all text-left flex items-center gap-3 active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Dog className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 leading-tight block">
              Pet Detection
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              IR Sensor
            </span>
          </div>
        </button>

        {/* 2. Feeding Pattern */}
        <button
          onClick={onOpenConsumptionAnalytics}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-emerald-200 transition-all text-left flex items-center gap-3 active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 leading-tight block">
              Feeding Pattern
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Analytics
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
