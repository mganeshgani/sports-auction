import React from 'react';
import { motion } from 'framer-motion';
import { Team } from '../../types';
import { Player } from '../../types';
import PlayerCard from '../ui/PlayerCard';
import AnimatedBackground from '../ui/AnimatedBackground';

interface TeamRosterProps {
  team: Team;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TeamRoster: React.FC<TeamRosterProps> = ({ team }) => {
  const totalSpent = team.players.reduce((sum: number, p: Player) => sum + p.soldAmount, 0);
  const remainingBudget = team.remainingBudget;
  
  const playersByPosition = team.players.reduce<Record<string, Player[]>>((acc, player) => {
    const position = player.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <AnimatedBackground variant="gradient-y" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {team.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center space-x-8 text-white/80"
          >
            <div>
              <p className="text-sm">Total Players</p>
              <p className="text-2xl font-semibold">{team.players.length}</p>
            </div>
            <div>
              <p className="text-sm">Total Spent</p>
              <p className="text-2xl font-semibold text-green-400">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm">Remaining Budget</p>
              <p className="text-2xl font-semibold text-purple-400">
                ₹{(remainingBudget || 0).toLocaleString()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Players by Position */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {Object.entries(playersByPosition).map(([position, players]) => (
            <div key={position} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                {position} ({players.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player, index) => (
                  <motion.div
                    key={player._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PlayerCard player={player} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Average Player Cost
            </h3>
            <p className="text-2xl font-bold text-purple-400">
              ₹{(totalSpent / team.players.length).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Highest Paid Player
            </h3>
            <p className="text-2xl font-bold text-purple-400">
              {team.players.reduce<Player>((highest, p) => 
                p.soldAmount > (highest?.soldAmount || 0) ? p : highest,
                team.players[0]
              ).name}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Squad Utilization
            </h3>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round((team.filledSlots / team.totalSlots) * 100)}%
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default TeamRoster;