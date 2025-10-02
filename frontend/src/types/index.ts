export interface Player {
  _id: string;
  name: string;
  regNo: string;
  class: string;
  position: string;
  photoUrl: string;
  status: 'available' | 'sold' | 'unsold';
  team: string | null;
  soldAmount: number;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  totalSlots: number;
  filledSlots: number;
  budget: number | null;
  totalBudget?: number;
  remainingBudget: number;
  players: Player[];
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}