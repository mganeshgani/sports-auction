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
      console.log('📊 Fetching latest teams and players data...');
      const [teamsRes, playersRes] = await Promise.all([
        axios.get(`${API_URL}/teams`),
        axios.get(`${API_URL}/players`)
      ]);
      
      console.log('✅ Teams fetched:', teamsRes.data.length);
      console.log('✅ Players fetched:', playersRes.data.length);
      
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
      
      console.log('📈 Stats updated:', { 
        total: playersRes.data.length, 
        sold: sold.length, 
        unsold: unsold.length 
      });
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  }, [API_URL, loading]);

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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 overflow-hidden">
      {/* Compact Premium Header */}
      <div className="flex-shrink-0 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 shadow-xl">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Header Row - Compact */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-xl sm:text-2xl">🏆</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Auction Results
                </h1>
                <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Live Updates
                </p>
              </div>
            </div>

            {/* Export Button - Compact */}
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`auction_results_${new Date().toISOString().split('T')[0]}.csv`}
              className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="relative z-10 hidden sm:inline">Export</span>
            </CSVLink>
          </div>

          {/* Compact Stats Row */}
          {!loading && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 hover:border-blue-500/50 transition-all">
                <p className="text-xs text-slate-400 mb-0.5">Total</p>
                <p className="text-lg sm:text-xl font-black text-white">{stats.total}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 hover:border-emerald-500/50 transition-all">
                <p className="text-xs text-slate-400 mb-0.5">Sold</p>
                <p className="text-lg sm:text-xl font-black text-emerald-400">{stats.sold}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 hover:border-rose-500/50 transition-all">
                <p className="text-xs text-slate-400 mb-0.5">Unsold</p>
                <p className="text-lg sm:text-xl font-black text-rose-400">{stats.unsold}</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 hover:border-amber-500/50 transition-all">
                <p className="text-xs text-slate-400 mb-0.5">Spent</p>
                <p className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  ₹{(stats.totalSpent / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Horizontal Scrolling Teams - Premium Compact Layout */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
            <p className="mt-4 text-slate-400 font-semibold">Loading Results...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 sm:px-6 py-4">
          {/* Horizontal Teams Container */}
          <div className="flex gap-4 pb-4 min-h-0" style={{ minWidth: 'max-content' }}>
            {teams.map((team, index) => {
              const teamPlayers = players.filter(p => p.team === team._id);
              const spent = teamPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0);
              const remaining = (team.remainingBudget !== undefined ? team.remainingBudget : (team.budget || 0) - spent);
              const budgetUsedPercentage = ((spent / (team.budget || 1)) * 100).toFixed(0);
              
              console.log(`Team ${team.name}:`, {
                playersCount: teamPlayers.length,
                spent,
                remaining,
                budgetUsed: budgetUsedPercentage + '%'
              });
              
              // Premium gradient colors for teams
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
                  key={`${team._id}-${teamPlayers.length}-${spent}`}
                  className={`group flex-shrink-0 w-80 sm:w-96 relative overflow-hidden bg-gradient-to-br ${gradientClass} backdrop-blur-sm rounded-2xl border ${borderClass} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10`}
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Card Content - Compact */}
                  <div className="relative z-10 p-4 flex flex-col h-full">
                    {/* Compact Team Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center border ${borderClass} shadow-lg`}>
                            <span className="text-2xl">🏅</span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black text-white truncate">{team.name}</h2>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="bg-slate-800/60 px-2 py-0.5 rounded text-slate-300">
                              👥 {teamPlayers.length}/{team.totalSlots}
                            </span>
                            <span className="bg-slate-800/60 px-2 py-0.5 rounded text-slate-300">
                              {budgetUsedPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Budget Info */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2">
                        <p className="text-xs text-slate-400">Spent</p>
                        <p className="text-base font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          ₹{(spent / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-2">
                        <p className="text-xs text-slate-400">Left</p>
                        <p className={`text-base font-black ${
                          remaining >= (team.budget || 0) * 0.3 ? 'text-emerald-400' : 
                          remaining >= (team.budget || 0) * 0.1 ? 'text-amber-400' : 
                          'text-rose-400'
                        }`}>
                          ₹{(remaining / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>

                    {/* Compact Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
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
                    
                    {/* Players List - Scrollable Compact */}
                    {teamPlayers.length > 0 ? (
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {teamPlayers.map((player) => (
                          <div
                            key={player._id}
                            className={`group/player relative overflow-hidden bg-gradient-to-br ${getPositionColor(player.position)} backdrop-blur-sm rounded-lg p-3 border ${
                              player.position === 'Batsman' ? 'border-amber-500/40' : 
                              player.position === 'Bowler' ? 'border-blue-500/40' : 
                              player.position === 'All-Rounder' ? 'border-purple-500/40' : 
                              'border-emerald-500/40'
                            } hover:scale-102 transition-all duration-300`}
                          >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/player:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xl">{getPositionIcon(player.position)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-sm truncate">{player.name}</p>
                                  <p className="text-xs text-slate-300">{player.position} • {player.class}</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 bg-slate-900/60 backdrop-blur-sm rounded px-2 py-1">
                                <p className="text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                  ₹{(player.soldAmount! / 1000).toFixed(0)}K
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-slate-900/30 rounded-xl border border-slate-700/30">
                        <div className="text-center py-6">
                          <span className="text-3xl block mb-2">📭</span>
                          <p className="text-slate-400 text-sm font-semibold">No Players</p>
                        </div>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
        }

        /* Horizontal scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #f59e0b, #d97706);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #fbbf24, #f59e0b);
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;