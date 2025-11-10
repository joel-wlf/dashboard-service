"use client";

import { useState, useEffect } from "react";
import LessonDataEditor from "./LessonDataEditor";

interface Setting {
  _id: string;
  _rev: string;
  key: string;
  value: any;
}

interface SettingsEditorProps {
  settings: Setting[];
  onSettingChange: (key: string, value: any) => void;
}

// Define all the settings that should exist with their defaults and metadata
const SETTING_DEFINITIONS = {
  show_clock: {
    label: "Uhr anzeigen",
    description: "Zeigt die aktuelle Uhrzeit auf dem Hauptbildschirm an",
    type: "boolean",
    defaultValue: true,
    category: "Anzeige",
    icon: "🕐"
  },
  show_weather: {
    label: "Wetter anzeigen",
    description: "Zeigt das aktuelle Wetter auf dem Dashboard an",
    type: "boolean", 
    defaultValue: true,
    category: "Anzeige",
    icon: "🌤️"
  },
  zip_code: {
    label: "Postleitzahl",
    description: "Postleitzahl für die Wetteranzeige",
    type: "string",
    defaultValue: "",
    category: "Standort",
    icon: "📍",
    placeholder: "z.B. 10115"
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
    step: 5
  },
  lesson_data: {
    label: "Stundenplan",
    description: "Zeitplan für Unterrichtsstunden und Pausen",
    type: "lesson_schedule",
    defaultValue: [],
    category: "Zeitplanung",
    icon: "📚"
  },
  show_overtime_alarm: {
    label: "Überzieh-Alarm anzeigen",
    description: "Zeigt eine Vollbild-Warnung an, wenn eine Stunde oder Pause überzogen wird",
    type: "boolean",
    defaultValue: true,
    category: "Zeitplanung",
    icon: "🚨"
  }
};

export default function SettingsEditor({ settings, onSettingChange }: SettingsEditorProps) {
  // Group settings by category
  const categories = Array.from(new Set(Object.values(SETTING_DEFINITIONS).map(def => def.category)));
  
  // Get setting value or default
  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : SETTING_DEFINITIONS[key as keyof typeof SETTING_DEFINITIONS]?.defaultValue;
  };

  // Render different input types
  const renderSettingInput = (key: string, definition: any) => {
    const value = getSettingValue(key);

    switch (definition.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onSettingChange(key, e.target.checked)}
              className="h-5 w-5 rounded focus:ring-2"
              style={{
                accentColor: 'var(--button-primary)',
                backgroundColor: 'var(--admin-input)',
                borderColor: 'var(--admin-border)'
              }}
            />
            <span className={`text-sm font-medium ${value ? 'text-green-400' : 'text-gray-400'}`}>
              {value ? "Aktiviert" : "Deaktiviert"}
            </span>
          </div>
        );

      case "string":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onSettingChange(key, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{
              backgroundColor: 'var(--admin-input)',
              borderColor: 'var(--admin-border)',
              color: 'var(--foreground)'
            }}
            placeholder={definition.placeholder || "Wert eingeben..."}
          />
        );

      case "number":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={definition.min || 0}
              max={definition.max || 100}
              step={definition.step || 1}
              value={value || definition.defaultValue}
              onChange={(e) => onSettingChange(key, parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: 'var(--progress-bg)',
                accentColor: 'var(--button-primary)'
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{definition.min || 0}</span>
              <div className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--accent-foreground)' }}>{value || definition.defaultValue}{key === 'zoom_level' ? '%' : ''}</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{definition.max || 100}</span>
            </div>
          </div>
        );

      case "lesson_schedule":
        return (
          <LessonDataEditor
            value={value || []}
            onChange={(newData) => onSettingChange(key, newData)}
          />
        );

      default:
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onSettingChange(key, parsed);
              } catch {
                onSettingChange(key, e.target.value);
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm"
            style={{
              backgroundColor: 'var(--admin-input)',
              borderColor: 'var(--admin-border)',
              color: 'var(--foreground)'
            }}
            rows={4}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category} className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
          <div className="px-6 py-4 border-b" style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--admin-border)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{category}</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {Object.entries(SETTING_DEFINITIONS)
              .filter(([_, def]) => def.category === category)
              .map(([key, definition]) => (
                <div key={key} className="rounded-lg p-5 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{definition.icon}</div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-lg font-medium flex items-center space-x-2" style={{ color: 'var(--foreground)' }}>
                          <span>{definition.label}</span>
                          {key === 'lesson_data' && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                              Erweitert
                            </span>
                          )}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{definition.description}</p>
                      </div>
                      
                      <div className="pt-2">
                        {renderSettingInput(key, definition)}
                      </div>
                      
                      <div className="text-xs px-3 py-1 rounded border" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--admin-input)', borderColor: 'var(--border)' }}>
                        <span className="font-mono">Schlüssel: {key}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      <div className="border rounded-lg p-4" style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)' }}>
        <div className="flex items-start space-x-3">
          <div className="text-xl" style={{ color: 'var(--button-primary)' }}>ℹ️</div>
          <div>
            <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Über diese Einstellungen</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Alle Änderungen werden automatisch gespeichert und in Echtzeit auf dem Dashboard angewendet. 
              Die Einstellungen werden sicher in Ihrer CouchDB-Datenbank gespeichert.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}