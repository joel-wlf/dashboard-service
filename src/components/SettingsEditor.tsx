/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import LessonDataEditor from "./LessonDataEditor";
import TestBedDataEditor from "./TestBedDataEditor";

interface Setting {
  _id: string;
  _rev: string;
  key: string;
  value: any;
}

interface SettingsEditorProps {
  settings: Setting[];
  onSave: (changedSettings: { key: string; value: any }[]) => void;
}

// Define all the settings that should exist with their defaults and metadata
const SETTING_DEFINITIONS = {
  show_testbed_info: {
    label: "TestBed Info anzeigen",
    description: "Zeigt die TestBed Server-Informationen auf dem Dashboard an",
    type: "boolean",
    defaultValue: true,
    category: "Anzeige",
    icon: "🖥️",
  },
  testbed_info: {
    label: "TestBed Konfiguration",
    description: "Konfiguration der 4 TestBeds mit individueller Aktivierung/Deaktivierung",
    type: "testbed_data",
    defaultValue: [],
    category: "TestBed",
    icon: "🏢",
  },
  show_clock: {
    label: "Uhr anzeigen",
    description: "Zeigt die aktuelle Uhrzeit auf dem Hauptbildschirm an",
    type: "boolean",
    defaultValue: true,
    category: "Anzeige",
    icon: "🕐",
  },
  show_weather: {
    label: "Wetter anzeigen",
    description: "Zeigt das aktuelle Wetter auf dem Dashboard an",
    type: "boolean",
    defaultValue: true,
    category: "Anzeige",
    icon: "🌤️",
  },
  zip_code: {
    label: "Postleitzahl",
    description: "Postleitzahl für die Wetteranzeige",
    type: "string",
    defaultValue: "",
    category: "Standort",
    icon: "📍",
    placeholder: "z.B. 10115",
  },
  zoom_level: {
    label: "Zoom Level",
    description: "Vergrößerung der Anzeige in Prozent (50-200%)",
    type: "number",
    defaultValue: 100,
    category: "Anzeige",
    icon: "🔍",
    min: 50,
    max: 200,
    step: 5,
  },
  lesson_data: {
    label: "Stundenplan",
    description: "Zeitplan für Unterrichtsstunden und Pausen",
    type: "lesson_schedule",
    defaultValue: [],
    category: "Zeitplanung",
    icon: "📚",
  },
  show_overtime_alarm: {
    label: "Überzieh-Alarm anzeigen",
    description:
      "Zeigt eine Vollbild-Warnung an, wenn eine Stunde oder Pause überzogen wird",
    type: "boolean",
    defaultValue: true,
    category: "Zeitplanung",
    icon: "🚨",
  },
};

