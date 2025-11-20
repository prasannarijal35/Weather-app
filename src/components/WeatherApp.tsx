"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { WeatherData } from "../types/weather";
import { Coordinates } from "../services/geocoding";
import CitySearch from "./CitySearch";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import AirConditions from "./AirConditions";
import SevenDayForecast from "./SevenDayForecast";

const getBackgroundClass = (condition: string | undefined): string => {
  if (!condition)
    return "bg-gradient-to-br from-gray-900 via-slate-800 to-black"; // Default "Empty" theme

  const text = condition.toLowerCase();
  if (text.includes("rain") || text.includes("drizzle"))
    return "bg-gradient-to-br from-slate-700 via-blue-900 to-slate-900";
  if (text.includes("cloud"))
    return "bg-gradient-to-br from-gray-500 via-slate-600 to-slate-800";
  if (text.includes("sun") || text.includes("clear"))
    return "bg-gradient-to-br from-orange-400 via-amber-500 to-blue-500";
  if (text.includes("snow"))
    return "bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500";
  if (text.includes("thunder"))
    return "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900";

  return "bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900";
};

interface FetchResult {
  data: WeatherData | null;
  error: string | null;
}

const WeatherApp: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = useCallback(
    async (lat: number, lon: number, city: string) => {
      setIsLoading(true);
      setError(null);
      // Note: We don't setWeatherData(null) here to prevent UI flashing
      // if we want to keep old data while fetching new data.
      // But for now, let's keep old data visible until new data arrives.

      try {
        const res = await fetch(
          `/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`
        );
        const result: FetchResult = await res.json();

        if (!res.ok || result.error) {
          throw new Error(result.error || "Failed to fetch data.");
        }
        setWeatherData(result.data);
      } catch (err) {
        console.error("Dynamic weather fetch failed:", err);
        setError(`Could not load weather for ${city}.`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleCitySelect = useCallback(
    (coords: Coordinates) => {
      fetchWeather(coords.latitude, coords.longitude, coords.city);
    },
    [fetchWeather]
  );

  const bgClass = useMemo(() => {
    // Use a default code (like 0 for Clear) or custom logic if weatherData is null
    return getBackgroundClass(weatherData?.current.currentIcon || undefined);
  }, [weatherData]);

  return (
    <motion.div
      layout
      className={`min-h-screen p-4 md:p-8 flex justify-center transition-colors duration-1000 ease-in-out ${bgClass}`}
    >
      <div className="flex flex-col w-full max-w-6xl z-10">
        {/* Top Bar: Search & Error Message */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CitySearch onSelect={handleCitySelect} />
          {error && (
            <div className="text-red-200 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}
        </div>

        {/* ALWAYS RENDER THE GRID. 
           We pass 'undefined' if no data, and components handle the empty state.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <CurrentWeather
              current={weatherData?.current}
              city={weatherData?.city}
              loading={isLoading}
            />
            <HourlyForecast hourly={weatherData?.hourly} loading={isLoading} />
            <AirConditions current={weatherData?.current} loading={isLoading} />
          </div>

          {/* Side Column */}
          <div className="lg:col-span-1">
            <SevenDayForecast daily={weatherData?.daily} loading={isLoading} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherApp;
