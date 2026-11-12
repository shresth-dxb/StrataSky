'use client';

import React from 'react';

export interface FilterState {
  category: string | null;
  screen: string | null;
  uiElement: string | null;
  flow: string | null;
}

interface DirectoryNavProps {
  filters: FilterState;
  onSelectFilter: (type: keyof FilterState, value: string) => void;
  onClearFilter?: (type: keyof FilterState) => void;
}

export const DIRECTORY_DATA = {
  categories: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ras Al Khaimah', 'Ajman'],
  screens: ['Deep Sandy Loam', 'Hyper-Arid Dune', 'Alluvial Gravel', 'Saline Sand'],
  uiElements: ['Historic Falaj', 'Brackish Well', 'Desalinated', 'Fossil Aquifer'],
  flows: [
    'Oasis Shade (Multi-Tier)',
    'Biosaline Rotation',
    'Halophyte Harvest',
  ],
};

export default function DirectoryNav({
  filters,
  onSelectFilter,
}: DirectoryNavProps) {
  return (
    <section className="w-full bg-white pt-8 pb-10 border-b border-[#F1F1F1]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
          {/* Column 1: Emirates */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              Emirates
            </span>
            <div className="flex flex-col space-y-1.5">
              {DIRECTORY_DATA.categories.map((item) => {
                const isActive = filters.category === item;
                return (
                  <button
                    key={item}
                    onClick={() => onSelectFilter('category', item)}
                    className={`text-left text-[22px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Soil Profiles */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              Soil Profiles
            </span>
            <div className="flex flex-col space-y-1.5">
              {DIRECTORY_DATA.screens.map((item) => {
                const isActive = filters.screen === item;
                return (
                  <button
                    key={item}
                    onClick={() => onSelectFilter('screen', item)}
                    className={`text-left text-[22px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Water Source */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              Water Source
            </span>
            <div className="flex flex-col space-y-1.5">
              {DIRECTORY_DATA.uiElements.map((item) => {
                const isActive = filters.uiElement === item;
                return (
                  <button
                    key={item}
                    onClick={() => onSelectFilter('uiElement', item)}
                    className={`text-left text-[22px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 4: Crop Plans */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              Crop Plans
            </span>
            <div className="flex flex-col space-y-1.5">
              {DIRECTORY_DATA.flows.map((item) => {
                const isActive = filters.flow === item;
                return (
                  <button
                    key={item}
                    onClick={() => onSelectFilter('flow', item)}
                    className={`text-left text-[22px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
