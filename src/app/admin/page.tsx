"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SettingsEditor from "@/components/SettingsEditor";

interface Setting {
  _id: string;
  _rev: string;
  key: string;
  value: any;
}

export default function AdminPage() {
  // Zustandsvariablen für die Admin-Seite
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // Authentifizierungsstatus beim Laden der Komponente prüfen
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Einstellungen laden wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        // Deutsche Fehlermeldungen basierend auf Server Response
        if (response.status === 429) {
          setLoginError("Zu viele Versuche. Bitte warten Sie 15 Minuten.");
        } else {
          setLoginError("Ungültiges Passwort");
        }
      }
    } catch (error) {
      setLoginError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setSettings([]);
    } catch (error) {
      console.error("Abmeldung fehlgeschlagen:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/getSettings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 401) {
        // Session abgelaufen
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setLoading(true);
    setUpdateMessage("");

    try {
      const response = await fetch("/api/updateSetting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });

      if (response.ok) {
        setUpdateMessage(`Einstellung "${key}" erfolgreich aktualisiert`);
        await loadSettings(); // Einstellungen neu laden
        setTimeout(() => setUpdateMessage(""), 3000);
      } else if (response.status === 401) {
        // Session abgelaufen
        setIsAuthenticated(false);
      } else {
        const error = await response.json();
        setUpdateMessage(`Fehler beim Aktualisieren von "${key}": ${error.error}`);
      }
    } catch (error) {
      setUpdateMessage(`Fehler beim Aktualisieren von "${key}": ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    // Lokalen Zustand sofort aktualisieren für bessere UX
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    );
    
    // Dann Datenbank aktualisieren
    updateSetting(key, value);
  };

  // Anmeldeformular anzeigen wenn nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--admin-bg)' }}>
        <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: 'var(--admin-card)' }}>
          <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--foreground)' }}>Admin Anmeldung</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--admin-input)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--foreground)'
                }}
                required
                placeholder="Admin-Passwort eingeben"
              />
            </div>
            {loginError && (
              <div className="mb-4 text-sm p-3 rounded-md" style={{ color: 'var(--destructive-foreground)', backgroundColor: 'var(--destructive)' }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: loading ? 'var(--muted)' : 'var(--button-primary)'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary)')}
            >
              {loading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard anzeigen wenn authentifiziert
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--admin-bg)' }}>
      <div className="max-w-4xl mx-auto">
      
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-white px-4 py-2 rounded-md transition-colors"
            style={{ backgroundColor: 'var(--button-danger)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--button-danger-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--button-danger)'}
          >
            Abmelden
          </button>
        </div>

        {updateMessage && (
          <div 
            className="mb-4 p-3 rounded-md transition-all border"
            style={{
              backgroundColor: updateMessage.includes("erfolgreich") ? 'var(--button-success)' : 'var(--destructive)',
              color: updateMessage.includes("erfolgreich") ? 'white' : 'var(--destructive-foreground)',
              borderColor: updateMessage.includes("erfolgreich") ? 'var(--button-success-hover)' : 'var(--destructive)'
            }}
          >
            {updateMessage}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Dashboard Einstellungen</h2>
          <SettingsEditor 
            settings={settings} 
            onSettingChange={handleSettingChange}
          />
        </div>
      </div>
    </div>
  );
} 