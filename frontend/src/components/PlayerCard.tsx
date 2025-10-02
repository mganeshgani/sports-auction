import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isRevealing?: boolean;
  showStatus?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isRevealing = false,
  showStatus = true,
}) => {
  return (
    <motion.div
      className="relative bg-gray-800 rounded-xl overflow-hidden shadow-xl"
      initial={isRevealing ? { scale: 0.8, opacity: 0 } : undefined}
      animate={isRevealing ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      layoutId={`player-${player._id}`}
    >
      {/* Image Container */}
      <div className="aspect-w-3 aspect-h-4 relative">
        <motion.img
          src={player.photoUrl}
          alt={player.name}
          className="w-full h-full object-cover"
          initial={isRevealing ? { scale: 1.2 } : undefined}
          animate={isRevealing ? { scale: 1 } : undefined}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        {showStatus && player.status !== 'available' && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold
            ${player.status === 'sold' 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'}`}
          >
            {player.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Player Info */}
      <motion.div 
        className="p-4 space-y-2"
        initial={isRevealing ? { y: 20, opacity: 0 } : undefined}
        animate={isRevealing ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white truncate">{player.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
          <div>
            <span className="text-gray-500">Reg No:</span>
            <p className="font-medium">{player.regNo}</p>
          </div>
          <div>
            <span className="text-gray-500">Class:</span>
            <p className="font-medium">{player.class}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Position:</span>
            <p className="font-medium">{player.position}</p>
          </div>
        </div>

        {player.status === 'sold' && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Sold to:</span>
              <span className="font-medium text-indigo-400">
                {(player as any).team?.name || 'Unknown Team'}
              </span>
            </div>
            {player.soldAmount > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-green-400">
                  ₹{player.soldAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PlayerCard;