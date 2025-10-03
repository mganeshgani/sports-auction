import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player } from '../types';
import CSVUpload from '../components/players/CSVUpload';

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold' | 'unsold'>('all');

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/players`);
      setPlayers(response.data);
      
      // Debug: Log first player's photo URL to check conversion
      if (response.data.length > 0 && response.data[0].photoUrl) {
        console.log('✓ Sample Photo URL:', response.data[0].photoUrl);
        console.log('✓ Player Name:', response.data[0].name);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = filter === 'all' 
    ? players 
    : players.filter(p => p.status === filter);

  const statusConfig = {
    available: { 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      text: 'text-green-400',
      icon: '✓'
    },
    sold: { 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30', 
      text: 'text-blue-400',
      icon: '💰'
    },
    unsold: { 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30', 
      text: 'text-red-400',
      icon: '✗'
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Section with Animation */}
      <div className="relative flex-shrink-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-700/50 px-6 py-3 overflow-hidden">
        {/* Mesmerizing Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-bg-header"></div>
          <div className="floating-orbs-header">
            <div className="orb-header orb-header-1"></div>
            <div className="orb-header orb-header-2"></div>
            <div className="orb-header orb-header-3"></div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Title & CSV Upload - Combined */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-2xl">⚽</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Players Management</h1>
                <p className="text-gray-400 text-xs">Manage and track players</p>
              </div>
            </div>
            
            {/* Compact CSV Upload */}
            <div className="flex-1 max-w-md">
              <CSVUpload onUploadSuccess={fetchPlayers} />
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-black text-white">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 px-6 py-3 bg-gray-900/50 border-b border-gray-700/30">
        <div className="flex gap-2">
          {(['all', 'available', 'sold', 'unsold'] as const).map((f) => {
            const count = f === 'all' ? players.length : players.filter(p => p.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`group relative px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 capitalize ${
                  filter === f
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105'
                }`}
              >
                <span>{f}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${
                  filter === f 
                    ? 'bg-white/20' 
                    : 'bg-gray-700 group-hover:bg-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
            </div>
            <p className="mt-4 text-gray-400 font-medium">Loading players...</p>
          </div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="text-5xl">⚽</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {filter === 'all' ? 'No Players Yet' : `No ${filter} Players`}
            </h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'Upload a CSV file to add players to the auction.' 
                : `No players with status "${filter}" found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const config = statusConfig[player.status as keyof typeof statusConfig];
              
              return (
                <div
                  key={player._id}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02]"
                >
                  {/* Status Badge - Top Right */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.border} ${config.text} border flex items-center gap-1`}>
                    <span>{config.icon}</span>
                    <span className="uppercase">{player.status}</span>
                  </div>

                  {/* Player Photo */}
                  <div className="flex justify-center mb-3">
                    {player.photoUrl && player.photoUrl.trim() !== '' ? (
                      <img 
                        src={player.photoUrl} 
                        alt={player.name}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-700 group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black text-white border-4 border-gray-700 group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110">${player.name.charAt(0)}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black text-white border-4 border-gray-700 group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                      {player.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{player.regNo}</p>
                  </div>

                  {/* Player Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/30">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span>🎓</span> Class
                      </span>
                      <span className="text-xs font-bold text-white truncate ml-2">{player.class}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/30">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span>🎯</span> Position
                      </span>
                      <span className="text-xs font-bold text-white truncate ml-2">{player.position}</span>
                    </div>

                    {player.soldAmount && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg px-3 py-2 border border-green-600/30">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span>💰</span> Sold
                        </span>
                        <span className="text-sm font-black text-green-400">₹{player.soldAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles + Header Animation */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* Header Aurora Animation */
        @keyframes auroraHeader {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(20px) scale(1.05);
            opacity: 0.5;
          }
        }

        .aurora-bg-header {
          position: absolute;
          width: 150%;
          height: 150%;
          top: -25%;
          left: -25%;
          background: radial-gradient(ellipse at 30% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%);
          animation: auroraHeader 6s ease-in-out infinite;
          filter: blur(30px);
        }

        /* Header Floating Orbs */
        @keyframes floatHeader {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(20px, -10px);
          }
        }

        .floating-orbs-header {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .orb-header {
          position: absolute;
          border-radius: 50%;
          filter: blur(15px);
          opacity: 0.4;
        }

        .orb-header-1 {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent);
          top: -20%;
          left: 20%;
          animation: floatHeader 5s ease-in-out infinite;
        }

        .orb-header-2 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent);
          top: -30%;
          right: 30%;
          animation: floatHeader 6s ease-in-out infinite 1s;
        }

        .orb-header-3 {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.5), transparent);
          bottom: -20%;
          left: 60%;
          animation: floatHeader 7s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  );
};

export default PlayersPage;
