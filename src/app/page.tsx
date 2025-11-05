"use client";

import { useEffect, useState } from "react";
import TrainDepartures from "@/components/TrainDepartures";
import WeatherWidget from "@/components/WeatherWidget";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<any[]>([]);

  // Fetch settings from your API route
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/getSettings");
      const docs = await res.json();
      setSettings(docs);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  useEffect(() => {
    // Time updates every second
    const clockInterval = setInterval(() => {
      setTime(new Date());
      fetchSettings();
    }, 1000);

    // Initial settings fetch
    fetchSettings();

    // Cleanup
    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  // Extract settings
  const showClock = settings.find((s) => s.key === "show_clock")?.value;
  const showAffirmation = settings.find(
    (s) => s.key === "show_affirmation"
  )?.value;
  const showWeather = settings.find((s) => s.key === "show_weather")?.value;
  const zipCode = settings.find((s) => s.key === "zip_code")?.value;

  console.log(settings);

  return (
      <div className="screensaver-container">

      <main className='h-screen max-h-screen grid grid-cols-3 grid-rows-2 '>
        <div className='col-span-3 flex flex-col'>
          <div className='h-[10%]'></div>
          <div className='h-[90%] border-y flex flex-col justify-center items-center'>
            {showClock && (
              <p className='text-[128px]'>{time.toLocaleTimeString("de")}</p>
            )}
          </div>
        </div>
        <div className=''>
          {showWeather && zipCode && <WeatherWidget zipCode={zipCode} />}
        </div>
        <div className='border-x p-4 overflow-hidden'>
          <TrainDepartures />
        </div>
        <div className=''></div>
      </main>
    </div>
  );
}
