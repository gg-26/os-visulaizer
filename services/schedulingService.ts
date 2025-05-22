
import { Algorithm, Process, SchedulingResult, GanttEvent, TimelineEvent, QueueEvent, SchedulingOptions } from '../types';
import { assignProcessColors } from '../utils/colors';


export const calculateSchedule = (
  algorithm: Algorithm,
  initialProcesses: Process[],
  options: SchedulingOptions
): SchedulingResult => {
  let processes = assignProcessColors(initialProcesses.map(p => ({ ...p, remainingTime: p.burstTime })));
  let currentTime = 0;
  let completedProcesses: Process[] = [];
  const ganttEvents: GanttEvent[] = [];
  const timelineEvents: TimelineEvent[] = [];
  const queueEvents: QueueEvent[] = [];
  
  let readyQueue: Process[] = [];
  let executedProcessIds = new Set<number>(); // To track processes that have entered ready queue at least once

  switch (algorithm) {
    case Algorithm.FCFS:
      processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
      processes.forEach(p => {
        if (currentTime < p.arrivalTime) {
          const idleDuration = p.arrivalTime - currentTime;
          ganttEvents.push({ processId: 0, processName: 'Idle', start: currentTime, end: p.arrivalTime, duration: idleDuration, isIdle: true });
          timelineEvents.push({ processName: 'Idle', start: currentTime, end: p.arrivalTime, duration: idleDuration, isIdle: true });
          currentTime = p.arrivalTime;
        }
        
        queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
        queueEvents.push({ type: 'dequeue', processId: p.id, processName: p.name, time: currentTime });

        const startTime = currentTime;
        currentTime += p.burstTime;
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        completedProcesses.push(p);
        ganttEvents.push({ processId: p.id, processName: p.name, start: startTime, end: currentTime, duration: p.burstTime, color: p.color, isIdle: false });
        timelineEvents.push({ processName: p.name, start: startTime, end: currentTime, duration: p.burstTime, isIdle: false });
      });
      break;

    case Algorithm.SJF: // Non-preemptive or SRTF (Preemptive)
    case Algorithm.SRTF: // Explicitly SRTF
      const isPreemptiveSJF = algorithm === Algorithm.SRTF || (algorithm === Algorithm.SJF && options.isSjfPreemptive);
      let sjfProcesses = [...processes].map(p => ({...p, remainingTime: p.burstTime, lastExecutionTime: p.arrivalTime})); // lastExecutionTime for accurate WT

      while(completedProcesses.length < processes.length) {
        // Add processes to ready queue that have arrived
        sjfProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime <= currentTime && !readyQueue.find(rq => rq.id === p.id))
          .forEach(p => {
            readyQueue.push(p);
            if(!executedProcessIds.has(p.id)){
                 queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
                 executedProcessIds.add(p.id);
            }
          });
        
        if (isPreemptiveSJF) {
           readyQueue.sort((a, b) => (a.remainingTime ?? Infinity) - (b.remainingTime ?? Infinity) || a.arrivalTime - b.arrivalTime);
        } else {
           readyQueue.sort((a,b) => (a.burstTime ?? Infinity) - (b.burstTime ?? Infinity) || a.arrivalTime - b.arrivalTime);
        }

        if (readyQueue.length === 0) {
          if (completedProcesses.length < processes.length) { // Still processes to run
            let nextArrivalTime = Math.min(...sjfProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id)).map(p => p.arrivalTime));
            if (nextArrivalTime > currentTime) {
              const idleDuration = nextArrivalTime - currentTime;
              ganttEvents.push({ processId: 0, processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
              timelineEvents.push({ processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
              currentTime = nextArrivalTime;
            }
          }
          continue; 
        }

        let currentProcess = readyQueue[0];
        if(!isPreemptiveSJF) readyQueue.shift(); // Remove from queue only if non-preemptive
        
        if(!executedProcessIds.has(currentProcess.id)){ // Should have been added already, but as a safeguard
            queueEvents.push({ type: 'enqueue', processId: currentProcess.id, processName: currentProcess.name, time: Math.max(currentTime, currentProcess.arrivalTime) });
            executedProcessIds.add(currentProcess.id);
        }
        queueEvents.push({ type: 'dequeue', processId: currentProcess.id, processName: currentProcess.name, time: currentTime });
        
        const startTime = currentTime;
        let executeTime = 0;

        if (isPreemptiveSJF) {
          executeTime = 1; // Execute for one time unit, then re-evaluate
          currentProcess.remainingTime! -= executeTime;
          currentTime += executeTime;
          
          // Check for new arrivals during this one unit of time
          sjfProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime <= currentTime && !readyQueue.find(rq => rq.id === p.id) && p.id !== currentProcess.id)
            .forEach(p => {
              readyQueue.push(p);
              if(!executedProcessIds.has(p.id)){
                 queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
                 executedProcessIds.add(p.id);
              }
            });

          if (currentProcess.remainingTime! <= 0) {
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completedProcesses.push({...currentProcess});
            readyQueue = readyQueue.filter(p => p.id !== currentProcess.id);
          }
        } else { // Non-preemptive SJF
          executeTime = currentProcess.burstTime;
          currentProcess.remainingTime = 0;
          currentTime += executeTime;
          currentProcess.completionTime = currentTime;
          currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
          currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
          completedProcesses.push({...currentProcess});
        }
        
        ganttEvents.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, color: currentProcess.color, isIdle: false });
        timelineEvents.push({ processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, isIdle: false });
      }
      processes = completedProcesses; // Update original processes array with computed values
      break;

    case Algorithm.PRIORITY:
      const isPreemptivePriority = options.isPriorityPreemptive;
      const higherPriorityIsBetter = options.priorityOrder === 'higherIsBetter';
      let priorityProcesses = [...processes].map(p => ({...p, remainingTime: p.burstTime}));

      while(completedProcesses.length < processes.length) {
          priorityProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime <= currentTime && !readyQueue.find(rq => rq.id === p.id))
            .forEach(p => {
                readyQueue.push(p);
                if(!executedProcessIds.has(p.id)){
                    queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
                    executedProcessIds.add(p.id);
                }
            });

          if (higherPriorityIsBetter) {
              readyQueue.sort((a, b) => (b.priority ?? -Infinity) - (a.priority ?? -Infinity) || a.arrivalTime - b.arrivalTime);
          } else {
              readyQueue.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity) || a.arrivalTime - b.arrivalTime);
          }
          
          if (readyQueue.length === 0) {
            if (completedProcesses.length < processes.length) {
              let nextArrivalTime = Math.min(...priorityProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id)).map(p => p.arrivalTime));
               if (nextArrivalTime > currentTime) {
                const idleDuration = nextArrivalTime - currentTime;
                ganttEvents.push({ processId: 0, processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
                timelineEvents.push({ processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
                currentTime = nextArrivalTime;
              }
            }
            continue;
          }

          let currentProcess = readyQueue[0];
          if(!isPreemptivePriority) readyQueue.shift();

          queueEvents.push({ type: 'dequeue', processId: currentProcess.id, processName: currentProcess.name, time: currentTime });
          
          const startTime = currentTime;
          let executeTime = 0;

          if (isPreemptivePriority) {
            executeTime = 1;
            currentProcess.remainingTime! -= executeTime;
            currentTime += executeTime;

            priorityProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime <= currentTime && !readyQueue.find(rq => rq.id === p.id) && p.id !== currentProcess.id)
            .forEach(p => {
              readyQueue.push(p);
              if(!executedProcessIds.has(p.id)){
                 queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
                 executedProcessIds.add(p.id);
              }
            });

            if (currentProcess.remainingTime! <= 0) {
              currentProcess.completionTime = currentTime;
              currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
              currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
              completedProcesses.push({...currentProcess});
              readyQueue = readyQueue.filter(p => p.id !== currentProcess.id);
            }
          } else {
            executeTime = currentProcess.burstTime;
            currentProcess.remainingTime = 0;
            currentTime += executeTime;
            currentProcess.completionTime = currentTime;
            currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
            currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
            completedProcesses.push({...currentProcess});
          }
          ganttEvents.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, color: currentProcess.color, isIdle: false });
          timelineEvents.push({ processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, isIdle: false });
      }
      processes = completedProcesses;
      break;

    case Algorithm.ROUND_ROBIN:
      const timeQuantum = options.timeQuantum || 1;
      let rrProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime, lastExecutionTime: p.arrivalTime }));
      let rrQueue: Process[] = [];
      let processPointer = 0;

      // Initialize waiting times
      rrProcesses.forEach(p => p.waitingTime = 0);

      while (completedProcesses.length < processes.length) {
        // Add newly arrived processes to the end of the queue
        rrProcesses
          .filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime <= currentTime && !rrQueue.find(rq => rq.id === p.id) && !executedProcessIds.has(p.id))
          .sort((a,b) => a.arrivalTime - b.arrivalTime) // Ensure arrival order for same time
          .forEach(p => {
            rrQueue.push(p);
            queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
            executedProcessIds.add(p.id);
          });

        if (rrQueue.length === 0) {
          if (completedProcesses.length < processes.length) {
            let nextArrivalTime = Math.min(...rrProcesses.filter(p => !completedProcesses.find(cp => cp.id === p.id)).map(p => p.arrivalTime));
             if (nextArrivalTime > currentTime) {
              const idleDuration = nextArrivalTime - currentTime;
              ganttEvents.push({ processId: 0, processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
              timelineEvents.push({ processName: 'Idle', start: currentTime, end: nextArrivalTime, duration: idleDuration, isIdle: true });
              currentTime = nextArrivalTime;
             }
          }
          continue;
        }
        
        let currentProcess = rrQueue.shift()!; // Get process from front of queue
        queueEvents.push({ type: 'dequeue', processId: currentProcess.id, processName: currentProcess.name, time: currentTime });

        const executeTime = Math.min(currentProcess.remainingTime!, timeQuantum);
        const startTime = currentTime;

        currentProcess.waitingTime! += startTime - currentProcess.lastExecutionTime!;

        currentTime += executeTime;
        currentProcess.remainingTime! -= executeTime;
        currentProcess.lastExecutionTime = currentTime;
        
        ganttEvents.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, color: currentProcess.color, isIdle: false });
        timelineEvents.push({ processName: currentProcess.name, start: startTime, end: currentTime, duration: executeTime, isIdle: false });

        // Add processes that arrived during this execution to the queue
         rrProcesses
          .filter(p => !completedProcesses.find(cp => cp.id === p.id) && p.arrivalTime > startTime && p.arrivalTime <= currentTime && !rrQueue.find(rq => rq.id === p.id) && !executedProcessIds.has(p.id))
          .sort((a,b) => a.arrivalTime - b.arrivalTime)
          .forEach(p => {
            rrQueue.push(p);
            queueEvents.push({ type: 'enqueue', processId: p.id, processName: p.name, time: p.arrivalTime });
            executedProcessIds.add(p.id);
          });

        if (currentProcess.remainingTime! <= 0) {
          currentProcess.completionTime = currentTime;
          currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
          // Waiting time is accumulated. Burst time is original burst time.
          completedProcesses.push({...currentProcess});
        } else {
          rrQueue.push(currentProcess); // Add back to the end of the queue
          queueEvents.push({ type: 'enqueue', processId: currentProcess.id, processName: currentProcess.name, time: currentTime });
        }
      }
      processes = completedProcesses;
      break;
    default:
      throw new Error(`Algorithm ${algorithm} not implemented.`);
  }

  // Calculate metrics
  const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaitingTime = completedProcesses.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  const totalBurstTime = completedProcesses.reduce((sum, p) => sum + p.burstTime, 0);
  const lastCompletionTime = currentTime;

  const metrics = {
    averageWaitingTime: completedProcesses.length > 0 ? totalWaitingTime / completedProcesses.length : 0,
    averageTurnaroundTime: completedProcesses.length > 0 ? totalTurnaroundTime / completedProcesses.length : 0,
    cpuUtilization: lastCompletionTime > 0 ? (totalBurstTime / lastCompletionTime) * 100 : 0,
    throughput: lastCompletionTime > 0 ? completedProcesses.length / lastCompletionTime : 0,
    totalExecutionTime: lastCompletionTime,
  };

  return {
    originalProcesses: processes,
    ganttEvents,
    timelineEvents,
    queueEvents,
    metrics,
    algorithm,
  };
};

