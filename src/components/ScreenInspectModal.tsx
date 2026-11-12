'use client';

import React, { useState } from 'react';
import { X, Thermometer, Compass, Sun, MapPin } from 'lucide-react';
import { FarmDirectoryParcel } from '@/app/page';

export type ScreenItem = FarmDirectoryParcel;

interface ScreenInspectModalProps {
  screen: FarmDirectoryParcel | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onOpenMap?: () => void;
}

export default function ScreenInspectModal({
  screen,
  onClose,
  onOpenMap,
}: ScreenInspectModalProps) {
  const [copied, setCopied] = useState(false);

  if (!screen) return null;

  const copyCoords = () => {
    navigator.clipboard.writeText(`${screen.lat}, ${screen.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[36px] max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-100"
      >
        {/* Left: Device Screen Container */}
        <div className="md:w-1/2 bg-[#F5F5F5] p-6 sm:p-10 flex items-center justify-center relative overflow-hidden">
          <div className="w-[280px] max-h-[520px] rounded-[36px] overflow-hidden bg-white shadow-xl border-4 border-gray-900/10 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-[#888888] pb-3 border-b border-gray-100">
              <span className="font-bold">9:41</span>
              <span className="text-[#1E8236] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-full text-[10px]">
                NASA Synced
              </span>
            </div>

            <div className="my-auto py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1E8236] mb-3">
                <MapPin size={28} />
              </div>
              <h4 className="text-xl font-bold text-[#111111]">{screen.name}</h4>
              <p className="text-xs text-[#888888] mt-1">{screen.emirate} • {screen.subRegion}</p>
              <div className="mt-4 bg-[#F7F7F7] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-[#111111]">
                {screen.lat.toFixed(4)}°N, {screen.lng.toFixed(4)}°E
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between text-xs font-semibold text-[#111111]">
              <span>{screen.waterSaved}</span>
              <span className="text-[#1E8236]">{screen.annualWaterM3}</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Info */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-[#E8F5E9] text-[#1E8236] text-xs font-bold px-3 py-1 rounded-full">
                {screen.type.toUpperCase()} PARCEL
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-[#111111] leading-tight">
              {screen.name}
            </h2>
            <p className="text-sm text-[#888888] mt-1">{screen.subRegion}, {screen.emirate}</p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3.5 bg-[#F7F7F7] rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-[#888888] font-semibold mb-1">
                  <Thermometer size={14} className="text-[#34C759]" />
                  <span>AIR TEMP</span>
                </div>
                <div className="text-xl font-bold text-[#111111]">{screen.tempC}°C</div>
              </div>

              <div className="p-3.5 bg-[#F7F7F7] rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-[#888888] font-semibold mb-1">
                  <Sun size={14} className="text-[#FF9500]" />
                  <span>SOLAR FLUX</span>
                </div>
                <div className="text-xl font-bold text-[#111111]">{screen.solarVal} MJ</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#666666]">
              <div className="bg-[#F7F7F7] p-3 rounded-2xl flex justify-between">
                <span className="font-semibold text-[#888888]">Soil Profile:</span>
                <span className="font-bold text-[#111111]">{screen.soilProfile}</span>
              </div>
              <div className="bg-[#F7F7F7] p-3 rounded-2xl flex justify-between">
                <span className="font-semibold text-[#888888]">Water Source:</span>
                <span className="font-bold text-[#111111]">{screen.waterSource}</span>
              </div>
              <div className="bg-[#F7F7F7] p-3 rounded-2xl flex justify-between">
                <span className="font-semibold text-[#888888]">Optimal Protocol:</span>
                <span className="font-bold text-[#1E8236]">{screen.cropPlan}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                onClose();
                if (onOpenMap) onOpenMap();
              }}
              className="flex-1 py-3 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass size={15} />
              <span>Launch Live Map</span>
            </button>

            <button
              onClick={copyCoords}
              className="px-4 py-3 bg-[#F1F1F1] hover:bg-[#E5E5E5] text-xs font-semibold rounded-full transition-colors cursor-pointer text-[#111111]"
            >
              {copied ? 'Copied GPS!' : 'Copy GPS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
