'use client';

import React from 'react';
import { Bookmark, Droplets, Thermometer, ArrowRight } from 'lucide-react';
import { FilterState } from './DirectoryNav';
import { FarmDirectoryParcel, UAE_PARCELS_DIRECTORY } from '@/app/page';

interface ShowcaseGridProps {
  filters: FilterState;
  searchQuery: string;
  onSelectParcel: (parcel: FarmDirectoryParcel) => void;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
}

export default function ShowcaseGrid({
  filters,
  searchQuery,
  onSelectParcel,
  bookmarkedIds = new Set(),
  onToggleBookmark,
}: ShowcaseGridProps) {
  const filteredParcels = UAE_PARCELS_DIRECTORY.filter((parcel) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        parcel.name.toLowerCase().includes(q) ||
        parcel.emirate.toLowerCase().includes(q) ||
        parcel.soilProfile.toLowerCase().includes(q) ||
        parcel.waterSource.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.category && parcel.emirate !== filters.category) return false;
    if (filters.screen && parcel.soilProfile !== filters.screen) return false;
    if (filters.uiElement && parcel.waterSource !== filters.uiElement) return false;
    if (filters.flow && parcel.cropPlan !== filters.flow) return false;

    return true;
  });

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredParcels.map((parcel) => {
          const isSaved = bookmarkedIds.has(parcel.id);

          return (
            <div
              key={parcel.id}
              onClick={() => onSelectParcel(parcel)}
              className="bg-[#F7F7F7] rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer group select-none min-h-[580px]"
            >
              {/* Top of Card */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[21px] font-bold text-[#111111] tracking-tight group-hover:text-[#34C759] transition-colors leading-snug">
                    {parcel.name}
                  </h3>
                  <span className="text-[12px] text-[#888888] font-medium mt-0.5 block">
                    {parcel.emirate} • {parcel.subRegion}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-white px-3 py-1.5 rounded-full shadow-xs">
                    <Thermometer size={14} className="text-[#34C759]" />
                    <span>{parcel.tempC}°C</span>
                  </div>

                  {onToggleBookmark && (
                    <button
                      type="button"
                      onClick={(e) => onToggleBookmark(parcel.id, e)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111111] hover:bg-[#ECECEC] transition-colors shadow-xs"
                    >
                      <Bookmark
                        size={15}
                        className={isSaved ? 'fill-[#111111]' : ''}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Middle of Card: Stylized Device Mini-Map */}
              <div className="flex-1 my-5 bg-white rounded-[24px] overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-xs relative flex flex-col justify-between p-4">
                <div className="flex items-center justify-between text-[11px] text-[#888888] font-medium pb-2 border-b border-[rgba(0,0,0,0.04)]">
                  <span>9:41</span>
                  <span className="text-[10px] text-[#1E8236] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-semibold">
                    NASA Telemetry
                  </span>
                </div>

                <div className="flex-1 my-3 relative overflow-hidden rounded-[16px] bg-[#F2F3F5] flex flex-col justify-between p-3.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#111111]">
                    <span className="bg-white/90 px-2 py-0.5 rounded-full shadow-2xs">
                      {parcel.lat.toFixed(4)}°N, {parcel.lng.toFixed(4)}°E
                    </span>
                    <span className="text-[#34C759] font-bold">● LIVE</span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center py-6">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center bg-[#1E8236]">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-[#111111] bg-white px-3 py-1 rounded-lg shadow-2xs">
                      {parcel.soilProfile}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#666666] bg-white/90 p-2 rounded-xl">
                    <span>Water: {parcel.waterSource}</span>
                    <span className="font-bold text-[#1E8236]">{parcel.annualWaterM3}</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] font-semibold text-[#111111] flex items-center justify-center gap-1 group-hover:text-[#34C759] transition-colors">
                  <span>Open in Live Map</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Bottom of Card */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(0,0,0,0.04)]">
                <div className="inline-flex items-center gap-1.5 bg-[rgba(52,199,89,0.12)] text-[#1E8236] text-[12px] font-bold px-3 py-1.5 rounded-full">
                  <Droplets size={13} className="text-[#34C759]" />
                  <span>{parcel.waterSaved}</span>
                </div>

                <div className="inline-flex items-center text-[12px] font-semibold text-[#111111] bg-white border border-[rgba(0,0,0,0.08)] px-3 py-1.5 rounded-full shadow-xs">
                  <span>Plan: {parcel.cropPlan.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
