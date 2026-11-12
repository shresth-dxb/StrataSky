'use client';

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { FilterState } from './DirectoryNav';

interface SubNavFilterProps {
  platform: 'farms' | 'oases';
  setPlatform: (platform: 'farms' | 'oases') => void;
  activeSort: 'savings' | 'resilient' | 'salt' | 'live';
  setActiveSort: (sort: 'savings' | 'resilient' | 'salt' | 'live') => void;
  filters: FilterState;
  onClearAllFilters: () => void;
  onRemoveFilter: (type: keyof FilterState) => void;
  onToggleFilterModal?: () => void;
}

export default function SubNavFilter({
  platform,
  setPlatform,
  activeSort,
  setActiveSort,
  filters,
  onClearAllFilters,
  onRemoveFilter,
  onToggleFilterModal,
}: SubNavFilterProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full bg-white mb-6">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent">
          {/* Left: [ Farms | Oases ] segmented pill & tabs */}
          <div className="flex items-center gap-6 md:gap-8 flex-wrap">
            {/* Farms / Oases Pill Switcher */}
            <div className="inline-flex bg-[#F1F1F1] p-1 rounded-full text-xs font-semibold select-none">
              <button
                onClick={() => setPlatform('farms')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  platform === 'farms'
                    ? 'bg-white text-[#111111] font-bold shadow-xs'
                    : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                Farms
              </button>
              <button
                onClick={() => setPlatform('oases')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  platform === 'oases'
                    ? 'bg-white text-[#111111] font-bold shadow-xs'
                    : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                Oases
              </button>
            </div>

            {/* Text Filters */}
            <div className="flex items-center gap-6 text-[15px]">
              <button
                onClick={() => setActiveSort('savings')}
                className={`transition-colors py-1 cursor-pointer ${
                  activeSort === 'savings'
                    ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                    : 'text-[#888888] hover:text-[#111111] font-medium'
                }`}
              >
                Highest Water Savings
              </button>
              <button
                onClick={() => setActiveSort('resilient')}
                className={`transition-colors py-1 cursor-pointer ${
                  activeSort === 'resilient'
                    ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                    : 'text-[#888888] hover:text-[#111111] font-medium'
                }`}
              >
                Most Resilient
              </button>
              <button
                onClick={() => setActiveSort('salt')}
                className={`transition-colors py-1 cursor-pointer ${
                  activeSort === 'salt'
                    ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                    : 'text-[#888888] hover:text-[#111111] font-medium'
                }`}
              >
                Salt-Tolerant
              </button>
              <button
                onClick={() => setActiveSort('live')}
                className={`transition-colors py-1 cursor-pointer ${
                  activeSort === 'live'
                    ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                    : 'text-[#888888] hover:text-[#111111] font-medium'
                }`}
              >
                Live NASA Data
              </button>
            </div>
          </div>

          {/* Right: Filter button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFilterModal}
              className="flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#888888] transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-[#111111] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters Row */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F5F5F7] flex-wrap">
            <span className="text-xs text-[#888888]">Applied:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-xs font-semibold px-3 py-1 rounded-full text-[#111111]">
                {filters.category}
                <X size={12} className="cursor-pointer" onClick={() => onRemoveFilter('category')} />
              </span>
            )}
            {filters.screen && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-xs font-semibold px-3 py-1 rounded-full text-[#111111]">
                {filters.screen}
                <X size={12} className="cursor-pointer" onClick={() => onRemoveFilter('screen')} />
              </span>
            )}
            {filters.uiElement && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-xs font-semibold px-3 py-1 rounded-full text-[#111111]">
                {filters.uiElement}
                <X size={12} className="cursor-pointer" onClick={() => onRemoveFilter('uiElement')} />
              </span>
            )}
            {filters.flow && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-xs font-semibold px-3 py-1 rounded-full text-[#111111]">
                {filters.flow}
                <X size={12} className="cursor-pointer" onClick={() => onRemoveFilter('flow')} />
              </span>
            )}
            <button
              onClick={onClearAllFilters}
              className="text-xs text-[#888888] hover:text-[#111111] underline cursor-pointer ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
