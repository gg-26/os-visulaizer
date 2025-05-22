
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg shadow text-center transition-all hover:shadow-md">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        {value}
        {unit && <span className="text-sm font-normal text-slate-600 dark:text-slate-300 ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export default MetricCard;
