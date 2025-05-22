
import React from 'react';
import { DeadlockAlgorithmOption } from '../../types';

interface DeadlockAlgorithmExplanationProps {
  selectedAlgorithm: DeadlockAlgorithmOption | undefined;
}

const DeadlockAlgorithmExplanation: React.FC<DeadlockAlgorithmExplanationProps> = ({ selectedAlgorithm }) => {
  if (!selectedAlgorithm || !selectedAlgorithm.explanation) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
          <i className="fas fa-book-open mr-2"></i> Algorithm Explanation
        </h2>
        <p className="text-slate-600 dark:text-slate-300">Select an algorithm to see its explanation.</p>
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
        
        {explanation.algorithmSteps && (
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
              <i className="fas fa-list-ol mr-2 text-blue-500 dark:text-blue-400"></i> Algorithm Steps
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300 pl-2">
              {explanation.algorithmSteps.map((item, index) => <li key={`step-${index}`}>{item}</li>)}
            </ol>
          </div>
        )}

        {explanation.example && (
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
              <i className="fas fa-vial mr-2 text-purple-500 dark:text-purple-400"></i> Example
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md italic whitespace-pre-line">
              {explanation.example}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlockAlgorithmExplanation;
