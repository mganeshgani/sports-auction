import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../types';
import confetti from 'canvas-confetti';

interface PlayerRevealProps {
  player: Player | null;
  isRevealing: boolean;
  onRevealComplete?: () => void;
}

const PlayerReveal: React.FC<PlayerRevealProps> = ({
  player,
  isRevealing,
  onRevealComplete,
}) => {
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1500
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2 },
    });

    fire(0.2, {
      spread: 60,
      origin: { x: 0.5 },
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.8 },
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5 },
    });
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={onRevealComplete}>
      {player && (
        <motion.div
          key={player._id}
          className="relative w-full max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          onAnimationComplete={() => {
            if (isRevealing) {
              triggerConfetti();
              if (onRevealComplete) onRevealComplete();
            }
          }}
        >
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl">
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy" />
            
            <div className="relative m-[2px] bg-gray-900 rounded-2xl overflow-hidden">
              {/* Image Section */}
              <div className="aspect-w-3 aspect-h-4 relative">
                <motion.img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.2, filter: 'blur(10px)' }}
                  animate={{ scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
              </div>

              {/* Player Info Section */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Name and Position */}
                <div>
                  <motion.h2
                    className="text-4xl font-bold text-white mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {player.name}
                  </motion.h2>
                  <motion.p
                    className="text-xl text-indigo-400 font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {player.position}
                  </motion.p>
                </div>

                {/* Details Grid */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Register No.</span>
                    <p className="text-white font-medium">{player.regNo}</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Class</span>
                    <p className="text-white font-medium">{player.class}</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Particles */}
              {isRevealing && (
                <>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-indigo-500 rounded-full"
                      initial={{
                        opacity: 0,
                        x: '50%',
                        y: '50%',
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        x: `${50 + (Math.random() - 0.5) * 100}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                        scale: [1, 1.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerReveal;