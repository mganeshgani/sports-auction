import { Socket } from 'socket.io';
import { Player } from '../models/Player';
import { Team } from '../models/Team';

export interface ServerSocket extends Socket {
  data: {
    teamId: string;
  };
}

export interface AuctionState {
  player: Player | null;
  currentBid: number;
  currentBidder: string;
}

export interface BidData {
  amount: number;
  teamId: string;
}

export interface AuctionResult {
  player: Player;
  soldPrice: number;
  soldTo: string | null;
  status: 'sold' | 'unsold';
}

export interface AuctionStartData {
  player: Player;
  startingBid: number;
}

export interface BidUpdate {
  amount: number;
  teamId: string;
}