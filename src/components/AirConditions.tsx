import React from "react";
import { WeatherData } from "../types/weather";
import { FaWind, FaTint, FaThermometerHalf, FaSun } from "react-icons/fa";
import GlassCard from "./common/GlassCard";
import Skeleton from "./common/Skeleton";

interface AirConditionsProps {
  current?: WeatherData["current"];
  loading?: boolean;
}

const AirConditions: React.FC<AirConditionsProps> = ({ current, loading }) => {
  const showSkeleton = loading || !current;

  const conditions = [
    {
      label: "Real Feel",
      value: current?.realFeel + "°",
      icon: FaThermometerHalf,
      desc: "Actual feel",
    },
    {
      label: "Wind",
      value: current?.windSpeed + " km/h",
      icon: FaWind,
      desc: "Gusts",
    },
    {
      label: "Chance of Rain",
      value: current?.chanceOfRain + "%",
      icon: FaTint,
      desc: "Probability",
    },
    {
      label: "UV Index",
      value: current?.uvIndex,
      icon: FaSun,
      desc: "Moderate",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 ml-1">
        Air Conditions
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {conditions.map((item, index) => (
          <GlassCard
            key={index}
            className="flex flex-col justify-between p-4 min-h-[120px]"
          >
            <div className="flex items-center space-x-2 text-white/60 mb-2">
              <item.icon className="text-lg" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>

            {showSkeleton ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-white">
                  {item.value}
                </div>
                <div className="text-xs text-white/50 mt-1">{item.desc}</div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default AirConditions;
