
import React from 'react';
import { Algorithm, Process, AlgorithmOption } from '../types';
import ProcessInputRow from './ProcessInputRow';
import Button from './ui/Button';
import Select from './ui/Select';
import Input from './ui/Input';
import Switch from './ui/Switch';

interface AlgorithmControlsProps {
  processes: Process[];
  selectedAlgorithm: Algorithm;
  algorithmOptions: AlgorithmOption[];
  timeQuantum: number;
  isPriorityPreemptive: boolean;
  isSjfPreemptive: boolean;
  priorityOrder: 'higherIsBetter' | 'lowerIsBetter';
  onAddProcess: () => void;
  onProcessChange: (process: Process) => void;
  onDeleteProcess: (id: number) => void;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onTimeQuantumChange: (value: number) => void;
  onIsPriorityPreemptiveChange: (value: boolean) => void;
  onIsSjfPreemptiveChange: (value: boolean) => void;
  onPriorityOrderChange: (value: 'higherIsBetter' | 'lowerIsBetter') => void;
  onCalculate: () => void;
  onReset: () => void;
  onExport: () => void;
}

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  processes,
  selectedAlgorithm,
  algorithmOptions,
  timeQuantum,
  isPriorityPreemptive,
  isSjfPreemptive,
  priorityOrder,
  onAddProcess,
  onProcessChange,
  onDeleteProcess,
  onAlgorithmChange,
  onTimeQuantumChange,
  onIsPriorityPreemptiveChange,
  onIsSjfPreemptiveChange,
  onPriorityOrderChange,
  onCalculate,
  onReset,
  onExport,
}) => {
  const currentAlgoDetails = algorithmOptions.find(opt => opt.id === selectedAlgorithm);

  const handleTimeQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      onTimeQuantumChange(val);
    }
  };
  
  const showPriorityColumn = currentAlgoDetails?.hasPriority;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      {/* Algorithm Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-cogs mr-2"></i> Select Algorithm
        </h2>
        <Select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
          options={algorithmOptions.map(opt => ({ value: opt.id, label: opt.name }))}
        />
      </div>

      {/* Algorithm Specific Options */}
      <div className="space-y-3 p-4 border border-slate-200 dark:border-slate-700 rounded-md">
        <h3 className="text-md font-medium text-slate-700 dark:text-slate-300">Algorithm Options</h3>
        {currentAlgoDetails?.hasTimeQuantum && (
          <div className="flex items-center justify-between">
            <label htmlFor="time-quantum" className="text-sm font-medium">Time Quantum:</label>
            <Input
              type="number"
              id="time-quantum"
              value={timeQuantum}
              onChange={handleTimeQuantumChange}
              min="1"
              className="w-20 text-center"
            />
          </div>
        )}
        {currentAlgoDetails?.id === Algorithm.PRIORITY && currentAlgoDetails?.canBePreemptive && (
           <Switch
            id="priority-preemptive-toggle"
            label={`Mode: ${isPriorityPreemptive ? 'Preemptive Priority' : 'Non-Preemptive Priority'}`}
            checked={isPriorityPreemptive}
            onChange={(e) => onIsPriorityPreemptiveChange(e.target.checked)}
          />
        )}
         {currentAlgoDetails?.id === Algorithm.SJF && currentAlgoDetails?.supportsSjfPreemption && (
           <Switch
            id="sjf-preemptive-toggle"
            label={`Mode: ${isSjfPreemptive ? 'SRTF (Preemptive)' : 'SJF (Non-Preemptive)'}`}
            checked={isSjfPreemptive}
            onChange={(e) => onIsSjfPreemptiveChange(e.target.checked)}
          />
        )}
        {currentAlgoDetails?.hasPriority && (
           <div className="flex items-center justify-between">
            <label htmlFor="priority-order" className="text-sm font-medium">Priority Meaning:</label>
            <Select
              id="priority-order"
              value={priorityOrder}
              onChange={(e) => onPriorityOrderChange(e.target.value as 'higherIsBetter' | 'lowerIsBetter')}
              options={[
                { value: 'higherIsBetter', label: 'Higher Number = Higher Priority' },
                { value: 'lowerIsBetter', label: 'Lower Number = Higher Priority' },
              ]}
              className="w-auto"
            />
          </div>
        )}
         {!currentAlgoDetails?.hasTimeQuantum && currentAlgoDetails?.id !== Algorithm.PRIORITY && currentAlgoDetails?.id !== Algorithm.SJF && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No specific options for {currentAlgoDetails?.name}.</p>
        )}
      </div>
      

      {/* Process Details */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-tasks mr-2"></i> Process Details
        </h2>
        <div className="space-y-1 max-h-96 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-md">
          {/* Header */}
           <div className="grid grid-cols-custom-proc-input gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-t-md sticky top-0 z-10">
            <span className="font-semibold text-sm">ID</span>
            {showPriorityColumn && <span className="font-semibold text-sm">Priority</span>}
            <span className="font-semibold text-sm">Arrival</span>
            <span className="font-semibold text-sm">Burst</span>
            <span className="font-semibold text-sm text-right">Actions</span>
          </div>
          {processes.map((process) => (
            <ProcessInputRow
              key={process.id}
              process={process}
              onProcessChange={onProcessChange}
              onDeleteProcess={onDeleteProcess}
              showPriority={showPriorityColumn || false}
            />
          ))}
        </div>
        <Button onClick={onAddProcess} className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white">
          <i className="fas fa-plus mr-2"></i> Add Process
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={onCalculate} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          <i className="fas fa-calculator mr-2"></i> Calculate Schedule
        </Button>
        <Button onClick={onReset} variant="secondary" className="w-full">
          <i className="fas fa-redo mr-2"></i> Reset All
        </Button>
        <Button onClick={onExport} variant="secondary" className="w-full sm:col-span-2">
          <i className="fas fa-download mr-2"></i> Export Results
        </Button>
      </div>
    </div>
  );
};

export default AlgorithmControls;
