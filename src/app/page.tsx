'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  CloudRain,
  Sprout,
  Target,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  TrendingUp,
  Layers,
  Wind,
  FlaskConical,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  UaeFarmZone,
  UAE_FARM_PRESETS,
  SoilNutrientProfile,
  ClimateRainfallProfile,
  CropRotationStrategy,
  FarmerPriorityScores,
} from '@/lib/landValidation';
import AppIcon from '@/components/AppIcon';
import SlideCommit from '@/components/SlideCommit';
import LatticeLoader from '@/components/LatticeLoader';
import InfoTooltip from '@/components/InfoTooltip';
import { useLanguage } from '@/context/LanguageContext';
import { askGeminiSoilAdvisor, ChatMessage } from '@/utils/geminiSoilAdvisor';
import PromptBar from '@/components/PromptBar';
import { SparklesIcon } from '@hugeicons/core-free-icons';
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

const EMIRATE_LABELS: Record<string, { en: string; ar: string }> = {
  'Abu Dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
  Dubai: { en: 'Dubai', ar: 'دبي' },
  Sharjah: { en: 'Sharjah', ar: 'الشارقة' },
  'Ras Al Khaimah': { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  Ajman: { en: 'Ajman', ar: 'عجمان' },
};

const SOIL_LABELS: Record<string, { en: string; ar: string }> = {
  'Deep Sandy Loam': { en: 'Deep Sandy Loam', ar: 'طمي رملي عميق' },
  'Hyper-Arid Dune': { en: 'Hyper-Arid Dune', ar: 'كثبان شديدة الجفاف' },
  'Alluvial Gravel': { en: 'Alluvial Gravel', ar: 'حصى طمي جبلي' },
  'Saline Sand': { en: 'Saline Sand', ar: 'رمال ملحية سبخية' },
};

const WATER_LABELS: Record<string, { en: string; ar: string }> = {
  'Historic Falaj': { en: 'Historic Falaj', ar: 'فلج تاريخي' },
  'Brackish Well': { en: 'Brackish Well', ar: 'بئر مائل للملوحة' },
  Desalinated: { en: 'Desalinated', ar: 'مياه محلاة' },
  'Fossil Aquifer': { en: 'Fossil Aquifer', ar: 'حوض جوفي قديم' },
};

const CROP_LABELS: Record<string, { en: string; ar: string }> = {
  'Oasis Shade (Multi-Tier)': { en: 'Oasis Shade (Multi-Tier)', ar: 'ظل الواحة متعدد الطبقات' },
  'Biosaline Rotation': { en: 'Biosaline Rotation', ar: 'دورة زراعية حيوية ملحية' },
  'Halophyte Harvest': { en: 'Halophyte Harvest', ar: 'حصاد النباتات الملحية' },
};

const PARCEL_NAME_AR: Record<string, string> = {
  'Al Ain Oasis': 'واحة العين',
  'Liwa Crescent': 'هلال ليوا',
  'Al Dhaid Plains': 'سهول الذيد',
  'ICBA Biosaline Hub': 'مركز إكبا للزراعة الملحية',
  'Digdaga Valley': 'وادي الدقداقة',
  'Masmout Desert Farm': 'مزرعة مسموت الصحراوية',
  'Sweihan Dune Farm': 'مزرعة كثبان سويحان',
  'Al Madam Agricultural Basin': 'حوض المدام الزراعي',
  'Khatt Thermal Springs': 'ينابيع خت الحارة',
  'Open UAE Agricultural Parcel': 'أرض زراعية إماراتية مفتوحة',
};

const SUBREGION_AR: Record<string, string> = {
  'Eastern Falaj Corridor': 'ممر الأفلاج الشرقي',
  'Al Dhafra Dune Margin': 'حافة كثبان الظفرة',
  'Hajar Mountain Foothills': 'سفوح جبال الحجر',
  'Academic City South': 'جنوب المدينة الأكاديمية',
  'Wadi Bih Alluvial Basin': 'حوض وادي بيح الطميي',
  'Inland Sandy Basin': 'الحوض الرملي الداخلي',
  'Al Ain Northern Sands': 'رمال العين الشمالية',
  'Central Dune Corridor': 'ممر الكثبان الأوسط',
  'Hajar Mountain Aquifer': 'خزان جبال الحجر الجوفي',
};

const RATING_AR: Record<string, string> = {
  Deficient: 'نقص حاد',
  Low: 'منخفض',
  Optimal: 'مثالي',
  High: 'مرتفع',
  Moderate: 'معتدل',
  Excessive: 'فائض',
  Safe: 'آمن',
  Elevated: 'مرتفع',
  'Non-Saline': 'غير ملحية',
  'Slightly Saline': 'ملوحة طفيفة',
  'Moderately Saline': 'متوسطة الملوحة',
  'Highly Saline': 'شديدة الملوحة',
  Hypersaline: 'فرط ملوحة',
};

const ELEMENT_NAMES_AR: Record<string, string> = {
  'Calcium (Ca)': 'الكالسيوم (Ca)',
  'Magnesium (Mg)': 'المغنيسيوم (Mg)',
  'Sulfur (S)': 'الكبريت (S)',
  'Iron (Fe)': 'الحديد (Fe)',
  'Zinc (Zn)': 'الزنك (Zn)',
  'Boron (B)': 'البورون (B)',
};

const ELEMENT_NOTES_AR: Record<string, string> = {
  'Calcareous parent material; suppresses sodium toxicity': 'مادة أصلية جيرية؛ تحد من سمية الصوديوم وتحسن بنية التربة',
  'Balanced Ca:Mg ratio (10.7:1); protects chlorophyll': 'نسبة متوازنة بين الكالسيوم والمغنيسيوم (10.7:1)؛ تحمي الكلوروفيل',
  'Supports protein synthesis and nodulation': 'يعزز تكوين البروتين وتنشيط العقد الجذرية المثبتة للنيتروجين',
  'High pH limits Fe availability; foliar iron recommended': 'ارتفاع قلوية التربة يحد من امتصاص الحديد؛ يوصى بالرش الورقي للحديد المخلبي',
  'Sub-canopy legume companion mobilizes root zinc': 'زراعة البقوليات تحت المظلة تنشط امتصاص الزنك في الجذور',
  'Safely below phytotoxic threshold (< 3.0 mg/kg)': 'ضمن الحدود الآمنة تماماً ودون مستويات السمية النباتية (< 3.0 ملغ/كغ)',
};

const DROUGHT_RISK_AR: Record<string, string> = {
  Low: 'منخفض',
  Moderate: 'معتدل',
  Severe: 'شديد',
  Extreme: 'حرج',
};

const WET_SEASON_AR: Record<string, string> = {
  'December – March': 'ديسمبر – مارس',
  'Dec – Mar': 'ديسمبر – مارس',
};

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const STRATEGY_TRANSLATIONS: Record<
  string,
  {
    name: string;
    tagline: string;
    whySuggested: string;
    icbaEvidence: string;
    benefits: string[];
    farmerRisks: string[];
    timeline: { year: string; crop: string; role: string }[];
  }
> = {
  baseline: {
    name: 'الممارسة الحالية: الزراعة الأحادية لحشيشة الرودس',
    tagline: 'علف صيفي عالي الاستهلاك المائي يعتمد على الغمر من المياه الجوفية غير المتجددة.',
    whySuggested:
      'تمثل حشيشة الرودس التقليدية أكبر مستنزف لاحتياطيات المياه الجوفية في الإمارات (22,000 م³/هكتار)، مما يسرع هبوط مستوى الآبار وتملحها.',
    icbaEvidence:
      'تقارير المركز الدولي للزراعة الملحية (ICBA) وقرارات وزارة التغير المناخي والبيئة أكدت حظر الرودس لخفض الفاقد المائي الوطني بنسبة 60%.',
    benefits: ['علف مألوف للماشية', 'سوق محلي تجاري قائم'],
    farmerRisks: ['استنزاف تام لآبار المياه الجوفية', 'استهلاك كهرباء ديزل ضخم للضخ', 'تدهور خصوبة التربة الصحراوية'],
    timeline: [
      { year: 'السنة الأولى', crop: 'حشيشة الرودس', role: 'استنزاف 22,000 م³ مياه/هكتار' },
      { year: 'السنة الثانية', crop: 'حشيشة الرودس', role: 'هبوط مناسيب الآبار الجوفية' },
      { year: 'السنة الثالثة', crop: 'حشيشة الرودس', role: 'تراكم شديد للأملاح في منطقة الجذور' },
    ],
  },
  oasis: {
    name: 'الاستراتيجية (ب): مظلة الواحة ثلاثية الطبقات',
    tagline: 'نخيل التمر + حمضيات قزمة تحت المظلة + بقوليات علفية مثبتة للنيتروجين.',
    whySuggested:
      'تستنسخ نظام الواحة الإماراتي التاريخي: نخيل التمر يحمي المحاصيل التحتية من حرارة الصيف الشديدة (48° مئوية)، بينما تثبت البقوليات النيتروجين في التربة الرملية.',
    icbaEvidence:
      'أظهرت تجارب محطات أبحاث ICBA أن الزراعة متعددة الطبقات تخفض البخر بنسبة 42% وتوفر 61% من استهلاك مياه الري سنوياً.',
    benefits: ['توفير 61% من مياه الري (8,500 م³/هكتار)', 'عائد ربحي مرتفع يصل إلى 34,800 درهم/هكتار', 'تثبيت طبيعي للنيتروجين عبر اللوبيا'],
    farmerRisks: ['تحتاج رأس مال أولي لشتلات النخيل والحمضيات', 'تتطلب شبكة ري بالتنقيط تحت السطحي'],
    timeline: [
      { year: 'السنة الأولى', crop: 'نخيل التمر + الذرة الرفيعة', role: 'تأسيس المظلة ومصدات الرياح العاصفة' },
      { year: 'السنة الثانية', crop: 'نخيل التمر + الحمضيات القزمة', role: 'تطوير الطبقة الوسطى المظللة' },
      { year: 'السنة الثالثة', crop: 'نخيل + حمضيات + لوبيا علفية', role: 'نظام متكامل لتثبيت النيتروجين وبناء الكربون' },
    ],
  },
  saline: {
    name: 'الاستراتيجية (ج): دورة النباتات الملحية والكينوا',
    tagline: 'كينوا (ICBA-Q5) + ساليكورنيا بيجيلوفي + سماد سسبانيا الأخضر.',
    whySuggested:
      'الحل المثالي للأراضي الصحراوية شديدة الملوحة (EC > 8 dS/m) والآبار المسوسة، حيث تزدهر الكينوا والساليكورنيا وتنتج بذوراً وزيوتاً تجارية عالية القيمة.',
    icbaEvidence:
      'صنف المركز الدولي سلالات كينوا ICBA-Q5 وساليكورنيا تتحمل ملوحة تصل إلى ملوحة ماء البحر (55 dS/m) مع توفير 83% من المياه مقارنة بالرودس.',
    benefits: ['توفير هائل للمياه بنسبة 83% (3,800 م³/هكتار فقط)', 'استغلال آبار المياه الجوفية شديدة الملوحة', 'محاصيل نقدية تصديرية ذات قيمة سوقية عالية'],
    farmerRisks: ['تتطلب معرفة بأسواق الكينوا وحصاد الساليكورنيا', 'تحتاج مطاحن خاصة لمعالجة حبوب الكينوا'],
    timeline: [
      { year: 'السنة الأولى', crop: 'كينوا شتوية (ICBA-Q5)', role: 'حصاد حبوب عالية البروتين والقيمة' },
      { year: 'السنة الثانية', crop: 'ساليكورنيا بيجيلوفي', role: 'ري بمياه عالية الملوحة وإنتاج زيت وبذور' },
      { year: 'السنة الثالثة', crop: 'سسبانيا خضراء صيفية', role: 'سماد عضوي وتخصيب النيتروجين بالتربة' },
    ],
  },
};

const GOAL_TRANSLATIONS: Record<
  string,
  { label: string; desc: string; matchedStratAr: string }
> = {
  saveWater: {
    label: 'ترشيد المياه',
    desc: 'يستهلك 3,800 م³/هكتار/سنة فقط، محققاً وفراً في المياه بنسبة 83% مقارنة بالزراعات التقليدية. يسمح بالري باستخدام مياه الآبار المسوسة دون استنزاف الخزانات الجوفية.',
    matchedStratAr: 'الاستراتيجية (ج): دورة الكينوا والساليكورنيا المقاومة للملوحة',
  },
  maximizeProfit: {
    label: 'تعظيم الأرباح',
    desc: 'يحقق صافي ربح متوقع قدره 34,800 درهم/هكتار من خلال أصناف التمور التجارية عالية القيمة (خلاص/برحي) والحمضيات المرافقة، مع خفض تكاليف الضخ بنسبة 61%.',
    matchedStratAr: 'الاستراتيجية (ب): مظلة الواحة ثلاثية الطبقات',
  },
  rebuildSoil: {
    label: 'استعادة التربة',
    desc: 'يعيد بناء الكربون العضوي في التربة من 0.3% إلى أكثر من 1.2% خلال 3 سنوات. يثبت محصول التغطية (اللوبيا) 120 كغ من النيتروجين الجوي/هكتار مباشرة في التربة الصحراوية.',
    matchedStratAr: 'الاستراتيجية (ب): مظلة الواحة ثلاثية الطبقات',
  },
  lowerRisk: {
    label: 'تقليل المخاطر',
    desc: 'يوفر حصانة شبه تامة ضد موجات الحرارة الصيفية (>45° مئوية) وارتفاع ملوحة المياه الجوفية (>12 dS/m). تزدهر الجذور الملحية حيث تحترق المحاصيل العادية.',
    matchedStratAr: 'الاستراتيجية (ج): دورة الكينوا والساليكورنيا المقاومة للملوحة',
  },
  useLessFertilizer: {
    label: 'تقليل الأسمدة',
    desc: 'يقلل الاعتماد على الأسمدة الكيميائية الصناعية بنسبة 80% من خلال المعالجة بالفحم الحيوي (البيوشار)، وتدوير معادن النباتات الملحية، وتثبيت النيتروجين الطبيعي عبر بكتيريا الريزوبيوم.',
    matchedStratAr: 'الاستراتيجية (ج): دورة الكينوا والساليكورنيا المقاومة للملوحة',
  },
};

const STRATEGY_SCORE_NAMES: Record<string, { en: string; ar: string }> = {
  saline: {
    en: 'Strategy C: Biosaline Quinoa & Salicornia',
    ar: 'الاستراتيجية (ج): دورة الكينوا والساليكورنيا المقاومة للملوحة',
  },
  oasis: {
    en: 'Strategy B: 3-Tier Oasis Agroforestry',
    ar: 'الاستراتيجية (ب): مظلة الواحة ثلاثية الطبقات',
  },
  baseline: {
    en: 'Baseline Practice: Rhodes Grass',
    ar: 'الممارسة الحالية: حشيشة الرودس التقليدية',
  },
};

export default function StrataSkyMobbinApp() {
  // Language & Internationalization Context
  const { lang, setLang, t, dir } = useLanguage();

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
  const [consoleTab, setConsoleTab] = useState<'climate' | 'nutrients' | 'strategies' | 'priorities'>('climate');
  const [selectedStrategyId, setSelectedStrategyId] = useState<'baseline' | 'oasis' | 'saline'>('oasis');
  const [farmerGoal, setFarmerGoal] = useState<'saveWater' | 'maximizeProfit' | 'rebuildSoil' | 'lowerRisk' | 'useLessFertilizer'>('saveWater');
  const [nasaTemp, setNasaTemp] = useState<number>(27.2);
  const [nasaSolar, setNasaSolar] = useState<number>(19.4);
  const [loadingNasa, setLoadingNasa] = useState<boolean>(false);

  // AI Soil Advisor Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const aiAdvisorRef = useRef<HTMLDivElement>(null);

  // Reset chat thread when parcel selection changes
  useEffect(() => {
    setChatMessages([]);
  }, [selectedZone.name]);

  const triggerAiAdvisor = useCallback(
    async (customPrompt?: string) => {
      setTimeout(() => {
        aiAdvisorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      const query =
        customPrompt ||
        (lang === 'ar'
          ? 'لخص حالة التربة والتوصيات الزراعية المناسبة لهذا الموقع'
          : 'Summarize the soil profile, water dynamics, and recommended crop rotations for this parcel.');

      const userMsgId = 'u-' + Date.now();
      const newMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, newMsg]);
      setIsGenerating(true);

      try {
        const response = await askGeminiSoilAdvisor({
          prompt: query,
          selectedZone,
          lang,
          history: [...chatMessages, newMsg],
          nasaTemp,
          nasaSolar,
        });

        const assistantMsg: ChatMessage = {
          id: 'a-' + Date.now(),
          sender: 'assistant',
          text: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChatMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error('Error generating AI advice:', error);
        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text:
            lang === 'ar'
              ? 'عذراً، تعذر توليد الاستشارة في الوقت الحالي. يرجى إعادة المحاولة.'
              : 'Could not generate advice at this moment. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsGenerating(false);
      }
    },
    [lang, selectedZone, chatMessages, nasaTemp, nasaSolar]
  );

  const handleSendPrompt = useCallback(
    (promptText: string) => {
      if (!promptText || !promptText.trim()) return;
      triggerAiAdvisor(promptText.trim());
    },
    [triggerAiAdvisor]
  );

  // GPS Parcel Calculation State (LatticeLoader)
  const [isCalculatingGps, setIsCalculatingGps] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState<'working' | 'done' | 'error'>('working');
  const [calculatingCoords, setCalculatingCoords] = useState<{ lat: number; lng: number }>({
    lat: UAE_FARM_PRESETS[0].lat,
    lng: UAE_FARM_PRESETS[0].lng,
  });

  const calcSeqRef = useRef(0);
  const calcTimersRef = useRef<{
    tLatency?: ReturnType<typeof setTimeout>;
    tHide?: ReturnType<typeof setTimeout>;
  }>({});

  const clearCalcTimers = () => {
    if (calcTimersRef.current.tLatency) clearTimeout(calcTimersRef.current.tLatency);
    if (calcTimersRef.current.tHide) clearTimeout(calcTimersRef.current.tHide);
  };

  const handleZoneSelect = useCallback((zone: UaeFarmZone) => {
    // If parcel is blocked (outside UAE territory or non-arable zone), abort GPS calculations immediately!
    if (zone.isFarmable === false) {
      clearCalcTimers();
      setIsCalculatingGps(false);
      setLoaderStatus('done');
      setSelectedZone(zone);
      return;
    }

    const isAnalyzingStart = zone.name.includes('Analyzing');

    if (isAnalyzingStart) {
      clearCalcTimers();
      const seq = ++calcSeqRef.current;
      setCalculatingCoords({ lat: zone.lat, lng: zone.lng });
      setLoaderStatus('working');
      setIsCalculatingGps(true);
      setSelectedZone(zone);
    } else {
      const seq = calcSeqRef.current;
      setCalculatingCoords({ lat: zone.lat, lng: zone.lng });
      clearCalcTimers();
      // Additional latency of 1.4 seconds (1400ms)
      calcTimersRef.current.tLatency = setTimeout(() => {
        if (calcSeqRef.current === seq) {
          setSelectedZone(zone);
          setLoaderStatus('done');

          // Show the result for a split second (600ms) before hiding
          calcTimersRef.current.tHide = setTimeout(() => {
            if (calcSeqRef.current === seq) {
              setIsCalculatingGps(false);
            }
          }, 600);
        }
      }, 1400);
    }
  }, []);

  const handlePresetSelect = (preset: UaeFarmZone) => {
    clearCalcTimers();
    const seq = ++calcSeqRef.current;
    setCalculatingCoords({ lat: preset.lat, lng: preset.lng });
    setLoaderStatus('working');
    setIsCalculatingGps(true);

    calcTimersRef.current.tLatency = setTimeout(() => {
      if (calcSeqRef.current === seq) {
        setSelectedZone({ ...preset, isFarmable: true });
        setLoaderStatus('done');

        calcTimersRef.current.tHide = setTimeout(() => {
          if (calcSeqRef.current === seq) {
            setIsCalculatingGps(false);
          }
        }, 600);
      }
    }, 1400);
  };

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
      const zone: UaeFarmZone = {
        name: parcel.name,
        emirate: `${parcel.emirate} • ${parcel.subRegion}`,
        lat: parcel.lat,
        lng: parcel.lng,
        soilSummary: parcel.soilProfile,
        aquiferNote: parcel.waterSource,
        isFarmable: true,
        zoom: 12,
      };
      setSelectedZone(zone);
      setActivePlan(parcel.cropPlan.includes('Oasis') ? 'oasis' : 'salt');
      setView('console');

      clearCalcTimers();
      const seq = ++calcSeqRef.current;
      setCalculatingCoords({ lat: parcel.lat, lng: parcel.lng });
      setLoaderStatus('working');
      setIsCalculatingGps(true);

      calcTimersRef.current.tLatency = setTimeout(() => {
        if (calcSeqRef.current === seq) {
          setLoaderStatus('done');
          calcTimersRef.current.tHide = setTimeout(() => {
            if (calcSeqRef.current === seq) {
              setIsCalculatingGps(false);
            }
          }, 600);
        }
      }, 1400);
    } else {
      setView('console');
    }
  };

  // Execute CSV Blob creation and download logic
  const executeDownloadCSV = () => {
    if (selectedZone.isFarmable === false) return;
    try {
      const activeStrategy =
        selectedZone.strategies?.find((s) => s.id === selectedStrategyId) ||
        selectedZone.strategies?.[1];

      const rows = [
        ['Field', 'Value'],
        ['Timestamp', new Date().toISOString()],
        ['Parcel Name', selectedZone.name || 'Custom UAE Parcel'],
        ['Emirate / Sub-Region', selectedZone.emirate || 'United Arab Emirates'],
        ['Latitude', selectedZone.lat?.toFixed(4) || '24.2075'],
        ['Longitude', selectedZone.lng?.toFixed(4) || '55.7447'],
        ['Arable Farmland Status', 'Verified Arable Parcel'],
        ['Soil Taxonomy Group (UAE Union Atlas / ADSS)', selectedZone.nutrients?.soilTaxonomyGroup || 'Typic Torripsamments'],
        ['Soil Salinity EC (dS/m)', `${selectedZone.nutrients?.salinityEC ?? 5.2} dS/m`],
        ['Salinity Classification', selectedZone.nutrients?.salinityClass || 'Moderately Saline'],
        ['Soil pH', `${selectedZone.nutrients?.ph ?? 8.0}`],
        ['Soil Organic Carbon (SOC %)', `${selectedZone.nutrients?.soilOrganicCarbon ?? 0.35} %`],
        ['Soil Organic Matter (%)', `${selectedZone.nutrients?.organicMatter ?? 0.6} %`],
        ['Atmospheric CO2 Concentration', `${selectedZone.nutrients?.co2AtmosphericPpm ?? 421.4} ppm`],
        ['Carbon Sequestration Potential', `${selectedZone.nutrients?.carbonSequestrationPotential ?? 2.3} t CO2/ha/yr`],
        // Macronutrients
        ['Nitrogen (N)', `${selectedZone.nutrients?.nitrogen.value ?? 16} mg/kg (${selectedZone.nutrients?.nitrogen.rating ?? 'Low'})`],
        ['Phosphorus (P)', `${selectedZone.nutrients?.phosphorus.value ?? 14} mg/kg (${selectedZone.nutrients?.phosphorus.rating ?? 'Low'})`],
        ['Potassium (K)', `${selectedZone.nutrients?.potassium.value ?? 210} mg/kg (${selectedZone.nutrients?.potassium.rating ?? 'Optimal'})`],
        // Secondary Nutrients
        ['Calcium (Ca)', `${selectedZone.nutrients?.calcium.value ?? 4600} mg/kg (${selectedZone.nutrients?.calcium.rating ?? 'High'})`],
        ['Magnesium (Mg)', `${selectedZone.nutrients?.magnesium.value ?? 430} mg/kg (${selectedZone.nutrients?.magnesium.rating ?? 'Optimal'})`],
        ['Sulfur (S)', `${selectedZone.nutrients?.sulfur.value ?? 85} mg/kg (${selectedZone.nutrients?.sulfur.rating ?? 'Optimal'})`],
        // Micronutrients
        ['Iron (Fe)', `${selectedZone.nutrients?.iron.value ?? 2.6} mg/kg (${selectedZone.nutrients?.iron.rating ?? 'Low'})`],
        ['Zinc (Zn)', `${selectedZone.nutrients?.zinc.value ?? 0.65} mg/kg (${selectedZone.nutrients?.zinc.rating ?? 'Deficient'})`],
        ['Boron (B)', `${selectedZone.nutrients?.boron.value ?? 1.3} mg/kg (${selectedZone.nutrients?.boron.rating ?? 'Safe'})`],
        // Climate & Rain
        ['Annual Rainfall (NCM / UAE.Stat)', `${selectedZone.climate?.annualRainfallMm ?? 92} mm/year`],
        ['Wet Season Months', selectedZone.climate?.wetSeasonMonths || 'December – March'],
        ['Drought Risk Index', selectedZone.climate?.droughtRiskIndex || 'Severe'],
        ['SMAP Soil Moisture (Volumetric %)', `${selectedZone.climate?.smapSoilMoisturePercent ?? 8.5} %`],
        ['ECOSTRESS Evapotranspiration (ET0)', `${selectedZone.climate?.evapotranspirationMmYear ?? 2200} mm/year`],
        ['NASA Air Temperature (2m)', `${nasaTemp} °C`],
        ['NASA Solar Irradiance (All-Sky)', `${nasaSolar} MJ`],
        // Recommended Strategy
        ['Selected Rotation Strategy', activeStrategy?.name || '3-Tier Oasis Agroforestry Canopy'],
        ['Annual Water Consumption', `${activeStrategy?.waterUsageM3Ha ?? 8500} m³/ha`],
        ['Water Saved vs Rhodes Grass Baseline', `${activeStrategy?.waterSavingsPercent ?? 61} %`],
        ['Projected Net Profit (AED/ha)', `${activeStrategy?.profitPerHaAed ?? 34800} AED/ha`],
        ['Soil Health Gain', activeStrategy?.soilHealthGain || '+0.9% SOC / 3yr'],
        ['Chemical Fertilizer Reduction', `${activeStrategy?.fertilizerReductionPercent ?? 65} %`],
        ['ICBA Research Evidence', activeStrategy?.icbaEvidence || 'Documented in ICBA Annual Reports (2018-2023)'],
        ['Top Farmer Priority Setting', farmerGoal],
      ];

      const escapeCell = (val: string) => `"${(val ?? '').toString().replace(/"/g, '""')}"`;
      const csvString = rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stratasky-telemetry-export.csv');
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
    if (view !== 'console' && view !== 'dashboard') return;
    if (selectedZone.isFarmable === false) {
      setLoadingNasa(false);
      return;
    }

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

          <nav className="flex items-center gap-5 text-[15px]">
            <button
              onClick={() => setView('directory')}
              className="text-[#888888] hover:text-[#111111] font-medium transition-colors cursor-pointer"
            >
              {t.nav.directory}
            </button>
            <button
              onClick={() => handleOpenConsole()}
              className="text-[#888888] hover:text-[#111111] font-medium transition-colors cursor-pointer"
            >
              {t.nav.liveMap}
            </button>

            {/* Apple-style Language Switcher Pill */}
            <div className="flex items-center p-0.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-full">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-white text-[#111111] shadow-xs'
                    : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                عربي
              </button>
            </div>

            <button
              onClick={() => setView('directory')}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full hover:bg-black transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'ابدأ التخطيط' : 'Start Planning'}
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
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#F5F5F7] text-[#111111] border border-[#E5E5EA]">
            <Sparkles size={12} className="text-[#34C759]" />
            <span>{t.hero.badge}</span>
          </div>

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
            {lang === 'ar' ? (
              <>
                حيث تلتقي بيانات ناسا <AppIcon type="satellite" />
                <br />
                بتربة الصحراء <AppIcon type="water" />
                <br />
                لإنتاج زراعي أكثر ذكاءً. <AppIcon type="farming" />
              </>
            ) : (
              <>
                Where NASA <AppIcon type="satellite" /> data
                <br />
                meets desert <AppIcon type="water" /> soil
                <br />
                to grow <AppIcon type="farming" /> smarter.
              </>
            )}
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
            {lang === 'ar'
              ? 'المكتبة الإرشادية لقرارات الزراعة في دولة الإمارات العربية المتحدة. توفير أكثر من 60% من المياه في كافة الإمارات السبع.'
              : 'The agricultural decision library for the UAE. Over 60% water saved across all 7 Emirates.'}
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
              <span>{lang === 'ar' ? 'استعراض المناطق الزراعية' : 'Start Planning'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn fx-20"
              aria-label="How it Works"
              onClick={() => handleOpenConsole()}
            >
              <span className="btn-label">{lang === 'ar' ? 'الخريطة المباشرة والمحاكاة' : 'How it Works'}</span>
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
              {t.nav.directory}
            </button>
            <button
              onClick={() => handleOpenConsole()}
              className={`transition-colors cursor-pointer ${
                view === 'console' || view === 'dashboard'
                  ? 'text-[#111111] font-bold'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              {t.nav.liveMap}
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
              placeholder={t.directory.searchPlaceholder}
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

        {/* Right: Language Pill, Bookmarks, Alerts, & AE Badge */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Apple-style Language Switcher Pill */}
          <div className="flex items-center p-0.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-full">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                lang === 'ar'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              عربي
            </button>
          </div>

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
            title={lang === 'ar' ? 'المزارع المحفوظة' : 'Saved Farms'}
          >
            <Bookmark size={21} className="stroke-[1.8]" />
            {bookmarkedIds.size > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {bookmarkedIds.size}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              alert(
                lang === 'ar'
                  ? 'بيانات أقمار ناسا متزامنة في الوقت الفعلي عبر كافة الإمارات السبع.'
                  : 'NASA satellite feeds synchronized in real-time across all 7 Emirates.'
              )
            }
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
              {t.directory.emirate}
            </span>
            <div className="flex flex-col space-y-1.5">
              {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ras Al Khaimah', 'Ajman'].map((item) => {
                const isActive = selectedEmirate === item;
                const label = lang === 'ar' ? EMIRATE_LABELS[item]?.ar || item : item;
                return (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedEmirate(isActive ? null : item)
                    }
                    className={`text-start text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Soil Profiles */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              {t.directory.soilType}
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                'Deep Sandy Loam',
                'Hyper-Arid Dune',
                'Alluvial Gravel',
                'Saline Sand',
              ].map((item) => {
                const isActive = selectedSoil === item;
                const label = lang === 'ar' ? SOIL_LABELS[item]?.ar || item : item;
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedSoil(isActive ? null : item)}
                    className={`text-start text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Water Source */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              {t.directory.waterSource}
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                'Historic Falaj',
                'Brackish Well',
                'Desalinated',
                'Fossil Aquifer',
              ].map((item) => {
                const isActive = selectedWater === item;
                const label = lang === 'ar' ? WATER_LABELS[item]?.ar || item : item;
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedWater(isActive ? null : item)}
                    className={`text-start text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 4: Crop Plans */}
          <div className="flex flex-col">
            <span className="text-[13px] text-[#888888] font-normal mb-3 select-none">
              {t.directory.cropPlan}
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                'Oasis Shade (Multi-Tier)',
                'Biosaline Rotation',
                'Halophyte Harvest',
              ].map((item) => {
                const isActive = selectedCropPlan === item;
                const label = lang === 'ar' ? CROP_LABELS[item]?.ar || item : item;
                return (
                  <button
                    key={item}
                    onClick={() =>
                      setSelectedCropPlan(isActive ? null : item)
                    }
                    className={`text-start text-[21px] md:text-[23px] font-bold tracking-tight py-0.5 transition-all cursor-pointer leading-tight ${
                      isActive
                        ? 'text-[#111111] underline decoration-2 underline-offset-4'
                        : 'text-[#111111] hover:text-[#888888]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar (if any selected) */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-6 flex-wrap pt-4 border-t border-[#F5F5F7] fade-in">
            <span className="text-xs text-[#888888] font-medium mr-1">
              {lang === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}
            </span>
            {selectedEmirate && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{lang === 'ar' ? EMIRATE_LABELS[selectedEmirate]?.ar || selectedEmirate : selectedEmirate}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedEmirate(null)} />
              </span>
            )}
            {selectedSoil && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{lang === 'ar' ? SOIL_LABELS[selectedSoil]?.ar || selectedSoil : selectedSoil}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedSoil(null)} />
              </span>
            )}
            {selectedWater && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{lang === 'ar' ? WATER_LABELS[selectedWater]?.ar || selectedWater : selectedWater}</span>
                <X size={12} className="cursor-pointer" onClick={() => setSelectedWater(null)} />
              </span>
            )}
            {selectedCropPlan && (
              <span className="inline-flex items-center gap-1.5 bg-[#F1F1F1] text-[#111111] text-xs font-semibold px-3 py-1 rounded-full">
                <span>{lang === 'ar' ? CROP_LABELS[selectedCropPlan]?.ar || selectedCropPlan : selectedCropPlan}</span>
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
              {lang === 'ar' ? 'إعادة ضبط الكل' : 'Reset all'}
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
    <div className="w-full bg-white pt-6 pb-6 fade-in">
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
              {lang === 'ar' ? 'المزارع' : 'Farms'}
            </button>
            <button
              onClick={() => setTypeToggle('Oases')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                typeToggle === 'Oases'
                  ? 'bg-white text-[#111111] shadow-xs font-bold'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              {lang === 'ar' ? 'الواحات' : 'Oases'}
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
              {lang === 'ar' ? 'الأعلى توفيراً للمياه' : 'Highest Water Savings'}
            </button>
            <button
              onClick={() => setActiveSort('resilient')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSort === 'resilient'
                  ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              {lang === 'ar' ? 'الأكثر صموداً' : 'Most Resilient'}
            </button>
            <button
              onClick={() => setActiveSort('salt')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSort === 'salt'
                  ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              {lang === 'ar' ? 'المقاومة للملوحة' : 'Salt-Tolerant'}
            </button>
            <button
              onClick={() => setActiveSort('live')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSort === 'live'
                  ? 'text-[#111111] font-bold border-b-2 border-[#111111] pb-1'
                  : 'text-[#888888] hover:text-[#111111] font-medium'
              }`}
            >
              {lang === 'ar' ? 'بيانات ناسا المباشرة' : 'Live NASA Data'}
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
            <span>{lang === 'ar' ? 'تصفية' : 'Filter'}</span>
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
    <section className="w-full bg-white pb-24 fade-in">
      <div className="max-w-[1440px] mx-auto px-6">
        {filteredParcels.length === 0 ? (
          <div className="w-full py-20 text-center flex flex-col items-center justify-center fade-in">
            <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#888888] mb-4">
              <Compass size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">
              {lang === 'ar' ? 'لا توجد حيازات زراعية تطابق الفلتر الحالي' : 'No UAE parcels match your current filter'}
            </h3>
            <p className="text-sm text-[#888888] mt-1 max-w-md">
              {lang === 'ar'
                ? 'حاول إعادة ضبط نوع التربة، أو مصدر المياه، أو كلمة البحث لعرض مناطق زراعية معتمدة أخرى.'
                : 'Try resetting your soil, water source, or search keyword to view other verified agricultural zones.'}
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-5 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
            >
              {lang === 'ar' ? 'إعادة ضبط كافة الفلاتر' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParcels.map((parcel) => {
              const isSaved = bookmarkedIds.has(parcel.id);
              const pName = lang === 'ar' ? PARCEL_NAME_AR[parcel.name] || parcel.name : parcel.name;
              const pEmirate = lang === 'ar' ? EMIRATE_LABELS[parcel.emirate]?.ar || parcel.emirate : parcel.emirate;
              const pSub = lang === 'ar' ? SUBREGION_AR[parcel.subRegion] || parcel.subRegion : parcel.subRegion;
              const pSoil = lang === 'ar' ? SOIL_LABELS[parcel.soilProfile]?.ar || parcel.soilProfile : parcel.soilProfile;
              const pWaterM3 = lang === 'ar' ? parcel.annualWaterM3.replace('m³/ha', 'م³/هكتار') : parcel.annualWaterM3;
              const pCropPlan = lang === 'ar' ? CROP_LABELS[parcel.cropPlan]?.ar || parcel.cropPlan : parcel.cropPlan;

              return (
                <div
                  key={parcel.id}
                  onClick={() => handleOpenConsole(parcel)}
                  className="bg-[#F7F7F7] rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer group select-none min-h-[580px] fade-in"
                >
                  {/* Top of Card: Location name & NASA temperature reading */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-[21px] font-bold text-[#111111] tracking-tight group-hover:text-[#34C759] transition-colors leading-snug">
                          {pName}
                        </h3>
                        <span className="text-[12px] text-[#888888] font-medium mt-0.5">
                          {pEmirate} • {pSub}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* NASA Temperature Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-white px-3 py-1.5 rounded-full shadow-xs">
                          <Thermometer size={14} className="text-[#34C759]" />
                          <span className="coord-text">{parcel.tempC}°C</span>
                        </div>

                        {/* Save Bookmark */}
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(parcel.id, e)}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#111111] hover:bg-[#ECECEC] transition-colors shadow-xs"
                          title={lang === 'ar' ? 'حفظ الحيازة' : 'Bookmark parcel'}
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
                      <span className="coord-text">9:41</span>
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
                        <circle cx="50%" cy="50%" r="55" fill="none" stroke="#CBD0D9" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="50%" cy="50%" r="90" fill="none" stroke="#D8DCE3" strokeWidth="1" />
                        <path d="M 20 220 Q 90 120 180 140 T 320 80" fill="none" stroke={parcel.seedPalette.primary} strokeWidth="2.5" opacity="0.6" />
                      </svg>

                      {/* Top Overlay Badge: GPS & Satellite Source */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#111111] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs coord-text">
                          {parcel.lat.toFixed(4)}°N, {parcel.lng.toFixed(4)}°E
                        </span>
                        <span className="text-[10px] font-semibold text-[#1E8236] bg-[#E8F5E9] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
                          <span>{lang === 'ar' ? 'بث ناسا' : 'NASA Stream'}</span>
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
                            {pName}
                          </div>
                          <div className="text-[9px] text-[#888888] font-medium">
                            {pSoil}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Mini Telemetry Info */}
                      <div className="relative z-10 flex items-center justify-between text-[10px] text-[#666666] bg-white/85 backdrop-blur-xs p-2 rounded-xl">
                        <div className="flex items-center gap-1">
                          <Sun size={12} className="text-[#FF9500]" />
                          <span className="coord-text">{parcel.solarVal} {lang === 'ar' ? 'م.ج/يوم' : 'MJ/day'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets size={12} className="text-[#34C759]" />
                          <span className="coord-text">{pWaterM3}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Prompt inside Frame */}
                    <div className="pt-2 text-center text-[11px] font-semibold text-[#111111] flex items-center justify-center gap-1 group-hover:text-[#34C759] transition-colors">
                      <span>{lang === 'ar' ? 'فتح في الخريطة المباشرة' : 'Open in Live Map'}</span>
                      {lang === 'ar' ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                    </div>
                  </div>

                  {/* Bottom of Card: Clean data row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(0,0,0,0.04)]">
                    {/* Water Saved Pill */}
                    <div className="inline-flex items-center gap-1.5 bg-[rgba(52,199,89,0.12)] text-[#1E8236] text-[12px] font-bold px-3 py-1.5 rounded-full">
                      <Droplets size={13} className="text-[#34C759]" />
                      <span>{lang === 'ar' ? `وفر ${parcel.waterSavedNum}% من المياه` : parcel.waterSaved}</span>
                    </div>

                    {/* Crop Plan Pill */}
                    <div className="inline-flex items-center text-[12px] font-semibold text-[#111111] bg-white border border-[rgba(0,0,0,0.08)] px-3 py-1.5 rounded-full shadow-xs">
                      <span>{lang === 'ar' ? `الخطة: ${pCropPlan.split(' ')[0]}` : `Plan: ${parcel.cropPlan.split(' ')[0]}`}</span>
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
        <div className="h-14 px-6 border-b border-[#EEEEEE] flex items-center justify-between bg-white shrink-0 fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('directory')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] bg-[#F1F1F1] hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              {lang === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{lang === 'ar' ? 'الرجوع للمناطق الزراعية' : 'Back to Farm Zones'}</span>
            </button>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#888888] font-semibold uppercase tracking-wider">
                {lang === 'ar' ? 'الحيازة الزراعية المحددة:' : 'Active UAE Parcel:'}
              </span>
              <span className="text-xs font-bold text-[#111111]">
                {lang === 'ar' ? PARCEL_NAME_AR[selectedZone.name] || selectedZone.name : selectedZone.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider mr-1 hidden md:inline">
              {lang === 'ar' ? 'مزارع نموذجية سريعة:' : 'Preset Quick Jumps:'}
            </span>
            {UAE_FARM_PRESETS.map((p) => {
              const active = selectedZone.name === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handlePresetSelect(p)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-[#F1F1F1] text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  {lang === 'ar' ? PARCEL_NAME_AR[p.name] || p.name : p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split Console Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 overflow-hidden">
          {/* Left Column: Interactive Leaflet Map with Floating Search Bar */}
          <div className="lg:col-span-7 h-full min-h-[460px] rounded-[32px] overflow-hidden border border-[#EEEEEE] shadow-xs relative bg-[#F7F7F7]">
            <DynamicMap onSelect={handleZoneSelect} selected={selectedZone} />
          </div>

          {/* Right Column: Structured Telemetry & Crop Rotations Scroll */}
          <div className="lg:col-span-5 h-full relative">
            {/* Full Right-Panel GPS Parcel Calculation Overlay with LatticeLoader */}
            {isCalculatingGps && (
              <div
                className="absolute inset-0 z-30 rounded-[28px] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border shadow-md overflow-hidden bg-[#F7F7F7] text-[#111111] border-[#EEEEEE]"
              >
                {/* Subtle Ambient Radial Glow */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-30 bg-[radial-gradient(circle_at_center,rgba(52,199,89,0.25)_0%,transparent_70%)]"
                />

                <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-4">
                  {/* Status Pill Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-2xs bg-white text-[#111111] border border-[#E5E5E7]"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        loaderStatus === 'done' ? 'bg-[#34C759]' : 'bg-[#34C759] animate-ping'
                      }`}
                    />
                    <span className="font-mono text-[11px]">
                      {lang === 'ar' ? 'تثبيت إحداثيات GPS' : 'GPS PARCEL LOCK'} •{' '}
                      <span className="coord-text">{calculatingCoords.lat.toFixed(4)}°N, {calculatingCoords.lng.toFixed(4)}°E</span>
                    </span>
                  </div>

                  {/* Headline & Subhead */}
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-[#111111] transition-colors duration-300"
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {loaderStatus === 'done'
                        ? (lang === 'ar' ? 'تمت مزامنة البيانات' : 'Telemetry Synchronized')
                        : (lang === 'ar' ? 'جاري حساب إحداثيات الحقل' : 'Calculating GPS Parcel')}
                    </h2>
                    <p className="text-xs sm:text-sm max-w-xs text-[#666666] transition-colors duration-300 leading-relaxed">
                      {loaderStatus === 'done'
                        ? (lang === 'ar' ? 'تمت مطابقة نطاقات سنتينل-2 وشبكة ناسا باور بنجاح.' : 'Sentinel-2 multispectral bands & NASA POWER grid resolved.')
                        : (lang === 'ar' ? 'جاري استعلام أطياف سنتينل-2 وتصنيفات التربة الزراعية...' : 'Querying Sentinel-2 multispectral surface bands & soil classifications...')}
                    </p>
                  </div>

                  {/* LatticeLoader Component from React Bits */}
                  <div className="w-full rounded-2xl p-4 shadow-xs transition-all duration-300 border flex items-center justify-center bg-white border-[#E5E5E7] text-[#111111]">
                    <LatticeLoader
                      status={loaderStatus === 'done' ? 'done' : 'working'}
                      label={lang === 'ar' ? 'جاري التحليل' : 'Analyzing'}
                      doneLabel={lang === 'ar' ? 'اكتمل في' : 'Done in'}
                      errorLabel={lang === 'ar' ? 'اكتمل في' : 'Done in'}
                      pattern="arrow"
                      grid={3}
                      shape="round"
                      doneColor="#22c55e"
                      errorColor="#22c55e"
                      cellSize={6}
                      gap={2}
                      fontSize={14}
                      step={90}
                      idleOpacity={0.14}
                      glow={false}
                      glowColor="#000000"
                      showTimer
                      color="#000000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Structured Telemetry & Crop Rotations Scroll */}
            <div
              className={`h-full overflow-y-auto space-y-4 pr-1 console-scroll transition-opacity duration-200 ${
                isCalculatingGps ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
            {selectedZone.isFarmable === false ? (
              <div className="space-y-4 fade-in">
                {selectedZone.validationStatus === 'outside_uae' ? (
                  /* 1. Outside UAE Territory Alert Banner */
                  <div className="bg-[#FFF2F2] border border-[#FF3B30]/25 rounded-[24px] p-6 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-semibold px-3 py-1 rounded-full">
                        <AlertTriangle size={13} />
                        <span>{t.blocked.outsideTitle.toUpperCase()}</span>
                      </span>
                      <span className="text-xs font-mono text-[#888888] bg-white px-3 py-1 rounded-full shadow-2xs coord-text">
                        {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#111111] leading-tight">{t.blocked.outsideTitle}</h2>

                    <div className="p-4 bg-white rounded-2xl border border-[#FF3B30]/15 text-sm text-[#1C1C1E] leading-relaxed">
                      <strong className="text-[#FF3B30]">{t.blocked.outsideTitle}:</strong> {t.blocked.outsideBanner}
                    </div>

                    <p className="text-xs text-[#6E6E73] leading-relaxed">
                      {t.blocked.outsideDesc}
                    </p>

                    <div className="pt-2 border-t border-[#FF3B30]/10">
                      <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-2">
                        {t.blocked.jumpPresets}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {UAE_FARM_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className="px-3 py-1.5 bg-white hover:bg-[#F2F2F7] border border-gray-200 text-[#111111] text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                          >
                            {lang === 'ar' ? PARCEL_NAME_AR[preset.name] || preset.name : preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. Non-Arable Zone Blocked Warning Card */
                  <div className="bg-white border border-[#FF9500]/30 rounded-[24px] p-6 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-[#FF9500]/10 text-[#D97706] text-xs font-semibold px-3 py-1 rounded-full">
                        <AlertTriangle size={13} />
                        <span>{t.blocked.nonArableTitle.toUpperCase()}</span>
                      </span>
                      <span className="text-xs font-mono text-[#888888] bg-[#F5F5F7] px-3 py-1 rounded-full coord-text">
                        {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#111111] leading-tight">{selectedZone.name}</h2>

                    <div className="p-4 bg-[#FFFBEB] rounded-2xl border border-[#FF9500]/25 text-sm text-[#92400E] leading-relaxed font-medium">
                      {lang === 'ar'
                        ? `تم حظر المنطقة غير الصالحة للزراعة: مصنفة كبنية تحتية أو منطقة عمرانية (${selectedZone.blockedPlaceName || selectedZone.name}). يرجى النقر على أي مزرعة أو واحة أو أرض صحراوية مفتوحة للتحليل.`
                        : `Non-Arable Zone Blocked: ${selectedZone.blockedPlaceName || selectedZone.name} is classified as urban, industrial, or transport infrastructure. Click any farm, oasis, or open desert plot to analyze.`}
                    </div>

                    <p className="text-xs text-[#6E6E73] leading-relaxed">
                      {t.blocked.nonArableDesc}
                    </p>

                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-2">
                        {t.blocked.jumpPresets}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {UAE_FARM_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className="px-3 py-1.5 bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#111111] text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer"
                          >
                            {lang === 'ar' ? PARCEL_NAME_AR[preset.name] || preset.name : preset.name}
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
                  <h3 className="text-sm font-bold text-[#111111]">{t.blocked.pausedTitle}</h3>
                  <p className="text-xs text-[#6E6E73] max-w-sm mx-auto leading-relaxed">
                    {t.blocked.pausedDesc}
                  </p>
                </div>
              </div>
            ) : (
              <>
            {/* Selected Location Header Card */}
            {(() => {
              const activeZoneName = lang === 'ar' ? PARCEL_NAME_AR[selectedZone.name] || selectedZone.name : selectedZone.name;
              let activeEmirateStr = selectedZone.emirate || '';
              if (lang === 'ar' && selectedZone.emirate) {
                const parts = selectedZone.emirate.split('•').map((s) => s.trim());
                if (parts.length === 2) {
                  const em = EMIRATE_LABELS[parts[0]]?.ar || parts[0];
                  const sub = SUBREGION_AR[parts[1]] || parts[1];
                  activeEmirateStr = `${em} • ${sub}`;
                } else {
                  activeEmirateStr = EMIRATE_LABELS[selectedZone.emirate]?.ar || selectedZone.emirate;
                }
              }
              const activeSoilSummary = lang === 'ar' ? SOIL_LABELS[selectedZone.soilSummary]?.ar || selectedZone.soilSummary : selectedZone.soilSummary;
              const activeAquiferNote = lang === 'ar' ? WATER_LABELS[selectedZone.aquiferNote]?.ar || selectedZone.aquiferNote : selectedZone.aquiferNote;

              return (
                <div className="bg-[#F7F7F7] rounded-[24px] p-6 space-y-4 fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-[rgba(52,199,89,0.12)] text-[#1E8236] text-xs font-semibold px-3 py-1 rounded-full">
                        <MapPin size={12} />
                        <span>{selectedZone.detectedType ? (lang === 'ar' ? `قطعة • ${selectedZone.detectedType}` : `PARCEL • ${selectedZone.detectedType.toUpperCase()}`) : (lang === 'ar' ? 'أرض زراعية خصبة' : 'ARABLE FARMLAND')}</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#888888] bg-white px-3 py-1 rounded-full shadow-2xs coord-text">
                      {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#111111] leading-tight">
                    {activeZoneName} {activeEmirateStr ? `— ${activeEmirateStr}` : ''}
                  </h2>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                      <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider flex items-center">
                        {t.mapConsole.soilProfile}
                        <InfoTooltip text={t.tooltips.soilProfile} />
                      </span>
                      <span className="text-xs text-[#111111] font-semibold leading-snug">
                        {activeSoilSummary}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                      <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider flex items-center">
                        {t.mapConsole.aquiferWater}
                        <InfoTooltip text={t.tooltips.aquiferWater} />
                      </span>
                      <span className="text-xs text-[#111111] font-semibold leading-snug">
                        {activeAquiferNote}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4 Accessible Tabs Switcher */}
            <div className="bg-[#F7F7F7] p-1.5 rounded-2xl flex items-center gap-1 border border-[#EEEEEE] fade-in">
                  <button
                    type="button"
                    onClick={() => setConsoleTab("climate")}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === "climate"
                        ? "bg-white text-[#111111] shadow-xs"
                        : "text-[#888888] hover:text-[#111111]"
                    }`}
                  >
                    <Sun size={13} className={consoleTab === "climate" ? "text-[#FF9500]" : ""} />
                    <span>{t.mapConsole.tabs.climate}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab("nutrients")}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === "nutrients"
                        ? "bg-white text-[#111111] shadow-xs"
                        : "text-[#888888] hover:text-[#111111]"
                    }`}
                  >
                    <FlaskConical size={13} className={consoleTab === "nutrients" ? "text-[#34C759]" : ""} />
                    <span>{t.mapConsole.tabs.nutrients}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab("strategies")}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === "strategies"
                        ? "bg-white text-[#111111] shadow-xs"
                        : "text-[#888888] hover:text-[#111111]"
                    }`}
                  >
                    <Sprout size={13} className={consoleTab === "strategies" ? "text-[#1E8236]" : ""} />
                    <span>{t.mapConsole.tabs.rotations}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab("priorities")}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === "priorities"
                        ? "bg-white text-[#111111] shadow-xs"
                        : "text-[#888888] hover:text-[#111111]"
                    }`}
                  >
                    <Target size={13} className={consoleTab === "priorities" ? "text-[#0A84FF]" : ""} />
                    <span>{t.mapConsole.tabs.priorities}</span>
                  </button>

                  <div className="pr-1">
                    <InfoTooltip text={t.tooltips.rotationsBalance} />
                  </div>
                </div>

                {/* TAB 1: CLIMATE & RAINFALL */}
                {consoleTab === "climate" && (
                  <div key={`${consoleTab}-${lang}`} className="tab-transition space-y-4">
                    {/* NASA POWER Live Telemetry */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#888888]">
                          <span className="flex items-center">
                            {t.mapConsole.metrics.airTemp}
                            <InfoTooltip text={t.tooltips.airTemp} />
                          </span>
                          <Thermometer size={16} className="text-[#34C759]" />
                        </div>
                        <div className="text-2xl font-bold text-[#111111] my-2 coord-text">
                          {loadingNasa ? "..." : `${nasaTemp}°C`}
                        </div>
                        <span className="text-[11px] text-[#888888]">
                          {lang === 'ar' ? 'شبكة ناسا لانغلي POWER على ارتفاع 2م' : 'NASA Langley POWER 2m Grid'}
                        </span>
                      </div>

                      <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#888888]">
                          <span className="flex items-center">
                            {t.mapConsole.metrics.solarFlux}
                            <InfoTooltip text={t.tooltips.solarFlux} />
                          </span>
                          <Sun size={16} className="text-[#FF9500]" />
                        </div>
                        <div className="text-2xl font-bold text-[#111111] my-2 coord-text">
                          {loadingNasa ? "..." : `${nasaSolar} ${lang === 'ar' ? 'م.ج' : 'MJ'}`}
                        </div>
                        <span className="text-[11px] text-[#888888]">
                          {lang === 'ar' ? 'التدفق الشمسي الإجمالي اليومي' : 'Daily All-Sky Downward Flux'}
                        </span>
                      </div>
                    </div>

                    {/* NCM / UAE.Stat Monthly Rainfall Distribution Chart */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CloudRain size={16} className="text-[#0A84FF]" />
                          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center">
                            {t.mapConsole.metrics.rainfallPatterns}
                            <InfoTooltip text={t.tooltips.rainfallPatterns} />
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#0A84FF] bg-white px-2.5 py-1 rounded-full shadow-2xs coord-text">
                          {selectedZone.climate?.annualRainfallMm ?? 92} {lang === 'ar' ? 'مم / سنة' : 'mm / yr'}
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#888888]">
                            {t.mapConsole.metrics.wetSeason} <strong className="text-[#111111]">{lang === 'ar' ? WET_SEASON_AR[selectedZone.climate?.wetSeasonMonths || 'Dec – Mar'] || selectedZone.climate?.wetSeasonMonths || 'ديسمبر – مارس' : selectedZone.climate?.wetSeasonMonths || 'Dec – Mar'}</strong>
                          </span>
                          <span className="text-[#888888] flex items-center">
                            {t.mapConsole.metrics.droughtIndex} <strong className="text-[#FF3B30] ml-1 mr-0.5">{lang === 'ar' ? DROUGHT_RISK_AR[selectedZone.climate?.droughtRiskIndex || 'Severe'] || selectedZone.climate?.droughtRiskIndex || 'حرج' : selectedZone.climate?.droughtRiskIndex || 'Severe'}</strong>
                            <InfoTooltip text={t.tooltips.droughtIndex} />
                          </span>
                        </div>

                        {/* Interactive 12-Month SVG Column Chart */}
                        <div className="h-28 w-full flex items-end justify-between gap-1.5 pt-3 px-1">
                          {(selectedZone.climate?.monthlyRainfallMm || [18, 24, 14, 7, 2, 0.2, 0.1, 0.4, 0.3, 3, 9, 19]).map((mm, idx) => {
                            const maxRain = 28;
                            const heightPercent = Math.max(8, Math.min(100, (mm / maxRain) * 100));
                            const months = lang === 'ar' ? MONTHS_AR : MONTHS_EN;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <span className="absolute -top-7 text-[10px] font-mono font-bold bg-[#111111] text-white px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 coord-text">
                                  {months[idx]}: {mm} {lang === 'ar' ? 'مم' : 'mm'}
                                </span>
                                <div className="w-full bg-[#F1F1F1] rounded-t-sm flex items-end h-18">
                                  <div
                                    className={`w-full rounded-t-sm transition-all duration-300 ${
                                      mm > 12 ? "bg-[#0A84FF]" : mm > 3 ? "bg-[#34C759]" : "bg-[#D1D1D6]"
                                    }`}
                                    style={{ height: `${heightPercent}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-mono text-[#888888]">{months[idx][0]}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[11px] text-[#888888] pt-1 border-t border-gray-100">
                          <span>{lang === 'ar' ? 'نافذة الاستمطار الشتوي (ديسمبر–فبراير)' : 'Winter Cloud Seeding Window (Dec–Feb)'}</span>
                          <span className="text-[#FF3B30]">{lang === 'ar' ? 'جفاف الصيف (0 مم / 48°C)' : 'Summer Aridity (0 mm / 48°C)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* NASA Satellite Observations: SMAP + ECOSTRESS + CO2 */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-3">
                      <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                        <Wind size={15} className="text-[#34C759]" />
                        <span>{lang === 'ar' ? 'أرصاد ناسا الفضائية وشبكة الكربون' : 'NASA Earth Observations & Carbon Grid'}</span>
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                          <span className="text-[11px] text-[#888888] font-semibold uppercase flex items-center">
                            {t.mapConsole.metrics.smapMoisture}
                            <InfoTooltip text={t.tooltips.smapMoisture} />
                          </span>
                          <span className="text-lg font-bold text-[#111111] coord-text">
                            {selectedZone.climate?.smapSoilMoisturePercent ?? 8.5}% <span className="text-xs font-normal text-[#888888]">{lang === 'ar' ? 'حجمي' : 'volumetric'}</span>
                          </span>
                          <span className="text-[10px] text-[#888888]">{lang === 'ar' ? 'مقياس إشعاعي سطحي 0-5 سم' : 'Surface 0–5cm passive radiometer'}</span>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                          <span className="text-[11px] text-[#888888] font-semibold uppercase flex items-center">
                            {t.mapConsole.metrics.ecostressEt}
                            <InfoTooltip text={t.tooltips.ecostressEt} />
                          </span>
                          <span className="text-lg font-bold text-[#111111] coord-text">
                            {selectedZone.climate?.evapotranspirationMmYear ?? 2200} <span className="text-xs font-normal text-[#888888]">{lang === 'ar' ? 'مم/سنة' : 'mm/yr'}</span>
                          </span>
                          <span className="text-[10px] text-[#888888]">{lang === 'ar' ? 'عجز تبخر جوي مرتفع' : 'High atmospheric evaporative deficit'}</span>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                          <span className="text-[11px] text-[#888888] font-semibold uppercase flex items-center">
                            {t.mapConsole.metrics.co2}
                            <InfoTooltip text={t.tooltips.co2} />
                          </span>
                          <span className="text-lg font-bold text-[#111111] coord-text">
                            {selectedZone.nutrients?.co2AtmosphericPpm ?? 421.4} <span className="text-xs font-normal text-[#888888]">{lang === 'ar' ? 'جزء بالمليون' : 'ppm'}</span>
                          </span>
                          <span className="text-[10px] text-[#888888]">{lang === 'ar' ? 'مراقبة الخلفية الجوية العالمية' : 'Global background monitoring'}</span>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-[rgba(0,0,0,0.04)] flex flex-col gap-1">
                          <span className="text-[11px] text-[#888888] font-semibold uppercase flex items-center">
                            {t.mapConsole.metrics.carbonSink}
                            <InfoTooltip text={t.tooltips.carbonSink} />
                          </span>
                          <span className="text-lg font-bold text-[#34C759] coord-text">
                            +{selectedZone.nutrients?.carbonSequestrationPotential ?? 2.4} <span className="text-xs font-normal text-[#888888]">{lang === 'ar' ? 'طن CO₂/هكتار/سنة' : 't CO₂/ha/yr'}</span>
                          </span>
                          <span className="text-[10px] text-[#888888]">{lang === 'ar' ? 'مع الزراعة الحرجية متعددة الطبقات' : 'With multi-tier agroforestry/halophyte'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SOIL NUTRIENTS & CHEMISTRY */}
                {consoleTab === "nutrients" && (
                  <div key={`${consoleTab}-${lang}`} className="tab-transition space-y-4">
                    {/* Primary Macronutrients N-P-K */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                          <FlaskConical size={15} className="text-[#34C759]" />
                          <span>{t.mapConsole.metrics.macronutrients}</span>
                          <InfoTooltip text={t.tooltips.rotationsBalance} />
                        </span>
                        <span className="text-xs font-mono text-[#888888] bg-white px-2 py-0.5 rounded-full">
                          {lang === 'ar' ? 'ملغ / كغ' : 'mg / kg'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-white p-3 rounded-2xl border border-[rgba(0,0,0,0.04)] text-center flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#888888]">
                            {lang === 'ar' ? 'النيتروجين (N)' : 'NITROGEN (N)'}
                          </span>
                          <div className="text-xl font-bold text-[#111111] my-1 coord-text">
                            {selectedZone.nutrients?.nitrogen.value ?? 16}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              selectedZone.nutrients?.nitrogen.rating === "Deficient"
                                ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                                : selectedZone.nutrients?.nitrogen.rating === "Low"
                                ? "bg-[#FF9500]/10 text-[#FF9500]"
                                : "bg-[#34C759]/10 text-[#1E8236]"
                            }`}
                          >
                            {lang === 'ar' ? RATING_AR[selectedZone.nutrients?.nitrogen.rating || 'Low'] || selectedZone.nutrients?.nitrogen.rating : selectedZone.nutrients?.nitrogen.rating ?? "Low"}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-[rgba(0,0,0,0.04)] text-center flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#888888]">
                            {lang === 'ar' ? 'الفوسفور (P)' : 'PHOSPHORUS (P)'}
                          </span>
                          <div className="text-xl font-bold text-[#111111] my-1 coord-text">
                            {selectedZone.nutrients?.phosphorus.value ?? 14}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              selectedZone.nutrients?.phosphorus.rating === "Deficient"
                                ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                                : selectedZone.nutrients?.phosphorus.rating === "Low"
                                ? "bg-[#FF9500]/10 text-[#FF9500]"
                                : "bg-[#34C759]/10 text-[#1E8236]"
                            }`}
                          >
                            {lang === 'ar' ? RATING_AR[selectedZone.nutrients?.phosphorus.rating || 'Low'] || selectedZone.nutrients?.phosphorus.rating : selectedZone.nutrients?.phosphorus.rating ?? "Low"}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-[rgba(0,0,0,0.04)] text-center flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-[#888888]">
                            {lang === 'ar' ? 'البوتاسيوم (K)' : 'POTASSIUM (K)'}
                          </span>
                          <div className="text-xl font-bold text-[#111111] my-1 coord-text">
                            {selectedZone.nutrients?.potassium.value ?? 210}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              selectedZone.nutrients?.potassium.rating === "Optimal"
                                ? "bg-[#34C759]/10 text-[#1E8236]"
                                : "bg-[#FF9500]/10 text-[#FF9500]"
                            }`}
                          >
                            {lang === 'ar' ? RATING_AR[selectedZone.nutrients?.potassium.rating || 'Optimal'] || selectedZone.nutrients?.potassium.rating : selectedZone.nutrients?.potassium.rating ?? "Optimal"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] text-xs text-[#666666] leading-relaxed">
                        {lang === 'ar' ? (
                          <>
                            <strong className="text-[#111111]">إرشادات المستوى المستهدف:</strong> نسبة كربونات الكالسيوم العالية (CaCO₃ &gt; 20%) تحد من امتصاص الفوسفور الذائب؛ وتساعد البقوليات المصاحبة أو سماد الفحم الحيوي في تحرير الفوسفور لامتصاص الجذور.
                          </>
                        ) : (
                          <>
                            <strong className="text-[#111111]">Target Guidance:</strong> {selectedZone.nutrients?.nitrogen.target} High calcium carbonate (CaCO₃ &gt; 20%) binds soluble phosphorus; companion legumes or biochar compost release active plant uptake.
                          </>
                        )}
                      </div>
                    </div>

                    {/* Secondary & Micronutrients Table */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-3">
                      <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={15} className="text-[#0A84FF]" />
                        <span>{t.mapConsole.metrics.secondaryMicro}</span>
                      </span>

                      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#F9F9FB] border-b border-gray-100 text-[10px] font-bold text-[#888888] uppercase">
                            <tr>
                              <th className="py-2 px-3.5">{lang === 'ar' ? 'العنصر' : 'Element'}</th>
                              <th className="py-2 px-3">{lang === 'ar' ? 'التركيز (ملغ/كغ)' : 'Level (mg/kg)'}</th>
                              <th className="py-2 px-3">{lang === 'ar' ? 'التقييم' : 'Rating'}</th>
                              <th className="py-2 px-3">{lang === 'ar' ? 'الأثر الزراعي' : 'Agronomic Implication'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {[
                              { key: 'Calcium (Ca)', el: selectedZone.nutrients?.calcium, defaultVal: 4600, defaultRating: 'High', color: 'text-[#FF9500]' },
                              { key: 'Magnesium (Mg)', el: selectedZone.nutrients?.magnesium, defaultVal: 430, defaultRating: 'Optimal', color: 'text-[#1E8236]' },
                              { key: 'Sulfur (S)', el: selectedZone.nutrients?.sulfur, defaultVal: 85, defaultRating: 'Optimal', color: 'text-[#1E8236]' },
                              { key: 'Iron (Fe)', el: selectedZone.nutrients?.iron, defaultVal: 2.6, defaultRating: 'Low', color: 'text-[#FF3B30]' },
                              { key: 'Zinc (Zn)', el: selectedZone.nutrients?.zinc, defaultVal: 0.65, defaultRating: 'Deficient', color: 'text-[#FF3B30]' },
                              { key: 'Boron (B)', el: selectedZone.nutrients?.boron, defaultVal: 1.3, defaultRating: 'Safe', color: 'text-[#1E8236]' },
                            ].map((row) => {
                              const elName = lang === 'ar' ? ELEMENT_NAMES_AR[row.key] || row.key : row.key;
                              const rawRating = row.el?.rating ?? row.defaultRating;
                              const ratingLabel = lang === 'ar' ? RATING_AR[rawRating] || rawRating : rawRating;
                              const rawNotes = row.el?.notes || '';
                              const notesLabel = lang === 'ar' ? ELEMENT_NOTES_AR[rawNotes] || rawNotes : rawNotes;

                              return (
                                <tr key={row.key}>
                                  <td className="py-2 px-3.5 font-bold">{elName}</td>
                                  <td className="py-2 px-3 font-mono coord-text">{row.el?.value ?? row.defaultVal}</td>
                                  <td className={`py-2 px-3 ${row.color} font-semibold`}>{ratingLabel}</td>
                                  <td className="py-2 px-3 text-[#666666]">{notesLabel}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Soil Health, Salinity & Biochar Solution */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-3">
                      <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                        {t.mapConsole.metrics.soilPhysical}
                      </span>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] text-center">
                          <span className="text-[10px] text-[#888888] font-bold">
                            {t.mapConsole.metrics.salinity}
                          </span>
                          <div className="text-lg font-bold text-[#111111] mt-0.5 coord-text">
                            {selectedZone.nutrients?.salinityEC ?? 5.2} <span className="text-[10px] font-normal">{lang === 'ar' ? 'ديسيسيمنز/م' : 'dS/m'}</span>
                          </div>
                          <span className="text-[10px] text-[#FF9500] font-semibold">
                            {lang === 'ar' ? RATING_AR[selectedZone.nutrients?.salinityClass || 'Moderately Saline'] || selectedZone.nutrients?.salinityClass : selectedZone.nutrients?.salinityClass || "Moderately Saline"}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] text-center">
                          <span className="text-[10px] text-[#888888] font-bold">
                            {t.mapConsole.metrics.soilPh}
                          </span>
                          <div className="text-lg font-bold text-[#111111] mt-0.5 coord-text">
                            {selectedZone.nutrients?.ph ?? 7.95}
                          </div>
                          <span className="text-[10px] text-[#888888] font-semibold">
                            {lang === 'ar' ? 'قلوي جيري' : 'Alkaline Calcaric'}
                          </span>
                        </div>

                        <div className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] text-center">
                          <span className="text-[10px] text-[#888888] font-bold">
                            {t.mapConsole.metrics.organicCarbon}
                          </span>
                          <div className="text-lg font-bold text-[#111111] mt-0.5 coord-text">
                            {selectedZone.nutrients?.soilOrganicCarbon ?? 0.35}%
                          </div>
                          <span className="text-[10px] text-[#34C759] font-semibold">
                            {lang === 'ar' ? `المادة العضوية: ${selectedZone.nutrients?.organicMatter ?? 0.6}%` : `OM: ${selectedZone.nutrients?.organicMatter ?? 0.6}%`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white rounded-2xl border border-[#34C759]/20 flex items-start gap-2.5">
                        <ShieldCheck size={18} className="text-[#34C759] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#444444] leading-relaxed">
                          {lang === 'ar' ? (
                            <>
                              <strong className="text-[#111111]">بروتوكول استصلاح التربة (ICBA):</strong> تتعرض الأراضي الرملية الصحراوية لغسيل مكثف للعناصر الغذائية. يؤدي استخدام <strong>5–10 أطنان/هكتار من الفحم الحيوي (البيوشار)</strong> المنتج من مخلفات تقليم النخيل المحلية إلى رفع قدرة التربة على الاحتفاظ بالمياه بنسبة <strong>38%</strong> وموازنة قلوية التربة وتيسير امتصاص الزنك والحديد.
                            </>
                          ) : (
                            <>
                              <strong className="text-[#111111]">ICBA Soil Reclamation Protocol:</strong> UAE sandy desert soils (Calcaric Arenosols) experience intense nutrient leaching. Applying <strong>5–10 tonnes/ha biochar</strong> produced from local date palm pruning waste increases soil water-holding capacity by <strong>38%</strong>, balances alkaline pH, and binds zinc and iron into plant-accessible chelates.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: 3-YEAR ROTATION STRATEGIES (COMPARATIVE ANALYSIS) */}
                {consoleTab === "strategies" && (
                  <div key={`${consoleTab}-${lang}`} className="tab-transition space-y-4">
                    {/* Strategy Switcher Pills */}
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                          <span>{t.mapConsole.metrics.compareProtocols}</span>
                          <InfoTooltip text={t.tooltips.rotationsBalance} />
                        </span>
                        <div className="inline-flex bg-white p-1 rounded-full text-xs font-semibold shadow-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedStrategyId("baseline")}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                              selectedStrategyId === "baseline"
                                ? "bg-[#111111] text-white"
                                : "text-[#888888] hover:text-[#111111]"
                            }`}
                          >
                            {lang === 'ar' ? 'الوضع المرجعي' : 'Baseline'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStrategyId("oasis")}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                              selectedStrategyId === "oasis"
                                ? "bg-[#111111] text-white"
                                : "text-[#888888] hover:text-[#111111]"
                            }`}
                          >
                            {lang === 'ar' ? 'مظلة الواحة' : 'Oasis Canopy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStrategyId("saline")}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                              selectedStrategyId === "saline"
                                ? "bg-[#111111] text-white"
                                : "text-[#888888] hover:text-[#111111]"
                            }`}
                          >
                            {lang === 'ar' ? 'الكينوا الملحية' : 'Biosaline Quinoa'}
                          </button>
                        </div>
                      </div>

                      {/* Active Strategy Card */}
                      {(() => {
                        const strat =
                          selectedZone.strategies?.find((s) => s.id === selectedStrategyId) ||
                          selectedZone.strategies?.[1] ||
                          selectedZone.strategies?.[0];
                        if (!strat) return null;

                        const tr = lang === 'ar' ? STRATEGY_TRANSLATIONS[strat.id] : null;
                        const sName = tr?.name || strat.name;
                        const sTagline = tr?.tagline || strat.tagline;
                        const sWhy = tr?.whySuggested || strat.whySuggested;
                        const sEvidence = tr?.icbaEvidence || strat.icbaEvidence;
                        const sBenefits = tr?.benefits || strat.benefits;
                        const sRisks = tr?.farmerRisks || strat.farmerRisks;
                        const sTimeline = tr?.timeline || strat.timeline;

                        return (
                          <div key={`${selectedStrategyId}-${lang}`} className="tab-transition space-y-4">
                            <div>
                              <h3 className="text-base font-bold text-[#111111]">{sName}</h3>
                              <p className="text-xs text-[#666666] mt-0.5">{sTagline}</p>
                            </div>

                            {/* Water Savings Comparison Bar */}
                            <div className="bg-white p-4 rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-[#111111]">
                                  {lang === 'ar' ? `${strat.waterUsageM3Ha.toLocaleString()} م³/هكتار استهلاك سنوي` : `${strat.waterUsageM3Ha.toLocaleString()} m³/ha Annual Demand`}
                                </span>
                                <span className={strat.waterSavingsPercent > 0 ? "text-[#1E8236]" : "text-[#FF3B30]"}>
                                  {strat.waterSavingsPercent > 0
                                    ? (lang === 'ar' ? `يوفر ${strat.waterSavingsPercent}% من المياه` : `Saves ${strat.waterSavingsPercent}% Water`)
                                    : (lang === 'ar' ? 'الوضع المرجعي (0% توفير)' : 'Baseline (0% Saved)')}
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-[#EEEEEE] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    strat.waterSavingsPercent > 70 ? "bg-[#34C759]" : strat.waterSavingsPercent > 40 ? "bg-[#0A84FF]" : "bg-[#FF3B30]"
                                  }`}
                                  style={{ width: `${Math.max(12, (strat.waterUsageM3Ha / 22000) * 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-[#888888]">
                                <span>
                                  {lang === 'ar' ? 'العائد المتوقع:' : 'Projected Margin:'}{' '}
                                  <strong className="text-[#111111]">
                                    {strat.profitPerHaAed.toLocaleString()} {lang === 'ar' ? 'درهم / هكتار' : 'AED / ha'}
                                  </strong>
                                </span>
                                <span>
                                  {lang === 'ar' ? 'خفض الأسمدة الكيميائية:' : 'Chemical Fertilizer Cut:'}{' '}
                                  <strong className="text-[#1E8236]">-{strat.fertilizerReductionPercent}%</strong>
                                </span>
                              </div>
                            </div>

                            {/* Rationale & ICBA Research Evidence */}
                            <div className="bg-white p-4 rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-2.5">
                              <div className="flex items-start gap-2">
                                <Info size={16} className="text-[#0A84FF] shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed">
                                  <strong className="text-[#111111]">
                                    {lang === 'ar' ? 'المبرر الزراعي:' : 'Agronomic Rationale:'}
                                  </strong>{' '}
                                  {sWhy}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                                <CheckCircle2 size={16} className="text-[#34C759] shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed text-[#444444]">
                                  <strong className="text-[#111111]">
                                    {lang === 'ar' ? 'أدلة أبحاث ICBA المنشورة:' : 'ICBA Published Evidence:'}
                                  </strong>{' '}
                                  {sEvidence}
                                </div>
                              </div>
                            </div>

                            {/* Benefits & Risk Checklist */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="p-3.5 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-1.5">
                                <span className="text-[11px] font-bold text-[#1E8236] uppercase flex items-center gap-1">
                                  <CheckCircle2 size={13} />
                                  <span>{lang === 'ar' ? 'المزايا الجوهرية' : 'Core Benefits'}</span>
                                </span>
                                <ul className="text-xs text-[#555555] space-y-1 list-disc list-inside">
                                  {sBenefits.map((b, i) => (
                                    <li key={i} className="leading-snug">{b}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-3.5 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] space-y-1.5">
                                <span className="text-[11px] font-bold text-[#FF9500] uppercase flex items-center gap-1">
                                  <AlertTriangle size={13} />
                                  <span>{lang === 'ar' ? 'المخاطر والتحديات المحلية' : 'Gaps & Local Risks'}</span>
                                </span>
                                <ul className="text-xs text-[#666666] space-y-1 list-disc list-inside">
                                  {sRisks.map((r, i) => (
                                    <li key={i} className="leading-snug">{r}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* 3-Year Step Timeline */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                                {lang === 'ar' ? 'مراحل التنفيذ الزراعي على مدار 3 سنوات' : '3-Year Crop Execution Steps'}
                              </span>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                {sTimeline.map((step, i) => (
                                  <div key={i} className="p-3 bg-white rounded-2xl border border-[rgba(0,0,0,0.04)]">
                                    <div className="text-[10px] text-[#1E8236] font-bold">{step.year}</div>
                                    <div className="text-xs font-bold text-[#111111] mt-0.5">{step.crop}</div>
                                    <div className="text-[10px] text-[#888888] mt-0.5 leading-tight">{step.role}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAB 4: FARMER PRIORITIES */}
                {consoleTab === "priorities" && (
                  <div key={`${consoleTab}-${lang}`} className="tab-transition space-y-4">
                    <div className="bg-[#F7F7F7] rounded-[24px] p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                            <Target size={15} className="text-[#0A84FF]" />
                            <span>{t.mapConsole.metrics.farmerPriorityOpt}</span>
                            <InfoTooltip text={t.tooltips.rotationsBalance} />
                          </span>
                          <span className="text-[11px] font-semibold text-[#1E8236] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                            {lang === 'ar' ? 'مطابق الأهداف التفاعلي' : 'Interactive Goal Matcher'}
                          </span>
                        </div>
                        <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                          {lang === 'ar'
                            ? 'ما هو الهدف الأهم لعمليتك الزراعية؟ اختر إحدى الأولويات أدناه لإعادة حساب الخطة الدورية المثلى.'
                            : 'What matters most to your farming operation? Select a priority below to recalculate the optimal rotation protocol.'}
                        </p>
                      </div>

                      {/* 5 Priority Goal Selectors */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "saveWater", label: "Save Water", icon: Droplets, color: "text-[#0A84FF]" },
                          { id: "maximizeProfit", label: "Maximize Profit", icon: TrendingUp, color: "text-[#34C759]" },
                          { id: "rebuildSoil", label: "Rebuild Soil", icon: Sprout, color: "text-[#8E8E93]" },
                          { id: "lowerRisk", label: "Lower Risk", icon: ShieldCheck, color: "text-[#FF9500]" },
                          { id: "useLessFertilizer", label: "Less Fertilizer", icon: FlaskConical, color: "text-[#5856D6]" },
                        ].map((goal) => {
                          const active = farmerGoal === goal.id;
                          const IconComp = goal.icon;
                          const goalLabel = lang === 'ar' ? GOAL_TRANSLATIONS[goal.id]?.label || goal.label : goal.label;
                          return (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() => setFarmerGoal(goal.id as any)}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                active
                                  ? "bg-white border-[#111111] shadow-xs ring-1 ring-[#111111]"
                                  : "bg-white/70 border-gray-200 hover:bg-white text-[#666666]"
                              }`}
                            >
                              <IconComp size={16} className={active ? goal.color : "text-gray-400"} />
                              <span className="text-xs font-bold text-[#111111]">{goalLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Top Match Recommendation Box */}
                      {(() => {
                        const recStrat =
                          farmerGoal === "saveWater"
                            ? selectedZone.strategies?.[2] || selectedZone.strategies?.[1]
                            : farmerGoal === "maximizeProfit" || farmerGoal === "rebuildSoil"
                            ? selectedZone.strategies?.[1]
                            : selectedZone.strategies?.[2] || selectedZone.strategies?.[1];

                        const matchScore =
                          farmerGoal === "saveWater"
                            ? 97
                            : farmerGoal === "maximizeProfit"
                            ? 95
                            : farmerGoal === "rebuildSoil"
                            ? 93
                            : farmerGoal === "lowerRisk"
                            ? 96
                            : 94;

                        const recStratName = lang === 'ar' ? GOAL_TRANSLATIONS[farmerGoal]?.matchedStratAr || recStrat?.name : recStrat?.name;
                        const recStratDesc = lang === 'ar' ? GOAL_TRANSLATIONS[farmerGoal]?.desc : (
                          farmerGoal === "saveWater"
                            ? "Consumes only 3,800 m³/ha/yr, achieving an 83% water reduction over conventional practices. Allows irrigation with high-salinity brackish wells or reject brine without exhausting freshwater tables."
                            : farmerGoal === "maximizeProfit"
                            ? "Delivers projected net profits of 34,800 AED/ha through high-value commercial date varieties (Khalas/Barhi) and companion citrus, while reducing power pumping overhead by 61%."
                            : farmerGoal === "rebuildSoil"
                            ? "Rebuilds Soil Organic Carbon from 0.3% to over 1.2% within 3 years. Sub-canopy shade and cowpea cover crop fix 120 kg atmospheric Nitrogen/ha directly into sandy desert soil."
                            : farmerGoal === "lowerRisk"
                            ? "Provides near-total immunity to summer heatwaves (>45°C) and groundwater salinity spikes (>12 dS/m). Halophytic roots thrive where conventional crops burn."
                            : "Reduces synthetic chemical fertilizer dependency by 80% through biochar amendments, halophyte mineral recycling, and natural Rhizobium nitrogen fixation."
                        );

                        return (
                          <div key={`${farmerGoal}-${lang}`} className="bg-white p-4 rounded-2xl border border-[#34C759]/30 space-y-3 tab-transition">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1E8236] flex items-center gap-1.5 uppercase">
                                <CheckCircle2 size={15} />
                                <span>{lang === 'ar' ? '#1 الاستراتيجية الموصى بها لهدفك' : '#1 Recommended Strategy for Your Goal'}</span>
                              </span>
                              <span className="text-xs font-mono font-bold text-[#1E8236] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full coord-text">
                                {lang === 'ar' ? `تطابق ${matchScore}%` : `${matchScore}% Match`}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-[#111111]">{recStratName}</h4>
                              <p className="text-xs text-[#555555] leading-relaxed">
                                {recStratDesc}
                              </p>
                            </div>

                            {/* Score Matrix Across 3 Strategies */}
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <span className="text-[10px] font-bold text-[#888888] uppercase">
                                {lang === 'ar' ? 'مصفوفة مقارنة الاستراتيجيات' : 'Comparative Strategy Score Matrix'}
                              </span>
                              <div className="space-y-1.5">
                                {[
                                  {
                                    id: "saline",
                                    name: lang === 'ar' ? STRATEGY_SCORE_NAMES.saline.ar : STRATEGY_SCORE_NAMES.saline.en,
                                    score: farmerGoal === "saveWater" ? 97 : farmerGoal === "lowerRisk" ? 96 : farmerGoal === "useLessFertilizer" ? 94 : 86,
                                  },
                                  {
                                    id: "oasis",
                                    name: lang === 'ar' ? STRATEGY_SCORE_NAMES.oasis.ar : STRATEGY_SCORE_NAMES.oasis.en,
                                    score: farmerGoal === "maximizeProfit" ? 95 : farmerGoal === "rebuildSoil" ? 93 : 82,
                                  },
                                  {
                                    id: "baseline",
                                    name: lang === 'ar' ? STRATEGY_SCORE_NAMES.baseline.ar : STRATEGY_SCORE_NAMES.baseline.en,
                                    score: farmerGoal === "saveWater" ? 10 : farmerGoal === "maximizeProfit" ? 35 : 18,
                                  },
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-[#666666] truncate pr-2">{item.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            item.score > 80 ? "bg-[#34C759]" : item.score > 50 ? "bg-[#FF9500]" : "bg-[#FF3B30]"
                                          }`}
                                          style={{ width: `${item.score}%` }}
                                        />
                                      </div>
                                      <span className="font-mono font-bold text-[#111111] w-7 text-right coord-text">
                                        {item.score}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

            {/* Slide to Export to CSV Panel */}
            <div className="bg-[#F7F7F7] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 fade-in">
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  {t.mapConsole.metrics.telemetryExport}
                </span>
                <span className="text-[11px] text-[#888888] font-semibold">
                  {t.mapConsole.metrics.csvDataset}
                </span>
              </div>
              <div className="w-full flex justify-center py-1">
                <SlideCommit
                  label={t.mapConsole.metrics.slideExport}
                  doneLabel={t.mapConsole.metrics.exported}
                  errorLabel={t.mapConsole.metrics.exportFailed}
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

            {/* Bottom AI Soil Advisor & Chat Section */}
            <div
              ref={aiAdvisorRef}
              className="mt-2 bg-white rounded-[24px] border border-[#E5E5EA] p-5 shadow-xs flex flex-col gap-4 fade-in"
            >
              {/* Advisor Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2F2F7]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F2F2F7] text-[#111111] uppercase tracking-wider">
                      <Sparkles size={12} className="text-[#34C759]" />
                      <span>{t.aiAdvisor.badge}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#888888] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full">
                      {lang === 'ar' ? PARCEL_NAME_AR[selectedZone.name] || selectedZone.name : selectedZone.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] tracking-tight">
                    {t.aiAdvisor.title}
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed max-w-xl">
                    {t.aiAdvisor.subtitle}
                  </p>
                </div>

                {chatMessages.length === 0 && (
                  <button
                    type="button"
                    onClick={() => triggerAiAdvisor()}
                    disabled={isGenerating}
                    className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#111111] text-white hover:bg-[#2C2C2E] transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <Sparkles size={13} className="text-[#34C759]" />
                    <span>{t.aiAdvisor.generateAdvice}</span>
                  </button>
                )}
              </div>

              {/* Chat Conversation Thread */}
              <div className="flex flex-col gap-3 min-h-[120px] max-h-[360px] overflow-y-auto pr-1">
                {chatMessages.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#FBFBFD] border border-dashed border-[#E5E5EA] text-[#888888]">
                    <Sparkles size={22} className="text-[#34C759] mb-1.5" />
                    <p className="text-xs max-w-md leading-relaxed">
                      {t.aiAdvisor.emptyHint}
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col fade-in ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#111111] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%]'
                            : 'bg-[#F5F5F7] text-[#111111] border border-[#E5E5EA] rounded-2xl rounded-tl-xs px-4 py-3 max-w-[95%] whitespace-pre-wrap shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.timestamp && (
                        <span className="text-[10px] text-[#A1A1A6] mt-1 px-1 coord-text">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  ))
                )}

                {isGenerating && (
                  <div className="flex items-start gap-2 fade-in">
                    <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-[#666666] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
                      <span>{t.aiAdvisor.generating}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Command Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F2F2F7]">
                <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                  {lang === 'ar' ? 'أوامر سريعة:' : 'Quick Prompts:'}
                </span>
                <button
                  type="button"
                  onClick={() => triggerAiAdvisor('/summarize')}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#111111] border border-[#E5E5EA] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {t.aiAdvisor.quickSummarize}
                </button>
                <button
                  type="button"
                  onClick={() => triggerAiAdvisor('/crops')}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#111111] border border-[#E5E5EA] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {t.aiAdvisor.quickCrops}
                </button>
                <button
                  type="button"
                  onClick={() => triggerAiAdvisor('/water')}
                  disabled={isGenerating}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#111111] border border-[#E5E5EA] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {t.aiAdvisor.quickWater}
                </button>
              </div>

              {/* React Bits <PromptBar /> */}
              <div className="w-full flex justify-center pt-1">
                <PromptBar
                  placeholder={t.aiAdvisor.askPrompt}
                  sources={[
                    {
                      key: 'soil-profile',
                      name: t.aiAdvisor.soilProfileSource,
                      description: t.aiAdvisor.soilProfileDesc,
                      icon: SparklesIcon,
                      attach: false,
                    },
                  ]}
                  commands={[
                    {
                      key: 'summarize',
                      name: '/summarize',
                      description:
                        lang === 'ar'
                          ? 'تلخيص التقرير الزراعي والمناخي'
                          : 'Digest agronomic telemetry',
                    },
                    {
                      key: 'crops',
                      name: '/crops',
                      description:
                        lang === 'ar'
                          ? 'أفضل المحاصيل المقاومة للملوحة'
                          : 'Recommend salt-tolerant crops',
                    },
                    {
                      key: 'water',
                      name: '/water',
                      description:
                        lang === 'ar'
                          ? 'استراتيجية الري وتوفير المياه'
                          : 'Irrigation & water savings strategy',
                    },
                  ]}
                  models={[]}
                  efforts={lang === 'ar' ? ['منخفض', 'متوسط', 'مرتفع', 'فائق', 'أقصى'] : ['Low', 'Medium', 'High', 'Extra', 'Max']}
                  defaultEffort={lang === 'ar' ? 'متوسط' : 'Medium'}
                  effortTitle={lang === 'ar' ? 'جهد التحليل' : 'Effort'}
                  effortFaster={lang === 'ar' ? 'أسرع' : 'Faster'}
                  effortSmarter={lang === 'ar' ? 'أذكى' : 'Smarter'}
                  effortHelp={lang === 'ar' ? 'الجهد الأعلى يستغرق وقتاً أطول للتحليل المتعمق' : 'Higher effort thinks longer before answering'}
                  noMatchesText={lang === 'ar' ? 'لا توجد نتائج مطابقة لـ' : 'No matches for'}
                  busy={isGenerating}
                  onSend={(text: string) => handleSendPrompt(text)}
                  background="#F5F5F7"
                  color="#111111"
                  menuBackground="#FFFFFF"
                  sparkColor="#34C759"
                  width={600}
                  radius={20}
                />
              </div>
            </div>
            </>
            )}
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
        <div key={`landing-${lang}`} className="view-transition">
          {renderLandingPage()}
        </div>
      ) : (
        <div key={`${view}-${lang}`} className="view-transition flex-1 flex flex-col">
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
        </div>
      )}
    </div>
  );
}
