
import React, { useState } from 'react';
import { SchedulingResult, GanttEvent, TimelineEvent, ProcessInQueue } from '../types';
import MetricCard from './MetricCard';
import GanttChartDisplay from './GanttChartDisplay';
import TimelineDisplay from './TimelineDisplay';
import ReadyQueueDisplay from './ReadyQueueDisplay';
import Button from './ui/Button';

interface ResultsDisplayProps {
  results: SchedulingResult | null;
  ganttEvents: GanttEvent[];
  timelineEvents: TimelineEvent[];
  displayedQueue: ProcessInQueue[];
  algorithmName: string;
}

type ActiveTab = 'gantt' | 'timeline' | 'queue';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, ganttEvents, timelineEvents, displayedQueue, algorithmName }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gantt');

  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
        <i className="fas fa-info-circle text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-300">Run a simulation to see the results.</p>
      </div>
    );
  }

  const { metrics } = results;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-chart-bar mr-3"></i> Simulation Results: <span className="ml-2 text-lg text-slate-700 dark:text-slate-300">{algorithmName}</span>
      </h2>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Avg Waiting Time" value={metrics.averageWaitingTime.toFixed(2)} unit="ms" />
        <MetricCard title="Avg Turnaround Time" value={metrics.averageTurnaroundTime.toFixed(2)} unit="ms" />
        <MetricCard title="CPU Utilization" value={metrics.cpuUtilization.toFixed(2)} unit="%" />
        <MetricCard title="Throughput" value={metrics.throughput.toFixed(2)} unit="P/ms" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-right">Total Execution Time: {metrics.totalExecutionTime.toFixed(2)} ms</p>

      {/* Visualizations */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-eye mr-2"></i> Visualizations
        </h3>
        <div className="flex space-x-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          <Button onClick={() => setActiveTab('gantt')} variant={activeTab === 'gantt' ? 'primary' : 'ghost'} size="sm">
            <i className="fas fa-project-diagram mr-2"></i>Gantt Chart
          </Button>
          <Button onClick={() => setActiveTab('timeline')} variant={activeTab === 'timeline' ? 'primary' : 'ghost'} size="sm">
            <i className="fas fa-clock mr-2"></i>Process Timeline
          </Button>
          <Button onClick={() => setActiveTab('queue')} variant={activeTab === 'queue' ? 'primary' : 'ghost'} size="sm">
            <i className="fas fa-list-ol mr-2"></i>Ready Queue
          </Button>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-md min-h-[200px]">
          {activeTab === 'gantt' && <GanttChartDisplay events={ganttEvents} totalDuration={metrics.totalExecutionTime} />}
          {activeTab === 'timeline' && <TimelineDisplay events={timelineEvents} />}
          {activeTab === 'queue' && <ReadyQueueDisplay queue={displayedQueue} />}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