export default function SettingsEditor({
  settings,
  onSave,
}: SettingsEditorProps) {
  // Track pending changes that haven't been saved yet
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: any }>({});

  // Handle local setting changes
  const handleLocalChange = useCallback((key: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle save all changes
  const handleSaveChanges = useCallback(() => {
    const changedSettings = Object.entries(pendingChanges).map(([key, value]) => ({
      key,
      value
    }));
    onSave(changedSettings);
    setPendingChanges({});
  }, [pendingChanges, onSave]);

  // Check if there are any pending changes
  const hasChanges = Object.keys(pendingChanges).length > 0;

  // Group settings by category with custom order
  const allCategories = Array.from(
    new Set(Object.values(SETTING_DEFINITIONS).map((def) => def.category))
  );
  const categories = ["TestBed", "Anzeige", "Standort", "Zeitplanung"].filter(
    (cat) => allCategories.includes(cat)
  );

  // Get setting value or default (including pending changes)
  const getSettingValue = (key: string) => {
    // If there's a pending change, use that
    if (key in pendingChanges) {
      return pendingChanges[key];
    }
    
    // Otherwise use the saved setting or default
    const setting = settings.find((s) => s.key === key);
    return setting
      ? setting.value
      : SETTING_DEFINITIONS[key as keyof typeof SETTING_DEFINITIONS]
          ?.defaultValue;
  };

  // Render different input types
  const renderSettingInput = (key: string, definition: any) => {
    const value = getSettingValue(key);

    switch (definition.type) {
      case "boolean":
        return (
          <div className='flex items-center space-x-3'>
            <input
              type='checkbox'
              checked={value || false}
              onChange={(e) => handleLocalChange(key, e.target.checked)}
              className='h-5 w-5 rounded focus:ring-2'
              style={{
                accentColor: "var(--button-primary)",
                backgroundColor: "var(--admin-input)",
                borderColor: "var(--admin-border)",
              }}
            />
            <span
              className={`text-sm font-medium ${
                value ? "text-green-400" : "text-gray-400"
              }`}
            >
              {value ? "Aktiviert" : "Deaktiviert"}
            </span>
          </div>
        );

      case "string":
        return (
          <input
            type='text'
            value={value || ""}
            onChange={(e) => handleLocalChange(key, e.target.value)}
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent'
            style={{
              backgroundColor: "var(--admin-input)",
              borderColor: "var(--admin-border)",
              color: "var(--foreground)",
            }}
            placeholder={definition.placeholder || "Wert eingeben..."}
          />
        );

      case "number":
        return (
          <div className='space-y-2'>
            <input
              type='range'
              min={definition.min || 0}
              max={definition.max || 100}
              step={definition.step || 1}
              value={value || definition.defaultValue}
              onChange={(e) =>
                handleLocalChange(key, parseFloat(e.target.value))
              }
              className='w-full h-2 rounded-lg appearance-none cursor-pointer'
              style={{
                backgroundColor: "var(--progress-bg)",
                accentColor: "var(--button-primary)",
              }}
            />
            <div className='flex justify-between items-center'>
              <span
                className='text-sm'
                style={{ color: "var(--muted-foreground)" }}
              >
                {definition.min || 0}
              </span>
              <div
                className='px-3 py-1 rounded-full'
                style={{ backgroundColor: "var(--accent)" }}
              >
                <span
                  className='text-sm font-semibold'
                  style={{ color: "var(--accent-foreground)" }}
                >
                  {value || definition.defaultValue}
                  {key === "zoom_level" ? "%" : ""}
                </span>
              </div>
              <span
                className='text-sm'
                style={{ color: "var(--muted-foreground)" }}
              >
                {definition.max || 100}
              </span>
            </div>
          </div>
        );

      case "lesson_schedule":
        return (
          <LessonDataEditor
            value={value || []}
            onChange={(newData) => handleLocalChange(key, newData)}
          />
        );

      case "testbed_data":
        return (
          <TestBedDataEditor
            value={value || []}
            onChange={(newData) => handleLocalChange(key, newData)}
          />
        );

      default:
        return (
          <textarea
            value={
              typeof value === "string" ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleLocalChange(key, parsed);
              } catch {
                handleLocalChange(key, e.target.value);
              }
            }}
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm'
            style={{
              backgroundColor: "var(--admin-input)",
              borderColor: "var(--admin-border)",
              color: "var(--foreground)",
            }}
            rows={4}
          />
        );
    }
  };

  return (
    <>
      <div className='space-y-8'>
        {categories.map((category) => (
        <div
          key={category}
          className='rounded-xl shadow-sm border overflow-hidden'
          style={{
            backgroundColor: "var(--admin-card)",
            borderColor: "var(--admin-border)",
          }}
        >
          <div
            className='px-6 py-4 border-b'
            style={{
              backgroundColor: "var(--accent)",
              borderColor: "var(--admin-border)",
            }}
          >
            <h3
              className='text-lg font-semibold'
              style={{ color: "var(--foreground)" }}
            >
              {category}
            </h3>
          </div>

          <div className='p-6 space-y-6'>
            {Object.entries(SETTING_DEFINITIONS)
              .filter(([_, def]) => def.category === category)
              .map(([key, definition]) => (
                <div
                  key={key}
                  className='rounded-lg p-5 border'
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className='flex items-start space-x-4'>
                    <div className='text-2xl'>{definition.icon}</div>
                    <div className='flex-1 space-y-3'>
                      <div>
                        <h4
                          className='text-lg font-medium flex items-center space-x-2'
                          style={{ color: "var(--foreground)" }}
                        >
                          <span>{definition.label}</span>
                        </h4>
                        <p
                          className='text-sm mt-1'
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {definition.description}
                        </p>
                      </div>

                      <div className='pt-2'>
                        {renderSettingInput(key, definition)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        ))}

        <div
          className='border rounded-lg p-4'
          style={{
            backgroundColor: "var(--accent)",
            borderColor: "var(--border)",
          }}
        >
          <div className='flex items-start space-x-3'>
            <div className='text-xl' style={{ color: "var(--button-primary)" }}>
              ℹ️
            </div>
            <div>
              <h4 className='font-medium' style={{ color: "var(--foreground)" }}>
                Über diese Einstellungen
              </h4>
              <p
                className='text-sm mt-1'
                style={{ color: "var(--muted-foreground)" }}
              >
                Ändern Sie die Einstellungen und klicken Sie &quot;Speichern&quot; um sie zu übernehmen.
                Die Einstellungen werden sicher in Ihrer CouchDB-Datenbank gespeichert.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      {hasChanges && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t shadow-lg z-50"
          style={{
            backgroundColor: "var(--admin-card)",
            borderColor: "var(--admin-border)",
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg">💾</div>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>
                  Ungespeicherte Änderungen
                </p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {Object.keys(pendingChanges).length} Einstellung{Object.keys(pendingChanges).length !== 1 ? 'en' : ''} geändert
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveChanges}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--button-primary)" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary)'}
            >
              Alle Änderungen speichern
            </button>
          </div>
        </div>
      )}
    </>
  );
}
