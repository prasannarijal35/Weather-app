import React, { useMemo } from "react";
import { DailyDataPoint } from "../types/weather";
import Icon from "./common/Icon";
import GlassCard from "./common/GlassCard";
import Skeleton from "./common/Skeleton";

interface SevenDayForecastProps {
  daily?: DailyDataPoint[];
  loading?: boolean;
}

const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  daily,
  loading,
}) => {
  // Helper: Calculate the global min/max for the week to render the bars accurately
  const { minTempOfWeek, maxTempOfWeek } = useMemo(() => {
    if (!daily || daily.length === 0)
      return { minTempOfWeek: 0, maxTempOfWeek: 100 };

    const min = Math.min(...daily.map((d) => d.temperatureMin));
    const max = Math.max(...daily.map((d) => d.temperatureMax));

    // Add a small buffer so bars aren't touching the edges exactly
    return { minTempOfWeek: min, maxTempOfWeek: max };
  }, [daily]);

  // Helper to calculate bar position
  const calculateBarPosition = (min: number, max: number) => {
    const totalRange = maxTempOfWeek - minTempOfWeek;
    if (totalRange === 0) return { left: "0%", width: "100%" }; // Prevent division by zero

    const leftPercent = ((min - minTempOfWeek) / totalRange) * 100;
    const widthPercent = ((max - min) / totalRange) * 100;

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const showSkeleton = loading || !daily;

  return (
    <GlassCard className="h-full p-6">
      <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-6">
        7-Day Forecast
      </h2>

      <div className="space-y-3">
        {showSkeleton
          ? // --- SKELETON LOADING STATE ---
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 items-center py-2">
                <Skeleton className="h-4 w-10 col-span-1" />
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))
          : // --- REAL DATA STATE ---
            daily.map((dayData, index) => {
              const { left, width } = calculateBarPosition(
                dayData.temperatureMin,
                dayData.temperatureMax
              );

              return (
                <div
                  key={`${dayData.date}-${index}`}
                  className="grid grid-cols-[3rem_1fr_2fr] md:grid-cols-[4rem_1fr_3fr] items-center py-2 border-b border-white/5 last:border-0"
                >
                  {/* 1. Day Name */}
                  <span className="text-white/90 font-medium text-sm">
                    {index === 0 ? "Today" : dayData.date}
                  </span>

                  {/* 2. Icon */}
                  <div className="flex justify-center items-center">
                    <Icon type={dayData.icon} className="text-2xl" />
                  </div>

                  {/* 3. Temp Bar & Numbers */}
                  <div className="flex items-center w-full space-x-3">
                    <span className="text-white/50 text-xs w-8 text-right">
                      {dayData.temperatureMin}°
                    </span>

                    {/* The Visual Range Bar */}
                    <div className="flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-linear-to-r from-cyan-300 to-yellow-400 opacity-80"
                        style={{
                          left: left,
                          width: width,
                          minWidth: "10px", // Ensure even small ranges are visible
                        }}
                      />
                    </div>

                    <span className="text-white text-xs w-8 text-left font-bold">
                      {dayData.temperatureMax}°
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </GlassCard>
  );
};

export default SevenDayForecast;
