import React from 'react';
import Ladder from './Ladder';
import { motion } from 'framer-motion';

const QuizResultView = ({ result, responses, quizData, selectedLang, showDetails, setShowDetails, currentStep, hideToggle = false }) => {
  const questions = quizData.content?.[selectedLang]?.questions || quizData.questions || [];

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full">
      <h1 className="text-6xl font-bold mb-4">Result: {result.result}</h1>
      <p className="text-text-secondary mb-8">Thank you for participating!</p>
      
      {!hideToggle && (
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary mb-8 text-sm"
        >
          {showDetails ? 'Hide Details' : 'See Detailed Results'}
        </button>
      )}

      {showDetails ? (
        <div className="glass-card w-full max-w-3xl max-h-[50vh] overflow-y-auto text-left p-0 mb-5">
          {questions.map((q, idx) => {
            const response = responses.find(r => r.questionId === q._id);
            const selectedOption = q.options?.find(opt => opt.type === response?.answerType);
            return (
              <div key={idx} className="p-5 border-b border-glass-border flex justify-between items-center gap-5 hover:bg-white/[0.02]">
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-1">Question {idx + 1}</p>
                  <p className="font-medium">{q.questionText}</p>
                  <p className="text-sm mt-1 text-accent-primary">
                    Selected: "{selectedOption?.text || 'N/A'}"
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-semibold text-center min-w-[100px] 
                  ${response?.answerType === 'In-Charge' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'bg-white/10 text-text-secondary'
                  }`}>
                  {response?.answerType}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[400px] w-full flex justify-center">
          <Ladder currentStep={currentStep} />
        </div>
      )}
    </div>
  );
};

export default QuizResultView;
