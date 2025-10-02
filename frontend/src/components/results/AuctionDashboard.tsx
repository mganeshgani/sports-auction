import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';
import { Team } from '../../types';
import AnimatedBackground from '../ui/AnimatedBackground';
import ExportOptions from './ExportOptions';

interface DashboardStats {
  totalPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAmount: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
}

const AuctionDashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    soldPlayers: 0,
    unsoldPlayers: 0,
    totalAmount: 0,
    averagePrice: 0,
    highestPrice: 0,
    lowestPrice: 0
  });

  useEffect(() => {
    // Fetch auction results
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/auction/results');
        const data = await response.json();
        setTeams(data.teams);
        setPlayers(data.soldPlayers.concat(data.unsoldPlayers));
        
        // Calculate statistics
        const soldPlayers = data.soldPlayers;
        const soldPrices = soldPlayers.map((p: Player) => p.soldAmount);
        
        setStats({
          totalPlayers: data.soldPlayers.length + data.unsoldPlayers.length,
          soldPlayers: data.soldPlayers.length,
          unsoldPlayers: data.unsoldPlayers.length,
          totalAmount: soldPrices.reduce((a: number, b: number) => a + b, 0),
          averagePrice: soldPlayers.length 
            ? soldPrices.reduce((a: number, b: number) => a + b, 0) / soldPlayers.length 
            : 0,
          highestPrice: Math.max(...soldPrices, 0),
          lowestPrice: Math.min(...(soldPrices.filter((p: number) => p > 0) || [0]))
        });
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResults();
  }, []);

  return (
    <AnimatedBackground variant="gradient-xy">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Auction Summary
          </h1>
          <p className="text-white/70">
            Complete overview of the auction results
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Players"
            value={stats.totalPlayers}
            subtext={`${stats.soldPlayers} sold, ${stats.unsoldPlayers} unsold`}
          />
          <StatCard
            title="Total Amount"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            subtext="Total money spent"
          />
          <StatCard
            title="Average Price"
            value={`₹${Math.round(stats.averagePrice).toLocaleString()}`}
            subtext="Per player average"
          />
          <StatCard
            title="Highest Bid"
            value={`₹${stats.highestPrice.toLocaleString()}`}
            subtext="Maximum amount spent"
          />
        </div>

        {/* Team Performance */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Team Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {team.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">Players</span>
                    <span className="text-white">{team.players.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Spent</span>
                    <span className="text-white">
                      ₹{team.players.reduce((sum: number, p: Player) => sum + p.soldAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Remaining</span>
                    <span className="text-purple-400">
                      ₹{(team.budget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <ExportOptions teams={teams} players={players} />
        </div>
      </div>
    </AnimatedBackground>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
  >
    <h3 className="text-lg font-semibold text-white/70 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-white/50">{subtext}</p>
  </motion.div>
);

export default AuctionDashboard;