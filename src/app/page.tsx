"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Initial fetch and periodic update of settings
    fetch("/api/getSettings")
      .then((res) => res.json())
      .then((docs) => setSettings(docs))
      .catch((err) => console.error(err));

    return () => clearInterval(interval);
  }, []);

  // Extract setting values
  const showClock = settings.find((s) => s.key === "show_clock")?.value;
  const showAffirmation = settings.find(
    (s) => s.key === "show_affirmation"
  )?.value;
  const showWeather = settings.find((s) => s.key === "show_weather")?.value;
  const weatherLocation = settings.find(
    (s) => s.key === "weather_location"
  )?.value;

  return (
    <main className='flex h-screen flex-col items-center justify-center p-24'>
      {showClock && <p className='text-7xl'>{time.toLocaleTimeString()}</p>}
    </main>
  );
}
