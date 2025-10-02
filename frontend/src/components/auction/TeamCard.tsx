import React from 'react';
import { Team } from '../../types';

interface TeamCardProps {
  team: Team;
  compact?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, compact = false }) => {
  const budgetPercentage = team.budget && team.remainingBudget 
    ? ((team.remainingBudget / team.budget) * 100) 
    : 0;

  const slotsPercentage = team.totalSlots && team.filledSlots
    ? ((team.filledSlots / team.totalSlots) * 100)
    : 0;

  const getBudgetColor = () => {
    if (budgetPercentage > 50) return 'from-green-500 to-emerald-500';
    if (budgetPercentage > 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getSlotsColor = () => {
    if (slotsPercentage < 50) return 'from-blue-500 to-cyan-500';
    if (slotsPercentage < 80) return 'from-purple-500 to-pink-500';
    return 'from-green-500 to-emerald-500';
  };

  if (compact) {
    return (
      <div className="group relative">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        
        {/* Card */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2.5 border border-gray-700/50 hover:border-gray-600 transition-all duration-300">
          {/* Team Name with Icon */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-black text-white text-sm flex-1 truncate">{team.name}</h3>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <span>💰</span>
                  Budget
                </span>
                <span className="text-[10px] font-bold text-white">
                  ₹{team.remainingBudget?.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className={`h-full bg-gradient-to-r ${getBudgetColor()} rounded-full transition-all duration-500`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Slots */}
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <span>👥</span>
                  Players
                </span>
                <span className="text-[10px] font-bold text-white">
                  {team.filledSlots}/{team.totalSlots}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className={`h-full bg-gradient-to-r ${getSlotsColor()} rounded-full transition-all duration-500`}
                  style={{ width: `${slotsPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Large Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
      
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
        {/* Top Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        
        <div className="p-6">
          {/* Team Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-2xl mb-1">{team.name}</h3>
              <p className="text-gray-400 text-sm font-semibold">Team Overview</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="space-y-4">
            {/* Total Budget */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">💼</span>
                  Total Budget
                </span>
                <span className="text-xl font-black text-white">
                  ₹{team.budget?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Remaining
                </span>
                <span className="text-xl font-black text-yellow-400">
                  ₹{team.remainingBudget?.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full bg-gradient-to-r ${getBudgetColor()} rounded-full transition-all duration-500 shadow-lg`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 font-semibold">{budgetPercentage.toFixed(0)}% left</span>
              </div>
            </div>

            {/* Players */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  Squad
                </span>
                <span className="text-xl font-black text-white">
                  {team.filledSlots} / {team.totalSlots}
                </span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full bg-gradient-to-r ${getSlotsColor()} rounded-full transition-all duration-500 shadow-lg`}
                  style={{ width: `${slotsPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 font-semibold">{slotsPercentage.toFixed(0)}% filled</span>
                <span className="text-xs text-gray-500 font-semibold">{team.totalSlots - (team.filledSlots || 0)} slots left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
      </div>
    </div>
  );
};

export default TeamCard;
