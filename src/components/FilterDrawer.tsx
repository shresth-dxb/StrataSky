'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FilterState, DIRECTORY_DATA } from './DirectoryNav';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onSelectFilter: (type: keyof FilterState, value: string) => void;
  onClearFilter: (type: keyof FilterState) => void;
  onClearAll: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onSelectFilter,
  onClearFilter,
  onClearAll,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-black">Filters</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6 pt-6">
            {/* Categories */}
            <div>
              <span className="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block mb-3">
                CATEGORIES
              </span>
              <div className="flex flex-wrap gap-2">
                {DIRECTORY_DATA.categories.map((cat) => {
                  const isSelected = filters.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        if (isSelected) onClearFilter('category');
                        else onSelectFilter('category', cat);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screens */}
            <div>
              <span className="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block mb-3">
                SCREENS
              </span>
              <div className="flex flex-wrap gap-2">
                {DIRECTORY_DATA.screens.map((sc) => {
                  const isSelected = filters.screen === sc;
                  return (
                    <button
                      key={sc}
                      onClick={() => {
                        if (isSelected) onClearFilter('screen');
                        else onSelectFilter('screen', sc);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UI Elements */}
            <div>
              <span className="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block mb-3">
                UI ELEMENTS
              </span>
              <div className="flex flex-wrap gap-2">
                {DIRECTORY_DATA.uiElements.map((el) => {
                  const isSelected = filters.uiElement === el;
                  return (
                    <button
                      key={el}
                      onClick={() => {
                        if (isSelected) onClearFilter('uiElement');
                        else onSelectFilter('uiElement', el);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {el}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flows */}
            <div>
              <span className="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block mb-3">
                FLOWS
              </span>
              <div className="flex flex-wrap gap-2">
                {DIRECTORY_DATA.flows.map((fl) => {
                  const isSelected = filters.flow === fl;
                  return (
                    <button
                      key={fl}
                      onClick={() => {
                        if (isSelected) onClearFilter('flow');
                        else onSelectFilter('flow', fl);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {fl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-gray-500 hover:text-black underline"
          >
            Clear all filters
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
