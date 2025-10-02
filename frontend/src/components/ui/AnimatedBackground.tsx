import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  variant?: 'gradient-x' | 'gradient-y' | 'gradient-xy';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  variant = 'gradient-xy',
  className = '',
}) => {
  const baseClasses = `min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-${variant}`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBackground;