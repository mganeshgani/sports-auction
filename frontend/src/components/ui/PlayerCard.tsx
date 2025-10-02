import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  selected = false,
  showDetails = true,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`
        relative aspect-[3/4] rounded-xl p-6 cursor-pointer
        bg-white/10 backdrop-blur-lg border border-white/20
        hover:bg-white/20 transition-all duration-300
        ${selected ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''}
      `}
    >
      {/* Top Section - Name & Base Price */}
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold text-white truncate">{player.name}</h3>
        <p className="text-sm text-white/80">Student ID: {player.regNo}</p>
      </div>

      {/* Middle Section - Player Details */}
      {showDetails && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 space-y-2"
        >
          <div className="flex justify-between text-sm text-white/70">
            <span>Age:</span>
            <span>{player.class}</span>
          </div>
          <div className="flex justify-between text-sm text-white/70">
            <span>Position:</span>
            <span>{player.position}</span>
          </div>
          <div className="flex justify-between text-sm text-white/70">
            <span>Experience:</span>
            <span>{player.createdAt}</span>
          </div>
        </motion.div>
      )}

      {/* Bottom Section - Stats */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <div className="font-medium">Height</div>
            <div className="mt-1">{player.photoUrl || "No Photo"}</div>
          </div>
          <div className="text-center p-2 bg-white/5 rounded-lg">
            <div className="font-medium">Weight</div>
            <div className="mt-1">{player.team || "No Team"}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;