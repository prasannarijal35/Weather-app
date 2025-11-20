// src/app/api/weather/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getWeatherData } from "../../../services/openmeteo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");

  if (!lat || !lon || !city) {
    return NextResponse.json(
      { error: "Missing latitude, longitude, or city" },
      { status: 400 }
    );
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    const data = await getWeatherData(latitude, longitude, city);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data from API." },
      { status: 500 }
    );
  }
}
