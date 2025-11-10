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
        <h3 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>Stundenplan bearbeiten</h3>
        <button
          onClick={addPeriod}
          className="px-3 py-1 rounded-md transition-colors text-sm text-white"
          style={{ backgroundColor: 'var(--button-success)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--button-success-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--button-success)'}
        >
          + Periode hinzufügen
        </button>
      </div>

      {lessonData.length === 0 ? (
        <div className="text-center py-4 border-2 border-dashed rounded-md" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
          Keine Perioden definiert. Klicken Sie auf "Periode hinzufügen" um zu beginnen.
        </div>
      ) : (
        <div className="space-y-3">
          {lessonData.map((period, index) => (
            <div key={index} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                {/* Type selector */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Typ</label>
                  <select
                    value={period.type}
                    onChange={(e) => handlePeriodChange(index, "type", e.target.value as "stunde" | "pause")}
                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      backgroundColor: 'var(--admin-input)', 
                      borderColor: 'var(--admin-border)', 
                      color: 'var(--foreground)',
                      focusRingColor: 'var(--button-primary)'
                    }}
                  >
                    <option value="stunde">Unterricht</option>
                    <option value="pause">Pause</option>
                  </select>
                </div>

                {/* Start time */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Start</label>
                  <input
                    type="time"
                    value={period.start}
                    onChange={(e) => handlePeriodChange(index, "start", e.target.value)}
                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      backgroundColor: 'var(--admin-input)', 
                      borderColor: 'var(--admin-border)', 
                      color: 'var(--foreground)',
                      focusRingColor: 'var(--button-primary)'
                    }}
                  />
                </div>

                {/* End time */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Ende</label>
                  <input
                    type="time"
                    value={period.end}
                    onChange={(e) => handlePeriodChange(index, "end", e.target.value)}
                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      backgroundColor: 'var(--admin-input)', 
                      borderColor: 'var(--admin-border)', 
                      color: 'var(--foreground)',
                      focusRingColor: 'var(--button-primary)'
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => movePeriodUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: index === 0 ? 'var(--muted-foreground)' : 'var(--button-primary)' }}
                    title="Nach oben"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => movePeriodDown(index)}
                    disabled={index === lessonData.length - 1}
                    className="p-1 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: index === lessonData.length - 1 ? 'var(--muted-foreground)' : 'var(--button-primary)' }}
                    title="Nach unten"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePeriod(index)}
                    className="p-1 hover:opacity-80"
                    style={{ color: 'var(--button-danger)' }}
                    title="Löschen"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Period preview */}
              <div className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {period.type === "stunde" ? "📚 Unterricht" : "☕ Pause"} von {period.start} bis {period.end}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs p-3 rounded-md" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--accent)' }}>
        💡 Tipp: Ordnen Sie die Perioden chronologisch an. Die Fortschrittsanzeige erkennt automatisch die aktuelle Periode basierend auf der Uhrzeit.
      </div>
    </div>
  );
}