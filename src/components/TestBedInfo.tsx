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
        }
      ];
    }

    // Return new format data
    return testBedData as TestBedConfig[];
  };

  const testBeds = normalizeTestBedData();
  const enabledTestBeds = testBeds.filter(tb => tb.enabled);
  
  // Auto-switch views when more than 2 testbeds are enabled
  useEffect(() => {
    if (enabledTestBeds.length > 2) {
      const interval = setInterval(() => {
        setCurrentView(prev => (prev + 1) % Math.ceil(enabledTestBeds.length / 2));
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setCurrentView(0);
    }
  }, [enabledTestBeds.length]);

  // Get testbeds to display in current view
  const getTestBedsForCurrentView = (): TestBedConfig[] => {
    if (enabledTestBeds.length <= 2) {
      return enabledTestBeds;
    }

    const startIndex = currentView * 2;
    return enabledTestBeds.slice(startIndex, startIndex + 2);
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
      <div key={testbed.testbedId} className='grid'>
        {/* TestBed Header */}
        <div className="text-center p-2 font-bold text-lg" style={{ color: "var(--foreground)" }}>
          {testbed.name}
        </div>
        
        {/* Server Cards */}
        {serverIds.map(serverId => {
          const server = testbed.servers.find(s => s.ort === serverId);
          return <div key={serverId}>{renderServerCard(server, !server)}</div>;
        })}
      </div>
    );
  };

  // Don't render if no testbeds are enabled
  if (enabledTestBeds.length === 0) {
    return (
      <div className='col-span-3 flex justify-center items-center p-8'>
        <div className='text-center' style={{ color: "var(--muted-foreground)" }}>
          <div className='text-4xl mb-4'>🖥️</div>
          <div className='text-lg'>Keine TestBeds aktiviert</div>
        </div>
      </div>
    );
  }

  return (
    <div className='col-span-3 w-full p-2'>
      {/* View indicator when switching */}
      {enabledTestBeds.length > 2 && (
        <div className="flex justify-center mb-2">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(enabledTestBeds.length / 2) }).map((_, index) => (
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

      <div className={`grid w-full ${currentTestBeds.length === 1 ? 'grid-cols-1 justify-center' : 'grid-cols-2'}`}>
        {currentTestBeds.map(testbed => renderTestBed(testbed))}
      </div>
    </div>
  );
}