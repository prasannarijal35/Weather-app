import { WeatherData, HourlyDataPoint, DailyDataPoint } from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// A more robust icon mapper
const mapWeatherCodeToIcon = (code: number): string => {
  // 0: Clear
  if (code === 0) return "sunny";
  // 1-3: Partly Cloudy
  if (code >= 1 && code <= 3) return "cloudy";
  // 45, 48: Fog
  if (code === 45 || code === 48) return "cloudy";
  // 51-67: Drizzle/Rain
  if (code >= 51 && code <= 67) return "rainy";
  // 71-77: Snow
  if (code >= 71 && code <= 77) return "snow";
  // 80-82: Rain Showers
  if (code >= 80 && code <= 82) return "rainy";
  // 85-86: Snow Showers
  if (code >= 85 && code <= 86) return "snow";
  // 95-99: Thunderstorm
  if (code >= 95) return "storm";

  return "cloudy"; // Default fallback
};

const getDayName = (date: Date, index: number): string => {
  if (index === 0) return "Today";
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

function safeNumber(val: unknown, fallback = 0): number {
  const n = Number(val as unknown as number);
  return Number.isFinite(n) ? n : fallback;
}

export async function getWeatherData(
  latitude: number,
  longitude: number,
  city: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    // 1. Fetch specific "current" data for the main card
    current:
      "temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,uv_index,precipitation",
    // 2. Hourly for the scroll list
    hourly: "temperature_2m,weather_code,uv_index,precipitation_probability",
    // 3. Daily for the 7-day list
    daily:
      "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset",
  });

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Open-Meteo fetch failed: ${res.status} ${text}`);
  }

  const json = await res.json();

  // --- 1. Handle Current Weather ---
  // We use the dedicated 'current' block for better accuracy
  const currentData = json.current;

  // Note: Open-Meteo 'current' doesn't give probability %, it gives actual precipitation (mm).
  // To get "Chance of rain" for right now, we grab the first hour of the hourly forecast.
  const currentHourlyPrecipProp = json.hourly.precipitation_probability[0] || 0;

  const current: WeatherData["current"] = {
    temperature: Math.round(safeNumber(currentData.temperature_2m)),
    realFeel: Math.round(safeNumber(currentData.apparent_temperature)),
    uvIndex: Math.round(safeNumber(currentData.uv_index)),
    windSpeed: safeNumber(currentData.wind_speed_10m),
    chanceOfRain: Math.round(currentHourlyPrecipProp), // Taken from hourly[0]
    currentIcon: mapWeatherCodeToIcon(currentData.weather_code),
  };

  // --- 2. Handle Hourly Forecast ---
  const now = new Date();
  const hTimes = json.hourly.time;
  const hTemp = json.hourly.temperature_2m;
  const hCode = json.hourly.weather_code;
  const hUv = json.hourly.uv_index;

  const hourlyData: HourlyDataPoint[] = [];

  // Find where "now" is in the array
  let startIndex = hTimes.findIndex((t: string) => new Date(t) >= now);
  if (startIndex === -1) startIndex = 0;

  // Get the next 24 hours (simple scroll)
  // This is better for UI than skipping hours
  for (let i = startIndex; i < startIndex + 24 && i < hTimes.length; i++) {
    hourlyData.push({
      time: new Date(hTimes[i]),
      temperature: Math.round(safeNumber(hTemp[i])),
      uvIndex: Math.round(safeNumber(hUv[i])),
      icon: mapWeatherCodeToIcon(hCode[i]),
    });
  }

  // --- 3. Handle Daily Forecast ---
  const dTimes = json.daily.time;
  const dMax = json.daily.temperature_2m_max;
  const dMin = json.daily.temperature_2m_min;
  const dCode = json.daily.weather_code;
  // Useful for visual bars if you want to add rain chance to daily list
  const dRainChance = json.daily.precipitation_probability_max;

  const dailyData: DailyDataPoint[] = dTimes.map((t: string, i: number) => {
    return {
      time: new Date(t),
      date: getDayName(new Date(t), i),
      temperatureMax: Math.round(safeNumber(dMax[i])),
      temperatureMin: Math.round(safeNumber(dMin[i])),
      icon: mapWeatherCodeToIcon(dCode[i]),
      // You can add this to your DailyDataPoint type if you want to show rain chance per day
      chanceOfRain: safeNumber(dRainChance[i]),
    };
  });

  return {
    city,
    latitude: json.latitude,
    longitude: json.longitude,
    current,
    hourly: hourlyData,
    daily: dailyData,
  };
}
