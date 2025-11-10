"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Departure {
  stop: {
    name: string;
  };
  when: string;
  delay?: number;
  line: {
    name: string;
  };
  direction: string;
}

interface TrainDeparturesProps {
  className?: string;
}

export default function TrainDepartures({
  className = "",
}: TrainDeparturesProps) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartures = async (second: boolean) => {
    try {
      !second && setLoading(true);
      const response = await fetch(
        "https://v6.db.transport.rest/stops/8000294/departures?results=20&duration=60&bus=false&tram=false&subway=false&taxi=false&ferry=false&national=false&nationalExpress=false"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const sortedDepartures = (data.departures || []).sort(
        (a: Departure, b: Departure) =>
          new Date(a.when).getTime() - new Date(b.when).getTime()
      );
      setDepartures(sortedDepartures);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch train departures:", err);
      setError("Failed to load train departures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDepartures(false);

    // Refresh every 30 seconds
    const interval = setInterval(() => fetchDepartures(true), 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (when: string) => {
    return new Date(when).toLocaleTimeString("de", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDelay = (delay?: number) => {
    if (!delay || delay === 0) return "";
    return `+${Math.floor(delay / 60)}`;
  };

  if (loading) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center`}
      ></div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center`}>
        <h2 className='text-xl font-bold mb-4 text-white'>Osnabrück HBF Abfahrten</h2>
        <p className='text-red-400'>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col overflow-hidden`}>
      <div className='space-y-2 overflow-y-auto'>
        {departures.slice(0, 8).map((departure, index) => (
          <div key={index} className='rounded p-1 text-sm' style={{ backgroundColor: 'var(--train-card)' }}>
            <div className='flex font-mono text-lg justify-between items-start text-white'>
              <div className="flex gap-2 items-center">
                <p>{departure.line.name}</p> <IconArrowRight className="size-4" />
                <p>{departure.direction}</p>
              </div>
              <div className='text-right'>
                <span className='font-mono'>{formatTime(departure.when)}</span>
                {departure.delay !== 0 && departure.delay > 0 && (
                  <span className='text-red-400 ml-1'>
                    {formatDelay(departure.delay)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
