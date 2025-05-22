
import React from 'react';
import { PageReplacementResult } from '../../types';
import MetricCard from '../cpu/MetricCard'; // Reusing CPU MetricCard

interface MemoryMetricsProps {
  results: PageReplacementResult | null;
}

const MemoryMetrics: React.FC<MemoryMetricsProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
         {/* Placeholder or initial message */}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
        <i className="fas fa-chart-pie mr-2"></i> Performance Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Total Page Faults" value={results.pageFaults.toString()} />
        <MetricCard title="Total Page Hits" value={results.pageHits.toString()} />
        <MetricCard title="Page Fault Rate" value={results.pageFaultRate.toFixed(2)} unit="%" />
      </div>
    </div>
  );
};

export default MemoryMetrics;
