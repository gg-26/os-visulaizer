
import React from 'react';
import { DiskAlgorithmOption } from '../../types';

interface DiskAlgorithmExplanationProps {
  selectedAlgorithm: DiskAlgorithmOption | undefined;
}

const DiskAlgorithmExplanation: React.FC<DiskAlgorithmExplanationProps> = ({ selectedAlgorithm }) => {
  if (!selectedAlgorithm || !selectedAlgorithm.explanation) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-book-reader mr-2"></i> Algorithm Explanation
        </h2>
        <p className="text-slate-600 dark:text-slate-300">Select a disk scheduling algorithm to see its explanation.</p>
      </div>
    );
  }

  const { name, description, explanation } = selectedAlgorithm;

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-2 text-blue-600 dark:text-blue-400 flex items-center">
        <i className="fas fa-info-circle mr-3"></i> {name}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{description}</p>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
            <i className="fas fa-lightbulb mr-2 text-yellow-500 dark:text-yellow-400"></i> Concept
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">{explanation.concept}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
            <i className="fas fa-cogs mr-2 text-blue-500 dark:text-blue-400"></i> How it Works
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
            {explanation.howItWorks.map((item, index) => <li key={`work-${index}`}>{item}</li>)}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
            <i className="fas fa-thumbs-up mr-2 text-green-500 dark:text-green-400"></i> Pros
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
            {explanation.pros.map((item, index) => <li key={`adv-${index}`}>{item}</li>)}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
            <i className="fas fa-thumbs-down mr-2 text-red-500 dark:text-red-400"></i> Cons
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
            {explanation.cons.map((item, index) => <li key={`disadv-${index}`}>{item}</li>)}
          </ul>
        </div>
        {explanation.requiresDirection && (
            <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1">
                <i className="fas fa-exclamation-triangle mr-1"></i> This algorithm requires an initial head movement direction.
            </p>
        )}
      </div>
    </div>
  );
};

export default DiskAlgorithmExplanation;
