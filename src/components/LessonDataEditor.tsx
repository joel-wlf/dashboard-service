"use client";

import { useState, useEffect } from "react";

interface LessonPeriod {
  type: "stunde" | "pause";
  start: string;
  end: string;
}

interface LessonDataEditorProps {
  value: LessonPeriod[];
  onChange: (newData: LessonPeriod[]) => void;
}

export default function LessonDataEditor({ value, onChange }: LessonDataEditorProps) {
  const [lessonData, setLessonData] = useState<LessonPeriod[]>(value || []);

  // Synchronize local state when props change
  useEffect(() => {
    setLessonData(value || []);
  }, [value]);

  const handlePeriodChange = (index: number, field: keyof LessonPeriod, newValue: string) => {
    const updatedData = [...lessonData];
    updatedData[index] = { ...updatedData[index], [field]: newValue };
    setLessonData(updatedData);
    onChange(updatedData);
  };

  const addPeriod = () => {
    const newPeriod: LessonPeriod = {
      type: "stunde",
      start: "08:00",
      end: "09:30"
    };
    const updatedData = [...lessonData, newPeriod];
    setLessonData(updatedData);
    onChange(updatedData);
  };

  const removePeriod = (index: number) => {
    const updatedData = lessonData.filter((_, i) => i !== index);
    setLessonData(updatedData);
    onChange(updatedData);
  };

  const movePeriodUp = (index: number) => {
    if (index === 0) return;
    const updatedData = [...lessonData];
    [updatedData[index - 1], updatedData[index]] = [updatedData[index], updatedData[index - 1]];
    setLessonData(updatedData);
    onChange(updatedData);
  };

  const movePeriodDown = (index: number) => {
    if (index === lessonData.length - 1) return;
    const updatedData = [...lessonData];
    [updatedData[index], updatedData[index + 1]] = [updatedData[index + 1], updatedData[index]];
    setLessonData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Stundenplan bearbeiten</h3>
        <button
          onClick={addPeriod}
          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          + Periode hinzufügen
        </button>
      </div>

      {lessonData.length === 0 ? (
        <div className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
          Keine Perioden definiert. Klicken Sie auf "Periode hinzufügen" um zu beginnen.
        </div>
      ) : (
        <div className="space-y-3">
          {lessonData.map((period, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                {/* Type selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Typ</label>
                  <select
                    value={period.type}
                    onChange={(e) => handlePeriodChange(index, "type", e.target.value as "stunde" | "pause")}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="stunde">Unterricht</option>
                    <option value="pause">Pause</option>
                  </select>
                </div>

                {/* Start time */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
                  <input
                    type="time"
                    value={period.start}
                    onChange={(e) => handlePeriodChange(index, "start", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* End time */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ende</label>
                  <input
                    type="time"
                    value={period.end}
                    onChange={(e) => handlePeriodChange(index, "end", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => movePeriodUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Nach oben"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => movePeriodDown(index)}
                    disabled={index === lessonData.length - 1}
                    className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Nach unten"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePeriod(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Löschen"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Period preview */}
              <div className="mt-2 text-xs text-gray-500">
                {period.type === "stunde" ? "📚 Unterricht" : "☕ Pause"} von {period.start} bis {period.end}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
        💡 Tipp: Ordnen Sie die Perioden chronologisch an. Die Fortschrittsanzeige erkennt automatisch die aktuelle Periode basierend auf der Uhrzeit.
      </div>
    </div>
  );
}