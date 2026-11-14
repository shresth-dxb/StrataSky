'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  nav: {
    brand: string;
    badge: string;
    home: string;
    directory: string;
    liveMap: string;
    back: string;
    aiGenerate: string;
    langEn: string;
    langAr: string;
  };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    openMap: string;
    browseFarms: string;
  };
  directory: {
    allParcels: string;
    activeFilters: string;
    searchPlaceholder: string;
    clearFilters: string;
    emirate: string;
    soilType: string;
    cropPlan: string;
    waterSource: string;
    viewInConsole: string;
  };
  mapConsole: {
    telemetry: string;
    presetJumps: string;
    analyzingGps: string;
    gpsLock: string;
    telemetrySync: string;
    soilProfile: string;
    aquiferWater: string;
    tabs: {
      climate: string;
      nutrients: string;
      rotations: string;
      priorities: string;
    };
    metrics: {
      airTemp: string;
      solarFlux: string;
      rainfallPatterns: string;
      wetSeason: string;
      droughtIndex: string;
      smapMoisture: string;
      ecostressEt: string;
      co2: string;
      carbonSink: string;
      macronutrients: string;
      nitrogen: string;
      phosphorus: string;
      potassium: string;
      secondaryMicro: string;
      soilPhysical: string;
      salinity: string;
      soilPh: string;
      organicCarbon: string;
      compareProtocols: string;
      farmerPriorityOpt: string;
      waterDemand: string;
      savesWater: string;
      baselineZero: string;
      telemetryExport: string;
      csvDataset: string;
      slideExport: string;
      exported: string;
      exportFailed: string;
      exportDisabled: string;
    };
  };
  tooltips: {
    soilProfile: string;
    aquiferWater: string;
    airTemp: string;
    solarFlux: string;
    rainfallPatterns: string;
    droughtIndex: string;
    smapMoisture: string;
    ecostressEt: string;
    co2: string;
    carbonSink: string;
    rotationsBalance: string;
  };
  aiAdvisor: {
    badge: string;
    title: string;
    subtitle: string;
    initialPrompt: string;
    askPrompt: string;
    quickSummarize: string;
    quickCrops: string;
    quickWater: string;
    generateAdvice: string;
    soilProfileSource: string;
    soilProfileDesc: string;
    generating: string;
    emptyHint: string;
  };
  blocked: {
    outsideTitle: string;
    outsideBanner: string;
    outsideDesc: string;
    nonArableTitle: string;
    nonArableWarning: string;
    nonArableDesc: string;
    pausedTitle: string;
    pausedDesc: string;
    jumpPresets: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      brand: 'STRATASKY',
      badge: 'UAE AGRI INTELLIGENCE',
      home: 'Overview',
      directory: 'Farm Zones',
      liveMap: 'Live Map',
      back: 'BACK',
      aiGenerate: '✨ AI Generate',
      langEn: 'EN',
      langAr: 'عربي',
    },
    hero: {
      badge: 'NASA & ICBA CALIBRATED BIOSALINE AI',
      title1: 'Regenerative Agriculture',
      title2: 'for Desert Soils.',
      subtitle:
        'Targeted agro-climatic intelligence for United Arab Emirates farms. Analyze soil salinity, aquifer depletion, and 3-year crop rotations with orbital precision.',
      openMap: 'Explore Live Map',
      browseFarms: 'Browse UAE Farm Zones',
    },
    directory: {
      allParcels: 'All Agricultural Parcels',
      activeFilters: 'Active Filters',
      searchPlaceholder: 'Search by farm name, sub-region, or crop plan...',
      clearFilters: 'Clear Filters',
      emirate: 'Emirate',
      soilType: 'Soil Classification',
      cropPlan: 'Crop Rotation Protocol',
      waterSource: 'Water Source',
      viewInConsole: 'Analyze on Live Map',
    },
    mapConsole: {
      telemetry: 'TELEMETRY',
      presetJumps: 'Preset Quick Jumps:',
      analyzingGps: 'Calculating GPS Parcel',
      gpsLock: 'GPS PARCEL LOCK',
      telemetrySync: 'Telemetry Synchronized',
      soilProfile: 'Soil Profile',
      aquiferWater: 'Aquifer & Water',
      tabs: {
        climate: 'Climate & Rain',
        nutrients: 'Soil Nutrients',
        rotations: '3-Yr Rotations',
        priorities: 'Priorities',
      },
      metrics: {
        airTemp: 'AIR TEMPERATURE',
        solarFlux: 'SOLAR IRRADIANCE',
        rainfallPatterns: 'Rainfall Patterns (NCM Weather Normal)',
        wetSeason: 'Wet Season:',
        droughtIndex: 'Drought Index:',
        smapMoisture: 'SMAP Soil Moisture',
        ecostressEt: 'ECOSTRESS ET₀',
        co2: 'CO₂ Concentration',
        carbonSink: 'Carbon Sink Potential',
        macronutrients: 'Macronutrients (MOCCAE / Soil Lab Standards)',
        nitrogen: 'NITROGEN (N)',
        phosphorus: 'PHOSPHORUS (P)',
        potassium: 'POTASSIUM (K)',
        secondaryMicro: 'Secondary & Micronutrients Profile',
        soilPhysical: 'Soil Physical Properties & ICBA Biochar Advisory',
        salinity: 'SALINITY (EC)',
        soilPh: 'SOIL pH',
        organicCarbon: 'ORGANIC CARBON',
        compareProtocols: 'Compare 3 Rotation Protocols',
        farmerPriorityOpt: 'Farmer Priority Optimization',
        waterDemand: 'Annual Demand',
        savesWater: 'Saves Water',
        baselineZero: 'Baseline (0% Saved)',
        telemetryExport: 'Telemetry Export',
        csvDataset: 'CSV Dataset',
        slideExport: 'Slide to export to CSV',
        exported: 'Exported',
        exportFailed: 'Export Failed',
        exportDisabled: 'Export Disabled (Non-Arable)',
      },
    },
    tooltips: {
      soilProfile:
        'Shows the local ground texture and salt concentration (dS/m). Soil above 4 dS/m is too salty for standard vegetables and requires salt-tolerant crops.',
      aquiferWater:
        'Displays local underground water conditions, average yearly rainfall, and how much carbon the soil can trap per hectare.',
      airTemp:
        'Average daily air temperature 2 meters above the ground from NASA satellites. Helps determine heat stress and safe planting seasons.',
      solarFlux:
        'Total daily sunlight energy hitting your crops (MJ/m²/day). High desert sun fuels plant growth, but extreme levels rapidly evaporate soil water.',
      rainfallPatterns:
        'Historical monthly rainfall averages across the UAE. Shows when natural winter rains can reduce your irrigation schedule.',
      droughtIndex:
        'Measures how severely dry the local microclimate is by comparing extreme heat against natural rainfall.',
      smapMoisture:
        "The percentage of water trapped in the top 5 cm of soil, measured from orbit by NASA's SMAP satellite radar.",
      ecostressEt:
        'Evapotranspiration: how much water evaporates from the soil and leaves each year. Tells you how aggressively crops lose water to desert heat.',
      co2: 'Local atmospheric carbon dioxide levels (in parts per million), which directly affect plant photosynthesis and water efficiency.',
      carbonSink:
        'Estimated tons of CO₂ per hectare this plot can absorb and lock into the soil each year using regenerative crop rotations.',
      rotationsBalance:
        'StrataSky balances soil minerals and multi-year crop cycles to cut water use by up to 60%.',
    },
    aiAdvisor: {
      badge: 'SOIL INTELLIGENCE ADVISOR',
      title: 'AI Soil Advisor & Q&A',
      subtitle:
        'Autonomous agronomic intelligence calibrated for UAE desert soil, salinity, and aquifer preservation.',
      initialPrompt:
        'Analyze this parcel soil health, salinity, and recommend the best 3-year crop rotation.',
      askPrompt: 'Ask about this soil, salinity, or crop plans...',
      quickSummarize: 'Summarize soil & water suitability',
      quickCrops: 'Best salt-tolerant crops for this plot',
      quickWater: 'Irrigation & water-saving tips',
      generateAdvice: 'Analyze Soil',
      soilProfileSource: 'Soil Profile',
      soilProfileDesc: 'Current salinity & texture',
      generating: 'Analyzing soil telemetry...',
      emptyHint:
        'Ask anything about this parcel soil chemistry, irrigation schedule, or salt remediation techniques.',
    },
    blocked: {
      outsideTitle: 'Outside UAE Territory',
      outsideBanner:
        'Outside UAE Territory: StrataSky telemetry is calibrated exclusively for United Arab Emirates agricultural zones.',
      outsideDesc:
        'Sentinel-2 surface reflectance, NCM precipitation normal, and NASA POWER grids are restricted to UAE national borders. Please select an arable parcel within UAE territory.',
      nonArableTitle: 'NON-ARABLE ZONE BLOCKED',
      nonArableWarning:
        'Non-Arable Zone Blocked: {name} is classified as urban, industrial, or transport infrastructure. Click any farm, oasis, or open desert plot to analyze.',
      nonArableDesc:
        'StrataSky strictly isolates agricultural zoning. Commercial complexes, transit corridors, airports, roads, and industrial districts are excluded from agro-climatic telemetry calculations.',
      pausedTitle: 'Telemetry & NASA Calculations Paused',
      pausedDesc:
        'Select any agricultural parcel, palm oasis, or open desert terrain on the map to activate multispectral soil profiling, NASA POWER weather grids, and water conservation models.',
      jumpPresets: 'Jump to Verified UAE Agricultural Presets:',
    },
  },
  ar: {
    nav: {
      brand: 'ستراتاسكاي',
      badge: 'الذكاء الزراعي الإماراتي',
      home: 'نظرة عامة',
      directory: 'المناطق الزراعية',
      liveMap: 'الخريطة المباشرة',
      back: 'رجوع',
      aiGenerate: '✨ تحليل الذكاء الاصطناعي',
      langEn: 'EN',
      langAr: 'عربي',
    },
    hero: {
      badge: 'معايرة بالأقمار الصناعية وأبحاث الزراعة الملحية',
      title1: 'الزراعة المتجددة',
      title2: 'للتربة الصحراوية.',
      subtitle:
        'حلول رقمية ذكية لمزارع دولة الإمارات العربية المتحدة. تحليل ملوحة التربة، الحفاظ على المياه الجوفية، والدورات الزراعية الموفرة للمياه بدقة فضائية.',
      openMap: 'استكشف الخريطة المباشرة',
      browseFarms: 'تصفح المناطق الزراعية في الإمارات',
    },
    directory: {
      allParcels: 'جميع الحيازات والقطع الزراعية',
      activeFilters: 'التصنيفات المحددة',
      searchPlaceholder: 'ابحث باسم المزرعة أو المنطقة أو الخطة المحصولية...',
      clearFilters: 'إعادة ضبط الفلاتر',
      emirate: 'الإمارة',
      soilType: 'تصنيف التربة',
      cropPlan: 'نظام الدورة الزراعية',
      waterSource: 'مصدر المياه',
      viewInConsole: 'تحليل على الخريطة المباشرة',
    },
    mapConsole: {
      telemetry: 'القياسات الحيوية',
      presetJumps: 'مزارع نموذجية سريعة:',
      analyzingGps: 'جاري حساب إحداثيات الحقل',
      gpsLock: 'تحديد إحداثيات GPS',
      telemetrySync: 'تمت مزامنة البيانات بنجاح',
      soilProfile: 'خصائص التربة',
      aquiferWater: 'المياه الجوفية والري',
      tabs: {
        climate: 'المناخ والأمطار',
        nutrients: 'عناصر التربة',
        rotations: 'الدورات (3 سنوات)',
        priorities: 'الأولويات',
      },
      metrics: {
        airTemp: 'درجة حرارة الهواء',
        solarFlux: 'الإشعاع الشمسي',
        rainfallPatterns: 'أنماط الأمطار (المركز الوطني للأرصاد)',
        wetSeason: 'موسم الأمطار:',
        droughtIndex: 'مؤشر الجفاف:',
        smapMoisture: 'رطوبة التربة (SMAP)',
        ecostressEt: 'معدل البخر-نتح (ET₀)',
        co2: 'تركيز ثاني أكسيد الكربون',
        carbonSink: 'احتجاز الكربون',
        macronutrients: 'العناصر الكبرى (معايير وزارة التغير المناخي والبيئة)',
        nitrogen: 'النيتروجين (N)',
        phosphorus: 'الفوسفور (P)',
        potassium: 'البوتاسيوم (K)',
        secondaryMicro: 'العناصر الصغرى والثانوية',
        soilPhysical: 'الخواص الفيزيائية وتوصيات المركز الدولي للزراعة الملحية',
        salinity: 'الملوحة (EC)',
        soilPh: 'حموضة التربة (pH)',
        organicCarbon: 'الكربون العضوي',
        compareProtocols: 'مقارنة 3 خطط زراعية دورية',
        farmerPriorityOpt: 'تحديد أولويات المزرعة لتحقيق أقصى عائد',
        waterDemand: 'الاستهلاك السنوي',
        savesWater: 'توفير مياه',
        baselineZero: 'الوضع الحالي (0% توفير)',
        telemetryExport: 'تصدير البيانات',
        csvDataset: 'ملف CSV',
        slideExport: 'اسحب لتصدير ملف CSV',
        exported: 'تم التصدير بنجاح',
        exportFailed: 'فشل التصدير',
        exportDisabled: 'التصدير معطّل (منطقة غير زراعية)',
      },
    },
    tooltips: {
      soilProfile:
        'يوضح قوام التربة المحلية ومستوى الملوحة (dS/m). التربة التي تتجاوز 4 dS/m تعتبر مالحة للخضار التقليدية وتتطلب محاصيل متحملة للملوحة.',
      aquiferWater:
        'يعرض حالة المياه الجوفية المحلية ومعدل الأمطار السنوي وقدرة التربة على احتجاز الكربون لكل هكتار.',
      airTemp:
        'متوسط درجة حرارة الهواء على ارتفاع مترين من أقمار ناسا الاصطناعية، لتحديد الإجهاد الحراري ومواسم الزراعة الآمنة.',
      solarFlux:
        'إجمالي طاقة الإشعاع الشمسي اليومية (ميغاجول/م²/يوم). ضوء الشمس يغذي المحاصيل لكن شدته العالية تزيد من تبخر مياه التربة.',
      rainfallPatterns:
        'المعدلات الشهرية التاريخية للأمطار في الإمارات، لتحديد فترات الاستفادة من أمطار الشتاء لتخفيف جداول الري.',
      droughtIndex:
        'يقيس حدة الجفاف في المناخ المحلي بمقارنة درجات الحرارة القصوى مع معدلات الهطول الطبيعية.',
      smapMoisture:
        'نسبة الرطوبة المحتبسة في أعلى 5 سم من التربة مقاسة برادار القمر الصناعي SMAP التابع لوكالة ناسا.',
      ecostressEt:
        'البخر-نتح (ET₀): كمية المياه المتبخرة من التربة والنبات سنوياً، لمعرفة معدل فقدان المياه بسبب حرارة الصحراء.',
      co2: 'مستوى ثاني أكسيد الكربون في الغلاف الجوي (جزء في المليون) وتأثيره المباشر على البناء الضوئي وكفاءة امتصاص الماء.',
      carbonSink:
        'الطن المقدر من CO₂ لكل هكتار الذي يمكن لهذه الأرض امتصاصه وعزله في التربة سنوياً عبر الدورات الزراعية المتجددة.',
      rotationsBalance:
        'يوازن ستراتاسكاي معادن التربة والدورات الزراعية متعددة السنوات لتقليل استهلاك المياه بنسبة تصل إلى 60%.',
    },
    aiAdvisor: {
      badge: 'مستشار التربة الزراعي الذكي',
      title: 'مستشار التربة الزراعي الذكي',
      subtitle:
        'استشارات زراعية فورية معايرة لتربة الصحراء الإماراتية، خفض الملوحة، وترشيد المياه الجوفية.',
      initialPrompt:
        'حلل خصائص هذه التربة ومستوى الملوحة واقترح أفضل دورة زراعية ثلاثية.',
      askPrompt: 'اسأل عن التربة أو المحاصيل المناسبة أو طرق الري...',
      quickSummarize: 'ملخص ملاءمة التربة والمياه',
      quickCrops: 'أفضل المحاصيل المقاومة للملوحة',
      quickWater: 'نصائح الري وتوفير المياه الجوفية',
      generateAdvice: 'تحليل التربة',
      soilProfileSource: 'خصائص التربة',
      soilProfileDesc: 'الملوحة والقوام الحالي',
      generating: 'جارٍ تحليل بيانات التربة والموقع...',
      emptyHint:
        'اسأل المستشار الذكي عن أي تفاصيل تتعلق بكيمياء التربة، جداول الري، أو معالجة الملوحة بالأسمدة الحيوية.',
    },
    blocked: {
      outsideTitle: 'خارج حدود دولة الإمارات',
      outsideBanner:
        'خارج أراضي الإمارات: قياسات ستراتاسكاي معايرة حصرياً للمناطق الزراعية في دولة الإمارات العربية المتحدة.',
      outsideDesc:
        'بيانات الأقمار الصناعية والأرصاد الوطنية مقيدة بالحدود الجغرافية لدولة الإمارات. يرجى اختيار قطعة أرض زراعية داخل الدولة.',
      nonArableTitle: 'منطقة غير زراعية محظورة',
      nonArableWarning:
        'منطقة غير زراعية: {name} مصنفة كمنطقة عمرانية أو صناعية أو بنية تحتية للنقل. انقر على أي مزرعة أو واحة أو أرض صحراوية مفتوحة لتحليلها.',
      nonArableDesc:
        'يقصر ستراتاسكاي حساباته على الأراضي الزراعية والمفتوحة. تستثنى المجمعات التجارية والمطارات والطرق والمناطق الصناعية من الحسابات الزراعية.',
      pausedTitle: 'تم إيقاف القياسات وحسابات ناسا مؤقتاً',
      pausedDesc:
        'اختر أي قطعة أرض زراعية أو واحة نخيل أو أرض صحراوية مفتوحة على الخريطة لتفعيل مسح التربة وحسابات المناخ وتوفير المياه.',
      jumpPresets: 'الانتقال إلى المزارع الإماراتية النموذجية:',
    },
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  dir: 'ltr' | 'rtl';
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load persisted language or default to en
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stratasky_lang') as Language | null;
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem('stratasky_lang', nextLang);
    } catch {}
  };

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const value = {
    lang,
    setLang,
    dir,
    t: translations[lang],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
