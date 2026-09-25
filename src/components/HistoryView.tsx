import React, { useState } from 'react';
import { CheckCircle2, Filter, Trash2 } from 'lucide-react';
import { FeedingRecord } from '../types';
import { sound } from '../utils/audio';

interface HistoryViewProps {
  history: FeedingRecord[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<'All' | 'Manual' | 'Scheduled'>('All');

  // Filter items
  const filteredHistory = history.filter(item => {
    if (filter === 'All') return true;
    return item.type === filter;
  });

  // Calculate stats for today
  const todayItems = history.filter(h => h.dateCategory === 'TODAY');
  const todayTotalGrams = todayItems.reduce((acc, curr) => acc + curr.amountGrams, 0);
  const todayFeedingsCount = todayItems.length;

  // Group by category: TODAY, YESTERDAY, EARLIER
  const groups: { [key: string]: FeedingRecord[] } = {
    TODAY: filteredHistory.filter(h => h.dateCategory === 'TODAY'),
    YESTERDAY: filteredHistory.filter(h => h.dateCategory === 'YESTERDAY'),
    EARLIER: filteredHistory.filter(h => h.dateCategory === 'EARLIER'),
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-6 pb-28 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Feeding History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Record of all feedings
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all feeding history?')) {
                sound.playClick();
                onClearHistory();
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-xl transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hero Summary Card matching screenshot 4 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-md shadow-emerald-500/20 mb-6">
        <span className="text-xs font-medium text-emerald-100/90 block mb-1">
          Total Today
        </span>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-4xl font-black tracking-tight">{todayTotalGrams}</span>
          <span className="text-xl font-bold opacity-90">g</span>
        </div>
        <p className="text-xs text-emerald-100 font-medium">
          {todayFeedingsCount} feedings today
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {(['All', 'Manual', 'Scheduled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              sound.playClick();
              setFilter(tab);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grouped Feedings List */}
      <div className="space-y-6">
        {(['TODAY', 'YESTERDAY', 'EARLIER'] as const).map(cat => {
          const items = groups[cat];
          if (!items || items.length === 0) return null;

          return (
            <div key={cat}>
              {/* Category Header */}
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                {cat}
              </h3>

              {/* Items in Category */}
              <div className="space-y-2.5">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between transition-all"
                  >
                    {/* Left: Time and Type badge */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 w-16">
                        {item.timeStr}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {item.type}
                      </span>
                    </div>

                    {/* Right: Amount and Check Icon */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">
                        {item.amountGrams} g
                      </span>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No feeding records found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};
