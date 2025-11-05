"use client";

interface LessonProgressBarProps {
  lessonData: any[];
  currentTime: Date;
  showOvertimeAlarm: boolean;
}

export default function LessonProgressBar({ lessonData, currentTime, showOvertimeAlarm }: LessonProgressBarProps) {
  // Helper function to parse time string to minutes since midnight
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to get current time in minutes since midnight
  const getCurrentMinutes = () => {
    return currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
  };

  // Find current lesson/break and calculate progress
  const getCurrentPeriod = () => {
    const currentMinutes = getCurrentMinutes();
    
    for (const period of lessonData) {
      const startMinutes = timeToMinutes(period.start);
      const endMinutes = timeToMinutes(period.end);
      
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        const totalDuration = endMinutes - startMinutes;
        const elapsed = currentMinutes - startMinutes;
        const remaining = endMinutes - currentMinutes;
        const progress = Math.max(remaining / totalDuration, 0); // 1 to 0 (reverse countdown)
        
        return {
          type: period.type,
          start: period.start,
          end: period.end,
          progress: progress,
          remaining: remaining,
          isOvertime: false
        };
      }
      
      // Check if we're in overtime (just past the end time)
      if (currentMinutes > endMinutes && currentMinutes <= endMinutes + 0.17) { // 10 seconds warning period
        return {
          type: period.type,
          start: period.start,
          end: period.end,
          progress: 0,
          remaining: 0,
          isOvertime: true
        };
      }
    }
    
    return null; // No current period
  };

  // Function to get progress bar color based on remaining progress (1 to 0)
  // Since we're counting down, we need to invert the color logic
  const getProgressBarColor = (progress: number) => {
    // Invert progress for color calculation (1-progress gives us 0-1 for color)
    const colorProgress = 1 - progress;
    
    if (colorProgress < 0.5) {
      // Green to Yellow (0-0.5)
      const ratio = colorProgress * 2; // 0-1
      const red = Math.round(255 * ratio);
      const green = 255;
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Yellow to Red (0.5-1)
      const ratio = (colorProgress - 0.5) * 2; // 0-1
      const red = 255;
      const green = Math.round(255 * (1 - ratio));
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <>
      <div className='h-full relative bg-gray-200'>
        {currentPeriod && !currentPeriod.isOvertime && (
          <div 
            className='h-full transition-all duration-1000 ease-linear'
            style={{
              width: `${currentPeriod.progress * 100}%`,
              backgroundColor: getProgressBarColor(currentPeriod.progress)
            }}
          />
        )}
        
        {currentPeriod && currentPeriod.isOvertime && (
          <div className='h-full bg-red-600' />
        )}
        
        {!currentPeriod && (
          <div className='h-full bg-gray-100' />
        )}
      </div>

      {/* Fullscreen Blinking Warning */}
      {currentPeriod && currentPeriod.isOvertime && showOvertimeAlarm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center animate-pulse' 
             style={{
               animation: 'flashRedWhite 1s infinite',
               backgroundColor: 'rgb(220, 38, 38)' // red-600
             }}>
          <div className='bg-white rounded-2xl p-12 shadow-2xl text-center border-8 border-red-700 max-w-2xl mx-4'>
            <div className='text-8xl mb-6'>⏰</div>
            <h1 className='text-6xl font-bold text-red-600 mb-4'>
              Überzieh Alarm!
            </h1>
            <p className='text-3xl text-red-500 font-semibold'>
              {currentPeriod.type === 'stunde' ? 'Stunde' : 'Pause'} zu Ende
            </p>
            <div className='mt-6 text-xl text-gray-600'>
              {currentPeriod.start} - {currentPeriod.end}
            </div>
          </div>
        </div>
      )}
    </>
  );
}