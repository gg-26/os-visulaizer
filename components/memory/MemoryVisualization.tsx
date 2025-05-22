
import React from 'react';
import { PageReplacementResult, PageReplacementStep } from '../../types';

interface MemoryVisualizationProps {
  results: PageReplacementResult | null;
}

const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
        <i className="fas fa-eye-slash text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-300">Run simulation to see visualization.</p>
      </div>
    );
  }

  const { steps, frameCount, referenceString } = results;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
        <i className="fas fa-table-cells mr-2"></i> Page Replacement Steps
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700">
              <th className="p-2 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm">Step / Page</th>
              {Array.from({ length: frameCount }).map((_, i) => (
                <th key={`frame-header-${i}`} className="p-2 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm">Frame {i}</th>
              ))}
              <th className="p-2 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm">Status</th>
              <th className="p-2 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, stepIndex) => (
              <tr key={stepIndex} className="text-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-2 border border-slate-300 dark:border-slate-600 font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  {step.pageNumber}
                </td>
                {step.frames.map((pageId, frameIndex) => (
                  <td 
                    key={`frame-${stepIndex}-${frameIndex}`} 
                    className={`p-2 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm
                                ${step.highlightedFrameIndex === frameIndex && step.pageToPlace === pageId ? (step.isPageFault ? 'page-enter font-bold' : 'font-bold') : ''}
                                ${step.isPageFault && step.replacedPage === pageId && step.highlightedFrameIndex === frameIndex ? 'page-exit text-red-500' : ''}
                              `}
                  >
                    {pageId === null ? '-' : pageId}
                  </td>
                ))}
                <td className={`p-2 border border-slate-300 dark:border-slate-600 font-semibold text-xs sm:text-sm ${step.isPageFault ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                  {step.isPageFault ? 'FAULT' : 'HIT'}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-600 text-left text-xs">
                  {step.actionDescription}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <strong>Reference String:</strong> {referenceString.join(', ')} <br/>
        <strong>Number of Frames:</strong> {frameCount}
      </div>
    </div>
  );
};

export default MemoryVisualization;
