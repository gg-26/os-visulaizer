
import React from 'react';
import { PageReplacementAlgorithm, PageAlgorithmOption } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface MemoryControlsProps {
  referenceString: string;
  frameCount: number;
  selectedAlgorithm: PageReplacementAlgorithm;
  algorithmOptions: PageAlgorithmOption[];
  onReferenceStringChange: (value: string) => void;
  onFrameCountChange: (value: number) => void;
  onAlgorithmChange: (algorithm: PageReplacementAlgorithm) => void;
  onRunSimulation: () => void;
  onReset: () => void;
}

const MemoryControls: React.FC<MemoryControlsProps> = ({
  referenceString,
  frameCount,
  selectedAlgorithm,
  algorithmOptions,
  onReferenceStringChange,
  onFrameCountChange,
  onAlgorithmChange,
  onRunSimulation,
  onReset,
}) => {
  const handleFrameCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) { // Allow 0 temporarily, validation on run
      onFrameCountChange(val);
    } else if (e.target.value === "") {
      onFrameCountChange(0); // Or handle as appropriate
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-sliders-h mr-2"></i> Memory Simulation Settings
        </h2>
      </div>

      <div>
        <label htmlFor="reference-string" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Page Reference String (comma-separated):
        </label>
        <Input
          type="text"
          id="reference-string"
          value={referenceString}
          onChange={(e) => onReferenceStringChange(e.target.value)}
          placeholder="e.g., 7,0,1,2,0,3,0,4"
        />
      </div>

      <div>
        <label htmlFor="frame-count" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Number of Frames:
        </label>
        <Input
          type="number"
          id="frame-count"
          value={frameCount}
          onChange={handleFrameCountChange}
          min="1"
        />
      </div>
      
      <div>
        <label htmlFor="page-algorithm-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Algorithm:
        </label>
        <Select
          id="page-algorithm-select"
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as PageReplacementAlgorithm)}
          options={algorithmOptions.map(opt => ({ value: opt.id, label: opt.name }))}
        />
      </div>

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

export default MemoryControls;
