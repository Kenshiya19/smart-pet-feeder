import React from 'react';
import { Home, CalendarDays, UtensilsCrossed, History, User } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabType = 'home' | 'schedule' | 'feeding' | 'history' | 'profile';

interface BottomNavProps {
  currentTab: TabType | null;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'schedule' as TabType, label: 'Schedule', icon: CalendarDays },
    { id: 'feeding' as TabType, label: 'Feeding', icon: UtensilsCrossed },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 max-w-md mx-auto shadow-lg">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group ${
                isActive ? 'text-[#10B981]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Icon container with active soft circle background */}
              <div
                className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#E6F7F2]' : 'group-hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
              </div>

              {/* Text label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'font-bold text-[#10B981]' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
