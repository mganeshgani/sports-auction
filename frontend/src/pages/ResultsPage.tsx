import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Team, Player } from '../types';
import { CSVLink } from 'react-csv';
import io from 'socket.io-client';

const ResultsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [playerToChangeTeam, setPlayerToChangeTeam] = useState<Player | null>(null);
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    sold: 0,
    unsold: 0,
    totalSpent: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

  const handleDeletePlayer = async (player: Player) => {
    try {
      await axios.delete(`${API_URL}/players/${player._id}/remove-from-team`);
      setPlayerToDelete(null);
      setSelectedTeam(null);
      fetchData();
    } catch (error) {
      console.error('Error removing player from team:', error);
      alert('Failed to remove player from team');
    }
  };

  const handleChangeTeam = async () => {
    if (!playerToChangeTeam || !newTeamId) {
      alert('Please select a team');
      return;
    }

    try {
      // Update player with new team
      await axios.put(`${API_URL}/players/${playerToChangeTeam._id}`, {
        team: newTeamId,
        status: 'sold',
        soldAmount: playerToChangeTeam.soldAmount
      });
      
      setPlayerToChangeTeam(null);
      setNewTeamId('');
      setSelectedTeam(null);
      fetchData();
    } catch (error: any) {
      console.error('Error changing player team:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change player team';
      alert(errorMessage);
    }
  };

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

    // OPTIMIZED: Debounce rapid socket events to prevent fetch spam
    let fetchTimeout: NodeJS.Timeout | null = null;
    const debouncedFetch = () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
      fetchTimeout = setTimeout(() => {
        console.log('🔄 Debounced fetch triggered');
        fetchData();
      }, 300); // Wait 300ms before fetching
    };

    socket.on('playerSold', debouncedFetch);
    socket.on('playerMarkedUnsold', debouncedFetch);
    socket.on('dataReset', () => {
      console.log('Data reset - immediate refresh');
      fetchData();
    });
    socket.on('playerUpdated', debouncedFetch);
    socket.on('teamUpdated', debouncedFetch);
    socket.on('playerRemovedFromTeam', debouncedFetch);

    socket.on('disconnect', () => {
      console.log('✗ Results page disconnected from Socket.io');
    });
    
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
      socket.disconnect();
    };
  }, [fetchData, SOCKET_URL]);

  const csvHeaders = [
    { label: 'Player Name', key: 'name' },
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
      'Spiker': 'from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/40',
      'Setter': 'from-purple-500/20 via-pink-500/20 to-rose-500/20 border-purple-500/40',
      'Libero': 'from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/40',
      'Blocker': 'from-red-500/20 via-rose-500/20 to-pink-500/20 border-red-500/40',
      'All-Rounder': 'from-emerald-500/20 via-green-500/20 to-lime-500/20 border-emerald-500/40',
    };
    return colors[position] || 'from-gray-500/20 via-slate-500/20 to-zinc-500/20 border-gray-500/40';
  };

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'Spiker': '🏐',
      'Setter': '⭐',
      'Libero': '🛡️',
      'Blocker': '🔥',
      'All-Rounder': '💪',
    };
    return icons[position] || '🏐';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f172a 75%, #1a1a1a 100%)'
    }}>
      {/* Elegant Premium Horizontal Header - Responsive */}
      <div className="flex-shrink-0 backdrop-blur-xl border-b shadow-xl" style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(13, 17, 23, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
      }}>
        <div className="px-3 sm:px-4 md:px-6 py-3">
          {/* Responsive Layout: Stacked on Mobile, Horizontal on Desktop */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
            {/* Left: Title with LIVE badge */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight whitespace-nowrap" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(212, 175, 55, 0.3)'
              }}>
                Auction Results
              </h1>
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full" style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
              }}>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400">LIVE</span>
              </div>
            </div>

            {/* Center: Ultra-Premium Stats - Responsive Grid */}
            {!loading && (
              <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-x-auto pb-1 lg:pb-0 lg:justify-center">
                <div className="backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                  <p className="text-lg sm:text-xl font-black text-white">{stats.total}</p>
                </div>
                <div className="backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[9px] sm:text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold mb-0.5">Sold</p>
                  <p className="text-lg sm:text-xl font-black text-emerald-400">{stats.sold}</p>
                </div>
                <div className="backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(244, 63, 94, 0.1) 100%)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[9px] sm:text-[10px] text-rose-400/80 uppercase tracking-widest font-bold mb-0.5">Unsold</p>
                  <p className="text-lg sm:text-xl font-black text-rose-400">{stats.unsold}</p>
                </div>
                <div className="backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(212, 175, 55, 0.1) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="text-[9px] sm:text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mb-0.5">Spent</p>
                  <p className="text-lg sm:text-xl font-black" style={{
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

            {/* Right: Export Button - Responsive */}
            <div className="flex items-center gap-2 flex-shrink-0 self-start lg:self-auto">
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={`auction_results_${new Date().toISOString().split('T')[0]}.csv`}
                className="group relative overflow-hidden px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F0D770 50%, #D4AF37 100%)',
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  boxShadow: '0 4px 25px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  color: '#000000'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="relative z-10 hidden sm:inline">Export</span>
              </CSVLink>
            </div>
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-6 py-4">
          {/* Vertical Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {teams.map((team, index) => {
              const teamPlayers = players.filter(p => (p.team === team._id || p.team === team.name) && p.status === 'sold');
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
                  onClick={() => setSelectedTeam(team)}
                  className={`group w-full relative overflow-hidden bg-gradient-to-br ${gradientClass} backdrop-blur-sm rounded-xl border ${borderClass} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10 cursor-pointer`}
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
                              player.position === 'Spiker' ? 'border-amber-500/40' : 
                              player.position === 'Setter' ? 'border-purple-500/40' : 
                              player.position === 'Libero' ? 'border-blue-500/40' :
                              player.position === 'Blocker' ? 'border-red-500/40' : 
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

      {/* Team Details Modal */}
      {selectedTeam && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedTeam(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 10, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(212, 175, 55, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b" style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tight" style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.4))'
                  }}>
                    {selectedTeam.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 font-medium">Team Squad Overview</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="group p-2 rounded-lg transition-all hover:bg-red-500/20 hover:scale-110"
                  style={{
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <svg className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Team Stats Summary */}
              <div className="flex gap-3 mt-4">
                {(() => {
                  // Use team.players array if available, otherwise filter from global players
                  const teamPlayers = selectedTeam.players && selectedTeam.players.length > 0
                    ? selectedTeam.players
                    : players.filter(p => (p.team === selectedTeam._id || p.team === selectedTeam.name) && p.status === 'sold');
                  const spent = teamPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0);
                  const actualRemaining = selectedTeam.remainingBudget !== undefined && selectedTeam.remainingBudget !== null 
                    ? selectedTeam.remainingBudget 
                    : (selectedTeam.budget || 0) - spent;
                  const actualSpent = (selectedTeam.budget || 0) - actualRemaining;
                  
                  return (
                    <>
                      <div className="flex-1 backdrop-blur-sm rounded-lg px-3 py-2" style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Players</p>
                        <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{teamPlayers.length}</p>
                      </div>
                      <div className="flex-1 backdrop-blur-sm rounded-lg px-3 py-2" style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Budget Spent</p>
                        <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>₹{(actualSpent / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="flex-1 backdrop-blur-sm rounded-lg px-3 py-2" style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Remaining</p>
                        <p className="text-2xl font-black text-emerald-400">₹{(actualRemaining / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="flex-1 backdrop-blur-sm rounded-lg px-3 py-2" style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Slots</p>
                        <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{selectedTeam.filledSlots || teamPlayers.length}/{selectedTeam.totalSlots}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Players Grid */}
            <div className="overflow-y-auto p-6 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {(() => {
                // Use team.players array if available, otherwise filter from global players
                const teamPlayers = selectedTeam.players && selectedTeam.players.length > 0
                  ? selectedTeam.players
                  : players.filter(p => 
                      (p.team === selectedTeam._id || p.team === selectedTeam.name) && 
                      p.status === 'sold'
                    );
                
                console.log('Modal - Selected Team:', selectedTeam.name, selectedTeam._id);
                console.log('Modal - Team.players array:', selectedTeam.players);
                console.log('Modal - All Players:', players.length);
                console.log('Modal - All Players with teams:', players.filter(p => p.team).map(p => ({ name: p.name, team: p.team, status: p.status })));
                console.log('Modal - Team Players Found:', teamPlayers.length);
                console.log('Modal - Team Players:', teamPlayers.map(p => ({ name: p.name, team: p.team, status: p.status })));
                
                if (teamPlayers.length === 0) {
                  return (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="text-6xl mb-4">�</div>
                        <p className="text-xl font-bold text-gray-400">No Players Yet</p>
                        <p className="text-sm text-gray-500 mt-2">This team hasn't purchased any players</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {teamPlayers.map((player, index) => (
                      <div
                        key={player._id}
                        className="group relative rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
                          border: '2px solid rgba(212, 175, 55, 0.3)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.1)'
                        }}
                      >
                        {/* Glow Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
                        
                        {/* Player Number Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #F0D770 100%)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                          }}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Position Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{
                            background: player.position === 'Spiker' ? 'rgba(251, 191, 36, 0.9)' :
                                       player.position === 'Setter' ? 'rgba(168, 85, 247, 0.9)' :
                                       player.position === 'Libero' ? 'rgba(59, 130, 246, 0.9)' :
                                       player.position === 'Blocker' ? 'rgba(239, 68, 68, 0.9)' :
                                       'rgba(16, 185, 129, 0.9)',
                            color: '#fff'
                          }}>
                            {player.position}
                          </div>
                        </div>

                        {/* Player Content */}
                        <div className="relative p-4 flex-1">
                          {/* Player Icon */}
                          <div className="text-4xl mb-3 text-center">
                            {player.position === 'Spiker' ? '🏐' :
                             player.position === 'Setter' ? '⭐' :
                             player.position === 'Libero' ? '🛡️' :
                             player.position === 'Blocker' ? '🔥' : '🏐'}
                          </div>

                          {/* Player Name */}
                          <h3 className="text-lg font-black text-center mb-2 tracking-tight" style={{
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            {player.name}
                          </h3>

                          {/* Player Details */}
                          <div className="space-y-2">
                            {player.class && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Class:</span>
                                <span className="font-bold text-white">{player.class}</span>
                              </div>
                            )}
                          </div>

                          {/* Sold Amount */}
                          <div className="mt-3 pt-3 border-t border-amber-500/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400 uppercase tracking-wider">Sold For</span>
                              <span className="text-xl font-black" style={{
                                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}>
                                ₹{(player.soldAmount! / 1000).toFixed(1)}K
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Separate Section at Bottom */}
                        <div className="relative p-3 border-t" style={{
                          borderColor: 'rgba(212, 175, 55, 0.2)',
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))'
                        }}>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayerToChangeTeam(player);
                              }}
                              className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                              title="Change player team"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span className="text-sm font-bold text-white">Change</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayerToDelete(player);
                              }}
                              className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                              title="Remove player from team"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-sm font-bold text-white">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Change Team Modal */}
      {playerToChangeTeam && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setPlayerToChangeTeam(null);
            setNewTeamId('');
          }}
        >
          <div 
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 20, 30, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(59, 130, 246, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderBottom: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #93c5fd 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Change Player Team
              </h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-blue-500/30 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white">
                    {playerToChangeTeam.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{playerToChangeTeam.name}</h3>
                    {playerToChangeTeam.class && (
                      <p className="text-xs text-gray-400">
                        {playerToChangeTeam.class}
                      </p>
                    )}
                    <p className="text-xs text-blue-400 font-bold">{playerToChangeTeam.position} • ₹{(playerToChangeTeam.soldAmount! / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Select New Team
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {teams
                    .filter(team => {
                      // Filter out current team
                      const currentTeamId = typeof playerToChangeTeam.team === 'object' 
                        ? (playerToChangeTeam.team as any)._id 
                        : playerToChangeTeam.team;
                      return team._id !== currentTeamId;
                    })
                    .map((team) => {
                      const isSelected = newTeamId === team._id;
                      const canAfford = (team.remainingBudget || 0) >= (playerToChangeTeam.soldAmount || 0);
                      const hasSlots = (team.filledSlots || 0) < (team.totalSlots || 0);
                      const isAvailable = canAfford && hasSlots;
                      
                      return (
                        <button
                          key={team._id}
                          onClick={() => isAvailable && setNewTeamId(team._id)}
                          disabled={!isAvailable}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-500/20 scale-105' 
                              : isAvailable
                                ? 'border-gray-600 hover:border-blue-400 hover:bg-blue-500/10'
                                : 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                          }`}
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.1) 100%)'
                              : isAvailable
                                ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(10, 10, 10, 0.4) 100%)'
                                : 'rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-black text-lg ${
                              isSelected ? 'text-blue-400' : isAvailable ? 'text-white' : 'text-gray-600'
                            }`}>
                              {team.name}
                            </h3>
                            {isSelected && (
                              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Budget Left:</span>
                              <span className={`font-bold ${
                                canAfford ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                ₹{((team.remainingBudget || 0) / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Slots:</span>
                              <span className={`font-bold ${
                                hasSlots ? 'text-blue-400' : 'text-red-400'
                              }`}>
                                {team.filledSlots || 0}/{team.totalSlots}
                              </span>
                            </div>
                            {!isAvailable && (
                              <p className="text-xs text-red-400 mt-2 font-semibold">
                                {!canAfford && 'Insufficient budget'}
                                {!canAfford && !hasSlots && ' • '}
                                {!hasSlots && 'No slots available'}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-gray-300">
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Player will be moved to the selected team. The sold amount (₹{(playerToChangeTeam.soldAmount! / 1000).toFixed(1)}K) will be deducted from new team's budget and refunded to current team.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-blue-500/30 flex gap-3">
              <button
                onClick={() => {
                  setPlayerToChangeTeam(null);
                  setNewTeamId('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeTeam}
                disabled={!newTeamId}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  newTeamId
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                    : 'bg-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Change Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayerToDelete(null)}
        >
          <div 
            className="relative w-full max-w-md overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 10, 10, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 100px rgba(239, 68, 68, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #fca5a5 50%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Remove Player?
              </h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-red-500/30 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-black text-white">
                    {playerToDelete.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{playerToDelete.name}</h3>
                    {playerToDelete.class && (
                      <p className="text-xs text-gray-400">
                        {playerToDelete.class}
                      </p>
                    )}
                    <p className="text-xs text-red-400 font-bold">{playerToDelete.position} • ₹{(playerToDelete.soldAmount! / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-2">
                Are you sure you want to remove <span className="font-bold text-white">{playerToDelete.name}</span> from the team?
              </p>
              <p className="text-gray-400 text-xs">
                • Player will be marked as <span className="text-amber-400">available</span> again<br/>
                • Amount <span className="text-emerald-400">₹{(playerToDelete.soldAmount! / 1000).toFixed(1)}K</span> will be refunded to team's budget
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-red-500/30 flex gap-3">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlayer(playerToDelete)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Player
              </button>
            </div>
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