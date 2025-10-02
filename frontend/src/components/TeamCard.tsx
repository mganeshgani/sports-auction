import React from 'react';
import { motion } from 'framer-motion';
import { Team } from '../types';
import Button from './ui/Button';

interface TeamCardProps {
  team: Team;
  onEdit: () => void;
  onDelete: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="p-4 bg-gray-700">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white truncate">{team.name}</h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={onDelete}
              disabled={team.filledSlots > 0}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Players</div>
            <div className="text-xl font-bold text-white">
              {team.filledSlots} / {team.totalSlots}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Slots Left</div>
            <div className="text-xl font-bold text-white">
              {team.totalSlots - team.filledSlots}
            </div>
          </div>
        </div>

        {/* Budget Info */}
        {team.budget !== null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Total Budget:</span>
              <span className="text-white font-medium">
                ₹{team.budget.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Remaining:</span>
              <span className={`font-medium ${
                (team.remainingBudget || 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ₹{(team.remainingBudget || 0).toLocaleString()}
              </span>
            </div>
            
            {/* Budget Progress Bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((team.budget - (team.remainingBudget || 0)) / team.budget) * 100}%`
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Players List */}
        {team.players && team.players.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Players</h4>
            <div className="space-y-2">
              {team.players.map((player) => (
                <div
                  key={player._id}
                  className="flex justify-between items-center bg-gray-700/30 p-2 rounded"
                >
                  <span className="text-white">{player.name}</span>
                  <span className="text-sm text-gray-400">{player.position}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TeamCard;