
import React from 'react';
import { BankerSafetyResult, BankerRequestResult, BankerSnapshot, DeadlockAlgorithm } from '../../types';

interface BankersVisualizationProps {
  results: BankerSafetyResult | BankerRequestResult | null;
}

const MatrixTable: React.FC<{ title: string; matrix: { [key: string]: number[] } | number[]; numResources: number, isVector?: boolean }> = ({ title, matrix, numResources, isVector }) => {
  const resourceHeaders = Array.from({ length: numResources }, (_, i) => <th key={`rh-${i}`} className="p-1 border border-slate-300 dark:border-slate-600 text-xs">R{i}</th>);
  
  return (
    <div className="mb-4 overflow-x-auto">
      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h4>
      <table className="min-w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            {!isVector && <th className="p-1 border border-slate-300 dark:border-slate-600 text-xs">Proc</th>}
            {resourceHeaders}
          </tr>
        </thead>
        <tbody>
          {isVector && Array.isArray(matrix) ? (
            <tr>{matrix.map((val, i) => <td key={`v-${i}`} className="p-1 border border-slate-300 dark:border-slate-600 text-center">{val}</td>)}</tr>
          ) : (
            Object.entries(matrix as { [key: string]: number[] }).map(([pName, resources]) => (
              <tr key={pName}>
                <td className="p-1 border border-slate-300 dark:border-slate-600 font-semibold">{pName}</td>
                {resources.map((val, i) => <td key={`${pName}-r${i}`} className="p-1 border border-slate-300 dark:border-slate-600 text-center">{val}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


const BankersVisualization: React.FC<BankersVisualizationProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center min-h-[300px] flex flex-col justify-center items-center">
        <i className="fas fa-project-diagram text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-300">Run Banker's Algorithm check to see visualization.</p>
      </div>
    );
  }

  const snapshotToDisplay: BankerSnapshot = (results as BankerRequestResult).newSnapshot || results.initialSnapshot;
  const { available, max, allocation, need, numResources } = snapshotToDisplay;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg space-y-6">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-table mr-2"></i> Banker's Algorithm State & Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MatrixTable title="Available Resources" matrix={available} numResources={numResources} isVector />
        <MatrixTable title="Max Need Matrix" matrix={max} numResources={numResources} />
        <MatrixTable title="Allocation Matrix" matrix={allocation} numResources={numResources} />
        <MatrixTable title="Calculated Need Matrix" matrix={need} numResources={numResources} />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-2">Results:</h3>
        {'isSafe' in results && ( // Safety Check Result
          <>
            <p className={`font-bold text-lg ${results.isSafe ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              System State: {results.isSafe ? 'SAFE' : 'UNSAFE'}
            </p>
            {results.isSafe && results.safeSequence && (
              <p>Safe Sequence: <span className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">{results.safeSequence.join(' → ')}</span></p>
            )}
          </>
        )}
        {'canBeGranted' in results && ( // Resource Request Result
             <>
                <p>Request from <span className="font-mono">{results.requestingProcessId}</span> for <span className="font-mono">[{results.requestVector.join(', ')}]</span></p>
                <p className={`font-bold text-lg ${results.canBeGranted ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    Request Status: {results.canBeGranted ? 'GRANTED' : 'DENIED / PROCESS MUST WAIT'}
                </p>
                {results.reason && <p className="text-sm text-slate-600 dark:text-slate-400">Reason: {results.reason}</p>}
                {results.canBeGranted && results.safetyCheckAfterGrant?.isSafe && results.safetyCheckAfterGrant.safeSequence && (
                     <p>New Safe Sequence: <span className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">{results.safetyCheckAfterGrant.safeSequence.join(' → ')}</span></p>
                )}
                 {results.canBeGranted && results.safetyCheckAfterGrant && !results.safetyCheckAfterGrant.isSafe &&(
                     <p className="font-bold text-red-500 dark:text-red-400">Warning: State became UNSAFE after granting (should not happen if logic is correct and request was deemed grantable).</p>
                 )}
            </>
        )}
        
        <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-blue-500 dark:text-blue-400">View Algorithm Log ({results.steps.length} steps)</summary>
            <div className="max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded mt-1 space-y-1 bg-slate-50 dark:bg-slate-700/30">
                {results.steps.map((step, idx) => (
                    <p key={idx} className="font-mono p-0.5">{step}</p>
                ))}
            </div>
        </details>

      </div>
    </div>
  );
};

export default BankersVisualization;
