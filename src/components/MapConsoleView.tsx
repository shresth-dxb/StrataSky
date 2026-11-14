'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
} from 'lucide-react';
import { UaeFarmZone, UAE_FARM_PRESETS } from '@/lib/landValidation';
import SlideCommit from '@/components/SlideCommit';
import InfoTooltip from '@/components/InfoTooltip';

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
  const [activePlan, setActivePlan] = useState<'oasis' | 'salt'>('oasis');

  useEffect(() => {
    // Zero Foreign / Zero Non-Arable Calculations
    if (selected.isFarmable === false) {
      setLoadingNasa(false);
      return;
    }

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
  }, [selected]);

  // Execute CSV Blob creation and download logic
  const executeDownloadCSV = () => {
    if (selected.isFarmable === false) return;
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
        ['Arable Farmland Status', 'Verified Arable Farmland'],
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
            const isCurrent = selected.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => setSelected({ ...preset, isFarmable: true })}
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
          <DynamicMap onSelect={setSelected} selected={selected} />
        </div>

        {/* Telemetry & Analysis Panel */}
        <div className="lg:col-span-5 h-full overflow-y-auto space-y-4 pr-1">
          {selected.isFarmable === false ? (
            <div className="space-y-4">
              {selected.validationStatus === 'outside_uae' ? (
                /* Apple-style alert banner: Outside UAE Territory */
                <div className="bg-[#FFF2F2] border border-[#FF3B30]/25 rounded-[24px] p-6 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-semibold px-3 py-1 rounded-full">
                      <AlertTriangle size={13} />
                      <span>OUTSIDE UAE TERRITORY</span>
                    </span>
                    <span className="text-xs font-mono text-[#888888] bg-white px-3 py-1 rounded-full shadow-2xs">
                      {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#111111] leading-tight">Outside UAE Territory</h2>

                  <div className="p-4 bg-white rounded-2xl border border-[#FF3B30]/15 text-sm text-[#1C1C1E] leading-relaxed">
                    <strong className="text-[#FF3B30]">Outside UAE Territory:</strong> StrataSky telemetry is calibrated exclusively for United Arab Emirates agricultural zones.
                  </div>

                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    NASA POWER solar/temperature models and groundwater aquifers are restricted to UAE national borders. Please select a parcel within UAE territory.
                  </p>

                  <div className="pt-2 border-t border-[#FF3B30]/10">
                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-2">
                      Jump to Verified UAE Agricultural Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {UAE_FARM_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelected({ ...preset, isFarmable: true })}
                          className="px-3 py-1.5 bg-white hover:bg-[#F2F2F7] border border-gray-200 text-[#111111] text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Crisp, rounded Apple-style warning card: Non-Arable Zone Blocked */
                <div className="bg-white border border-[#FF9500]/30 rounded-[24px] p-6 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-[#FF9500]/10 text-[#D97706] text-xs font-semibold px-3 py-1 rounded-full">
                      <AlertTriangle size={13} />
                      <span>NON-ARABLE ZONE BLOCKED</span>
                    </span>
                    <span className="text-xs font-mono text-[#888888] bg-[#F5F5F7] px-3 py-1 rounded-full">
                      {selected.lat.toFixed(4)}°N, {selected.lng.toFixed(4)}°E
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#111111] leading-tight">{selected.name}</h2>

                  <div className="p-4 bg-[#FFFBEB] rounded-2xl border border-[#FF9500]/25 text-sm text-[#92400E] leading-relaxed font-medium">
                    Non-Arable Zone Blocked: <strong>{selected.blockedPlaceName || selected.name}</strong> is classified as urban, industrial, or transport infrastructure. Click any farm, oasis, or open desert plot to analyze.
                  </div>

                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Commercial facilities, airports, roads, and industrial zones cannot support regenerative crop rotations. Click any farm, oasis, or open desert plot to analyze.
                  </p>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-2">
                      Recommended Agricultural Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {UAE_FARM_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelected({ ...preset, isFarmable: true })}
                          className="px-3 py-1.5 bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#111111] text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Paused Telemetry State Info */}
              <div className="bg-[#F7F7F7] rounded-[24px] p-6 text-center space-y-3 border border-[#EEEEEE]">
                <div className="w-10 h-10 rounded-full bg-[#E5E5EA] flex items-center justify-center mx-auto text-[#86868B]">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#111111]">Telemetry &amp; NASA Calculations Paused</h3>
                <p className="text-xs text-[#6E6E73] max-w-sm mx-auto leading-relaxed">
                  Select any agricultural parcel, palm oasis, or open desert terrain on the map to activate multispectral soil profiling, NASA POWER weather grids, and water conservation models.
                </p>
              </div>
            </div>
          ) : (
            <>
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
                  <div className="flex items-center">
                    <strong className="text-[#111111] mr-1">Soil Profile:</strong> {selected.soilSummary}
                    <InfoTooltip text="Shows the local ground texture and salt concentration (dS/m). Soil above 4 dS/m is too salty for standard vegetables and requires salt-tolerant crops." />
                  </div>
                  <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex items-center justify-between">
                    <div>
                      <strong className="text-[#111111]">Aquifer:</strong> {selected.aquiferNote}
                    </div>
                    <InfoTooltip text="Displays local underground water conditions, average yearly rainfall, and how much carbon the soil can trap per hectare." />
                  </div>
                </div>
              </div>

              {/* NASA Weather Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="swiss-card p-5">
                  <div className="flex items-center justify-between text-[#6E6E73] mb-1">
                    <span className="text-xs font-semibold uppercase flex items-center">
                      Air Temp
                      <InfoTooltip text="Average daily air temperature 2 meters above the ground from NASA satellites. Helps determine heat stress and safe planting seasons." />
                    </span>
                    <Thermometer size={16} className="text-[#34C759]" />
                  </div>
                  <div className="text-2xl font-bold text-[#111111] my-1">
                    {loadingNasa ? '...' : `${tempC}°C`}
                  </div>
                  <span className="text-xs text-[#86868B]">NASA Langley 2m Grid</span>
                </div>

                <div className="swiss-card p-5">
                  <div className="flex items-center justify-between text-[#6E6E73] mb-1">
                    <span className="text-xs font-semibold uppercase flex items-center">
                      Solar Flux
                      <InfoTooltip text="Total daily sunlight energy hitting your crops (MJ/m²/day). High desert sun fuels plant growth, but extreme levels rapidly evaporate soil water." />
                    </span>
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
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center">
                    AQUIFER WATER SAVINGS
                    <InfoTooltip text="StrataSky balances soil minerals and multi-year crop cycles to cut water use by up to 60%." />
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
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center">
                    RECOMMENDED 3-YEAR PROTOCOL
                    <InfoTooltip text="StrataSky balances soil minerals and multi-year crop cycles to cut water use by up to 60%." />
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
                      label="Slide to export to CSV"
                      doneLabel="Exported"
                      errorLabel="Export Failed"
                      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 400))}
                      onDone={() => {
                        setTimeout(() => {
                          executeDownloadCSV();
                        }, 200);
                      }}
                      trackColor="#F1F1F1"
                      handleColor="#111111"
                      successColor="#34C759"
                      dangerColor="#FF3B30"
                      width={300}
                      height={56}
                      radius={28}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
