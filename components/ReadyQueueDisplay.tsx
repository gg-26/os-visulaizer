
import React from 'react';
import { ProcessInQueue } from '../types';

interface ReadyQueueDisplayProps {
  queue: ProcessInQueue[];
}

const ReadyQueueDisplay: React.FC<ReadyQueueDisplayProps> = ({ queue }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready Queue Visualization:</h4>
      <div className="min-h-[60px] p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-md flex flex-wrap items-center gap-2 overflow-x-auto">
        {queue.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Queue is empty.</p>
        )}
        {queue.map((process) => (
          <div
            key={process.id}
            className={`
              px-3 py-1.5 rounded text-sm font-medium shadow-sm
              bg-green-500 text-white
              ${process.status === 'entering' ? 'queue-item-animate-enter' : ''}
              ${process.status === 'leaving' ? 'queue-item-animate-exit' : ''}
            `}
          >
            {process.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadyQueueDisplay;
