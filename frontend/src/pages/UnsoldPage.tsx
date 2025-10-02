import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player, Team } from '../types';
import confetti from 'canvas-confetti';

const UnsoldPage: React.FC = () => {
  const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [soldAmount, setSoldAmount] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const fetchUnsoldPlayers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/players`);
      const unsold = response.data.filter((p: Player) => p.status === 'unsold');
      setUnsoldPlayers(unsold);
    } catch (error) {
      console.error('Error fetching unsold players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    fetchUnsoldPlayers();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuctionClick = (player: Player) => {
    setSelectedPlayer(player);
    setSoldAmount(0);
    setSelectedTeam('');
    setShowModal(true);
  };

  const handleAuctionConfirm = async () => {
    if (!selectedPlayer || !selectedTeam || !soldAmount) {
      alert('Please enter amount and select a team');
      return;
    }

    try {
      // Update player with sold status, team, and amount
      await axios.patch(`${API_URL}/players/${selectedPlayer._id}`, {
        status: 'sold',
        team: selectedTeam,
        soldAmount: soldAmount
      });

      // Add player to team
      await axios.patch(`${API_URL}/teams/${selectedTeam}`, {
        $push: { players: selectedPlayer._id }
      });

      // Play confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      alert(`${selectedPlayer.name} sold successfully!`);
      
      // Reset and refresh
      setShowModal(false);
      setSelectedPlayer(null);
      setSoldAmount(0);
      setSelectedTeam('');
      fetchUnsoldPlayers();
      fetchTeams();
    } catch (error) {
      console.error('Error auctioning player:', error);
      alert('Failed to auction player. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Section */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 border-b border-gray-700/50 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
              <span className="text-2xl">🚫</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Unsold Players</h1>
              <p className="text-gray-400 text-xs">Players not sold in auction</p>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
            <p className="text-xs text-gray-400">Total Unsold</p>
            <p className="text-xl font-black text-red-400">{unsoldPlayers.length}</p>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
            </div>
            <p className="mt-4 text-gray-400 font-medium">Loading unsold players...</p>
          </div>
        </div>
      ) : unsoldPlayers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">All Players Sold!</h3>
            <p className="text-gray-400">Great job! No unsold players remaining.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unsoldPlayers.map((player) => (
              <div
                key={player._id}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-[1.02]"
              >
                {/* Unsold Badge - Top Right */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 border-red-500/30 text-red-400 border flex items-center gap-1">
                  <span>🚫</span>
                  <span className="uppercase">Unsold</span>
                </div>

                {/* Player Photo */}
                <div className="flex justify-center mb-3">
                  {player.photoUrl ? (
                    <img 
                      src={player.photoUrl} 
                      alt={player.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-700 group-hover:border-red-500 transition-all duration-300 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Image load error for', player.name, ':', player.photoUrl);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=' + player.name.charAt(0);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl font-black text-white border-4 border-gray-700 group-hover:border-red-500 transition-all duration-300 group-hover:scale-110">
                      {player.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="text-center mb-3">
                  <h3 className="text-lg font-black text-white truncate group-hover:text-red-400 transition-colors">
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

                  {/* Auction Button */}
                  <button
                    onClick={() => handleAuctionClick(player)}
                    className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>🔨</span>
                    <span>Auction Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auction Modal */}
      {showModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-gray-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <span>🔨</span>
                Auction Player
              </h2>
              <p className="text-sm text-gray-400 mt-1">Enter details to auction {selectedPlayer.name}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Player Info */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-4">
                  {selectedPlayer.photoUrl ? (
                    <img 
                      src={selectedPlayer.photoUrl} 
                      alt={selectedPlayer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl font-black text-white">
                      {selectedPlayer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedPlayer.name}</h3>
                    <p className="text-xs text-gray-400">{selectedPlayer.regNo} • {selectedPlayer.class}</p>
                    <p className="text-xs text-emerald-400 font-bold">{selectedPlayer.position}</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Sold Amount (₹)
                </label>
                <input
                  type="number"
                  value={soldAmount || ''}
                  onChange={(e) => setSoldAmount(Number(e.target.value))}
                  placeholder="Enter amount..."
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white font-bold text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Select Team
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {teams.map((team) => (
                    <button
                      key={team._id}
                      onClick={() => setSelectedTeam(team._id)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        selectedTeam === team._id
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{team.name}</p>
                          <p className="text-xs opacity-80">
                            Budget: ₹{team.budget?.toLocaleString() || 0} • Players: {team.players.length}/{team.players.length + 5}
                          </p>
                        </div>
                        {selectedTeam === team._id && (
                          <span className="text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-900/50 rounded-b-2xl border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPlayer(null);
                  setSoldAmount(0);
                  setSelectedTeam('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAuctionConfirm}
                disabled={!soldAmount || !selectedTeam}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>✓</span>
                Confirm Auction
              </button>
            </div>
          </div>
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
          background: linear-gradient(to bottom, #ef4444, #f97316);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #dc2626, #ea580c);
        }
      `}</style>
    </div>
  );
};

export default UnsoldPage;
