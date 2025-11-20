// src/services/geocoding.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  flag?: string;
}

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1";

// Helper: Convert "US" -> 🇺🇸
const getCountryFlag = (countryCode: string) => {
  if (!countryCode) return "🏳️";
  const codePoints = countryCode
    .toUpperCase() // This ensures any input is uppercase (redundant but safe)
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country: string;
  admin1?: string;
}

/**
 * Search for cities by name (Auto-complete) - Uses Open-Meteo
 */
export async function getCityRecommendations(
  searchTerm: string,
  count: number = 5
): Promise<Coordinates[]> {
  // ... (No change needed here as Open-Meteo returns uppercase country_code) ...
  if (!searchTerm.trim() || searchTerm.length < 2) return [];

  const url = `${GEOCODING_API_URL}/search?name=${encodeURIComponent(
    searchTerm.trim()
  )}&count=${count}&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);

    const data = await response.json();

    if (!data.results) return [];

    return data.results.map((result: OpenMeteoResult) => ({
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.name,
      country: result.country,
      countryCode: result.country_code,
      admin1: result.admin1,
      flag: result.country_code ? getCountryFlag(result.country_code) : "🏳️",
    }));
  } catch (error) {
    console.error("Error fetching city data:", error);
    return [];
  }
}

export async function getCoordinatesForCity(
  cityName: string
): Promise<Coordinates | null> {
  const results = await getCityRecommendations(cityName, 1);
  return results.length > 0 ? results[0] : null;
}

/**
 * Reverse Geocoding: Get City Name from GPS Coordinates - Uses BigDataCloud
 */
export async function getCityNameFromCoordinates(
  lat: number,
  lon: number
): Promise<Coordinates | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    // --- FIX APPLIED HERE ---
    // Ensure the country code is uppercase for flag generation,
    // as BigDataCloud returns it lowercase (e.g., 'np').
    const code = data.countryCode
      ? String(data.countryCode).toUpperCase()
      : undefined;
    // --- END FIX ---

    return {
      latitude: lat,
      longitude: lon,
      city: data.city || data.locality || "Unknown Location",
      country: data.countryName,
      countryCode: code,
      admin1: data.principalSubdivision,
      flag: code ? getCountryFlag(code) : "🏳️",
    };
  } catch (error) {
    console.error("Reverse geocoding failed", error);
    return null;
  }
}
