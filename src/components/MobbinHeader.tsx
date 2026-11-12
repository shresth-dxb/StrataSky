'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bookmark, Bell, X } from 'lucide-react';

interface MobbinHeaderProps {
  activeTab: 'directory' | 'console';
  setActiveTab: (tab: 'directory' | 'console') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  savedCount?: number;
}

export default function MobbinHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  savedCount = 0,
}: MobbinHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[#EEEEEE] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-18 py-3 flex items-center justify-between gap-4">
        {/* Left: StrataSky Logo with Favicon & Navigation Links */}
        <div className="flex items-center gap-7 shrink-0">
          <div
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <Image
              src="/favicon.png"
              alt="StrataSky"
              width={24}
              height={24}
              className="w-6 h-6 object-contain shrink-0"
              priority
            />
            <span className="font-extrabold text-[19px] tracking-tight text-[#111111]">
              StrataSky
            </span>
          </div>

          {/* Farm Zones & Live Map Links */}
          <nav className="flex items-center gap-6 text-[15px]">
            <button
              onClick={() => setActiveTab('directory')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'directory'
                  ? 'text-[#111111] font-bold'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              Farm Zones
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`transition-colors cursor-pointer ${
                activeTab === 'console'
                  ? 'text-[#111111] font-bold'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              Live Map
            </button>
          </nav>
        </div>

        {/* Center: Wide, light-gray, pill-shaped search bar (#F1F1F1) */}
        <div className="flex-1 max-w-[540px] hidden sm:flex items-center">
          <div className="w-full h-11 bg-[#F1F1F1] rounded-full flex items-center px-4 gap-2.5 transition-all focus-within:ring-2 focus-within:ring-[#111111]/10">
            <Search size={17} className="text-[#888888] shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-[13px] text-[#111111] placeholder:text-[#888888] font-normal"
              placeholder="Search UAE farms, oases, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#888888] hover:text-[#111111] cursor-pointer p-1"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: 3 crisp, minimalistic black outline icons */}
        <div className="flex items-center gap-5 shrink-0">
          <button
            className="text-[#111111] hover:opacity-70 transition-opacity cursor-pointer relative"
            aria-label="Bookmarks"
            title="Saved Farms"
          >
            <Bookmark size={21} className="stroke-[1.8]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          <button
            className="text-[#111111] hover:opacity-70 transition-opacity cursor-pointer relative"
            aria-label="Notifications"
            title="NASA POWER Alerts"
          >
            <Bell size={21} className="stroke-[1.8]" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#34C759] rounded-full" />
          </button>

          <div
            className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold cursor-pointer select-none"
            title="UAE Agricultural Delegate"
          >
            AE
          </div>
        </div>
      </div>
    </header>
  );
}
