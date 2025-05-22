
import React from 'react';
import { DeadlockAlgorithm, DeadlockAlgorithmOption, BankerAvailableVector, BankerProcessResourceMatrix } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface BankersControlsProps {
  numProcesses: number;
  numResources: number;
  available: BankerAvailableVector;
  max: BankerProcessResourceMatrix;
  allocation: BankerProcessResourceMatrix;
  requestProcessId: string;
  requestVector: number[];
  selectedAlgorithm: DeadlockAlgorithm;
  algorithmOptions: DeadlockAlgorithmOption[];
  onNumProcessesChange: (value: number) => void;
  onNumResourcesChange: (value: number) => void;
  onAvailableChange: (vector: BankerAvailableVector) => void;
  onMaxChange: (matrix: BankerProcessResourceMatrix) => void;
  onAllocationChange: (matrix: BankerProcessResourceMatrix) => void;
  onRequestProcessIdChange: (pid: string) => void;
  onRequestVectorChange: (vector: number[]) => void;
  onAlgorithmChange: (algorithm: DeadlockAlgorithm) => void;
  onRunSimulation: () => void;
  onReset: () => void;
}

const BankersControls: React.FC<BankersControlsProps> = ({
  numProcesses, numResources, available, max, allocation, requestProcessId, requestVector,
  selectedAlgorithm, algorithmOptions,
  onNumProcessesChange, onNumResourcesChange, onAvailableChange, onMaxChange, onAllocationChange,
  onRequestProcessIdChange, onRequestVectorChange, onAlgorithmChange, onRunSimulation, onReset,
}) => {

  const handleCountChange = (setter: (val: number) => void, min: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= min) setter(val);
  };

  const handleVectorChange = (
    vectorIndex: number, 
    value: string, 
    currentVector: number[], 
    setter: (newVector: number[]) => void
  ) => {
    const numValue = parseInt(value);
    const newVector = [...currentVector];
    if (!isNaN(numValue) && numValue >= 0) {
      newVector[vectorIndex] = numValue;
      setter(newVector);
    } else if (value === "") {
      newVector[vectorIndex] = 0; // Or handle as appropriate
      setter(newVector);
    }
  };

  const handleMatrixChange = (
    processIndex: number, 
    resourceIndex: number, 
    value: string,
    currentMatrix: BankerProcessResourceMatrix,
    setter: (newMatrix: BankerProcessResourceMatrix) => void
  ) => {
    const pName = `P${processIndex}`;
    const numValue = parseInt(value);
    const newMatrix = JSON.parse(JSON.stringify(currentMatrix)); // Deep copy
    
    if (!newMatrix[pName]) newMatrix[pName] = Array(numResources).fill(0);

    if (!isNaN(numValue) && numValue >= 0) {
      newMatrix[pName][resourceIndex] = numValue;
      setter(newMatrix);
    } else if (value === "") {
      newMatrix[pName][resourceIndex] = 0;
      setter(newMatrix);
    }
  };
  
  const processOptions = Array.from({ length: numProcesses }, (_, i) => ({ value: `P${i}`, label: `P${i}` }));

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-shield-alt mr-2"></i> Banker's Algorithm Settings
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="num-processes" className="block text-sm font-medium">Processes (P):</label>
          <Input type="number" id="num-processes" value={numProcesses} onChange={handleCountChange(onNumProcessesChange, 1)} min="1" />
        </div>
        <div>
          <label htmlFor="num-resources" className="block text-sm font-medium">Resources (R):</label>
          <Input type="number" id="num-resources" value={numResources} onChange={handleCountChange(onNumResourcesChange, 1)} min="1" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Available Resources (Vector):</label>
        <div className="grid grid-cols-dynamic-resources gap-2" style={{gridTemplateColumns: `repeat(${numResources}, minmax(0, 1fr))`}}>
          {Array.from({ length: numResources }).map((_, i) => (
            <Input key={`avail-${i}`} type="number" aria-label={`Available R${i}`} value={available[i] || 0} onChange={(e) => handleVectorChange(i, e.target.value, available, onAvailableChange)} min="0" />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <label className="block text-sm font-medium mb-1">Max Need Matrix (Processes x Resources):</label>
        <table className="min-w-full text-xs">
          <thead><tr><th></th>{Array.from({ length: numResources }).map((_, j) => <th key={`max-h-${j}`}>R{j}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: numProcesses }).map((_, i) => (
              <tr key={`max-p${i}`}>
                <td className="font-semibold pr-2">P{i}</td>
                {Array.from({ length: numResources }).map((_, j) => (
                  <td key={`max-p${i}-r${j}`} className="p-0.5">
                    <Input type="number" aria-label={`Max P${i} R${j}`} value={max[`P${i}`]?.[j] || 0} onChange={(e) => handleMatrixChange(i, j, e.target.value, max, onMaxChange)} min="0" className="w-full text-center"/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <div className="overflow-x-auto">
        <label className="block text-sm font-medium mb-1">Allocation Matrix (Processes x Resources):</label>
         <table className="min-w-full text-xs">
          <thead><tr><th></th>{Array.from({ length: numResources }).map((_, j) => <th key={`alloc-h-${j}`}>R{j}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: numProcesses }).map((_, i) => (
              <tr key={`alloc-p${i}`}>
                <td className="font-semibold pr-2">P{i}</td>
                {Array.from({ length: numResources }).map((_, j) => (
                  <td key={`alloc-p${i}-r${j}`} className="p-0.5">
                    <Input type="number" aria-label={`Allocation P${i} R${j}`} value={allocation[`P${i}`]?.[j] || 0} onChange={(e) => handleMatrixChange(i, j, e.target.value, allocation, onAllocationChange)} min="0" className="w-full text-center"/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <label htmlFor="banker-algorithm-select" className="block text-sm font-medium mb-1">Operation:</label>
        <Select
          id="banker-algorithm-select"
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as DeadlockAlgorithm)}
          options={algorithmOptions.map(opt => ({ value: opt.id, label: opt.name }))}
        />
      </div>

      {selectedAlgorithm === DeadlockAlgorithm.BANKERS_REQUEST && (
        <div className="p-3 border border-slate-300 dark:border-slate-600 rounded-md space-y-2">
          <h4 className="text-sm font-semibold">Resource Request:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="request-pid" className="block text-xs font-medium">Process ID:</label>
              <Select id="request-pid" value={requestProcessId} onChange={(e) => onRequestProcessIdChange(e.target.value)} options={processOptions} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Request Vector:</label>
             <div className="grid grid-cols-dynamic-resources gap-2" style={{gridTemplateColumns: `repeat(${numResources}, minmax(0, 1fr))`}}>
              {Array.from({ length: numResources }).map((_, i) => (
                <Input key={`req-vec-${i}`} type="number" aria-label={`Request R${i}`} value={requestVector[i] || 0} onChange={(e) => handleVectorChange(i, e.target.value, requestVector, onRequestVectorChange)} min="0" />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={onRunSimulation} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          <i className="fas fa-play mr-2"></i> Run Check
        </Button>
        <Button onClick={onReset} variant="secondary" className="w-full">
          <i className="fas fa-redo mr-2"></i> Reset Data
        </Button>
      </div>
    </div>
  );
};

export default BankersControls;
