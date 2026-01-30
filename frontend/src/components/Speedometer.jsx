import React from 'react';
import { motion } from 'framer-motion';

const Speedometer = ({ currentStep, totalSteps }) => {
  // Normalize step to 0-1 range
  const normalizedValue = (currentStep - 1) / (totalSteps - 1);
  // Map to angle range but clamp to prevent extreme positions
  // Instead of -90 to 90, use -80 to 80 to keep needle visible
  const rawAngle = normalizedValue * 180 - 90;
  const angle = Math.max(-80, Math.min(80, rawAngle)); // Clamp between -80 and 80

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-4">
      <div className="relative w-full aspect-[2/1] overflow-hidden">
        {/* The Gauge Arch */}
        <svg viewBox="0 0 200 100" className="w-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Segments (Markers) with Glow - 25% | 50% | 25% Split */}
          <motion.path 
            d="M 20 100 A 80 80 0 0 1 43.4 43.4" 
            fill="none" 
            stroke="#f97316" 
            strokeWidth="12" 
            animate={{ strokeOpacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#glow)"
          />
          <motion.path 
            d="M 43.4 43.4 A 80 80 0 0 1 156.6 43.4" 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="12" 
            animate={{ strokeOpacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            filter="url(#glow)"
          />
          <motion.path 
            d="M 156.6 43.4 A 80 80 0 0 1 180 100" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="12" 
            animate={{ strokeOpacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            filter="url(#glow)"
          />

          {/* Labels for Segments - Optimized placement */}
          <text x="35" y="85" fontSize="7" fill="#f97316" className="font-bold uppercase tracking-tighter opacity-80" textAnchor="middle">In-Control</text>
          <text x="100" y="20" fontSize="8" fill="#94a3b8" className="font-bold uppercase tracking-tighter opacity-80" textAnchor="middle">Balanced</text>
          <text x="165" y="85" fontSize="7" fill="#3b82f6" className="font-bold uppercase tracking-tighter opacity-80" textAnchor="middle">In-Charge</text>

          {/* Center Point */}
          <circle cx="100" cy="100" r="5" fill="#fff" />
        </svg>

        {/* Needle with Slow Rise Animation */}
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ 
            type: 'spring', 
            stiffness: 25, 
            damping: 12,
            delay: 0.5,
            duration: 2 
          }}
          style={{ originX: '50%', originY: '100%' }}
          className="absolute left-1/2 bottom-0 w-1.5 h-3/4 -translate-x-1/2 z-20"
        >
          <div className="w-full h-full bg-gradient-to-t from-white to-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
        </motion.div>
      </div>

      <div className="mt-4 text-center text-white">
        <div className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Final Stance</div>
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            key={currentStep}
            className={`text-4xl font-black uppercase italic tracking-tighter drop-shadow-lg ${
                normalizedValue < 0.25 ? 'text-orange-500' : 
                normalizedValue > 0.75 ? 'text-blue-500' : 'text-slate-400'
            }`}
        >
            {normalizedValue < 0.25 ? 'In-Control' : 
             normalizedValue > 0.75 ? 'In-Charge' : 'Balanced'}
        </motion.div>
      </div>
    </div>
  );
};

export default Speedometer;
