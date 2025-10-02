import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuction } from '../../contexts/AuctionContext';
import PlayerCard from '../ui/PlayerCard';
import AnimatedBackground from '../ui/AnimatedBackground';
import Modal from '../ui/Modal';

const AuctionRoom: React.FC = () => {
  const { 
    currentPlayer, 
    currentBid, 
    currentBidder, 
    placeBid, 
    isConnected,
    bidTimeLeft
  } = useAuction();
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [showBidConfirm, setShowBidConfirm] = useState(false);

  const handleBidSubmit = () => {
    if (!currentPlayer) return;
    setShowBidConfirm(true);
  };

  const confirmBid = (teamId: string) => {
    if (!currentPlayer || bidAmount <= currentBid) return;
    
    placeBid(bidAmount, teamId);
    setShowBidConfirm(false);
    
    // Trigger confetti on successful bid
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <AnimatedBackground variant="gradient-xy" className="relative">
      <div className="container mx-auto px-4 py-8">
        {/* Connection Status */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-white text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Main Auction Area */}
        <div className="max-w-4xl mx-auto">
          {currentPlayer ? (
            <div className="space-y-8">
              {/* Player Card */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-full max-w-sm"
                >
                  <PlayerCard player={currentPlayer} />
                </motion.div>
              </div>

              {/* Bidding Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold">Current Bid</h3>
                    <p className="text-3xl font-bold text-purple-400">
                      {formatPrice(currentBid)}
                    </p>
                  </div>
                  <div className="text-white text-right">
                    <h3 className="text-xl font-semibold">Time Left</h3>
                    <p className={`text-3xl font-bold ${bidTimeLeft <= 5 ? 'text-red-400' : 'text-purple-400'}`}>
                      {bidTimeLeft}s
                    </p>
                  </div>
                </div>

                {/* Bid Input */}
                <div className="flex space-x-4">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={currentBid + 1000}
                    step={1000}
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2
                             text-white placeholder-white/50 focus:outline-none focus:ring-2
                             focus:ring-purple-500"
                    placeholder="Enter bid amount..."
                  />
                  <button
                    onClick={handleBidSubmit}
                    disabled={bidAmount <= currentBid}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600
                             text-white rounded-lg font-medium transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Place Bid
                  </button>
                </div>
              </div>

              {/* Bid History */}
              {currentBidder && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-white"
                >
                  <p className="text-lg">
                    Last bid by: <span className="font-semibold text-purple-400">{currentBidder}</span>
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center text-white space-y-4">
              <h2 className="text-3xl font-bold">Waiting for next player...</h2>
              <p className="text-lg text-white/70">
                The auction will begin shortly
              </p>
            </div>
          )}
        </div>

        {/* Bid Confirmation Modal */}
        <Modal
          isOpen={showBidConfirm}
          onClose={() => setShowBidConfirm(false)}
          title="Confirm Bid"
        >
          <div className="space-y-4">
            <p className="text-white">
              Are you sure you want to place a bid of {formatPrice(bidAmount)}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowBidConfirm(false)}
                className="px-4 py-2 text-white/70 hover:text-white
                         bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmBid('TEAM_ID')} // Replace with actual team ID
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700
                         text-white rounded-lg transition-colors"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AnimatedBackground>
  );
};

export default AuctionRoom;