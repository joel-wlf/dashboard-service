"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  wind_speed: number;
  humidity?: number;
}

interface WeatherWidgetProps {
  zipCode: string;
}

export default function WeatherWidget({ zipCode }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!zipCode) return;
    
    try {
      setError(null);
      
      // Step 1: Convert ZIP to coordinates
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=DE&format=json&limit=1`,
        { headers: { "User-Agent": "Dashboard/1.0" } }
      );
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        throw new Error("ZIP code not found");
      }

      const { lat, lon } = geoData[0];

      // Step 2: Get weather data
      const weatherRes = await fetch(
        `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.weather) {
        setWeather({
          temperature: Math.round(weatherData.weather.temperature),
          condition: weatherData.weather.condition,
          wind_speed: weatherData.weather.wind_speed,
          humidity: weatherData.weather.relative_humidity
        });
      } else {
        throw new Error("No weather data available");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!zipCode) return;

    // Initial fetch
    fetchWeather();

    // Set up 5-minute interval
    const weatherInterval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [zipCode]);

  if (!zipCode) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-2">🌍</div>
          <div className="text-sm">No location set</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-pulse text-5xl mb-3">🌤️</div>
          <div className="text-gray-400 text-sm">Loading weather...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-red-500 text-sm font-medium mb-1">Weather unavailable</div>
          <div className="text-xs text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-gray-400 text-sm">No data available</div>
      </div>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || "";
    if (cond.includes("clear") || cond.includes("sunny")) return "☀️";
    if (cond.includes("cloud")) return "☁️";
    if (cond.includes("rain")) return "🌧️";
    if (cond.includes("snow")) return "❄️";
    if (cond.includes("thunder")) return "⛈️";
    if (cond.includes("fog") || cond.includes("mist")) return "🌫️";
    return "🌤️";
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      {/* Main weather icon */}
      <div className="text-[128px]">{getWeatherIcon(weather.condition)}</div>
      
      {/* Temperature */}
      <div className="text-6xl font-bold mb-2">{weather.temperature}°C</div>
      
      {/* Condition */}
      <div className="text-base text-gray-600 capitalize mb-6">
        Osnabrück
      </div>
      
      
    </div>
  );
}