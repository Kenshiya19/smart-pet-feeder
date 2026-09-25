import React, { useEffect, useState, useRef} from 'react';
import { CheckCircle2, X, Sparkles, Utensils } from 'lucide-react';
import { sound } from '../utils/audio';

interface DispenseAnimationModalProps {
  amountGrams: number;
  petName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DispenseAnimationModal: React.FC<DispenseAnimationModalProps> = ({
  amountGrams,
  petName,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<'dispensing' | 'completed'>('dispensing');
  const [dispensedCount, setDispensedCount] = useState(0);
  const completionCalledRef = useRef(false);
  useEffect(() => {
   if (!isOpen) {
  setStage('dispensing');
  setDispensedCount(0);
  completionCalledRef.current = false;
  return;
}

    // Play motor and kibble dispense sound
    sound.playDispenseSound();

    // Incremental grams counter animation
 const interval = setInterval(() => {
  setDispensedCount(prev => {
    const next = Math.min(amountGrams, prev + 1);

   if (next >= amountGrams && !completionCalledRef.current) {
  completionCalledRef.current = true;
  clearInterval(interval);
  setStage('completed');
  onComplete();
}

    return next;
  });
}, 200);

    return () => clearInterval(interval);
  }, [isOpen, amountGrams]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs sm:max-w-sm text-center shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Close Button */}
        {stage === 'completed' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic Feeder Visual */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          {stage === 'dispensing' ? (
            <div className="relative flex flex-col items-center">
              {/* Feeder Device Graphic */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center relative animate-pulse">
                <Utensils className="w-10 h-10 text-white" />
                {/* Rotating gear indicator */}
                <div className="absolute -bottom-2 w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center animate-spin">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Falling kibble pieces */}
              <div className="h-14 w-16 relative overflow-hidden flex justify-center mt-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      left: `${15 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.18}s`,
                      animationDuration: '0.65s',
                    }}
                    className="absolute w-2.5 h-2.5 bg-amber-700 rounded-full animate-bounce"
                  />
                ))}
              </div>

              {/* Stainless Dish */}
              <div className="w-28 h-6 bg-slate-300 rounded-b-xl border-t-2 border-slate-400 shadow-inner flex items-center justify-center">
                <div className="w-20 h-2 bg-amber-700/40 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bowl Filled</span>
              </div>
            </div>
          )}
        </div>

        {/* Information */}
        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {stage === 'dispensing' ? 'Dispensing Food...' : 'Dispensed Successfully!'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {stage === 'dispensing'
            ? `Releasing fresh portion for ${petName}`
            : `Fresh ${amountGrams} g portion is ready in the bowl for ${petName}!`}
        </p>

        {/* Counter Display */}
        <div className="bg-slate-50 rounded-2xl py-3 px-4 mb-5 border border-slate-100 flex items-center justify-center gap-2">
          <span className="text-3xl font-extrabold text-emerald-600">
            {dispensedCount}
          </span>
          <span className="text-lg font-bold text-slate-400">/ {amountGrams} g</span>
        </div>

        {/* Action Button */}
        {stage === 'completed' ? (
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            Done
          </button>
        ) : (
          <div className="text-xs text-slate-400 font-medium animate-pulse">
            Motor active • Please wait...
          </div>
        )}
      </div>
    </div>
  );
};
