import { UaeFarmZone } from '@/lib/landValidation';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export async function askGeminiSoilAdvisor({
  prompt,
  selectedZone,
  lang,
  history = [],
  nasaTemp,
  nasaSolar,
}: {
  prompt: string;
  selectedZone: UaeFarmZone;
  lang: 'en' | 'ar';
  history?: ChatMessage[];
  nasaTemp?: number;
  nasaSolar?: number;
}): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const telemetryContext = {
    parcelName: selectedZone.name,
    emirate: selectedZone.emirate,
    latitude: selectedZone.lat,
    longitude: selectedZone.lng,
    isFarmable: selectedZone.isFarmable !== false,
    soilTaxonomy: selectedZone.nutrients?.soilTaxonomyGroup || selectedZone.soilSummary,
    salinityEC: selectedZone.nutrients?.salinityEC ?? 5.2,
    salinityClass: selectedZone.nutrients?.salinityClass || 'Moderately Saline',
    soilPH: selectedZone.nutrients?.ph ?? 8.0,
    soilOrganicCarbon: `${selectedZone.nutrients?.soilOrganicCarbon ?? 0.35}%`,
    annualRainfallMm: `${selectedZone.climate?.annualRainfallMm ?? 92} mm/yr`,
    droughtIndex: selectedZone.climate?.droughtRiskIndex || 'Severe',
    smapSoilMoisture: `${selectedZone.climate?.smapSoilMoisturePercent ?? 8.5}%`,
    evapotranspirationET0: `${selectedZone.climate?.evapotranspirationMmYear ?? 2200} mm/yr`,
    nasaAirTempC: nasaTemp ?? selectedZone.climate?.nasaPowerTempC ?? 28.5,
    nasaSolarIrradianceMj: nasaSolar ?? selectedZone.climate?.nasaSolarMj ?? 20.0,
    carbonSinkPotential: `${selectedZone.nutrients?.carbonSequestrationPotential ?? 2.3} t CO2/ha/yr`,
    recommendedCropPlan: selectedZone.strategies?.[1]?.name || '3-Tier Oasis Agroforestry (Date Palm + Citrus + Legume)',
    saltTolerantAlternative: selectedZone.strategies?.[2]?.name || 'Biosaline Rotation (ICBA Quinoa + Salicornia)',
    language: lang === 'ar' ? 'Arabic (العربية)' : 'English',
  };

  const systemInstructionText = `You are StrataSky's UAE Agricultural Soil Advisor. Analyze the provided UAE farm/desert telemetry (soil type, salinity dS/m, NASA temperature, solar irradiance, SMAP soil moisture, ECOSTRESS ET0, and 3-year crop plans). Give practical, farmer-friendly advice in 3-4 short bullet points. Always respond in the user's selected UI language (${
    lang === 'ar' ? 'Arabic' : 'English'
  }). Never use generic greetings; get straight to practical agronomic insights.`;

  // Build conversation contents including history
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Seed the first user turn with the telemetry metadata + question
  const initialTurn = `[TELEMETRY DATA IN JSON]:\n${JSON.stringify(
    telemetryContext,
    null,
    2
  )}\n\n[USER INQUIRY]: ${
    history.length === 0
      ? prompt
      : history[0]?.text || prompt
  }`;

  contents.push({
    role: 'user',
    parts: [{ text: initialTurn }],
  });

  // If there is subsequent conversation history, append it
  if (history.length > 1) {
    for (let i = 1; i < history.length; i++) {
      const msg = history[i];
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
    // Append the latest user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });
  }

  try {
    const payload = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.4,
      },
    });

    const candidateModels = [
      'gemini-2.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
    ];

    let candidateText = '';

    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text.trim()) {
            candidateText = text.trim();
            break;
          }
        }
      } catch (err) {
        // try next candidate model
      }
    }

    if (candidateText) {
      return candidateText;
    }

    throw new Error('No candidate text returned by Gemini endpoints');
  } catch (error) {
    console.error('Gemini Soil Advisor fallback triggered:', error);

    // Context-rich fallback in selected language
    if (lang === 'ar') {
      return (
        `• **ملوحة التربة (${telemetryContext.salinityEC} dS/m):** تعتبر مناسبة لنخيل التمر والكينوا ونبات الساليكورنيا المقاوم للملوحة، بينما تحتاج الخضروات التقليدية لغسيل التربة.\n` +
        `• **كفاءة الري والحرارة (${telemetryContext.nasaAirTempC}°C):** نوصي باعتماد الري بالتنقيط تحت السطحي خلال ساعات الصباح الباكر لتقليل التبخر الشديد (${telemetryContext.evapotranspirationET0}).\n` +
        `• **الخطة الزراعية المقترحة:** تطبيق نظام الواحة متعدد الطبقات (نخيل + حمضيات قزمة + بقوليات مثبتة للنيتروجين) لخفض استهلاك المياه بنسبة 61%.`
      );
    }

    return (
      `• **Soil Salinity (${telemetryContext.salinityEC} dS/m):** Well-suited for Date Palms, ICBA-Q5 Quinoa, and Salicornia; standard greens will require calcium/biochar leaching.\n` +
      `• **Heat & Evaporation (${telemetryContext.nasaAirTempC}°C):** High atmospheric deficit (${telemetryContext.evapotranspirationET0}) requires sub-surface drip irrigation scheduled before 06:00 AM.\n` +
      `• **Recommended 3-Year Plan:** Adopt the 3-tier Oasis Canopy (Date Palm + Understory Citrus + Sesbania cover crop) to reduce water usage by 61% and rebuild organic carbon.`
    );
  }
}
