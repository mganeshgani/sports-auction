import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, Player } from '../../types';
import Button from '../ui/Button';

interface TeamSelectionProps {
  currentPlayer: Player | null;
  teams: Team[];
  onAssign: (teamId: string, amount: number) => Promise<void>;
  onMarkUnsold: () => Promise<void>;
  className?: string;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  currentPlayer,
  teams,
  onAssign,
  onMarkUnsold,
  className = '',
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    const bidAmount = Number(amount);
    if (amount && isNaN(bidAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onAssign(selectedTeam, bidAmount);
      setSelectedTeam('');
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error assigning player');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkUnsold = async () => {
    setIsLoading(true);
    try {
      await onMarkUnsold();
      setSelectedTeam('');
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error marking player as unsold');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`bg-gray-800 rounded-xl p-6 shadow-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-semibold text-white mb-4">Assign Player</h3>

      <div className="space-y-4">
        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Team
          </label>
          <div className="grid grid-cols-2 gap-2">
            {teams.map((team) => (
              <motion.button
                key={team._id}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedTeam === team._id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${(team.filledSlots >= team.totalSlots || !team.remainingBudget) ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: (team.filledSlots < team.totalSlots && team.remainingBudget) ? 1.02 : 1 }}
                whileTap={{ scale: (team.filledSlots < team.totalSlots && team.remainingBudget) ? 0.98 : 1 }}
                onClick={() => (team.filledSlots < team.totalSlots && team.remainingBudget) && setSelectedTeam(team._id)}
                disabled={team.filledSlots >= team.totalSlots || !team.remainingBudget}
              >
                <div className="font-medium">{team.name}</div>
                <div className="text-sm opacity-75">
                  {team.filledSlots}/{team.totalSlots} Players
                </div>
                {team.budget !== null && (
                  <div className="text-sm opacity-75">
                    ₹{team.remainingBudget?.toLocaleString()} left
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bid Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amount (optional)"
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-100 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            className="flex-1"
            onClick={handleAssign}
            isLoading={isLoading}
            disabled={isLoading || !selectedTeam}
          >
            Assign Player
          </Button>
          <Button
            variant="danger"
            onClick={handleMarkUnsold}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Mark Unsold
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamSelection;