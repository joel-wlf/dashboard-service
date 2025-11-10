interface TestBedData {
  ort: string;
  gruppe: string;
}

interface TestBedInfoProps {
  testBedData?: TestBedData[];
}

export default function TestBedInfo({ testBedData = [] }: TestBedInfoProps) {
  // Sort and group servers by room (1.x and 2.x)
  const room1Servers = testBedData
    .filter(item => item.ort.startsWith('1.'))
    .sort((a, b) => a.ort.localeCompare(b.ort));
  
  const room2Servers = testBedData
    .filter(item => item.ort.startsWith('2.'))
    .sort((a, b) => a.ort.localeCompare(b.ort));

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

  return (
    <div className='grid grid-cols-2 w-full p-2 col-span-3'>
      {/* Room 1 servers (1.1 - 1.4) */}
      <div className='grid'>
        {[1, 2, 3, 4].map(num => {
          const server = room1Servers.find(s => s.ort === `1.${num}`);
          return <div key={`1.${num}`}>{renderServerCard(server, !server)}</div>;
        })}
      </div>

      {/* Room 2 servers (2.1 - 2.4) */}
      <div className='grid'>
        {[1, 2, 3, 4].map(num => {
          const server = room2Servers.find(s => s.ort === `2.${num}`);
          return <div key={`2.${num}`}>{renderServerCard(server, !server)}</div>;
        })}
      </div>
    </div>
  );
}