import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Team, Player } from '../types';
import { CSVLink } from 'react-csv';
import io from 'socket.io-client';

const ResultsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sold: 0,
    unsold: 0,
    totalSpent: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        axios.get(`${API_URL}/teams`),
        axios.get(`${API_URL}/players`)
      ]);
      
      setTeams(teamsRes.data);
      setPlayers(playersRes.data);
      
      const sold = playersRes.data.filter((p: Player) => p.status === 'sold');
      const unsold = playersRes.data.filter((p: Player) => p.status === 'unsold');
      const totalSpent = sold.reduce((sum: number, p: Player) => sum + (p.soldAmount || 0), 0);
      
      setStats({
        total: playersRes.data.length,
        sold: sold.length,
        unsold: unsold.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
    
    // Setup Socket.io connection for real-time updates
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('✓ Results page connected to Socket.io');
    });

    socket.on('playerSold', () => {
      console.log('Player sold - refreshing results');
      fetchData();
    });

    socket.on('playerMarkedUnsold', () => {
      console.log('Player marked unsold - refreshing results');
      fetchData();
    });

    socket.on('dataReset', () => {
      console.log('Data reset - refreshing results');
      fetchData();
    });

    socket.on('playerUpdated', () => {
      console.log('Player updated - refreshing results');
      fetchData();
    });

    socket.on('teamUpdated', () => {
      console.log('Team updated - refreshing results');
      fetchData();
    });

    socket.on('disconnect', () => {
      console.log('✗ Results page disconnected from Socket.io');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [fetchData, SOCKET_URL]);

  const csvHeaders = [
    { label: 'Player Name', key: 'name' },
    { label: 'Reg No', key: 'regNo' },
    { label: 'Class', key: 'class' },
    { label: 'Position', key: 'position' },
    { label: 'Status', key: 'status' },
    { label: 'Team', key: 'teamName' },
    { label: 'Sold Amount', key: 'soldAmount' }
  ];

  const csvData = players.map(p => ({
    ...p,
    teamName: teams.find(t => t._id === p.team)?.name || 'N/A',
    soldAmount: p.soldAmount || 0
  }));

  // Position color mapping based on color theory
  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'Batsman': 'from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/40',
      'Bowler': 'from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/40',
      'All-Rounder': 'from-purple-500/20 via-pink-500/20 to-rose-500/20 border-purple-500/40',
      'Wicket-Keeper': 'from-emerald-500/20 via-green-500/20 to-lime-500/20 border-emerald-500/40',
    };
    return colors[position] || 'from-gray-500/20 via-slate-500/20 to-zinc-500/20 border-gray-500/40';
  };

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'Batsman': '🏏',
      'Bowler': '⚡',
      'All-Rounder': '⭐',
      'Wicket-Keeper': '🧤',
    };
    return icons[position] || '🎯';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Premium Header with Glass Morphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header Top Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Auction Results
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Updates Active
                </p>
              </div>
            </div>

            {/* Export Button - Premium Design */}
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`auction_results_${new Date().toISOString().split('T')[0]}.csv`}
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="relative z-10 hidden sm:inline">Export CSV</span>
              <span className="relative z-10 sm:hidden">Export</span>
            </CSVLink>
          </div>

          {/* Stats Row - Responsive Grid */}
          {!loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Players */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Total Players</p>
                    <p className="text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl opacity-80">👥</div>
                </div>
              </div>

              {/* Sold Players */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Sold</p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.sold}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl">✅</div>
                </div>
              </div>

              {/* Unsold Players */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Unsold</p>
                    <p className="text-2xl sm:text-3xl font-black text-rose-400">{stats.unsold}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl">❌</div>
                </div>
              </div>

              {/* Total Spent */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Total Spent</p>
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      ₹{(stats.totalSpent / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl">💰</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Team Results - Premium Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            <p className="mt-6 text-slate-400 font-semibold text-lg">Loading Results...</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {teams.map((team, index) => {
              const teamPlayers = players.filter(p => p.team === team._id);
              const spent = teamPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0);
              const remaining = (team.remainingBudget !== undefined ? team.remainingBudget : (team.budget || 0) - spent);
              const budgetUsedPercentage = ((spent / (team.budget || 1)) * 100).toFixed(0);
              
              // Premium gradient colors for teams based on index
              const teamGradients = [
                'from-violet-600/20 via-purple-600/20 to-fuchsia-600/20',
                'from-blue-600/20 via-cyan-600/20 to-teal-600/20',
                'from-emerald-600/20 via-green-600/20 to-lime-600/20',
                'from-amber-600/20 via-yellow-600/20 to-orange-600/20',
                'from-rose-600/20 via-pink-600/20 to-red-600/20',
                'from-indigo-600/20 via-blue-600/20 to-sky-600/20',
              ];
              const teamBorderColors = [
                'border-violet-500/40 hover:border-violet-400/60',
                'border-blue-500/40 hover:border-blue-400/60',
                'border-emerald-500/40 hover:border-emerald-400/60',
                'border-amber-500/40 hover:border-amber-400/60',
                'border-rose-500/40 hover:border-rose-400/60',
                'border-indigo-500/40 hover:border-indigo-400/60',
              ];
              const gradientClass = teamGradients[index % teamGradients.length];
              const borderClass = teamBorderColors[index % teamBorderColors.length];
              
              return (
                <div
                  key={team._id}
                  className={`group relative overflow-hidden bg-gradient-to-br ${gradientClass} backdrop-blur-sm rounded-2xl border ${borderClass} transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10`}
                >
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Card Content */}
                  <div className="relative z-10 p-6 sm:p-8">
                    {/* Team Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center border ${borderClass} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <span className="text-3xl sm:text-4xl">🏅</span>
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{team.name}</h2>
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                              <span>👥</span>
                              <span className="text-slate-300 font-semibold">
                                {teamPlayers.length}/{team.totalSlots} Players
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                              <span>📊</span>
                              <span className="text-slate-300 font-semibold">
                                {budgetUsedPercentage}% Used
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Budget Overview - Responsive */}
                      <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 sm:text-right">
                        <div className="flex-1 sm:flex-none bg-slate-800/60 backdrop-blur-sm rounded-xl px-4 py-2 sm:py-3">
                          <p className="text-xs text-slate-400 mb-1">Budget Spent</p>
                          <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                            ₹{spent.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-1 sm:flex-none bg-slate-800/60 backdrop-blur-sm rounded-xl px-4 py-2 sm:py-3">
                          <p className="text-xs text-slate-400 mb-1">Remaining</p>
                          <p className={`text-xl sm:text-2xl font-black ${
                            remaining >= (team.budget || 0) * 0.3 ? 'text-emerald-400' : 
                            remaining >= (team.budget || 0) * 0.1 ? 'text-amber-400' : 
                            'text-rose-400'
                          }`}>
                            ₹{remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-medium">Budget Utilization</span>
                        <span className="text-xs text-white font-bold">{budgetUsedPercentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-800/60 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            parseFloat(budgetUsedPercentage) >= 90 ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                            parseFloat(budgetUsedPercentage) >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                            'bg-gradient-to-r from-emerald-500 to-teal-600'
                          }`}
                          style={{ width: `${budgetUsedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Team Players Grid - Premium Design */}
                    {teamPlayers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {teamPlayers.map((player) => (
                          <div
                            key={player._id}
                            className={`group/player relative overflow-hidden bg-gradient-to-br ${getPositionColor(player.position)} backdrop-blur-sm rounded-xl p-4 border ${player.position === 'Batsman' ? 'border-amber-500/40' : player.position === 'Bowler' ? 'border-blue-500/40' : player.position === 'All-Rounder' ? 'border-purple-500/40' : 'border-emerald-500/40'} hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                          >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/player:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="relative z-10 flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{getPositionIcon(player.position)}</span>
                                  <p className="font-bold text-white text-sm sm:text-base truncate">{player.name}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    {player.position}
                                  </p>
                                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                    Class {player.class}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                    {player.regNo}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                                  <p className="text-xs text-slate-400 mb-0.5">Price</p>
                                  <p className="text-sm sm:text-base font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                    ₹{player.soldAmount?.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700/30">
                        <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-4">
                          <span className="text-5xl">📭</span>
                        </div>
                        <p className="text-slate-400 font-semibold text-lg">No Players Acquired</p>
                        <p className="text-slate-500 text-sm mt-2">This team hasn't bought any players yet</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Premium Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;