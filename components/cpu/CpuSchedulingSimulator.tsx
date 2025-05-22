
import React, { useState, useEffect, useCallback } from 'react';
import { Algorithm, Process, SchedulingResult, GanttEvent, TimelineEvent, QueueEvent, ProcessInQueue, AlgorithmOption } from '../../types';
import { CPU_ALGORITHM_OPTIONS, CPU_INITIAL_PROCESSES, CPU_DEFAULT_ALGORITHM } from '../../constants';
import { calculateSchedule as runSchedulingAlgorithm } from '../../services/cpuSchedulingService';
import { exportResultsToTxt } from '../../utils/csvExporter';
import AlgorithmControls from './AlgorithmControls';
import ResultsDisplay from './ResultsDisplay';
import AlgorithmExplanation from './AlgorithmExplanation';

const CpuSchedulingSimulator: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>(CPU_INITIAL_PROCESSES);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(CPU_DEFAULT_ALGORITHM);
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [isPriorityPreemptive, setIsPriorityPreemptive] = useState<boolean>(false);
  const [isSjfPreemptive, setIsSjfPreemptive] = useState<boolean>(false); 
  const [priorityOrder, setPriorityOrder] = useState<'higherIsBetter' | 'lowerIsBetter'>('higherIsBetter');

  const [results, setResults] = useState<SchedulingResult | null>(null);
  const [ganttEvents, setGanttEvents] = useState<GanttEvent[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [queueEvents, setQueueEvents] = useState<QueueEvent[]>([]);
  
  const [displayedQueue, setDisplayedQueue] = useState<ProcessInQueue[]>([]);
  const [, setCurrentAnimationTime] = useState<number>(0); // currentAnimationTime state was not used for display, only for timeout logic.
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [animationTimeoutId, setAnimationTimeoutId] = useState<number | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleAddProcess = () => {
    setProcesses(prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1,
        name: `P${prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1}`,
        arrivalTime: 0,
        burstTime: 1,
        priority: 1,
        color: `hsl(${(prev.length * 40) % 360}, 70%, 50%)`
      }
    ]);
  };

  const handleProcessChange = (updatedProcess: Process) => {
    setProcesses(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));
  };

  const handleDeleteProcess = (processId: number) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
  };

  const resetSimulation = () => {
    setProcesses(CPU_INITIAL_PROCESSES);
    setTimeQuantum(2);
    setIsPriorityPreemptive(false);
    setIsSjfPreemptive(false);
    setPriorityOrder('higherIsBetter');
    setResults(null);
    setGanttEvents([]);
    setTimelineEvents([]);
    setQueueEvents([]);
    setDisplayedQueue([]);
    setCurrentAnimationTime(0);
    setIsPlayingAnimation(false);
    if (animationTimeoutId) clearTimeout(animationTimeoutId);
    setAnimationTimeoutId(null);
    setResetMessage("CPU Scheduler data has been reset.");
    setTimeout(() => setResetMessage(null), 3000);
  };
  
  const calculateSchedule = useCallback(() => {
    if (processes.length === 0) {
      alert("Please add at least one process.");
      return;
    }
    const options = {
      timeQuantum,
      isPriorityPreemptive,
      isSjfPreemptive,
      priorityOrder
    };
    const result = runSchedulingAlgorithm(selectedAlgorithm, processes.map(p => ({...p})), options);
    setResults(result);
    setGanttEvents(result.ganttEvents);
    setTimelineEvents(result.timelineEvents);
    setQueueEvents(result.queueEvents);
    setDisplayedQueue([]);
    setCurrentAnimationTime(0);
    setIsPlayingAnimation(true); 
  }, [processes, selectedAlgorithm, timeQuantum, isPriorityPreemptive, isSjfPreemptive, priorityOrder]);

  useEffect(() => {
    if (isPlayingAnimation && queueEvents.length > 0) {
      let currentEventIndex = 0;
      let lastEventTime = -1;
      
      const processNextEvent = () => {
        if (animationTimeoutId) clearTimeout(animationTimeoutId); // Clear previous timeout

        if (currentEventIndex >= queueEvents.length) {
          setIsPlayingAnimation(false);
          setAnimationTimeoutId(null);
          return;
        }

        const event = queueEvents[currentEventIndex];
        // Calculate delay based on the difference from the last event's time
        // Ensure a minimum delay for visibility if events happen at the same time unit
        const timeDiff = event.time - lastEventTime;
        const delay = Math.max(50, timeDiff * 300); // Min 50ms, 300ms per time unit difference

        const timeoutId = setTimeout(() => {
          setCurrentAnimationTime(event.time);
          setDisplayedQueue(prevQueue => {
            if (event.type === 'enqueue') {
              return [...prevQueue, { id: event.processId, name: event.processName, status: 'entering' }];
            } else if (event.type === 'dequeue') {
              return prevQueue.map(p => p.id === event.processId ? { ...p, status: 'leaving' } : p);
            }
            return prevQueue;
          });

          setTimeout(() => {
            setDisplayedQueue(prevQueue => {
              if (event.type === 'enqueue') {
                return prevQueue.map(p => p.id === event.processId ? { ...p, status: 'idle' } : p);
              } else if (event.type === 'dequeue') {
                return prevQueue.filter(p => p.id !== event.processId);
              }
              return prevQueue;
            });
          }, 500); 

          lastEventTime = event.time;
          currentEventIndex++;
          processNextEvent();
        }, delay);
        setAnimationTimeoutId(timeoutId);
      };
      processNextEvent();
    } else if (!isPlayingAnimation && animationTimeoutId) {
      clearTimeout(animationTimeoutId);
      setAnimationTimeoutId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingAnimation, queueEvents]); // Removed animationTimeoutId from deps to avoid loop


  const handleExport = () => {
    if (results) {
      exportResultsToTxt(results, selectedAlgorithm, processes);
    } else {
      alert("No results to export. Please run the simulation first.");
    }
  };
  
  const currentAlgorithmDetails = CPU_ALGORITHM_OPTIONS.find(opt => opt.id === selectedAlgorithm);

  return (
    <div className="space-y-6">
      {resetMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle mr-2"></i> {resetMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <AlgorithmControls
            processes={processes}
            selectedAlgorithm={selectedAlgorithm}
            algorithmOptions={CPU_ALGORITHM_OPTIONS}
            timeQuantum={timeQuantum}
            isPriorityPreemptive={isPriorityPreemptive}
            isSjfPreemptive={isSjfPreemptive}
            priorityOrder={priorityOrder}
            onAddProcess={handleAddProcess}
            onProcessChange={handleProcessChange}
            onDeleteProcess={handleDeleteProcess}
            onAlgorithmChange={setSelectedAlgorithm}
            onTimeQuantumChange={setTimeQuantum}
            onIsPriorityPreemptiveChange={setIsPriorityPreemptive}
            onIsSjfPreemptiveChange={setIsSjfPreemptive}
            onPriorityOrderChange={setPriorityOrder}
            onCalculate={calculateSchedule}
            onReset={resetSimulation}
            onExport={handleExport}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ResultsDisplay
            results={results}
            ganttEvents={ganttEvents}
            timelineEvents={timelineEvents}
            displayedQueue={displayedQueue}
            algorithmName={currentAlgorithmDetails?.name || ''}
          />
        </div>
      </div>

      <div className="mt-0"> {/* Adjusted margin for better spacing with new layout */}
         <AlgorithmExplanation selectedAlgorithm={currentAlgorithmDetails} />
      </div>
    </div>
  );
};

export default CpuSchedulingSimulator;
