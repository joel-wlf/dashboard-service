"use client";

interface TestBedData {
  ort: string;
  gruppe: string;
}

interface TestBedConfig {
  testbedId: number;
  name: string;
  enabled: boolean;
  servers: TestBedData[];
}

interface TestBedDataEditorProps {
  value: TestBedConfig[];
  onChange: (data: TestBedConfig[]) => void;
}

export default function TestBedDataEditor({
  value,
  onChange,
}: TestBedDataEditorProps) {
  // Initialize 4 testbeds if value is empty or in old format
  const initializeTestBeds = (): TestBedConfig[] => {
    // Check if we have old format data (array of TestBedData)
    if (Array.isArray(value) && value.length > 0 && 'ort' in value[0]) {
      const oldData = value as unknown as TestBedData[];
      return [
        {
          testbedId: 1,
          name: "TestBed 1",
          enabled: true,
          servers: oldData.filter(item => item.ort.startsWith('1.'))
        },
        {
          testbedId: 2,
          name: "TestBed 2", 
          enabled: true,
          servers: oldData.filter(item => item.ort.startsWith('2.'))
        },
        {
          testbedId: 3,
          name: "TestBed 3",
          enabled: false,
          servers: []
        },
        {
          testbedId: 4,
          name: "TestBed 4",
          enabled: false,
          servers: []
        }
      ];
    }

    // If we have new format data, use it
    if (Array.isArray(value) && value.length > 0 && 'testbedId' in value[0]) {
      return value as TestBedConfig[];
    }

    // Default initialization
    return [
      {
        testbedId: 1,
        name: "TestBed 1",
        enabled: true,
        servers: []
      },
      {
        testbedId: 2,
        name: "TestBed 2",
        enabled: true,
        servers: []
      },
      {
        testbedId: 3,
        name: "TestBed 3",
        enabled: false,
        servers: []
      },
      {
        testbedId: 4,
        name: "TestBed 4",
        enabled: false,
        servers: []
      }
    ];
  };

  const testBeds = initializeTestBeds();

  // Generate server IDs for each testbed
  const getServerIds = (testbedId: number): string[] => {
    return [1, 2, 3, 4].map(num => `${testbedId}.${num}`);
  };

  // Get group for a specific server
  const getGroupForServer = (testbedId: number, ort: string): string => {
    const testbed = testBeds.find(tb => tb.testbedId === testbedId);
    const server = testbed?.servers.find(s => s.ort === ort);
    return server?.gruppe || "";
  };

  // Update server group
  const updateServerGroup = (testbedId: number, ort: string, gruppe: string) => {
    const updated = [...testBeds];
    const testbedIndex = updated.findIndex(tb => tb.testbedId === testbedId);
    
    if (testbedIndex >= 0) {
      const serverIndex = updated[testbedIndex].servers.findIndex(s => s.ort === ort);
      
      if (serverIndex >= 0) {
        if (gruppe.trim()) {
          updated[testbedIndex].servers[serverIndex] = { ort, gruppe };
        } else {
          updated[testbedIndex].servers.splice(serverIndex, 1);
        }
      } else if (gruppe.trim()) {
        updated[testbedIndex].servers.push({ ort, gruppe });
      }
    }

    onChange(updated);
  };

  // Toggle testbed enabled state
  const toggleTestBed = (testbedId: number) => {
    const updated = [...testBeds];
    const testbedIndex = updated.findIndex(tb => tb.testbedId === testbedId);
    
    if (testbedIndex >= 0) {
      updated[testbedIndex].enabled = !updated[testbedIndex].enabled;
      onChange(updated);
    }
  };

  // Update testbed name
  const updateTestBedName = (testbedId: number, name: string) => {
    const updated = [...testBeds];
    const testbedIndex = updated.findIndex(tb => tb.testbedId === testbedId);
    
    if (testbedIndex >= 0) {
      updated[testbedIndex].name = name;
      onChange(updated);
    }
  };

  const renderTestBed = (testbed: TestBedConfig) => {
    const serverIds = getServerIds(testbed.testbedId);
    
    return (
      <div
        key={testbed.testbedId}
        className={`rounded-lg border p-4 ${testbed.enabled ? 'opacity-100' : 'opacity-60'}`}
        style={{
          backgroundColor: testbed.enabled ? "var(--card)" : "var(--muted)",
          borderColor: testbed.enabled ? "var(--border)" : "var(--muted-foreground)",
        }}
      >
        {/* TestBed Header */}
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            checked={testbed.enabled}
            onChange={() => toggleTestBed(testbed.testbedId)}
            className="h-5 w-5 rounded"
            style={{
              accentColor: "var(--button-primary)",
            }}
          />
          <input
            type="text"
            value={testbed.name}
            onChange={(e) => updateTestBedName(testbed.testbedId, e.target.value)}
            className="font-bold text-lg px-2 py-1 border rounded"
            style={{
              backgroundColor: "var(--admin-input)",
              borderColor: "var(--admin-border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Server Slots */}
        <div className="space-y-2">
          {serverIds.map((serverId) => (
            <div
              key={serverId}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                testbed.enabled ? '' : 'pointer-events-none'
              }`}
              style={{
                backgroundColor: "var(--admin-input)",
                borderColor: "var(--admin-border)",
              }}
            >
              <div
                className="w-12 font-mono font-bold text-center"
                style={{ color: "var(--foreground)" }}
              >
                {serverId}
              </div>
              <input
                type="text"
                value={getGroupForServer(testbed.testbedId, serverId)}
                onChange={(e) => updateServerGroup(testbed.testbedId, serverId, e.target.value)}
                placeholder="Gruppenname eingeben..."
                disabled={!testbed.enabled}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: testbed.enabled ? "var(--background)" : "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {testBeds.map(testbed => renderTestBed(testbed))}
      </div>
      
      <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
        <strong>Hinweis:</strong> Wenn mehr als 2 TestBeds aktiviert sind, wechselt die Anzeige automatisch alle 3 Sekunden zwischen den Ansichten.
      </div>
    </div>
  );
}
