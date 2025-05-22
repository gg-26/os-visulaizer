
import React from 'react';
import { DiskSchedulingResult, DiskSchedulingStep, DiskRequest } from '../../types';

interface DiskVisualizationProps {
  results: DiskSchedulingResult | null;
}

const DiskVisualization: React.FC<DiskVisualizationProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center min-h-[200px] flex flex-col justify-center items-center">
        <i className="fas fa-hdd text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-300">Run disk simulation to see visualization.</p>
      </div>
    );
  }

  const { steps, diskSize, initialHeadPosition, requestSequence } = results;
  const trackWidthPercentage = 100 / diskSize;

  // Generate path for head movement
  const headPathPoints = steps.map(step => ({
    x: (step.currentHeadPosition / (diskSize -1)) * 100, // Percentage
    y: step.servicedRequest ? 50 : 40 // Lower y for non-servicing moves like SCAN ends
  }));
  
  // Add initial position to path if not already the first step's position
  if (steps.length > 0 && steps[0].currentHeadPosition !== initialHeadPosition && steps[0].seekTime === 0 && steps[0].servicedRequest === null) {
     // This condition is already handled by the first step in the service
  } else if (steps.length === 0 || (steps[0].currentHeadPosition === initialHeadPosition && steps[0].servicedRequest === null && steps[0].seekTime === 0 )) {
    // Initial state before any movement, just show head
  }


  const pathData = headPathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');


  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-chart-line mr-2"></i> Disk Head Movement
      </h2>
      
      <div className="relative w-full h-32 mb-4">
        {/* Disk Tracks Bar */}
        <div className="absolute top-1/2 left-0 w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full transform -translate-y-1/2"></div>

        {/* Original Requests markers (small dots) */}
        {requestSequence.map((track, index) => (
          <div
            key={`req-dot-${index}`}
            className="absolute top-1/2 w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(track / (diskSize -1)) * 100}%` }}
            title={`Request: Track ${track}`}
          ></div>
        ))}
        
        {/* Head Path Line */}
        {steps.length > 1 && ( // Only draw path if there's movement
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0">
                 <path d={pathData} stroke="rgba(239, 68, 68, 0.7)" strokeWidth="1" fill="none" strokeDasharray="2 2" />
            </svg>
        )}


        {/* Head Position & Serviced Request Markers (larger, animated or highlighted) */}
        {steps.map((step, index) => {
          // Current head position marker
          const headMarker = (
            <div
              key={`head-${index}`}
              className={`absolute top-1/2 w-4 h-4 rounded-full border-2 border-red-500 dark:border-red-400 bg-white dark:bg-slate-800 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-10
                          ${index === steps.length - 1 ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-800' : ''}
                        `}
              style={{ left: `${(step.currentHeadPosition / (diskSize-1)) * 100}%` }}
              title={`Step ${index}: Head at ${step.currentHeadPosition}${step.servicedRequest ? `, Serviced: ${step.servicedRequest.track}` : ''}${step.direction ? `, Dir: ${step.direction}`:''}`}
            >
              <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500">{index === steps.length -1 ? step.currentHeadPosition : ''}</span>
            </div>
          );

          // Mark serviced request
          const servicedMarker = step.servicedRequest ? (
            <div
              key={`serviced-${index}`}
              className="absolute top-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-70"
              style={{ left: `${(step.servicedRequest.track / (diskSize -1)) * 100}%` }}
              title={`Serviced: Track ${step.servicedRequest.track}`}
            ></div>
          ) : null;
          
          // For simplicity, we render all markers. For animation, one would control visibility/transition step-by-step.
          // Here, we focus on showing the final state or use the last step for current head.
          if(index === steps.length -1) { // Only show the "current" head for the last step
            return <React.Fragment key={`frag-${index}`}>{servicedMarker}{headMarker}</React.Fragment>
          }
          return servicedMarker; // Show all serviced markers
        })}
         {/* Show initial head if no steps or first step is not the initial position */}
         {(steps.length === 0 || (steps[0].currentHeadPosition === initialHeadPosition && steps[0].seekTime === 0)) && (
            <div
                className={`absolute top-1/2 w-4 h-4 rounded-full border-2 border-red-500 dark:border-red-400 bg-white dark:bg-slate-800 transform -translate-x-1/2 -translate-y-1/2 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-800 z-10`}
                style={{ left: `${(initialHeadPosition / (diskSize-1)) * 100}%` }}
                title={`Initial Head: ${initialHeadPosition}`}
            >
                 <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-red-500">{initialHeadPosition}</span>
            </div>
         )}


      </div>

      <div className="mt-8 text-sm text-slate-600 dark:text-slate-400">
        <p><strong>Initial Head Position:</strong> {results.initialHeadPosition}</p>
        <p><strong>Disk Size:</strong> 0 to {diskSize - 1}</p>
        <p><strong>Request Sequence:</strong> {results.requestSequence.join(', ')}</p>
        <p><strong>Serviced Sequence:</strong> {results.servicedSequence.join(' → ')}</p>
      </div>

      {/* Optional: Detailed step-by-step log */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-blue-500 dark:text-blue-400">View Detailed Steps ({steps.length})</summary>
        <div className="max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded mt-1 space-y-1">
          {steps.map((step, idx) => (
            <div key={idx} className="p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded">
              Step {idx}: Head at <strong>{step.currentHeadPosition}</strong>. 
              {step.servicedRequest ? ` Serviced: <strong>${step.servicedRequest.track}</strong>.` : ' No service.'} 
              Seek: {step.seekTime}. 
              {step.direction && `Dir: ${step.direction}.`}
              Queue: [{step.queueSnapshot.map(r => r.track).join(', ')}]
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default DiskVisualization;
