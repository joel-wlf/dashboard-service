"use client";

import { useState, useEffect } from "react";

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

interface TestBedInfoProps {
  testBedData?: TestBedConfig[] | TestBedData[];
}

export default function TestBedInfo({ testBedData = [] }: TestBedInfoProps) {
  const [currentView, setCurrentView] = useState(0);

  // Convert old format to new format if needed
  const normalizeTestBedData = (): TestBedConfig[] => {
    const defaultTestBeds = [
      { testbedId: 1, name: "TestBed 1", enabled: false, servers: [] },
      { testbedId: 2, name: "TestBed 2", enabled: false, servers: [] },
      { testbedId: 3, name: "TestBed 3", enabled: false, servers: [] },
      { testbedId: 4, name: "TestBed 4", enabled: false, servers: [] }
    ];

    // Check if we have old format data (array of TestBedData)
    if (Array.isArray(testBedData) && testBedData.length > 0 && 'ort' in testBedData[0]) {
      const oldData = testBedData as TestBedData[];
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

    // If we have new format data, ensure all 4 testbeds exist
    if (Array.isArray(testBedData) && testBedData.length > 0 && 'testbedId' in testBedData[0]) {
      const existingData = testBedData as TestBedConfig[];
      const result = [...defaultTestBeds];
      
      // Merge existing data with defaults
      existingData.forEach(testbed => {
        const index = result.findIndex(tb => tb.testbedId === testbed.testbedId);
        if (index >= 0) {
          result[index] = testbed;
        }
      });
      
      return result;
    }

    // Return defaults if no data
    return defaultTestBeds;
  };

  const testBeds = normalizeTestBedData();
  const enabledTestBeds = testBeds.filter(tb => tb.enabled);
  const disabledTestBeds = testBeds.filter(tb => !tb.enabled);
  
  // Sort testbeds: enabled first, then disabled
  const sortedTestBeds = [...enabledTestBeds, ...disabledTestBeds];
  
  // Auto-switch views when more than 2 testbeds are ENABLED
  useEffect(() => {
    if (enabledTestBeds.length > 2) {
      const totalViews = Math.ceil(sortedTestBeds.length / 2);
      const interval = setInterval(() => {
        setCurrentView(prev => (prev + 1) % totalViews);
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setTimeout(() => {
        setCurrentView(0);
      }, 0);
    }
  }, [enabledTestBeds.length, sortedTestBeds.length]);

  // Get testbeds to display in current view (always show 2, but prioritize enabled ones)
  const getTestBedsForCurrentView = (): TestBedConfig[] => {
    const startIndex = currentView * 2;
    return sortedTestBeds.slice(startIndex, startIndex + 2);
  };

  const currentTestBeds = getTestBedsForCurrentView();

  const renderServerCard = (item: TestBedData | null, isEmpty = false) => (
    <div className='h-full w-full p-1'>
      <div
        className={`bg-neutral-700 font-mono px-2 w-full h-full rounded flex flex-col justify-center items-center text-center ${isEmpty ? 'opacity-50' : ''}`}
        style={{ backgroundColor: "var(--train-card)" }}
      >
        {item ? (
          <div className="grid grid-cols-5 w-full h-full">
            <div className="font-bold text-2xl flex justify-center items-center">
                {item.ort}
            </div>
            <div className="col-span-4 text-lg flex flex-col justify-center items-start p-2">
                {item.gruppe}
            </div>
          </div>
        ) : (
          <div className='text-sm text-gray-500'>
            Nicht belegt
          </div>
        )}
      </div>
    </div>
  );

  const renderTestBed = (testbed: TestBedConfig) => {
    const serverIds = [1, 2, 3, 4].map(num => `${testbed.testbedId}.${num}`);
    
    return (
      <div key={testbed.testbedId} className={`grid h-full ${!testbed.enabled ? 'opacity-60' : ''}`}>
        {/* TestBed Header */}
        <div className="text-center p-2 h-3 font-bold text-lg" style={{ 
          color: testbed.enabled ? "var(--foreground)" : "var(--muted-foreground)" 
        }}>
          {testbed.name} {!testbed.enabled && '(Deaktiviert)'}
        </div>
        
        {/* Server Cards */}
        {serverIds.map(serverId => {  
          // For disabled testbeds, show empty cards
          const server = testbed.enabled ? testbed.servers.find(s => s.ort === serverId) : null;
          return <div key={serverId}>{renderServerCard(server, !server || !testbed.enabled)}</div>;
        })}
      </div>
    );
  };

  // Always show testbeds, but with different styling for enabled/disabled
  const totalViews = Math.ceil(sortedTestBeds.length / 2);
  const shouldShowViewIndicator = enabledTestBeds.length > 2;

  return (
    <div className='col-span-3 w-full p-2'>
      {/* View indicator only when more than 2 testbeds are ENABLED (switching active) */}
      {shouldShowViewIndicator && (
        <div className="flex justify-center mb-2">
          <div className="flex space-x-2">
            {Array.from({ length: totalViews }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentView ? 'bg-blue-500' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show status when no testbeds are enabled */}
      {enabledTestBeds.length === 0 && (
        <div className="text-center mb-4 p-4 rounded-lg" style={{ 
          backgroundColor: "var(--muted)", 
          color: "var(--muted-foreground)" 
        }}>
          <div className='text-2xl mb-2'>⚠️</div>
          <div className='text-lg'>Alle TestBeds sind deaktiviert</div>
        </div>
      )}

      <div className={`grid h-full w-full ${currentTestBeds.length === 1 ? 'grid-cols-1 justify-center' : 'grid-cols-2'}`}>
        {currentTestBeds.map(testbed => renderTestBed(testbed))}
      </div>
    </div>
  );
}