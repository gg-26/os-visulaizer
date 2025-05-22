
import { SchedulingResult, Algorithm, Process } from '../types';
// Fix: Corrected import to use CPU_ALGORITHM_OPTIONS
import { CPU_ALGORITHM_OPTIONS } from '../constants';

export const exportResultsToTxt = (results: SchedulingResult, algorithmId: Algorithm, processesInput: Process[]): void => {
  const algorithmDetails = CPU_ALGORITHM_OPTIONS.find(opt => opt.id === algorithmId);
  const algorithmName = algorithmDetails ? algorithmDetails.name : 'Unknown Algorithm';

  let content = `CPU Scheduling Algorithm Simulation Results\n`;
  content += `=========================================\n\n`;
  content += `Algorithm: ${algorithmName}\n\n`;

  content += `Input Processes:\n`;
  content += `----------------\n`;
  processesInput.forEach(p => {
    content += `P${p.id}: Arrival=${p.arrivalTime}, Burst=${p.burstTime}${p.priority !== undefined ? `, Priority=${p.priority}` : ''}\n`;
  });
  content += `\n`;

  content += `Performance Metrics:\n`;
  content += `--------------------\n`;
  content += `Average Waiting Time: ${results.metrics.averageWaitingTime.toFixed(2)} ms\n`;
  content += `Average Turnaround Time: ${results.metrics.averageTurnaroundTime.toFixed(2)} ms\n`;
  content += `CPU Utilization: ${results.metrics.cpuUtilization.toFixed(2)} %\n`;
  content += `Throughput: ${results.metrics.throughput.toFixed(2)} processes/ms\n`;
  content += `Total Execution Time: ${results.metrics.totalExecutionTime.toFixed(2)} ms\n\n`;
  
  content += `Process Details (Post-Simulation):\n`;
  content += `-----------------------------------\n`;
  results.originalProcesses.forEach(p => {
    content += `P${p.id}: Arrival=${p.arrivalTime}, Burst=${p.burstTime}, CT=${p.completionTime?.toFixed(2)}, TAT=${p.turnaroundTime?.toFixed(2)}, WT=${p.waitingTime?.toFixed(2)}\n`;
  });
  content += `\n`;

  if (results.ganttEvents.length > 0) {
    content += `Gantt Chart Events:\n`;
    content += `-------------------\n`;
    results.ganttEvents.forEach(event => {
      content += `${event.processName}: Start=${event.start}, End=${event.end}, Duration=${event.duration}\n`;
    });
    content += `\n`;
  }

  if (results.timelineEvents.length > 0) {
    content += `Timeline Events:\n`;
    content += `----------------\n`;
    results.timelineEvents.forEach(event => {
      content += `${event.processName}: Start=${event.start}, End=${event.end}, Duration=${event.duration} (${event.isIdle ? 'Idle' : 'Executing'})\n`;
    });
    content += `\n`;
  }
  
  if (results.queueEvents.length > 0) {
    content += `Ready Queue Events (Chronological):\n`;
    content += `---------------------------------\n`;
    results.queueEvents.sort((a,b)=> a.time - b.time || (a.type === 'enqueue' ? -1 : 1) ).forEach(event => { // Sort by time, then enqueue before dequeue
      content += `Time ${event.time}: ${event.type.toUpperCase()} P${event.processId} (${event.processName})\n`;
    });
    content += `\n`;
  }


  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `cpu_scheduling_${algorithmId}_results_${new Date().toISOString().slice(0,10)}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};