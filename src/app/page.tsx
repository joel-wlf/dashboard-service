"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<any[]>([]);
  const [affirmation, setAffirmation] = useState<string>("");

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
  const weatherLocation = settings.find(
    (s) => s.key === "weather_location"
  )?.value;

  useEffect(() => {
    
    setInterval(() => {
      if (showAffirmation) {
        fetch("https://www.affirmations.dev/")
          .then((res) => res.json())
          .then((data) => {
            setAffirmation(data.affirmation.toString());
          });
      }
    }, 1000 * 60 * 60); // Update affirmation every hour
  }, []);

  console.log(settings);

  return (
    <main className='h-screen max-h-screen grid grid-cols-3 grid-rows-2 '>
      <div className='col-span-3 flex flex-col'>
        <div className='h-[10%] bg-red-500'></div>
        <div className='h-[90%] flex flex-col justify-center items-center'>
          {showClock && (
            <p className='text-[128px]'>{time.toLocaleTimeString("de")}</p>
          )}
          {showAffirmation && <p className='text-2xl'>{affirmation}</p>}
        </div>
      </div>
      <div className=' bg-blue-500'></div>
      <div className=' bg-green-500'></div>
      <div className=' bg-pink-500'></div>
    </main>
  );
}
