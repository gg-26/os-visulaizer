
import React from 'react';
import { DiskSchedulingAlgorithm, DiskAlgorithmOption, DiskDirection } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface DiskControlsProps {
  requestString: string;
  headPosition: number;
  diskSize: number;
  selectedAlgorithm: DiskSchedulingAlgorithm;
  direction: DiskDirection;
  algorithmOptions: DiskAlgorithmOption[];
  onRequestStringChange: (value: string) => void;
  onHeadPositionChange: (value: number) => void;
  onDiskSizeChange: (value: number) => void;
  onAlgorithmChange: (algorithm: DiskSchedulingAlgorithm) => void;
  onDirectionChange: (direction: DiskDirection) => void;
  onRunSimulation: () => void;
  onReset: () => void;
}

const DiskControls: React.FC<DiskControlsProps> = ({
  requestString,
  headPosition,
  diskSize,
  selectedAlgorithm,
  direction,
  algorithmOptions,
  onRequestStringChange,
  onHeadPositionChange,
  onDiskSizeChange,
  onAlgorithmChange,
  onDirectionChange,
  onRunSimulation,
  onReset,
}) => {
  const handleNumericChange = (setter: (value: number) => void, minValue = 0) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= minValue) {
      setter(val);
    } else if (e.target.value === "") {
      setter(minValue); // Or handle as appropriate, e.g., set to 0 or a specific default
    }
  };

  const currentAlgoDetails = algorithmOptions.find(opt => opt.id === selectedAlgorithm);
  const showDirectionInput = currentAlgoDetails?.explanation?.requiresDirection;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-cog mr-2"></i> Disk Scheduling Settings
        </h2>
      </div>

      <div>
        <label htmlFor="disk-request-string" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Request Queue (comma-separated tracks):
        </label>
        <Input
          type="text"
          id="disk-request-string"
          value={requestString}
          onChange={(e) => onRequestStringChange(e.target.value)}
          placeholder="e.g., 98,183,37,122"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="disk-head-position" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Initial Head Position:
          </label>
          <Input
            type="number"
            id="disk-head-position"
            value={headPosition}
            onChange={handleNumericChange(onHeadPositionChange)}
            min="0"
          />
        </div>
        <div>
          <label htmlFor="disk-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Disk Size (Max Track + 1):
          </label>
          <Input
            type="number"
            id="disk-size"
            value={diskSize}
            onChange={handleNumericChange(onDiskSizeChange, 1)}
            min="1"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="disk-algorithm-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Algorithm:
        </label>
        <Select
          id="disk-algorithm-select"
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as DiskSchedulingAlgorithm)}
          options={algorithmOptions.map(opt => ({ value: opt.id, label: opt.name }))}
        />
      </div>

      {showDirectionInput && (
        <div>
          <label htmlFor="disk-direction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Initial Direction:
          </label>
          <Select
            id="disk-direction"
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value as DiskDirection)}
            options={[
              { value: 'up', label: 'Up (towards higher tracks)' },
              { value: 'down', label: 'Down (towards lower tracks)' },
            ]}
          />
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={onRunSimulation} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          <i className="fas fa-play mr-2"></i> Run Simulation
        </Button>
        <Button onClick={onReset} variant="secondary" className="w-full">
          <i className="fas fa-redo mr-2"></i> Reset
        </Button>
      </div>
    </div>
  );
};

export default DiskControls;
