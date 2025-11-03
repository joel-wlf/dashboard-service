"use client";

import { useEffect, useState } from "react";
import mqtt from "mqtt";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<any[]>([]);
  const [mqttMessage, setMqttMessage] = useState<string>("");

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
    // Connect to broker via WebSocket (broker must support it!)
    const client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL, {
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
    });

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe("commands", (err) => {
        if (!err) console.log("Subscribed to commands");
      });
    });

    client.on("message", (topic, payload) => {
      const msg = payload.toString();
      console.log("MQTT message:", msg);
      setMqttMessage(msg);
    });

    client.on("error", (err) => {
      console.error("MQTT error:", err);
    });

    // Time updates every second
    const clockInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Initial settings fetch + polling
    fetchSettings();
    const settingsInterval = setInterval(fetchSettings, 5000);

    // Cleanup
    return () => {
      clearInterval(clockInterval);
      clearInterval(settingsInterval);
      client.end(true);
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

  return (
    <main className='flex h-screen flex-col items-center justify-center p-24 space-y-6'>
      {showClock && <p className='text-7xl'>{time.toLocaleTimeString()}</p>}
      {showAffirmation && <p className='text-2xl italic'>Stay curious.</p>}
      {showWeather && (
        <p className='text-lg text-gray-500'>
          Weather in {weatherLocation ?? "your location"} coming soon…
        </p>
      )}
      <div className='text-sm text-gray-400'>
        Last MQTT message: {mqttMessage || "none yet"}
      </div>
    </main>
  );
}
