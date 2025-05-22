
import React, { useState, useCallback, useEffect } from 'react';
import { DeadlockAlgorithm, BankerSnapshot, BankerSafetyResult, BankerRequestResult, DeadlockAlgorithmOption, BankerProcessResourceMatrix, BankerAvailableVector } from '../../types';
// Fix: Corrected import to use DEFAULT_BANKER_PROCESS_COUNT instead of INITIAL_BANKER_PROCESS_COUNT
// Fix: Corrected import to use DEFAULT_BANKER_RESOURCE_COUNT instead of INITIAL_BANKER_RESOURCE_COUNT
import { DEADLOCK_ALGORITHM_OPTIONS, DEFAULT_BANKER_PROCESS_COUNT, DEFAULT_BANKER_RESOURCE_COUNT, INITIAL_BANKER_AVAILABLE, INITIAL_BANKER_MAX, INITIAL_BANKER_ALLOCATION } from '../../constants';
import { runBankerSafetyCheck, runBankerResourceRequest } from '../../services/deadlockService';
import BankersControls from './BankersControls';
import BankersVisualization from './BankersVisualization';
import DeadlockAlgorithmExplanation from './DeadlockAlgorithmExplanation';

const DeadlockSimulator: React.FC = () => {
  const [numProcesses, setNumProcesses] = useState<number>(DEFAULT_BANKER_PROCESS_COUNT);
  const [numResources, setNumResources] = useState<number>(DEFAULT_BANKER_RESOURCE_COUNT);

  const [available, setAvailable] = useState<BankerAvailableVector>(INITIAL_BANKER_AVAILABLE);
  const [max, setMax] = useState<BankerProcessResourceMatrix>(INITIAL_BANKER_MAX);
  const [allocation, setAllocation] = useState<BankerProcessResourceMatrix>(INITIAL_BANKER_ALLOCATION);
  
  const [requestProcessId, setRequestProcessId] = useState<string>('P1');
  const [requestVector, setRequestVector] = useState<number[]>([1,0,2]);


  const [selectedAlgorithm, setSelectedAlgorithm] = useState<DeadlockAlgorithm>(DeadlockAlgorithm.BANKERS_SAFETY);
  const [results, setResults] = useState<BankerSafetyResult | BankerRequestResult | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Helper to generate default matrix based on counts
  const generateDefaultMatrix = (rows: number, cols: number, defaultValue = 0): BankerProcessResourceMatrix => {
    const matrix: BankerProcessResourceMatrix = {};
    for (let i = 0; i < rows; i++) {
      matrix[`P${i}`] = Array(cols).fill(defaultValue);
    }
    return matrix;
  };
  const generateDefaultVector = (cols: number, defaultValue = 0): BankerAvailableVector => {
    return Array(cols).fill(defaultValue);
  };


  useEffect(() => {
    // Adjust matrices if counts change
    setAvailable(current => current.slice(0, numResources).concat(Array(Math.max(0, numResources - current.length)).fill(0)));
    
    setMax(currentMax => {
        const newMax: BankerProcessResourceMatrix = {};
        for(let i=0; i < numProcesses; i++){
            const pName = `P${i}`;
            newMax[pName] = currentMax[pName]?.slice(0, numResources).concat(Array(Math.max(0, numResources - (currentMax[pName]?.length || 0))).fill(0)) || Array(numResources).fill(0)
        }
        return newMax;
    });
    setAllocation(currentAlloc => {
        const newAlloc: BankerProcessResourceMatrix = {};
        for(let i=0; i < numProcesses; i++){
            const pName = `P${i}`;
            newAlloc[pName] = currentAlloc[pName]?.slice(0, numResources).concat(Array(Math.max(0, numResources - (currentAlloc[pName]?.length || 0))).fill(0)) || Array(numResources).fill(0)
        }
        return newAlloc;
    });
    setRequestVector(current => current.slice(0, numResources).concat(Array(Math.max(0, numResources - current.length)).fill(0)));
    if(parseInt(requestProcessId.substring(1)) >= numProcesses) {
        setRequestProcessId('P0');
    }
  }, [numProcesses, numResources]);


  const handleRunSimulation = useCallback(() => {
    // Calculate Need matrix
    const need: BankerProcessResourceMatrix = {};
    for (let i = 0; i < numProcesses; i++) {
      const pName = `P${i}`;
      need[pName] = Array(numResources).fill(0);
      if (max[pName] && allocation[pName]) {
        for (let j = 0; j < numResources; j++) {
          need[pName][j] = (max[pName][j] || 0) - (allocation[pName][j] || 0);
           if (need[pName][j] < 0) {
            alert(`Error for P${i}: Allocation of resource R${j} cannot exceed its Max claim. Please correct the values.`);
            return;
           }
        }
      } else {
         alert(`Max or Allocation data missing for P${i}.`);
         return;
      }
    }

    const currentSnapshot: BankerSnapshot = { available, max, allocation, need, numProcesses, numResources };

    if (selectedAlgorithm === DeadlockAlgorithm.BANKERS_SAFETY) {
      const safetyResult = runBankerSafetyCheck(currentSnapshot);
      setResults(safetyResult);
    } else if (selectedAlgorithm === DeadlockAlgorithm.BANKERS_REQUEST) {
      if (parseInt(requestProcessId.substring(1)) >= numProcesses) {
        alert("Selected Process ID for request is out of bounds.");
        return;
      }
      const requestResult = runBankerResourceRequest(requestProcessId, requestVector, currentSnapshot);
      setResults(requestResult);
      if (requestResult.canBeGranted && requestResult.newSnapshot) {
        // Optionally update main state if request is granted and successful.
        // For now, result display handles showing new state.
        // setAvailable(requestResult.newSnapshot.available);
        // setAllocation(requestResult.newSnapshot.allocation);
      }
    }
  }, [available, max, allocation, numProcesses, numResources, selectedAlgorithm, requestProcessId, requestVector]);

  const handleReset = () => {
    setNumProcesses(DEFAULT_BANKER_PROCESS_COUNT);
    setNumResources(DEFAULT_BANKER_RESOURCE_COUNT);
    setAvailable([...INITIAL_BANKER_AVAILABLE]); // Ensure new array instances
    setMax(JSON.parse(JSON.stringify(INITIAL_BANKER_MAX)));
    setAllocation(JSON.parse(JSON.stringify(INITIAL_BANKER_ALLOCATION)));
    setRequestProcessId('P1');
    setRequestVector([1,0,2].slice(0, DEFAULT_BANKER_RESOURCE_COUNT));
    setResults(null);
    setResetMessage("Banker's Algorithm data has been reset.");
    setTimeout(() => setResetMessage(null), 3000);
  };

  const currentAlgorithmDetails = DEADLOCK_ALGORITHM_OPTIONS.find(opt => opt.id === selectedAlgorithm);

  return (
    <div className="space-y-6">
       {resetMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle mr-2"></i> {resetMessage}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <BankersControls
            numProcesses={numProcesses}
            numResources={numResources}
            available={available}
            max={max}
            allocation={allocation}
            requestProcessId={requestProcessId}
            requestVector={requestVector}
            selectedAlgorithm={selectedAlgorithm}
            algorithmOptions={DEADLOCK_ALGORITHM_OPTIONS}
            onNumProcessesChange={setNumProcesses}
            onNumResourcesChange={setNumResources}
            onAvailableChange={setAvailable}
            onMaxChange={setMax}
            onAllocationChange={setAllocation}
            onRequestProcessIdChange={setRequestProcessId}
            onRequestVectorChange={setRequestVector}
            onAlgorithmChange={setSelectedAlgorithm}
            onRunSimulation={handleRunSimulation}
            onReset={handleReset}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <BankersVisualization results={results} />
        </div>
      </div>
      <div className="mt-0">
        <DeadlockAlgorithmExplanation selectedAlgorithm={currentAlgorithmDetails} />
      </div>
    </div>
  );
};

export default DeadlockSimulator;