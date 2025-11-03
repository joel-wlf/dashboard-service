"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    fetch("/api/getDocs")
      .then((res) => res.json())
      .then((docs) => setSettings(docs))
      .catch((err) => console.error(err));

    return () => clearInterval(interval);
  }, []);

  const showClock = settings.find((s) => s.key === "show_clock")?.value;

  return (
    <main className='flex h-screen flex-col items-center justify-center p-24'>
      {showClock && <p className='text-7xl'>{time.toLocaleTimeString()}</p>}
    </main>
  );
}
