"use client";

import { useEffect, useState } from "react";
import TrainDepartures from "@/components/TrainDepartures";
import WeatherWidget from "@/components/WeatherWidget";
import LessonProgressBar from "@/components/LessonProgressBar";
import TestBedInfo from "@/components/TestBedInfo";

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
  const showWeather = settings.find((s) => s.key === "show_weather")?.value;
  const zipCode = settings.find((s) => s.key === "zip_code")?.value || 
                  settings.find((s) => s.key === "weather_location")?.value;
  const zoomLevel = settings.find((s) => s.key === "zoom_level")?.value || 100;
  const lessonData = settings.find((s) => s.key === "lesson_data")?.value || [];
  const showOvertimeAlarm =
    settings.find((s) => s.key === "show_overtime_alarm")?.value ?? true;
  const showTestBedInfo = 
    settings.find((s) => s.key === "show_testbed_info")?.value ?? true;
  const testBedData = settings.find((s) => s.key === "testbed_info")?.value || [];

  console.log("Settings:", settings);
  console.log("Show Weather:", showWeather);
  console.log("Zip Code:", zipCode);

  return (
    <div className='screensaver-container'>
      <main
        className='h-screen max-h-screen grid grid-cols-6 grid-rows-2'
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top left",
          width: `${10000 / zoomLevel}%`,
          height: `${10000 / zoomLevel}%`,
        }}
      >
        <div className='col-span-6 flex flex-col'>
          <div className='h-[10%]'>
            <LessonProgressBar
              lessonData={lessonData}
              currentTime={time}
              showOvertimeAlarm={showOvertimeAlarm}
            />
          </div>
          <div className='h-[90%] border-y border-gray-700 flex flex-col justify-center items-center'>
            {showClock && (
              <p className='text-[128px] font-mono text-white'>
                {time.toLocaleTimeString("de")}
              </p>
            )}
          </div>
        </div>
        <div className='col-span-1 font-mono'>
          {showWeather && zipCode && <WeatherWidget zipCode={zipCode} />}
        </div>
        <div className='border-x border-gray-700 p-3 overflow-hidden col-span-2'>
          <TrainDepartures />
        </div>
        {showTestBedInfo && <TestBedInfo testBedData={testBedData} />}
      </main>
    </div>
  );
}
