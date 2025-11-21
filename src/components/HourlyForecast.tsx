import React from "react";
import { HourlyDataPoint } from "../types/weather";
import Icon from "./common/Icon";
import GlassCard from "./common/GlassCard";
import Skeleton from "./common/Skeleton";

interface HourlyForecastProps {
  hourly?: HourlyDataPoint[];
  loading?: boolean;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, loading }) => {
  return (
    <GlassCard className="w-full p-0! overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          Todays Forecast
        </h2>
      </div>

      <div className="flex overflow-x-auto pb-4 px-4 pt-4 gap-4 no-scrollbar scroll-smooth">
        {!hourly || loading
          ? // Render 6 skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-w-20 flex flex-col items-center space-y-3"
              >
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))
          : hourly.map((hourData, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-20 p-3 rounded-xl hover:bg-white/10 transition duration-200"
              >
                <span className="text-sm text-white/60 mb-2">
                  {new Date(hourData.time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                  })}
                </span>
                <Icon
                  type={hourData.icon}
                  className="text-3xl mb-2 text-white"
                />
                <span className="text-lg font-bold text-white">
                  {hourData.temperature}°
                </span>
              </div>
            ))}
      </div>
    </GlassCard>
  );
};

export default HourlyForecast;
