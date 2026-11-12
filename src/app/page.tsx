'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  Search,
  Bookmark,
  Bell,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Thermometer,
  Sun,
  Droplets,
  X,
  Compass,
  AlertTriangle,
  Wifi,
  Battery,
} from 'lucide-react';
import { UaeFarmZone, UAE_FARM_PRESETS } from '@/lib/landValidation';
import AppIcon from '@/components/AppIcon';
import SlideCommit from '@/components/SlideCommit';
import ThoughtLine from '@/components/ThoughtLine';
export { AppIcon };

// Dynamic Map for Map Console view
const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F7F7] text-[#888888] font-medium text-xs">
      Loading interactive satellite map...
    </div>
  ),
});

export interface FarmDirectoryParcel {
  id: string;
  name: string;
  emirate: 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Ras Al Khaimah' | 'Ajman';
  subRegion: string;
  lat: number;
  lng: number;
  tempC: number;
  solarVal: number;
  soilProfile: 'Deep Sandy Loam' | 'Hyper-Arid Dune' | 'Alluvial Gravel' | 'Saline Sand';
  waterSource: 'Historic Falaj' | 'Brackish Well' | 'Desalinated' | 'Fossil Aquifer';
  cropPlan: 'Oasis Shade (Multi-Tier)' | 'Biosaline Rotation' | 'Halophyte Harvest';
  waterSaved: string;
  waterSavedNum: number;
  annualWaterM3: string;
  type: 'Farm' | 'Oasis';
  resilienceRating: number;
  seedPalette: { primary: string; secondary: string; accent: string };
}

export const UAE_PARCELS_DIRECTORY: FarmDirectoryParcel[] = [
  {
    id: 'al-ain-oasis',
    name: 'Al Ain Oasis',
    emirate: 'Abu Dhabi',
    subRegion: 'Eastern Falaj Corridor',
    lat: 24.2075,
    lng: 55.7447,
    tempC: 27.2,
    solarVal: 19.4,
    soilProfile: 'Deep Sandy Loam',
    waterSource: 'Historic Falaj',
    cropPlan: 'Oasis Shade (Multi-Tier)',
    waterSaved: '60% Water Saved',
    waterSavedNum: 60,
    annualWaterM3: '8,500 m³/ha',
    type: 'Oasis',
    resilienceRating: 4.96,
    seedPalette: { primary: '#1E8236', secondary: '#E8F5E9', accent: '#34C759' },
  },
  {
    id: 'liwa-crescent',
    name: 'Liwa Crescent',
    emirate: 'Abu Dhabi',
    subRegion: 'Al Dhafra Dune Margin',
    lat: 23.1333,
    lng: 53.7667,
    tempC: 31.4,
    solarVal: 22.8,
    soilProfile: 'Hyper-Arid Dune',
    waterSource: 'Fossil Aquifer',
    cropPlan: 'Biosaline Rotation',
    waterSaved: '82% Water Saved',
    waterSavedNum: 82,
    annualWaterM3: '3,800 m³/ha',
    type: 'Oasis',
    resilienceRating: 4.92,
    seedPalette: { primary: '#D97706', secondary: '#FEF3C7', accent: '#F59E0B' },
  },
  {
    id: 'al-dhaid-plains',
    name: 'Al Dhaid Plains',
    emirate: 'Sharjah',
    subRegion: 'Hajar Mountain Foothills',
    lat: 25.2881,
    lng: 55.8814,
    tempC: 28.6,
    solarVal: 20.1,
    soilProfile: 'Alluvial Gravel',
    waterSource: 'Brackish Well',
    cropPlan: 'Oasis Shade (Multi-Tier)',
    waterSaved: '58% Water Saved',
    waterSavedNum: 58,
    annualWaterM3: '8,900 m³/ha',
    type: 'Farm',
    resilienceRating: 4.88,
    seedPalette: { primary: '#2563EB', secondary: '#EFF6FF', accent: '#3B82F6' },
  },
  {
    id: 'icba-biosaline-hub',
    name: 'ICBA Biosaline Hub',
    emirate: 'Dubai',
    subRegion: 'Academic City South',
    lat: 25.0935,
    lng: 55.3897,
    tempC: 26.8,
    solarVal: 19.8,
    soilProfile: 'Saline Sand',
    waterSource: 'Brackish Well',
    cropPlan: 'Halophyte Harvest',
    waterSaved: '82% Water Saved',
    waterSavedNum: 82,
    annualWaterM3: '3,800 m³/ha',
    type: 'Farm',
    resilienceRating: 4.98,
    seedPalette: { primary: '#059669', secondary: '#ECFDF5', accent: '#10B981' },
  },
  {
    id: 'digdaga-valley',
    name: 'Digdaga Valley',
    emirate: 'Ras Al Khaimah',
    subRegion: 'Wadi Bih Alluvial Basin',
    lat: 25.6833,
    lng: 55.9500,
    tempC: 25.9,
    solarVal: 18.9,
    soilProfile: 'Alluvial Gravel',
    waterSource: 'Desalinated',
    cropPlan: 'Oasis Shade (Multi-Tier)',
    waterSaved: '64% Water Saved',
    waterSavedNum: 64,
    annualWaterM3: '8,200 m³/ha',
    type: 'Farm',
    resilienceRating: 4.91,
    seedPalette: { primary: '#0284C7', secondary: '#F0F9FF', accent: '#0EA5E9' },
  },
  {
    id: 'masmout-desert-farm',
    name: 'Masmout Desert Farm',
    emirate: 'Ajman',
    subRegion: 'Inland Sandy Basin',
    lat: 25.3833,
    lng: 55.5167,
    tempC: 27.8,
    solarVal: 20.4,
    soilProfile: 'Saline Sand',
    waterSource: 'Brackish Well',
    cropPlan: 'Biosaline Rotation',
    waterSaved: '76% Water Saved',
    waterSavedNum: 76,
    annualWaterM3: '4,200 m³/ha',
    type: 'Farm',
    resilienceRating: 4.85,
    seedPalette: { primary: '#7C3AED', secondary: '#F5F3FF', accent: '#8B5CF6' },
  },
  {
    id: 'sweihan-dunes',
    name: 'Sweihan Dune Farm',
    emirate: 'Abu Dhabi',
    subRegion: 'Al Ain Northern Sands',
    lat: 24.4667,
    lng: 55.3333,
    tempC: 30.2,
    solarVal: 22.1,
    soilProfile: 'Hyper-Arid Dune',
    waterSource: 'Fossil Aquifer',
    cropPlan: 'Halophyte Harvest',
    waterSaved: '80% Water Saved',
    waterSavedNum: 80,
    annualWaterM3: '3,900 m³/ha',
    type: 'Farm',
    resilienceRating: 4.89,
    seedPalette: { primary: '#EA580C', secondary: '#FFF7ED', accent: '#F97316' },
  },
  {
    id: 'al-madam-basin',
    name: 'Al Madam Agricultural Basin',
    emirate: 'Sharjah',
    subRegion: 'Central Dune Corridor',
    lat: 24.9583,
    lng: 55.7722,
    tempC: 29.1,
    solarVal: 20.9,
    soilProfile: 'Deep Sandy Loam',
    waterSource: 'Historic Falaj',
    cropPlan: 'Oasis Shade (Multi-Tier)',
    waterSaved: '62% Water Saved',
    waterSavedNum: 62,
    annualWaterM3: '8,400 m³/ha',
    type: 'Farm',
    resilienceRating: 4.93,
    seedPalette: { primary: '#15803D', secondary: '#F0FDF4', accent: '#22C55E' },
  },
  {
    id: 'khatt-mineral-springs',
    name: 'Khatt Thermal Springs',
    emirate: 'Ras Al Khaimah',
    subRegion: 'Hajar Mountain Aquifer',
    lat: 25.6028,
    lng: 56.0083,
    tempC: 26.4,
    solarVal: 19.2,
    soilProfile: 'Deep Sandy Loam',
    waterSource: 'Historic Falaj',
    cropPlan: 'Oasis Shade (Multi-Tier)',
    waterSaved: '68% Water Saved',
    waterSavedNum: 68,
    annualWaterM3: '7,900 m³/ha',
    type: 'Oasis',
    resilienceRating: 4.95,
    seedPalette: { primary: '#0D9488', secondary: '#F0FDFA', accent: '#14B8A6' },
  },
];

