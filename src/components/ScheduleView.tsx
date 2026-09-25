import React from 'react';
import { Clock, X, Plus } from 'lucide-react';
import { ScheduleItem } from '../types';
import { sound } from '../utils/audio';

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  onToggleSchedule,
  onDeleteSchedule,
  onOpenAddModal,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-5 pt-6 pb-28 text-slate-800 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Feeding Schedule
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Set automatic feeding times
        </p>
      </div>

      {/* Schedules List */}
      <div className="space-y-4 mb-6">
        {schedules.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                {/* Clock Badge */}
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {item.time} • {item.amountGrams} g • {item.frequency}
                  </p>
                </div>
              </div>

              {/* Right actions: Delete '✕' and Toggle Switch */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onDeleteSchedule(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-50 transition-colors"
                  aria-label="Delete schedule"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Custom Toggle Switch matching screenshot */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onToggleSchedule(item.id);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                    item.enabled ? 'bg-[#10B981]' : 'bg-slate-200'
                  }`}
                  aria-label="Toggle schedule active"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Subtext status: "ON • Notifications enabled" */}
            {item.enabled && item.notificationsEnabled && (
              <div className="mt-3 text-[11px] font-bold text-emerald-600 tracking-wide">
                ON • Notifications enabled
              </div>
            )}
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            No scheduled feedings yet. Add one below!
          </div>
        )}
      </div>

      {/* "+ Add Schedule" dashed button matching screenshot 2 */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenAddModal();
        }}
        className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-3xl text-emerald-600 hover:bg-emerald-50/50 active:scale-[0.99] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
      >
        <Plus className="w-4 h-4 text-emerald-600" />
        <span>Add Schedule</span>
      </button>
    </div>
  );
};
