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
    setLoading(true);
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Section */}
      <div className="flex-shrink-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 border-b border-gray-700/50 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Final Auction Results</h1>
                <p className="text-gray-400 text-xs">Complete auction summary</p>
              </div>
            </div>

            {/* Inline Stats */}
            {!loading && (
              <div className="flex items-center gap-3 ml-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-black text-white">{stats.total}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <div>
                    <p className="text-xs text-gray-400">Sold</p>
                    <p className="text-lg font-black text-green-400">{stats.sold}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">✗</span>
                  <div>
                    <p className="text-xs text-gray-400">Unsold</p>
                    <p className="text-lg font-black text-red-400">{stats.unsold}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-xs text-gray-400">Spent</p>
                    <p className="text-lg font-black text-yellow-400">₹{(stats.totalSpent / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename="auction_results.csv"
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-white text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </CSVLink>
        </div>
      </div>

      {/* Team Results */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="mt-4 text-gray-400 font-medium">Loading results...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {teams.map((team) => {
            const teamPlayers = players.filter(p => p.team === team._id);
            const spent = teamPlayers.reduce((sum, p) => sum + (p.soldAmount || 0), 0);
            const remaining = (team.budget || 0) - spent;
            
            return (
              <div
                key={team._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              >
                {/* Team Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                      <span className="text-2xl">🏅</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{team.name}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <span>👥</span> {teamPlayers.length}/{team.totalSlots}
                        </span>
                        <span className="text-yellow-400 flex items-center gap-1 font-bold">
                          <span>💰</span> Spent: ₹{spent.toLocaleString()}
                        </span>
                        <span className={`flex items-center gap-1 font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <span>💳</span> Left: ₹{remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Team Players */}
                {teamPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamPlayers.map((player) => (
                      <div
                        key={player._id}
                        className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 hover:border-green-500/30 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{player.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <span>🎯</span> {player.position}
                            </p>
                            <p className="text-xs text-gray-500">{player.class}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black text-green-400">₹{player.soldAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-700/30">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p className="text-gray-500 font-medium">No players bought</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;