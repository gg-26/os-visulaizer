
import React from 'react';
import { DiskSchedulingResult } from '../../types';
import MetricCard from '../cpu/MetricCard'; // Reusing CPU MetricCard

interface DiskMetricsProps {
  results: DiskSchedulingResult | null;
}

const DiskMetrics: React.FC<DiskMetricsProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center min-h-[100px] flex flex-col justify-center items-center">
        {/* Initial placeholder, content will appear after simulation */}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-tachometer-alt mr-2"></i> Performance Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard title="Total Head Movement" value={results.totalHeadMovement.toString()} unit="tracks" />
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg shadow col-span-1 sm:col-span-2">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Serviced Track Sequence</h4>
            <p className="text-md font-semibold text-blue-600 dark:text-blue-400 break-all">
                {results.servicedSequence.join(' → ') || 'N/A'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default DiskMetrics;
