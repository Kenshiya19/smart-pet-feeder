import React, { useState } from 'react';
import { X, Wifi, Lock, Check, RefreshCw } from 'lucide-react';
import { DeviceConnection } from '../types';
import { sound } from '../utils/audio';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceConnection;
  onUpdateWifi: (ssid: string) => void;
}

export const WifiModal: React.FC<WifiModalProps> = ({
  isOpen,
  onClose,
  device,
  onUpdateWifi,
}) => {
  const [scanning, setScanning] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(device.networkName);
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleScan = () => {
    sound.playClick();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 900);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
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

        <div className="flex items-center justify-between mb-4 pr-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Wi-Fi Settings</h3>
            <span className="text-xs text-slate-500">2.4 GHz IoT Network Connection</span>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Scan for networks"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Current status */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">{device.networkName}</span>
              <span className="text-[10px] text-emerald-700">Connected • IP: {device.ipAddress}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
            Online
          </span>
        </div>

      {/* Available Networks List */}
<h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
  Select Network
</h4>

<div className="mb-4 h-10">
</div>

        <form onSubmit={handleConnect} className="space-y-3">
          {selectedNetwork !== device.networkName && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Network Password
              </label>
              <input
                type="password"
                placeholder="Enter WPA2 passphrase"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl text-sm transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Connected!</span>
              </>
            ) : (
              <span>Save & Reconnect</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
