import React from "react";
import { WeatherData } from "../types/weather";
import Icon from "./common/Icon";

interface CurrentWeatherProps {
  current?: WeatherData["current"];
  city?: string;
  loading?: boolean;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  current,
  city,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded"></div>
        <div className="h-24 w-32 bg-white/10 rounded"></div>
        <div className="h-8 w-full bg-white/10 rounded"></div>
      </div>
    );
  }

  if (!current || !city) {
    return (
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-white/60">
          Unknown Location
        </h2>
        <h1 className="text-6xl font-bold text-white/40">--°</h1>
        <p className="text-white/40">Search a city to view weather</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="text-xl font-semibold text-gray-200">Current Weather</div>
      <h1 className="text-4xl font-bold text-white">{city}</h1>
      <p className="text-gray-300">Chance of rain: {current.chanceOfRain}%</p>
      <div className="flex items-center space-x-8">
        <div className="text-8xl font-light text-white tracking-tighter">
          {current.temperature}°
        </div>
        <Icon type={current.currentIcon} className="text-9xl" />
      </div>
    </div>
  );
};

export default CurrentWeather;
