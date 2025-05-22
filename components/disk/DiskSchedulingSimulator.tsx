
import React, { useState, useCallback } from 'react';
import { DiskSchedulingAlgorithm, DiskSchedulingResult, DiskAlgorithmOption, DiskDirection } from '../../types';
import { DISK_ALGORITHM_OPTIONS, INITIAL_DISK_REQUEST_STRING, INITIAL_DISK_HEAD_POSITION, DEFAULT_DISK_SIZE, DEFAULT_DISK_ALGORITHM, INITIAL_DISK_DIRECTION } from '../../constants';
import { runDiskSchedulingAlgorithm } from '../../services/diskSchedulingService';
import DiskControls from './DiskControls';
import DiskVisualization from './DiskVisualization';
import DiskMetrics from './DiskMetrics';
import DiskAlgorithmExplanation from './DiskAlgorithmExplanation';

const DiskSchedulingSimulator: React.FC = () => {
  const [requestString, setRequestString] = useState<string>(INITIAL_DISK_REQUEST_STRING);
  const [headPosition, setHeadPosition] = useState<number>(INITIAL_DISK_HEAD_POSITION);
  const [diskSize, setDiskSize] = useState<number>(DEFAULT_DISK_SIZE);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<DiskSchedulingAlgorithm>(DEFAULT_DISK_ALGORITHM);
  const [direction, setDirection] = useState<DiskDirection>(INITIAL_DISK_DIRECTION);
  
  const [results, setResults] = useState<DiskSchedulingResult | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleRunSimulation = useCallback(() => {
    const parsedRequests = requestString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n < diskSize);
    if (parsedRequests.length === 0 && requestString.trim() !== "") {
      alert("Please enter valid track numbers within the disk size (0 to " + (diskSize - 1) + ").");
      return;
    }
     if (headPosition < 0 || headPosition >= diskSize) {
      alert(`Initial head position must be between 0 and ${diskSize - 1}.`);
      return;
    }

    const simResults = runDiskSchedulingAlgorithm(selectedAlgorithm, parsedRequests, headPosition, diskSize, direction);
    setResults(simResults);
  }, [requestString, headPosition, diskSize, selectedAlgorithm, direction]);

  const handleReset = () => {
    setRequestString(INITIAL_DISK_REQUEST_STRING);
    setHeadPosition(INITIAL_DISK_HEAD_POSITION);
    setDiskSize(DEFAULT_DISK_SIZE);
    // setSelectedAlgorithm(DEFAULT_DISK_ALGORITHM); // Keep selected algorithm
    setDirection(INITIAL_DISK_DIRECTION);
    setResults(null);
    setResetMessage("Disk Scheduling Simulator data has been reset.");
    setTimeout(() => setResetMessage(null), 3000);
  };

  const currentAlgorithmDetails = DISK_ALGORITHM_OPTIONS.find(opt => opt.id === selectedAlgorithm);

  return (
    <div className="space-y-6">
      {resetMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50 flex items-center">
          <i className="fas fa-check-circle mr-2"></i> {resetMessage}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <DiskControls
            requestString={requestString}
            headPosition={headPosition}
            diskSize={diskSize}
            selectedAlgorithm={selectedAlgorithm}
            direction={direction}
            algorithmOptions={DISK_ALGORITHM_OPTIONS}
            onRequestStringChange={setRequestString}
            onHeadPositionChange={setHeadPosition}
            onDiskSizeChange={setDiskSize}
            onAlgorithmChange={setSelectedAlgorithm}
            onDirectionChange={setDirection}
            onRunSimulation={handleRunSimulation}
            onReset={handleReset}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <DiskMetrics results={results} />
          <DiskVisualization results={results} />
        </div>
      </div>
      <div className="mt-0">
        <DiskAlgorithmExplanation selectedAlgorithm={currentAlgorithmDetails} />
      </div>
    </div>
  );
};

export default DiskSchedulingSimulator;
