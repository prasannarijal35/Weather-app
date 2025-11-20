// src/types/weather.ts

export interface HourlyDataPoint {
  time: Date;
  temperature: number;
  uvIndex: number;
  icon: string; // "sunny" | "cloudy" | "rainy" | "snow" | "storm"
}

export interface DailyDataPoint {
  time: Date;
  date: string; // "Today", "Mon", "Tue"
  temperatureMax: number;
  temperatureMin: number;
  icon: string;
  chanceOfRain?: number; // Optional: nice to have for 7-day list
}

export interface CurrentWeather {
  temperature: number;
  realFeel: number;
  chanceOfRain: number;
  uvIndex: number;
  windSpeed: number;
  currentIcon: string;
}

export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  hourly: HourlyDataPoint[];
  daily: DailyDataPoint[];
}
