import React, { useState, useEffect } from 'react';
import './SpinWheel.css';

interface SpinWheelProps {
  onSpinComplete: () => void;
  isSpinning: boolean;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, isSpinning }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      // Random rotation between 1800-3600 degrees (5-10 full rotations)
      const randomRotation = Math.floor(Math.random() * 1800) + 1800;
      setRotation(rotation + randomRotation);

      // Call onSpinComplete after animation finishes
      setTimeout(() => {
        onSpinComplete();
      }, 4000); // 4 seconds animation
    }
  }, [isSpinning]);

  return (
    <div className="spin-wheel-container">
      <div className="spin-wheel-frame">
        <div 
          className="spin-wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="wheel-segment"
              style={{
                transform: `rotate(${i * 30}deg)`,
                background: i % 2 === 0 ? 
                  'linear-gradient(to right, #4f46e5, #7c3aed)' : 
                  'linear-gradient(to right, #7c3aed, #ec4899)'
              }}
            >
              <div className="wheel-segment-image">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            </div>
          ))}
          
          {/* Center circle */}
          <div className="wheel-center">
            <div className="wheel-center-inner">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="wheel-pointer">
          <div className="pointer-triangle"></div>
        </div>
      </div>

      {isSpinning && (
        <div className="spin-text">
          <p className="text-2xl font-bold text-white animate-pulse">
            Selecting Player...
          </p>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
