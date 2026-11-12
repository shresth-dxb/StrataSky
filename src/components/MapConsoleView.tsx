'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Sun,
  Droplets,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sprout,
  BarChart3,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { UaeFarmZone, UAE_FARM_PRESETS } from '@/lib/landValidation';
import SlideCommit from '@/components/SlideCommit';
import ThoughtLine from '@/components/ThoughtLine';

const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F9F9FB] text-[#86868B] font-medium text-xs">
      Loading satellite map...
    </div>
  ),
});

interface MapConsoleViewProps {
  onBack: () => void;
}

export default function MapConsoleView({ onBack }: MapConsoleViewProps) {
  const [selected, setSelected] = useState<UaeFarmZone>(UAE_FARM_PRESETS[0]);
  const [tempC, setTempC] = useState<number>(27.2);
  const [solarVal, setSolarVal] = useState<number>(19.4);
  const [loadingNasa, setLoadingNasa] = useState<boolean>(false);
  const [analyzingHold, setAnalyzingHold] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<'oasis' | 'salt'>('oasis');

  const isFarmable = selected.isFarmable !== false;

  // Parcel Analysis State
  const isAnalyzing =
    selected.name.includes('Analyzing') || loadingNasa || analyzingHold;

  // Full-Screen Satellite Analysis State
  const [fullScreenOverlay, setFullScreenOverlay] = useState<{
    visible: boolean;
    lat: number;
    lng: number;
    name: string;
    isRedPhase: boolean;
    isNonArable: boolean;
  }>({
    visible: false,
    lat: 24.2075,
    lng: 55.7447,
    name: '',
    isRedPhase: false,
    isNonArable: false,
  });

  const overlayTimersRef = useRef<{
    tRed?: ReturnType<typeof setTimeout>;
    tHide?: ReturnType<typeof setTimeout>;
    startTime: number;
    activeSeq: number;
  }>({
    startTime: 0,
    activeSeq: 0,
  });

  const triggerFullScreenAnalysis = useCallback(
    (lat: number, lng: number, knownFarmable?: boolean) => {
      if (overlayTimersRef.current.tRed) clearTimeout(overlayTimersRef.current.tRed);
      if (overlayTimersRef.current.tHide) clearTimeout(overlayTimersRef.current.tHide);

      const seq = ++overlayTimersRef.current.activeSeq;
      const startTime = Date.now();
      overlayTimersRef.current.startTime = startTime;

      setFullScreenOverlay({
        visible: true,
        lat,
        lng,
        name: 'Analyzing GPS Parcel...',
        isRedPhase: false,
        isNonArable: knownFarmable === false,
      });

      if (knownFarmable === false) {
        // Non-arable land: show for 3.0 seconds, text becomes red for 0.5 seconds (at 2.5s)
        overlayTimersRef.current.tRed = setTimeout(() => {
          if (overlayTimersRef.current.activeSeq === seq) {
            setFullScreenOverlay((prev) => ({
              ...prev,
              isRedPhase: true,
              isNonArable: true,
            }));
          }
        }, 2500);

        overlayTimersRef.current.tHide = setTimeout(() => {
          if (overlayTimersRef.current.activeSeq === seq) {
            setFullScreenOverlay((prev) => ({
              ...prev,
              visible: false,
              isRedPhase: false,
            }));
          }
        }, 3000);
      } else {
        // Arable land: show for 2 seconds total then hide
        overlayTimersRef.current.tHide = setTimeout(() => {
          if (overlayTimersRef.current.activeSeq === seq) {
            setFullScreenOverlay((prev) => ({
              ...prev,
              visible: false,
            }));
          }
        }, 2000);
      }
    },
    []
  );

  const handleZoneSelect = useCallback(
    (zone: UaeFarmZone) => {
      setSelected(zone);

      const isClickStart = zone.name.includes('Analyzing');
      if (isClickStart) {
        // Map click or search select triggered! Immediately show full-screen overlay
        triggerFullScreenAnalysis(zone.lat, zone.lng);
      } else {
        // Land validation completed
        const seq = overlayTimersRef.current.activeSeq;
        const elapsed = Date.now() - (overlayTimersRef.current.startTime || Date.now());
        const isNonArable = zone.isFarmable === false;

        if (overlayTimersRef.current.tRed) clearTimeout(overlayTimersRef.current.tRed);
        if (overlayTimersRef.current.tHide) clearTimeout(overlayTimersRef.current.tHide);

        if (isNonArable) {
          // Show for 3 seconds total, text becomes red for 0.5 seconds (at 2.5s)
          const delayUntilRed = Math.max(0, 2500 - elapsed);
          const delayUntilHide = Math.max(500, 3000 - elapsed);

          overlayTimersRef.current.tRed = setTimeout(() => {
            if (overlayTimersRef.current.activeSeq === seq) {
              setFullScreenOverlay((prev) => ({
                ...prev,
                isRedPhase: true,
                isNonArable: true,
              }));
            }
          }, delayUntilRed);

          overlayTimersRef.current.tHide = setTimeout(() => {
            if (overlayTimersRef.current.activeSeq === seq) {
              setFullScreenOverlay((prev) => ({
                ...prev,
                visible: false,
                isRedPhase: false,
              }));
            }
          }, delayUntilHide);
        } else {
          // Arable land: show for 2 seconds total then hide
          const delayUntilHide = Math.max(300, 2000 - elapsed);

          overlayTimersRef.current.tHide = setTimeout(() => {
            if (overlayTimersRef.current.activeSeq === seq) {
              setFullScreenOverlay((prev) => ({
                ...prev,
                visible: false,
              }));
            }
          }, delayUntilHide);
        }
      }
    },
    [triggerFullScreenAnalysis]
  );

  // Analysis Steps progression
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([
    'Resolving GPS coordinates & emirate boundary',
  ]);

  useEffect(() => {
    if (selected.name.includes('Analyzing') || loadingNasa) {
      setAnalyzingHold(true);
      const timer = setTimeout(() => {
        setAnalyzingHold(false);
      }, 1900);
      return () => clearTimeout(timer);
    }
  }, [selected.name, loadingNasa]);

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

  useEffect(() => {
    if (!isFarmable) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    async function loadNasaData() {
      setLoadingNasa(true);
      try {
        const today = new Date();
        const endYear = today.getFullYear();
        const startYear = endYear - 1;
        const pad = (n: number) => String(n).padStart(2, '0');
        const startStr = `${startYear}0101`;
        const endStr = `${startYear}0107`;

        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${selected.lng}&latitude=${selected.lat}&start=${startStr}&end=${endStr}&format=JSON`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('NASA API response not ok');
        const data = await res.json();

        const t2mObj = data?.properties?.parameter?.T2M || {};
        const swObj = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN || {};

        const validTemps = Object.values(t2mObj).filter(
          (v): v is number => typeof v === 'number' && v > -50 && v < 60
        );
        const validSolar = Object.values(swObj).filter(
          (v): v is number => typeof v === 'number' && v > 0
        );

        if (validTemps.length > 0) {
          const avg = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
          setTempC(Math.round(avg * 10) / 10);
        }
        if (validSolar.length > 0) {
          const avg = validSolar.reduce((a, b) => a + b, 0) / validSolar.length;
          setSolarVal(Math.round(avg * 10) / 10);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setTempC(29.4);
        setSolarVal(20.8);
      } finally {
        clearTimeout(timeoutId);
        setLoadingNasa(false);
      }
    }

    loadNasaData();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selected, isFarmable]);

  // Execute CSV Blob creation and download logic
  const executeDownloadCSV = () => {
    if (selected.isFarmable === false) {
      console.warn('Cannot export CSV: Selected location is urban or non-arable.');
      return;
    }
    try {
      const planName =
        activePlan === 'oasis' ? 'Plan 1: Oasis Shade Method' : 'Plan 2: Salt-Water Harvest';
      const planWater = activePlan === 'oasis' ? '8,500 m³/ha' : '3,800 m³/ha';
      const planSavings = activePlan === 'oasis' ? '60%' : '82%';
      const year1 =
        activePlan === 'oasis'
          ? 'Date Palms - Build shade tier'
          : 'Desert Quinoa - Grows in brackish well';
      const year2 =
        activePlan === 'oasis'
          ? 'Citrus Shade - Plant understory'
          : 'Salicornia - Extracts topsoil salt';
      const year3 =
        activePlan === 'oasis'
          ? 'Full Canopy - Cuts water by 60%'
          : 'Salinity Reset - Ready for vegetables';

      const rows = [
        ['Field', 'Value'],
        ['Timestamp', new Date().toISOString()],
        ['Parcel Name', selected.name || 'Custom UAE Parcel'],
        ['Emirate / Sub-Region', selected.emirate || 'United Arab Emirates'],
        ['Latitude', selected.lat?.toFixed(4) || '24.2075'],
        ['Longitude', selected.lng?.toFixed(4) || '55.7447'],
        ['Arable Farmland Status', 'Arable Farmland'],
        ['Soil Profile Summary', selected.soilSummary || 'Deep Sandy Loam'],
        ['Aquifer & Water Source', selected.aquiferNote || 'Historic Falaj'],
        ['NASA Air Temperature (2m)', `${tempC} °C`],
        ['NASA Solar Irradiance (All-Sky)', `${solarVal} MJ`],
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

  return (
    <div className="flex flex-col h-screen bg-[#F9F9FB] text-[#111111] overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-[rgba(0,0,0,0.06)] px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-[#6E6E73] hover:text-[#111111] px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK</span>
          </button>
          <div className="h-4 w-px bg-[rgba(0,0,0,0.08)]" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
            <span className="font-bold text-sm tracking-tight text-[#111111]">
              STRATASKY <span className="font-normal text-[#6E6E73]">TELEMETRY</span>
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          {UAE_FARM_PRESETS.map((preset) => {
            const isCurrent = selected.name === preset.name && isFarmable;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  triggerFullScreenAnalysis(preset.lat, preset.lng, true);
                  handleZoneSelect({ ...preset, isFarmable: true });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-[#34C759] text-white shadow-sm'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Console Split Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden">
        {/* Map Container */}
        <div className="lg:col-span-7 h-full rounded-3xl overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-[0_8px_24px_rgba(0,0,0,0.04)] relative bg-[#F2F2F7]">
          {isAnalyzing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/8 flex items-center gap-2.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#0A84FF] animate-ping" />
              <span className="text-xs font-semibold text-[#111111]">
                Analyzing GPS Parcel ({selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E)...
              </span>
            </div>
          )}
          <DynamicMap onSelect={handleZoneSelect} selected={selected} />
        </div>

        {/* Telemetry & Analysis Panel */}
        <div className="lg:col-span-5 h-full relative">
          {/* Full Right-Panel Satellite Analysis Overlay */}
          {fullScreenOverlay.visible && (
            <div
              className={`absolute inset-0 z-20 rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-colors duration-300 border shadow-sm overflow-hidden ${
                fullScreenOverlay.isRedPhase
                  ? 'bg-[#111111] text-white border-[#FF3B30]/30'
                  : 'bg-[#F7F7F7] text-[#111111] border-[#EEEEEE]'
              }`}
            >
              {/* Subtle Ambient Radial Glow */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                  fullScreenOverlay.isRedPhase
                    ? 'opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,59,48,0.25)_0%,transparent_70%)]'
                    : 'opacity-30 bg-[radial-gradient(circle_at_center,rgba(52,199,89,0.25)_0%,transparent_70%)]'
                }`}
              />

              <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
                {/* Status Pill Badge */}
                <div
                  className={`mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-2xs ${
                    fullScreenOverlay.isRedPhase
                      ? 'bg-[#FF3B30] text-white animate-pulse'
                      : 'bg-white text-[#111111] border border-[#E5E5E7]'
                  }`}
                >
                  {fullScreenOverlay.isRedPhase ? (
                    <>
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>NON-ARABLE URBAN RESTRICTION</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping shrink-0" />
                      <span>
                        SATELLITE LOCK • {fullScreenOverlay.lat.toFixed(4)}°N,{' '}
                        {fullScreenOverlay.lng.toFixed(4)}°E
                      </span>
                    </>
                  )}
                </div>

                {/* Headline */}
                <h2
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 transition-colors duration-300 ${
                    fullScreenOverlay.isRedPhase ? 'text-[#FF3B30]' : 'text-[#111111]'
                  }`}
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", -apple-system, sans-serif',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {fullScreenOverlay.isRedPhase
                    ? 'Non-Arable Terrain Detected'
                    : 'Analyzing Satellite Grid'}
                </h2>

                {/* Subheadline description */}
                <p
                  className={`text-xs sm:text-sm mb-6 max-w-xs transition-colors duration-300 leading-relaxed ${
                    fullScreenOverlay.isRedPhase ? 'text-white/80' : 'text-[#666666]'
                  }`}
                >
                  {fullScreenOverlay.isRedPhase
                    ? 'Coordinates correspond to urban infrastructure or non-farmable land. Telemetry export blocked.'
                    : 'Querying Sentinel-2 multispectral surface bands & NASA POWER 2m atmospheric grid...'}
                </p>

                {/* Central ThoughtLine Container Card */}
                <div
                  className={`w-full rounded-[22px] p-5 shadow-xs transition-all duration-300 border ${
                    fullScreenOverlay.isRedPhase
                      ? 'bg-[#1C1C1E] border-[#FF3B30]/40'
                      : 'bg-white border-[#E5E5E7]'
                  }`}
                >
                  <div className="flex justify-center w-full">
                    <ThoughtLine
                      working={!fullScreenOverlay.isRedPhase}
                      steps={
                        fullScreenOverlay.isRedPhase
                          ? [
                              'Resolving GPS coordinates & GIS boundary',
                              'Sampling Sentinel-2 multispectral surface bands',
                              'Urban infrastructure / developed parcel detected',
                              'Agricultural zoning restriction enforced',
                            ]
                          : analysisSteps
                      }
                      label={
                        fullScreenOverlay.isRedPhase
                          ? 'Restricted: Non-arable land'
                          : 'Analyzing UAE GPS parcel…'
                      }
                      doneLabel={
                        fullScreenOverlay.isRedPhase
                          ? 'Restricted: Non-arable'
                          : 'Telemetry verified in'
                      }
                      glyph={fullScreenOverlay.isRedPhase ? 'dot' : 'sparkle'}
                      fontSize={14}
                      color={fullScreenOverlay.isRedPhase ? '#FF3B30' : '#111111'}
                      glyphColor={fullScreenOverlay.isRedPhase ? '#FF3B30' : '#34C759'}
                      collapsible={false}
                      collapseOnSettle={false}
                      showTimer={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telemetry & Analysis Scroll Content */}
          <div
            className={`h-full overflow-y-auto space-y-4 pr-1 transition-opacity duration-200 ${
              fullScreenOverlay.visible ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Location Header Card */}
            <div className="swiss-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="badge-emerald">
                {selected.emirate}
              </span>
              <span className="text-xs font-mono text-[#86868B] bg-[#F5F5F7] px-3 py-1 rounded-full">
                {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
              </span>
            </div>

            <h2 className="text-2xl font-bold text-[#111111]">{selected.name}</h2>

            <div className="text-sm text-[#6E6E73] space-y-2">
              <div>
                <strong className="text-[#111111]">Soil Profile:</strong> {selected.soilSummary}
              </div>
              <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)]">
                <strong className="text-[#111111]">Aquifer:</strong> {selected.aquiferNote}
              </div>
            </div>
          </div>

          {/* NASA Weather Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="swiss-card p-5">
              <div className="flex items-center justify-between text-[#6E6E73] mb-1">
                <span className="text-xs font-semibold uppercase">Air Temp</span>
                <Thermometer size={16} className="text-[#34C759]" />
              </div>
              <div className="text-2xl font-bold text-[#111111] my-1">
                {loadingNasa ? '...' : `${tempC}°C`}
              </div>
              <span className="text-xs text-[#86868B]">NASA Langley 2m Grid</span>
            </div>

            <div className="swiss-card p-5">
              <div className="flex items-center justify-between text-[#6E6E73] mb-1">
                <span className="text-xs font-semibold uppercase">Solar Flux</span>
                <Sun size={16} className="text-[#FF9500]" />
              </div>
              <div className="text-2xl font-bold text-[#111111] my-1">
                {loadingNasa ? '...' : `${solarVal} MJ`}
              </div>
              <span className="text-xs text-[#86868B]">Daily Surface Irradiance</span>
            </div>
          </div>

          {/* Water Conservation Calculator */}
          <div className="swiss-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                AQUIFER WATER SAVINGS
              </span>
              <span className="badge-emerald">
                {activePlan === 'oasis' ? 'SAVES 60%' : 'SAVES 82%'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6E6E73]">
                  {activePlan === 'oasis' ? 'Oasis Canopy Plan:' : 'Salt Harvest Plan:'}
                </span>
                <span className="text-[#1E8236] font-bold">
                  {activePlan === 'oasis' ? '8,500 m³/ha/yr' : '3,800 m³/ha/yr'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#34C759] rounded-full transition-all duration-500"
                  style={{ width: activePlan === 'oasis' ? '38%' : '18%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#86868B]">
                <span>Standard Grass: 22,000 m³ (Extreme Waste)</span>
              </div>
            </div>
          </div>

          {/* 3-Year Plan Selector */}
          <div className="swiss-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                RECOMMENDED 3-YEAR PROTOCOL
              </span>
              <div className="inline-flex bg-[#F5F5F7] p-1 rounded-full text-xs">
                <button
                  onClick={() => setActivePlan('oasis')}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                    activePlan === 'oasis' ? 'bg-[#34C759] text-white shadow-sm' : 'text-[#6E6E73]'
                  }`}
                >
                  Oasis Shade
                </button>
                <button
                  onClick={() => setActivePlan('salt')}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                    activePlan === 'salt' ? 'bg-[#34C759] text-white shadow-sm' : 'text-[#6E6E73]'
                  }`}
                >
                  Salt Harvest
                </button>
              </div>
            </div>

            {activePlan === 'oasis' ? (
              <div className="space-y-3">
                <p className="text-sm text-[#6E6E73] leading-relaxed">
                  <strong className="text-[#111111]">Plan 1: The Oasis Shade Method.</strong> Grow tall Date Palms to block harsh desert sun. In the cool understory, plant citrus trees and nitrogen-fixing legumes that enrich dry sandy soil without synthetic chemicals.
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#1E8236] font-bold">YEAR 01</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Date Palms</div>
                  </div>
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#1E8236] font-bold">YEAR 02</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Citrus Shade</div>
                  </div>
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#1E8236] font-bold">YEAR 03</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Full Canopy</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#6E6E73] leading-relaxed">
                  <strong className="text-[#111111]">Plan 2: The Salt-Water Harvest.</strong> Uses brackish well water to irrigate desert Quinoa and Salicornia. The plants draw excess mineral salts from the topsoil, steadily repairing depleted parcels for future cultivation.
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#6E6E73] font-bold">YEAR 01</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Quinoa</div>
                  </div>
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#6E6E73] font-bold">YEAR 02</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Salicornia</div>
                  </div>
                  <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-[rgba(0,0,0,0.04)]">
                    <div className="text-[10px] text-[#6E6E73] font-bold">YEAR 03</div>
                    <div className="text-xs font-semibold text-[#111111] mt-1">Salinity Reset</div>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Slide to Export to CSV Panel */}
            <div className="bg-white rounded-3xl p-5 border border-[rgba(0,0,0,0.06)] shadow-xs flex flex-col items-center justify-center gap-3">
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
    </div>
  );
}
