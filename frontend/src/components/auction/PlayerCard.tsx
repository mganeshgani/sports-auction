import React from 'react';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  onSoldClick?: () => void;
  onUnsold?: () => void;
  soldAmount?: number;
  onAmountChange?: (amount: number) => void;
  isLoading?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSoldClick,
  onUnsold,
  soldAmount,
  onAmountChange,
  isLoading = false
}) => {
  // Luxury color palette with sophisticated gradients
  const getPositionColor = (position: string) => {
    const colors: { [key: string]: { gradient: string; accent: string; glow: string; bg: string; } } = {
      'Spiker': { 
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
        accent: 'from-rose-400 to-fuchsia-400',
        glow: 'rose-500/40',
        bg: 'from-rose-500/10 via-pink-500/5 to-fuchsia-500/10'
      },
      'Attacker': { 
        gradient: 'from-orange-500 via-red-500 to-rose-500',
        accent: 'from-orange-400 to-rose-400',
        glow: 'orange-500/40',
        bg: 'from-orange-500/10 via-red-500/5 to-rose-500/10'
      },
      'Setter': { 
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        accent: 'from-blue-400 to-teal-400',
        glow: 'cyan-500/40',
        bg: 'from-blue-500/10 via-cyan-500/5 to-teal-500/10'
      },
      'Libero': { 
        gradient: 'from-emerald-500 via-green-500 to-teal-500',
        accent: 'from-emerald-400 to-teal-400',
        glow: 'emerald-500/40',
        bg: 'from-emerald-500/10 via-green-500/5 to-teal-500/10'
      },
      'Blocker': { 
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
        accent: 'from-violet-400 to-fuchsia-400',
        glow: 'purple-500/40',
        bg: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10'
      },
      'All-rounder': { 
        gradient: 'from-amber-500 via-yellow-500 to-orange-500',
        accent: 'from-amber-400 to-orange-400',
        glow: 'amber-500/40',
        bg: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10'
      },
    };
    return colors[position] || { 
      gradient: 'from-slate-500 via-gray-500 to-zinc-500',
      accent: 'from-slate-400 to-zinc-400',
      glow: 'gray-500/40',
      bg: 'from-slate-500/10 via-gray-500/5 to-zinc-500/10'
    };
  };

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'Spiker': '⚡',
      'Attacker': '🔥',
      'Setter': '🎯',
      'Libero': '🛡️',
      'Blocker': '🚧',
      'All-rounder': '⭐',
    };
    return icons[position] || '🏐';
  };

  const positionColors = getPositionColor(player.position);

  return (
    <div className="relative max-w-md mx-auto my-4">
      {/* Luxury multi-layer ambient glow system */}
      <div className="absolute -inset-4 opacity-50">
        <div className={`absolute inset-0 bg-gradient-to-b ${positionColors.gradient} rounded-[2rem] blur-[40px] opacity-30 animate-pulse`}></div>
      </div>
      
      {/* Premium Card Container - Vertical Layout - Compact */}
      <div className="group relative bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] rounded-[1.5rem] overflow-hidden border border-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.9)] transition-all duration-500">
        
        {/* Premium border shimmer effect */}
        <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className={`absolute inset-0 bg-gradient-to-b ${positionColors.gradient} opacity-[0.08]`}></div>
        </div>

        {/* Noise texture overlay for luxury feel */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
        
        {/* Vertical gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/20 pointer-events-none"></div>
        
        {/* Card Content - Vertical Flow - Compact */}
        <div className="relative">
          
          {/* Hero Section - Player Photo (Compact) */}
          <div className="relative px-6 pt-6 pb-4">
            
            {/* Luxury Photo Frame - Centered & Large */}
            <div className="relative mx-auto w-48 h-48">
              {/* Premium multi-layer glow system */}
              <div className={`absolute -inset-8 bg-gradient-to-b ${positionColors.gradient} rounded-full blur-[50px] opacity-40 animate-pulse`}></div>
              <div className={`absolute -inset-4 bg-gradient-to-b ${positionColors.accent} rounded-full blur-[30px] opacity-30`}></div>
              
              {/* Rotating ring effect */}
              <div className="absolute -inset-3 rounded-full opacity-60">
                <div className={`absolute inset-0 bg-gradient-to-tr ${positionColors.gradient} rounded-full animate-spin`} style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-[2px] bg-[#0a0a0f] rounded-full"></div>
              </div>
              
              {/* Inner glow ring */}
              <div className={`absolute -inset-2 bg-gradient-to-b ${positionColors.gradient} rounded-full opacity-50 blur-md`}></div>
              
              {/* Photo container with premium border */}
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-[3px] border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,0,0,0.5)]">
                {/* Inner highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-full"></div>
                
                {player.photoUrl ? (
                  <img 
                    src={player.photoUrl} 
                    alt={player.name}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="relative w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    onError={(e) => {
                      console.error('Image load error for', player.name, ':', player.photoUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${positionColors.gradient} flex items-center justify-center text-6xl font-black text-white shadow-inner">${player.name.charAt(0).toUpperCase()}</div>`;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${positionColors.gradient} flex items-center justify-center text-6xl font-black text-white shadow-inner`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Premium position badge - Floating */}
              <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r ${positionColors.gradient} rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl hover:scale-110 transition-all duration-300`}>
                <div className="relative flex items-center gap-2">
                  <span className="text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{getPositionIcon(player.position)}</span>
                  <span className="text-xs font-black text-white uppercase tracking-[0.12em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{player.position}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Name - Centered & Dramatic */}
          <div className="px-6 pb-2 text-center">
            <h2 className={`text-2xl font-black mb-1 tracking-tight bg-gradient-to-b from-white via-white to-gray-400 text-transparent bg-clip-text drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]`}>
              {player.name}
            </h2>
            
            {/* Animated accent line */}
            <div className="flex justify-center mb-1">
              <div className="relative h-0.5 w-20 rounded-full overflow-hidden bg-white/5">
                <div className={`absolute inset-0 bg-gradient-to-r ${positionColors.gradient} transform origin-center group-hover:scale-x-[1.5] transition-transform duration-700`}></div>
              </div>
            </div>
          </div>

          {/* Premium Info Cards - Horizontal Layout */}
          <div className="px-6 pb-2 flex gap-2">
            
            {/* Registration Card */}
            <div className="group/card relative bg-white/[0.02] rounded-lg p-1.5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden hover:bg-white/[0.04] flex-1">
              {/* Hover gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${positionColors.bg} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative flex flex-col items-center">
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${positionColors.gradient} flex items-center justify-center shadow-lg mb-0.5`}>
                  <span className="text-[10px]">🎓</span>
                </div>
                <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Reg No</p>
                <p className="text-[10px] font-black text-white tracking-wide">{player.regNo}</p>
              </div>
            </div>

            {/* Class Card */}
            <div className="group/card relative bg-white/[0.02] rounded-lg p-1.5 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden hover:bg-white/[0.04] flex-1">
              {/* Hover gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${positionColors.bg} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative flex flex-col items-center">
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${positionColors.gradient} flex items-center justify-center shadow-lg mb-0.5`}>
                  <span className="text-[10px]">📚</span>
                </div>
                <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Class</p>
                <p className="text-[10px] font-black text-white tracking-wide">{player.class}</p>
              </div>
            </div>
          </div>

          {/* Amount Input Section - Premium Design */}
          <div className="px-6 pb-1.5">
            <label className="flex items-center justify-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1.5">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${positionColors.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-[10px]">💰</span>
              </div>
              <span>Auction Amount</span>
            </label>
            
            <div className="relative group/input">
              {/* Premium focus glow */}
              <div className={`absolute -inset-[2px] bg-gradient-to-r ${positionColors.gradient} rounded-xl opacity-0 group-focus-within/input:opacity-40 blur-xl transition-opacity duration-500`}></div>
              
              <div className="relative">
                {/* Currency icon - Compact */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <div className={`text-lg font-black bg-gradient-to-r ${positionColors.gradient} text-transparent bg-clip-text drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]`}>
                    ₹
                  </div>
                </div>
                
                {/* Premium input field */}
                <input
                  type="number"
                  value={soldAmount || ''}
                  onChange={(e) => onAmountChange?.(Number(e.target.value))}
                  placeholder="Enter amount..."
                  className="relative w-full pl-10 pr-3 py-2 bg-white/[0.02] border-2 border-white/10 rounded-xl text-white font-black text-sm text-center placeholder:text-gray-700 focus:border-white/20 focus:ring-4 focus:ring-white/5 focus:bg-white/[0.04] transition-all duration-500 backdrop-blur-xl hover:border-white/15 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)]"
                />
                
                {/* Input highlight effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Horizontal Stack Premium */}
          <div className="px-6 pb-2 flex gap-2">
            
            {/* Sold Button - Luxury Success Design */}
            <button
              onClick={onSoldClick}
              disabled={isLoading || !soldAmount}
              className="group/btn relative flex-1 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.12em] transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.3)]"
            >
              {/* Multi-layer premium background */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-emerald-500 to-green-600"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-400 via-green-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              
              {/* Luxury shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover/btn:left-full transition-all duration-1200 ease-out"></div>
              </div>

              {/* Premium outer glow */}
              <div className="absolute -inset-[2px] bg-gradient-to-b from-emerald-400 to-green-400 rounded-2xl opacity-0 group-hover/btn:opacity-60 blur-xl transition-opacity duration-500"></div>

              {/* Inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-2xl"></div>

              <span className="relative flex items-center justify-center gap-1.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs">Wait...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">✓</span>
                    <span className="text-xs">Sold</span>
                  </>
                )}
              </span>
            </button>

            {/* Unsold Button - Luxury Danger Design */}
            <button
              onClick={onUnsold}
              disabled={isLoading}
              className="group/btn relative flex-1 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.12em] transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)]"
            >
              {/* Multi-layer premium background */}
              <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-red-500 to-rose-600"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-red-400 via-rose-400 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              
              {/* Luxury shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover/btn:left-full transition-all duration-1200 ease-out"></div>
              </div>

              {/* Premium outer glow */}
              <div className="absolute -inset-[2px] bg-gradient-to-b from-red-400 to-rose-400 rounded-2xl opacity-0 group-hover/btn:opacity-60 blur-xl transition-opacity duration-500"></div>

              {/* Inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-2xl"></div>

              <span className="relative flex items-center justify-center gap-1.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                <span className="text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">✕</span>
                <span className="text-xs">Unsold</span>
              </span>
            </button>
          </div>

        </div>

        {/* Bottom premium accent */}
        <div className="relative h-1.5 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${positionColors.gradient}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-r ${positionColors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
        </div>
      </div>

      {/* Luxury floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[20%] left-[15%] w-3 h-3 bg-gradient-to-r ${positionColors.gradient} rounded-full opacity-20 animate-pulse`} style={{ animationDuration: '6s', animationDelay: '0s' }}></div>
        <div className={`absolute top-[60%] right-[20%] w-2 h-2 bg-gradient-to-r ${positionColors.accent} rounded-full opacity-15 animate-pulse`} style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        <div className={`absolute top-[40%] right-[10%] w-2.5 h-2.5 bg-gradient-to-r ${positionColors.gradient} rounded-full opacity-10 animate-pulse`} style={{ animationDuration: '7s', animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default PlayerCard;
