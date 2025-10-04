import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Player, Team } from '../types';
import SpinWheel from '../components/auction/SpinWheel';
import PlayerCard from '../components/auction/PlayerCard';
import TeamCard from '../components/auction/TeamCard';
import TeamSelectionModal from '../components/auction/TeamSelectionModal';
import '../maisonCelebration.css';
import io from 'socket.io-client';

const AuctionPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [soldAmount, setSoldAmount] = useState<number>(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState<number>(0);
  const [celebrationTeamName, setCelebrationTeamName] = useState<string>('');
  const [hasAuctionStarted, setHasAuctionStarted] = useState(false);

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
    if (!hasAuctionStarted) {
      setHasAuctionStarted(true);
    }
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
        $push: { players: currentPlayer._id },
        soldAmount: soldAmount
      });

      // Play sold sound and show premium celebration overlay
      playSoldSound();
      
      // Find team name for celebration display
      const acquiredTeam = teams.find(t => t._id === teamId);
      
      // Store celebration data
      setCelebrationAmount(soldAmount);
      setCelebrationTeamName(acquiredTeam?.name || 'Team');
      setShowCelebration(true);

      // Hide celebration after 6 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 6000);

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

      setShowPlayer(false);
      setCurrentPlayer(null);
      fetchAvailableCount();
    } catch (error) {
      console.error('Error marking player unsold:', error);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 py-3" style={{
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #0f172a 75%, #1a1a1a 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold">Live Auction</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Team Dashboard - Compact Sidebar */}
        <div className="lg:col-span-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-2 min-h-0">
          <div className="sticky top-0 py-2 z-10 backdrop-blur-sm" style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 10, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
            borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.1)'
          }}>
            <h2 className="text-2xl font-black tracking-tight text-center" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F0D770 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.4))'
            }}>
              TEAMS
            </h2>
          </div>
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} compact={true} />
          ))}
        </div>

        {/* Auction Area - Larger Space */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {!showPlayer && !isSpinning && (
            <div className="backdrop-blur-sm rounded-lg flex items-center justify-center flex-1 min-h-0" style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <div className="text-center max-w-md">
                {/* Premium Golden Wings Badge */}
                <div className="relative inline-block mb-6">
                  {/* Multi-layer Glow Aura - Minimal */}
                  <div className="absolute inset-0 blur-lg opacity-4 animate-pulse" style={{
                    background: 'radial-gradient(ellipse, rgba(255, 215, 0, 0.15) 0%, rgba(212, 175, 55, 0.08) 30%, rgba(218, 165, 32, 0.04) 60%, transparent 80%)',
                    width: '280px',
                    height: '120px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}></div>
                  <div className="absolute inset-0 blur-sm opacity-2" style={{
                    background: 'radial-gradient(ellipse, rgba(255, 223, 0, 0.12) 0%, rgba(184, 134, 11, 0.06) 50%, transparent 70%)',
                    width: '260px',
                    height: '110px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}></div>
                  
                  <div className="relative mx-auto transform hover:scale-105 transition-transform duration-500" style={{ 
                    width: '240px', 
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src="/wings.png" 
                      alt="Premium Golden Wings" 
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
                        maxWidth: '240px',
                        maxHeight: '100px'
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-text';
                          fallback.textContent = '👑 PREMIUM AUCTION 👑';
                          fallback.style.fontSize = '24px';
                          fallback.style.fontWeight = 'bold';
                          fallback.style.background = 'linear-gradient(to right, #FFD700, #FFA500, #FFD700)';
                          fallback.style.webkitBackgroundClip = 'text';
                          fallback.style.webkitTextFillColor = 'transparent';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Elegant Heading */}
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent" style={{
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: '0.02em',
                  backgroundImage: 'linear-gradient(to right, #F5F5F5, #B08B4F, #F5F5F5)'
                }}>
                  {!hasAuctionStarted ? 'Auction Awaits' : 'Ready for Next Bid'}
                </h2>
                <p className="mb-8 text-sm" style={{
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.05em',
                  color: '#A0A0A5'
                }}>
                  {!hasAuctionStarted 
                    ? 'Commence the bidding experience' 
                    : 'Continue the auction journey'}
                </p>

                {/* Premium Button */}
                <button
                  onClick={handleNextPlayer}
                  disabled={availableCount === 0}
                  className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: '0',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  {/* Gold Glow Effect */}
                  <div className="absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" style={{
                    background: 'linear-gradient(to right, #B08B4F, #C99D5F, #B08B4F)'
                  }}></div>
                  
                  {/* Button Content */}
                  <div className="relative px-10 py-4 rounded-xl shadow-2xl transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6),0_0_40px_rgba(176,139,79,0.5)]" style={{
                    background: 'linear-gradient(to right, #B08B4F, #C99D5F, #A07A3F)',
                    border: '2px solid rgba(176, 139, 79, 0.5)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(176, 139, 79, 0.3)'
                  }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl animate-pulse">✨</span>
                      <span className="text-lg font-bold" style={{
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#0E0E12'
                      }}>
                        {!hasAuctionStarted 
                          ? 'Start Bidding' 
                          : 'Next Player'}
                      </span>
                      <span className="text-2xl animate-pulse">✨</span>
                    </div>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                </button>

                {/* Available Count Badge */}
                {availableCount > 0 ? (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm" style={{
                    background: 'linear-gradient(to right, rgba(125, 75, 87, 0.2), rgba(125, 75, 87, 0.15))',
                    border: '1px solid rgba(125, 75, 87, 0.4)'
                  }}>
                    <span className="text-sm font-semibold" style={{color: '#B08B4F'}}>{availableCount}</span>
                    <span className="text-xs" style={{
                      color: '#A0A0A5',
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: '0.05em'
                    }}>Players Available</span>
                  </div>
                ) : (
                  <p className="mt-6 text-sm font-medium" style={{
                    fontFamily: "'Montserrat', sans-serif",
                    letterSpacing: '0.05em',
                    color: '#7D4B57'
                  }}>No Available Players</p>
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
                setSoldAmount={setSoldAmount}
                handleSoldClick={handleSoldClick}
                handleUnsoldClick={handleMarkUnsold}
                loading={false}
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

      {/* � PROFESSIONAL LUXURY CELEBRATION OVERLAY � */}
      {showCelebration && (
        <div className="luxury-celebration-overlay">
          {/* Deep Luxury Backdrop */}
          <div className="maison-backdrop"></div>
          
          {/* Radial Light Accent */}
          <div className="maison-radial-light"></div>

          <div className="maison-content-container">
            
            {/* Crown Emblem - Ultra Premium */}
            <div className="maison-crown-emblem">
              <div className="crown-outer-glow"></div>
              <div className="crown-ring-1"></div>
              <div className="crown-ring-2"></div>
              <div className="crown-center">
                <svg className="crown-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" />
                </svg>
              </div>
            </div>

            {/* Acquisition Typography */}
            <div className="maison-heading-section">
              <div className="maison-prestige-label">ACQUISITION COMPLETE</div>
              <h1 className="maison-sold-text">SOLD</h1>
            </div>

            {/* Team Acquisition Card - Hero Element */}
            <div className="maison-team-card">
              <div className="team-card-border"></div>
              <div className="team-card-content">
                <div className="team-label">ACQUIRED BY</div>
                <div className="team-name">{celebrationTeamName}</div>
              </div>
              <div className="team-card-shimmer"></div>
            </div>

            {/* Ornamental Separator */}
            <div className="maison-separator">
              <div className="separator-line"></div>
              <div className="separator-jewel">◆</div>
              <div className="separator-line"></div>
            </div>

            {/* Premium Amount Display */}
            <div className="maison-amount-display">
              <div className="amount-prestige-bg"></div>
              <div className="amount-content-wrapper">
                <div className="amount-label-text">FINAL VALUATION</div>
                <div className="amount-value-row">
                  <span className="amount-currency">₹</span>
                  <span className="amount-number">{celebrationAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="amount-reflection"></div>
            </div>
          </div>

          {/* Prestige Footer Signature */}
          <div className="maison-prestige-footer">
            <div className="prestige-divider"></div>
            <div className="prestige-signature">MAISON DE PRESTIGE</div>
          </div>

          {/* Ambient Luxury Glow */}
          <div className="maison-ambient-glow"></div>
          
        </div>
      )}

      <style>{`
        /* Scrollbar Styles */
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

        /* � PROFESSIONAL LUXURY CELEBRATION STYLES � */
        
        /* Main Overlay with Sophisticated Background */
        .celebration-overlay-premium {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: elegantFadeIn 0.8s cubic-bezier(0.19, 1, 0.22, 1);
          overflow: hidden;
        }

        @keyframes elegantFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Radial Gradient Background */
        .celebration-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center,
            rgba(20, 25, 35, 1) 0%,
            rgba(10, 15, 25, 1) 30%,
            rgba(5, 8, 15, 1) 60%,
            rgba(0, 0, 0, 1) 100%
          );
          animation: gradientPulse 4s ease-in-out infinite;
        }

        @keyframes gradientPulse {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        /* Elegant Grid Pattern */
        .elegant-grid-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0;
          animation: gridFadeIn 2s ease-out 0.5s forwards;
        }

        @keyframes gridFadeIn {
          to {
            opacity: 1;
          }
        }

        /* Content Container */
        .celebration-content-premium {
          position: relative;
          z-index: 10001;
          text-align: center;
          animation: contentSlideUp 1.2s cubic-bezier(0.19, 1, 0.22, 1);
          max-width: 900px;
          padding: 40px;
        }

        @keyframes contentSlideUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Premium Badge with 3D Effect */
        .premium-badge-container {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto 60px;
          perspective: 1000px;
        }

        .badge-glow-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid rgba(212, 175, 55, 0.4);
          animation: ringExpand 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .badge-glow-ring.ring-1 {
          width: 100%;
          height: 100%;
          animation-delay: 0s;
        }

        .badge-glow-ring.ring-2 {
          width: 100%;
          height: 100%;
          animation-delay: 1s;
        }

        .badge-glow-ring.ring-3 {
          width: 100%;
          height: 100%;
          animation-delay: 2s;
        }

        @keyframes ringExpand {
          0% {
            width: 100%;
            height: 100%;
            opacity: 0.6;
            border-width: 3px;
          }
          50% {
            width: 140%;
            height: 140%;
            opacity: 0.3;
            border-width: 2px;
          }
          100% {
            width: 180%;
            height: 180%;
            opacity: 0;
            border-width: 1px;
          }
        }

        .premium-badge-3d {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 160px;
          height: 160px;
          animation: badge3DFloat 4s ease-in-out infinite;
        }

        @keyframes badge3DFloat {
          0%, 100% {
            transform: translate(-50%, -50%) rotateY(0deg) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) rotateY(15deg) translateY(-15px);
          }
        }

        .badge-inner {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, 
            #d4af37 0%,
            #f4e5a0 25%,
            #d4af37 50%,
            #b8960c 75%,
            #d4af37 100%
          );
          border-radius: 50%;
          box-shadow: 
            0 20px 60px rgba(212, 175, 55, 0.4),
            0 10px 30px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .badge-shine-layer {
          position: absolute;
          top: 10%;
          left: 10%;
          right: 10%;
          bottom: 10%;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.4) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 100%
          );
          border-radius: 50%;
          animation: shineRotate 4s linear infinite;
        }

        @keyframes shineRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .trophy-icon {
          width: 75px;
          height: 75px;
          color: #ffffff;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
          animation: trophyGlow 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes trophyGlow {
          0%, 100% {
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 6px 20px rgba(212, 175, 55, 0.8));
            transform: scale(1.08);
          }
        }

        /* Elegant Title */
        .sold-title-elegant {
          position: relative;
          margin-bottom: 60px;
        }

        .title-backdrop {
          font-size: 160px;
          font-weight: 900;
          font-family: 'Georgia', serif;
          color: transparent;
          -webkit-text-stroke: 1px rgba(212, 175, 55, 0.15);
          letter-spacing: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          animation: backdropScale 3s ease-in-out infinite;
        }

        @keyframes backdropScale {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 0.5;
          }
        }

        .title-main {
          font-size: 120px;
          font-weight: 700;
          font-family: 'Georgia', serif;
          letter-spacing: 18px;
          margin: 0;
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg,
            #ffffff 0%,
            #f4e5a0 25%,
            #d4af37 50%,
            #b8960c 75%,
            #d4af37 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: titleShimmer 3s ease-in-out infinite;
          filter: drop-shadow(0 4px 20px rgba(212, 175, 55, 0.5));
        }

        @keyframes titleShimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .title-underline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
          animation: underlineExpand 1.5s ease-out 0.5s backwards;
        }

        @keyframes underlineExpand {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        .underline-segment {
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.8) 50%,
            transparent 100%
          );
          animation: segmentGlow 2s ease-in-out infinite;
        }

        @keyframes segmentGlow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .underline-diamond {
          font-size: 18px;
          color: #d4af37;
          animation: diamondRotate 4s linear infinite;
        }

        @keyframes diamondRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Glass Card for Amount */
        .amount-glass-card {
          position: relative;
          display: inline-block;
          margin: 40px 0;
          animation: cardAppear 1.2s ease-out 0.8s backwards;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .glass-card-inner {
          position: relative;
          background: linear-gradient(145deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.03) 100%
          );
          backdrop-filter: blur(40px) saturate(150%);
          border: 2px solid rgba(212, 175, 55, 0.25);
          border-radius: 24px;
          padding: 45px 80px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(212, 175, 55, 0.1);
          overflow: hidden;
          animation: cardFloat 4s ease-in-out infinite;
        }

        @keyframes cardFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .card-shimmer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
          );
          animation: shimmerSwipe 4s linear infinite;
        }

        @keyframes shimmerSwipe {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        .amount-section {
          position: relative;
          z-index: 1;
        }

        .amount-label-elegant {
          font-size: 14px;
          font-weight: 600;
          color: rgba(212, 175, 55, 0.9);
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 15px;
          font-family: 'Arial', sans-serif;
        }

        .amount-display-elegant {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
        }

        .currency-elegant {
          font-size: 42px;
          font-weight: 700;
          color: #d4af37;
          font-family: 'Georgia', serif;
          animation: currencyPulse 2s ease-in-out infinite;
        }

        @keyframes currencyPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .amount-value-elegant {
          font-size: 68px;
          font-weight: 900;
          font-family: 'Georgia', serif;
          background: linear-gradient(180deg,
            #ffffff 0%,
            #f4e5a0 30%,
            #d4af37 60%,
            #b8960c 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 2px;
          animation: amountGlow 2s ease-in-out infinite;
        }

        @keyframes amountGlow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.8));
          }
        }

        /* Status Badge */
        .status-badge-elegant {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.15) 0%,
            rgba(5, 150, 105, 0.1) 100%
          );
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          border-radius: 50px;
          padding: 16px 40px;
          margin-top: 50px;
          animation: badgeSlideIn 1.2s ease-out 1.2s backwards;
        }

        @keyframes badgeSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status-icon-wrapper {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 6px 18px rgba(16, 185, 129, 0.7);
          }
        }

        .status-check-icon {
          width: 20px;
          height: 20px;
          color: white;
          stroke-width: 3;
        }

        .status-text {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Arial', sans-serif;
        }

        /* Elegant Particles */
        .particle-field-elegant {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .elegant-particle {
          position: absolute;
          background: radial-gradient(circle, 
            rgba(212, 175, 55, 0.8) 0%, 
            rgba(212, 175, 55, 0.4) 50%,
            transparent 100%
          );
          border-radius: 50%;
          animation: particleFloat linear infinite;
          opacity: 0;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(calc(-50px + (var(--tx, 0) * 100px)));
            opacity: 0;
          }
        }

        /* Light Beams */
        .light-beams-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .light-beam {
          position: absolute;
          top: -50%;
          width: 150px;
          height: 200%;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(212, 175, 55, 0.08) 50%,
            transparent 100%
          );
          opacity: 0;
          animation: beamSweep 8s ease-in-out infinite;
        }

        .light-beam.beam-1 {
          left: 20%;
          animation-delay: 0s;
        }

        .light-beam.beam-2 {
          left: 50%;
          animation-delay: 2.5s;
        }

        .light-beam.beam-3 {
          left: 75%;
          animation-delay: 5s;
        }

        @keyframes beamSweep {
          0%, 100% {
            opacity: 0;
            transform: translateX(-50px) rotate(-10deg);
          }
          50% {
            opacity: 1;
            transform: translateX(50px) rotate(10deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .celebration-content-premium {
            padding: 20px;
          }

          .premium-badge-container {
            width: 140px;
            height: 140px;
            margin-bottom: 40px;
          }
          
          .premium-badge-3d {
            width: 120px;
            height: 120px;
          }

          .badge-inner {
            width: 100%;
            height: 100%;
          }
          
          .trophy-icon {
            width: 55px;
            height: 55px;
          }

          .title-backdrop {
            font-size: 90px;
            letter-spacing: 12px;
          }
          
          .title-main {
            font-size: 70px;
            letter-spacing: 12px;
          }

          .underline-segment {
            width: 60px;
          }

          .glass-card-inner {
            padding: 30px 40px;
          }
          
          .amount-value-elegant {
            font-size: 48px;
          }
          
          .currency-elegant {
            font-size: 32px;
          }

          .status-badge-elegant {
            padding: 12px 30px;
            gap: 12px;
          }
          
          .status-text {
            font-size: 13px;
          }

          .status-icon-wrapper {
            width: 30px;
            height: 30px;
          }

          .status-check-icon {
            width: 16px;
            height: 16px;
          }
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