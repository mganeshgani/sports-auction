import React from 'react';

interface PlayerCardProps {
  player: {
    _id: string;
    name: string;
    regNo: string;
    class: string;
    position: string;
    photoUrl?: string;
  };
  soldAmount: number;
  setSoldAmount: (amount: number) => void;
  handleSoldClick: () => void;
  handleUnsoldClick: () => void;
  loading: boolean;
}

const getPositionColor = (position: string) => {
  const pos = position.toLowerCase();
  if (pos === 'batsman') return { gradient: 'from-amber-400 to-orange-600', light: '#fbbf24', dark: '#ea580c' };
  if (pos === 'bowler') return { gradient: 'from-blue-400 to-indigo-600', light: '#60a5fa', dark: '#4f46e5' };
  if (pos === 'all-rounder') return { gradient: 'from-green-400 to-emerald-600', light: '#4ade80', dark: '#059669' };
  if (pos === 'wicket-keeper') return { gradient: 'from-purple-400 to-pink-600', light: '#c084fc', dark: '#db2777' };
  return { gradient: 'from-gray-400 to-gray-600', light: '#9ca3af', dark: '#4b5563' };
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  soldAmount,
  setSoldAmount,
  handleSoldClick,
  handleUnsoldClick,
  loading,
}) => {
  const positionColors = getPositionColor(player.position);

  return (
    <div className="premium-player-card-wrapper">
      {/* Premium entrance animations */}
      <style>{`
        @keyframes elegantEntrance {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes luxuryGlow {
          0%, 100% {
            box-shadow: 0 10px 50px rgba(234, 179, 8, 0.3);
          }
          50% {
            box-shadow: 0 20px 80px rgba(234, 179, 8, 0.5);
          }
        }

        @keyframes goldShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        @keyframes photoReveal {
          0% {
            opacity: 0;
            filter: blur(20px);
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
          }
        }

        @keyframes badgeEntrance {
          0% {
            opacity: 0;
            transform: translateY(-10px) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0);
          }
        }

        @keyframes contentFadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes floatingParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }

        .premium-player-card-wrapper {
          animation: elegantEntrance 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation-fill-mode: both;
        }

        .luxury-card-container {
          animation: luxuryGlow 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .luxury-card-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 215, 0, 0.3),
            transparent
          );
          animation: goldShimmer 3s ease-in-out infinite;
        }

        .photo-reveal {
          animation: photoReveal 0.8s ease-out 0.3s;
          animation-fill-mode: both;
        }

        .badge-entrance {
          animation: badgeEntrance 0.6s ease-out 0.7s;
          animation-fill-mode: both;
        }

        .content-fade-1 {
          animation: contentFadeIn 0.6s ease-out 0.9s;
          animation-fill-mode: both;
        }

        .content-fade-2 {
          animation: contentFadeIn 0.6s ease-out 1s;
          animation-fill-mode: both;
        }

        .content-fade-3 {
          animation: contentFadeIn 0.6s ease-out 1.1s;
          animation-fill-mode: both;
        }

        .button-slide-1 {
          animation: buttonSlide 0.5s ease-out 1.2s;
          animation-fill-mode: both;
        }

        .button-slide-2 {
          animation: buttonSlide 0.5s ease-out 1.3s;
          animation-fill-mode: both;
        }

        .floating-particle {
          animation: floatingParticle 4s ease-in-out infinite;
        }

        /* Rotating ring effect */
        @keyframes rotateRing {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .rotating-ring {
          animation: rotateRing 8s linear infinite;
        }

        /* Ultra Premium Button Styles */
        .premium-sold-button,
        .premium-unsold-button {
          position: relative;
          cursor: pointer;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transform-style: preserve-3d;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .premium-sold-button:hover:not(:disabled),
        .premium-unsold-button:hover:not(:disabled) {
          transform: translateY(-6px) scale(1.05);
          filter: brightness(1.15) contrast(1.1);
        }

        .premium-sold-button:active:not(:disabled),
        .premium-unsold-button:active:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          transition: all 0.15s ease-out;
        }

        /* Elegant pulse animation for hover state */
        @keyframes elegantPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .premium-sold-button:hover:not(:disabled)::before,
        .premium-unsold-button:hover:not(:disabled)::before {
          animation: elegantPulse 2s ease-in-out infinite;
        }

        /* Radial gradient for premium feel */
        @keyframes radialGlow {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        /* Floating sparkle effect */
        @keyframes floatSparkle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>

      <div className="luxury-card-container relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 border border-amber-500/30">
        {/* Ambient floating particles */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full floating-particle" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-12 left-8 w-1.5 h-1.5 bg-amber-300 rounded-full floating-particle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-8 right-12 w-2 h-2 bg-amber-500 rounded-full floating-particle" style={{ animationDelay: '2s' }}></div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Section: Photo and Info Cards */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            {/* Photo with Rotating Ring */}
            <div className="relative photo-reveal">
              <div className="absolute inset-0 rotating-ring">
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${positionColors.gradient} opacity-50 blur-md`}
                  style={{ padding: '4px' }}
                ></div>
              </div>
              <div className="relative">
                <img
                  src={player.photoUrl || '/default-avatar.png'}
                  alt={player.name}
                  className="w-56 h-56 rounded-full object-cover border-4 border-slate-800"
                  style={{ boxShadow: `0 0 40px ${positionColors.light}` }}
                />
              </div>
              
              {/* Position Badge Floating Below */}
              <div className="badge-entrance mt-4">
                <div
                  className={`px-6 py-2 rounded-full bg-gradient-to-r ${positionColors.gradient} text-white font-bold text-sm shadow-lg`}
                >
                  {player.position}
                </div>
              </div>
            </div>

            {/* Info Cards Stacked */}
            <div className="flex flex-col gap-3 w-full content-fade-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20">
                <div className="text-xs text-amber-400/70 font-medium mb-1">Class</div>
                <div className="text-white font-bold">{player.class}</div>
              </div>
            </div>
          </div>

          {/* Right Section: Name, Amount Input, and Action Buttons */}
          <div className="flex-1 flex flex-col justify-center gap-6">
            {/* Player Name */}
            <div className="content-fade-2">
              <h1 
                className="text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-2"
                style={{ 
                  textShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {player.name}
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-transparent rounded-full"></div>
            </div>

            {/* Amount Input */}
            <div className="content-fade-3">
              <label className="block text-amber-400/90 font-semibold mb-3 text-lg">
                Bid Amount (₹)
              </label>
              <input
                type="number"
                value={soldAmount}
                onChange={(e) => setSoldAmount(Number(e.target.value))}
                onFocus={(e) => {
                  if (soldAmount === 0) {
                    setSoldAmount(0);
                    e.target.select(); // Select all text (the 0) so typing replaces it
                  }
                }}
                className="w-full px-6 py-4 text-2xl font-bold bg-slate-800/80 border-2 border-amber-500/40 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all"
                placeholder="Enter amount"
                disabled={loading}
                style={{ boxShadow: '0 4px 20px rgba(234, 179, 8, 0.15)' }}
              />
            </div>

            {/* Ultra Premium Action Buttons - Designer Edition */}
            <div className="flex gap-6 flex-col sm:flex-row">
              {/* SOLD Button - Sophisticated Gold & Deep Green Luxury */}
              <button
                onClick={handleSoldClick}
                disabled={loading}
                className="button-slide-1 premium-sold-button group flex-1 relative py-6 px-10 rounded-2xl font-bold text-xl overflow-hidden transition-all duration-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {/* Rich jewel-tone gradient base - Deep emerald to forest */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#047857] to-[#065f46] opacity-95"></div>
                
                {/* Champagne gold luxury overlay - subtle elegance */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/40 via-[#f0e68c]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Premium metallic border system */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#d4af37]/30 group-hover:border-[#d4af37]/60 transition-all duration-700"></div>
                <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"
                  style={{ background: 'linear-gradient(135deg, #d4af37 0%, #0d9488 50%, #d4af37 100%)', zIndex: -1 }}>
                </div>
                
                {/* Sophisticated shimmer - slower, more refined */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#faf8f3]/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1800ms] ease-out"></div>
                
                {/* Inner glow for depth */}
                <div className="absolute inset-0 rounded-2xl shadow-inner opacity-60"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1)' }}>
                </div>

                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-lg">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7 drop-shadow-md group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="tracking-[0.2em] font-black" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)' }}>SOLD</span>
                    </>
                  )}
                </span>
              </button>

              {/* UNSOLD Button - Refined Burgundy & Deep Rose Elegance */}
              <button
                onClick={handleUnsoldClick}
                disabled={loading}
                className="button-slide-2 premium-unsold-button group flex-1 relative py-6 px-10 rounded-2xl font-bold text-xl overflow-hidden transition-all duration-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {/* Deep sophisticated burgundy to maroon gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#be123c] via-[#9f1239] to-[#881337] opacity-95"></div>
                
                {/* Warm copper/bronze luxury overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#cd7f32]/40 via-[#b87333]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Premium metallic border system */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#cd7f32]/30 group-hover:border-[#cd7f32]/60 transition-all duration-700"></div>
                <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"
                  style={{ background: 'linear-gradient(135deg, #cd7f32 0%, #be123c 50%, #cd7f32 100%)', zIndex: -1 }}>
                </div>
                
                {/* Sophisticated shimmer - slower, more refined */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fff5f0]/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1800ms] ease-out"></div>
                
                {/* Inner glow for depth */}
                <div className="absolute inset-0 rounded-2xl shadow-inner opacity-60"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1)' }}>
                </div>

                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-lg">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7 drop-shadow-md group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                      <span className="tracking-[0.2em] font-black" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)' }}>UNSOLD</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
