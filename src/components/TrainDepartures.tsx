"use client";

import { IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface TrainData {
  stop: {
    name: string;
  };
  when: string;
  delay?: number;
  provenance: string;
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
  const [trainData, setTrainData] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShowingArrivals, setIsShowingArrivals] = useState(false);

  const fetchTrainData = async (second: boolean) => {
    try {
      !second && setLoading(true);

      // Check current time to determine if we should show arrivals or departures
      const now = new Date();
      const currentHour = now.getHours();
      const showArrivals = currentHour < 11;
      setIsShowingArrivals(showArrivals);

      // Fetch arrivals or departures based on time
      const endpoint = showArrivals ? "arrivals" : "departures";
      const response = await fetch(
        `https://v6.db.transport.rest/stops/8000294/${endpoint}?results=20&duration=120&bus=false&tram=false&subway=false&taxi=false&ferry=false&national=false&nationalExpress=false`
      );

      console.log(`Train ${endpoint} response:`, response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const dataKey = showArrivals ? "arrivals" : "departures";
      const sortedTrainData = (data[dataKey] || []).sort(
        (a: TrainData, b: TrainData) =>
          new Date(a.when).getTime() - new Date(b.when).getTime()
      );
      setTrainData(sortedTrainData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch train data:", err);
      setError("Failed to load train data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTrainData(false);

    // Refresh every 30 seconds
    const interval = setInterval(() => fetchTrainData(true), 30000);

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
        <h2 className='text-xl font-bold font-mono mb-4 text-white'>
          Osnabrück HBF {isShowingArrivals ? "Ankünfte" : "Abfahrten"}
        </h2>
        <p className='text-red-400'>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col overflow-hidden`}>
      <h2 className='text-xl font-bold mb-2 text-white text-center'>
        Osnabrück HBF {isShowingArrivals ? "Ankünfte" : "Abfahrten"}
      </h2>
      <div className='space-y-2 overflow-y-auto'>
        {trainData.slice(0, 8).map((train, index) => (
          <div
            key={index}
            className={`rounded-lg p-1 px-2 text-sm ${
              isShowingArrivals
                ? "border-l-4 border-green-400"
                : "border-l-4 border-blue-400"
            }`}
            style={{
              backgroundColor: isShowingArrivals
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(59, 130, 246, 0.15)",
            }}
          >
            <div className='flex font-mono text-lg justify-between items-center text-white'>
              <div className='flex gap-3 items-center min-w-0 flex-1'>
                <div
                  className={`font-bold px-2 py-1 rounded text-xs ${
                    isShowingArrivals
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {train.line.name}
                </div>
                {isShowingArrivals ? (
                  <IconArrowLeft className='size-5 text-green-400' />
                ) : (
                  <IconArrowRight className='size-5 text-blue-400' />
                )}
                <p
                  className={`truncate ${
                    isShowingArrivals ? "text-green-200" : "text-blue-200"
                  }`}
                >
                  {isShowingArrivals ? train.provenance : train.direction}
                </p>
              </div>
              <div className='text-right ml-4'>
                <span
                  className={`font-mono font-bold text-lg ${
                    isShowingArrivals ? "text-green-300" : "text-blue-300"
                  }`}
                >
                  {formatTime(train.when)}
                </span>
                {train.delay !== 0 && train.delay && train.delay > 0 && (
                  <span className='text-red-400 ml-2 font-bold'>
                    {formatDelay(train.delay)}
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
