import { WeatherData, HourlyDataPoint, DailyDataPoint } from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

const mapWeatherCodeToIcon = (code: number): string => {
  if (code === 0) return "sunny";

  if (code >= 1 && code <= 3) return "cloudy";

  if (code === 45 || code === 48) return "cloudy";

  if (code >= 51 && code <= 67) return "rainy";

  if (code >= 71 && code <= 77) return "snow";

  if (code >= 80 && code <= 82) return "rainy";

  if (code >= 85 && code <= 86) return "snow";

  if (code >= 95) return "storm";

  return "cloudy";
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

    current:
      "temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,uv_index,precipitation",

    hourly: "temperature_2m,weather_code,uv_index,precipitation_probability",

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

  const currentData = json.current;

  const currentHourlyPrecipProp = json.hourly.precipitation_probability[0] || 0;

  const current: WeatherData["current"] = {
    temperature: Math.round(safeNumber(currentData.temperature_2m)),
    realFeel: Math.round(safeNumber(currentData.apparent_temperature)),
    uvIndex: Math.round(safeNumber(currentData.uv_index)),
    windSpeed: safeNumber(currentData.wind_speed_10m),
    chanceOfRain: Math.round(currentHourlyPrecipProp), // Taken from hourly[0]
    currentIcon: mapWeatherCodeToIcon(currentData.weather_code),
  };

  const now = new Date();
  const hTimes = json.hourly.time;
  const hTemp = json.hourly.temperature_2m;
  const hCode = json.hourly.weather_code;
  const hUv = json.hourly.uv_index;

  const hourlyData: HourlyDataPoint[] = [];

  let startIndex = hTimes.findIndex((t: string) => new Date(t) >= now);
  if (startIndex === -1) startIndex = 0;

  for (let i = startIndex; i < startIndex + 24 && i < hTimes.length; i++) {
    hourlyData.push({
      time: new Date(hTimes[i]),
      temperature: Math.round(safeNumber(hTemp[i])),
      uvIndex: Math.round(safeNumber(hUv[i])),
      icon: mapWeatherCodeToIcon(hCode[i]),
    });
  }

  const dTimes = json.daily.time;
  const dMax = json.daily.temperature_2m_max;
  const dMin = json.daily.temperature_2m_min;
  const dCode = json.daily.weather_code;

  const dRainChance = json.daily.precipitation_probability_max;

  const dailyData: DailyDataPoint[] = dTimes.map((t: string, i: number) => {
    return {
      time: new Date(t),
      date: getDayName(new Date(t), i),
      temperatureMax: Math.round(safeNumber(dMax[i])),
      temperatureMin: Math.round(safeNumber(dMin[i])),
      icon: mapWeatherCodeToIcon(dCode[i]),

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
