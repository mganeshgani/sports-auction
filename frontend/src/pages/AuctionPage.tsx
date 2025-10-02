import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player, Team } from '../types';
import SpinWheel from '../components/auction/SpinWheel';
import PlayerCard from '../components/auction/PlayerCard';
import TeamCard from '../components/auction/TeamCard';
import TeamSelectionModal from '../components/auction/TeamSelectionModal';
import confetti from 'canvas-confetti';
import io from 'socket.io-client';

const AuctionPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [soldAmount, setSoldAmount] = useState<number>(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';

  useEffect(() => {
    fetchTeams();
    fetchAvailableCount();

    // Setup Socket.io connection for real-time updates
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('✓ Socket.io connected');
    });

    socket.on('playerUpdated', (updatedPlayer: Player) => {
      console.log('Player updated:', updatedPlayer);
      // Refresh teams to show updated budget/slots
      fetchTeams();
    });

    socket.on('teamUpdated', (updatedTeam: Team) => {
      console.log('Team updated:', updatedTeam);
      // Update the specific team in the list
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team._id === updatedTeam._id ? updatedTeam : team
        )
      );
    });

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const playSoldSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGG0fPTgjMGHm7A7+OZSA0PVarn7KhYFgpIn+DxwG8jBzGF0PLWhzUHImzB7uGWRgsRVKnn7KlZGAhLnuHyv28kBzOE0/LXiTYIJW2+7eCVRwwSU6vo7KpbGQlMneLxv3AlCDSE0/PYijcJJm7A7d+VRwwTVKzp7KpcGgpNnuLyv3ElCDWF0/PYjDgKKG6/7d6URwwUVKzq7KpdGwpNneLyv3ElCDWF0/LYjDgKKW+/7d6VRw0VVK3q7KpeGwtNnePyv3EmCTWF0vLYjDgLKm++7d+URg0WVazq7KpeHA1OoOPywHEmCjaF0fPXizgLK2+/7+CVRg4XVqzr7KpfHA1OoOPywHEmCzeF0fPXjDkLKnC/7+GWRg4YVq3r7KpgHA5PoOPzwHEmCzeF0fPXjTkMK3C/7+GVRw8ZVq3s7KpgHQ5PoOPzwHEnDDiF0PPXjToNLHC+7+GWRxAaV63s7KpgHg5QoOPzwHEnDDiG0PPYjToNLHC/7+GWRxAaV63t7KpgHg9QoOPzwHEnDDiG0fPXjToNLXC/8OGWRxAbV67t7KpgHw9QoOPzwHInDTiG0fPXjTsOLnC/8OGWRxEcV67t7KpgHw9RoOPzwHInDTmG0fPXjTsOLnC/8OGWRxEcWK7t7KtgHw9RoOPzwHInDTmG0fPYjTsOL3C/8OGXRxEdWK7u7KthHxBRn+PzwHIoDTmG0fPXjTsOL3C/8OGXRxEdWK7u7KthHxBRn+PzwHIoDTmG0vPYjTwPMHDA8OGXSBEEWK7u7KthIBBSn+P0wHIoDjmG0vPYjTwPMHDA8OGXSBEEWK7u7KthIBBSn+P0wHIoDjqG0vPYjTwPMHC/8OGXSBEEWK7v7KthIBBSn+P0wHIoDjqG0vPYjTwPMXC/8OGXSBIFWa/v7KxiIBFSn+P0wHIpDjqG0vPYjjwQMXC/8OGYSBIFW6/v7KxiIBFSn+P0wXIpDjuG0vPYjzwQMnC/8OGYSBIFWq/v7KxiIRFSoOT0wXIpDjuG0vPYjzwRM3C/8eGYSRMGWq/w7KxjIRFToOP0wXIqDzuG0/PZjzwRM3C/8eGYSRMGWq/w7KxjIRJToOP0wXIqDzuG0/PZjzwRNHC/8eGYSRMHWq/w7K1jIRJToOP0wnIqDzuH0/PZjzwRNHC/8eKYSRMHWq/w7K1jIRJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqDzuH0/PZkD0RNHDAseKYShMHWrDw7K1jIhJToOP0wnIqA==');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchAvailableCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/players`);
      const available = response.data.filter((p: Player) => p.status === 'available').length;
      setAvailableCount(available);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleNextPlayer = async () => {
    setIsSpinning(true);
    setShowPlayer(false);
    setCurrentPlayer(null);
    setSoldAmount(0);
    setShowTeamModal(false);
  };

  const handleSpinComplete = async () => {
    try {
      const response = await axios.get(`${API_URL}/players`);
      const availablePlayers = response.data.filter((p: Player) => p.status === 'available');
      
      if (availablePlayers.length === 0) {
        alert('No more available players!');
        setIsSpinning(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const selectedPlayer = availablePlayers[randomIndex];
      
      setCurrentPlayer(selectedPlayer);
      setIsSpinning(false);
      setShowPlayer(true);
      fetchAvailableCount();
    } catch (error) {
      console.error('Error fetching random player:', error);
      setIsSpinning(false);
    }
  };

  const handleSoldClick = () => {
    if (!soldAmount) {
      alert('Please enter sold amount first');
      return;
    }
    setShowTeamModal(true);
  };

  const handleTeamSelected = async (teamId: string) => {
    if (!currentPlayer || !teamId || !soldAmount) {
      return;
    }

    setShowTeamModal(false);

    try {
      await axios.patch(`${API_URL}/players/${currentPlayer._id}`, {
        status: 'sold',
        team: teamId,
        soldAmount: soldAmount
      });

      await axios.patch(`${API_URL}/teams/${teamId}`, {
        $push: { players: currentPlayer._id }
      });

      // Play sold sound and confetti
      playSoldSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setShowPlayer(false);
      setCurrentPlayer(null);
      setSoldAmount(0);
      fetchTeams();
      fetchAvailableCount();
    } catch (error) {
      console.error('Error assigning player:', error);
      alert('Failed to assign player');
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;

    try {
      await axios.patch(`${API_URL}/players/${currentPlayer._id}`, {
        status: 'unsold'
      });

      alert('Player marked as unsold');
      setShowPlayer(false);
      setCurrentPlayer(null);
      fetchAvailableCount();
    } catch (error) {
      console.error('Error marking player unsold:', error);
      alert('Failed to mark player as unsold');
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-3">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold">Live Auction</h1>
        <div className="text-sm bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-gray-400">Available: </span>
          <span className="font-bold text-green-400">{availableCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Team Dashboard - Compact Sidebar */}
        <div className="lg:col-span-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 min-h-0">
          <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2 sticky top-0 bg-gray-900 py-2 z-10">
            <span className="text-2xl">🏆</span>
            Teams
          </h2>
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} compact={true} />
          ))}
        </div>

        {/* Auction Area - Larger Space */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {!showPlayer && !isSpinning && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 flex items-center justify-center flex-1 min-h-0">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-4xl">🎯</span>
                </div>
                <button
                  onClick={handleNextPlayer}
                  disabled={availableCount === 0}
                  className={`px-6 py-3 text-lg font-bold rounded-lg transition-all ${
                    availableCount === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  Next Player
                </button>
                {availableCount === 0 && (
                  <p className="mt-4 text-gray-400 text-sm">No available players</p>
                )}
              </div>
            </div>
          )}

          {isSpinning && (
            <div className="flex items-center justify-center flex-1">
              <SpinWheel isSpinning={isSpinning} onSpinComplete={handleSpinComplete} />
            </div>
          )}

          {showPlayer && currentPlayer && (
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <PlayerCard
                player={currentPlayer}
                soldAmount={soldAmount}
                onAmountChange={setSoldAmount}
                onSoldClick={handleSoldClick}
                onUnsold={handleMarkUnsold}
                isLoading={false}
              />
              
              <TeamSelectionModal
                isOpen={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                teams={teams}
                soldAmount={soldAmount}
                onSelectTeam={handleTeamSelected}
              />
            </div>
          )}
        </div>
      </div>

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
      `}</style>

      {/* Compact Footer */}
      <div className="flex-shrink-0 mt-2 py-2 text-center border-t border-gray-800">
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} Sports Auction. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuctionPage;