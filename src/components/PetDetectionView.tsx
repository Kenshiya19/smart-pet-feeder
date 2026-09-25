import React from 'react';
import { ChevronLeft, CheckSquare } from 'lucide-react';
import { sound } from '../utils/audio';

interface PetDetectionViewProps {
  onBack: () => void;
  petDetected: boolean;
  onToggleDetection?: () => void;
  lastDetectedTime?: string;
}

export const PetDetectionView: React.FC<PetDetectionViewProps> = ({
  onBack,
  petDetected,
  onToggleDetection,
  lastDetectedTime = 'Today, 6:42 PM',
}) => {
  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100vh-70px)] bg-[#F8FAFA] flex flex-col font-sans pb-28">
      {/* Top App Bar with back button */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 bg-[#F8FAFA] border-b border-slate-100/90 sticky top-0 z-10">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="p-1 -ml-2 text-slate-800 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div>
          <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
            Pet Detection
          </h1>
          <p className="text-[12px] text-slate-400 font-normal">
            IR Proximity sensor status
          </p>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="px-4 pt-5 space-y-4">
        {/* Card 1: Centered Mint Circle Pet Icon & Detection Status */}
        <div
          onClick={() => {
            if (onToggleDetection) {
              sound.playClick();
              onToggleDetection();
            }
          }}
          className="bg-white rounded-[28px] py-12 px-6 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-200 active:scale-[0.99]"
          title="Tap to trigger IR obstacle sensor beam"
        >
          {/* Mint Circle Background */}
          <div className="w-[104px] h-[104px] rounded-full bg-[#E5F7F0] flex items-center justify-center mb-7 relative">
            {/* Custom Dog Head Line Art matching the screenshot */}
            <svg
              className="w-14 h-14 text-[#059669]"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Head contour */}
              <path d="M19 12C15 12 11 15 11 23C11 29 14.5 33 17 34C19 35 22 36 24 36C26 36 29 35 31 34C33.5 33 37 29 37 23C37 15 33 12 29 12" />
              {/* Left ear */}
              <path d="M15 12C12 11 8 13.5 8 19C8 23 10.5 25.5 13 25" />
              {/* Right ear */}
              <path d="M33 12C36 11 40 13.5 40 19C40 23 37.5 25.5 35 25" />
              {/* Left Eye */}
              <circle cx="19" cy="23" r="1.8" fill="currentColor" />
              {/* Right Eye */}
              <circle cx="29" cy="23" r="1.8" fill="currentColor" />
              {/* Snout/Nose */}
              <ellipse cx="24" cy="28.5" rx="2.5" ry="1.8" fill="currentColor" />
              {/* Small mouth curve */}
              <path d="M22 31.5C23 32.5 25 32.5 26 31.5" strokeWidth="2.2" />
            </svg>

            {/* Small IR Beam indicator ring if pet detected */}
            {petDetected && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Status Row: Vibrant Green Dot + Bold Text */}
          <div className="flex items-center justify-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                petDetected ? 'bg-[#34D399]' : 'bg-slate-300'
              }`}
            />
            <span className="text-[19px] font-bold text-slate-900 tracking-tight">
              {petDetected ? 'Pet Detected' : 'No Pet Detected'}
            </span>
          </div>
        </div>

        {/* Card 2: Last Detected & Feeding Status */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          {/* Row 1: Last Detected */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/90">
            <span className="text-[13px] font-normal text-slate-400">
              Last Detected
            </span>
            <span className="text-[14px] font-bold text-slate-900">
              {lastDetectedTime}
            </span>
          </div>

          {/* Row 2: Feeding Status */}
          <div className="flex items-center justify-between pt-3.5">
            <span className="text-[13px] font-normal text-slate-500">
              Feeding Status
            </span>
            <div className="flex items-center gap-2 text-[#059669] font-medium text-[13px]">
              <CheckSquare className="w-4 h-4 text-[#059669] stroke-[2.4] fill-[#E5F7F0]" />
              <span className="font-semibold">
                {petDetected ? 'Pet is near feeder' : 'Pet is away from feeder'}
              </span>
            </div>
          </div>
        </div>

        {/* IR Hardware Sensor Info & Simulation */}
        <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Infrared (IR) Sensor Telemetry
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              GPIO 27 Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Beam State</span>
              <span className="font-bold text-slate-800 text-xs">
                {petDetected ? 'Obstacle Detected (LOW)' : 'Path Clear (HIGH)'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Detection Range</span>
              <span className="font-bold text-slate-800 text-xs">
                Up to 15 cm
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              if (onToggleDetection) onToggleDetection();
            }}
            className="w-full mt-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-98 transition-all text-xs font-medium text-slate-700 flex items-center justify-center gap-2"
          >
            <span>{petDetected ? 'Simulate: Pet Leaves Feeder (IR Clear)' : 'Simulate: Pet Approaches Feeder (IR Trigger)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
