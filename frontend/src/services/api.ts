import axios from 'axios';
import { Player, Team } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playerService = {
  uploadPlayers: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/players/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getRandomPlayer: async () => {
    const response = await api.get<Player>('/players/random');
    return response.data;
  },

  assignPlayer: async (playerId: string, teamId: string, amount: number) => {
    const response = await api.post(`/players/${playerId}/assign`, { teamId, amount });
    return response.data;
  },

  markUnsold: async (playerId: string) => {
    const response = await api.post(`/players/${playerId}/unsold`);
    return response.data;
  },

  getUnsoldPlayers: async () => {
    const response = await api.get<Player[]>('/players/unsold');
    return response.data;
  },

  getAllPlayers: async () => {
    const response = await api.get<Player[]>('/players');
    return response.data;
  },
};

export const teamService = {
  createTeam: async (data: Partial<Team>) => {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  updateTeam: async (teamId: string, data: Partial<Team>) => {
    const response = await api.put<Team>(`/teams/${teamId}`, data);
    return response.data;
  },

  deleteTeam: async (teamId: string) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  getAllTeams: async () => {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  getTeamById: async (teamId: string) => {
    const response = await api.get<Team>(`/teams/${teamId}`);
    return response.data;
  },

  getFinalResults: async () => {
    const response = await api.get('/teams/results/final');
    return response.data;
  },
};