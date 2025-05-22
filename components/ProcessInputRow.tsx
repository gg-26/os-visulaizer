
import React from 'react';
import { Process } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';

interface ProcessInputRowProps {
  process: Process;
  onProcessChange: (process: Process) => void;
  onDeleteProcess: (id: number) => void;
  showPriority: boolean;
}

const ProcessInputRow: React.FC<ProcessInputRowProps> = ({ process, onProcessChange, onDeleteProcess, showPriority }) => {
  const handleChange = (field: keyof Process, value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (field === 'arrivalTime' || field === 'burstTime' || field === 'priority') {
      if (isNaN(numValue) || numValue < (field === 'burstTime' ? 1 : 0) ) return; // Basic validation
    }
    onProcessChange({ ...process, [field]: numValue });
  };

  return (
    <div className={`grid ${showPriority ? 'grid-cols-custom-proc-input' : 'grid-cols-custom-proc-input-no-priority'} gap-2 items-center p-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
      <span className="font-mono text-sm text-center">{process.name}</span>
      {showPriority && (
        <Input
          type="number"
          aria-label={`Priority for ${process.name}`}
          value={process.priority || 0}
          onChange={(e) => handleChange('priority', e.target.value)}
          min="0"
          className="w-full text-sm"
        />
      )}
      <Input
        type="number"
        aria-label={`Arrival time for ${process.name}`}
        value={process.arrivalTime}
        onChange={(e) => handleChange('arrivalTime', e.target.value)}
        min="0"
        className="w-full text-sm"
      />
      <Input
        type="number"
        aria-label={`Burst time for ${process.name}`}
        value={process.burstTime}
        onChange={(e) => handleChange('burstTime', e.target.value)}
        min="1"
        className="w-full text-sm"
      />
      <Button
        onClick={() => onDeleteProcess(process.id)}
        variant="danger"
        size="sm"
        className="w-full justify-self-end"
        aria-label={`Delete process ${process.name}`}
      >
        <i className="fas fa-times"></i>
      </Button>
    </div>
  );
};

export default ProcessInputRow;