export default function StrataSkyMobbinApp() {
  // Navigation View: 'landing' | 'directory' | 'console' | 'dashboard'
  const [view, setView] = useState<'landing' | 'directory' | 'console' | 'dashboard'>('landing');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // 4-Column Directory Filter States
  const [selectedEmirate, setSelectedEmirate] = useState<string | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<string | null>(null);
  const [selectedWater, setSelectedWater] = useState<string | null>(null);
  const [selectedCropPlan, setSelectedCropPlan] = useState<string | null>(null);

  // Filter Bar Sub-Navigation States
  const [typeToggle, setTypeToggle] = useState<'All' | 'Farms' | 'Oases'>('Farms');
  const [activeSort, setActiveSort] = useState<
    'savings' | 'resilient' | 'salt' | 'live'
  >('savings');

  // Bookmark Saved State
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(['al-ain-oasis', 'icba-biosaline-hub'])
  );

  // Map Console Active Parcel
  const [selectedZone, setSelectedZone] = useState<UaeFarmZone>(UAE_FARM_PRESETS[0]);
  const [activePlan, setActivePlan] = useState<'oasis' | 'salt'>('oasis');
  const [nasaTemp, setNasaTemp] = useState<number>(27.2);
  const [nasaSolar, setNasaSolar] = useState<number>(19.4);
  const [loadingNasa, setLoadingNasa] = useState<boolean>(false);
  const [analyzingHold, setAnalyzingHold] = useState<boolean>(false);

  // Parcel Analysis State
  const isAnalyzing =
    selectedZone.name.includes('Analyzing') || loadingNasa || analyzingHold;

  // Analysis Steps progression
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([
    'Resolving GPS coordinates & emirate boundary',
  ]);

  useEffect(() => {
    if (selectedZone.name.includes('Analyzing') || loadingNasa) {
      setAnalyzingHold(true);
      const timer = setTimeout(() => {
        setAnalyzingHold(false);
      }, 1900);
      return () => clearTimeout(timer);
    }
  }, [selectedZone.name, loadingNasa]);

  useEffect(() => {
    if (isAnalyzing) {
      setAnalysisSteps(['Resolving GPS coordinates & emirate boundary']);
      const t1 = setTimeout(() => {
        setAnalysisSteps((prev) => [
          ...prev,
          'Sampling Sentinel-2 multispectral surface bands',
        ]);
      }, 400);
      const t2 = setTimeout(() => {
        setAnalysisSteps((prev) => [
          ...prev,
          'Querying NASA POWER daily solar & 2m thermal grid',
        ]);
      }, 850);
      const t3 = setTimeout(() => {
        setAnalysisSteps((prev) => [
          ...prev,
          'Analyzing soil salinity & historical falaj aquifers',
        ]);
      }, 1300);
      const t4 = setTimeout(() => {
        setAnalysisSteps((prev) => [
          ...prev,
          'Computing 3-year oasis & halophyte yield projections',
        ]);
      }, 1750);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isAnalyzing]);

  // Toggle Bookmark
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Switch to Map Console with Parcel
  const handleOpenConsole = (parcel?: FarmDirectoryParcel) => {
    if (parcel) {
      setSelectedZone({
        name: parcel.name,
        emirate: `${parcel.emirate} • ${parcel.subRegion}`,
        lat: parcel.lat,
        lng: parcel.lng,
        soilSummary: parcel.soilProfile,
        aquiferNote: parcel.waterSource,
        isFarmable: true,
        zoom: 12,
      });
      setActivePlan(parcel.cropPlan.includes('Oasis') ? 'oasis' : 'salt');
    }
    setView('console');
  };

  // Execute CSV Blob creation and download logic
  const executeDownloadCSV = () => {
    if (selectedZone.isFarmable === false) {
      console.warn('Cannot export CSV: Selected location is urban or non-arable.');
      return;
    }
    try {
      const planName =
        activePlan === 'oasis' ? 'Plan 1: Oasis Canopy' : 'Plan 2: Halophyte Harvest';
      const planWater = activePlan === 'oasis' ? '8,500 m³/ha' : '3,800 m³/ha';
      const planSavings = activePlan === 'oasis' ? '60%' : '82%';
      const year1 =
        activePlan === 'oasis'
          ? 'Date Palms - Build shade tier'
          : 'Desert Quinoa - Grows in brackish well';
      const year2 =
        activePlan === 'oasis'
          ? 'Citrus & Figs - Plant understory'
          : 'Salicornia Crop - Extracts topsoil salt';
      const year3 =
        activePlan === 'oasis'
          ? 'Closed Canopy - Cuts water by 60%'
          : 'Soil Restored - Ready for vegetables';

      const rows = [
        ['Field', 'Value'],
        ['Timestamp', new Date().toISOString()],
        ['Parcel Name', selectedZone.name || 'Custom UAE Parcel'],
        ['Emirate / Sub-Region', selectedZone.emirate || 'United Arab Emirates'],
        ['Latitude', selectedZone.lat?.toFixed(4) || '24.2075'],
        ['Longitude', selectedZone.lng?.toFixed(4) || '55.7447'],
        ['Arable Farmland Status', 'Arable Farmland'],
        ['Soil Profile Summary', selectedZone.soilSummary || 'Deep Sandy Loam'],
        ['Aquifer & Water Source', selectedZone.aquiferNote || 'Historic Falaj'],
        ['NASA Air Temperature (2m)', `${nasaTemp} °C`],
        ['NASA Solar Irradiance (All-Sky)', `${nasaSolar} MJ`],
        ['Recommended Crop Plan', planName],
        ['Target Annual Water Usage', planWater],
        ['Estimated Water Saved', planSavings],
        ['Baseline Benchmark (Rhodes Grass)', '22,000 m³/ha'],
        ['Crop Rotation Year 01', year1],
        ['Crop Rotation Year 02', year2],
        ['Crop Rotation Year 03', year3],
      ];

      const escapeCell = (val: string) => `"${(val ?? '').toString().replace(/"/g, '""')}"`;
      const csvString = rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stratasky-export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Export Error:', err);
    }
  };

  // Live NASA API fetching when in Console view
  useEffect(() => {
    if ((view !== 'console' && view !== 'dashboard') || selectedZone.isFarmable === false) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    async function fetchNasa() {
      setLoadingNasa(true);
      try {
        const safeLat = encodeURIComponent(selectedZone.lat);
        const safeLng = encodeURIComponent(selectedZone.lng);
        const res = await fetch(
          `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${safeLng}&latitude=${safeLat}&start=20240401&end=20240407&format=JSON`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`NASA API ${res.status}`);
        const data = await res.json();
        const tObj = data?.properties?.parameter?.T2M || {};
        const sObj = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN || {};
        const tArr = Object.values(tObj).filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v) && v > -40
        );
        const sArr = Object.values(sObj).filter(
          (v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
        );
        if (tArr.length > 0) {
          setNasaTemp(Number((tArr.reduce((a, b) => a + b, 0) / tArr.length).toFixed(1)));
        }
        if (sArr.length > 0) {
          setNasaSolar(Number((sArr.reduce((a, b) => a + b, 0) / sArr.length).toFixed(1)));
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setNasaTemp(28.4);
        setNasaSolar(20.2);
      } finally {
        clearTimeout(timeoutId);
        setLoadingNasa(false);
      }
    }

    fetchNasa();
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [view, selectedZone]);

  // Filtered & Sorted Feed
  const filteredParcels = useMemo(() => {
    return UAE_PARCELS_DIRECTORY.filter((parcel) => {
      // Search text match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          parcel.name.toLowerCase().includes(q) ||
          parcel.emirate.toLowerCase().includes(q) ||
          parcel.subRegion.toLowerCase().includes(q) ||
          parcel.soilProfile.toLowerCase().includes(q) ||
          parcel.waterSource.toLowerCase().includes(q) ||
          parcel.cropPlan.toLowerCase().includes(q) ||
          `${parcel.lat}, ${parcel.lng}`.includes(q);
        if (!matches) return false;
      }

      // Column 1: Emirate
      if (selectedEmirate && parcel.emirate !== selectedEmirate) {
        return false;
      }

      // Column 2: Soil Profile
      if (selectedSoil && parcel.soilProfile !== selectedSoil) {
        return false;
      }

      // Column 3: Water Source
      if (selectedWater && parcel.waterSource !== selectedWater) {
        return false;
      }

      // Column 4: Crop Plan
      if (selectedCropPlan && parcel.cropPlan !== selectedCropPlan) {
        return false;
      }

      // Sub-Nav Pill Toggle: Farms vs Oases
      if (typeToggle === 'Farms' && parcel.type !== 'Farm') return false;
      if (typeToggle === 'Oases' && parcel.type !== 'Oasis') return false;

      // Text Filters
      if (activeSort === 'salt') {
        const isSalt =
          parcel.soilProfile === 'Saline Sand' ||
          parcel.cropPlan.includes('Biosaline') ||
          parcel.cropPlan.includes('Halophyte');
        if (!isSalt) return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeSort === 'savings') return b.waterSavedNum - a.waterSavedNum;
      if (activeSort === 'resilient') return b.resilienceRating - a.resilienceRating;
      if (activeSort === 'live') return b.solarVal - a.solarVal;
      return 0;
    });
  }, [
    searchQuery,
    selectedEmirate,
    selectedSoil,
    selectedWater,
    selectedCropPlan,
    typeToggle,
    activeSort,
  ]);

  const activeFiltersCount =
    (selectedEmirate ? 1 : 0) +
    (selectedSoil ? 1 : 0) +
    (selectedWater ? 1 : 0) +
    (selectedCropPlan ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setSelectedEmirate(null);
    setSelectedSoil(null);
    setSelectedWater(null);
    setSelectedCropPlan(null);
    setSearchQuery('');
  };

  /* =========================================================================
     0. THE SF PRO INLINE-PILL LANDING PAGE
     ========================================================================= */
  const renderLandingPage = () => (
    <div className="w-full min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Sleek Minimalist Top Navigation */}
      <header className="w-full bg-transparent sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setView('landing')}
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

          <nav className="flex items-center gap-6 text-[15px]">
            <button
              onClick={() => setView('directory')}
              className="text-[#888888] hover:text-[#111111] font-medium transition-colors cursor-pointer"
            >
              Farm Zones
            </button>
            <button
              onClick={() => handleOpenConsole()}
              className="text-[#888888] hover:text-[#111111] font-medium transition-colors cursor-pointer"
            >
              Live Map
            </button>
            <button
              onClick={() => setView('directory')}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full hover:bg-black transition-colors cursor-pointer"
            >
              Start Planning
            </button>
          </nav>
        </div>
      </header>

      {/* Main Massive Hero Viewport (Centered in height: 100vh with pure white) */}
      <section
        style={{
          minHeight: 'calc(100vh - 80px)',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
        }}
        className="flex-1"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
          {/* 1. TYPOGRAPHY: SF PRO & 2. THE MASSIVE HERO HEADLINE */}
          <h1
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '-0.04em',
              fontWeight: 800,
              color: '#111111',
              fontSize: 'clamp(44px, 6.8vw, 92px)',
              lineHeight: 1.1,
              margin: 0,
              userSelect: 'none',
              maxWidth: '1040px',
              textAlign: 'center',
            }}
          >
            Where NASA <AppIcon type="satellite" /> data
            <br />
            meets desert <AppIcon type="water" /> soil
            <br />
            to grow <AppIcon type="farming" /> smarter.
          </h1>

          {/* 3. THE CONSUMER AESTHETIC — Clean Soft-Gray Subheadline */}
          <p
            style={{
              color: '#666666',
              fontSize: '20px',
              textAlign: 'center',
              lineHeight: 1.4,
              marginTop: '28px',
              marginBottom: '36px',
              maxWidth: '680px',
            }}
          >
            The agricultural decision library for the UAE.
            <br />
            Over 60% water saved across all 7 Emirates.
          </p>

          {/* Action Buttons: Start Planning & How it Works */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => setView('directory')}
              style={{
                height: '56px',
                padding: '0 38px',
                borderRadius: '9999px',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="hover:scale-105 active:scale-95 hover:bg-black hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            >
              <span>Start Planning</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => handleOpenConsole()}
              style={{
                height: '56px',
                padding: '0 34px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: '#111111',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                border: '1px solid #111111',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="hover:bg-[#F5F5F7] active:scale-95"
            >
              <span>How it Works</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  /* =========================================================================
     1. THE TOP HEADER
     ========================================================================= */
  const renderHeader = () => (
    <header className="w-full bg-white border-b border-[#EEEEEE] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-18 py-3 flex items-center justify-between gap-4">
        {/* Left: StrataSky Logo with Favicon & Navigation Links */}
        <div className="flex items-center gap-7 shrink-0">
          <div
            onClick={() => setView('landing')}
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

          {/* Reference Links: Farm Zones & Live Map */}
          <nav className="flex items-center gap-6 text-[15px]">
            <button
              onClick={() => setView('directory')}
              className={`transition-colors cursor-pointer ${
                view === 'directory'
                  ? 'text-[#111111] font-bold'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              Farm Zones
            </button>
            <button
              onClick={() => handleOpenConsole()}
              className={`transition-colors cursor-pointer ${
                view === 'console' || view === 'dashboard'
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
            onClick={() => {
              if (bookmarkedIds.size > 0) {
                // If clicked, filter to bookmarked parcels
                const firstId = Array.from(bookmarkedIds)[0];
                const p = UAE_PARCELS_DIRECTORY.find((x) => x.id === firstId);
                if (p) setSearchQuery(p.name);
              }
            }}
            className="text-[#111111] hover:opacity-70 transition-opacity cursor-pointer relative"
            aria-label="Bookmarks"
            title="Saved Farms"
          >
            <Bookmark size={21} className="stroke-[1.8]" />
            {bookmarkedIds.size > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {bookmarkedIds.size}
              </span>
            )}
          </button>

          <button
            onClick={() => alert('NASA satellite feeds synchronized in real-time across all 7 Emirates.')}
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

  /* =========================================================================
     2. THE 4-COLUMN TEXT DIRECTORY (CRITICAL MAPPING)
     ========================================================================= */
  const render4ColumnDirectory = () => (
    <section className="w-full bg-white pt-8 pb-10 border-b border-[#F1F1F1]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
          {/* Column 1: Emirates */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              Emirates
            </span>
            <div className="flex flex-col space-y-1.5">
              {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ras Al Khaimah', 'Ajman'].map((item) => {
                const isActive = selectedEmirate === item;
                return (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedEmirate(isActive ? null : item)
                    }
                    className={`text-left text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
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
              {[
                'Deep Sandy Loam',
                'Hyper-Arid Dune',
                'Alluvial Gravel',
                'Saline Sand',
              ].map((item) => {
                const isActive = selectedSoil === item;
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedSoil(isActive ? null : item)}
                    className={`text-left text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
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
              {[
                'Historic Falaj',
                'Brackish Well',
                'Desalinated',
                'Fossil Aquifer',
              ].map((item) => {
                const isActive = selectedWater === item;
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedWater(isActive ? null : item)}
                    className={`text-left text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
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
              {[
                'Oasis Shade (Multi-Tier)',
                'Biosaline Rotation',
                'Halophyte Harvest',
              ].map((item) => {
                const isActive = selectedCropPlan === item;
                return (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedCropPlan(isActive ? null : item)
                    }
                    className={`text-left text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
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

        {/* Active Filters Pill Bar (if any selected) */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-6 flex-wrap pt-4 border-t border-[#F5F5F7]">
            <span className="text-xs text-[#888888] font-medium mr-1">Active filters:</span>
            {selectedEmirate && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{selectedEmirate}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedEmirate(null)} />
              </span>
            )}
            {selectedSoil && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{selectedSoil}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedSoil(null)} />
              </span>
            )}
            {selectedWater && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{selectedWater}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedWater(null)} />
              </span>
            )}
            {selectedCropPlan && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{selectedCropPlan}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedCropPlan(null)} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>&quot;{searchQuery}&quot;</span>
                <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-[#888888] hover:text-[#111111] underline cursor-pointer ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>
    </section>
  );

  /* =========================================================================
     3. THE FILTER BAR
     ========================================================================= */
  const renderFilterBar = () => (
    <div className="w-full bg-white pt-6 pb-6">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Pill Toggle & Text Filter Tabs */}
        <div className="flex items-center gap-6 md:gap-8 flex-wrap">
          {/* Pill Toggle: "Farms" (Active, white bg) and "Oases" (Inactive, gray) */}
          <div className="inline-flex bg-[#F1F1F1] p-1 rounded-full text-xs font-semibold select-none">
            <button
              onClick={() => setTypeToggle('Farms')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                typeToggle === 'Farms'
                  ? 'bg-white text-[#111111] shadow-xs font-bold'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              Farms
            </button>
            <button
              onClick={() => setTypeToggle('Oases')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                typeToggle === 'Oases'
                  ? 'bg-white text-[#111111] shadow-xs font-bold'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              Oases
            </button>
          </div>

          {/* Text Filters: "Highest Water Savings", "Most Resilient", "Salt-Tolerant", "Live NASA Data" */}
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

        {/* Right: Filter Button (mimicking reference) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeFiltersCount > 0) resetFilters();
              else setSelectedEmirate('Abu Dhabi');
            }}
            className="flex items-center gap-2 text-[14px] font-semibold text-[#111111] hover:text-[#888888] transition-colors cursor-pointer select-none"
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
    </div>
  );

  /* =========================================================================
     4. THE MASONRY / CARD FEED
     ========================================================================= */
  const renderCardFeed = () => (
    <section className="w-full bg-white pb-24">
      <div className="max-w-[1440px] mx-auto px-6">
        {filteredParcels.length === 0 ? (
          <div className="w-full py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#888888] mb-4">
              <Compass size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">No UAE parcels match your current filter</h3>
            <p className="text-sm text-[#888888] mt-1 max-w-md">
              Try resetting your soil, water source, or search keyword to view other verified agricultural zones.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-5 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParcels.map((parcel) => {
              const isSaved = bookmarkedIds.has(parcel.id);

              return (
                <div
                  key={parcel.id}
                  onClick={() => handleOpenConsole(parcel)}
                  className="bg-[#F7F7F7] rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer group select-none min-h-[580px]"
                >
                  {/* Top of Card: Location name & NASA temperature reading */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-[21px] font-bold text-[#111111] tracking-tight group-hover:text-[#34C759] transition-colors leading-snug">
                          {parcel.name}
                        </h3>
                        <span className="text-[12px] text-[#888888] font-medium mt-0.5">
                          {parcel.emirate} • {parcel.subRegion}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* NASA Temperature Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-white px-3 py-1.5 rounded-full shadow-xs">
                          <Thermometer size={14} className="text-[#34C759]" />
                          <span>{parcel.tempC}°C</span>
                        </div>

                        {/* Save Bookmark */}
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(parcel.id, e)}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111111] hover:bg-[#ECECEC] transition-colors shadow-xs"
                          title="Bookmark parcel"
                        >
                          <Bookmark
                            size={15}
                            className={isSaved ? 'fill-[#111111]' : ''}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle of Card: Static Stylized Mini-Map Device Preview */}
                  <div className="flex-1 my-5 bg-white rounded-[24px] overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-xs relative flex flex-col justify-between p-4">
                    {/* Device Status Bar */}
                    <div className="flex items-center justify-between text-[11px] text-[#888888] font-medium pb-2 border-b border-[rgba(0,0,0,0.04)]">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <Wifi size={12} />
                        <Battery size={13} />
                      </div>
                    </div>

                    {/* Vector Cartography Stylized Preview */}
                    <div className="flex-1 my-3 relative overflow-hidden rounded-[16px] bg-[#F2F3F5] flex flex-col justify-between p-3.5">
                      {/* Stylized Topographic Background Pattern */}
                      <svg
                        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id={`grid-${parcel.id}`}
                            width="24"
                            height="24"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 24 0 L 0 0 0 24"
                              fill="none"
                              stroke="#D4D6DC"
                              strokeWidth="0.8"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#grid-${parcel.id})`} />
                        {/* Organic contour ring */}
                        <circle cx="50%" cy="50%" r="55" fill="none" stroke="#CBD0D9" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="50%" cy="50%" r="90" fill="none" stroke="#D8DCE3" strokeWidth="1" />
                        {/* Irrigation canal vector */}
                        <path d="M 20 220 Q 90 120 180 140 T 320 80" fill="none" stroke={parcel.seedPalette.primary} strokeWidth="2.5" opacity="0.6" />
                      </svg>

                      {/* Top Overlay Badge: GPS & Satellite Source */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#111111] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs">
                          {parcel.lat.toFixed(4)}°N, {parcel.lng.toFixed(4)}°E
                        </span>
                        <span className="text-[10px] font-semibold text-[#1E8236] bg-[#E8F5E9] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                          NASA Stream
                        </span>
                      </div>

                      {/* Center Pinpoint Beacon */}
                      <div className="relative z-10 flex flex-col items-center justify-center my-4">
                        <div className="relative flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full animate-ping opacity-25"
                            style={{ backgroundColor: parcel.seedPalette.accent }}
                          />
                          <div
                            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                            style={{ backgroundColor: parcel.seedPalette.primary }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>
                        <div className="mt-2 text-center bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg shadow-xs border border-gray-100">
                          <div className="text-[11px] font-bold text-[#111111] leading-tight">
                            {parcel.name}
                          </div>
                          <div className="text-[9px] text-[#888888] font-medium">
                            {parcel.soilProfile}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Mini Telemetry Info */}
                      <div className="relative z-10 flex items-center justify-between text-[10px] text-[#666666] bg-white/85 backdrop-blur-xs p-2 rounded-xl">
                        <div className="flex items-center gap-1">
                          <Sun size={12} className="text-[#FF9500]" />
                          <span>{parcel.solarVal} MJ/day</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets size={12} className="text-[#34C759]" />
                          <span>{parcel.annualWaterM3}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Prompt inside Frame */}
                    <div className="pt-2 text-center text-[11px] font-semibold text-[#111111] flex items-center justify-center gap-1 group-hover:text-[#34C759] transition-colors">
                      <span>Open in Live Map</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>

                  {/* Bottom of Card: Clean data row showing "60% Water Saved" and "Plan: Oasis Shade" */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(0,0,0,0.04)]">
                    {/* Water Saved Pill */}
                    <div className="inline-flex items-center gap-1.5 bg-[rgba(52,199,89,0.12)] text-[#1E8236] text-[12px] font-bold px-3 py-1.5 rounded-full">
                      <Droplets size={13} className="text-[#34C759]" />
                      <span>{parcel.waterSaved}</span>
                    </div>

                    {/* Crop Plan Pill */}
                    <div className="inline-flex items-center text-[12px] font-semibold text-[#111111] bg-white border border-[rgba(0,0,0,0.08)] px-3 py-1.5 rounded-full shadow-xs">
                      <span>Plan: {parcel.cropPlan.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  /* =========================================================================
     5. THE MAP CONSOLE VIEW
     ========================================================================= */
  const renderMapConsole = () => {
    const isFarmable = selectedZone.isFarmable !== false;

    return (
      <div className="w-full flex-1 flex flex-col bg-white overflow-hidden min-h-[calc(100vh-72px)]">
        {/* Sub-Header Toolbar */}
        <div className="h-14 px-6 border-b border-[#EEEEEE] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('directory')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-[#F1F1F1] hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Farm Zones</span>
            </button>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#888888] font-semibold uppercase tracking-wider">
                Active UAE Parcel:
              </span>
              <span className="text-xs font-bold text-[#111111]">
                {selectedZone.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mr-1 hidden md:inline">
              Preset Quick Jumps:
            </span>
            {UAE_FARM_PRESETS.map((p) => {
              const active = selectedZone.name === p.name && isFarmable;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedZone({ ...p, isFarmable: true })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-[#F1F1F1] text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split Console Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 overflow-hidden">
          {/* Left Column: Interactive Leaflet Map with Floating Search Bar */}
          <div className="lg:col-span-7 h-full min-h-[460px] rounded-[32px] overflow-hidden border border-[#EEEEEE] shadow-xs relative bg-[#F7F7F7]">
            {isAnalyzing && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/8 flex items-center gap-2.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#0A84FF] animate-ping" />
                <span className="text-xs font-semibold text-[#111111]">
                  Analyzing GPS Parcel ({selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E)...
                </span>
              </div>
            )}
            <DynamicMap onSelect={setSelectedZone} selected={selectedZone} />
          </div>

          {/* Right Column: Structured Telemetry & Crop Rotations Scroll */}
          <div className="lg:col-span-5 h-full overflow-y-auto space-y-4 pr-1 console-scroll">
            {/* ThoughtLine GPS Parcel Analysis Component */}
            <div className="bg-[#F7F7F7] rounded-[24px] p-5 border border-[#EEEEEE] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-[#888888] uppercase">
                  Satellite Intelligence
                </span>
                <span className="text-xs font-mono text-[#888888] bg-white px-2.5 py-1 rounded-full shadow-2xs">
                  {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[rgba(0,0,0,0.04)] shadow-xs">
                <ThoughtLine
                  working={isAnalyzing}
                  steps={analysisSteps}
                  label="Analyzing GPS parcel & satellite data…"
                  doneLabel="Analyzed in"
                  glyph="sparkle"
                  fontSize={14}
                  color="#111111"
                  glyphColor="#34C759"
                  collapsible
                  collapseOnSettle={false}
                  showTimer
                />
              </div>
            </div>

            {/* Selected Location Header Card */}
            <div className="bg-[#F7F7F7] rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isFarmable ? (
                    <span className="inline-flex items-center gap-1 bg-[rgba(52,199,89,0.12)] text-[#1E8236] text-xs font-semibold px-3 py-1 rounded-full">
                      <MapPin size={12} />
                      <span>ARABLE FARMLAND</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[rgba(255,59,48,0.1)] text-[#FF3B30] text-xs font-semibold px-3 py-1 rounded-full">
                      <AlertTriangle size={12} />
                      <span>URBAN / NON-ARABLE</span>
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-[#888888] bg-white px-3 py-1 rounded-full shadow-2xs">
                  {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#111111] leading-tight">
                {selectedZone.name} {selectedZone.emirate ? `— ${selectedZone.emirate}` : ''}
              </h2>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                  <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
                    Soil Profile
                  </span>
                  <span className="text-xs text-[#111111] font-semibold leading-snug">
                    {selectedZone.soilSummary}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                  <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
                    Aquifer &amp; Water
                  </span>
                  <span className="text-xs text-[#111111] font-semibold leading-snug">
                    {selectedZone.aquiferNote}
                  </span>
                </div>
              </div>
            </div>

            {/* Unsuitable Warning OR Live Telemetry */}
            {!isFarmable ? (
              <div className="bg-[rgba(255,59,48,0.05)] border border-[rgba(255,59,48,0.2)] rounded-[24px] p-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3B30] bg-white px-3 py-1 rounded-full">
                  <AlertTriangle size={13} />
                  <span>DEVELOPED AREA RESTRICTION</span>
                </div>
                <h3 className="text-base font-bold text-[#111111]">
                  Please choose an open desert parcel or farm, not an urban zone.
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Detected feature: <strong className="text-[#FF3B30]">{selectedZone.detectedType || 'Urban Infrastructure'}</strong>.
                  Agricultural water models and planting calendars require farmable desert loam or sand.
                </p>
                <div className="pt-2 flex gap-2 flex-wrap">
                  {UAE_FARM_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setSelectedZone({ ...p, isFarmable: true })}
                      className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#111111] hover:bg-[#F1F1F1] transition-colors shadow-xs"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* NASA Climate Telemetry Widgets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#888888]">
                      <span>AIR TEMPERATURE</span>
                      <Thermometer size={16} className="text-[#34C759]" />
                    </div>
                    <div className="text-2xl font-bold text-[#111111] my-2">
                      {loadingNasa ? '...' : `${nasaTemp}°C`}
                    </div>
                    <span className="text-[11px] text-[#888888]">
                      NASA Langley POWER API 2m Grid
                    </span>
                  </div>

                  <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#888888]">
                      <span>SOLAR IRRADIANCE</span>
                      <Sun size={16} className="text-[#FF9500]" />
                    </div>
                    <div className="text-2xl font-bold text-[#111111] my-2">
                      {loadingNasa ? '...' : `${nasaSolar} MJ`}
                    </div>
                    <span className="text-[11px] text-[#888888]">
                      Daily All-Sky Downward Flux
                    </span>
                  </div>
                </div>

                {/* Crop Plan Segmented Switcher */}
                <div className="bg-[#F7F7F7] rounded-[24px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      RECOMMENDED 3-YEAR PROTOCOL
                    </span>
                    <div className="inline-flex bg-white p-1 rounded-full text-xs font-semibold shadow-xs">
                      <button
                        onClick={() => setActivePlan('oasis')}
                        className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                          activePlan === 'oasis'
                            ? 'bg-[#111111] text-white'
                            : 'text-[#888888] hover:text-[#111111]'
                        }`}
                      >
                        Oasis Shade
                      </button>
                      <button
                        onClick={() => setActivePlan('salt')}
                        className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                          activePlan === 'salt'
                            ? 'bg-[#111111] text-white'
                            : 'text-[#888888] hover:text-[#111111]'
                        }`}
                      >
                        Salt Harvest
                      </button>
                    </div>
                  </div>

                  {/* Water Savings Comparison Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#111111]">
                        {activePlan === 'oasis' ? 'Plan 1: Oasis Canopy' : 'Plan 2: Halophyte Harvest'}
                      </span>
                      <span className="text-[#1E8236]">
                        {activePlan === 'oasis' ? '8,500 m³/ha (Saves 60%)' : '3,800 m³/ha (Saves 82%)'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EEEEEE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#34C759] rounded-full transition-all duration-500"
                        style={{ width: activePlan === 'oasis' ? '38%' : '18%' }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#888888]">
                      <span>Standard Rhodes Grass: 22,000 m³/ha (High Depletion)</span>
                    </div>
                  </div>

                  {/* 3-Year Steps Timeline */}
                  {activePlan === 'oasis' ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#666666] leading-relaxed">
                        Date palms create an upper microclimate canopy blocking intense solar heat. Beneath the palms, citrus trees and nitrogen-fixing legumes flourish without synthetic chemical fertilizers.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 01</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Date Palms</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Build shade tier</div>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 02</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Citrus &amp; Figs</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Plant understory</div>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 03</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Closed Canopy</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Cuts water by 60%</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-[#666666] leading-relaxed">
                        When agricultural well water turns brackish, standard vegetables fail. This rotation uses Quinoa and Salicornia to draw mineral salts out of the topsoil, steadily rehabilitating the parcel.
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 01</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Desert Quinoa</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Grows in brackish well</div>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 02</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Salicornia Crop</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Extracts topsoil salt</div>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                          <div className="text-[10px] text-[#1E8236] font-bold">YEAR 03</div>
                          <div className="text-xs font-bold text-[#111111] mt-0.5">Soil Restored</div>
                          <div className="text-[10px] text-[#888888] mt-0.5">Ready for vegetables</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Slide to Export to CSV Panel */}
            <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3">
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Telemetry Export
                </span>
                <span className="text-[11px] text-[#888888] font-semibold">
                  CSV Dataset
                </span>
              </div>
              <div className="w-full flex justify-center py-1">
                <SlideCommit
                  label={
                    !isFarmable
                      ? "Non-Arable Land (Export Blocked)"
                      : "Slide to export to CSV"
                  }
                  doneLabel="Exported"
                  errorLabel="Export Failed: Non-Arable"
                  onConfirm={() =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        if (!isFarmable) {
                          reject(
                            new Error('Cannot export CSV: Selected land is urban or non-arable.')
                          );
                        } else {
                          resolve(true);
                        }
                      }, 400);
                    })
                  }
                  onDone={() => {
                    setTimeout(() => {
                      executeDownloadCSV();
                    }, 200);
                  }}
                  trackColor="#F1F1F1"
                  handleColor={isFarmable ? "#111111" : "#888888"}
                  successColor="#34C759"
                  dangerColor="#FF3B30"
                  width={300}
                  height={56}
                  radius={28}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================================
     ROOT RENDER
     ========================================================================= */
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-sans antialiased">
      {view === 'landing' ? (
        renderLandingPage()
      ) : (
        <>
          {/* Header for Directory & Console */}
          {renderHeader()}

          {view === 'directory' ? (
            <main className="flex-1 flex flex-col bg-white">
              {/* 2. The 4-Column Text Directory */}
              {render4ColumnDirectory()}

              {/* 3. The Filter Bar */}
              {renderFilterBar()}

              {/* 4. The Masonry / Card Feed */}
              {renderCardFeed()}
            </main>
          ) : (
            /* 5. Map Console View */
            renderMapConsole()
          )}
        </>
      )}
    </div>
  );
}
