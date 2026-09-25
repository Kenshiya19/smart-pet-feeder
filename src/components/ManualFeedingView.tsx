import React, { useState } from 'react';
import { Minus, Plus, Utensils, Wifi, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface ManualFeedingViewProps {
  foodAvailableGrams: number;
  onFeedNow: (amountGrams: number) => void;
  isDeviceConnected: boolean;
}

export const ManualFeedingView: React.FC<ManualFeedingViewProps> = ({
  foodAvailableGrams,
  onFeedNow,
  isDeviceConnected,
}) => {
  const [amount, setAmount] = useState<number>(50);

  const handleDecrease = () => {
    sound.playClick();
    setAmount(prev => Math.max(10, prev - 10));
  };

  const handleIncrease = () => {
    sound.playClick();
    setAmount(prev => Math.min(foodAvailableGrams, Math.min(150, prev + 10)));
  };

  const handleDispense = () => {
    sound.playClick();
    onFeedNow(amount);
  };

  const hasEnoughFood = foodAvailableGrams >= amount;

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-6 pb-28 text-slate-800 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manual Feeding
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Dispense food instantly
        </p>
      </div>

      {/* Main Quantity Stepper Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-6 text-center">
        <span className="text-xs font-semibold text-slate-500 block mb-6">
          Select Quantity
        </span>

        {/* Stepper Row matching screenshot 3 */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Decrement button [-] */}
          <button
            onClick={handleDecrease}
            disabled={amount <= 10}
            className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-800 transition-all text-xl font-bold shadow-xs"
            aria-label="Decrease quantity"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Amount Display */}
          <div className="flex items-baseline justify-center min-w-[120px]">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {amount}
            </span>
            <span className="text-lg font-bold text-slate-500 ml-1.5">g</span>
          </div>

          {/* Increment button [+] */}
          <button
            onClick={handleIncrease}
            disabled={amount >= Math.min(150, foodAvailableGrams)}
            className="w-14 h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-emerald-700 transition-all text-xl font-bold shadow-xs"
            aria-label="Increase quantity"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick presets row */}
        <div className="flex justify-center gap-2 mb-6">
          {[20, 30, 50, 80, 100].map(val => (
            <button
              key={val}
              onClick={() => {
                sound.playClick();
                setAmount(Math.min(foodAvailableGrams, val));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                amount === val
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {val}g
            </button>
          ))}
        </div>

        {/* Food Available indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
          <Utensils className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Food Available:{' '}
            <strong className="text-slate-900 font-bold">{foodAvailableGrams} g</strong>
          </span>
        </div>
      </div>

      {/* Warning if insufficient food */}
      {!hasEnoughFood && (
        <div className="p-3 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Insufficient food in hopper. Please refill before dispensing.</span>
        </div>
      )}

      {/* Feed Now Button */}
      <button
        onClick={handleDispense}
        disabled={!hasEnoughFood || !isDeviceConnected}
        className="w-full bg-[#10B981] hover:bg-[#0EA271] disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center text-base transition-all mb-4"
      >
        Feed Now
      </button>

      {/* Feeder Connected indicator matching screenshot 3 */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
        <Wifi className="w-4 h-4 text-emerald-600" />
        <span>{isDeviceConnected ? 'Feeder Connected' : 'Feeder Disconnected'}</span>
      </div>
    </div>
  );
};
