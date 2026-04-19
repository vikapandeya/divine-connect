import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || "";
    const isRateLimit = errorMsg.includes("429") || errorMsg.includes("rate") || errorMsg.includes("limit");
    
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export interface PanchangData {
  tithi: string;
  tithiEnd?: string;
  paksha: string;
  nakshatra: string;
  nakshatraEnd?: string;
  yoga: string;
  yogaEnd?: string;
  karana: string;
  karanaEnd?: string;
  mahina: string;
  vikramSamvat: string;
  samvatName: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahukaal: string;
  gulika: string;
  yamaganda: string;
  auspicious: string;
  festivals?: string[];
  sunSign?: string;
  moonSign?: string;
  location?: string;
}

export interface HoroscopeData {
  sign: string;
  prediction: string;
}

export async function fetchLivePanchang(date: Date, language: string = 'en'): Promise<PanchangData> {
  const dateStr = date.toISOString().split('T')[0];
  const prompt = `Fetch and return the detailed Vedic Panchang (Hindu Calendar) for ${dateStr}. 
  You MUST include:
  1. Vikram Samvat year (e.g., 2083)
  2. Samvatsara name (e.g., Siddharthi)
  3. Paksha (e.g., Shukla Paksha)
  4. Tithi, Nakshatra, Yoga, Karana AND their end times for the day (e.g., "Dwitiya until 10:49 AM").
  5. Hindu Month with Date (e.g., "17, Vaishakha")
  6. Sunrise, Sunset, Moonrise, Moonset timings for New Delhi, India. 
  7. Sun Sign and Moon Sign.
  8. Rahukaal, Gulika, Yamaganda timings.
  9. Abhijit Muhurat.
  10. List of major Festivals or Vratas for today (e.g., ["Akshaya Tritiya", "Parashurama Jayanti"]).
  
  Provide labels and values in ${language === 'hi' ? 'Hindi' : language === 'sa' ? 'Sanskrit' : 'English'}.
  Return the response in JSON format matching the schema.`;

  try {
    const result = await withRetry(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tithi: { type: Type.STRING },
            tithiEnd: { type: Type.STRING },
            paksha: { type: Type.STRING },
            nakshatra: { type: Type.STRING },
            nakshatraEnd: { type: Type.STRING },
            yoga: { type: Type.STRING },
            yogaEnd: { type: Type.STRING },
            karana: { type: Type.STRING },
            karanaEnd: { type: Type.STRING },
            mahina: { type: Type.STRING },
            vikramSamvat: { type: Type.STRING },
            samvatName: { type: Type.STRING },
            sunrise: { type: Type.STRING },
            sunset: { type: Type.STRING },
            moonrise: { type: Type.STRING },
            moonset: { type: Type.STRING },
            rahukaal: { type: Type.STRING },
            gulika: { type: Type.STRING },
            yamaganda: { type: Type.STRING },
            auspicious: { type: Type.STRING },
            festivals: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sunSign: { type: Type.STRING },
            moonSign: { type: Type.STRING },
            location: { type: Type.STRING }
          },
          required: ["tithi", "paksha", "nakshatra", "yoga", "karana", "mahina", "vikramSamvat", "samvatName", "sunrise", "sunset", "moonrise", "moonset", "rahukaal", "gulika", "yamaganda", "auspicious", "location"]
        }
      }
    }));

    const text = result.text;
    if (!text || text.includes("Rate limit") || text.includes("limit exceeded")) {
      throw new Error("Rate limit exceeded or invalid response");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching panchang:", error);
    throw error;
  }
}

export async function fetchLiveHoroscope(sign: string, language: string = 'en'): Promise<string> {
  const prompt = `Provide the daily horoscope prediction for ${sign} for today (${new Date().toDateString()}).
  The sentiment should be spiritual and encouraging.
  Provide the prediction in ${language === 'hi' ? 'Hindi' : language === 'sa' ? 'Sanskrit' : 'English'}.
  Return only the prediction text.`;

  try {
    const result = await withRetry(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    }));

    const text = result.text;
    if (!text || text.includes("Rate limit") || text.includes("limit exceeded")) {
      return "The cosmic energies are aligning. Focus on mindfulness today as your horoscope updates.";
    }
    return text;
  } catch (error) {
    console.error("Error fetching horoscope:", error);
    return "The cosmic energies are aligning. Stay positive and mindful today.";
  }
}
