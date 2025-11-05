"use client";

interface LessonProgressBarProps {
  lessonData: any[];
  currentTime: Date;
}

export default function LessonProgressBar({ lessonData, currentTime }: LessonProgressBarProps) {
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
        const progress = Math.min(elapsed / totalDuration, 1); // 0 to 1
        
        return {
          type: period.type,
          start: period.start,
          end: period.end,
          progress: progress,
          remaining: endMinutes - currentMinutes
        };
      }
    }
    
    return null; // No current period
  };

  // Function to get progress bar color based on progress (0-1)
  const getProgressBarColor = (progress: number) => {
    if (progress < 0.5) {
      // Green to Yellow (0-0.5)
      const ratio = progress * 2; // 0-1
      const red = Math.round(255 * ratio);
      const green = 255;
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Yellow to Red (0.5-1)
      const ratio = (progress - 0.5) * 2; // 0-1
      const red = 255;
      const green = Math.round(255 * (1 - ratio));
      return `rgb(${red}, ${green}, 0)`;
    }
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className='h-full relative bg-gray-200'>
      {currentPeriod && (
        <div 
          className='h-full transition-all duration-1000 ease-linear'
          style={{
            width: `${currentPeriod.progress * 100}%`,
            backgroundColor: getProgressBarColor(currentPeriod.progress)
          }}
        />
      )}
      
      {!currentPeriod && (
        <div className='h-full bg-gray-100' />
      )}
    </div>
  );
}