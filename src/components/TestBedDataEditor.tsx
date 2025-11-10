"use client";

interface TestBedData {
  ort: string;
  gruppe: string;
}

interface TestBedDataEditorProps {
  value: TestBedData[];
  onChange: (data: TestBedData[]) => void;
}

export default function TestBedDataEditor({
  value,
  onChange,
}: TestBedDataEditorProps) {
  // Feste Server-Liste
  const servers = ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "2.4"];

  // Funktion zum Abrufen der aktuellen Gruppe für einen Server
  const getGroupForServer = (ort: string): string => {
    const existing = value.find((item) => item.ort === ort);
    return existing?.gruppe || "";
  };

  // Funktion zum Aktualisieren einer Gruppe
  const updateGroup = (ort: string, gruppe: string) => {
    const updated = [...value];
    const existingIndex = updated.findIndex((item) => item.ort === ort);

    if (existingIndex >= 0) {
      if (gruppe.trim()) {
        updated[existingIndex] = { ort, gruppe };
      } else {
        // Entferne Eintrag wenn Gruppe leer ist
        updated.splice(existingIndex, 1);
      }
    } else if (gruppe.trim()) {
      // Füge neuen Eintrag hinzu wenn Gruppe nicht leer ist
      updated.push({ ort, gruppe });
    }

    onChange(updated);
  };

  // Gruppiere Server nach Räumen
  const room1Servers = servers.filter((s) => s.startsWith("1."));
  const room2Servers = servers.filter((s) => s.startsWith("2."));

  const renderServerGroup = (roomServers: string[]) => (
    <div className='space-y-3'>
      <div className='space-y-2'>
        {roomServers.map((server) => (
          <div
            key={server}
            className='flex items-center space-x-3 p-3 rounded-lg border'
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className='w-12 font-mono font-bold text-center'
              style={{ color: "var(--foreground)" }}
            >
              {server}
            </div>
            <input
              type='text'
              value={getGroupForServer(server)}
              onChange={(e) => updateGroup(server, e.target.value)}
              placeholder='Gruppenname eingeben...'
              className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
              style={{
                backgroundColor: "var(--admin-input)",
                borderColor: "var(--admin-border)",
                color: "var(--foreground)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Zwei-Spalten Layout */}
      <div className='grid grid-cols-2 gap-6'>
        {renderServerGroup(room1Servers)}
        {renderServerGroup(room2Servers)}
      </div>
    </div>
  );
}
