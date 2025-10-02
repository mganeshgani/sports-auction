import React, { useState } from 'react';

interface Team {
  _id: string;
  name: string;
  remainingBudget: number;
  budget: number | null;
  totalBudget?: number;
  filledSlots: number;
  totalSlots: number;
}

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  soldAmount: number;
  onSelectTeam: (teamId: string) => void;
}

const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({
  isOpen,
  onClose,
  teams,
  soldAmount,
  onSelectTeam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAfford = (team: Team) => team.remainingBudget >= soldAmount;
  const hasSlots = (team: Team) => team.filledSlots < team.totalSlots;
  const isEligible = (team: Team) => canAfford(team) && hasSlots(team);

  const handleTeamClick = (teamId: string, team: Team) => {
    if (!isEligible(team)) return;
    setSelectedTeamId(teamId);
  };

  const handleConfirm = () => {
    if (selectedTeamId) {
      onSelectTeam(selectedTeamId);
      setSelectedTeamId(null);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    setSelectedTeamId(null);
    setSearchTerm('');
    onClose();
  };

  const getTotalBudget = (team: Team) => team.totalBudget || team.budget || 0;
  const getBudgetPercentage = (team: Team) => {
    const total = getTotalBudget(team);
    return total > 0 ? (team.remainingBudget / total) * 100 : 0;
  };
  const getSlotsPercentage = (team: Team) => (team.filledSlots / team.totalSlots) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none">
        <div
          className="relative w-full max-w-6xl max-h-[92vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden pointer-events-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-700/50 p-4">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-3xl">🏆</span>
                <h2 className="text-2xl font-black text-white tracking-tight">Select Team</h2>
              </div>
              <p className="text-gray-400 text-sm">
                Choose the team for this player • Sold Amount: <span className="text-green-400 font-bold">₹{soldAmount.toLocaleString()}</span>
              </p>
            </div>

            {/* Search Bar */}
            <div className="mt-3">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search teams..."
                  className="w-full px-4 py-2 pl-10 bg-gray-800/80 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="p-4 overflow-y-auto max-h-[calc(92vh-180px)] custom-scrollbar">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-400 text-sm">No teams found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTeams.map((team) => {
                  const eligible = isEligible(team);
                  const affordable = canAfford(team);
                  const slots = hasSlots(team);
                  const selected = selectedTeamId === team._id;

                  return (
                    <button
                      key={team._id}
                      onClick={() => handleTeamClick(team._id, team)}
                      disabled={!eligible}
                      className={`
                        relative group text-left p-3 rounded-xl border transition-all duration-300
                        ${selected
                          ? 'border-green-500 bg-green-500/10 shadow-md shadow-green-500/20 scale-[1.02]'
                          : eligible
                          ? 'border-gray-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 hover:scale-[1.01]'
                          : 'border-gray-800 opacity-50 cursor-not-allowed'
                        }
                        ${eligible ? 'hover:bg-gray-800/30' : 'bg-gray-900/50'}
                      `}
                    >
                      {/* Selection Indicator */}
                      {selected && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md animate-bounce">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      {/* Ineligible Overlay */}
                      {!eligible && (
                        <div className="absolute inset-0 bg-gray-900/70 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center px-2">
                            <div className="text-2xl mb-1">🚫</div>
                            <p className="text-red-400 font-bold text-xs">
                              {!affordable && 'Insufficient Budget'}
                              {!slots && affordable && 'No Slots Available'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-black text-white flex items-center gap-1">
                          <span className="text-lg">🏅</span>
                          <span className="truncate">{team.name}</span>
                        </h3>
                        {eligible && (
                          <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full flex-shrink-0">
                            <span className="text-green-400 text-[10px] font-bold">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Budget Info */}
                      <div className="space-y-2 mb-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                              <span className="text-sm">💰</span> Budget
                            </span>
                            <span className={`text-xs font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                              ₹{team.remainingBudget.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                getBudgetPercentage(team) > 50
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : getBudgetPercentage(team) > 25
                                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                              }`}
                              style={{ width: `${getBudgetPercentage(team)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Slots Info */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                              <span className="text-sm">👥</span> Slots
                            </span>
                            <span className={`text-xs font-bold ${slots ? 'text-blue-400' : 'text-red-400'}`}>
                              {team.filledSlots} / {team.totalSlots}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                getSlotsPercentage(team) < 50
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                  : getSlotsPercentage(team) < 80
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                              style={{ width: `${getSlotsPercentage(team)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* After Purchase Info */}
                      {eligible && (
                        <div className="pt-2 border-t border-gray-700/50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">After:</span>
                            <span className="text-yellow-400 font-bold">
                              ₹{(team.remainingBudget - soldAmount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700/50 p-3 bg-gray-900/50">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTeamId}
                className={`
                  px-6 py-2 rounded-lg font-black text-sm transition-all duration-300
                  ${selectedTeamId
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-md hover:scale-105 hover:shadow-green-500/30'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {selectedTeamId ? '✓ Confirm Selection' : 'Select a Team'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

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
    </>
  );
};

export default TeamSelectionModal;
