
import React from 'react';
import { TimelineEvent } from '../types';

interface TimelineDisplayProps {
  events: TimelineEvent[];
}

const TimelineDisplay: React.FC<TimelineDisplayProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <p className="text-center text-slate-500 dark:text-slate-400">No timeline data available.</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Process Execution Timeline:</h4>
      <div className="max-h-96 overflow-y-auto pr-2">
        {events.map((event, index) => (
          <div
            key={index}
            className={`p-3 rounded-md mb-2 border-l-4 ${
              event.isIdle ? 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
            } shadow-sm transition-transform hover:translate-x-1`}
          >
            <div className="flex justify-between items-center text-sm">
              <span className={`font-semibold ${event.isIdle ? 'text-slate-600 dark:text-slate-300' : 'text-blue-700 dark:text-blue-300'}`}>
                {event.processName}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {event.isIdle ? 'Idle Period' : 'Executed'}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Time: {event.start}ms - {event.end}ms</span>
              <span className="mx-2">|</span>
              <span>Duration: {event.duration}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineDisplay;
