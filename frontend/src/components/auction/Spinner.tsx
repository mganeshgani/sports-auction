import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  isSpinning: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ isSpinning }) => {
  return (
    <motion.div
      className="relative w-96 h-96"
      animate={isSpinning ? { rotate: 360 * 5 } : {}}
      transition={{
        duration: 3,
        ease: [0.13, 0.89, 0.3, 0.97],
      }}
    >
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30">
        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin-slow"></div>
      </div>

      {/* Inner Glowing Circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm"
        animate={{
          boxShadow: isSpinning
            ? [
                '0 0 20px rgba(79, 70, 229, 0.3)',
                '0 0 40px rgba(79, 70, 229, 0.5)',
                '0 0 20px rgba(79, 70, 229, 0.3)',
              ]
            : '0 0 20px rgba(79, 70, 229, 0.3)',
        }}
        transition={{
          duration: 1.5,
          repeat: isSpinning ? Infinity : 0,
          repeatType: 'reverse',
        }}
      />

      {/* Decorative Elements */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-12 origin-bottom"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-11rem)`,
          }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-t from-indigo-500 to-transparent rounded-full"
            animate={{
              opacity: isSpinning ? [0.3, 1, 0.3] : 0.3,
              scale: isSpinning ? [0.8, 1, 0.8] : 0.8,
            }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              repeat: isSpinning ? Infinity : 0,
              repeatType: 'reverse',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Spinner;