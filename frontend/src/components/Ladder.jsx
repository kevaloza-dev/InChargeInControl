import React from 'react';
import { motion } from 'framer-motion';

const Ladder = ({ currentStep }) => {
  const steps = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col-reverse justify-between py-5 relative w-[250px] mx-auto">
      {steps.map((step) => (
        <div 
          key={step} 
          className={`w-full h-2 rounded-full transition-colors duration-300 relative ${step === currentStep ? 'bg-accent-primary shadow-[0_0_20px_theme(colors.accent-primary)]' : 'bg-white/10'}`}
        >
          {step === currentStep && (
            <motion.div
              layoutId="avatar"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border-4 border-accent-primary z-10 flex items-center justify-center text-lg"
            >
               👤
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Ladder;
