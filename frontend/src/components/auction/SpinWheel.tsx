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
          {[...Array(12)].map((_, i) => {
            const isGoldSegment = i % 2 === 0;
            
            return (
              <div
                key={i}
                className="wheel-segment"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  background: isGoldSegment ? 
                    'linear-gradient(135deg, #B8941E 0%, #D4AF37 30%, #F0D770 50%, #D4AF37 70%, #A67C00 100%)' : 
                    'linear-gradient(135deg, #0D1117 0%, #1A1F2E 30%, #242B3D 50%, #1A1F2E 70%, #0D1117 100%)'
                }}
              >
                {/* Elegant shine overlay */}
                <div className="segment-shine" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: isGoldSegment ? 
                    'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.2) 100%)' :
                    'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 40%)',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Subtle texture overlay */}
                <div className="segment-texture" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: isGoldSegment ?
                    'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)' :
                    'radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }}></div>
              </div>
            );
          })}
          
          {/* Outer decorative ring */}
          <div className="wheel-outer-ring"></div>
          
          {/* Center circle */}
          <div className="wheel-center">
            <div className="wheel-center-ring"></div>
            <div className="wheel-center-inner">
              <div className="center-dot"></div>
            </div>
          </div>
        </div>

        {/* Premium Pointer */}
        <div className="wheel-pointer">
          <div className="pointer-glow"></div>
          <div className="pointer-arrow"></div>
        </div>
      </div>

      {isSpinning && (
        <div className="spin-text">
          <div className="spin-text-container">
            <div className="spin-icon">
              <svg style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} fill="#D4AF37" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p style={{ 
              color: '#D4AF37', 
              fontSize: '1.5rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 2px 10px rgba(0,0,0,0.5)',
              marginTop: '0.5rem'
            }}>
              Selecting Player...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
