// src/components/CitySearch.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getCityRecommendations,
  getCityNameFromCoordinates,
  Coordinates,
} from "../services/geocoding";
import {
  FaSearch,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";

interface CitySearchProps {
  onSelect: (coords: Coordinates) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState<Coordinates[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce Search Logic
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (searchTerm.length < 2) {
        setRecommendations([]);
        return;
      }

      setIsSearching(true);
      const results = await getCityRecommendations(searchTerm, 5);
      setRecommendations(results);
      setIsSearching(false);
    };

    const handler = setTimeout(fetchRecommendations, 300); // 300ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setRecommendations([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Selection from Dropdown
  const handleSelect = (coords: Coordinates) => {
    onSelect(coords);
    setSearchTerm(coords.city);
    setRecommendations([]);
  };

  // Handle "Use My Location" Button
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    setRecommendations([]); // Hide dropdown if open

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 1. Reverse geocode to get city name
        const coords = await getCityNameFromCoordinates(latitude, longitude);

        if (coords) {
          setSearchTerm(coords.city);
          handleSelect(coords);
        } else {
          alert("Could not determine city from your location.");
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error(error);
        alert(
          "Unable to retrieve your location. Please allow location access."
        );
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div ref={searchRef} className="relative w-full md:w-96 z-50">
      {/* Search Input Container */}
      <div className="flex items-center backdrop-blur-md bg-white/10 border border-white/20 text-white p-3 md:p-4 rounded-full shadow-lg focus-within:bg-white/20 focus-within:border-white/40 transition duration-300">
        <FaSearch className="text-white/60 mr-3" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for cities..."
          className="w-full bg-transparent outline-none placeholder:text-white/50"
        />

        {/* Location Button */}
        <button
          onClick={handleCurrentLocation}
          disabled={isLoadingLocation}
          className="ml-2 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white disabled:opacity-50"
          title="Use my current location"
          type="button"
        >
          {isLoadingLocation ? (
            <FaSpinner className="animate-spin text-lg" />
          ) : (
            <FaLocationArrow className="text-lg" />
          )}
        </button>
      </div>

      {/* Recommendations Dropdown */}
      {(isSearching || recommendations.length > 0) && (
        <div className="absolute w-full mt-2 backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Loading text while typing... */}
          {isSearching && recommendations.length === 0 && (
            <div className="p-4 text-white/50 text-center text-sm">
              Finding cities...
            </div>
          )}

          {recommendations.map((coords) => (
            <div
              key={`${coords.latitude}-${coords.longitude}`}
              className="p-4 cursor-pointer text-white hover:bg-white/10 transition duration-200 border-b border-white/5 last:border-0 flex items-center justify-between group"
              onClick={() => handleSelect(coords)}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <span className="text-white/40 group-hover:text-white transition-colors">
                  <FaMapMarkerAlt />
                </span>

                {/* Text */}
                <div className="flex flex-col">
                  <span className="font-medium text-white text-sm">
                    {coords.city}
                  </span>
                  <span className="text-xs text-white/50">
                    {coords.admin1 ? `${coords.admin1}, ` : ""} {coords.country}
                  </span>
                </div>
              </div>

              {/* Flag */}
              <span className="text-xl opacity-80 grayscale group-hover:grayscale-0 transition-all">
                {coords.flag}
              </span>
            </div>
          ))}

          {/* No results found */}
          {!isSearching &&
            recommendations.length === 0 &&
            searchTerm.length >= 2 && (
              <div className="p-4 text-white/50 text-center text-sm">
                No results found
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
