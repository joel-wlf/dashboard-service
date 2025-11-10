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
    <div className='w-full mb-2'>
      <div
        className={`bg-neutral-700 w-full h-16 rounded-lg p-3 flex flex-col justify-center items-center text-center ${isEmpty ? 'opacity-50' : ''}`}
        style={{ backgroundColor: "var(--train-card)" }}
      >
        {item ? (
          <>
            <div className='text-lg font-bold text-white mb-1'>
              Server {item.ort}
            </div>
            <div className='text-xs text-gray-300'>
              {item.gruppe}
            </div>
          </>
        ) : (
          <div className='text-sm text-gray-500'>
            Nicht belegt
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='grid gap-4 grid-cols-2 w-full col-span-3 p-3'>
      {/* Room 1 servers (1.1 - 1.4) */}
      <div className='flex flex-col'>
        <div className='text-lg font-bold text-white mb-2 text-center'>Raum 1</div>
        {[1, 2, 3, 4].map(num => {
          const server = room1Servers.find(s => s.ort === `1.${num}`);
          return <div key={`1.${num}`}>{renderServerCard(server, !server)}</div>;
        })}
      </div>

      {/* Room 2 servers (2.1 - 2.4) */}
      <div className='flex flex-col'>
        <div className='text-lg font-bold text-white mb-2 text-center'>Raum 2</div>
        {[1, 2, 3, 4].map(num => {
          const server = room2Servers.find(s => s.ort === `2.${num}`);
          return <div key={`2.${num}`}>{renderServerCard(server, !server)}</div>;
        })}
      </div>
    </div>
  );
}