import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { 
  ServerSocket,
  AuctionState,
  BidData,
  AuctionResult,
  AuctionStartData,
  BidUpdate
} from '../types/socket';
import { Player } from '../models/Player';

export class AuctionManager {
  private io: SocketServer;
  private currentPlayer: Player | null = null;
  private currentBid: number = 0;
  private currentBidder: string = '';
  private bidTimeout: NodeJS.Timeout | null = null;
  private bidTimeoutDuration: number = 10000; // 10 seconds

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join auction room
      socket.on('joinAuction', (teamId: string) => {
        socket.join('auction-room');
        socket.data.teamId = teamId;
        this.emitAuctionState(socket);
      });

      // Place bid
      socket.on('placeBid', (data: { amount: number, teamId: string }) => {
        if (!this.currentPlayer) return;
        if (data.amount <= this.currentBid) return;
        
        this.currentBid = data.amount;
        this.currentBidder = data.teamId;
        
        // Reset timeout
        if (this.bidTimeout) {
          clearTimeout(this.bidTimeout);
        }
        
        this.bidTimeout = setTimeout(() => {
          this.finalizeBid();
        }, this.bidTimeoutDuration);

        // Broadcast new bid
        this.io.to('auction-room').emit('bidUpdate', {
          amount: this.currentBid,
          teamId: this.currentBidder
        });
      });

      // Start player auction
      socket.on('startPlayerAuction', (player: any) => {
        this.startNewAuction(player);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private startNewAuction(player: any) {
    this.currentPlayer = player;
    this.currentBid = player.basePrice;
    this.currentBidder = '';
    
    if (this.bidTimeout) {
      clearTimeout(this.bidTimeout);
    }

    this.bidTimeout = setTimeout(() => {
      this.finalizeBid();
    }, this.bidTimeoutDuration);

    this.io.to('auction-room').emit('auctionStarted', {
      player: this.currentPlayer,
      startingBid: this.currentBid
    });
  }

  private finalizeBid() {
    if (!this.currentPlayer) return;

    const auctionResult = {
      player: this.currentPlayer,
      soldPrice: this.currentBid,
      soldTo: this.currentBidder || null,
      status: this.currentBidder ? 'sold' : 'unsold'
    };

    this.io.to('auction-room').emit('auctionComplete', auctionResult);

    // Reset state
    this.currentPlayer = null;
    this.currentBid = 0;
    this.currentBidder = '';
    if (this.bidTimeout) {
      clearTimeout(this.bidTimeout);
      this.bidTimeout = null;
    }
  }

  private emitAuctionState(socket: any) {
    if (this.currentPlayer) {
      socket.emit('auctionState', {
        player: this.currentPlayer,
        currentBid: this.currentBid,
        currentBidder: this.currentBidder
      });
    }
  }
}

export default AuctionManager;