import React, { useState } from 'react';
import {
  Dog,
  Pencil,
  Wifi,
  Bell,
  Settings,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { PetInfo, DeviceConnection, FeederConfig } from '../types';
import { sound } from '../utils/audio';

interface ProfileSettingsViewProps {
  pet: PetInfo;
  device: DeviceConnection;
  config: FeederConfig;
  onOpenEditPet: () => void;
  onToggleNotifications: () => void;
  onOpenDeviceSettings: () => void;
  onOpenWifiModal: () => void;
  onSimulateReconnect: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  pet,
  device,
  config,
  onOpenEditPet,
  onToggleNotifications,
  onOpenDeviceSettings,
  onOpenWifiModal,
  onSimulateReconnect,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-5 pt-6 pb-28 text-slate-800 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Profile & device configuration
        </p>
      </div>

      {/* Settings Cards List matching screenshot 5 */}
      <div className="space-y-3.5">
        {/* 1. Pet Information */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenEditPet();
          }}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Dog className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pet Information
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {pet.name} • {pet.type}
              </p>
            </div>
          </div>

          {/* Edit icon */}
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
            aria-label="Edit pet info"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Device Connection */}
        <div
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Device Connection
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {device.hardwareModel} • {device.networkName}
              </p>
            </div>
          </div>

          {/* Green Connected Indicator Dot matching screenshot 5 */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                device.isConnected ? 'bg-[#10B981] shadow-xs shadow-emerald-500/50' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* 3. Notifications Toggle */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Notifications
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Feeding & low-food alerts
              </p>
            </div>
          </div>

          {/* Toggle Switch matching screenshot 5 */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleNotifications();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
              config.notificationsEnabled ? 'bg-[#10B981]' : 'bg-slate-200'
            }`}
            aria-label="Toggle notifications"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                config.notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* 4. Wi-Fi Settings */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenWifiModal();
          }}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Wi-Fi Settings
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 5. Feeder Settings */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenDeviceSettings();
          }}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Feeder Settings
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
