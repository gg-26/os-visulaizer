
import React, { useState, useCallback } from 'react';
import { PageReplacementAlgorithm, PageReplacementResult, PageAlgorithmOption } from '../../types';
import { PAGE_REPLACEMENT_ALGORITHM_OPTIONS, INITIAL_PAGE_REFERENCE_STRING, DEFAULT_FRAME_COUNT, DEFAULT_PAGE_REPLACEMENT_ALGORITHM } from '../../constants';
import { runPageReplacementAlgorithm } from '../../services/memoryManagementService';
import MemoryControls from './MemoryControls';
import MemoryVisualization from './MemoryVisualization';
import MemoryMetrics from './MemoryMetrics';
import PageAlgorithmExplanation from './PageAlgorithmExplanation';

const MemoryManagementSimulator: React.FC = () => {
  const [referenceString, setReferenceString] = useState<string>(INITIAL_PAGE_REFERENCE_STRING);
  const [frameCount, setFrameCount] = useState<number>(DEFAULT_FRAME_COUNT);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<PageReplacementAlgorithm>(DEFAULT_PAGE_REPLACEMENT_ALGORITHM);
  const [results, setResults] = useState<PageReplacementResult | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleRunSimulation = useCallback(() => {
    const parsedRefString = referenceString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsedRefString.length === 0) {
      alert("Please enter a valid page reference string.");
      return;
    }
    if (frameCount <= 0) {
      alert("Number of frames must be greater than 0.");
      return;
    }
    const simResults = runPageReplacementAlgorithm(selectedAlgorithm, parsedRefString, frameCount);
    setResults(simResults);
  }, [referenceString, frameCount, selectedAlgorithm]);

  const handleReset = () => {
    setReferenceString(INITIAL_PAGE_REFERENCE_STRING);
    setFrameCount(DEFAULT_FRAME_COUNT);
    // setSelectedAlgorithm(DEFAULT_PAGE_REPLACEMENT_ALGORITHM); // Keep selected algorithm
    setResults(null);
    setResetMessage("Memory Management Simulator data has been reset.");
    setTimeout(() => setResetMessage(null), 3000);
  };

  const currentAlgorithmDetails = PAGE_REPLACEMENT_ALGORITHM_OPTIONS.find(opt => opt.id === selectedAlgorithm);

  return (
    <div className="space-y-6">
       {resetMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle mr-2"></i> {resetMessage}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <MemoryControls
            referenceString={referenceString}
            frameCount={frameCount}
            selectedAlgorithm={selectedAlgorithm}
            algorithmOptions={PAGE_REPLACEMENT_ALGORITHM_OPTIONS}
            onReferenceStringChange={setReferenceString}
            onFrameCountChange={setFrameCount}
            onAlgorithmChange={setSelectedAlgorithm}
            onRunSimulation={handleRunSimulation}
            onReset={handleReset}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <MemoryMetrics results={results} />
          <MemoryVisualization results={results} />
        </div>
      </div>
      <div className="mt-0">
        <PageAlgorithmExplanation selectedAlgorithm={currentAlgorithmDetails} />
      </div>
    </div>
  );
};

export default MemoryManagementSimulator;
