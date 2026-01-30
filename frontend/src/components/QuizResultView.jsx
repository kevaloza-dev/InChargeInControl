import React from 'react';
import Speedometer from './Speedometer';
import { motion } from 'framer-motion';

const QuizResultView = ({ result, responses, quizData, selectedLang, showDetails, setShowDetails, currentStep, totalSteps, hideToggle = false }) => {
  const langKey = selectedLang?.toLowerCase();
  const questions = quizData.content?.[langKey]?.questions || quizData.questions || [];

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full">
      <h1 className="text-4xl font-bold mb-2">Result: {result.result}</h1>
      <p className="text-text-secondary mb-4">Thank you for participating!</p>
      
      {/* Toggle button - positioned right after thank you text */}
      {!hideToggle && (
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary mb-4 text-sm"
        >
          {showDetails ? 'Back to Result' : 'See Detailed Results'}
        </button>
      )}

      {/* Conditional rendering: either speedometer OR detailed results */}
      {showDetails ? (
        /* Detailed results view */
        <div className="glass-card w-full max-w-3xl max-h-[60vh] overflow-y-auto text-left p-0 mb-5">
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
                    ? 'bg-blue-500/20 text-blue-400' 
                    : response?.answerType === 'In-Control'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/10 text-text-secondary'
                  }`}>
                  {response?.answerType}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Speedometer view */
        <div className="w-full h-auto flex flex-col items-center">
          <Speedometer currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      )}
    </div>
  );
};

export default QuizResultView;
