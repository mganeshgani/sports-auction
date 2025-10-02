import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Team } from '../types';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalSlots: 11,
    budget: 100000
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await axios.patch(`${API_URL}/teams/${editingTeam._id}`, formData);
      } else {
        await axios.post(`${API_URL}/teams`, formData);
      }
      fetchTeams();
      resetForm();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await axios.delete(`${API_URL}/teams/${id}`);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', totalSlots: 11, budget: 100000 });
    setEditingTeam(null);
    setShowAddModal(false);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      totalSlots: team.totalSlots,
      budget: team.budget || 100000
    });
    setShowAddModal(true);
  };

  const handleResetAuction = async () => {
    setResetting(true);
    try {
      console.log('Starting auction reset...');
      
      // Delete all players
      const playersResponse = await axios.delete(`${API_URL}/players`);
      console.log('Players deleted:', playersResponse.data);
      
      // Delete all teams
      const teamsResponse = await axios.delete(`${API_URL}/teams`);
      console.log('Teams deleted:', teamsResponse.data);
      
      // Refresh data
      await fetchTeams();
      setShowResetModal(false);
      
      console.log('Auction reset completed successfully');
      
      // Optional: Show success message to user
      alert('✅ Auction reset successfully! All teams and players have been deleted.');
    } catch (error: any) {
      console.error('Error resetting auction:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Error resetting auction: ${errorMessage}`);
    } finally {
      setResetting(false);
    }
  };

  const getBudgetPercentage = (team: Team) => {
    const total = team.budget || 0;
    return total > 0 ? (team.remainingBudget / total) * 100 : 0;
  };

  const getSlotsPercentage = (team: Team) => {
    return team.totalSlots > 0 ? ((team.filledSlots || 0) / team.totalSlots) * 100 : 0;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header Section */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-700/50 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Title & Stats - Combined */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Team Management</h1>
                <p className="text-gray-400 text-xs">Manage auction teams</p>
              </div>
            </div>

            {/* Inline Stats */}
            {!loading && teams.length > 0 && (
              <div className="flex items-center gap-3 ml-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="text-xs text-gray-400">Teams</p>
                    <p className="text-lg font-black text-white">{teams.length}</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-lg font-black text-white">₹{(teams.reduce((sum, t) => sum + (t.budget || 0), 0) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs text-gray-400">Players</p>
                    <p className="text-lg font-black text-white">{teams.reduce((sum, t) => sum + (t.filledSlots || 0), 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Team Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="group px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
            <span>Add Team</span>
          </button>

          {/* Reset Auction Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="group px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
            title="Reset entire auction (delete all data)"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="mt-4 text-gray-400 font-medium">Loading teams...</p>
          </div>
        </div>
      ) : teams.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="text-5xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Teams Yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first team!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              + Create First Team
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => {
              const budgetPercentage = getBudgetPercentage(team);
              const slotsPercentage = getSlotsPercentage(team);
              
              return (
                <div
                  key={team._id}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 shadow-lg border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02]"
                >
                  {/* Team Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🏅</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{team.name}</h3>
                        <p className="text-xs text-gray-500">Team ID: {team._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(team)}
                        className="w-9 h-9 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-600/30 hover:border-blue-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group/edit"
                        title="Edit Team"
                      >
                        <svg className="w-4 h-4 text-blue-400 group-hover/edit:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(team._id)}
                        className="w-9 h-9 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group/delete"
                        title="Delete Team"
                      >
                        <svg className="w-4 h-4 text-red-400 group-hover/delete:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-4">
                    {/* Budget Section */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>💰</span> Budget
                        </span>
                        <span className="text-sm font-black text-green-400">₹{(team.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            budgetPercentage > 60
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : budgetPercentage > 30
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                              : 'bg-gradient-to-r from-red-500 to-rose-500'
                          }`}
                          style={{ width: `${budgetPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Remaining</span>
                        <span className="text-sm font-bold text-yellow-400">₹{team.remainingBudget.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Players/Slots Section */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                          <span>👥</span> Players
                        </span>
                        <span className="text-sm font-black text-blue-400">{team.filledSlots || 0} / {team.totalSlots}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            slotsPercentage < 50
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                              : slotsPercentage < 80
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${slotsPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-lg p-3 border border-indigo-600/20">
                        <p className="text-xs text-gray-400 mb-1">Spent</p>
                        <p className="text-lg font-black text-white">₹{((team.budget || 0) - team.remainingBudget).toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-lg p-3 border border-green-600/20">
                        <p className="text-xs text-gray-400 mb-1">Slots Left</p>
                        <p className="text-lg font-black text-white">{team.totalSlots - (team.filledSlots || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={resetForm}
          ></div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden pointer-events-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-700/50 p-6">
                <button
                  onClick={resetForm}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
                >
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                    <span className="text-3xl">{editingTeam ? '✏️' : '➕'}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{editingTeam ? 'Edit Team' : 'Add New Team'}</h2>
                    <p className="text-sm text-gray-400">{editingTeam ? 'Update team information' : 'Create a new auction team'}</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Team Name Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-lg">🏅</span>
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name..."
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 outline-none"
                  />
                </div>

                {/* Grid for Slots and Budget */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Slots Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      Total Slots
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalSlots}
                      onChange={(e) => setFormData({ ...formData, totalSlots: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none"
                    />
                  </div>

                  {/* Budget Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      Budget (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-indigo-600/10 border border-indigo-600/30 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold mb-1">Quick Tips:</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li>• Choose a unique team name</li>
                        <li>• Typical slots: 11-15 players</li>
                        <li>• Set budget based on auction rules</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all duration-300 hover:scale-105 border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  >
                    {editingTeam ? '✓ Update Team' : '✓ Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
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
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full animate-slideUp">
            <div className="p-6">
              {/* Warning Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-red-400 to-rose-400 text-transparent bg-clip-text">
                Reset Auction
              </h2>

              {/* Warning Message */}
              <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-200 text-sm leading-relaxed text-center">
                  ⚠️ This will <span className="font-bold text-red-400">permanently delete</span> all teams and players from the auction.
                  <br />
                  <span className="text-xs text-red-300 mt-2 block">This action cannot be undone!</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetting}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetAuction}
                  disabled={resetting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Confirm Reset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;