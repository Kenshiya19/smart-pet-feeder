import React, { useState } from 'react';
import {
  BarChart3,
  Gauge,
  Clock,
  Utensils,
  FileText,
  ChevronDown,
  ArrowLeft,
  Check,
  Download,
  Calendar
} from 'lucide-react';
import { DailyConsumption, PetInfo } from '../types';

interface ConsumptionAnalyticsProps {
  data: DailyConsumption[];
  pet: PetInfo;
  onBack?: () => void;
  isModal?: boolean;
}

export const ConsumptionAnalytics: React.FC<ConsumptionAnalyticsProps> = ({
  data,
  pet,
  onBack,
  isModal = false,
}) => {
  const [timeRange, setTimeRange] = useState<'Last 7 Days' | 'Last 14 Days' | 'Last 30 Days'>('Last 7 Days');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<DailyConsumption | null>(null);
  const [reportExported, setReportExported] = useState(false);

  // Compute stats
  const weeklyTotal = data.reduce((acc, curr) => acc + curr.amountGrams, 0);
  const dailyAvg = Math.round(weeklyTotal / (data.length || 1));
  const totalMeals = data.reduce((acc, curr) => acc + curr.mealsCount, 0);

  // Max value for bar scaling (max between highest day and target + padding)
  const maxVal = Math.max(...data.map(d => d.amountGrams), 160) * 1.15;

  const handleExportReport = () => {
    setReportExported(true);
    const reportContent = `SMART PET FEEDER - HEALTH & CONSUMPTION REPORT
--------------------------------------------------
Pet: ${pet.name} (${pet.type} - ${pet.breed})
Weight: ${pet.weightKg} kg
Daily Target: ${pet.dailyTargetGrams} g
Report Range: ${timeRange}
Generated: ${new Date().toLocaleDateString()}

WEEKLY SUMMARY:
- Total Consumed: ${weeklyTotal} g
- Daily Average: ${dailyAvg} g / day
- Total Feeding Sessions: ${totalMeals} meals
- Most Common Meal Time: 7:00 PM (Evening Meal)

DAILY BREAKDOWN:
${data.map(d => `${d.fullDay} (${d.date}): ${d.amountGrams}g - ${d.mealsCount} meals`).join('\n')}

DIET ADHERENCE:
Adherence: ${Math.min(100, Math.round((weeklyTotal / (pet.dailyTargetGrams * 7)) * 100))}% of recommended daily goal.
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pet.name.toLowerCase()}_pet_nutrition_report.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setReportExported(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 bg-[#F7F9F8] min-h-screen text-slate-800 pb-24 font-sans">
      {/* Top Tag or Back button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="inline-block bg-[#10B981] text-white text-xs font-semibold px-2.5 py-0.5 rounded shadow-sm">
            ConsumptionAnalytics
          </span>
        </div>
      </div>

      {/* Main Consumption Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-5 relative">
        {/* Title and Date Range dropdown */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Daily Food Consumption
          </h2>

          <div className="relative">
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/80 hover:bg-slate-100 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRangeDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 text-xs">
                {(['Last 7 Days', 'Last 14 Days', 'Last 30 Days'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeRange(option);
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      timeRange === option ? 'font-semibold text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    {timeRange === option && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover / Tooltip info display */}
        <div className="h-6 mb-2 flex items-center justify-center text-xs">
          {hoveredDay ? (
            <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-medium shadow-sm transition-all animate-fade-in">
              {hoveredDay.fullDay}: <strong className="text-emerald-300">{hoveredDay.amountGrams} g</strong> ({hoveredDay.mealsCount} meals)
            </span>
          ) : (
            <span className="text-slate-400">Tap or hover over any bar for details</span>
          )}
        </div>

        {/* Bar Chart Container */}
        <div className="flex items-end justify-between h-44 px-3 mb-2 pt-2">
          {data.map((day, idx) => {
            const heightPercent = Math.min(100, Math.max(15, (day.amountGrams / maxVal) * 100));
            const isHovered = hoveredDay?.dayLabel === day.dayLabel && hoveredDay?.date === day.date;

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 cursor-pointer group"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setHoveredDay(hoveredDay === day ? null : day)}
              >
                {/* Visual Bar */}
                <div className="w-full flex justify-center h-36 items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-5 sm:w-6 rounded-full transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#7D9775] scale-105 shadow-md'
                        : 'bg-[#9FB39B] hover:bg-[#8CA288]'
                    }`}
                  />
                </div>
                {/* Day label */}
                <span className={`text-xs mt-2 font-medium ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Horizontal Divider */}
        <div className="h-[1px] bg-slate-100 my-4" />

        {/* 2 Stat Boxes */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weekly Total */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-rose-500 mb-1">
              <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Weekly Total</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{weeklyTotal}</span>
                <span className="text-sm font-semibold text-slate-700">g</span>
              </div>
            </div>
          </div>

          {/* Daily Avg */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-rose-500 mb-1">
              <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Daily Avg</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{dailyAvg}</span>
                <span className="text-sm font-semibold text-slate-700">g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feeding Insights Section */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
          Feeding Insights
        </h3>

        <div className="space-y-3">
          {/* Insight 1: Most Common Time */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-amber-50/80 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Most Common Time</span>
              <span className="text-sm font-bold text-slate-800">7:00 PM (Evening Meal)</span>
            </div>
          </div>

          {/* Insight 2: Total Feedings */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total Feedings</span>
              <span className="text-sm font-bold text-slate-800">{totalMeals} meals this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Health Report Button */}
      <button
        onClick={handleExportReport}
        className="w-full bg-[#FAF8F5] hover:bg-[#F2EFEA] active:scale-[0.99] border border-slate-200/80 rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 text-slate-700 font-semibold text-sm transition-all shadow-sm"
      >
        {reportExported ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Report Downloaded!</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Export Health Report</span>
          </>
        )}
      </button>
    </div>
  );
};
