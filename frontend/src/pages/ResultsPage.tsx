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

  const csvData = players.map(p => {
    // Find team name with proper handling of populated team objects
    let teamName = 'Unsold';
    
    if (p.team && p.status === 'sold') {
      // Backend populates team with .populate('team', 'name') which returns { _id, name }
      // Handle both populated object and string ID
      const teamId = typeof p.team === 'object' ? (p.team as any)._id : p.team;
      const teamNameFromPopulate = typeof p.team === 'object' ? (p.team as any).name : null;
      
      // If team is already populated with name, use it directly
      if (teamNameFromPopulate) {
        teamName = teamNameFromPopulate;
      } else {
        // Otherwise, find team in teams array
        const foundTeam = teams.find(t => String(t._id).trim() === String(teamId).trim());
        teamName = foundTeam?.name || 'Unknown Team';
      }
    } else if (p.status === 'unsold') {
      teamName = 'Unsold';
    } else if (p.status === 'available') {
      teamName = 'Not Yet Auctioned';
    }
    
    return {
      ...p,
      teamName,
      soldAmount: p.soldAmount || 0
    };
  });

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
      'Batsman': 'BAT',
      'Bowler': 'BWL',
      'All-Rounder': 'AR',
      'Wicket-Keeper': 'WK',
    };
    return icons[position] || 'POS';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f172a 75%, #1a1a1a 100%)'
    }}>
      {/* Elegant Premium Horizontal Header */}
      <div className="flex-shrink-0 backdrop-blur-xl border-b shadow-xl" style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(13, 17, 23, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
      }}>
        <div className="px-4 sm:px-6 py-3">
          {/* Single Horizontal Row - Premium Layout */}
          <div className="flex items-center gap-6">
            {/* Left: Title with LIVE badge */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(212, 175, 55, 0.3)'
              }}>
                Auction Results
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
              }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                <span className="text-xs font-bold text-emerald-400">LIVE</span>
              </div>
            </div>

            {/* Center: Ultra-Premium Stats - Glass Morphism */}
            {!loading && (
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="backdrop-blur-md rounded-xl px-4 py-2 border transition-all hover:scale-105 hover:border-white/30" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                  <p className="text-lg font-black text-white">{stats.total}</p>
                </div>
                <div className="backdrop-blur-md rounded-xl px-4 py-2 border transition-all hover:scale-105 hover:border-emerald-400/50" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold mb-0.5">Sold</p>
                  <p className="text-lg font-black text-emerald-400">{stats.sold}</p>
                </div>
                <div className="backdrop-blur-md rounded-xl px-4 py-2 border transition-all hover:scale-105 hover:border-rose-400/50" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(244, 63, 94, 0.1) 100%)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[10px] text-rose-400/80 uppercase tracking-widest font-bold mb-0.5">Unsold</p>
                  <p className="text-lg font-black text-rose-400">{stats.unsold}</p>
                </div>
                <div className="backdrop-blur-md rounded-xl px-4 py-2 border transition-all hover:scale-105 hover:border-amber-400/50" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(212, 175, 55, 0.1) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mb-0.5">Spent</p>
                  <p className="text-lg font-black" style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F0D770 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    ₹{(stats.totalSpent / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            )}

            {/* Right: Export Button */}
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`auction_results_${new Date().toISOString().split('T')[0]}.csv`}
              className="group relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F0D770 50%, #D4AF37 100%)',
                border: '2px solid rgba(212, 175, 55, 0.6)',
                boxShadow: '0 4px 25px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                color: '#000000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="relative z-10 hidden sm:inline">Export</span>
            </CSVLink>
          </div>
        </div>
      </div>


      {/* Horizontal Scrolling Teams - Premium Compact Layout */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
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
              
              // Use backend data when available, fallback to calculated values
              const actualFilledSlots = team.filledSlots || teamPlayers.length;
              const actualRemaining = team.remainingBudget !== undefined && team.remainingBudget !== null 
                ? team.remainingBudget 
                : (team.budget || 0) - spent;
              const actualSpent = (team.budget || 0) - actualRemaining;
              const budgetUsedPercentage = ((actualSpent / (team.budget || 1)) * 100).toFixed(0);
              
              console.log(`Team ${team.name}:`, {
                filledSlots: actualFilledSlots,
                playersInState: teamPlayers.length,
                spent: actualSpent,
                remaining: actualRemaining,
                budgetUsed: budgetUsedPercentage + '%',
                backendFilledSlots: team.filledSlots,
                backendRemainingBudget: team.remainingBudget
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
                  key={`${team._id}-${actualFilledSlots}-${actualSpent}-${actualRemaining}`}
                  className={`group flex-shrink-0 w-72 sm:w-80 relative overflow-hidden bg-gradient-to-br ${gradientClass} backdrop-blur-sm rounded-xl border ${borderClass} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10`}
                  style={{ maxHeight: 'calc(100vh - 180px)' }}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Card Content - Ultra Compact */}
                  <div className="relative z-10 p-3 flex flex-col h-full">
                    {/* Compact Team Header */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black tracking-tight" style={{
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>{team.name}</h2>
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] mt-1">
                          <span className="bg-slate-800/60 px-1.5 py-0.5 rounded text-slate-300 font-semibold">
                            {actualFilledSlots}/{team.totalSlots}
                          </span>
                          <span className="bg-slate-800/60 px-1.5 py-0.5 rounded text-slate-300 font-semibold">
                            {budgetUsedPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Budget Info */}
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-1.5">
                        <p className="text-[10px] text-slate-400">Spent</p>
                        <p className="text-sm font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          ₹{(actualSpent / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-1.5">
                        <p className="text-[10px] text-slate-400">Left</p>
                        <p className={`text-sm font-black ${
                          actualRemaining >= (team.budget || 0) * 0.3 ? 'text-emerald-400' : 
                          actualRemaining >= (team.budget || 0) * 0.1 ? 'text-amber-400' : 
                          'text-rose-400'
                        }`}>
                          ₹{(actualRemaining / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>

                    {/* Compact Progress Bar */}
                    <div className="mb-2">
                      <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
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
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                        {teamPlayers.map((player) => (
                          <div
                            key={player._id}
                            className={`group/player relative overflow-hidden bg-gradient-to-br ${getPositionColor(player.position)} backdrop-blur-sm rounded-lg p-2 border ${
                              player.position === 'Batsman' ? 'border-amber-500/40' : 
                              player.position === 'Bowler' ? 'border-blue-500/40' : 
                              player.position === 'All-Rounder' ? 'border-purple-500/40' : 
                              'border-emerald-500/40'
                            } hover:scale-102 transition-all duration-300`}
                          >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/player:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-lg">{getPositionIcon(player.position)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-xs truncate">{player.name}</p>
                                  <p className="text-[10px] text-slate-300">{player.position} • {player.class}</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 bg-slate-900/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                                <p className="text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                  ₹{(player.soldAmount! / 1000).toFixed(0)}K
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-slate-900/30 rounded-lg border border-slate-700/30">
                        <div className="text-center py-4">
                          <p className="text-slate-400 text-xs font-semibold">No Players</p>
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