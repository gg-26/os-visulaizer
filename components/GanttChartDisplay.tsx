
import React from 'react';
import { GanttEvent } from '../types';

interface GanttChartDisplayProps {
  events: GanttEvent[];
  totalDuration: number;
}

const GanttChartDisplay: React.FC<GanttChartDisplayProps> = ({ events, totalDuration }) => {
  if (!events || events.length === 0) {
    return <p className="text-center text-slate-500 dark:text-slate-400">No Gantt chart data available.</p>;
  }

  // Calculate a suitable scale factor if totalDuration is very large or small
  // For simplicity, this example uses a fixed pixel per unit time.
  const pixelsPerUnitTime = totalDuration > 50 ? 10 : (totalDuration > 20 ? 20 : 40);


  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="relative h-20 bg-slate-100 dark:bg-slate-700 rounded flex items-center" style={{ width: `${totalDuration * pixelsPerUnitTime + 50}px` }}>
        {events.map((event, index) => {
          const width = event.duration * pixelsPerUnitTime;
          const left = event.start * pixelsPerUnitTime;
          const bgColor = event.isIdle ? 'bg-slate-300 dark:bg-slate-600' : (event.color || 'bg-blue-500');
          const textColor = event.isIdle ? 'text-slate-600 dark:text-slate-300' : 'text-white';
          
          return (
            <div
              key={index}
              className={`absolute h-12 rounded shadow-sm flex flex-col items-center justify-center text-xs font-medium transition-all duration-300 ${bgColor} ${textColor} overflow-hidden`}
              style={{ left: `${left}px`, width: `${width}px`, minWidth: '20px' }}
              title={`Process: ${event.processName}\nStart: ${event.start}\nEnd: ${event.end}\nDuration: ${event.duration}`}
            >
              <span className="truncate px-1">{event.processName}</span>
              {width > 30 && <span className="text-[10px] opacity-80">{event.duration}ms</span>}
            </div>
          );
        })}
        {/* Time markers */}
        {Array.from({ length: Math.floor(totalDuration / (totalDuration > 50 ? 5 : (totalDuration > 20 ? 2:1)) ) + 1 }).map((_, i) => {
            const timeMark = i * (totalDuration > 50 ? 5 : (totalDuration > 20 ? 2:1));
            if(timeMark > totalDuration && i > 0) return null; // Don't draw marker past total duration unless it's 0
             return (
              <div key={`time-${i}`} className="absolute top-full mt-1 text-center" style={{ left: `${timeMark * pixelsPerUnitTime - 5}px`, width: '10px'}}>
                <span className="text-xs text-slate-500 dark:text-slate-400">{timeMark}</span>
              </div>
            );
        })}
         <div key={`time-end`} className="absolute top-full mt-1 text-center" style={{ left: `${totalDuration * pixelsPerUnitTime - 5}px`, width: '10px'}}>
            <span className="text-xs text-slate-500 dark:text-slate-400">{totalDuration.toFixed(0)}</span>
        </div>


      </div>
    </div>
  );
};

export default GanttChartDisplay;
