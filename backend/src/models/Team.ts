import mongoose, { Document, Schema } from 'mongoose';
import { Player } from './Player';

export interface Team extends Document {
  name: string;
  totalSlots: number;
  budget: number;
  players: Player[];
  remainingBudget: number;
  filledSlots: number;
}

const TeamSchema = new Schema<Team>({
  name: { type: String, required: true },
  totalSlots: { type: Number, required: true, default: 11 },
  budget: { type: Number, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining budget
TeamSchema.virtual('remainingBudget').get(function() {
  if (!this.players || this.players.length === 0) return this.budget;
  const spent = this.players.reduce((total: number, player: any) => {
    return total + (player.soldAmount || 0);
  }, 0);
  return this.budget - spent;
});

// Virtual for filled slots
TeamSchema.virtual('filledSlots').get(function() {
  return this.players ? this.players.length : 0;
});

export default mongoose.model<Team>('Team', TeamSchema);